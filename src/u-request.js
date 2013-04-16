// Create xmlhttprequest object 
Util.createRequestObject = function(type) {
	var request_object = false;
	// w3c
//	if(window.XMLHttpRequest) {
		try {
			request_object = new XMLHttpRequest();
		}
		catch(e){
			request_object = new ActiveXObject("Microsoft.XMLHTTP");
		}
//	}
	// windows activeX object
/*
	else if(typeof(window.ActiveXObject) == "function") {
		try {
			request_object = new ActiveXObject("Microsoft.XMLHTTP");
		}
		catch(e){}
	}
	*/
	if(request_object) {
		return request_object;
	}
	u.bug("Could not create HTTP Object");
	return false;
//	return typeof(request_object.send) == 'undefined' ? false : request_object;
}

/**
* Request object
*
* @param node Response node - DOM node, which will recieve the Responce callback
* @param url
* @param parameters
* @param method POST, GET or SCRIPT. Default GET
* @param async Run request syncronious of asyncronious. Default false
*/

Util.Request = function(node, url, parameters, method, async) {

	// if node isn't an object, create temp object as stand-in
	if(typeof(node) != "object") {
		var node = new Object();
	}


	node.url = url;
	node.parameters = parameters ? parameters : "";
// TODO: conflicts with json parameters
//	node.parameters += (node.parameters && !node.parameters.substr(-1) == "&" ? "&" : "") + "ts=" + new Date().getTime();
	node.method = method ? method : "GET";
	node.async = async ? async : false;

//	u.bug("###request###" + node.method + "###" + node.url)

	// regular HTTP request
	if(node.method.match(/GET|POST|PUT|PATCH/i)) {

		node.HTTPRequest = this.createRequestObject();
		node.HTTPRequest.node = node;

		// listen for async request state change
		if(node.async) {
			node.HTTPRequest.onreadystatechange = function() {
				if(node.HTTPRequest.readyState == 4) {
					u.validateResponse(this);
				}
			}
		}

		// perform request
		try {
//			u.bug("request url:" + node.url)

			// TODO: adding parameters to url, on get - extend to check for ? and make nicer url

			if(node.method.match(/GET/i)) {
				node.url += node.parameters ? ((!node.url.match(/\?/g) ? "?" : "&") + node.parameters) : "";
				node.HTTPRequest.open(node.method, node.url, node.async);
				node.HTTPRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

				// rails form proofing
				var csfr_field = u.qs('meta[name="csrf-token"]');
				if(csfr_field && csfr_field.content) {
					node.HTTPRequest.setRequestHeader("X-CSRF-Token", csfr_field.content);
				}

				// send info
				node.HTTPRequest.send();
			}
			else if(node.method.match(/POST|PUT|PATCH/i)) {
				node.HTTPRequest.open(node.method, node.url, node.async);
				node.HTTPRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

				// rails form proofing
				var csfr_field = u.qs('meta[name="csrf-token"]');
				if(csfr_field && csfr_field.content) {
					node.HTTPRequest.setRequestHeader("X-CSRF-Token", csfr_field.content);
				}


//				u.bug("request parameters:" + typeof(node.parameters))

				node.HTTPRequest.send(node.parameters);
//				node.HTTPRequest.send(node.parameters ? node.parameters : "test=fisk");
//				node.HTTPRequest.send();
			}

		}
		catch(e) {
			u.bug("request exception:" + e);

			u.validateResponse(node.HTTPRequest);
			return;
		}

		if(!async) {

//			u.bug("request-25")


			u.validateResponse(node.HTTPRequest);
	//		node.XMLResponse(u.validateResponse(XMLRequest, true));
		}
		

	}
	// request by script injection
	else if(node.method.match(/SCRIPT/i)) {

		// remember node
		node.url = url;

		// generate callback key
		var key = u.randomString();

		// create global reference
		document[key] = new Object();
		document[key].node = node;
		document[key].responder = function(response) {

//			u.bug("responder" + response)
//			u.bug("responder" + JSON.stringify(response))

			// make object to map node
			var response_object = new Object();
			response_object.node = this.node;
			response_object.responseText = response;
			u.validateResponse(response_object);
		}

		// add JSON Request to HTML head

		// TODO - parameters
//		u.bug("append header");

		u.ae(u.qs("head"), "script", ({"type":"text/javascript", "src":node.url + "?" + parameters + "&callback=document."+key+".responder"}));
		
	}


}

Util.requestParameters = function() {
	
	u.bug("params:" + arguments.length)
	
}
/*
Util.Response = function(object) {

	if(typeof(this.node.Response) == "function") {
		u.validateResponse(response);
	}
	
	u.bug("###RESPONSE###");
	u.bug("request.status:" + request.status);


	
//	retuner response
}
*/
//node.XMLResponse(u.validateResponse(XMLRequest, true));


// test for JSON
// TODO test object
// ' | " - text string
// ( | { - json
// < - HTML

Util.testResponseForJSON = function(responseText) {

//	u.bug("JSON test:" + responseText)

	// JSON
	if(responseText.trim().substr(0, 1).match(/[\{\[]/i) && responseText.trim().substr(-1, 1).match(/[\}\]]/i)) {
//		u.bug("guessing JSON:" + responseText, "green");
		
		try {
//			u.bug("test JSON:" + responseText)
			// test for json object()

			var test = eval("("+responseText+")");
			if(typeof(test) == "object") {
				test.isJSON = true;
				return test;
			}
		}
		// ignore exception
		catch(exception) {}

	}

	// unknown response
	return false;
	
}


Util.testResponseForHTML = function(responseText) {

//	u.bug("html test")
	// HTML
	if(responseText.trim().substr(0, 1).match(/[\<]/i) && responseText.trim().substr(-1, 1).match(/[\>]/i)) {
//		u.bug("guessing HTML", "green");// + u.htmlToText(responseText));

		// test for DOM
		try {
//			u.bug("test DOM")
			var test = document.createElement("div");
			test.innerHTML = responseText;

//			u.bug("childnodes:" + test.childNodes.length)
//			u.bug("to:" + test + "::" + u.htmlToText(test.innerHTML))
			// seems to be a valid test for now
			if(test.childNodes.length) {

				// sometimes if a head/body tag is actually sent from the server, we may need some of its information
				// getting head/body info with regular expression on responseText

				var body_class = responseText.match(/<body class="([a-z0-9A-Z_ ]+)"/);
				test.body_class = body_class ? body_class[1] : "";

				var head_title = responseText.match(/<title>([^$]+)<\/title>/);
				test.head_title = head_title ? head_title[1] : "";


//				u.bug("return HTML")
				test.isHTML = true;

				return test;
			}
		}
		// ignore exception
		catch(exception) {}

	}


	// unknown response
	return false;
	
}

Util.evaluateResponse = function(responseText) {

//	u.bug("responseText:" + responseText);

	var object;

	// see what response contains

	// already a JSON object (could be the response from a SCRIPT)
	if(typeof(responseText) == "object") {
		responseText.isJSON = true;
//		u.bug("guessing object:" + responseText, "green");
		return responseText;
	}
	else {

//		u.bug("to:" + typeof(responseText) + ":" + responseText.trim())
//		u.bug("check by  " + responseText.substr(0, 1) + "  " + responseText.trim().substr(-1, 1), "red");
		// quoted string (could be the response from SCRIPT, POST or GET)
		if(responseText.trim().substr(0, 1).match(/[\"\']/i) && responseText.trim().substr(-1, 1).match(/[\"\']/i)) {
//			u.bug("guessing quoted string:" + responseText, "green");

				response_string = responseText.trim();

//				u.bug("new term:" + response_string.substr(1, response_string.length-2));


				var json = u.testResponseForJSON(response_string.substr(1, response_string.length-2));
				if(json) {
					return json;
				}

				var html = u.testResponseForHTML(response_string.substr(1, response_string.length-2));
				if(html) {
					return html;
				}

				return responseText;
			
		}
		
		var json = u.testResponseForJSON(responseText);
		if(json) {
			return json;
		}
		
		var html = u.testResponseForHTML(responseText);
		if(html) {
			return html;
		}

		return responseText;

	}

}

// Simple validation of response
// automatically executes script elements
// state = true = process complete
// state = false = process error
// returns content element
Util.validateResponse = function(response){

//	u.bug("Validate:" + response);
//	u.bug("Validate node:" + u.nodeId(response.node));
//	u.listObjectContent(response);

	var object;

//	var div = document.createElement("div");
	if(response) {
//		alert(response);


//		u.bug("status:" + response.status);
//		u.bug("responseText:" + response.responseText);

		// HTTP object from GET/POST
		try {
			if(response.status) {

				// Accaptable response (Exclude known bads)
				if(!response.status.toString().match(/403|404|500/)) {

					object = u.evaluateResponse(response.responseText);

	//				u.bug("response:" + object);

				}
			}
			// SCRIPT
			else {

				if(response.responseText) {

					object = u.evaluateResponse(response.responseText);

				}

	//			u.bug(typeof(response));

	//		 if(typeof(response) == "") {

			}
			
		}
		catch(exception) {
			u.bug("HTTPRequest exection:" + e);
		}
	}

//	u.bug("ready to respond:" + response.node.className + ":" + typeof(response.node.Response))

	if(typeof(response.node.Response) == "function") {
		response.node.Response(object);
	}

}

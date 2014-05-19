

// Create xmlhttprequest object - separated to make it possible to implement fallback, primarily for IE
Util.createRequestObject = u.createRequestObject = function() {
	return new XMLHttpRequest();
}

// Request object
Util.request = u.request = function(node, url, settings) {
//	u.bug("request")

	var request_id = u.randomString(6);

	node[request_id] = {};
	node[request_id].request_url = url;

	// set default values
	node[request_id].request_method = "GET";
	node[request_id].request_async = true;
	node[request_id].request_params = "";
	node[request_id].request_headers = false;
	node[request_id].response_callback = "response";


	// additional info passed to function as JSON object
	if(typeof(settings) == "object") {
		var argument;
		for(argument in settings) {

			switch(argument) {
				case "method"		: node[request_id].request_method		= settings[argument]; break;
				case "params"		: node[request_id].request_params		= settings[argument]; break;
				case "async"		: node[request_id].request_async		= settings[argument]; break;
				case "headers"		: node[request_id].request_headers		= settings[argument]; break;
				case "callback"		: node[request_id].response_callback	= settings[argument]; break;
			}

		}
	}

//	u.bug("request:" + node.request_url + ", " + node.request_method + ", " + node.request_params + ", " + node.request_async + ", " + node.request_headers);

	// regular HTTP request
	if(node[request_id].request_method.match(/GET|POST|PUT|PATCH/i)) {

		node[request_id].HTTPRequest = this.createRequestObject();
		node[request_id].HTTPRequest.node = node;
		node[request_id].HTTPRequest.request_id = request_id;

		// listen for async request state change
		if(node[request_id].request_async) {
			node[request_id].HTTPRequest.onreadystatechange = function() {
				if(this.readyState == 4) {
					// process async response
					u.validateResponse(this);
				}
			}
		}

		// perform request
		try {
			// perform GET request
			if(node[request_id].request_method.match(/GET/i)) {
//				u.bug("GET request");

				// convert JSON params to regular params, JSON cannot be sent as GET
				var params = u.JSONtoParams(node[request_id].request_params);

				// add params to url
				node[request_id].request_url += params ? ((!node[request_id].request_url.match(/\?/g) ? "?" : "&") + params) : "";

				node[request_id].HTTPRequest.open(node[request_id].request_method, node[request_id].request_url, node[request_id].request_async);
				node[request_id].HTTPRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

				// rails form proofing
				var csfr_field = u.qs('meta[name="csrf-token"]');
				if(csfr_field && csfr_field.content) {
					node[request_id].HTTPRequest.setRequestHeader("X-CSRF-Token", csfr_field.content);
				}

				// add additional headers
				if(typeof(node[request_id].request_headers) == "object") {
					var header;
					for(header in node[request_id].request_headers) {
						node[request_id].HTTPRequest.setRequestHeader(header, node[request_id].request_headers[header]);
					}
				}

				// send info
				// some older browser (Firefox 3 in paticular) requires a parameter for send - an empty string is enough
				node[request_id].HTTPRequest.send("");

			}
			// perform POST, PUT or PATCH request
			else if(node[request_id].request_method.match(/POST|PUT|PATCH/i)) {
//				u.bug("POST|PUT|PATCH request");

				// stringify possible JSON object
				var params;
//				u.bug("params typeof:" + typeof(node.request_params) + ", " +node.request_params.constructor.toString().match(/FormData/i));
				if(typeof(node[request_id].request_params) == "object" && !node[request_id].request_params.constructor.toString().match(/FormData/i)) {
					params = JSON.stringify(node[request_id].request_params);
				}
				else {
					params = node[request_id].request_params;
				}

				node[request_id].HTTPRequest.open(node[request_id].request_method, node[request_id].request_url, node[request_id].request_async);
				node[request_id].HTTPRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

				// rails form proofing
				var csfr_field = u.qs('meta[name="csrf-token"]');
				if(csfr_field && csfr_field.content) {
					node[request_id].HTTPRequest.setRequestHeader("X-CSRF-Token", csfr_field.content);
				}

				// add additional headers
				if(typeof(node[request_id].request_headers) == "object") {
					var header;
					for(header in node[request_id].request_headers) {
						node[request_id].HTTPRequest.setRequestHeader(header, node[request_id].request_headers[header]);
					}
				}

				// send params
				node[request_id].HTTPRequest.send(params);

			}
		}
		// catch security exceptions and other exeptions
		catch(exception) {
//			u.bug("Request exc:" + exception)
			node[request_id].HTTPRequest.exception = exception;
			u.validateResponse(node[request_id].HTTPRequest);
			return;
		}

		// process synchronous response
		if(!node[request_id].request_async) {
			u.validateResponse(node[request_id].HTTPRequest);
		}
	}
	// request by script injection
	else if(node[request_id].request_method.match(/SCRIPT/i)) {

		// generate callback key
		var key = u.randomString();

		// create global reference
		document[key] = new Object();
		document[key].node = node;
		document[key].request_id = request_id;
		document[key].responder = function(response) {

			// make object to map node
			var response_object = new Object();
			response_object.node = this.node;
			response_object.request_id = this.request_id;
			response_object.responseText = response;
			u.validateResponse(response_object);
		}

		// convert JSON params to regular params, JSON cannot be sent as GET
		var params = u.JSONtoParams(node[request_id].request_params);

		// add params to url
		node[request_id].request_url += params ? ((!node[request_id].request_url.match(/\?/g) ? "?" : "&") + params) : "";
		// add callback to url
		node[request_id].request_url += (!node[request_id].request_url.match(/\?/g) ? "?" : "&") + "callback=document."+key+".responder";

		// add JSON Request to HTML head
		u.ae(u.qs("head"), "script", ({"type":"text/javascript", "src":node[request_id].request_url}));
	}

	return request_id;
}


// convert simple (first level only) JSON to parameter string
Util.JSONtoParams = function(json) {
	if(typeof(json) == "object") {
		var params = "", param;
		for(param in json) {
			params += (params ? "&" : "") + param + "=" + json[param];
		}
		return params
	}

	var object = u.isStringJSON(json);
	if(object) {
		return u.JSONtoParams(object);
	}

	return json;
}



// is string valid JSON
Util.isStringJSON = function(string) {

	// JSON hints
	// ( | { - json
	if(string.trim().substr(0, 1).match(/[\{\[]/i) && string.trim().substr(-1, 1).match(/[\}\]]/i)) {
//		u.bug("guessing JSON:" + string, "green");

		try {
			// test for json object()
			var test = JSON.parse(string);
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

// is string valid HTML
Util.isStringHTML = function(string) {

	// HTML hints
	// < - HTML
	if(string.trim().substr(0, 1).match(/[\<]/i) && string.trim().substr(-1, 1).match(/[\>]/i)) {
//		u.bug("guessing HTML" + string, "green");

		// test for DOM
		try {
			var test = document.createElement("div");
			test.innerHTML = string;

			// seems to be a valid test for now
			if(test.childNodes.length) {

				// sometimes if a head/body tag is actually sent from the server, we may need some of its information
				// getting head/body info with regular expression on responseText
				var body_class = string.match(/<body class="([a-z0-9A-Z_: ]+)"/);
				test.body_class = body_class ? body_class[1] : "";
				var head_title = string.match(/<title>([^$]+)<\/title>/);
				test.head_title = head_title ? head_title[1] : "";

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




// evaluate responseText string
// see what response contains
Util.evaluateResponseText = function(responseText) {

	var object;

	// already a JSON object (could be the response from a SCRIPT)
	if(typeof(responseText) == "object") {
		// u.bug("guessing object:" + responseText, "green");

		responseText.isJSON = true;
		return responseText;
	}
	else {

		var response_string;

		// quoted string (could be the response from SCRIPT, POST or GET)
		if(responseText.trim().substr(0, 1).match(/[\"\']/i) && responseText.trim().substr(-1, 1).match(/[\"\']/i)) {
			// u.bug("guessing quoted string:" + responseText, "red");

			// remove quotes before testing content
			response_string = responseText.trim().substr(1, responseText.trim().length-2);
		}
		else {
			response_string = responseText;
		}


		// check for JSON
		var json = u.isStringJSON(response_string);
		if(json) {
			return json;
		}

		// check for HTML
		var html = u.isStringHTML(response_string);
		if(html) {
			return html;
		}

		// neither JSON or HTML, return original responseText
		return responseText;

	}

}

// Simple validation of responseText
// Makes callback to appropriate notifier
Util.validateResponse = function(response){
//	u.bug("validateResponse:" + response);

	var object = false;

	if(response) {

//		u.bug("response:" + response + ":" + u.nodeId(response.node) + ":" + response.status)

		// u.bug("status:" + response.status + ":" + u.nodeId(response.node));
		// u.bug("responseText:" + response.responseText);

		try {
			// valid response status
			if(response.status && !response.status.toString().match(/403|404|500/)) {
				object = u.evaluateResponseText(response.responseText);
			}
			// SCRIPT has no response.status
			// is responseText available for evaluation
			else if(response.responseText) {
				object = u.evaluateResponseText(response.responseText);
			}
		}
		catch(exception) {
			response.exception = exception;
//			u.bug("HTTPRequest exection:" + exception);
		}
	}
//	u.bug("object:" + object);

	// did validation yield usable object
	if(object) {

		// callback to Response handler
//		u.bug("response:" + typeof(response.node[response.node.response_callback]))
		if(typeof(response.node[response.node[response.request_id].response_callback]) == "function") {
			response.node[response.node[response.request_id].response_callback](object, response.request_id);
		}

		// // callback to Response handler
		// if(typeof(response.node.Response) == "function") {
		// 	response.node.Response(object);
		// }
		// if(typeof(response.node.response) == "function") {
		// 	response.node.response(object);
		// }
	}
	else {

		// callback to ResponseError handler
		if(typeof(response.node.ResponseError) == "function") {
			response.node.ResponseError(response);
		}
		if(typeof(response.node.responseError) == "function") {
			response.node.responseError(response);
		}
	}

}


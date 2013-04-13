// container to hold the requests
//Util.XMLRequest = new Array();

// Create xmlhttprequest object 
Util.createRequestObject = function() {
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
	return typeof(request_object.send) == 'undefined' ? false : request_object;
}


// Send request to url, calls the specified notify function on object on response

Util.XMLRequest = function(url, node, parameters, async, method) {

	parameters = parameters ? parameters : "";
	async = async ? async : true;
	method = method ? method : "POST";

	node.url = url;
	node.parameters = parameters;
	node.async = async;
	node.method = method;

	var XMLRequest = new Object();
	// get request object, and verify it
	XMLRequest.Http = this.createRequestObject();
	if(!XMLRequest.Http) {
		node.XMLResponse(u.validateResponse(false, false));
		return;
	}

	// listen for async request state change
	if(async) {
		// remember node for async response
		XMLRequest.Http.node = node ? node : Util;
		XMLRequest.Http.onreadystatechange = function() {
			if(XMLRequest.Http.readyState == 4) {
				if(!this.node) {
					u.bug("Lost track of node: " + XMLRequest.Http.statusText);
				}
				else {
					this.node.XMLResponse(u.validateResponse(this, true));
				}
			}
		}
	}

	// perform request
	try {
		XMLRequest.Http.open(method, url, async);
		XMLRequest.Http.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		XMLRequest.Http.send(parameters);
	}
	catch(e) {
		node.XMLResponse(u.validateResponse(XMLRequest, false));
		return;
	}

	if(!async) {
		node.XMLResponse(u.validateResponse(XMLRequest, true));
	}

}

Util.XMLResponse = function(response) {

//	alert("base responder")

}

// Simple validation of response
// automatically executes script elements
// state = true = process complete
// state = false = process error
// returns content element
Util.validateResponse = function(request, state){

	var div = document.createElement("div");
	if(state) {
//		alert(request.responseHTML);
		try {
			request.status;
//			u.bug("status:" + request.status + ":" + request.responseText)
			if(request.status == 200) {

				// some engines removes head and body tags - in all cases the content of body comes through
				div.innerHTML = request.responseText;

				// sometimes if a head/body tag is actually sent from the server, we may need some of its information
				// getting head/body info with regular expression on responseText
				var body_class = request.responseText.match(/<body class="([a-z0-9A-Z_ ]+)"/);
				div.body_class = body_class ? body_class[1] : "";

				var head_title = request.responseText.match(/<title>([^$]+)<\/title>/);
				div.head_title = head_title ? head_title[1] : "";

//				alert(div.innerHTML)
			}
			else {
				div.innerHTML = '<div class="error">Response error:'+request.status+ ':'+request.node.url + request.node.parameters +'</div>';
				u.bug("status NOT 200:" + request.status);
				u.bug(request.statusText);
			}
		}
		catch(exception) {
			div.innerHTML = '<div class="error">Response error: no status</div>';
			u.bug("NO status exceptions:" + exception);
			u.bug(request.statusText);
		}
	}
	else {
		div.innerHTML = '<div class="error">Request error:'+request.node.url + request.node.parameters + '</div>';
		u.bug("Request error:" + request.node.url + request.node.parameters);
	}

	return div;
}


// Send request to url, calls the specified notify function on object on response
//Util.Ajax.send = function(url, notify, object, parameters, async, type) {

/*
// Send request to url, calls the specified notify function on object on response
Util.request = function(url, element) {
	// set request id
	var id = this.requests.length;

//	alert(url);
	this.requests[id] = new Object();
	this.requests[id].element = element;


	// get request object, and verify it
	this.requests[id].xmlHttp = this.createRequestObject();
	if(!this.requests[id].xmlHttp || typeof(this.requests[id].xmlHttp.send) == 'undefined') {
		this.responder(id, false);
		return;
	}

	// listen for async request state change
	if(async) {
		this.requests[id].xmlHttp.onreadystatechange = function() {
			if(Util.requests[id].xmlHttp.readyState == 4) {
				Util.responder(id, true);
			}
		}
	}

	// perform request
	try {
		this.requests[id].xmlHttp.open(method, url, async);
		this.requests[id].xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		this.requests[id].xmlHttp.send(parameters);
	}
	catch(e) {
		node.responder(id, false);
		return;
	}

	if(!async) {
		Util.Ajax.responder(id, true);
	}

}



// Send request to url, calls the specified notify function on object on response
Util.Ajax.send = function(url, notify, object, parameters, async, type) {
	Util.setLoadStatus("Loading", "load");

	// set request id
	var id = this.requests.length;

	this.requests[id] = new Object();
	// save request parameters
	this.requests[id].url = url;
	this.requests[id].notifier = notify;
	this.requests[id].object = (typeof(object) != "undefined" ? object : window);
	this.requests[id].parameters = (typeof(parameters) != "undefined" ? parameters : "");
	this.requests[id].async = (typeof(async) != "undefined" ? async : true);
	this.requests[id].type = (typeof(type) == "string" ? type : "POST");

	// get request object, and verify it
	this.requests[id].xmlHttp = this.createRequestObject();
	if(!this.requests[id].xmlHttp || typeof(this.requests[id].xmlHttp.send) == 'undefined') {
		this.responder(id, false);
		return;
	}

	this.requests[id].xmlHttp.open(this.requests[id].type, this.requests[id].url, this.requests[id].async);
	this.requests[id].xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	try {
		this.requests[id].xmlHttp.send(parameters);
	}
	catch(e) {
		this.responder(id, false);
		return;
	}

	// If async initiate onreadystatechange
	if(this.requests[id].async) {
		this.requests[id].xmlHttp.onreadystatechange = function() {
			if(Util.Ajax.requests[id].xmlHttp.readyState == 4) {
				Util.Ajax.responder(id, true);
			}
		}
	}
	else {
		Util.Ajax.responder(id, true);
	}
	return;
}
*/
/*
Util.Ajax = new Object();

// container to hold the requests
Util.Ajax.requests = new Array();

// Send request to url, calls the specified notify function on object on response
Util.Ajax.send = function(url, notify, object, parameters, async, type) {

	// set request id
	var id = this.requests.length;

	this.requests[id] = new Object();
	// save request parameters
	this.requests[id].url = url;
	this.requests[id].notifier = notify;
	this.requests[id].object = (typeof(object) != "undefined" ? object : window);
	this.requests[id].parameters = (typeof(parameters) != "undefined" ? parameters : "");
	this.requests[id].async = (typeof(async) != "undefined" ? async : true);
	this.requests[id].type = (typeof(type) == "string" ? type : "POST");

	// get request object, and verify it
	this.requests[id].xmlHttp = u.createRequestObject();
	if(!this.requests[id].xmlHttp || typeof(this.requests[id].xmlHttp.send) == 'undefined') {
		this.responder(id, false);
		return;
	}

	this.requests[id].xmlHttp.open(this.requests[id].type, this.requests[id].url, this.requests[id].async);
	this.requests[id].xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	try {
		this.requests[id].xmlHttp.send(parameters);
	}
	catch(e) {
		this.responder(id, false);
		return;
	}

	// If async initiate onreadystatechange
	if(this.requests[id].async) {
		this.requests[id].xmlHttp.onreadystatechange = function() {
			if(Util.Ajax.requests[id].xmlHttp.readyState == 4) {
				Util.Ajax.responder(id, true);
			}
		}
	}
	else {
		Util.Ajax.responder(id, true);
	}
	return;
}



// XML load responder, calls notifier function specified in notify
Util.Ajax.responder = function(id, state) {
	var response_object, response;
	// get respond-to object and free the ressource
	response_object = this.requests[id].object;
	response_object.exe = this.requests[id].notifier;
	this.requests[id].object = null;
	this.requests[id].notifier = null;

	// if request could not be executed
	if(!state) {
		response_object.exe(false);
	}
	else {
		try {
			// xmlHttp.status will throw an exception under certain conditions, this was the only way I found to catch it
			this.requests[id].xmlHttp.status;

			if(this.requests[id].xmlHttp.status == 200) {
				this.requests[id].status = this.requests[id].xmlHttp.status;
				this.requests[id].statusText = this.requests[id].xmlHttp.statusText;
				this.requests[id].result = this.requests[id].xmlHttp.responseXML;

//				Util.debug("responseText:"+this.requests[id].xmlHttp.responseText);
//				Util.debug("###");

//				this.requests[id].resultText = this.requests[id].xmlHttp.responseText.trim(); ??? safari 4 breakdown
				this.requests[id].resultText = this.requests[id].xmlHttp.responseText;
				response_object.exe(u.validateResponse(this.requests[id].xmlHttp, true));
				this.requests[id].xmlHttp = null;
				// relocate request to response
				response = this.requests[id];
//				Util.debug("res" + response);
			}
			else {
				response_object.exe(false);
			}
		}
		catch(e) {
			Util.debug("faila:" + e)
			if(this.requests[id]) {
				response_object.exe(false);
			}
		}
	}
	// reset request
	Util.Ajax.requests[id] = null;
}

*/
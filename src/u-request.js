// Create xmlhttprequest object - separated to make it possible to implement fallback, primarily for IE
Util.createRequestObject = function() {
	return new XMLHttpRequest();
}

// Request object
Util.request = function(node, url, _options) {
//	u.bug("request")

	var request_id = u.randomString(6);

	node[request_id] = {};
	node[request_id].request_url = url;

	// set default values
	node[request_id].request_method = "GET";
	node[request_id].request_async = true;
	node[request_id].request_data = "";
	node[request_id].request_headers = false;
	node[request_id].request_credentials = false;

	node[request_id].response_type = false;

	node[request_id].callback_response = "response";
	node[request_id].callback_error = "responseError";

	node[request_id].jsonp_callback = "callback";

	node[request_id].request_timeout = false;


	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var argument;
		for(argument in _options) {

			switch(argument) {
				case "method"				: node[request_id].request_method			= _options[argument]; break;

				// PARAMS IS DEPRECATED - REPLACED BY data
				case "params"				: node[request_id].request_data				= _options[argument]; break;
				case "data"					: node[request_id].request_data				= _options[argument]; break;

				case "async"				: node[request_id].request_async			= _options[argument]; break;
				case "headers"				: node[request_id].request_headers			= _options[argument]; break;
				case "credentials"			: node[request_id].request_credentials		= _options[argument]; break;

				case "responseType"			: node[request_id].response_type			= _options[argument]; break;

				case "callback"				: node[request_id].callback_response		= _options[argument]; break;
				case "error_callback"		: node[request_id].callback_error			= _options[argument]; break;

				case "jsonp_callback"		: node[request_id].jsonp_callback			= _options[argument]; break;


				case "timeout"				: node[request_id].request_timeout			= _options[argument]; break;
			}

		}
	}

//	u.bug("request:" + node[request_id].request_url + ", " + node[request_id].request_method + ", " + node[request_id].request_data + ", " + node[request_id].request_async + ", " + node[request_id].request_headers);



	// regular HTTP request
	if(node[request_id].request_method.match(/GET|POST|PUT|PATCH/i)) {

		node[request_id].HTTPRequest = this.createRequestObject();
		node[request_id].HTTPRequest.node = node;
		node[request_id].HTTPRequest.request_id = request_id;

		// set specific responseType for request
		if(node[request_id].response_type) {
			node[request_id].HTTPRequest.responseType = node[request_id].response_type;
		}

		// listen for async request state change
		if(node[request_id].request_async) {

			// On somesystems (like sharepoint), the XMLHTTPRequest is modified and applying 
			// a readystatechange handler directy will not work
			//
			// This also enables callback for browsers which doesn't support event listeners on XMLHTTPRequest object 
			// (for desktop_light extension, where eventlistener must be applied differently)
			node[request_id].HTTPRequest.statechanged = function() {
				if(this.readyState == 4 || this.IEreadyState) {
					// process async response
					u.validateResponse(this);
				}
			}
			// correctly handle readystatechange
			if(typeof(node[request_id].HTTPRequest.addEventListener) == "function") {
				u.e.addEvent(node[request_id].HTTPRequest, "readystatechange", node[request_id].HTTPRequest.statechanged);
			}
		}

		// perform request
		try {
			// perform GET request
			if(node[request_id].request_method.match(/GET/i)) {
//				u.bug("GET request");

				// convert JSON params to regular params, JSON cannot be sent as GET
				var params = u.JSONtoParams(node[request_id].request_data);

				// add params to url
				node[request_id].request_url += params ? ((!node[request_id].request_url.match(/\?/g) ? "?" : "&") + params) : "";

				node[request_id].HTTPRequest.open(node[request_id].request_method, node[request_id].request_url, node[request_id].request_async);

				// set timeout?
				if(node[request_id].request_timeout) {
					node[request_id].HTTPRequest.timeout = node[request_id].request_timeout;
				}

				// Request with credentials
				if(node[request_id].request_credentials) {
					node[request_id].HTTPRequest.withCredentials = true;
				}

				// set default content type
				if(typeof(node[request_id].request_headers) != "object" || (!node[request_id].request_headers["Content-Type"] && !node[request_id].request_headers["content-type"])) {
					node[request_id].HTTPRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
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
//				u.bug("params typeof:" + typeof(node[request_id].request_data) + ", " + node[request_id].request_data.constructor.toString().match(/FormData/i));


				// Stringify JSON objects
				// TODO: 'function Object' is that mobile safari? - which versions?
				if(typeof(node[request_id].request_data) == "object" && node[request_id].request_data.constructor.toString().match(/function Object/i)) {
					params = JSON.stringify(node[request_id].request_data);
				}
				else {
					params = node[request_id].request_data;
				}

				// open connection
				node[request_id].HTTPRequest.open(node[request_id].request_method, node[request_id].request_url, node[request_id].request_async);

				// set timeout?
				if(node[request_id].request_timeout) {
					node[request_id].HTTPRequest.timeout = node[request_id].request_timeout;
				}

				// Request with credentials
				if(node[request_id].request_credentials) {
					node[request_id].HTTPRequest.withCredentials = true;
				}

				// use appropriate header
				// XMLHttpRequests are sent as content-type text if nothing is declared
				// FormData will automatically get a form-data content-type (including boundary information)
				// if custom headers are not specified, set content-type according to what is being sent
				if(!params.constructor.toString().match(/FormData/i) && (typeof(node[request_id].request_headers) != "object" || (!node[request_id].request_headers["Content-Type"] && !node[request_id].request_headers["content-type"]))) {
					node[request_id].HTTPRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
				}


				// add additional headers
				// setting a content-type for a form-data request will ruin the request
				// - but that's the developers fault. Don't check for it.
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

			node[request_id].HTTPRequest.exception = exception;
			u.validateResponse(node[request_id].HTTPRequest);
			return;
		}

		// process synchronous response (response should be ready directly)
		if(!node[request_id].request_async) {
			u.validateResponse(node[request_id].HTTPRequest);
		}
	}
	// request by script injection
	else if(node[request_id].request_method.match(/SCRIPT/i)) {

		// apply timeout check
		if(node[request_id].request_timeout) {
			// handle timeout
			node[request_id].timedOut = function(requestee) {
				this.status = 0;
				delete this.timedOut;
				delete this.t_timeout;

				Util.validateResponse({node: requestee.node, request_id: requestee.request_id});
			}
			node[request_id].t_timeout = u.t.setTimer(node[request_id], "timedOut", node[request_id].request_timeout, {node: node, request_id: request_id});
		}

		// generate callback key
		var key = u.randomString();

		// create global reference
		document[key] = new Object();
		document[key].key = key;
		document[key].node = node;
		document[key].request_id = request_id;
		document[key].responder = function(response) {

			// make object to map node
			var response_object = new Object();
			response_object.node = this.node;
			response_object.request_id = this.request_id;
			response_object.responseText = response;

			// make sure to reset any timeout still roaming
			u.t.resetTimer(this.node[this.request_id].t_timeout);
			delete this.node[this.request_id].timedOut;
			delete this.node[this.request_id].t_timeout;

			// clean up
			u.qs("head").removeChild(this.node[this.request_id].script_tag);
			delete this.node[this.request_id].script_tag;
			delete document[this.key];

			u.validateResponse(response_object);
		}

		// convert JSON params to regular params, JSON cannot be sent as GET
		var params = u.JSONtoParams(node[request_id].request_data);

		// add params to url
		node[request_id].request_url += params ? ((!node[request_id].request_url.match(/\?/g) ? "?" : "&") + params) : "";
		// add callback to url
		node[request_id].request_url += (!node[request_id].request_url.match(/\?/g) ? "?" : "&") + node[request_id].jsonp_callback + "=document."+key+".responder";

		// add JSON Request to HTML head
		node[request_id].script_tag = u.ae(u.qs("head"), "script", ({"type":"text/javascript", "src":node[request_id].request_url}));
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
Util.validateResponse = function(HTTPRequest){
	// u.bug("validateResponse:");
	// console.log(HTTPRequest);

	var object = false;

	if(HTTPRequest) {

		var node = HTTPRequest.node;
		var request_id = HTTPRequest.request_id;
		var request = node[request_id];
		delete request.HTTPRequest;


		// stop any requests which already returned a response
		if(request.finished) {
			return;
		}

		// mark request as expired
		request.finished = true;

		// console.log(HTTPRequest.responseText);

		// u.bug("response:" + HTTPRequest + ":" + u.nodeId(HTTPRequest.node) + ":" + HTTPRequest.status)
		// u.bug("status:" + HTTPRequest.status + ":" + u.nodeId(HTTPRequest.node));
		// u.bug("responseText:" + HTTPRequest.responseText);

		try {
			
			// map response status to request object
			request.status = HTTPRequest.status;

			// valid response status
			if(HTTPRequest.status && !HTTPRequest.status.toString().match(/[45][\d]{2}/)) {
				// if responseType is defined and response was returned
				if(HTTPRequest.responseType && HTTPRequest.response) {
					object = HTTPRequest.response;
				}
				// if no responseType or no response object, then evaluate responseText if it exists
				else if(HTTPRequest.responseText) {
					object = u.evaluateResponseText(HTTPRequest.responseText);
				}
			}
			// SCRIPT has no response.status
			// is responseText available for evaluation
			else if(HTTPRequest.responseText && typeof(HTTPRequest.status) == "undefined") {
				object = u.evaluateResponseText(HTTPRequest.responseText);
			}

		}
		catch(exception) {
			request.exception = exception;
//			u.bug("HTTPRequest exection:" + exception);
		}
	}
	// invalid response - should not be possible, but anyway ... in case it happens, console will give you a hint
	else {
		console.log("Lost track of this request. There is no way of routing it back to requestee.")
		return;
	}
//	u.bug("object:" + object);

	// did validation yield usable object
	if(object !== false) {

		// callback to Response handler
//		u.bug("response:" + typeof(response.node[response.node.callback_response]))

		// Function reference
		if(typeof(request.callback_response) == "function") {
			request.callback_response(object, request_id);
		}
		// Function name
		else if(typeof(node[request.callback_response]) == "function") {
			node[request.callback_response](object, request_id);
		}

	}
	else {

		// callback to ResponseError handler
		// Function reference
		if(typeof(request.callback_error) == "function") {
			request.callback_error({error:true,status:request.status}, request_id);
		}
		// Function name
		else if(typeof(node[request.callback_error]) == "function") {
			node[request.callback_error]({error:true,status:request.status}, request_id);
		}

		// no responseError is declared - forward error to normal response handler

		// Function reference - no error handler
		else if(typeof(request.callback_response) == "function") {
			request.callback_response({error:true,status:request.status}, request_id);
		}
		// Function name - no error handler
		else if(typeof(node[request.callback_response]) == "function") {
			node[request.callback_response]({error:true,status:request.status}, request_id);
		}

	}

}


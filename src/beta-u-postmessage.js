/**
 * window.postMessage event router
 */
u.postMessage = new function () {

	this.is_listening = false;
	this.post_message_listeners = {};

	this.valid_origins = [];

	// Add allowed origin - only allowed origins will be forwarded
	this.addOrigin = function (origin) {

		this.valid_origins.push(origin);

	}

	// Add postMessage listener
	this.addListener = function (_options) {
//		u.bug("add message listener:" + _options.request_id)
//		u.xInObject(_options)


		var request_id = u.randomString();
		var callback = "messageReceived";
		var node = window;
		var permanent = false;

		// apply parameters
		if (typeof (_options) == "object") {
			var _argument;
			for (_argument in _options) {
				switch (_argument) {
					case "request_id": request_id = _options[_argument]; break;
					case "callback": callback = _options[_argument]; break;
					case "node": node = _options[_argument]; break;
					case "permanent": permanent = _options[_argument]; break;
				}
			}
		}


		// add listener to queue
		this.post_message_listeners[request_id] = {
			"callback": callback,
			"node": node,
			"permanent": permanent
		};


		// add window message listener (if not already added)
		if (!this.is_listening) {
			u.e.addWindowEvent(this, "message", this.receiver);
			this.is_listening = true;
		}

	}

	// Remove message listener
	this.removeListener = function (request_id) {

		delete this.post_message_listeners[request_id];

	}

	// message receiver
	this.receiver = function (event) {

		// invalid origin
		if (!event.origin || (this.valid_origins.length && this.valid_origins.indexOf(event.origin) == -1)) {
			return;
		}

//		u.bug("current listeners:" + Object.keys(this.post_message_listeners).length);


		var data;

		// validate data
		// data is string - try to convert to JSON object
		if (typeof (event.data) == "string") {
			data = u.isStringJSON(event.data);
		}
		// data is already JSON
		else if (typeof (event.data) == "object") {
			data = event.data;
			data.isJSON = true;
		}

		// JSON
		if (data.isJSON) {

//			u.bug("event.data.request_id:" + data.request_id);

			// do we have listener for this request id?
			if (this.post_message_listeners[data.RequestId]) {

				// get recipient object
				var recipient = this.post_message_listeners[data.RequestId];

				// make callback
				if (recipient.node && typeof (recipient.node[recipient.callback]) == "function") {
					recipient.node[recipient.callback](data);
				}


				// delete recipient if it is not permanent
				if (!recipient.permanent) {
					this.removeListener(data.RequestId);
				}
		
			}

			// no registered listener
			else {

				u.bug("uncaught message")
				for (x in data) {
					console.log("data[" + x + "]=" + data[x]);
				}

			}

		}

	}

}

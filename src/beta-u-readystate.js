/**
 * EXAMPLES
 * 
 * "register":"some value to register"
 *		or
 * "callback":"functionname to make callback to",
 *
 * "node":"optional node to use as scope for callback"
 * "timeout":"optional timeout (default 15 sec.)"
 * 
 * "requirements":{
 *		"AxSettings.SmartSearchCacheId":"string",
 *		"u.SmartSearchConfiguration":"object",
 *		"SP":"object",
 *		"SP.ClientContext":"function",
 *		"ManipulatorLoaded":true,
 *		"AxSettings.IsAppInstalled": {"type":"boolean", "value":true}
 * 
 * }
 * 
 * Default error handling can be specified via url parameter, readyStateError=none|console|overlay
 *
 */


/**
 * Ready state checker
 * 
 * 
 */
u.readyState = new function () {

	this.readyStateQueue = [];
	this.readyStateCustomEvents = [];


	// Perform som action when some requirements are fulfilled
	this.doWhen = function (_options) {
//		u.bug("add doWhen:" + _options.action)


		// add expire timestamp if timeout is set
		if (_options.timeout) {
			_options.expire = new Date().getTime() + _options.timeout;
		}
		// default expire: 60 seconds
		// TODO: test timeout 30 seconds
		else {
			_options.expire = new Date().getTime() + 1000 * 30;
		}

		// add to queue
		this.readyStateQueue.push(_options);

		// make sure observer is running
		this.startObserver();

	}

	// Register a state which requirements can use to group multiple checks
	this.register = function (flag) {
//		u.bug("customEvents:" + this.readyStateCustomEvents)

		this.readyStateCustomEvents.push(flag);

	}


	// start requirement observer (if not already running
	this.startObserver = function () {
//		u.bug("start observer")

		// make sure
		if (!u.t.valid(this.t_readyState)) {
			this.t_readyState = u.t.setInterval(this, "checkQueue", 50);
		}
	}

	// check if any queued items are fulfilled
	// also stops observer when queue is empty
	this.checkQueue = function () {
//		u.bug("checkQueue:" + this.readyStateQueue.length)


		var i, entry;
		// loop through queue
		for (i = 0; entry = this.readyStateQueue[i]; i++) {


			// count fulfilled requirements
			var fulfilled = 0;

			// check each requirement
			for (requirement in entry.requirements) {
				
//				u.bug("requirement:" + requirement)
				if (entry.requirements.hasOwnProperty(requirement)) {

					// check for registered flag
					if (entry.requirements[requirement] === true) {

						if (this.readyStateCustomEvents.indexOf(requirement) === -1) {
							// failed
							break;
						}

					}
					// check for correct type value
					else if (!this.isDefined(window, requirement, entry.requirements[requirement])) {
						// failed
						break;
					}

					// no breaks - one requirement fulfilled
					fulfilled++;
				}

			}

			// is all requirements fulfilled
			if (fulfilled == Object.keys(entry.requirements).length) {
//				u.bug("fulfilled: " + entry.callback + ", " + entry.register)

				// callback action
				if (entry.callback) {

					// node available for callback scope
					if (entry.node && fun (entry.node[entry.callback])) {
						entry.node[entry.callback].apply(entry.node, entry.parameters);
					}
					// callback on window scope
					else if (!entry.node && fun (window[entry.callback])) {
						window[entry.callback].apply(window, entry.parameters);
					}
					else {
						u.bug("entry.callback does not exist:" + entry.callback)
					}

				}
				// register global flag
				else if (entry.register) {
					this.register(entry.register);
				}

				// remove from readyStateQueue
				this.readyStateQueue.splice(i, 1);
				i--;

			}

			// check expiry
			else if(entry.expire && (new Date().getTime()) > entry.expire) {

				// error callback declared
				if (entry.error) {

					if (entry.node && fun (entry.node[entry.error])) {
						entry.node[entry.error].apply(entry.node, entry.parameters);
					}
					else if (!entry.node && fun (window[entry.error])) {
						window[entry.error].apply(window, entry.parameters);
					}
					else if (fun (this.errorHandlers[entry.error])) {
						this.errorHandlers[entry.error](entry);
					}

				}
				// default error state handler
				else {
					this.errorHandlers[u.readyStateDefaultError](entry);
				}

				// remove from readyStateQueue
				this.readyStateQueue.splice(i, 1);
				i--;

			}

		}


		// stop observer when nothing else is waiting in line
		if (!this.readyStateQueue.length) {

			u.t.resetInterval(this.t_readyState);

		}


	}

	// check if nested object property is set
	this.isDefined = function(object, property_string, value) {
//		u.bug("property_string:" + property_string + ", " + typeof(property_string) + ", " + object + ", " + value)

		if (object) {

			var properties = property_string.split(".");
			var base = properties.shift();

			// base is actually execution of a function
			if (base.match(/\(\)$/g)) {
				base = base.replace(/\(\)$/g, "");
				var base_object = object[base]();
			}
			else {
				var base_object = object[base];
			}


			// last level of this dependency
			if (properties.length === 0) {
//				u.bug("last level:" + base + ", " + typeof (base_object) + ", " + base_object)

				// complex comparison
				if (obj((value))) {

					if (typeof (base_object) === value["type"] && base_object === value["value"]) {
						return true;
					}

				}
				// simple comparison
				else if (typeof (base_object) === value && base_object) {
					return true;
				}

			}

			// still more levels of this dependecy to explore
			else if (properties.length > 0 && obj((base_object)) || fun((base_object))) {
//				u.bug("not last level:" + base + ", " + typeof (base_object))
				return this.isDefined(base_object, properties.join("."), value);

			}

		}

		return false;
	}


	// predefined error handlers
	// Global default value can be set via url parameter (readyStateError), for ease of use in production environment
	this.errorHandlers = {
		// ignore error
		"none": function (object) { },

		// show error in console
		"console": function (object) {
			console.log("### u.readyState requirement failed ###");
			
			u.xInObject(object);
			u.xInObject(object.requirements);

		},

		// TODO: HTML is unstyled
		// TODO: move this function to Axpoint specific code
		// show error in overlay
		"overlay": function (object) {

			if (!this.readyStateErrorOverlay) {
				this.readyStateErrorOverlay = u.ae(document.body, "div", { "class": "AxReadyStateErrorOverlay" });
				this.readyStateErrorOverlay._head = u.ae(this.readyStateErrorOverlay, "h2", { "html": "Connection error" });
				this.readyStateErrorOverlay._body = u.ae(this.readyStateErrorOverlay, "div", { "class": "body" });

				this.readyStateErrorOverlay.addMessage = function (message) {
			
					u.ae(this._body, "p", { "html": message });
				}

				this.readyStateErrorOverlay.addMessage(object.action + " was never invoked due to failed requirements");

			}

		}

	}

}



// Default error state handling can be defined via url parameter
u.readyStateDefaultError = u.getVar("readyStateError");
if (!u.readyStateDefaultError || !u.readyState.errorHandlers[u.readyStateDefaultError]) {
	u.readyStateDefaultError = "none";
}

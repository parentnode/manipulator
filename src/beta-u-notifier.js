/**
* Notify response object structure
* Standard janitor response object
* {
*	"cms_message":{
*		"message":[
*			"message1", "message2"
*		],
*		"error":[
*			"message1", "message2"
*		]
*		
*	}
* }
*
* Or cms_message with compressed message object
* {
*	"cms_message":{
*		"message":"message1",
*		"error":"message1"
*	}
* }
*
* Or array of message object
* [
*	{"type":"error", "message":"message1"},
*	{"type":"message", "message":"message2"},
* ]
*
* Or single message
* {"type":"error", "message":"message1"}
*
* Or HTML
*
*/

u.notifier = function(node, _options) {
	
	// u.bug_force = true;
	// u.bug("enable notifier");

	node._nt_hide_delay = 4500;

	node._nt_hide_callback = "_hide";
	node._nt_show_callback = "_show";

	// Scrape notifications from HTML on load
	node._nt_scrape = false;



		// additional info passed to function as JSON object
	if(obj(_options)) {
		var argument;
		for(argument in _options) {

			switch(argument) {
				case "hide_delay"      : node._nt_hide_delay        = _options[argument]; break;

				case "scrape"          : node._nt_scrape            = _options[argument]; break;
			}

		}
	}

	// Create notification div, unless it exists
	var notifications = u.qs("div.notifications", node);
	if(!notifications) {
		notifications = u.ae(node, "div", {"id":"notifications"});
	}
	node.notifications = notifications;


	// hide notification
	node.notifications._hide = function() {
		u.ass(this, {
			"transition": "all 0.5s ease-in-out",
			"opacity": 0,
			"transform":"translate(0, "+(-this.offsetHeight)+"px",
		});
	}
	node.notifications._show = function() {
		u.ass(this, {
			"transition": "all 0.2s ease-in-out",
			"opacity": 1,
		});
	}

	
	node.notify = function(response, _options) {

		var class_name = "message";

		// additional info passed to function as JSON object
		if(obj(_options)) {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "class"       : class_name            = _options[argument]; break;
				}

			}
		}

		var output = [];
		// u.bug("message:" + typeof(response) + "; JSON: " + response.isJSON + "; HTML: " + response.isHTML);

		// Response is object, returned via u.request
		if(obj(response) && response.isJSON && response.cms_message) {

			var cms_message = response.cms_message;
			var cms_status = typeof(response.cms_status) != "undefined" ? response.cms_status : "";
			var message, i;

			// Message is object
			if(obj(cms_message)) {

				for(type in cms_message) {
					// u.bug("typeof(cms_message[type]:" + typeof(cms_message[type]) + "; " + type);

					// Message in object is string
					if(str(cms_message[type])) {
						output.push(u.ae(this.notifications, "div", {"class":class_name+" "+cms_status+" "+type, "html":cms_message[type]}));
					}
					// Array of messages
					else if(obj(cms_message[type]) && cms_message[type].length) {
						for(i = 0; i < cms_message[type].length; i++) {
							message = cms_message[type][i];

							output.push(u.ae(this.notifications, "div", {"class":class_name+" "+cms_status+" "+type, "html":message}));
						}
					
					}
				}
			
			}
			// Message is plain string
			else if(str(cms_message)) {
				output.push(u.ae(this.notifications, "div", {"class":class_name+" "+cms_status, "html":cms_message}));
			}
		
		}
		// Response is HTML, returned via u.request
		else if(obj(response) && response.isHTML) {

			// check for janitor login form
			// in case AJAX call returned login form due to session expiring
			var login = u.qs(".scene.login form", response);
			var messages = u.qsa(".scene div.messages p", response);
			if(login && !u.qs("#login_overlay")) {


				// pause janitor auto save 
				page.autosave_disabled = true;

				// stop autosave
				if(page.t_autosave) {
					u.t.resetTimer(page.t_autosave);
				}

				// Create login overlay
				var overlay = u.ae(document.body, "div", {"id":"login_overlay"});
				overlay.node = this;
				u.ae(overlay, login);
				u.as(document.body, "overflow", "hidden");

				var relogin = u.ie(login, "h1", {"class":"relogin", "html":(u.txt["relogin"] ? u.txt["relogin"] : "Your session expired")});
//				login.insertBefore(relogin, form);

				login.overlay = overlay;
				u.ae(login, "input", {"type":"hidden", "name":"ajaxlogin", "value":"true"})
				u.f.init(login);

				login.inputs["username"].focus();

				login.submitted = function() {
					this.response = function(response) {
						if(response.isJSON && response.cms_status == "success") {
							var csrf_token = response.cms_object["csrf-token"];
							//u.bug("new token:" + csrf_token);
							var data_vars = u.qsa("[data-csrf-token]", page);
							var input_vars = u.qsa("[name=csrf-token]", page);
							var dom_vars = u.qsa("*", page);

							var i, node;
							for(i = 0; i < data_vars.length; i++) {
								node = data_vars[i];
								// u.bug("data:" + u.nodeId(node) + ", " + node.getAttribute("data-csrf-token"));
								node.setAttribute("data-csrf-token", csrf_token);
							}
							for(i = 0; i < input_vars.length; i++) {
								node = input_vars[i];
								// u.bug("input:" + u.nodeId(node) + ", " + node.value);
								node.value = csrf_token;
							}
							for(i = 0; i < dom_vars.length; i++) {
								node = dom_vars[i];
								if(node.csrf_token) {
									// u.bug("dom:" + u.nodeId(node) + ", " + node.csrf_token);
									node.csrf_token = csrf_token;
								}
							}

							this.overlay.parentNode.removeChild(this.overlay);

							// additional overlay cleanup (edge case handling)
							var multiple_overlays = u.qsa("#login_overlay");
							if(multiple_overlays) {
								for(i = 0; i < multiple_overlays.length; i++) {
									overlay = multiple_overlays[i];

									overlay.parentNode.removeChild(overlay);
								}
							}

							// restore body overflow
							u.as(document.body, "overflow", "auto");


							// start autosave again
							page.autosave_disabled = false;
							if(page._autosave_node && page._autosave_interval) {
								u.t.setTimer(page._autosave_node, "autosave", page._autosave_interval);
							}

						}
						// login form returned (some error occured)
						else {

							this.inputs["username"].focus();
							this.inputs["password"].val("");
							
							var error_message = u.qs(".errormessage", response);
							if(error_message) {
								this.overlay.node.notify({"isJSON":true, "cms_status":"error", "cms_message":error_message.innerHTML});
							}
							else {
								this.overlay.node.notify({"isJSON":true, "cms_status":"error", "cms_message":"An error occured"});
							}

						}

					}
					u.request(this, this.action, {"method":this.method, "data":this.getData()});
				}

				return;
			}

			// look for messages in HTML
			else if(messages) {
//				u.bug(messages);
				for(i = 0; i < messages.length; i++) {
					message = messages[i];

					output.push(u.ae(this.notifications, "div", {"class":message.className, "html":message.innerHTML}));
				}

			}
		}
		// Standard object (could be HTML, array or object)
		else if(obj(response)) {

			// HTML
			if(response.nodeName) {

				var messages = u.qsa(".scene div.messages p", response);
				for(i = 0; i < messages.length; i++) {
					message = messages[i];
					output.push(u.ae(this.notifications, "div", {"class":message.className, "html":message.innerHTML}));
				}

			}
			// Array of messages
			else if(response.length) {

				for(i = 0; i < response.length; i++) {
					message = response[i];
					if(obj(message) && message.message) {
						output.push(u.ae(this.notifications, "div", {"class":(message.type ? message.type : "message"), "html":message.message}));
					}
				}

			}
			// Single message object
			else if(fun(response.toString) && response.toString() === "[object Object]" && response.type && response.message) {
				output.push(u.ae(this.notifications, "div", {"class":response.type, "html":response.message}));
			}

		}

		// Is there a specific show method declared
		if(fun(this.notifications[this._nt_show_callback])) {
			this.notifications[this._nt_show_callback]();
		}

		// Start hide timer
		if(fun(this.notifications[this._nt_hide_callback])) {
			this.t_notifier = u.t.setTimer(this.notifications, this.notifications[this._nt_hide_callback], this._nt_hide_delay, output);
		}

	}

	// Automatically scrape notifications from current HTML document
	if(node._nt_scrape) {
		node.notify(document.body);
	}

}

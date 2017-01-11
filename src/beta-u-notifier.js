u.notifier = function(node) {
	
	// u.bug("enable notifier");

	var notifications = u.qs("div.notifications", node);
	if(!notifications) {
		node.notifications = u.ae(node, "div", {"id":"notifications"});
	}

	node.notifications.hide_delay = 4500;
	node.notifications.hide = function() {

		u.a.transition(this, "all 0.5s ease-in-out");
		u.a.translate(this, 0, -this.offsetHeight);
	}
	
	node.notify = function(response, _options) {

		var class_name = "message";

		// additional info passed to function as JSON object
		if(typeof(_options) == "object") {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "class"	: class_name	= _options[argument]; break;
				}

			}
		}

		var output;

		// u.bug("message:" + typeof(response) + "; JSON: " + response.isJSON + "; HTML: " + response.isHTML);

		if(typeof(response) == "object" && response.isJSON) {

			var message = response.cms_message;
			var cms_status = response.cms_status;

			// TODO: message can be JSON object
			if(typeof(message) == "object") {
				for(type in message) {
//					u.bug("typeof(message[type]:" + typeof(message[type]) + "; " + type);
					if(typeof(message[type]) == "string") {
						output = u.ae(this.notifications, "div", {"class":class_name+" "+cms_status, "html":message[type]});
					}
					else if(typeof(message[type]) == "object" && message[type].length) {
						var node, i;
						for(i = 0; _message = message[type][i]; i++) {
							output = u.ae(this.notifications, "div", {"class":class_name+" "+cms_status, "html":_message});
						}
					
					}
				}
			
			}
			else if(typeof(message) == "string") {
				output = u.ae(this.notifications, "div", {"class":class_name+" "+cms_status, "html":message});
			}
		
			if(typeof(this.notifications.show) == "function") {
				this.notifications.show();
			}
		
		}
		else if(typeof(response) == "object" && response.isHTML) {

			// check for login
			var login = u.qs(".scene.login", response);
			var messages = u.qsa(".scene div.messages p", response);
			if(login && !u.qs("#login_overlay")) {

				this.autosave_disabled = true;

				// stop autosave
				if(page.t_autosave) {
					u.t.resetTimer(page.t_autosave);
				}


				var overlay = u.ae(document.body, "div", {"id":"login_overlay"});
				overlay.node = this;
				u.ae(overlay, login);
				u.as(document.body, "overflow", "hidden");
				var form = u.qs("form", overlay);

				var relogin = u.ae(login, "p", {"class":"relogin", "html":(u.txt["relogin"] ? u.txt["relogin"] : "Your session expired")});
				login.insertBefore(relogin, form);

				form.overlay = overlay;
				u.ae(form, "input", {"type":"hidden", "name":"ajaxlogin", "value":"true"})
				u.f.init(form);

				form.fields["username"].focus();

				form.submitted = function() {
					this.response = function(response) {
						if(response.isJSON && response.cms_status == "success") {
							var csrf_token = response.cms_object["csrf-token"];
							//u.bug("new token:" + csrf_token);
							var data_vars = u.qsa("[data-csrf-token]", page);
							var input_vars = u.qsa("[name=csrf-token]", page);
							var dom_vars = u.qsa("*", page);

							var i, node;
							for(i = 0; node = data_vars[i]; i++) {
								// u.bug("data:" + u.nodeId(node) + ", " + node.getAttribute("data-csrf-token"));
								node.setAttribute("data-csrf-token", csrf_token);
							}
							for(i = 0; node = input_vars[i]; i++) {
								// u.bug("input:" + u.nodeId(node) + ", " + node.value);
								node.value = csrf_token;
							}
							for(i = 0; node = dom_vars[i]; i++) {
								if(node.csrf_token) {
									// u.bug("dom:" + u.nodeId(node) + ", " + node.csrf_token);
									node.csrf_token = csrf_token;
								}
							}

							this.overlay.parentNode.removeChild(this.overlay);

							// additional overlay cleanup (edge case handling)
							var multiple_overlays = u.qsa("#login_overlay");
							if(multiple_overlays) {
								for(i = 0; overlay = multiple_overlays[i]; i++) {
									overlay.parentNode.removeChild(overlay);
								}
							}

							// restore body overflow
							u.as(document.body, "overflow", "auto");

							this.overlay.node.autosave_disabled = false;
							
							// start autosave again
							if(this.overlay.node._autosave_node && this.overlay.node._autosave_interval) {
								u.t.setTimer(this.overlay.node._autosave_node, "autosave", this.overlay.node._autosave_interval);
							}
							
//							u.bug("vars:" + vars.length)
						}
						// login form returned (some error occured)
						else {

							this.fields["username"].focus();
							this.fields["password"].val("");
							
							var error_message = u.qs(".errormessage", response);
							if(error_message) {
								this.overlay.node.notify({"isJSON":true, "cms_status":"error", "cms_message":error_message.innerHTML});
							}
							else {
								this.overlay.node.notify({"isJSON":true, "cms_status":"error", "cms_message":"An error occured"});
							}

//							alert("login error")

						}
//						alert(u.qs("[data-csrf-token]")["data-csrf-token"]);
					}
					u.request(this, this.action, {"method":this.method, "params":u.f.getParams(this)});
//					alert("handle it")
				}
			}

			// look for messages in HTML
			else if(messages) {
//				u.bug(messages);
				for(i = 0; message = messages[i]; i++) {
					output = u.ae(this.notifications, "div", {"class":message.className, "html":message.innerHTML});
				}
			}
		}


		u.t.setTimer(this.notifications, this.notifications.hide, this.notifications.hide_delay);

		// if(message) {
		// 	message.hide = function() {
		// 		this.transitioned = function() {
		// 			u.a.transition(this, "none");
		// 			u.as(this, "display", "none");
		// 		}
		// 		u.a.transition(this, "all 0.5s ease-in-out");
		// 		u.a.setOpacity(this, 0);
		// 	}
		// 	u.t.setTimer(message, message.hide, 2000);
		// }

	}


}

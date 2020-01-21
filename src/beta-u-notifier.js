/**
* Notify response object structure
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
*/

u.notifier = function(node) {
	
	// u.bug_force = true;
	// u.bug("enable notifier");

	var notifications = u.qs("div.notifications", node);
	if(!notifications) {
		node.notifications = u.ae(node, "div", {"id":"notifications"});
	}

	node.notifications.hide_delay = 4500;
	node.notifications.hide = function(node) {
		u.a.transition(this, "all 0.5s ease-in-out");
		u.a.translate(this, 0, -this.offsetHeight);
	}
	
	node.notify = function(response, _options) {

		var class_name = "message";

		// additional info passed to function as JSON object
		if(obj(_options)) {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "class"	: class_name	= _options[argument]; break;
				}

			}
		}

		var output = [];

		// u.bug("message:" + typeof(response) + "; JSON: " + response.isJSON + "; HTML: " + response.isHTML);

		// if(obj(response)) {
		if(obj(response) && response.isJSON) {

			var message = response.cms_message;
			var cms_status = typeof(response.cms_status) != "undefined" ? response.cms_status : "";

			// TODO: message can be JSON object
			if(obj(message)) {
				for(type in message) {
//					u.bug("typeof(message[type]:" + typeof(message[type]) + "; " + type);
					if(str(message[type])) {
						output.push(u.ae(this.notifications, "div", {"class":class_name+" "+cms_status+" "+type, "html":message[type]}));
					}
					else if(obj(message[type]) && message[type].length) {
						var node, i;
						for(i = 0; i < message[type].length; i++) {
							_message = message[type][i];

							output.push(u.ae(this.notifications, "div", {"class":class_name+" "+cms_status+" "+type, "html":_message}));
						}
					
					}
				}
			
			}
			else if(str(message)) {
				output.push(u.ae(this.notifications, "div", {"class":class_name+" "+cms_status, "html":message}));
			}
		
			if(fun(this.notifications.show)) {
				this.notifications.show();
			}
		
		}
		else if(obj(response) && response.isHTML) {

			// check for login
			var login = u.qs(".scene.login form", response);
			var messages = u.qsa(".scene div.messages p", response);
			if(login && !u.qs("#login_overlay")) {

				// // remove article from login (if it exists)
				// // it should not be shown in quick login
				// var article = u.qs("div.article", login);
				// if(article) {
				// 	article.parentNode.removeChild(article);
				// }


				this.autosave_disabled = true;

				// stop autosave
				if(page.t_autosave) {
					u.t.resetTimer(page.t_autosave);
				}


				var overlay = u.ae(document.body, "div", {"id":"login_overlay"});
				overlay.node = this;
				u.ae(overlay, login);
				u.as(document.body, "overflow", "hidden");
//				var form = u.qs("form", overlay);

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

							this.overlay.node.autosave_disabled = false;
							
							// start autosave again
							if(this.overlay.node._autosave_node && this.overlay.node._autosave_interval) {
								u.t.setTimer(this.overlay.node._autosave_node, "autosave", this.overlay.node._autosave_interval);
							}
							
//							u.bug("vars:" + vars.length)
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

//							alert("login error")

						}
//						alert(u.qs("[data-csrf-token]")["data-csrf-token"]);
					}
					u.request(this, this.action, {"method":this.method, "data":this.getData()});
//					alert("handle it")
				}
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


		this.t_notifier = u.t.setTimer(this.notifications, this.notifications.hide, this.notifications.hide_delay, output);

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

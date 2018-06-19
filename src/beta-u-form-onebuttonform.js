Util.Objects["oneButtonForm"] = new function() {
	this.init = function(node) {
//		u.bug("oneButtonForm:" + u.nodeId(node));

		// inject standard form if action node is empty
		// this is done to minimize HTML in list pages
		if(!node.childNodes.length) {

			var csrf_token = node.getAttribute("data-csrf-token");
			var form_action = node.getAttribute("data-form-action");
			var form_target = node.getAttribute("data-form-target");
			var button_value = node.getAttribute("data-button-value");

			// optional attributes
			var button_name = node.getAttribute("data-button-name");
			var button_class = node.getAttribute("data-button-class");
			var inputs = node.getAttribute("data-inputs");

			if(csrf_token && form_action && button_value) {

				var form_options = {"action":form_action, "class":"confirm_action_form"};
				if(form_target) {
					form_options["target"] = form_target;
				}

				node.form = u.f.addForm(node, form_options);
				node.form.node = node;
				// add csrf token
				u.ae(node.form, "input", {"type":"hidden","name":"csrf-token", "value":csrf_token});

				// add additional hidden inputs
				if(inputs) {
					for(input_name in inputs) {
						u.ae(node.form, "input", {"type":"hidden","name":input_name, "value":inputs[input_name]});
					}
				}

				// add action
				u.f.addAction(node.form, {"value":button_value, "class":"button" + (button_class ? " "+button_class : ""), "name":u.stringOr(button_name, "save")});
			}
		}
		// look for valid forms
		else {
			node.form = u.qs("form", node);
		}

		// init if form is available
		if(node.form) {
			u.f.init(node.form);

			node.form.node = node;
			//node.form.confirm_submit_button = node.form.actions[u.stringOr(button_name, "confirm")];
			node.form.confirm_submit_button = u.qs("input[type=submit]", node.form);

			node.form.confirm_submit_button.org_value = node.form.confirm_submit_button.value;
			node.form.confirm_submit_button.confirm_value = node.getAttribute("data-confirm-value");
			node.form.confirm_submit_button.wait_value = node.getAttribute("data-wait-value");

			node.form.success_function = node.getAttribute("data-success-function");
			node.form.success_location = node.getAttribute("data-success-location");

			node.form.dom_submit = node.getAttribute("data-dom-submit");
			node.form._download = node.getAttribute("data-download");

//				node.form.cancel_url = bn_cancel.href;

			node.form.restore = function(event) {
				u.t.resetTimer(this.t_confirm);

				this.confirm_submit_button.value = this.confirm_submit_button.org_value;
				u.rc(this.confirm_submit_button, "confirm");
			}

			node.form.submitted = function() {
				u.bug("submitted");

				// first click
				if(!u.hc(this.confirm_submit_button, "confirm") && this.confirm_submit_button.confirm_value) {

					u.ac(this.confirm_submit_button, "confirm");
					this.confirm_submit_button.value = this.confirm_submit_button.confirm_value;
					this.t_confirm = u.t.setTimer(this, this.restore, 3000);

				}
				// confirm click
				else {
					u.t.resetTimer(this.t_confirm);

					// Make callback to oneButtonForm node
					if(typeof(this.node.submitted) == "function") {
						u.bug("oneButtonForm");
						this.node.submitted();
					}

					this.response = function(response) {

						// console.log("RESPONSE");
						// console.log(response);

						u.rc(this, "submitting");
						u.rc(this.confirm_submit_button, "disabled");

						// show notification
						page.notify(response);

						// Restore button
						this.restore();

						if(response.cms_status == "success") {

							// check for constraint error preventing row from actually being deleted
							if(response.cms_object && response.cms_object.constraint_error) {
								this.confirm_submit_button.value = this.confirm_submit_button.org_value;
								u.ac(this, "disabled");
							}
							else {

								if(this.success_location) {
									u.bug("location:" + this.success_location);

									u.ass(this.confirm_submit_button, {
										"display": "none"
									});

									location.href = this.success_location;
								}
								else if(this.success_function) {
									u.bug("function:" + this.success_function);
									if(typeof(this.node[this.success_function]) == "function") {
										this.node[this.success_function](response);
									}
								}
								// does default callback exist
								else if(typeof(this.node.confirmed) == "function") {
									u.bug("confirmed");
									this.node.confirmed(response);
								}
								else {
									u.bug("default return handling" + this.success_location)


									// remove node ?
								}
							}
						}
						else {
							
							// does default callback exist
							if(typeof(this.node.confirmedError) == "function") {
								u.bug("confirmedError");
								this.node.confirmedError(response);
							}
							
						}

					}
					u.ac(this.confirm_submit_button, "disabled");

					u.ac(this, "submitting");
					this.confirm_submit_button.value = u.stringOr(this.confirm_submit_button.wait_value, "Wait");

					// regular dom submit
					if(this.dom_submit) {
						u.bug("should submit:" + this._download);
						if(this._download) {

							this.response({"cms_status":"success"});

							// this.event_id = u.e.addWindowEvent(this, "blur", function() {
							//
							// 	this.response({"cms_status":"success"});
							// 	u.e.removeWindowEvent(this, "blur", this.event_id);
							// 	console.log("window blurred");
							// });
							

							u.bug("wait for download");
						}
						this.DOMsubmit();
					}
					else {
						u.request(this, this.action, {"method":"post", "data":u.f.getParams(this)});
					}
				}
			}
		}

	}
}
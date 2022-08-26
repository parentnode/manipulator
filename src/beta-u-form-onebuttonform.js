Util.Modules["oneButtonForm"] = new function() {
	this.init = function(node) {
		// u.bug("oneButtonForm:", node, node.childNodes.length);

		// inject standard form if action node is empty
		// this is option is made available to minimize intial HTML in list pages with many nodes
		if(!node.childNodes.length) {
			// u.bug("populate form");

			var csrf_token = node.getAttribute("data-csrf-token");

			// Ensure we have the minimum values for this type of implementation
			if(csrf_token) {

				// Is node form
				if(node.nodeName.toLowerCase() === "form") {
					node._ob_form = node;
				}
				else {
					var form_action = node.getAttribute("data-form-action");
					var form_target = node.getAttribute("data-form-target");

					if(form_action) {
						var form_options = {"action":form_action, "class":"confirm_action_form"};
						if(form_target) {
							form_options["target"] = form_target;
						}

						node._ob_form = u.f.addForm(node, form_options);
					}
					else {
						u.bug("oneButtonForm missin information");
						return;
					}

				}

				// add csrf token
				u.ae(node._ob_form, "input", {"type":"hidden","name":"csrf-token", "value":csrf_token});

				var inputs = node.getAttribute("data-inputs");


				// add additional hidden inputs
				if(inputs) {
					inputs = JSON.parse(inputs);
					for(input_name in inputs) {
						u.ae(node._ob_form, "input", {"type":"hidden","name":input_name, "value":inputs[input_name]});
					}
				}

				var button_value = node.getAttribute("data-button-value");

				// optional attributes
				var button_name = node.getAttribute("data-button-name");
				var button_class = node.getAttribute("data-button-class");

				// add action
				u.f.addAction(node._ob_form, {"value":button_value, "class":"button" + (button_class ? " "+button_class : ""), "name":u.stringOr(button_name, "save")});
			}
		}
		// look for valid forms
		else {

			// Is node form
			if(node.nodeName.toLowerCase() === "form") {
				node._ob_form = node;
			}
			// Look for form inside node
			else {
				node._ob_form = u.qs("form", node);
			}
		}

		// init if form is available
		if(node._ob_form) {
			// u.bug("valid form", node._ob_form);

			// Initialize form to utilize basic form functionality
			u.f.init(node._ob_form);

			// Make node reference on form (in case node and form is not the same element)
			node._ob_form._ob_node = node;

			// Find and map submit button
			node._ob_form._ob_submit_button = u.qs("input[type=submit]", node._ob_form);

			// Make sure submit button was found by Util.Form.init
			// If not, then initialize button manually
			if(u.objectValues(node._ob_form.actions).indexOf(node._ob_form._ob_submit_button) === -1) {
				u.f.initButton(node._ob_form, node._ob_form._ob_submit_button);
			}

			// Remember initial value
			node._ob_form._ob_submit_button.org_value = node._ob_form._ob_submit_button.value;
			// Look for confirm state value
			node._ob_form._ob_submit_button.confirm_value = node.getAttribute("data-confirm-value");
			// Look for wait state value
			node._ob_form._ob_submit_button.wait_value = node.getAttribute("data-wait-value");

			// Look for possible success function (custom function to call on success)
			node._ob_form._ob_success_function = node.getAttribute("data-success-function");
			// Look for possible success location (custom location to redirect to on success)
			node._ob_form._ob_success_location = node.getAttribute("data-success-location");
			// Look for possible error function (custom function to call on error)
			node._ob_form._ob_error_function = node.getAttribute("data-error-function");

			// Should form be submitted as regular form
			node._ob_form._ob_dom_submit = node.getAttribute("data-dom-submit");
			// Is button used for a download link
			node._ob_form._ob_download = node.getAttribute("data-download");


			// Restore original state after timeout
			node._ob_form.restore = function(event) {

				// Reset timer
				u.t.resetTimer(this.t_confirm);

				// Leave confirm state
				u.rc(this._ob_submit_button, "confirm");
				delete this._ob_submit_button._ob_wait_for_confirm;

				// Restore button value to original
				this._ob_submit_button.value = this._ob_submit_button.org_value;

			}

			// Handle submit event
			node._ob_form.submitted = function(action) {
				// u.bug("onebuttonsubmitted", action, this._ob_submit_button._ob_wait_for_confirm);

				// first click and confirm state enabled
				// if(!u.hc(this._ob_submit_button, "confirm") && this._ob_submit_button.confirm_value) {
				if(!this._ob_submit_button._ob_wait_for_confirm && this._ob_submit_button.confirm_value) {

					// enter confirm state
					u.ac(this._ob_submit_button, "confirm");
					this._ob_submit_button._ob_wait_for_confirm = true;

					// Set button value to confirm text
					this._ob_submit_button.value = this._ob_submit_button.confirm_value;
					// Set timeout for restoring original state
					this.t_confirm = u.t.setTimer(this, this.restore, 3000);

				}
				// confirmed click
				else {

					// Reset timer
					u.t.resetTimer(this.t_confirm);

					// Prepare to receive response
					this.response = function(response) {

						// console.log("RESPONSE");
						// console.log(response);

						u.rc(this, "submitting");
						u.rc(this._ob_submit_button, "disabled");

						// show notification (if notifications are enabled)
						if(typeof(page) !== 'undefined' && obj(page) && fun(page.notify)) {
							page.notify(response);
						}
						else if(typeof(app) !== 'undefined' && obj(app) && fun(app.notify)) {
							app.notify(response);
						}

						// Restore button
						this.restore();

						if(!response.cms_status || response.cms_status == "success") {

							// check for constraint error preventing row from actually being deleted
							if(response.cms_object && response.cms_object.constraint_error) {
								this._ob_submit_button.value = this._ob_submit_button.org_value;
								u.ac(this, "disabled");
							}
							else {

								if(this._ob_success_location) {
									// u.bug("success location:" + this._ob_success_location);

									u.ass(this._ob_submit_button, {
										"display": "none"
									});

									location.href = this._ob_success_location;
								}
								else if(this._ob_success_function) {
									// u.bug("success function:" + this._ob_success_function);

									if(fun(this._ob_node[this._ob_success_function])) {
										this._ob_node[this._ob_success_function](response);
									}
								}
								// does default callback exist
								else if(fun(this._ob_node.confirmed)) {

									// u.bug("confirmed");
									this._ob_node.confirmed(response);
								}
								else {
									u.bug("default return handling" + this._ob_success_location)


									// remove node ?
								}
							}
						}
						else {

							if(this._ob_error_function) {
								u.bug("error function:" + this._ob_error_function);
								if(fun(this._ob_node[this._ob_error_function])) {
									this._ob_node[this._ob_error_function](response);
								}
							}

							// does default callback exist
							else if(fun(this._ob_node.confirmedError)) {
								u.bug("confirmedError");
								this._ob_node.confirmedError(response);
							}
							
						}

					}

					// Disable button while submitting form
					u.ac(this._ob_submit_button, "disabled");

					// Enter submit state
					u.ac(this, "submitting");

					// Update button value to wait value
					this._ob_submit_button.value = u.stringOr(this._ob_submit_button.wait_value, "Wait");

					// regular dom submit
					if(this._ob_dom_submit) {
						u.bug("should submit:" + this._ob_download);
						if(this._ob_download) {

							// Ensure onebuttonform knows that download request has been made
							this.response({"cms_status":"success"});
							u.bug("wait for download");

						}
						// Perform regular submit
						this.DOMsubmit();
					}
					// Submit via AJAX request
					else {
						u.request(this, this.action, {"method":"post", "data":this.getData()});
					}
				}
			}
		}

	}
}
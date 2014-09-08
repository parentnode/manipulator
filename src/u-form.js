Util.Form = u.f = new function() {

	// create extension object
	this.customInit = {};
	this.customValidate = {};
	this.customSend = {};

	// extensive activation of form
	// indexes fields and 
	// - adds realtime validation, by settng correct/error classname
	// - sets focus classname on field focus
	// - adds callback for form change, update, submit and validationFailed


	// TODO: add error callback
	// TODO: add onclicks to buttons to avoid any ordinary submitting
	// TODO: set all click handlers and callbacks on buttons?
	// TODO: catch [ENTER] on buttons?


	this.init = function(form, settings) {
//		u.bug("init form:" + u.nodeId(form));
		var i, j, field, action, input;

		// prepared for additional settings - NOT used now
		// set default values
		// form.form_activation = true;
		// form.form_validation = true;
		form.form_send = "params";
		form.ignore_inputs = "ignoreinput";

		// additional info passed to function as JSON object
		if(typeof(settings) == "object") {
			var argument;
			for(argument in settings) {

				switch(argument) {
					case "ignore_inputs"	: form.ignore_inputs	= settings[argument]; break;
					case "form_send"		: form.form_send		= settings[argument]; break;
				}

			}
		}


		// disable regular form submit
		form.onsubmit = function(event) {return false;}

		// do not use HTML5 validation
		form.setAttribute("novalidate", "novalidate");

		// set submit reference to internal submit handler
		form._submit = this._submit;


		// objects for fields, actions
		form.fields = {};
		form.tab_order = [];
		form.actions = {};


		// get all fields
		var fields = u.qsa(".field", form);
		for(i = 0; field = fields[i]; i++) {
//			u.bug("field:" + u.nodeId(field))

			// remove requirement indicators (simple_form)
			var abbr = u.qs("abbr", field);
			if(abbr) {
				abbr.parentNode.removeChild(abbr);
			}

			// optional error message in data-error attribute
			var error_message = field.getAttribute("data-error");
			if(error_message) {
				u.ae(field, "div", {"class":"error", "html":error_message})
			}

			// required indicator (for showing icons)
			field._indicator = u.ae(field, "div", {"class":"indicator"});


			// // get input label, hint and error
			// field._label = u.qs("label", field);

			field._help = u.qs(".help", field);
			field._hint = u.qs(".hint", field);
			field._error = u.qs(".error", field);


			// setup fields
			var not_initialized = true;


			// check for custom inits
			var custom_init;
			for(custom_init in this.customInit) {
				if(field.className.match(custom_init)) {
					this.customInit[custom_init](field);
					not_initialized = false;
				}
			}


			// do not perform other inits if custom init exists
			if(not_initialized) {

				// regular inputs initialization
				if(u.hc(field, "string|email|tel|number|integer|password")) {

					field._input = u.qs("input", field);
					field._input.field = field;

					// add input to fields array
					form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// get/set value function
					field._input.val = this._value;

					// change/update events
					u.e.addEvent(field._input, "keyup", this._updated);
					u.e.addEvent(field._input, "change", this._changed);

					// submit on enter (checks for autocomplete etc)
					this.inputOnEnter(field._input);

					// activate field
					this.activateField(field._input);

					// validate field now
					this.validate(field._input);
				}

				// textarea initialization
				else if(u.hc(field, "text")) {

					field._input = u.qs("textarea", field);
					field._input.field = field;

					// add input to fields array
					form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// get/set value function
					field._input.val = this._value;

					// change/update events
					u.e.addEvent(field._input, "keyup", this._updated);
					u.e.addEvent(field._input, "change", this._changed);

					// activate field
					this.activateField(field._input);

					// validate field now
					this.validate(field._input);

					// resize textarea while typing
					if(u.hc(field, "autoexpand")) {
						this.autoExpand(field._input);
					}
				}

				// HTML editor initialization
				else if(u.hc(field, "html")) {

					field._input = u.qs("textarea", field);
					field._input.field = field;

					// add input to fields array
					form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// create textEditor interface
					this.textEditor(field);

					// validate field now
					this.validate(field._input);
				}

				// select initialization
				else if(u.hc(field, "select")) {

					field._input = u.qs("select", field);
					field._input.field = field;

					// add input to fields array
					form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// get/set value function
					field._input.val = this._value_select;

					// change/update events
					u.e.addEvent(field._input, "change", this._updated);
					u.e.addEvent(field._input, "keyup", this._updated);
					u.e.addEvent(field._input, "change", this._changed);

					// activate field
					this.activateField(field._input);

					// validate field now
					this.validate(field._input);
				}

				// checkbox/boolean (also checkbox) initialization
				else if(u.hc(field, "checkbox|boolean")) {

					field._input = u.qs("input[type=checkbox]", field);
					field._input.field = field;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// add input to fields array
					form.fields[field._input.name] = field._input;

					// get/set value function
					field._input.val = this._value_checkbox;

					// special setting for IE8 and less (bad onchange handler)
					if(u.browser("explorer", "<=8")) {
						field._input.pre_state = field._input.checked;
						field._input._changed = this._changed;
						field._input._updated = this._updated;
						field._input._clicked = function(event) {
							if(this.checked != this.pre_state) {
								this._changed(window.event);
								this._updated(window.event);
							}
							this.pre_state = this.checked;
						}
						u.e.addEvent(field._input, "click", field._input._clicked);

					}
					else {
						u.e.addEvent(field._input, "change", this._updated);
						u.e.addEvent(field._input, "change", this._changed);
					}

					// submit on enter (checks for autocomplete etc)
					this.inputOnEnter(field._input);

					// activate field
					this.activateField(field._input);

					// validate field now
					this.validate(field._input);
				}

				// radio button initialization
				else if(u.hc(field, "radio|radio_buttons")) {

					field._input = u.qsa("input", field);

					// add inputs to fields array using for name (radios all have same name)
					form.fields[field._input[0].name] = field._input;

					// initalize individual radio buttons
					for(j = 0; input = field._input[j]; j++) {
						input.field = field;

						// get input label
						input._label = u.qs("label[for="+input.id+"]", field);

						// get/set value function
						input.val = this._value_radio;

						// special setting for IE8 and less (bad onchange handler)
						if(u.browser("explorer", "<=8")) {
							input.pre_state = iN.checked;
							input._changed = this._changed;
							input._updated = this._updated;
							input._clicked = function(event) {
								var i, input;
								if(this.checked != this.pre_state) {
									this._changed(window.event);
									this._updated(window.event);
								}
								// update prestates for all radios in set
								for(i = 0; input = this.field._input[i]; i++) {
									input.pre_state = input.checked;
								}
							}
							u.e.addEvent(input, "click", input._clicked);
						}
						else {
							u.e.addEvent(input, "change", this._updated);
							u.e.addEvent(input, "change", this._changed);
						}

						// submit on enter (checks for autocomplete etc)
						this.inputOnEnter(input);

						// activate field
						this.activateField(input);

						// validate field now
						this.validate(field._input);
					}
				}

				// file input initialization
				else if(u.hc(field, "files")) {

					field._input = u.qs("input", field);
					field._input.field = field;

					// add input to fields array
					form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// change and update event
					u.e.addEvent(field._input, "change", this._updated);
					u.e.addEvent(field._input, "change", this._changed);

					// create file upload interface
					this.fileUpload(field);

					// validate field now
					this.validate(field._input);

				}



				// TODO: the rest still needs to be migrated from formIndex

				// date field initialization
				else if(u.hc(field, "date|datetime")) {

					field._input = u.qsa("select,input", field);
					for(j = 0; input = field._input[j]; j++) {
						input.field = field;

						// get input label
						input._label = u.qs("label[for="+input.id+"]", field);

						// add to form index
						this.formIndex(form, input);
					}
				}

				// tags initialization
				else if(u.hc(field, "tags")) {

					field._input = u.qs("input", field);
					field._input.field = field;

					// get input label
					field._input._label = u.qs("label\[for\="+field._input.id+"\]", field);

					// add to form index
					this.formIndex(form, field._input);
				}

				// tags initialization
				else if(u.hc(field, "prices")) {

					field._input = u.qs("input", field);
					field._input.field = field;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// add to form index
					this.formIndex(form, field._input);
				}


				// location field initialization
				else if(u.hc(field, "location")) {

					field._input = u.qsa("input", field);
					for(j = 0; input = field._input[j]; j++) {
						input.field = field;

						// get input label
						input._label = u.qs("label[for="+input.id+"]", field);

						// add to form index
						this.formIndex(form, input);
					}

					// inject Geolocation button
					if(navigator.geolocation) {
						this.geoLocation(field);
					}

				}

			}
		}


		// reference hidden fields
		var hidden_fields = u.qsa("input[type=hidden]", form);
		for(i = 0; hidden_field = hidden_fields[i]; i++) {
//			u.bug("hidden_field:" + u.nodeId(hidden_field));

			if(!form.fields[hidden_field.name]) {
				form.fields[hidden_field.name] = hidden_field;
				hidden_field.val = this._value;
			}
		}


		// TODO: DUPLICATE ACTION INITIALIZION FOR BOTH REGULAR ACTIONS LI AND STANDALONE BUTTON
		// - Create initAction function


		// get all regular actions
		var actions = u.qsa(".actions li, .actions", form);
		for(i = 0; action = actions[i]; i++) {
//			u.bug("action:" + u.nodeId(action));

			// get action input-button/a
			action._input = u.qs("input,a", action);

			// if submit button, make sure it does not submit form without validation
			if(action._input.type && action._input.type == "submit") {
				// need to cancel onclick event to avoid normal post in older browsers where killing mouseup/down is not enough
				action._input.onclick = function(event) {
					u.e.kill(event ? event : window.event);
				}
			}

			// handle button click
			u.ce(action._input);
			action._input.clicked = function(event) {
				u.e.kill(event);

				// don't execute if button is disabled
				if(!u.hc(this, "disabled")) {
					if(this.type && this.type.match(/submit/i)) {
						// store submit button info
						this.form._submit_button = this;
						// remove any previous submit info
						this.form._submit_input = false;

						// internal submit
						this.form._submit(event, this);
					}

					// TODO: what is default action when not a submit button??
					// else {
					// 	location.href = this.url;
					// }
				}
			}

			// handle [ENTER] on button
			this.buttonOnEnter(action._input);

			// activate button, adding focus and blur
			this.activateButton(action._input);

			// add to actions index if button has a name
			var action_name = action._input.name ? action._input.name : action.className;
//			if(action._input.name && action._input.name) {
				form.actions[action_name] = action._input;
//			}

			// shortcuts - BETA
//			u.bug("shortcut: " + u.nodeId(action._input) + ", " + u.hc(action._input, "key:[a-z0-9]+"));
			if(typeof(u.k) == "object" && u.hc(action._input, "key:[a-z0-9]+")) {
				u.k.addKey(u.cv(action._input, "key"), action._input);
			}
		}

		// could be form inside .actions li for isolated form action
		// only one button in form - will never occur if field is also necessary
		if(!actions.length) {

			// check if form is inside ul.actions
			var p_ul = u.pn(form, "ul");
			if(u.hc(p_ul, "actions")) {
//				u.bug("valid pure button form found")

				// get action input-button/a
				var input = u.qs("input:NOT([type=hidden]),a", form);

				// if submit button, make sure it does not submit form without validation
				if(input.type && input.type == "submit") {
					// need to cancel onclick event to avoid normal post in older browsers where killing mouseup/down is not enough
					input.onclick = function(event) {
						u.e.kill(event ? event : window.event);
					}
				}

				// handle button click
				u.ce(input);
				input.clicked = function(event) {
					u.e.kill(event);

					// don't execute if button is disabled
					if(!u.hc(this, "disabled")) {
						if(this.type && this.type.match(/submit/i)) {
							// store submit button info
							this.form._submit_button = this;
							// remove any previous submit info
							this.form._submit_input = false;

							// internal submit
							this.form._submit(event, this);
						}
					}
				}

				// handle [ENTER] on button
				this.buttonOnEnter(input);

				// activate button, adding focus and blur
				this.activateButton(input);

				// add to actions index if button has a name
				if(input.name) {
					form.actions[input.name] = input;
				}

				// shortcuts - BETA
	//			u.bug("shortcut: " + u.nodeId(action._input) + ", " + u.hc(action._input, "key:[a-z0-9]+"));
				if(typeof(u.k) == "object" && u.hc(input, "key:[a-z0-9]+")) {
					u.k.addKey(u.cv(input, "key"), input);
				}

			}
		}


//		u.bug(u.nodeId(form) + ", fields:", "red");
//		u.xInObject(form.fields);
//		u.bug(u.nodeId(form) + ", actions:", "red");
//		u.xInObject(form.actions);
	}

	// value get/setter for regular inputs
	this._value = function(value) {
		if(value !== undefined) {
			this.value = value;

			// validate after setting value
//			u.bug("validate from set value")
			u.f.validate(this);
		}
		return this.value;
	}
	// value get/setter for radio inputs
	this._value_radio = function(value) {
		if(value) {
			for(i = 0; option = this.form[this.name][i]; i++) {
				if(option.value == value) {
					option.checked = true;

					// validate after setting value
					u.f.validate(this);
				}
			}
		}
		else {
			var i, option;
			for(i = 0; option = this.form[this.name][i]; i++) {
				if(option.checked) {
					return option.value;
				}
			}
		}
		return false;
	}
	// value get/setter for checkbox inputs
	this._value_checkbox = function(value) {
		if(value) {
			this.checked = true

			// validate after setting value
			u.f.validate(this);
		}
		else {
			if(this.checked) {
				return this.value;
			}
		}
		return false;
	}
	// value get/setter for seelcts
	this._value_select = function(value) {
		if(value !== undefined) {
			var i, option;
			for(i = 0; option = this.options[i]; i++) {
				if(option.value == value) {
					this.selectedIndex = i;

					// validate after setting value
					u.f.validate(this);

					return i;
				}
			}
			return false;
		}
		else {
			return this.options[this.selectedIndex].value;
		}
	}


	// submit form when [ENTER] is pressed
	this.inputOnEnter = function(node) {
		node.keyPressed = function(event) {
//			u.bug("keypressed:" + event.keyCode);

			// TODO: using [DOWN]/[UP] and then mouse-clicking option from autocomplete should also end _submit_disabled, but it is pretty far fetched so not included now.

			// indicates user is navigating autocomplete options
			// 40 = [DOWN]
			// 38 = [UP]
			if(this.nodeName.match(/input/i) && (event.keyCode == 40 || event.keyCode == 38)) {
				this._submit_disabled = true;
			}
			// indicated user is done navigating autocomplate options
			// 46 = [DELETE]
			// 39 = [RIGHT] (Moz only)
			// 37 = [LEFT] (Moz only)
			// 27 = [ESC]
			// 13 = [ENTER]
			// 9 = [TAB]
			// 8 = [BACKSPACE]
			else if(this.nodeName.match(/input/i) && this._submit_disabled && (
				event.keyCode == 46 || 
				(event.keyCode == 39 && u.browser("firefox")) || 
				(event.keyCode == 37 && u.browser("firefox")) || 
				event.keyCode == 27 || 
				event.keyCode == 13 || 
				event.keyCode == 9 ||
				event.keyCode == 8
			)) {
				this._submit_disabled = false;
			}
			// ENTER key
			else if(event.keyCode == 13 && !this._submit_disabled) {
				u.e.kill(event);

//				u.bug("[ENTER] pressed:" + u.nodeId(this));

				// make sure autocomplete dropdown disappears
				this.blur();

				// store submit info
				this.form.submitInput = this;
				// delete any previous submit info
				this.form.submitButton = false;

				// internal submit
				this.form._submit(event, this);
			}
		}

		u.e.addEvent(node, "keydown", node.keyPressed);
	}

	// submit form when [ENTER] is pressed on button
	this.buttonOnEnter = function(node) {
		node.keyPressed = function(event) {
//			u.bug("keypressed:" + event.keyCode);

			// ENTER key
			if(event.keyCode == 13 && !u.hc(this, "disabled")) {
				u.e.kill(event);

//				u.bug("[ENTER] pressed:" + u.nodeId(this));

				// store submit info
				this.form.submit_input = false;
				// delete any previous submit info
				this.form.submit_button = this;

				// internal submit
				this.form._submit(event);
			}
		}

		u.e.addEvent(node, "keydown", node.keyPressed);
	}



	// this.tabIndex = function(form, input) {
	//
	// 	input.tab_index = form.tab_order.length;
	// 	form.tab_order[input.tab_index] = input;
	//
	// }


	// TODO: consider merging back into primary loop for better individualization and overview
	// add to form index and extend according to node type
	this.formIndex = function(form, iN) {
//		u.bug("formIndex:" + u.nodeId(iN) + ", " + iN.field + ", " + iN.name)

		// know position in field-order (tab index)
		// TODO: tabindex contains fields only - could be separated to contain both inputs and buttons
		iN.tab_index = form.tab_order.length;
		form.tab_order[iN.tab_index] = iN;

		if(iN.field && iN.name) {
			form.fields[iN.name] = iN;

			// input
			// type=text
			// type=email
			// type=number
			// type=password
			// type=date
			// type=datetime
			if(iN.nodeName.match(/input/i) && iN.type && iN.type.match(/text|email|tel|number|password|datetime|date/)) {

				iN.val = this._value;

				u.e.addEvent(iN, "keyup", this._updated);
				u.e.addEvent(iN, "change", this._changed);

				// submit on enter (checks for autocomplete etc)
				this.inputOnEnter(iN);
			}
			// textarea
			else if(iN.nodeName.match(/textarea/i)) {

				alert("unexpected formIndex in u.form");

				// iN.val = this._value;
				//
				// u.e.addEvent(iN, "keyup", this._updated);
				// u.e.addEvent(iN, "change", this._changed);

			}
			// select
			else if(iN.nodeName.match(/select/i)) {

				alert("unexpected formIndex in u.form");

				// iN.val = this._value_select;
				//
				// u.e.addEvent(iN, "change", this._updated);
				// u.e.addEvent(iN, "keyup", this._updated);
				// u.e.addEvent(iN, "change", this._changed);
			}
			// type=checkbox
			else if(iN.type && iN.type.match(/checkbox/)) {

				alert("unexpected formIndex in u.form");

				// iN.val = this._value_checkbox;
				//
				// // special setting for IE8 and less (bad onchange handler)
				// if(u.browser("explorer", "<=8")) {
				// 	iN.pre_state = iN.checked;
				// 	iN._changed = u.f._changed;
				// 	iN._updated = u.f._updated;
				// 	iN._clicked = function(event) {
				// 		if(this.checked != this.pre_state) {
				// 			this._changed(window.event);
				// 			this._updated(window.event);
				// 		}
				// 		this.pre_state = this.checked;
				// 	}
				// 	u.e.addEvent(iN, "click", iN._clicked);
				//
				// }
				// else {
				// 	u.e.addEvent(iN, "change", this._updated);
				// 	u.e.addEvent(iN, "change", this._changed);
				// }
				//
				// // submit on enter (checks for autocomplete etc)
				// this.inputOnEnter(iN);
			}
			// type=radio
			else if(iN.type && iN.type.match(/radio/)) {
			
				alert("unexpected formIndex in u.form");

				// iN.val = this._value_radio;
				//
				// // special setting for IE8 and less (bad onchange handler)
				// if(u.browser("explorer", "<=8")) {
				// 	iN.pre_state = iN.checked;
				// 	iN._changed = u.f._changed;
				// 	iN._updated = u.f._updated;
				// 	iN._clicked = function(event) {
				// 		var i, input;
				// 		if(this.checked != this.pre_state) {
				// 			this._changed(window.event);
				// 			this._updated(window.event);
				// 		}
				// 		// update prestates for all radios in set
				// 		for(i = 0; input = this.field._input[i]; i++) {
				// 			input.pre_state = input.checked;
				// 		}
				// 	}
				// 	u.e.addEvent(iN, "click", iN._clicked);
				// }
				// else {
				// 	u.e.addEvent(iN, "change", this._updated);
				// 	u.e.addEvent(iN, "change", this._changed);
				// }
				//
				// // submit on enter (checks for autocomplete etc)
				// this.inputOnEnter(iN);

			}


			// type=file
			else if(iN.type && iN.type.match(/file/)) {

				alert("unexpected formIndex in u.form");

				// iN.val = function(value) {
				// 	if(value !== undefined) {
				// 		alert('adding values manually to input type="file" is not supported')
				// 	}
				// 	else {
				// 		var i, file, files = [];
				// 		for(i = 0; file = this.files[i]; i++) {
				// 			files.push(file);
				// 		}
				// 		return files.join(",");
				// 	}
				// }
				//
				// u.e.addEvent(iN, "keyup", this._updated);
				// u.e.addEvent(iN, "change", this._changed);

			}


			// activate field
			this.activateField(iN);

			// validate field now
			this.validate(iN);
		}
	}

	// input is changed (onchange event) - attached to input
	this._changed = function(event) {
//		u.bug("value changed:" + this.name + ":" + event.type + ":" + u.nodeId(event.srcElement));

		// input cannot be changed without being used (selects in particular)
		this.used = true;

		// callbacks
		if(typeof(this.changed) == "function") {
			this.changed(this);
		}
		if(typeof(this.form.changed) == "function") {
			this.form.changed(this);
		}
	}

	// input is updated (onkeyup event) - attached to input
	this._updated = function(event) {
//		u.bug("value updated:" + this.name + ":" + event.type + ":" + u.nodeId(event.srcElement));

		// if key is not [TAB], [ENTER], [SHIFT], [CTRL], [ALT]
		if(event.keyCode != 9 && event.keyCode != 13 && event.keyCode != 16 && event.keyCode != 17 && event.keyCode != 18) {
//			u.bug("update:" + event.keyCode);

			// only validate onkeyup if field has been used before or already contains error
			if(this.used || u.hc(this.field, "error")) {
//				u.bug("validate from updated")
				u.f.validate(this);
			}

			// callbacks
			if(typeof(this.updated) == "function") {
				this.updated(this);
			}
			if(typeof(this.form.updated) == "function") {
				this.form.updated(this);
			}
		}

	}

	// validate input (event handler) - attached to input
	this._validate = function() {
//		u.bug("validate from _validate")
		u.f.validate(this);
	}

	// internal submit handler - attatched to form
	this._submit = function(event, iN) {

//		u.bug("submitted")

		// do pre validation of all fields
		for(name in this.fields) {
			if(this.fields[name].field) {
//				u.bug("field:" + name);
				// change used state for input
				this.fields[name].used = true;
				// validate
//				u.bug("validate from _submit")
				u.f.validate(this.fields[name]);
			}
		}

		// if error is found after validation
		if(u.qs(".field.error", this)) {
			if(typeof(this.validationFailed) == "function") {
				this.validationFailed();
			}
		}
		else {
			// does callback exist
			if(typeof(this.submitted) == "function") {
				this.submitted(iN);
			}
			// actual submit
			else {
				this.submit();
			}
		}
	}


	// position hint appropriately to input
	this.positionHint = function(field) {

		// is help element available, then position it appropriately to input
		// custom for HTML fields
		var f_h =  field.offsetHeight;
		var f_p_t = parseInt(u.gcs(field, "padding-top"));
		var f_p_b = parseInt(u.gcs(field, "padding-bottom"));
		var f_b_t = parseInt(u.gcs(field, "border-top-width"));
		var f_b_b = parseInt(u.gcs(field, "border-bottom-width"));
		var f_h_h = field._help.offsetHeight;

		if(field._help && u.hc(field, "html")) {

			var l_h = field._input._label.offsetHeight;
			var help_top = (((f_h - (f_p_t + f_p_b + f_b_b + f_b_t)) / 2)) - (f_h_h / 2) + l_h;
			u.as(field._help, "top", help_top + "px");
		}
		else if(field._help) {

//			u.bug(f_b_t + ", " + f_b_b)
//			u.bug("((" + f_h + " - (" + f_p_t + "+" + f_p_b + ")) / 2) + 2 = " + (((f_h - (f_p_t + f_p_b)) / 2) + 2));
//			u.bug("(" + (((f_h - (f_p_t + f_p_b)) / 2) + 2) + ")" + " - " + "(" + (f_h_h / 2) + ")");
			var help_top = (((f_h - (f_p_t + f_p_b + f_b_b + f_b_t)) / 2) + 2) - (f_h_h / 2)
			u.as(field._help, "top", help_top + "px");
		}

	}

	// internal mouseenter handler - attatched to inputs
	this._mouseenter = function(event) {
//		u.bug("this._mouseenter:" + u.nodeId(this.field));
		u.ac(this.field, "hover");
		u.ac(this, "hover");

		u.as(this.field, "zIndex", 99);

		u.f.positionHint(this.field);
	}
	// internal mouseleave handler - attatched to inputs
	this._mouseleave = function(event) {
//		u.bug("this._mouseleave:" + u.nodeId(this.field));
		u.rc(this.field, "hover");
		u.rc(this, "hover");

		u.as(this.field, "zIndex", 90);

		// is help element available, then position it appropriately to input
		// it might still be shown, is error has occured
		u.f.positionHint(this.field);
	}


	// internal focus handler - attatched to inputs
	this._focus = function(event) {
		this.field.focused = true;
		u.ac(this.field, "focus");
		u.ac(this, "focus");

		u.as(this.field, "zIndex", 99);

		u.f.positionHint(this.field);

		if(typeof(this.focused) == "function") {
			this.focused();
		}

		if(typeof(this.form.focused) == "function") {
			this.form.focused(this);
		}
	}
	// internal blur handler - attatched to inputs
	this._blur = function(event) {
		this.field.focused = false;
		u.rc(this.field, "focus");
		u.rc(this, "focus");

		u.as(this.field, "zIndex", 90);

		// is help element available, then position it appropriately to input
		// it might still be shown, is error has occured
		u.f.positionHint(this.field);


		// field has been interacted with
		this.used = true;


		if(typeof(this.blurred) == "function") {
			this.blurred();
		}
		if(typeof(this.form.blurred) == "function") {
			this.form.blurred(this);
		}
	}

	// internal blur handler - attatched to buttons
	this._button_focus = function(event) {
		u.ac(this, "focus");

		if(typeof(this.focused) == "function") {
			this.focused();
		}

		if(typeof(this.form.focused) == "function") {
			this.form.focused(this);
		}
	}
	// internal blur handler - attatched to buttons
	this._button_blur = function(event) {
		u.rc(this, "focus");

		if(typeof(this.blurred) == "function") {
			this.blurred();
		}
		if(typeof(this.form.blurred) == "function") {
			this.form.blurred(this);
		}
	}



	// internal blur handler for default value controller - attatched to inputs
	this._default_value_focus = function() {
		u.rc(this, "default");
		if(this.val() == this.default_value) {
			this.val("");
		}
	}
	// internal blur handler for default value controller - attatched to inputs
	this._default_value_blur = function() {
		if(this.val() == "") {
			u.ac(this, "default");
			this.val(this.default_value);
		}
	}

	// activate input - add focus and blur events
	this.activateField = function(iN) {
//		u.bug("activateField:" + u.nodeId(iN.field))

		u.e.addEvent(iN, "focus", this._focus);
		u.e.addEvent(iN, "blur", this._blur);

		// added accessibility
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(iN, "mouseenter", this._mouseenter);
			u.e.addEvent(iN, "mouseleave", this._mouseleave);
		}

		// validate on field blur
		u.e.addEvent(iN, "blur", this._validate);

//		u.bug(u.nodeId(iN) + ", " + u.hc(iN.form, "labelstyle:[a-z]+"));
		if(iN.form.labelstyle || u.hc(iN.form, "labelstyle:[a-z]+")) {

			iN.form.labelstyle = iN.form.labelstyle ? iN.form.labelstyle : u.cv(iN.form, "labelstyle");

			// currently only one input style
			// inject in input
			if(iN.form.labelstyle == "inject" && (!iN.type || !iN.type.match(/file|radio|checkbox/))) {

				iN.default_value = iN._label.innerHTML;

				u.e.addEvent(iN, "focus", this._default_value_focus);
				u.e.addEvent(iN, "blur", this._default_value_blur);

				if(iN.val() == "") {
					iN.val(iN.default_value);
					u.ac(iN, "default");
				}

			}
		}

	}

	// activate button - add focus and blur events
	this.activateButton = function(button) {

		u.e.addEvent(button, "focus", this._button_focus);
		u.e.addEvent(button, "blur", this._button_blur);
	}


	// check if input value is default value
 	this.isDefault = function(iN) {
		if(iN.default_value && iN.val() == iN.default_value) {
			return true;
		}
		return false;
	}



	// field has error - decide whether it is reasonable to show it or not
	this.fieldError = function(iN) {
//		u.bug("fieldError:" + u.nodeId(iN));
		u.rc(iN, "correct");
		u.rc(iN.field, "correct");

		// do not add visual feedback until field has been used by user - or if it contains value (reloads)
		if(iN.used || !this.isDefault(iN) && iN.val()) {
//			u.bug("ready for error state")
			u.ac(iN, "error");
			u.ac(iN.field, "error");

			// if help element is available
			this.positionHint(iN.field);

			// input validation failed
			if(typeof(iN.validationFailed) == "function") {
				iN.validationFailed();
			}

		}
	}

	// field is correct - decide whether to show it or not
	this.fieldCorrect = function(iN) {
//		u.bug("fieldCorrect:" + u.nodeId(iN));

		// does field have value? Non-required fields can be empty - but should not have visual validation
		if(!this.isDefault(iN) && iN.val()) {
//			u.bug("ready for correct state")
			u.ac(iN, "correct");
			u.ac(iN.field, "correct");
			u.rc(iN, "error");
			u.rc(iN.field, "error");
		}
		// remove visual validation on empty fields
		else {
//			u.bug("not ready for correct state")
			u.rc(iN, "correct");
			u.rc(iN.field, "correct");
			u.rc(iN, "error");
			u.rc(iN.field, "error");
		}
	}


	// ADDITIONAL EXTENSION FUNCTIONS

	// enable auto expanding text area
	this.autoExpand = function(iN) {

		// no scrollbars on auto expanded fields
		var current_height = parseInt(u.gcs(iN, "height"));
//		u.bug("AE:" + current_height + "," + iN.scrollHeight);

		var current_value = iN.val();
		iN.val("");
//		u.bug(current_height + "," + iN.scrollHeight);

		u.as(iN, "overflow", "hidden");
//		u.bug(current_height + "," + iN.scrollHeight);

		// get textarea height value offset - webkit and IE/Opera scrollHeight differs from height
		// implenting different solutions is the only way to achive similar behaviour across browsers
		// fallback support is Mozilla 

		iN.autoexpand_offset = 0;
		if(parseInt(u.gcs(iN, "height")) != iN.scrollHeight) {
			iN.autoexpand_offset = iN.scrollHeight - parseInt(u.gcs(iN, "height"));
		}

		iN.val(current_value);

		// set correct height
		iN.setHeight = function() {
//			u.bug("iN.setHeight:" + u.nodeId(this) + ", this.scrollHeight:" + this.scrollHeight + ", " + this.autoexpand_offset + ", " + this.scrollWidth + ", " + this.scrollTop);

			// if(this.scrollTop) {
			// 	this.rows++;
			// }
			

			var textarea_height = parseInt(u.gcs(this, "height"));

			if(this.val()) {
				if(u.browser("webkit") || u.browser("firefox", ">=29")) {
//					u.bug("webkit model")
					if(this.scrollHeight - this.autoexpand_offset > textarea_height) {
						u.a.setHeight(this, this.scrollHeight);
					}
				}
				else if(u.browser("opera") || u.browser("explorer")) {
//					u.bug("opera model")
					if(this.scrollHeight > textarea_height) {
						u.a.setHeight(this, this.scrollHeight);
					}
				}
				else {
//					u.bug("fallback model")
					u.a.setHeight(this, this.scrollHeight);
				}
			}
		}

		u.e.addEvent(iN, "keyup", iN.setHeight);

		iN.setHeight();
	}


	// enable file upload interface
	this.fileUpload = function(field) {

		// activate field mouse/drag interaction
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(field._input, "dragenter", this._focus);
			u.e.addEvent(field._input, "dragleave", this._blur);

			u.e.addEvent(field._input, "mouseenter", this._mouseenter);
			u.e.addEvent(field._input, "mouseleave", this._mouseleave);
		}

		// validate on field blur
		u.e.addEvent(field._input, "blur", this._validate);

		// custom val() function for file inputs
		field._input.val = function(value) {
			if(value !== undefined) {
				this.value = value;
//				alert('adding values manually to input type="file" is not supported')
			}
			else {
				var i, file, files = [];
				for(i = 0; file = this.files[i]; i++) {
					files.push(file);
				}
				return files;
//				return files.join(",");
			}
		}

	}


	// inject GeoLocation button in location field
	this.geoLocation = function(field) {
//		alert("geo")
		u.ac(field, "geolocation");

		field.lat_input = u.qs("div.latitude input", field);
		field.lat_input.autocomplete = "off";
		field.lat_input.field = field;


		field.lon_input = u.qs("div.longitude input", field);
		field.lon_input.autocomplete = "off";
		field.lon_input.field = field;

		// create map if it doesn't exist and position according to field
		field.showMap = function() {

			if(!window._mapsiframe) {
				var maps_url = "https://maps.googleapis.com/maps/api/js" + (u.gapi_key ? "?key="+u.gapi_key : "");
				var html = '<html><head>';
				html += '<style type="text/css">body {margin: 0;}#map {width: 300px; height: 300px;}</style>';
				html += '<script type="text/javascript" src="'+maps_url+'"></script>';
				html += '<script type="text/javascript">';

				html += 'var map, marker;';
				html += 'var initialize = function() {';
				html += '	window._map_loaded = true;';
				html += '	var mapOptions = {center: new google.maps.LatLng('+this.lat_input.val()+', '+this.lon_input.val()+'),zoom: 15};';
				html += '	map = new google.maps.Map(document.getElementById("map"),mapOptions);';
				html += '	marker = new google.maps.Marker({position: new google.maps.LatLng('+this.lat_input.val()+', '+this.lon_input.val()+'), draggable:true});';
				html += '	marker.setMap(map);';

				// html += '	map.changed = function(event_type) {';
				// html += '		if(event_type == "center" && marker) {';
				// html += '			var lat_marker = Math.round(marker.getPosition().lat()*100000)/100000;';
				// html += '			var lon_marker = Math.round(marker.getPosition().lng()*100000)/100000;';
				// html += '			var lat_map = Math.round(map.getCenter().lat()*100000)/100000;';
				// html += '			var lon_map = Math.round(map.getCenter().lng()*100000)/100000;';
				// html += '			if(lon_marker != lon_map || lat_marker != lat_map) {';
				// html += '				marker.setPosition(map.getCenter());';
				// html += '				field.lon_input.val(lon_map);'
				// html += '				field.lat_input.val(lat_map);'
				// html += '			};';
				// html += '		};';
				// html += '	};';

				html += '	marker.dragend = function(event_type) {';
				html += '		var lat_marker = Math.round(marker.getPosition().lat()*100000)/100000;';
				html += '		var lon_marker = Math.round(marker.getPosition().lng()*100000)/100000;';
				html += '		field.lon_input.val(lon_marker);';
				html += '		field.lat_input.val(lat_marker);';
				html += '	};';
				html += '	marker.addListener("dragend", marker.dragend);';
				html += '};';

				html += 'var centerMap = function(lat, lon) {';
				html += '	var loc = new google.maps.LatLng(lat, lon);';
				html += '	map.setCenter(loc);';
				html += '	marker.setPosition(loc);';
				html += '};';
				html += 'google.maps.event.addDomListener(window, "load", initialize);';
				html += '</script>';
				html += '</head><body><div id="map"></div></body></html>';

				window._mapsiframe = u.ae(document.body, "iframe", {"id":"geolocationmap"});
				window._mapsiframe.doc = window._mapsiframe.contentDocument? window._mapsiframe.contentDocument: window._mapsiframe.contentWindow.document;
				window._mapsiframe.doc.open();
				window._mapsiframe.doc.write(html);
				window._mapsiframe.doc.close();
			}
			else {
				this.updateMap();
			}
			window._mapsiframe.contentWindow.field = this;
			u.as(window._mapsiframe, "left", (u.absX(this.bn_geolocation)+this.bn_geolocation.offsetWidth+10)+"px");
			u.as(window._mapsiframe, "top", (u.absY(this.bn_geolocation) + (this.bn_geolocation.offsetHeight/2) -(window._mapsiframe.offsetHeight/2))+"px");
		}
		// update map center
		field.updateMap = function() {

			if(window._mapsiframe && window._mapsiframe.contentWindow && window._mapsiframe.contentWindow._map_loaded) {
				window._mapsiframe.contentWindow.centerMap(this.lat_input.val(), this.lon_input.val());
				
			}
		}
		// move map based on key presses or current values
		field.move_map = function(event) {

			var factor;
			if(this._move_direction) {

				if(event && event.shiftKey) {
					factor = 0.001;
				}
				else {
					factor = 0.0001;
				}
				
				if(this._move_direction == "38") {
					this.lat_input.val(u.round(parseFloat(this.lat_input.val())+factor, 6));
				}
				else if(this._move_direction == "40") {
					this.lat_input.val(u.round(parseFloat(this.lat_input.val())-factor, 6));
				}
				else if(this._move_direction == "39") {
					this.lon_input.val(u.round(parseFloat(this.lon_input.val())+factor, 6));
				}
				else if(this._move_direction == "37") {
					this.lon_input.val(u.round(parseFloat(this.lon_input.val())-factor, 6));
				}

				this.updateMap();
			}
		}

		field._end_move_map = function(event) {

			this.field._move_direction = false;
		}
		field._start_move_map = function(event) {

			if(event.keyCode.toString().match(/37|38|39|40/)) {
				this.field._move_direction = event.keyCode;
				this.field.move_map(event);
			}
		}


		u.e.addEvent(field.lat_input, "keydown", field._start_move_map);
		u.e.addEvent(field.lon_input, "keydown", field._start_move_map);
		u.e.addEvent(field.lat_input, "keyup", field._end_move_map);
		u.e.addEvent(field.lon_input, "keyup", field._end_move_map);


		field.lat_input.updated = field.lon_input.updated = function() {
			this.field.updateMap();
		}
		field.lat_input.focused = field.lon_input.focused = function() {
			this.field.showMap();
		}
		field.bn_geolocation = u.ae(field, "div", {"class":"geolocation"});
		field.bn_geolocation.field = field;
		u.ce(field.bn_geolocation);

		// get location from geolocation API
		field.bn_geolocation.clicked = function() {

			// animation while waiting for location
			u.a.transition(this, "all 0.5s ease-in-out");
			this.transitioned = function() {
				var new_scale;
				if(this._scale == 1.4) {
					new_scale = 1;
				}
				else {
					new_scale = 1.4;
				}
				u.a.scale(this, new_scale);
			}
			this.transitioned();

			window._geoLocationField = this.field;

			window._foundLocation = function(position) {
				var lat = position.coords.latitude;
				var lon = position.coords.longitude;

				window._geoLocationField.lat_input.val(u.round(lat, 6));
				window._geoLocationField.lon_input.val(u.round(lon, 6));
				// trigger validation
				window._geoLocationField.lat_input.focus();
				window._geoLocationField.lon_input.focus();

				// update map
				window._geoLocationField.showMap();
				u.a.transition(window._geoLocationField.bn_geolocation, "none");
				u.a.scale(window._geoLocationField.bn_geolocation, 1);
			}

			// Location error
			window._noLocation = function() {
				alert('Could not find location');
			}

			navigator.geolocation.getCurrentPosition(window._foundLocation, window._noLocation);

		}
	}


	// inject HTML editor
	this.textEditor = function(field) {

		u.bug("init editor")

		field._viewer = u.ae(field, "div", {"class":"viewer"});
		field._editor = u.ae(field, "div", {"class":"editor"});



		// TODO: update to specific val function
		// get/set value function
		field._input.val = this._value;


		field.allowed_tags = u.cv(field, "tags");
		field.allowed_tags = field.allowed_tags ? field.allowed_tags.split(",") : false;
		u.xInObject(field.allowed_tags)

		// add new formatting node
		field.add = function(type, value) {

			this._tag_restrictions = new RegExp(/^(p|h1|h2|h3|h4|h5|h6|ul|dl|code)$/);

			var div = u.ae(this._editor, "div", {"class":"tag "+type});

			// drag handle
			div._drag = u.ae(div, "div", {"class":"drag"});
			div._drag.field = this;


			// type selector
			div._select = u.ae(div, "ul", {"class":"type"});

			var i, tag;
			for(i = 0; tag = this.allowed_tags[i]; i++) {
				if(tag.match(this._tag_restrictions)) {
					u.ae(div._select, "li", {"html":tag, "class":tag});
				}
			}

			div._select.field = this;
			div._select.div = div;
			div._select.val = function(value) {
				if(value !== undefined) {
					var i, option;
					for(i = 0; option = this.childNodes[i]; i++) {
						if(u.text(option) == value) {

							if(this.selected_option) {
								u.rc(this.selected_option, "selected");

								// update div tag class
								u.rc(this.div, u.text(this.selected_option));
							}
							u.ac(option, "selected");
							this.selected_option = option;

							// update div tag class
							u.ac(this.div, value);

							return option;
						}
					}
					return this.childNodes[0];
//					return false;
				}
				else {
					return u.text(this.selected_option);
				}
			}
			// select current type
			div._select.val(type);


			u.ce(div._select);
			div._select.clicked = function(event) {
				u.bug("select clicked");

				if(u.hc(this, "open")) {
					u.rc(this, "open");
					u.rc(this.div, "focus");

					u.as(this, "top", 0);

					if(event.target) {
						this.val(u.text(event.target));
					}

					u.e.removeEvent(this, "mouseout", this.autohide);
					u.e.removeEvent(this, "mouseover", this.delayautohide);
					u.t.resetTimer(this.t_autohide);

					this.div._input.focus();
					
					this.field.update();
				}
				else {
					u.ac(this, "open");
					u.ac(this.div, "focus");

					u.as(this, "top", -(this.selected_option.offsetTop) + "px");

					u.e.addEvent(this, "mouseout", this.autohide);
					u.e.addEvent(this, "mouseover", this.delayautohide);
				}
			}

			// auto hide type selector
			div._select.hide = function() {
				u.rc(this, "open");
				u.rc(this.div, "focus");

				u.as(this, "top", 0);

				u.e.removeEvent(this, "mouseout", this.autohide);
				u.e.removeEvent(this, "mouseover", this.delayautohide);
				u.t.resetTimer(this.t_autohide);

				this.div._input.focus();
			}
			div._select.autohide = function(event) {
				u.t.resetTimer(this.t_autohide);
				this.t_autohide = u.t.setTimer(this, this.hide, 800);
			}
			div._select.delayautohide = function(event) {
				u.t.resetTimer(this.t_autohide);
			}

			// text input
			div._input = u.ae(div, "div", {"class":"text", "contentEditable":true});
			div._input.div = div;
			div._input.field = this;
			div._input.val = function(value) {
				if(value !== undefined) {
					this.innerHTML = value;
				}
				return this.innerHTML;
			}
			div._input.val(u.stringOr(value));

			// monitor changes and selections
			u.e.addEvent(div._input, "keydown", this._changing_content);

			u.e.addEvent(div._input, "keyup", this._changed_content);
			u.e.addEvent(div._input, "mouseup", this._changed_content);

			u.e.addEvent(div._input, "focus", this._focused_content);
			u.e.addEvent(div._input, "blur", this._blurred_content);

			if(u.e.event_pref == "mouse") {
				u.e.addEvent(div._input, "mouseenter", u.f._mouseenter);
				u.e.addEvent(div._input, "mouseleave", u.f._mouseleave);
			}

			// add paste event handler
			u.e.addEvent(div._input, "paste", this._pasted_content);

			return div;
		}

		// gained focus on individual text-tag
		field._focused_content = function(event) {
//			u.bug("field._focused_content");

			u.ac(this.div, "focus");
			this.field.focused = true;
			u.ac(this.field, "focus");

			u.as(this.field, "zIndex", 99);

			u.f.positionHint(this.field);

			// if tabbing to gain focus, move cursor to end
			// TODO: does not always detect tabbing
			if(event.rangeOffset == 1) {
				var range = document.createRange();
				range.selectNodeContents(this);
				range.collapse(false);

				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
		// lost focus on individual text-tag
		field._blurred_content = function() {
//			u.bug("_blurred_content:" + this.val());

			u.rc(this.div, "focus");
			this.field.focused = false;
			u.rc(this.field, "focus");

			u.as(this.field, "zIndex", 90);

			u.f.positionHint(this.field);

			// hide options (will not be hidden if they are needed)
			this.field.hideSelectionOptions();
		}


		// text has been changed - update field
		field._changed_type = function(event) {
//			u.bug("updated value:" + this.field._input.val());

			this.field.update();
			
		}

		// attached to div._input node onkey down
		// overriding default enter action 
		// (browser will insert <br> on [ENTER] - we want to create new paragraph)
		field._changing_content = function(event) {

			// [ENTER]
			if(event.keyCode == 13) {
				u.e.kill(event);
			}

		}

		// clean pasted content - first version
		field._pasted_content = function(event) {
			u.e.kill(event);

			var i, node;
			var paste_content = event.clipboardData.getData("text/plain");

			// only do anything if paste content is not empty
			if(paste_content !== "") {
				// add break tags for newlines
				var paste_parts = paste_content.split(/\n\r|\n|\r/g);
				var text_nodes = [];
				for(i = 0; text = paste_parts[i]; i++) {
					text_nodes.push(document.createTextNode(text));
					text_nodes.push(document.createElement("br"));
				}

 				var text_node = document.createTextNode(paste_content);
				for(i = text_nodes.length-1; node = text_nodes[i]; i--) {
					window.getSelection().getRangeAt(0).insertNode(node);
				}

				// position cursor at end
				var range = document.createRange();
				range.selectNodeContents(this);
				range.collapse(false);

				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}

			// u.bug("pasted content:" + event.clipboardData.getData("text/plain"));
			// u.bug("pasted content:" + event.clipboardData.getData("text/html"));
		}

		// attached to div._input node
		field._changed_content = function(event) {

//			u.bug("changed node:" + u.nodeId(this));
//			u.bug("changed value:" + event.keyCode + ", " + this.val());

			// get selection, to use for deletion
			var selection = window.getSelection(); 

			// [ENTER]
			if(event.keyCode == 13) {

				u.e.kill(event);

				// Clean [ENTER] - add new field
				if(!event.ctrlKey && !event.metaKey) {

					var new_tag = this.field.add("p");
					var next_tag = u.ns(this.div);
					if(next_tag) {
						this.div.parentNode.insertBefore(new_tag, next_tag);
					}
					else {
						this.div.parentNode.appendChild(new_tag);
					}

					new_tag._input.focus();

					// enable dragging of html-tags
					u.sortable(this.field._editor, {"draggables":"tag", "targets":"editor"});

				}

				// CTRL or CMD
				// TODO: Looks like CMD key does not work on contentEditable fields
				// TODO: Some weirdness with <br>'s in end of text.
				// check if we should inject <br> tag
				else {

					if(selection && selection.isCollapsed) {
						var br = document.createElement("br");
						range = selection.getRangeAt(0);
						range.insertNode(br);
						range.collapse(false);

						var selection = window.getSelection();
						selection.removeAllRanges();
						selection.addRange(range);
					}
				}
			}

			// [DELETE]
			if(event.keyCode == 8) {

				// node in deletable state?
				if(this.is_deletable) {
//					u.bug("go ahead delete me")

					u.e.kill(event);

					var prev_tag = u.ps(this.div);
					var all_tags = u.qsa("div.tag", this.field);

					// never delete last one
					if(all_tags.length > 1) {
						this.div.parentNode.removeChild(this.div);

						// is there a tag before this?
						if(prev_tag) {
							prev_tag._input.focus();

							// move cursor to the end of the editable area
							var range = document.createRange();
							range.selectNodeContents(prev_tag._input);
							range.collapse(false);

							var selection = window.getSelection();
							selection.removeAllRanges();
							selection.addRange(range);
						}
						// no prev, focus on next node
						else {
							u.qs("div.tag", this.field)._input.focus();
						}


						// enable dragging of html-tags
						u.sortable(this.field._editor, {"draggables":"tag", "targets":"editor"});
					}

				}

				// no value, enter deletable state
				else if(!this.val() || !this.val().replace(/<br>/, "")) {
					this.is_deletable = true;
				}

				// make sure to delete empty formatting nodes
				else if(selection.anchorNode != this && selection.anchorNode.innerHTML == "") {
					selection.anchorNode.parentNode.removeChild(selection.anchorNode);
				}

			}
			// any other key, remove deletable state 
			else {
				this.is_deletable = false;
			}


			// Text has been selected, show selection options

			// hide existing options first
			this.field.hideSelectionOptions();

			// new selection
			if(selection && !selection.isCollapsed) {

				// check if
				var node = selection.anchorNode;
				while(node != this) {
					if(node.nodeName == "HTML" || !node.parentNode) {
						break;
					}
					node = node.parentNode;
				}

				if(node == this) {
					this.field.showSelectionOptions(this, selection);
				}

			}

			// no selection
			// check if cursor is inside injected node and show options if it is a link
			// TODO: too many side-effects at this point
			// else if(selection && selection.isCollapsed) {
			//
			// 	// check if
			// 	var a = selection.anchorNode.parentNode;
			// 	u.bug("empty selection:" + a);
			// 	if(a.nodeName == "A") {
			// 		a.field.showSelectionOptions(this, selection);
			// 		a.field.anchorOptions(a.field, a);
			// 	}
			// }

			this.field.update();
		}

		// hide the options pane and update content 
		field.hideSelectionOptions = function() {

			// only hide if not in interaction mode
			if(this.options && !this.options.is_active) {
				this.options.parentNode.removeChild(this.options);
				this.options = null;
			}

			this.update();
		}

		// show options for selection
		field.showSelectionOptions = function(node, selection) {

			// position of node
			var x = u.absX(node);
			var y = u.absY(node);

			// create options div
			this.options = u.ae(document.body, "div", {"id":"selection_options"});

			// position options pane according to field
			u.as(this.options, "top", y+"px");
			u.as(this.options, "left", (x + node.offsetWidth) +"px");

			var ul = u.ae(this.options, "ul", {"class":"options"});

			// link option
			this.options._link = u.ae(ul, "li", {"class":"link", "html":"Link"});
			this.options._link.field = this;
			this.options._link.selection = selection;
			u.ce(this.options._link);
			this.options._link.inputStarted = function(event) {
				u.e.kill(event);
				this.field.options.is_active = true;
			}
			this.options._link.clicked = function(event) {
				u.e.kill(event);
				this.field.addAnchorTag(this.selection);
			}

			// EM option
			this.options._em = u.ae(ul, "li", {"class":"em", "html":"Itallic"});
			this.options._em.field = this;
			this.options._em.selection = selection;
			u.ce(this.options._em);
			this.options._em.inputStarted = function(event) {
				u.e.kill(event);
			}
			this.options._em.clicked = function(event) {
				u.e.kill(event);
				this.field.addEmTag(this.selection);
			}

			// STRONG option
			this.options._strong = u.ae(ul, "li", {"class":"strong", "html":"Bold"});
			this.options._strong.field = this;
			this.options._strong.selection = selection;
			u.ce(this.options._strong);
			this.options._strong.inputStarted = function(event) {
				u.e.kill(event);
			}
			this.options._strong.clicked = function(event) {
				u.e.kill(event);
				this.field.addStrongTag(this.selection);
			}

		}

		// add mouseover delete option to injected tags
		field.deleteOption = function(node) {

			node.over = function(event) {
				u.t.resetTimer(this.t_out);

				if(!this.bn_delete) {
					this.bn_delete = u.ae(document.body, "span", {"class":"delete_selection", "html":"X"});
					this.bn_delete.node = this;

					this.bn_delete.over = function(event) {
						u.t.resetTimer(this.node.t_out);
					}
					this.bn_delete.out = function(event) {
						this.node.t_out = u.t.setTimer(this.node, this.node.reallyout, 300);
					}
					u.e.addEvent(this.bn_delete, "mouseover", this.bn_delete.over);
					u.e.addEvent(this.bn_delete, "mouseout", this.bn_delete.out);

					u.ce(this.bn_delete);
					this.bn_delete.clicked = function() {
						u.e.kill(event);
						var fragment = document.createTextNode(this.node.innerHTML);
						this.node.parentNode.replaceChild(fragment, this.node);
						this.node.reallyout();
						this.node.field.update();
					}

					u.as(this.bn_delete, "top", (u.absY(this)-5)+"px");
					u.as(this.bn_delete, "left", (u.absX(this)+this.offsetWidth-5)+"px");
				}
			}

			node.out = function(event) {
				u.t.resetTimer(this.t_out);
				this.t_out = u.t.setTimer(this, this.reallyout, 300);
			}

			node.reallyout = function(event) {
				if(this.bn_delete) {
					document.body.removeChild(this.bn_delete);
					this.bn_delete = null;
				}
			}

			u.e.addEvent(node, "mouseover", node.over);
			u.e.addEvent(node, "mouseout", node.out);
		}

		// activate existing inline formatting
		field.activateInlineFormatting = function(input) {

			var i, node;
			var inline_tags = u.qsa("a,strong,em", input);

			for(i = 0; node = inline_tags[i]; i++) {
				node.field = input.field;
				this.deleteOption(node);
			}
		}


		// INLINE FORMATTING

		// extend options pane with Anchor options
		field.anchorOptions = function(node) {

			var form = u.f.addForm(this.options, {"class":"labelstyle:inject"});
			u.ae(form, "h3", {"html":"Link options"});
			var fieldset = u.f.addFieldset(form);
			var input_url = u.f.addField(fieldset, {"label":"url", "name":"url"});

			// TODO: change to SELECT field
			var input_target = u.f.addField(fieldset, {"label":"target", "name":"target"});
			var bn_save = u.f.addAction(form, {"value":"Create link", "class":"button"});
			u.f.init(form);

			// // fill out with existing values
			// if(node.href) {
			// 	form.fields["url"].val(node.href);
			// }
			// if(node.target) {
			// 	form.fields["target"].val(node.target);
			// }

			form.a = node;
			form.field = this;

			form.submitted = function() {

				if(this.fields["url"].val() && this.fields["url"].val() != this.fields["url"].default_value) {
					this.a.href = this.fields["url"].val();
				}

				if(this.fields["target"].val() && this.fields["target"].val() != this.fields["target"].default_value) {
					this.a.target = this.fields["target"].val();
				}
				this.field.options.is_active = false;
				this.field.hideSelectionOptions();
			}
		}

		// add anchor tag
		field.addAnchorTag = function(selection) {
			var range, a, url, target;

			var a = document.createElement("a");
			a.field = this;

			range = selection.getRangeAt(0);
			range.surroundContents(a);
			selection.removeAllRanges();

			this.anchorOptions(a);
			this.deleteOption(a);

		}

		// add string tag
		field.addStrongTag = function(selection) {

			var range, a, url, target;
			var strong = document.createElement("strong");
			strong.field = this;

			range = selection.getRangeAt(0);
			range.surroundContents(strong);
			selection.removeAllRanges();

			this.deleteOption(strong);
			this.hideSelectionOptions();
		}

		// add em tag
		field.addEmTag = function(selection) {

			var range, a, url, target;
			var em = document.createElement("em");
			em.field = this;

			range = selection.getRangeAt(0);
			range.surroundContents(em);
			selection.removeAllRanges();

			this.deleteOption(em);
			this.hideSelectionOptions();
		}


		// index existing content 

		// inject value into viewer div, to be able to inspect for DOM content
		field._viewer.innerHTML = field._input.val();
		field._fields = new Array();

		// TODO: 
		
		// if value of textarea is not HTML formatted
		// change double linebreak to </p><p> (or fitting) once you are sure text is wrapped in node

		var value, node, i, tag;

		// check for valid nodes, excluding <br>
		var nodes = u.cn(field._viewer, "br");
		if(nodes.length) {

			// loop through childNodes

			for(i = 0; node = field._viewer.childNodes[i]; i++) {

//				u.bug("node" + u.nodeId(node) + ", " + node.nodeName + ", " + typeof(node.nodeName));

				// lost fragment,
				// wrap in p tag if content is more than whitespace or newline
				if(node.nodeName == "#text") {
					if(node.nodeValue.trim()) {

						// locate double linebreaks and split into several paragraphs 
						var fragments = node.nodeValue.trim().split(/\n\r\n\r|\n\n|\r\r/g);
						if(fragments) {
							for(index in fragments) {
								value = fragments[index].replace(/\n\r|\n|\r/g, "<br>");
								tag = field.add("p", fragments[index]);
								field.activateInlineFormatting(tag._input);
							}
						}
						// wrap textnode in one paragraph
						else {
							value = node.nodeValue; //.replace(/\n\r|\n|\r/g, "<br>");
							tag = field.add("p", value);
							field.activateInlineFormatting(tag._input);
						}

					}
				}
				// valid node
				else if(node.nodeName.toLowerCase().match(field._tag_restrictions)) {

					value = node.innerHTML.replace(/\n\r|\n|\r/g, "<br>"); // .replace(/\<br[\/]?\>/g, "\n");
					tag = field.add(node.nodeName.toLowerCase(), value);
					field.activateInlineFormatting(tag._input);

				}
				// invalid node, what can it be?
				else {
					alert("invalid node:" + node.nodeName);
				}


//				u.ae(field._editor, "textarea").value = node.innerHTML;
			}
		}
		// single unformatted textnode
		// wrap in <p> and replace newline with <br>
		else {

			value = field._viewer.innerHTML.replace(/\<br[\/]?\>/g, "\n");
			//.replace(/\n\r|\n|\r/g, "<br>");
			tag = field.add("p", value);
			field.activateInlineFormatting(tag._input);

		}


		// enable dragging of html-tags
		u.sortable(field._editor, {"draggables":"tag", "targets":"editor"});



		field.update = function() {

			this.updateViewer();
			this.updateContent();

		}

		field.updateViewer = function() {

			var tag_fields = u.qsa("div.tag", this);
			var i, node, value;
			// update html viewer
			this._viewer.innerHTML = "";
			for(i = 0; node = tag_fields[i]; i++) {
				value = node._input.val();
				 //.replace(/\n\r|\n|\r/g, "<br>");
				u.ae(this._viewer, node._select.val(), {"html":value});
			}
			
		}

		field.updateContent = function() {
//			u.bug("updateContent");

			var tags = u.qsa("div.tag", this);

			// update actual textarea to be saved
			this._input.val("");
			var i, node, tag, value, html = "";

			for(i = 0; node = tags[i]; i++) {
//				u.bug(u.nodeId(node));
				value = node._input.val();
				 //.replace(/\n\r|\n|\r/g, "<br>");
				tag = node._select.val();
				html += "<"+tag+">"+value+"</"+tag+">\n";

			}
//			u.bug("updateContent ("+u.nodeId(this._input)+ "):" + html);
			this._input.val(html);

		}

		// 
		field.updateViewer();


		// do not update submit input until content has been changed
		// need resize on input
		// need [ENTER] handler - different action for li/dd/dt than for regular inputs

		// label as select with all options



	}


	// validate input
	// - number
	// - integer
	// - tel
	// - email
	// - text
	// - select
	// - radio
	// - checkbox|boolean
	// - password
	// - string
	// - date
	// - datetime
	// - files
	this.validate = function(iN) {
//		u.bug("validate:" + iN.name)
		var min, max, pattern;
		var not_validated = true;


		// start by checking if value is empty or default_value
		// not required
		if(!u.hc(iN.field, "required") && (iN.val() == "" || this.isDefault(iN))) {
//			u.bug("valid empty")
			this.fieldCorrect(iN);
			return true;
		}
		// required
		else if(u.hc(iN.field, "required") && (iN.val() == "" || this.isDefault(iN))) {
//			u.bug("invalid empty")
			this.fieldError(iN);
			return false;
		}


		// loop through custom validations
		var custom_validate;
		for(custom_validate in u.f.customValidate) {
			if(u.hc(iN.field, custom_validate)) {
				u.f.customValidate[custom_validate](iN);
				not_validated = false;
			}
		}

		// still not validated?
		if(not_validated) {

			// password validation
			if(u.hc(iN.field, "password")) {

				// min and max length
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 8;
				max = max ? max : 20;
				pattern = iN.getAttribute("pattern");

				if(
					iN.val().length >= min && 
					iN.val().length <= max && 
					(!pattern || iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// number validation
			else if(u.hc(iN.field, "number")) {

				// min and max length
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 0;
				max = max ? max : 99999999999999999999999999999;
				pattern = iN.getAttribute("pattern");

				if(
					!isNaN(iN.val()) && 
					iN.val() >= min && 
					iN.val() <= max && 
					(!pattern || iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// integer validation
			else if(u.hc(iN.field, "integer")) {

				// min and max length
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 0;
				max = max ? max : 99999999999999999999999999999;
				pattern = iN.getAttribute("pattern");

				if(
					!isNaN(iN.val()) && 
					Math.round(iN.val()) == iN.val() && 
					iN.val() >= min && 
					iN.val() <= max && 
					(!pattern || iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// telephone validation
			else if(u.hc(iN.field, "tel")) {

				pattern = iN.getAttribute("pattern");

				if(
					!pattern && iN.val().match(/^([\+0-9\-\.\s\(\)]){5,18}$/) ||
					(pattern && iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// email validation
			else if(u.hc(iN.field, "email")) {
				if(
					!pattern && iN.val().match(/^([^<>\\\/%$])+\@([^<>\\\/%$])+\.([^<>\\\/%$]{2,20})$/) ||
					(pattern && iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// text validation
			else if(u.hc(iN.field, "text")) {

				// min and max length
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 1;
				max = max ? max : 10000000;
				pattern = iN.getAttribute("pattern");

				if(
					iN.val().length >= min && 
					iN.val().length <= max && 
					(!pattern || iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// html validation
			else if(u.hc(iN.field, "html")) {

				// min and max length
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 1;
				max = max ? max : 10000000;
				pattern = iN.getAttribute("pattern");

				if(
					u.text(iN.field._viewer) &&
					u.text(iN.field._viewer).length >= min && 
					u.text(iN.field._viewer).length <= max && 
					(!pattern || iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}



			// TODO: needs to be tested
			// select validation
			else if(u.hc(iN.field, "select")) {

				if(iN.val()) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}
			// TODO: needs to be tested
			// checkbox/radio validation
			else if(u.hc(iN.field, "checkbox|boolean|radio|radio_buttons")) {

				if(iN.val()) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}



			// string validation (has been known to exist on other types, so leave it last giving other types precedence)
			else if(u.hc(iN.field, "string")) {

				// min and max length
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 1;
				max = max ? max : 255;
				pattern = iN.getAttribute("pattern");

				if(
					iN.val().length >= min &&
					iN.val().length <= max && 
					(!pattern || iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// date validation
			else if(u.hc(iN.field, "date")) {

				pattern = iN.getAttribute("pattern");

				if(
					!pattern && iN.val().match(/^([\d]{4}[\-\/\ ]{1}[\d]{2}[\-\/\ ][\d]{2})$/) ||
					(pattern && iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// datetime validation
			else if(u.hc(iN.field, "datetime")) {

				pattern = iN.getAttribute("pattern");

				if(
					!pattern && iN.val().match(/^([\d]{4}[\-\/\ ]{1}[\d]{2}[\-\/\ ][\d]{2} [\d]{2}[\-\/\ \:]{1}[\d]{2}[\-\/\ \:]{0,1}[\d]{0,2})$/) ||
					(pattern && iN.val().match(pattern))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}


			// tags validation
			else if(u.hc(iN.field, "tags")) {
				if(
					!pattern && iN.val().match(/\:/) ||
					(pattern && iN.val().match("^"+pattern+"$"))
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// prices validation
			else if(u.hc(iN.field, "prices")) {
				if(
					!isNaN(iN.val())
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// location validation
			else if(u.hc(iN.field, "location")) {

				if(u.hc(iN, "location")) {

					min = min ? min : 1;
					max = max ? max : 255;

					if(
						iN.val().length >= min &&
						iN.val().length <= max
					) {
						this.fieldCorrect(iN);
					}
					else {
						this.fieldError(iN);
					}
				}
				if(u.hc(iN, "latitude")) {

					min = min ? min : -90;
					max = max ? max : 90;

					if(
						!isNaN(iN.val()) && 
						iN.val() >= min && 
						iN.val() <= max
					) {
						this.fieldCorrect(iN);
					}
					else {
						this.fieldError(iN);
					}
				}
				if(u.hc(iN, "longitude")) {

					min = min ? min : -180;
					max = max ? max : 180;

					if(
						!isNaN(iN.val()) && 
						iN.val() >= min && 
						iN.val() <= max
					) {
						this.fieldCorrect(iN);
					}
					else {
						this.fieldError(iN);
					}
				}

				if(u.qsa(".correct", iN.field).length != 3) {
					u.rc(iN.field, "correct");
					u.ac(iN.field, "error");
				}

			}

			// files validation
			else if(u.hc(iN.field, "files")) {

				// min and max length
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 1;
				max = max ? max : 10000000;

				if(
					iN.val().length >= min && 
					iN.val().length <= max
				) {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}
		}


		// did validation result in error?
		if(u.hc(iN.field, "error")) {
			return false;
		}
		else {
			return true;
		}

	}





	// get params from form
	// optional parameters as object
	// type - any defined type.
	// - parameters - regular parameter string (default)
	// - json - json object based on input names with endless nesting
	// - optional local extension
	// ignore_inputs - input classnames to identify inputs to ignore, multiple classes can be | seperated (string is used as regular expression)
	this.getParams = function(form, settings) {


		// default values
		var send_as = "params";
		var ignore_inputs = "ignoreinput";

		// additional info passed to function as JSON object
		if(typeof(settings) == "object") {
			var argument;
			for(argument in settings) {

				switch(argument) {
					case "ignore_inputs"	: ignore_inputs		= settings[argument]; break;
					case "send_as"			: send_as			= settings[argument]; break;
				}

			}
		}

//		u.bug("send_as:" + send_as)

		// get inputs
		var i, input, select, textarea, param;

		// Object for found inputs/selects/textareas
		// if(window.FormData) {
		// 	u.bug("formdata");
		// 	var params = new FormData();
		// }
		// else {
			var params = new Object();
		// 	params.append = function(name, value, filename) {
		// 		this[name] = value;
		// 	}
		// }


		// add submit button to params if available
		if(form._submit_button && form._submit_button.name) {
			params[form._submit_button.name] = form._submit_button.value;
//			params.append(form._submit_button.name, form._submit_button.value);
		}

		var inputs = u.qsa("input", form);
		var selects = u.qsa("select", form)
		var textareas = u.qsa("textarea", form)

		for(i = 0; input = inputs[i]; i++) {
			// exclude specific inputs (defined by ignore_inputs)
			if(!u.hc(input, ignore_inputs)) {

				// if checkbox/radio and node is checked
				if((input.type == "checkbox" || input.type == "radio") && input.checked) {
					if(!this.isDefault(input)) {
						params[input.name] = input.value;
					}
//					params.append(input.name, input.value);
				}
				// file input
				else if(input.type == "file") {
//					u.bug("file:" + input.files[0]);
					if(!this.isDefault(input)) {
						params[input.name] = input.value;
					}
//					params.append(input.name, input.files[0], input.value);
				}

				// if anything but buttons and radio/checkboxes
				// - hidden, text, html5 input-types
				else if(!input.type.match(/button|submit|reset|file|checkbox|radio/i)) {

					if(!this.isDefault(input)) {
						params[input.name] = input.value;
					}
					// empty
					else {
						params[input.name] = "";
					}
//					params.append(input.name, input.value);
				}
			}
		}

		for(i = 0; select = selects[i]; i++) {
			// exclude specific inputs (defined by ignore_inputs)
			if(!u.hc(select, ignore_inputs)) {
				if(!this.isDefault(select)) {
					params[select.name] = select.options[select.selectedIndex].value;
				}
//				params.append(select.name, select.options[select.selectedIndex].value);
			}
		}

		for(i = 0; textarea = textareas[i]; i++) {
			// exclude specific inputs (defined by ignore_inputs)
			if(!u.hc(textarea, ignore_inputs)) {
				if(!this.isDefault(textarea)) {
					params[textarea.name] = textarea.value;
				}
				// empty
				else {
					params[textarea.name] = "";
				}
//				params.append(textarea.name, textarea.value);
			}
		}



		// look for local extension types
		if(send_as && typeof(this.customSend[send_as]) == "function") {
			return this.customSend[send_as](params, form);
		}
		// or use defaults

		// return as json object
		else if(send_as == "json") {

			// convert to JSON object
			return u.f.convertNamesToJsonObject(params);
		}

		// return as js object
		else if(send_as == "object") {

			return params;
		}

		// return as parameter string
		// send_as == "params" (or unknown send_as type)
		else {

//			u.xInObject(params);

			var string = "";
			for(param in params) {
//				u.bug("param:" + typeof(params[param]) + ", " + param)
//				if(typeof(params[param]) != "function") {
					string += (string ? "&" : "") + param + "=" + encodeURIComponent(params[param]);
//				}
			}
			return string;
		}

	}
}


// Convert param names to nested JSON object structure
u.f.convertNamesToJsonObject = function(params) {
 	var indexes, root, indexes_exsists, param;
	var object = new Object();

	// loop through params
	for(param in params) {

		// check for indexes
	 	indexes_exsists = param.match(/\[/);

		// indexes exsists
		if(indexes_exsists) {
			// get root object name
			root = param.split("[")[0];
			// get clean set of indexes
			indexes = param.replace(root, "");

			// first time using this root
			if(typeof(object[root]) == "undefined") {
// if index is numeric Array fucks up (this should work everywhere)
//				object[root] = new Array();
				object[root] = new Object();
			}
//			u.bug("indexes:" + indexes)

			// start recusive action to build object
			object[root] = this.recurseName(object[root], indexes, params[param]);
		}
		// no indexes - flat var
		else {
			object[param] = params[param];
		}
	}

	return object;
}

// recurse over input name
// object - abject at current level to recurse over
// indexes - remaining indexes string
// value - end value
u.f.recurseName = function(object, indexes, value) {

//	u.bug("recurseName with (" + indexes + ")");
//	u.bug("object to add to:");
//	u.bug(JSON.stringify(object));


	// get index from string
	var index = indexes.match(/\[([a-zA-Z0-9\-\_]+)\]/);
//	u.bug(index)
	var current_index = index[1];

	// update indexes
	indexes = indexes.replace(index[0], "");

	// still more indexes
 	if(indexes.match(/\[/)) {
//		u.bug("current index is " + current_index + " but there are more (" + indexes + ")")

		// object already an array
		if(object.length !== undefined) {
//			u.bug("object is array - look for (" + current_index + ")")

			var i;
			var added = false;

			// check if array already has matching key
			for(i = 0; i < object.length; i++) {
//				u.bug("loop through existing array:" + i)

				// loop through existing array
				for(exsiting_index in object[i]) {
//					u.bug("loop through objects in " + i +" looking for (" + current_index + ") found (" + exsiting_index + ")")

					// found matching key
					if(exsiting_index == current_index) {
//						u.bug("found matching key")

						// start recursive action
						object[i][exsiting_index] = this.recurseName(object[i][exsiting_index], indexes, value);

						// object has been added - need to remember to be able to add unidentified indexes
						added = true;
					}
				}
			}


			// if object is not added - then add as object (will be changed to array later if more occurences of same index)
			if(!added) {
//				u.bug("not added yet (" + current_index + ")");

				// create temp object to 
				temp = new Object();
				temp[current_index] = new Object();
				temp[current_index] = this.recurseName(temp[current_index], indexes, value);

//				u.bug("recurse returned:")
//				u.bug(JSON.stringify(temp));

				object.push(temp);
				
//				u.bug("adding temp object to object resulting in:")
//				u.bug(JSON.stringify(object));
			}
		}
		// index found - not array yet, created as object
		else if(typeof(object[current_index]) != "undefined") {
//			u.bug("not array yet:" + current_index)

			// continue with recursive action - if deeper levels require it object will be converted to array
			object[current_index] = this.recurseName(object[current_index], indexes, value);

		}
		// index not found - just add index:value as new object
		else {
//			u.bug("index not already defined:" + current_index);

			object[current_index] = new Object();
			object[current_index] = this.recurseName(object[current_index], indexes, value);
			
		}
	}
	// deepest level
	else {
//		u.bug("deepest level adding (" + current_index + ")")

		// no more indexes ... this must be a value, add object
		object[current_index] = value;

//		u.bug("value added resulting in:")
//		u.bug(JSON.stringify(object));
//		u.bug("no more")
	}

	return object;
}




/*
JS FORM BUILDING 
Still in debugging mode - to be included officially in v0.9
*/

/* Add new form element */
u.f.addForm = function(node, settings) {
u.bug("addform")
	
	// default values
	var form_name = "js_form";
	var form_action = "#";
	var form_method = "post";
	var form_class = "";

	// additional info passed to function as JSON object
	if(typeof(settings) == "object") {
		var argument;
		for(argument in settings) {

			switch(argument) {
				case "name"			: form_name				= settings[argument]; break;
				case "action"		: form_action			= settings[argument]; break;
				case "method"		: form_method			= settings[argument]; break;
				case "class"		: form_class			= settings[argument]; break;
			}

		}
	}

	var form = u.ae(node, "form", {"class":form_class, "name": form_name, "action":form_action, "method":form_method});
	return form;
}

u.f.addFieldset = function(node) {
	return u.ae(node, "fieldset");
}

u.f.addField = function(node, settings) {
	
	// default values
	var field_type = "string";
	var field_label = "Value";
	var field_name = "js_name";
	var field_value = "";
	var field_class = "";

	// additional info passed to function as JSON object
	if(typeof(settings) == "object") {
		var argument;
		for(argument in settings) {

			switch(argument) {
				case "type"			: field_type			= settings[argument]; break;
				case "label"		: field_label			= settings[argument]; break;
				case "name"			: field_name			= settings[argument]; break;
				case "value"		: field_value			= settings[argument]; break;
				case "class"		: field_class			= settings[argument]; break;
			}
		}
	}

	var input_id = "input_"+field_type+"_"+field_name;
	var field = u.ae(node, "div", {"class":"field "+field_type+" "+field_class});


	// TODO: add all field types
	if(field_type == "string") {
		var label = u.ae(field, "label", {"for":input_id, "html":field_label});
		var input = u.ae(field, "input", {"id":input_id, "value":field_value, "name":field_name, "type":"text"});
	}
	else if(field_type == "email" || field_type == "number" || field_type == "tel") {
		var label = u.ae(field, "label", {"for":input_id, "html":field_label});
		var input = u.ae(field, "input", {"id":input_id, "value":field_value, "name":field_name, "type":field_type});
	}
	else if(field_type == "select") {
		u.bug("Select not implemented yet")
	}
	else {
		u.bug("input type not implemented yet")
	}

	return field;
}

u.f.addAction = function(node, settings) {


	// default values
	var action_type = "submit";
	var action_name = "js_name";
	var action_value = "";
	var action_class = "";

	// additional info passed to function as JSON object
	if(typeof(settings) == "object") {
		var argument;
		for(argument in settings) {

			switch(argument) {
				case "type"			: action_type			= settings[argument]; break;
				case "name"			: action_name			= settings[argument]; break;
				case "value"		: action_value			= settings[argument]; break;
				case "class"		: action_class			= settings[argument]; break;
			}
		}
	}

	// find actions ul
	var p_ul = node.nodeName.toLowerCase() == "ul" ? node : u.pn(node, "ul");
	// check if ul is actions ul
	// if not, it should be created automatically
	if(!u.hc(p_ul, "actions")) {
		p_ul = u.ae(node, "ul", {"class":"actions"});
	}

	// check if action is injected into ul.actions li
	var p_li = node.nodeName.toLowerCase() == "li" ? node : u.pn(node, "li");
	// li should be directly in parent ul.actions
	if(p_ul != p_li.parentNode) {
		p_li = u.ae(p_ul, "li", {"class":action_name});
	}
	else {
		p_li = node;
	}

	var action = u.ae(p_li, "input", {"type":action_type, "class":action_class, "value":action_value, "name":action_name})

	return action;
}


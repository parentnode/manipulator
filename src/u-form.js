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
//		u.bug("init form")
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


			// TODO: Help element needs to be refined. 
			// Is currently semi positioned to iN element, but should be done better
			// positioning happens in this._blur, this._focus, this.fieldError
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

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// add to form index
					this.formIndex(form, field._input);
				}

				// textarea initialization
				else if(u.hc(field, "text")) {

					field._input = u.qs("textarea", field);
					field._input.field = field;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// add to form index
					this.formIndex(form, field._input);

					// resize textarea while typing
					if(u.hc(field, "autoexpand")) {
						this.autoExpand(field._input)
					}


				}

				// select initialization
				else if(u.hc(field, "select")) {

					field._input = u.qs("select", field);
					field._input.field = field;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// add to form index
					this.formIndex(form, field._input);
				}

				// checkbox/boolean (also checkbox) initialization
				else if(u.hc(field, "checkbox|boolean")) {

					field._input = u.qs("input[type=checkbox]", field);
					field._input.field = field;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// add to form index
					this.formIndex(form, field._input);
				}

				// radio button initialization
				else if(u.hc(field, "radio|radio_buttons")) {

					field._input = u.qsa("input", field);
					for(j = 0; input = field._input[j]; j++) {
						input.field = field;

						// get input label
						input._label = u.qs("label[for="+input.id+"]", field);

						// add to form index
						this.formIndex(form, input);
					}
				}

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

				// file input initialization
				else if(u.hc(field, "files")) {

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
				u.bug("valid pure button form found")

				// get action input-button/a
				var input = u.qs("input,a", form);

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

				iN.val = this._value;

				u.e.addEvent(iN, "keyup", this._updated);
				u.e.addEvent(iN, "change", this._changed);

			}
			// select
			else if(iN.nodeName.match(/select/i)) {

				iN.val = this._value_select;

				u.e.addEvent(iN, "change", this._updated);
				u.e.addEvent(iN, "keyup", this._updated);
				u.e.addEvent(iN, "change", this._changed);
			}
			// type=checkbox
			else if(iN.type && iN.type.match(/checkbox/)) {

				iN.val = this._value_checkbox;

				// special setting for IE8 and less (bad onchange handler)
				if(u.browser("explorer", "<=8")) {
					iN.pre_state = iN.checked;
					iN._changed = u.f._changed;
					iN._updated = u.f._updated;
					iN._clicked = function(event) {
						if(this.checked != this.pre_state) {
							this._changed(window.event);
							this._updated(window.event);
						}
						this.pre_state = this.checked;
					}
					u.e.addEvent(iN, "click", iN._clicked);

				}
				else {
					u.e.addEvent(iN, "change", this._updated);
					u.e.addEvent(iN, "change", this._changed);
				}

				// submit on enter (checks for autocomplete etc)
				this.inputOnEnter(iN);
			}
			// type=radio
			else if(iN.type && iN.type.match(/radio/)) {
			
				iN.val = this._value_radio;

				// special setting for IE8 and less (bad onchange handler)
				if(u.browser("explorer", "<=8")) {
					iN.pre_state = iN.checked;
					iN._changed = u.f._changed;
					iN._updated = u.f._updated;
					iN._clicked = function(event) {
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
					u.e.addEvent(iN, "click", iN._clicked);
				}
				else {
					u.e.addEvent(iN, "change", this._updated);
					u.e.addEvent(iN, "change", this._changed);
				}

				// submit on enter (checks for autocomplete etc)
				this.inputOnEnter(iN);
			}
			// type=file
			else if(iN.type && iN.type.match(/file/)) {

				iN.val = function(value) {
					if(value !== undefined) {
						alert('adding values manually to input type="file" is not supported')
					}
					else {
						var i, file, files = [];
						for(i = 0; file = this.files[i]; i++) {
							files.push(file);
						}
						return files.join(",");
					}
				}

				u.e.addEvent(iN, "keyup", this._updated);
				u.e.addEvent(iN, "change", this._changed);

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

	// internal focus handler - attatched to inputs
	this._focus = function(event) {
		this.field.focused = true;
		u.ac(this.field, "focus");
		u.ac(this, "focus");

		u.as(this.field, "zIndex", 99);

		// is help element available, then position it appropriately to input
		if(this.field._help) {
			var f_h =  this.field.offsetHeight;
			var f_p_t = parseInt(u.gcs(this.field, "padding-top"));
			var f_p_b = parseInt(u.gcs(this.field, "padding-bottom"));
			var f_h_h = this.field._help.offsetHeight;

			// u.bug("((" + f_h + " - (" + f_p_t + "+" + f_p_b + ")) / 2) + 2 = " + (((f_h - (f_p_t + f_p_b)) / 2) + 2));
			// u.bug("(" + (((f_h - (f_p_t + f_p_b)) / 2) + 2) + ")" + " - " + "(" + (f_h_h / 2) + ")");

			u.as(this.field._help, "top", (((f_h - (f_p_t + f_p_b)) / 2) + 2) - (f_h_h / 2) + "px");
		}


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
		if(this.field._help) {
			u.as(this.field._help, "top", ((this.offsetTop + this.offsetHeight/2 + 2) - (this.field._help.offsetHeight/2)) + "px")
		}


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
			if(iN.field._help) {
				u.as(iN.field._help, "top", ((iN.offsetTop + iN.offsetHeight/2 + 2) - (iN.field._help.offsetHeight/2)) + "px")
			}

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
			u.bug("iN.setHeight:" + u.nodeId(this));

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


	// inject GeoLocation button in location field
	this.geoLocation = function(field) {
		u.ac(field, "geolocation");

		var bn_geolocation = u.ae(field, "div", {"class":"geolocation"});
		bn_geolocation.field = field;
		u.ce(bn_geolocation);


		bn_geolocation.clicked = function() {

			window._geoLocationField = this.field;

			window._foundLocation = function(position) {
				var lat = position.coords.latitude;
				var lon = position.coords.longitude;

				var lat_input = u.qs("div.latitude input", window._geolocationField);
				var lon_input = u.qs("div.longitude input", window._geolocationField);

				lat_input.val(lat);
				lat_input.focus();
				lon_input.val(lon);
				lon_input.focus();
			}

			// Location error
			window._noLocation = function() {
				alert('Could not find location');
			}

			navigator.geolocation.getCurrentPosition(window._foundLocation, window._noLocation);

		}
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

				u.bug("files:" + iN.files.length);

				if(
					1
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


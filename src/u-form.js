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

			var error_message = field.getAttribute("data-error");
			if(error_message) {
				u.ae(field, "div", {"class":"error", "html":error_message})
			}

			// get input label, hint and error
			field._label = u.qs("label", field);
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
				if(u.hc(field, "string|email|tel|numeric|integer|password")) {

					field._input = u.qs("input", field);
					field._input.field = field;

					// add to form index
					this.formIndex(form, field._input);
				}
				// textarea initialization
				else if(u.hc(field, "text")) {

					field._input = u.qs("textarea", field);
					field._input.field = field;

					// add to form index
					this.formIndex(form, field._input);
				}
				// select initialization
				else if(u.hc(field, "select")) {

					field._input = u.qs("select", field);
					field._input.field = field;

					// add to form index
					this.formIndex(form, field._input);
				}
				// checkbox/boolean (also checkbox) initialization
				else if(u.hc(field, "checkbox|boolean")) {

					field._input = u.qs("input[type=checkbox]", field);
					field._input.field = field;

					// add to form index
					this.formIndex(form, field._input);
				}

				// radio button initialization
				else if(u.hc(field, "radio|radio_buttons")) {

					field._input = u.qsa("input", field);
					for(j = 0; input = field._input[j]; j++) {
						input.field = field;

						// add to form index
						this.formIndex(form, input);
					}
				}
				// date field initialization
				else if(u.hc(field, "date")) {

					field._input = u.qsa("select,input", field);
					for(j = 0; input = field._input[j]; j++) {
						input.field = field;

						// add to form index
						this.formIndex(form, input);
					}
				}
				// file input initialization
				else if(u.hc(field, "file")) {

					field._input = u.qs("input", field);
					field._input.field = field;

					// add to form index
					this.formIndex(form, field._input);
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


		// get all actions
		var actions = u.qsa(".actions li", form);
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
						this.form._submit(event);
					}
				}
			}

			// handle [ENTER] on button
			this.buttonOnEnter(action._input);

			// activate button, adding focus and blur
			this.activateButton(action._input);

			// add to actions index if button has a name
			if(action._input.name && action._input.name) {
				form.actions[action._input.name] = action._input;
			}

			// shortcuts - BETA
//			u.bug("shortcut: "+ u.hc(action._input, "key:[a-z0-9]+"));
			if(typeof(u.e.k) == "object" && u.hc(action._input, "key:[a-z0-9]+")) {
				u.e.k.addShortcut(u.cv(action._input, "key"), action._input);
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

				// store submit info
				this.form.submitInput = this;
				// delete any previous submit info
				this.form.submitButton = false;

				// internal submit
				this.form._submit(event);
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
	this.formIndex = function(form, node) {
//		u.bug("formIndex:" + u.nodeId(node) + ", " + node.field + ", " + node.name)

		// know position in field-order (tab index)
		// TODO: tabindex contains fields only - could be separated to contain both inputs and buttons
		node.tab_index = form.tab_order.length;
		form.tab_order[node.tab_index] = node;

		if(node.field && node.name) {
			form.fields[node.name] = node;

			// input
			if(node.nodeName.match(/input/i) && node.type && node.type.match(/text|email|number|password/)) {

				node.val = this._value;

				u.e.addEvent(node, "keyup", this._updated);
				u.e.addEvent(node, "change", this._changed);

				// submit on enter (checks for autocomplete etc)
				this.inputOnEnter(node);
			}
			// textarea
			else if(node.nodeName.match(/textarea/i)) {

				node.val = this._value;

				u.e.addEvent(node, "keyup", this._updated);
				u.e.addEvent(node, "change", this._changed);

				// resize textarea while typing
				if(u.hc(node.field, "autoexpand")) {

					// no scrollbars on auto expanded fields
					u.as(node, "overflow", "hidden");

					// get textarea height value offset - webkit and IE/Opera scrollHeight differs from height
					// implenting different solutions is the only way to achive similar behaviour across browsers
					// fallback support is Mozilla 

					node.autoexpand_offset = 0;
					if(parseInt(u.gcs(node, "height")) != node.scrollHeight) {
						node.autoexpand_offset = node.scrollHeight - parseInt(u.gcs(node, "height"));
					}

					// set correct height
					node.setHeight = function() {
						var textarea_height = parseInt(u.gcs(this, "height"));

						if(this.value) {
							if(u.browser("webkit")) {
								if(this.scrollHeight - this.autoexpand_offset > textarea_height) {
									u.a.setHeight(this, this.scrollHeight);
								}
							}
							else if(u.browser("opera") || u.browser("explorer")) {
								if(this.scrollHeight > textarea_height) {
									u.a.setHeight(this, this.scrollHeight);
								}
							}
							else {
								u.a.setHeight(this, this.scrollHeight);
							}
						}
					}
					u.e.addEvent(node, "keyup", node.setHeight);
				}
			}
			// select
			else if(node.nodeName.match(/select/i)) {

				node.val = this._value_select;

				u.e.addEvent(node, "change", this._updated);
				u.e.addEvent(node, "keyup", this._updated);
				u.e.addEvent(node, "change", this._changed);
			}
			// type=checkbox
			else if(node.type && node.type.match(/checkbox/)) {

				node.val = this._value_checkbox;

				// special setting for IE8 and less (bad onchange handler)
				if(u.browser("explorer", "<=8")) {
					node.pre_state = node.checked;
					node._changed = u.f._changed;
					node._updated = u.f._updated;
					node._clicked = function(event) {
						if(this.checked != this.pre_state) {
							this._changed(window.event);
							this._updated(window.event);
						}
						this.pre_state = this.checked;
					}
					u.e.addEvent(node, "click", node._clicked);

				}
				else {
					u.e.addEvent(node, "change", this._updated);
					u.e.addEvent(node, "change", this._changed);
				}

				// submit on enter (checks for autocomplete etc)
				this.inputOnEnter(node);
			}
			// type=radio
			else if(node.type && node.type.match(/radio/)) {
			
				node.val = this._value_radio;

				// special setting for IE8 and less (bad onchange handler)
				if(u.browser("explorer", "<=8")) {
					node.pre_state = node.checked;
					node._changed = u.f._changed;
					node._updated = u.f._updated;
					node._clicked = function(event) {
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
					u.e.addEvent(node, "click", node._clicked);
				}
				else {
					u.e.addEvent(node, "change", this._updated);
					u.e.addEvent(node, "change", this._changed);
				}

				// submit on enter (checks for autocomplete etc)
				this.inputOnEnter(node);
			}
			// type=file
			else if(node.type && node.type.match(/file/)) {

				u.e.addEvent(node, "keyup", this._updated);
				u.e.addEvent(node, "change", this._changed);

			}


			// activate field
			this.activateField(node);

			// validate field now
			this.validate(node);
		}
	}

	// input is changed (onchange event)
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

	// input is updated (onkeyup event)
	this._updated = function(event) {
//		u.bug("value updated:" + this.name + ":" + event.type + ":" + u.nodeId(event.srcElement));

		// if key is not [TAB], [ENTER], [SHIFT], [CTRL], [ALT]
		if(event.keyCode != 9 && event.keyCode != 13 && event.keyCode != 16 && event.keyCode != 17 && event.keyCode != 18) {
//			u.bug("update:" + event.keyCode);

			// only validate onkeyup if field has been used before or already contains error
			if(this.used || u.hc(this.field, "error")) {
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

	// validate input (event handler)
	this._validate = function() {
		u.f.validate(this);
	}

	// internal submit handler
	this._submit = function(event, input) {

		// do pre validation of all fields
		for(name in this.fields) {
			if(this.fields[name].field) {
//				u.bug("field:" + name);
				// change used state for input
				this.fields[name].used = true;
				// validate
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
				this.submitted(input);
			}
			// actual submit
			else {
				this.submit();
			}
		}
	}


	// activate input - add focus and blur events
	this.activateField = function(input) {

		this._focus = function(event) {
			this.field.focused = true;
			u.ac(this.field, "focus");
			u.ac(this, "focus");

			if(typeof(this.focused) == "function") {
				this.focused();
			}

			if(typeof(this.form.focused) == "function") {
				this.form.focused(this);
			}
		}

		this._blur = function(event) {
			this.field.focused = false;
			u.rc(this.field, "focus");
			u.rc(this, "focus");

			// field has been interacted with
			this.used = true;


			if(typeof(this.blurred) == "function") {
				this.blurred();
			}
			if(typeof(this.form.blurred) == "function") {
				this.form.blurred(this);
			}
		}

		u.e.addEvent(input, "focus", this._focus);
		u.e.addEvent(input, "blur", this._blur);

		// validate on field blur
		u.e.addEvent(input, "blur", this._validate);

	}

	// activate button - add focus and blur events
	this.activateButton = function(button) {

		this._button_focus = function(event) {
			u.ac(this, "focus");

			if(typeof(this.focused) == "function") {
				this.focused();
			}

			if(typeof(this.form.focused) == "function") {
				this.form.focused(this);
			}
		}

		this._button_blur = function(event) {
			u.rc(this, "focus");

			if(typeof(this.blurred) == "function") {
				this.blurred();
			}
			if(typeof(this.form.blurred) == "function") {
				this.form.blurred(this);
			}
		}

		u.e.addEvent(button, "focus", this._button_focus);
		u.e.addEvent(button, "blur", this._button_blur);
	}


	// check if input value is default value
	this.isDefault = function(input) {
		if(input.field.default_value && input.val() == iN.field.default_value) {
			return true;
		}
		return false;
	}

	// field has error - decide whether it is reasonable to show it or not
	this.fieldError = function(input) {
//		u.bug("error:" + input.name);
		u.rc(input, "correct");
		u.rc(input.field, "correct");

		// do not add visual feedback until field has been used by user - or if it contains value (reloads)
		if(input.used || !this.isDefault(input) && input.val()) {
//			u.bug("ready for error state")
			u.ac(input, "error");
			u.ac(input.field, "error");

			// input validation failed
			if(typeof(input.validationFailed) == "function") {
				input.validationFailed();
			}

		}
	}

	// field is correct - decide whether to show it or not
	this.fieldCorrect = function(input) {
//		u.bug("correct:" + input.name);

		// does field have value? Non-required fields can be empty - but should not have visual validation
		if(!this.isDefault(input) && input.val()) {
//			u.bug("ready for correct state")
			u.ac(input, "correct");
			u.ac(input.field, "correct");
			u.rc(input, "error");
			u.rc(input.field, "error");
		}
		// remove visual validation on empty fields
		else {
//			u.bug("not ready for correct state")
			u.rc(input, "correct");
			u.rc(input.field, "correct");
			u.rc(input, "error");
			u.rc(input.field, "error");
		}
	}



	// validate input
	// - numeric
	// - integer
	// - tel
	// - email
	// - text
	// - select
	// - radio
	// - checkbox|boolean
	// - password
	// - string
	//
	this.validate = function(input) {
//		u.bug("validate:" + iN.name)
		var min, max;
		var not_validated = true;


		// loop through custom validations
		var custom_validate;
		for(custom_validate in u.f.customValidate) {
			if(u.hc(input.field, custom_validate)) {
				u.f.customValidate[custom_validate](input);
				not_validated = false;
			}
		}

		// still not validated?
		if(not_validated) {
			// password validation
			if(u.hc(input.field, "password")) {

				// min and max length
				min = Number(u.cv(input.field, "min"));
				max = Number(u.cv(input.field, "max"));
				min = min ? min : 8;
				max = max ? max : 20;

				if((input.value.length >= min && input.value.length <= max && !this.isDefault(input)) || (!u.hc(input.field, "required") && !input.value)) {
					this.fieldCorrect(input);
				}
				else {
					this.fieldError(input);
				}
			}

			// number validation
			else if(u.hc(input.field, "numeric")) {

				// min and max length
				min = Number(u.cv(input.field, "min"));
				max = Number(u.cv(input.field, "max"));
				min = min ? min : 0;
				max = max ? max : 99999999999999999999999999999;

				if((input.value && !isNaN(input.value) && input.value >= min && input.value <= max && !this.isDefault(input)) || (!u.hc(input.field, "required") && !input.value)) {
					this.fieldCorrect(input);
				}
				else {
					this.fieldError(input);
				}
			}

			// integer validation
			else if(u.hc(input.field, "integer")) {

				// min and max length
				min = Number(u.cv(input.field, "min"));
				max = Number(u.cv(input.field, "max"));
				min = min ? min : 0;
				max = max ? max : 99999999999999999999999999999;

				if((input.value && !isNaN(input.value) && Math.round(input.value) == input.value && input.value >= min && input.value <= max && !this.isDefault(input)) || (!u.hc(input.field, "required") && !input.value)) {
					this.fieldCorrect(input);
				}
				else {
					this.fieldError(input);
				}
			}

			// telephone validation
			else if(u.hc(input.field, "tel")) {

				if((input.value.match(/^([\+0-9\-\.\s\(\)]){5,16}$/) && !this.isDefault(input)) || (!u.hc(input.field, "required") && !input.value)) {
					this.fieldCorrect(input);
				}
				else {
					this.fieldError(input);
				}
			}

			// email validation
			else if(u.hc(input.field, "email")) {

				if((input.value.match(/^([^<>\\\/%$])+\@([^<>\\\/%$])+\.([^<>\\\/%$]{2,20})$/) && !this.isDefault(input)) || (!u.hc(input.field, "required") && !input.value)) {
					this.fieldCorrect(input);
				}
				else {
					this.fieldError(input);
				}
			}

			// text validation
			else if(u.hc(input.field, "text")) {

				// min and max length
				min = Number(u.cv(input.field, "min"));
				max = Number(u.cv(input.field, "max"));
				min = min ? min : 1;
				max = max ? max : 10000000;

				if((input.value.length >= min && input.value.length <= max && !this.isDefault(input)) || (!u.hc(input.field, "required") && !input.value)) {
					this.fieldCorrect(input);
				}
				else {
					this.fieldError(input);
				}
			}

			// select validation
			else if(u.hc(input.field, "select")) {

				if(input.val() != "" || !u.hc(input.field, "required")) {
					this.fieldCorrect(input);
				}
				else {
					this.fieldError(input);
				}
			}

			// checkbox/radio validation
			else if(u.hc(input.field, "checkbox|boolean|radio|radio_buttons")) {

				if(input.val() != "" || !u.hc(input.field, "required")) {
					this.fieldCorrect(input);
				}
				else {
					this.fieldError(input);
				}
			}
			// string validation (has been known to exist on other types, so leave it last giving other types precedence)
			else if(u.hc(input.field, "string")) {

				// min and max length
				min = Number(u.cv(input.field, "min"));
				max = Number(u.cv(input.field, "max"));
				min = min ? min : 1;
				max = max ? max : 10000000;

				if((input.value.length >= min && input.value.length <= max && !this.isDefault(input)) || (!u.hc(input.field, "required") && !input.value)) {
					this.fieldCorrect(input);
				}
				else {
					this.fieldError(input);
				}
			}
		}


		// did validation result in error?
		if(u.hc(input.field, "error")) {
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
					params[input.name] = input.value;
//					params.append(input.name, input.value);
				}
				// file input
				else if(input.type == "file") {
//					u.bug("file:" + input.files[0]);
					params[input.name] = input.value;
//					params.append(input.name, input.files[0], input.value);
				}

				// if anything but buttons and radio/checkboxes
				// - hidden, text, html5 input-types
				else if(!input.type.match(/button|submit|reset|file|checkbox|radio/i)) {
					params[input.name] = input.value;
//					params.append(input.name, input.value);
				}
			}
		}

		for(i = 0; select = selects[i]; i++) {
			// exclude specific inputs (defined by ignore_inputs)
			if(!u.hc(select, ignore_inputs)) {
				params[select.name] = select.options[select.selectedIndex].value;
//				params.append(select.name, select.options[select.selectedIndex].value);
			}
		}

		for(i = 0; textarea = textareas[i]; i++) {
			// exclude specific inputs (defined by ignore_inputs)
			if(!u.hc(textarea, ignore_inputs)) {
				params[textarea.name] = textarea.value;
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
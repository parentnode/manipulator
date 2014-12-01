Util.Form = u.f = new function() {

	// create extension object
	// this is used to add custom init, validate and send methods to the form module
	this.customInit = {};
	this.customValidate = {};
	this.customSend = {};



	// extensive activation of form
	// indexes fields and actions (inputs and buttons)
	// - adds realtime validation, by settng correct/error classname
	// - sets focus classname on field focus
	// - adds callback
	this.init = function(form, _options) {
//		u.bug("init form:" + u.nodeId(form));

		var i, j, field, action, input, hidden_field;


		// Default values

		// field focus z-index
		form._focus_z_index = 50;

		// validate fields continuously and when submitting
		form._validation = true;

		// u.bug list form.fields and form.actions
		form._debug_init = false;

		// additional info passed to function as JSON object
		if(typeof(_options) == "object") {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {

					case "validation"       : form._validation      = _options[_argument]; break;
					case "focus_z"          : form._focus_z_index   = _options[_argument]; break;

					case "debug"            : form._debug_init      = _options[_argument]; break;
				}
			}
		}

		// disable regular form submit
		form.onsubmit = function(event) {return false;}

		// do not use HTML5 validation
		// we'll do all validation internally
		form.setAttribute("novalidate", "novalidate");

		// set submit reference to internal submit handler
		// but keep reference to DOM submot
		form.DOMsubmit = form.submit;
		form.submit = this._submit;


		// objects for fields and actions
		// all named fields and buttons can be accessed through this objects
		form.fields = {};
		form.actions = {};


		// Label styles - defines special handling of label values
		// specified via form classname as labelstyle:inject
		// Currently implemented: none or inject
		form.labelstyle = u.cv(form, "labelstyle");


		// get all fields
		var fields = u.qsa(".field", form);
		for(i = 0; field = fields[i]; i++) {
//			u.bug("field found:" + u.nodeId(field))


			// get field original z-index
			field._base_z_index = u.gcs(field, "z-index");


			// find help (hints and errors)
			field._help = u.qs(".help", field);
			field._hint = u.qs(".hint", field);
			field._error = u.qs(".error", field);


			// Implementing support for non-manipulator system HTML output
			// This allows for Manipulator form to run on HTML output which cannot be fine-tuned serverside
			if(typeof(u.f.fixFieldHTML) == "function") {
				u.f.fixFieldHTML(field);
			}


			// Add required indicator (for showing icons)
			field._indicator = u.ae(field, "div", {"class":"indicator"});


			// setup field status
			field._initialized = false;


			// check for custom inits
			// allows to overwrite any field type or built custom field types
			var custom_init;
			for(custom_init in this.customInit) {
				if(field.className.match(custom_init)) {
					this.customInit[custom_init](field);
					field._initialized = true;
				}
			}


			// do not perform other inits if custom init was executed
			if(!field._initialized) {


				// regular inputs initialization
				if(u.hc(field, "string|email|tel|number|integer|password|date|datetime")) {

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

					// activate input
					this.activateInput(field._input);

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

					// resize textarea while typing
					if(u.hc(field, "autoexpand")) {
						this.autoExpand(field._input);
					}

					// change/update events
					u.e.addEvent(field._input, "keyup", this._updated);
					u.e.addEvent(field._input, "change", this._changed);

					// activate input
					this.activateInput(field._input);

					// validate field now
					this.validate(field._input);

				}

				// HTML editor initialization
				else if(u.hc(field, "html")) {

					field._input = u.qs("textarea", field);
					field._input.field = field;

					// add input to fields array
					form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for="+field._input.id+"]", field);

					// get/set value function
					field._input.val = this._value;

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

					// activate input
					this.activateInput(field._input);

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
						field._input._update_checkbox_field = this._update_checkbox_field;
						field._input._clicked = function(event) {
							if(this.checked != this.pre_state) {
								this._changed(window.event);
								this._updated(window.event);
								this._update_checkbox_field(window.event);
							}
							this.pre_state = this.checked;
						}
						u.e.addEvent(field._input, "click", field._input._clicked);

					}
					else {
						// opposite order of elsewhere to ensure instant validation
						u.e.addEvent(field._input, "change", this._changed);
						u.e.addEvent(field._input, "change", this._updated);
						u.e.addEvent(field._input, "change", this._update_checkbox_field);
					}

					// submit on enter (checks for autocomplete etc)
					this.inputOnEnter(field._input);

					// activate input
					this.activateInput(field._input);

					// validate field now
					this.validate(field._input);
				}

				// radio button initialization
				else if(u.hc(field, "radiobuttons")) {

					// Radio buttons are tricky, because there are multiple inputs but only one name
					// field input reference points to first radio button
					// Requires some extra checks, which are built into all event handlers

					// get all inputs
					field._inputs = u.qsa("input", field);

					// use first input as field input 
					field._input = field._inputs[0];

					// add first input to fields array (radios all have same name)
					form.fields[field._input.name] = field._input;

					// initalize individual radio buttons
					for(j = 0; input = field._inputs[j]; j++) {
						input.field = field;

						// get input label
						input._label = u.qs("label[for="+input.id+"]", field);

						// get/set value function
						input.val = this._value_radiobutton;

						// special setting for IE8 and less (bad onchange handler)
						if(u.browser("explorer", "<=8")) {
							input.pre_state = input.checked;
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
							u.e.addEvent(input, "change", this._changed);
							u.e.addEvent(input, "change", this._updated);
						}

						// submit on enter (checks for autocomplete etc)
						this.inputOnEnter(input);

						// activate input
						this.activateInput(input);
					}

					// validate field now
					this.validate(field._input);
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

				// location field initialization
				else if(u.hc(field, "location")) {

					// Location is a multi input field
					// location, latitude and longitude

					// get all inputs
					field._inputs = u.qsa("input", field);

					// use first input as field input 
					field._input = field._inputs[0];

					for(j = 0; input = field._inputs[j]; j++) {
						input.field = field;

						// add input to fields array
						form.fields[input.name] = input;

						// get input label
						input._label = u.qs("label[for="+input.id+"]", field);


						// get/set value function
						input.val = this._value;

						// change/update events
						u.e.addEvent(input, "keyup", this._updated);
						u.e.addEvent(input, "change", this._changed);

						// submit on enter (checks for autocomplete etc)
						this.inputOnEnter(input);

						// activate input
						this.activateInput(input);
					}

					// inject Geolocation button if browser supports geolocation
					if(navigator.geolocation) {
						this.geoLocation(field);
					}

					// validate field now
					this.validate(field._input);

				}



				// when these gets extended they should end up as custom initializers


				// tags initialization (standard Janitor implementation)
				// currently identical to string - but keep separate for customization
				else if(u.hc(field, "tags")) {

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

					// activate input
					this.activateInput(field._input);

					// validate field now
					this.validate(field._input);
				}


				// prices initialization (standard Janitor implementation)
				// currently identical to string - but keep separate for customization
				else if(u.hc(field, "prices")) {

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

					// activate input
					this.activateInput(field._input);

					// validate field now
					this.validate(field._input);
				}


				// UNKNOWN FIELD
				// Give developer a fair chance of finding it
				else {
					u.bug("UNKNOWN FIELD IN FORM INITIALIZATION:" + u.nodeId(field));
				}
			}
		}


		// reference hidden fields to allow accessing them through form fields array
		var hidden_fields = u.qsa("input[type=hidden]", form);
		for(i = 0; hidden_field = hidden_fields[i]; i++) {

			// do not overwrite fields index with hidden field
			if(!form.fields[hidden_field.name]) {
				form.fields[hidden_field.name] = hidden_field;

				// add get/set value funtion
				hidden_field.val = this._value;
			}
		}


		// get all actions
		var actions = u.qsa(".actions li input[type=button],.actions li input[type=submit],.actions li a.button", form);
		for(i = 0; action = actions[i]; i++) {

			// make sure even a.buttons knows form
			action.form = form;

			// activate button, adding focus and blur
			this.activateButton(action);

		}


		// u.bug list of fields and actions
		if(form._debug_init) {
			u.bug(u.nodeId(form) + ", fields:");
			u.xInObject(form.fields);
			u.bug(u.nodeId(form) + ", actions:");
			u.xInObject(form.actions);
		}

	}



	// Submit
//	u.bug("fisk")
	// internal submit handler - attatched to form as form.submit
	// original form.submit will be available as form.DOMsubmit
	this._submit = function(event, iN) {

//		u.bug("_submitted:" + this._validation)

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
				this.DOMsubmit();
			}
		}
	}



	// Cross type get/set value functions 

	// value get/setter for regular inputs
	this._value = function(value) {

		// only return value if no value is passed (value could be false or 0)
		if(value !== undefined) {
			this.value = value;

			// if actual value, remove default state
			if(value !== this.default_value) {

				u.rc(this, "default");

				// if input has pseudolabel, hide it
				if(this.pseudolabel) {
					u.as(this.pseudolabel, "display", "none");
				}

			}

//			u.bug("validate from set value:" + u.nodeId(this) + ", " + value + ", " + this.value)

			// validate after setting value
			u.f.validate(this);
		}
		return (this.value != this.default_value) ? this.value : "";
	}
	// value get/setter for radio buttons
	this._value_radiobutton = function(value) {
		var i, option;

		// only return value if no value is passed (value could be false or 0)
		if(value !== undefined) {

			// find option with matching value
			for(i = 0; option = this.form[this.name][i]; i++) {

				// finding it not unlikely that radio value could be strings "true"/"false"
				// compensate for forgetting the string aspect of true/false
				if(option.value == value || (option.value == "true" && value) || (option.value == "false" && value === false)) {
					option.checked = true;

					// validate after setting value
					u.f.validate(this);
				}
			}
		}
		// find checked option
		else {
			for(i = 0; option = this.form[this.name][i]; i++) {
				if(option.checked) {
					return option.value;
				}
			}
		}
		return "";
	}
	// value get/setter for checkbox inputs
	this._value_checkbox = function(value) {

		// only return value if no value is passed (value could be false or 0)
		if(value !== undefined) {
			if(value) {
				this.checked = true
				u.ac(this.field, "checked");
			}
			else {
				this.checked = false;
				u.rc(this.field, "checked");
			}

			// validate after setting value
			u.f.validate(this);
		}
		else {
			if(this.checked) {
				return this.value;
			}
		}
		return "";
	}
	// value get/setter for seelcts
	this._value_select = function(value) {

		// only return value if no value is passed (value could be false or 0)
		if(value !== undefined) {

			var i, option;
			// find option with matching value option
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
			return this.default_value != this.options[this.selectedIndex].value ? this.options[this.selectedIndex].value : "";
		}
	}



	// [ENTER] handling

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
				this.form.submit(event, this);
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
				this.form.submit(event);
			}
		}

		u.e.addEvent(node, "keydown", node.keyPressed);
	}



	// Event handlers

	// internal - input is changed (onchange event) - attached to input
	this._changed = function(event) {
//		u.bug("value changed:" + this.name + ":" + event.type + ":" + u.nodeId(event.srcElement));

		// input cannot be changed without being used (selects in particular)
		this.used = true;


		// callbacks
		// does input have callback
		if(typeof(this.changed) == "function") {
			this.changed(this);
		}
		// certain fields with multiple input will have callback declared on first input only
		// like radio buttons
		else if(this.field._input && typeof(this.field._input.changed) == "function") {
			this.field._input.changed(this);
		}

		// does form have callback declared
		if(typeof(this.form.changed) == "function") {
			this.form.changed(this);
		}
	}
	// internal - input is updated (onkeyup event) - attached to input
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
			// does input have callback
			if(typeof(this.updated) == "function") {
				this.updated(this);
			}
			// certain fields with multiple input will have callback declared on first input only
			// like radio buttons
			else if(this.field._input && typeof(this.field._input.updated) == "function") {
				this.field._input.updated(this);
			}

			// does form have callback declared
			if(typeof(this.form.updated) == "function") {
				this.form.updated(this);
			}
		}

	}

	// internal - checkbox is changed - update field state (for fake checkboxes)
	this._update_checkbox_field = function(event) {
		if(this.checked) {
			u.ac(this.field, "checked");
		}
		else {
			u.rc(this.field, "checked");
		}
	}

	// internal - validate input (event handler) - attached to input
	this._validate = function(event) {
//		u.bug("validate from _validate")
		u.f.validate(this);
	}

	// internal - mouseenter handler - attatched to inputs
	this._mouseenter = function(event) {
//		u.bug("this._mouseenter:" + u.nodeId(this.field));
		u.ac(this.field, "hover");
		u.ac(this, "hover");

		// in case of overlapping hint/errors, make sure this one is on top
		u.as(this.field, "zIndex", this.field._input.form._focus_z_index);

		// is help element available, then position it appropriately to input
		u.f.positionHint(this.field);
	}
	// internal - mouseleave handler - attatched to inputs
	this._mouseleave = function(event) {
//		u.bug("this._mouseleave:" + u.nodeId(this.field));
		u.rc(this.field, "hover");
		u.rc(this, "hover");

		// in case of overlapping hint/errors, make sure this one drops back down
		u.as(this.field, "zIndex", this.field._base_z_index);

		// is help element available, then position it appropriately to input
		// it might still be shown, is error has occured
		u.f.positionHint(this.field);
	}

	// internal focus handler - attatched to inputs
	this._focus = function(event) {
//		u.bug("this._focus:" + u.nodeId(this))

		this.field.focused = true;
		this.focused = true;

		u.ac(this.field, "focus");
		u.ac(this, "focus");

		// make sure field goes all the way in front - hint/error must be seen
		u.as(this.field, "zIndex", this.form._focus_z_index);

		// is help element available, then position it appropriately to input
		u.f.positionHint(this.field);


		// callbacks
		// does input have callback
		if(typeof(this.focused) == "function") {
			this.focused();
		}
		// certain fields with multiple input will have callback declared on first input only
		// like radio buttons
		else if(this.field._input && typeof(this.field._input.focused) == "function") {
			this.field._input.focused(this);
		}

		// does form have callback declared
		if(typeof(this.form.focused) == "function") {
			this.form.focused(this);
		}
	}
	// internal blur handler - attatched to inputs
	this._blur = function(event) {
//		u.bug("this._blur:" + u.nodeId(this))

		this.field.focused = false;
		this.focused = false;

		u.rc(this.field, "focus");
		u.rc(this, "focus");

		// drop back to base z-index
		u.as(this.field, "zIndex", this.field._base_z_index);

		// is help element available, then position it appropriately to input
		// it might still be shown, is error has occured
		u.f.positionHint(this.field);

		// field has been interacted with (content can now be validated)
		this.used = true;


		// callbacks
		// does input have callback
		if(typeof(this.blurred) == "function") {
			this.blurred();
		}
		// certain fields with multiple input will have callback declared on first input only
		// like radio buttons
		else if(this.field._input && typeof(this.field._input.blurred) == "function") {
			this.field._input.blurred(this);
		}

		// does form have callback declared
		if(typeof(this.form.blurred) == "function") {
			this.form.blurred(this);
		}
	}

	// internal blur handler - attatched to buttons
	this._button_focus = function(event) {
		u.ac(this, "focus");

		// callbacks
		// does button have callback
		if(typeof(this.focused) == "function") {
			this.focused();
		}

		// does form have callback
		if(typeof(this.form.focused) == "function") {
			this.form.focused(this);
		}
	}
	// internal blur handler - attatched to buttons
	this._button_blur = function(event) {
		u.rc(this, "focus");


		// callbacks
		// does button have callback
		if(typeof(this.blurred) == "function") {
			this.blurred();
		}

		// does form have callback
		if(typeof(this.form.blurred) == "function") {
			this.form.blurred(this);
		}
	}

	// internal focus/blur handler for default value controller - attatched to inputs
	this._changed_state = function() {
//		u.bug("this._default_value_focus:" + u.nodeId(this))

		u.f.updateDefaultState(this);
	}



	// Helper functions

	// position hint appropriately to input
	this.positionHint = function(field) {

		// is help element available, then position it appropriately to input
		if(field._help) {

			// custom for HTML fields
			var f_h =  field.offsetHeight;
			var f_p_t = parseInt(u.gcs(field, "padding-top"));
			var f_p_b = parseInt(u.gcs(field, "padding-bottom"));
			var f_b_t = parseInt(u.gcs(field, "border-top-width"));
			var f_b_b = parseInt(u.gcs(field, "border-bottom-width"));
			var f_h_h = field._help.offsetHeight;

			if(u.hc(field, "html")) {

				var l_h = field._input._label.offsetHeight;
				var help_top = (((f_h - (f_p_t + f_p_b + f_b_b + f_b_t)) / 2)) - (f_h_h / 2) + l_h;
				u.as(field._help, "top", help_top + "px");
			}
			else {

	//			u.bug(f_b_t + ", " + f_b_b)
	//			u.bug("((" + f_h + " - (" + f_p_t + "+" + f_p_b + ")) / 2) + 2 = " + (((f_h - (f_p_t + f_p_b)) / 2) + 2));
	//			u.bug("(" + (((f_h - (f_p_t + f_p_b)) / 2) + 2) + ")" + " - " + "(" + (f_h_h / 2) + ")");
				var help_top = (((f_h - (f_p_t + f_p_b + f_b_b + f_b_t)) / 2) + 2) - (f_h_h / 2)
				u.as(field._help, "top", help_top + "px");
			}
		}
	}

	// activate input
	this.activateInput = function(iN) {
//		u.bug("activateInput:" + u.nodeId(iN, true))

		// add focus and blur event handlers
		u.e.addEvent(iN, "focus", this._focus);
		u.e.addEvent(iN, "blur", this._blur);

		// added accessibility
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(iN, "mouseenter", this._mouseenter);
			u.e.addEvent(iN, "mouseleave", this._mouseleave);
		}

		// validate on input blur
		u.e.addEvent(iN, "blur", this._validate);


		// Labelstyle is defined?
		// currently only one input style
		// inject in input
		if(iN.form.labelstyle == "inject") {

			// some inputs cannot have labels injected
			// textarea has no type
			if(!iN.type || !iN.type.match(/file|radio|checkbox/)) {

				// store default value
				iN.default_value = u.text(iN._label);

				// add default handlers to focus and blur events
				u.e.addEvent(iN, "focus", this._changed_state);
				u.e.addEvent(iN, "blur", this._changed_state);


				// Create psydo label for inputs that cant show label value
				// Did experiments with with field replacement, but required too much work
				// replacing event and references (this seems to provide sufficient backup)
				if(iN.type.match(/number|integer/)) {

					iN.pseudolabel = u.ae(iN.parentNode, "span", {"class":"pseudolabel", "html":iN.default_value});
					iN.pseudolabel.iN = iN;

					// position on top of input
					u.as(iN.pseudolabel, "top", iN.offsetTop+"px");
					u.as(iN.pseudolabel, "left", iN.offsetLeft+"px");
					// create event to remove pseudolabel
					u.ce(iN.pseudolabel)
					iN.pseudolabel.inputStarted = function(event) {
						u.e.kill(event);
						this.iN.focus();
					}

				}

				u.f.updateDefaultState(iN);

			}
		}

		// set empty default value for non injection forms
		else {
			iN.default_value = "";
		}

	}

	// activate button
	this.activateButton = function(action) {

		// if submit button, make sure it does not submit form without validation
		if(action.type && action.type == "submit") {
			// need to cancel onclick event to avoid normal post in older browsers where killing mouseup/down is not enough
			action.onclick = function(event) {
				u.e.kill(event ? event : window.event);
			}
		}

		// handle button click
		u.ce(action);

		// default handling - can be overwritten in local implementation
		action.clicked = function(event) {
			u.e.kill(event);

			// don't execute if button is disabled
			if(!u.hc(this, "disabled")) {
				if(this.type && this.type.match(/submit/i)) {

					// store submit button info
					this.form._submit_button = this;
					// remove any previous submit info
					this.form._submit_input = false;

					// internal submit
					this.form.submit(event, this);
				}

				// TODO: what is default action when not a submit button??
				// else {
				// 	location.href = this.url;
				// }
			}
		}

		// handle [ENTER] on button
		this.buttonOnEnter(action);


		// add to actions index if button has a name
		var action_name = action.name ? action.name : action.parentNode.className;
		if(action_name) {
			action.form.actions[action_name] = action;
		}


		// keyboard shortcut
		if(typeof(u.k) == "object" && u.hc(action, "key:[a-z0-9]+")) {
			u.k.addKey(action, u.cv(action, "key"));
		}

		// add focus and blur handlers
		u.e.addEvent(action, "focus", this._button_focus);
		u.e.addEvent(action, "blur", this._button_blur);

	}

	// update default state on input
	this.updateDefaultState = function(iN) {

//		u.bug("updateDefaultState for:" + u.nodeId(iN) + ", " + (iN.val() === "") + ", " + iN.focused)
		// is input focused
		if(iN.focused || iN.val() !== "") {

			// leave default state
			u.rc(iN, "default");

			// remove default value if field does not have value
			if(iN.val() === "") {
				iN.val("");
			}

			// if input has pseudolabel, hide it
			if(iN.pseudolabel) {
				u.as(iN.pseudolabel, "display", "none");
			}
		}
		// input does not have focus - consider dafault value
		else {

			// only set default value if input is empty
			if(iN.val() === "") {

				// add class to indicate default value
				u.ac(iN, "default");

				// if input has pseudolabel, show it
				if(iN.pseudolabel) {
					// in Fx bad value isn't cleared from input despite value being empty
					iN.val(iN.default_value);

					u.as(iN.pseudolabel, "display", "block");
				}
				// set value in field
				else {
//					u.bug("set value:" + u.nodeId(iN) + "," + iN.default_value)
					iN.val(iN.default_value);
				}
			}
		}
	}

	// field has error - decide whether it is reasonable to show it or not
	this.fieldError = function(iN) {

		u.rc(iN, "correct");
		u.rc(iN.field, "correct");

		// do not add visual feedback until field has been used by user - or if it contains value (reloads)
		if(iN.used || iN.val() !== "") {
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

		// does field have value? Non-required fields can be empty - but should not have visual validation
		if(iN.val() !== "") {
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

	// TODO: add this extended initialization to primary initialization

	// enable auto expanding text area
	this.autoExpand = function(iN) {

		// no scrollbars on auto expanded fields
		var current_height = parseInt(u.gcs(iN, "height"));
//		u.bug("AE:" + current_height + "," + iN.scrollHeight);

		var current_value = iN.val();
//		u.bug("current_value:" + current_value)
		// causes double validation loop and does not return default values - no good
//		iN.val("");

		iN.value = "";
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

//		iN.val(current_value);
		iN.value = current_value;

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


	// TODO: add this extended initialization to primary initialization

	// enable file upload interface
	this.fileUpload = function(field) {

		// add focus and blur event handlers
		u.e.addEvent(field._input, "focus", this._focus);
		u.e.addEvent(field._input, "blur", this._blur);

		// activate input mouse/drag interaction
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

				// TODO: files can be ok in the Janitor implementation if image has already been uploaded?
				// should also look for existing image in field
//				u.bug("this.value:" + this.value);
				// u.bug("this.files:" + this.files);
				// u.bug("this.files.length:" + this.files.length);
				
				// general support
				if(this.value && this.files && this.files.length) {
					var i, file, files = [];

					for(i = 0; file = this.files[i]; i++) {
						files.push(file);
					}
					return files;
				}
				// <= IE9 support
				else if(this.value) {
					return this.value;
				}

				else if(u.hc(this, "uploaded")){
					return true;
				}
//				u.bug("this.files.length:" + this.files.length)

				return "";
//				return files.join(",");
			}
		}

	}


	// TODO: move geolocation to custom field

	// inject GeoLocation button in location field
	this.geoLocation = function(field) {

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
				var lat = this.lat_input.val() !== "" ? this.lat_input.val() : 0;
				var lon = this.lon_input.val() !== "" ? this.lon_input.val() : 0;

				var maps_url = "https://maps.googleapis.com/maps/api/js" + (u.gapi_key ? "?key="+u.gapi_key : "");
				var html = '<html><head>';
				html += '<style type="text/css">body {margin: 0;}#map {width: 300px; height: 300px;}} </style>';
				html += '<script type="text/javascript" src="'+maps_url+'"></script>';
				html += '<script type="text/javascript">';

				html += 'var map, marker;';
				html += 'var initialize = function() {';
				html += '	window._map_loaded = true;';
				html += '	var mapOptions = {center: new google.maps.LatLng('+lat+', '+lon+'),zoom: 15};';
				html += '	map = new google.maps.Map(document.getElementById("map"),mapOptions);';
				html += '	marker = new google.maps.Marker({position: new google.maps.LatLng('+lat+', '+lon+'), draggable:true});';
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

				// TODO: find way to adjust factor to current zoom state
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

		field.hideMap = function() {
			u.t.resetTimer(this.t_hide_map);

			if(window._mapsiframe) {
				document.body.removeChild(window._mapsiframe);
				window._mapsiframe = null;
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
			u.t.resetTimer(this.field.t_hide_map);

			this.field.showMap();
		}
		// hide map when lat/long fields loose focus
		field.lat_input.blurred = field.lon_input.blurred = function() {
			this.field.t_hide_map = u.t.setTimer(this.field, this.field.hideMap, 800);
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



	// TODO: move HTML editor to custom field (requires janitor functionality)


	// inject HTML editor
	this.textEditor = function(field) {

		u.bug("init editor")
		// show help?
		var hint_has_been_shown = u.getCookie("html-editor-hint-v1", {"path":"/"});
		if(!hint_has_been_shown) {

			// editor help info
			var editor_hint = u.ie(field, "div", {"class":"html_editor_hint"});

			var editor_hint_open = u.ae(editor_hint, "div", {"class":"open", "html":"I'd like to know more about the Editor"});
			var editor_hint_content = u.ae(editor_hint, "div", {"class":"html_editor_hint_content"});

			editor_hint_open.editor_hint_content = editor_hint_content;
			u.ce(editor_hint_open);
			editor_hint_open.clicked = function() {
				if(this.editor_hint_content.is_shown) {
					this.innerHTML = "I'd like to know more about the Editor";
					u.as(editor_hint_content, "display", "none");
					this.editor_hint_content.is_shown = false;
				}
				else {
					this.innerHTML = "Hide help for now";
					u.as(editor_hint_content, "display", "block");
					this.editor_hint_content.is_shown = true;
				}
			}


			u.ae(editor_hint_content, "p", {"html":"If you are new to using the Janitor HTML editor here are a few tips to working better with the editor."});
			u.ae(editor_hint_content, "p", {"html":"This HTML editor has been developed to maintain a strict control of the design - therefore it looks different from other HTML editors. The features available are aligned with the design of the specific page, and the Editor might not have the same features available in every context."});

			u.ae(editor_hint_content, "h4", {"html":"General use:"});
			u.ae(editor_hint_content, "p", {"html":"All HTML nodes can be deleted using the Trashcan in the Right side. The Editor allways requires one node to exist and you cannot delete the last remaining node."});
			u.ae(editor_hint_content, "p", {"html":"HTML nodes can be re-ordered by dragging the bubble in the Left side."});
			u.ae(editor_hint_content, "p", {"html":"You can add new nodes by clicking on the + below the editor. The options availble are the ones allowed for the current content type."});

			u.ae(editor_hint_content, "h4", {"html":"Text nodes:"});
			u.ae(editor_hint_content, "p", {"html":"&lt;H1&gt;,&lt;H2&gt;,&lt;H3&gt;,&lt;H4&gt;,&lt;H5&gt;,&lt;H6&gt;,&lt;P&gt;,&lt;CODE&gt;"});
			u.ae(editor_hint_content, "p", {"html":"Text nodes are for headlines and paragraphs - regular text."});
			u.ae(editor_hint_content, "p", {"html":"You can activate the inline formatting tool by selecting text in your Text node."});
			u.ae(editor_hint_content, "p", {"html":"If you press ENTER inside a Text node, a new Text node will be created below the current one."});
			u.ae(editor_hint_content, "p", {"html":"If you press BACKSPACE twice inside an empty Text node it will be deleted"});

			u.ae(editor_hint_content, "h4", {"html":"List nodes:"});
			u.ae(editor_hint_content, "p", {"html":"&lt;UL&gt;,&lt;OL&gt;"});
			u.ae(editor_hint_content, "p", {"html":"There are two types of list nodes: Unordered lists (UL w/ bullets) and Ordered lists (OL w/ numbers). Each of them can have one or many List items."});
			u.ae(editor_hint_content, "p", {"html":"You can activate the inline formatting tool by selecting text in your List item."});
			u.ae(editor_hint_content, "p", {"html":"If you press ENTER inside a List item, a new List item will be created below the current one."});
			u.ae(editor_hint_content, "p", {"html":"If you press BACKSPACE twice inside an empty List item it will be deleted. If it is the last List item in the List node, the List node will be deleted as well."});

			u.ae(editor_hint_content, "h4", {"html":"File nodes:"});
			u.ae(editor_hint_content, "p", {"html":"Drag you file to the node or click the node to select your file."});
			u.ae(editor_hint_content, "p", {"html":"If you add other file-types than PDF's, the file will be zipped on the server and made availble for download as ZIP file."});

			var editor_hint_close = u.ae(editor_hint_content, "div", {"class":"close", "html":"I got it, don't tell me again"});

			u.ce(editor_hint_close);
			editor_hint_close.editor_hint = editor_hint;
			editor_hint_close.clicked = function() {
				u.saveCookie("html-editor-hint-v1", 1, {"path":"/"});
				this.editor_hint.parentNode.removeChild(this.editor_hint);
			}

		}


		// Editor support specs
		field.text_support = "h1,h2,h3,h4,h5,h6,p,code";
		field.list_support = "ul,ol";
		field.media_support = "png,jpg,mp4";
		field.ext_video_support = "youtube,vimeo";
		field.file_support = "download"; // means any file type (file will be uploaded, zipped and made available for download)


		// Allowed tags are listed in element classname
		field.allowed_tags = u.cv(field, "tags");
		if(!field.allowed_tags) {
			u.bug("allowed_tags not specified")
			return;
		}


		// filter allowed tags before building editor
		field.filterAllowedTags = function(type) {

			// split allowed tags 
			tags = this.allowed_tags.split(",");

			// create array for type
			this[type+"_allowed"] = new Array();

			// loop through tags
			var tag, i;
			for(i = 0; tag = tags[i]; i++) {
				// it tag is supported for type, add it to type_allowed array
				if(tag.match(this[type+"_support"].split(",").join("|"))) {
					this[type+"_allowed"].push(tag);
				}
			}
		}
		field.filterAllowedTags("text");
		field.filterAllowedTags("list");
		field.filterAllowedTags("media");
		field.filterAllowedTags("ext_video");
		field.filterAllowedTags("file");


		// extended functionality urls
		field.file_add_action = field.getAttribute("data-file-add");
		field.file_delete_action = field.getAttribute("data-file-delete");

		// find item id
		// could be in form action (last fragment of url)
		// could be extended to look in other places
		field.item_id;
		var item_id_match = field._input.form.action.match(/\/([0-9]+)(\/|$)/);
		if(item_id_match) {
			field.item_id = item_id_match[1];
		}



		// BUILD EDITOR EXTERNAL INTERFACE

		// Viewer is a div containing the actual HTML output of the editor
		// at this point purely used for inspecting the generated HTML for debugging
		// could be used as a preview pane at a later point
		field._viewer = u.ae(field, "div", {"class":"viewer"});

		// The actual HTML editor interface
		field._editor = u.ae(field, "div", {"class":"editor"});
		field._editor.field = field;

		// callback after sorting list
		field._editor.dropped = function() {
			this.field.update();
			//u.bug("sorted")
		}

		// Create add options panel
		field.addOptions = function() {


			// allow to toggle raw HTML view
			this.bn_show_raw = u.ae(this._input._label, "span", {"html":"(RAW HTML)"});
			this.bn_show_raw.field = this;
			u.ce(this.bn_show_raw);
			this.bn_show_raw.clicked = function() {
				if(u.hc(this.field._input, "show")) {
					u.rc(this.field._input, "show");
				}
				else {
					u.ac(this.field._input, "show");
				}
			}


			// Add list for actions
			this.options = u.ae(this, "ul", {"class":"options"});


			// "Add" button
			this.bn_add = u.ae(this.options, "li", {"class":"add", "html":"+"});
			this.bn_add.field = field;
			u.ce(this.bn_add);
			this.bn_add.clicked = function(event) {
				if(u.hc(this.field.options, "show")) {
					u.rc(this.field.options, "show");
				}
				else {
					u.ac(this.field.options, "show");
				}
			}


			// Add text tag option (if allowed)
			if(this.text_allowed.length) {

				this.bn_add_text = u.ae(this.options, "li", {"class":"text", "html":"Text ("+this.text_allowed.join(", ")+")"});
				this.bn_add_text.field = field;
				u.ce(this.bn_add_text);
				this.bn_add_text.clicked = function(event) {
					this.field.addTextTag(this.field.text_allowed[0]);
					u.rc(this.field.options, "show");
				}
			}


			// Add list tag option (if allowed)
			if(this.list_allowed.length) {

				this.bn_add_list = u.ae(this.options, "li", {"class":"list", "html":"List ("+this.list_allowed.join(", ")+")"});
				this.bn_add_list.field = field;
				u.ce(this.bn_add_list);
				this.bn_add_list.clicked = function(event) {
					this.field.addListTag(this.field.list_allowed[0]);
					u.rc(this.field.options, "show");
				}
			}


			// Add media tag option (if allowed)
			if(this.media_allowed.length) {

				this.bn_add_media = u.ae(this.options, "li", {"class":"list", "html":"Media ("+this.media_allowed.join(", ")+")"});
				this.bn_add_media.field = field;
				u.ce(this.bn_add_media);
				this.bn_add_media.clicked = function(event) {
					this.field.addMediaTag();
					u.rc(this.field.options, "show");
				}
			}


			// Add external video tag option (if allowed)
			if(this.ext_video_allowed.length) {

				this.bn_add_ext_video = u.ae(this.options, "li", {"class":"video", "html":"External video ("+this.ext_video_allowed.join(", ")+")"});
				this.bn_add_ext_video.field = field;
				u.ce(this.bn_add_ext_video);
				this.bn_add_ext_video.clicked = function(event) {
					this.field.addExternalVideoTag();
					u.rc(this.field.options, "show");
				}
			}


			// Add file tag option (if allowed)
			if(this.file_allowed.length && this.item_id && this.file_add_action && this.file_delete_action) {

				this.bn_add_file = u.ae(this.options, "li", {"class":"file", "html":"Downloadable file"});
				this.bn_add_file.field = field;
				u.ce(this.bn_add_file);
				this.bn_add_file.clicked = function(event) {
					this.field.addFileTag();
					u.rc(this.field.options, "show");
				}
			}
			else if(this.file_allowed.length) {
				u.bug("some information is missing to support file upload:\nitem_id="+this.item_id+"\nfile_add_action="+this.file_add_action+"\nfile_delete_action="+this.file_delete_action);
			}

		}




		// UPDATERS

		// Update viewer and Textarea
		field.update = function() {

			this.updateViewer();
			this.updateContent();

		}

		// update HTML viewer div
		field.updateViewer = function() {
//			u.bug("updateViewer");

			// get all tags
			var tags = u.qsa("div.tag", this);

			var i, tag, j, list, li, lis, div, p, a;

			// reset html viewer
			this._viewer.innerHTML = "";

			// loop through tags
			for(i = 0; tag = tags[i]; i++) {

				// is tag a text
				if(u.hc(tag, this.text_allowed.join("|"))) {

					// add text node
					u.ae(this._viewer, tag._type.val(), {"html":tag._input.val()});
				}

				// is tag list
				else if(u.hc(tag, this.list_allowed.join("|"))) {

					// add list
					list = u.ae(this._viewer, tag._type.val());

					// add list items
					lis = u.qsa("div.li", tag);
					for(j = 0; li = lis[j]; j++) {
						li = u.ae(list, tag._type.val(), {"html":li._input.val()});
					}
				}

				// is tag external video
				else if(u.hc(tag, this.ext_video_allowed.join("|"))) {

					// add div with video id
					div = u.ae(this._viewer, "div", {"class":tag._type.val()+" video_id:"+tag._video_id});
				}

				// is tag file
				else if(u.hc(tag, "file")) {

					// add div with <p> and <a>
					div = u.ae(this._viewer, "div", {"class":"file item_id:"+tag._item_id+" variant:"+tag._variant+" name:"+tag._name + " filesize:"+tag._filesize});
					p = u.ae(div, "p", {"html":"DOWNLOAD: "});
					a = u.ae(p, "a", {"href":"/download/"+tag._item_id+"/"+tag._variant+"/"+tag._name, "html":tag._name + " ("+u.round(tag._filesize/1000, 2)+" Kb)"});
				}

				// TODO: Media

			}
			
		}

		// updates actual Textarea 
		field.updateContent = function() {
//			u.bug("updateContent");

			// get all tags
			var tags = u.qsa("div.tag", this);

			// update actual textarea to be saved
			this._input.val("");

			var i, node, tag, type, value, j, html = "";

			for(i = 0; tag = tags[i]; i++) {
//				u.bug(u.nodeId(node));

				// text node
				if(u.hc(tag, this.text_allowed.join("|"))) {

					// get tag type
					type = tag._type.val();
					html += "<"+type+">"+tag._input.val()+"</"+type+">\n";
				}

				// list node
				else if(u.hc(tag, this.list_allowed.join("|"))) {

					// get tag type
					type = tag._type.val();
					html += "<"+type+">\n";

					// get list tiems
					lis = u.qsa("div.li", tag);
					for(j = 0; li = lis[j]; j++) {
						html += "\t<li>"+li._input.val()+"</li>\n";
					}

					html += "</"+type+">\n";
				}

				// external video node
				else if(u.hc(tag, this.ext_video_allowed.join("|"))) {

					html += '<div class="'+tag._type.val()+' video_id:'+tag._video_id+'"></div>\n';
				}

				// file node
				else if(u.hc(tag, "file")) {

					html += '<div class="file item_id:'+tag._item_id+' variant:'+tag._variant+' name:'+tag._name+' filesize:'+tag._filesize+'">'+"\n";
					html += '\t<p>DOWNLOAD: <a href="/download/'+tag._item_id+'/'+tag._variant+'/'+tag._name+'">'+tag._name+" ("+u.round(tag._filesize/1000, 2)+" Kb)</a></p>";
					html += "</div>\n";
				}

			}

			// save HTML in textarea
			this._input.val(html);

		}




		// EDITOR FUNCTIONALity

		// Create empty tag (with drag, type selector and remove-tag elements)
		field.createTag = function(allowed_tags, type) {

			// create tag node
			var tag = u.ae(this._editor, "div", {"class":"tag"});
			tag.field = this;


			// add drag handle
			tag._drag = u.ae(tag, "div", {"class":"drag"});
			tag._drag.field = this;
			tag._drag.tag = tag;

			// add type selector
			this.createTagSelector(tag, allowed_tags);

			// select current type
			tag._type.val(type);


			// add remove button
			tag._remove = u.ae(tag, "div", {"class":"remove"});
			tag._remove.field = this;
			tag._remove.tag = tag;
			u.ce(tag._remove);
			tag._remove.clicked = function() {
				this.field.deleteTag(this.tag);
			}


			return tag;
		}

		// delete tag (when clicking on remove button)
		field.deleteTag = function(tag) {

			// make sure it is not last node
			if(u.qsa("div.tag", this).length > 1) {

				// if node is file - delete file from server
				if(u.hc(tag, "file")) {
					this.deleteFile(tag);
				}

				// remove node
				tag.parentNode.removeChild(tag);

				// enable dragging of html-tags
				u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

				// global update
				this.update();

				// save - new state (delete is permanent)
				this._input.form.submit();

			}

		}


		// TODO: add focus to input after selection
		// create tag selector helper function
		field.createTagSelector = function(tag, allowed_tags) {
			
			var i, allowed_tag;

			// insert node in tag
			tag._type = u.ae(tag, "ul", {"class":"type"});
			tag._type.field = this;
			tag._type.tag = tag;

			// create selector for text-based tags
			for(i = 0; allowed_tag = allowed_tags[i]; i++) {
				u.ae(tag._type, "li", {"html":allowed_tag, "class":allowed_tag});
			}


			// type get/set function
			tag._type.val = function(value) {

				// set value
				if(value !== undefined) {
					var i, option;

					// try to find option with matching value
					for(i = 0; option = this.childNodes[i]; i++) {

						if(u.text(option) == value) {

							// already have selected options
							if(this.selected_option) {
								u.rc(this.selected_option, "selected");

								// update div tag class
								u.rc(this.tag, u.text(this.selected_option));
							}

							// set selected state on new option
							u.ac(option, "selected");
							this.selected_option = option;

							// update div tag class
							u.ac(this.tag, value);

							return option;
						}
					}

					// didn't find anything
					// set selected state on first option
					u.ac(this.childNodes[0], "selected");
					this.selected_option = this.childNodes[0];
					// update div tag class
					u.ac(this.tag, u.text(this.childNodes[0]));

					return this.childNodes[0];
				}

				// get value
				else {
					return u.text(this.selected_option);
				}
			}

			// enable tag switching, only if more than one type available
			if(allowed_tags.length > 1) {


				u.ce(tag._type);
				tag._type.clicked = function(event) {
//					u.bug("select clicked");

					// reset auto hide (just in case)
					u.t.resetTimer(this.t_autohide);

					// already show - close selector
					if(u.hc(this, "open")) {
						u.rc(this, "open");
						u.rc(this.tag, "focus");

						u.as(this, "top", 0);

						// was a new type selected?
						if(event.target) {
							this.val(u.text(event.target));
						}

						// remove auto close on mouse out
						u.e.removeEvent(this, "mouseout", this.autohide);
						u.e.removeEvent(this, "mouseover", this.delayautohide);


						// TODO: add focus to input (but not until we know what input looks like)
						// this.div._input.focus();

						// update content
						this.field.update();
					}
					// already closed - open selector
					else {
						u.ac(this, "open");
						u.ac(this.tag, "focus");

						u.as(this, "top", -(this.selected_option.offsetTop) + "px");

						// add auto hide
						u.e.addEvent(this, "mouseout", this.autohide);
						u.e.addEvent(this, "mouseover", this.delayautohide);
					}
				}

				// auto hide type selector
				tag._type.hide = function() {
					u.rc(this, "open");
					u.rc(this.tag, "focus");

					u.as(this, "top", 0);

					// remove auto hide
					u.e.removeEvent(this, "mouseout", this.autohide);
					u.e.removeEvent(this, "mouseover", this.delayautohide);
					u.t.resetTimer(this.t_autohide);


					// TODO: add focus to input (but not until we know what input looks like)
					// this.div._input.focus();
				}

				// auto hide functions
				tag._type.autohide = function(event) {
					u.t.resetTimer(this.t_autohide);
					this.t_autohide = u.t.setTimer(this, this.hide, 800);
				}
				tag._type.delayautohide = function(event) {
					u.t.resetTimer(this.t_autohide);
				}

			}

		}



		// TODO
		field.addExternalVideoTag = function() {}
		field.addMediaTag = function() {}



		// FILE TAG

		// File tags
		field.addFileTag = function(value) {

			// create new tag
			var tag = this.createTag(["file"], "file");

			// add text wrapper for file upload or file info
			tag._text = u.ae(tag, "div", {"class":"text"});

			// if we have file info
			if(value) {

				// get file info from node
				tag._variant = u.cv(node, "variant");
				tag._name = u.cv(node, "name");
				tag._item_id = u.cv(node, "item_id");
				tag._filesize = u.cv(node, "filesize");

				// create label with information
				tag._label = u.ae(tag._text, "label", {"class":"done", "html":tag._name + " ("+u.round(tag._filesize/1000, 2)+" Kb)"});
			}

			// new file tag
			else {

				// create upload input
				tag._label = u.ae(tag._text, "label", {"html":"Drag file here"});
				tag._input = u.ae(tag._text, "input", {"type":"file", "name":"htmleditor_file"});
				tag._input.tag = tag;
				tag._input.field = this;

				// declare get/set value funtion
				tag._input.val = function(value) {
					u.bug("this shouldn't be called from anywhere")
				}
				// set value if any is sent
				//tag._input.val(u.stringOr(value));

				// wait for upload
				u.e.addEvent(tag._input, "change", this._file_updated);

				// add focus and blur handlers
				u.e.addEvent(tag._input, "focus", this._focused_content);
				u.e.addEvent(tag._input, "blur", this._blurred_content);

				// Show hint on mouseover
				if(u.e.event_pref == "mouse") {
					u.e.addEvent(tag._input, "mouseenter", u.f._mouseenter);
					u.e.addEvent(tag._input, "mouseleave", u.f._mouseleave);
				}
			}

			// enable dragging of html-tags
			u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

			return tag;
		}

		// Delete file on server, when file is deleted from editor
		field.deleteFile = function(tag) {

			// create form data to submit delete request
			var form_data = new FormData();

			// append relevant data
			form_data.append("csrf-token", this._input.form.fields["csrf-token"].val());

			// request response handler
			tag.response = function(response) {

				// notify interface
				page.notify(response);

				// if every thing is good udate and save
				if(response.cms_status && response.cms_status == "success") {

					// all good

					// update viewer
					this.field.update();
				}
			}
			u.request(tag, this.file_delete_action+"/"+tag._item_id+"/"+tag._variant, {"method":"post", "params":form_data});

		}



		// LIST TAG

		// add new list node
		field.addListTag = function(type, value) {

			var tag = this.createTag(this.list_allowed, type);

			// tag.items = new Array();
			// tag.items.push(this.addListItem(tag, value));
			this.addListItem(tag, value);

			// callback for "add new"
			// tag.addNew = function() {
			// 	this.items.push(this.field.addListItem(this));
			// }

			// enable dragging of html-tags
			u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

			return tag;
		}

		// add new li to list node
		field.addListItem = function(tag, value) {

			var li = u.ae(tag, "div", {"class":"li"});
			li.tag = tag;
			li.field = this;

			// text input
			li._input = u.ae(li, "div", {"class":"text", "contentEditable":true});
			li._input.li = li;
			li._input.tag = tag;
			li._input.field = this;

			// declare get/set value funtion
			li._input.val = function(value) {
				if(value !== undefined) {
					this.innerHTML = value;
				}
				return this.innerHTML;
			}
			// set value if any is sent
			li._input.val(u.stringOr(value));


			// monitor changes and selections
			// kills ENTER event
			u.e.addEvent(li._input, "keydown", this._changing_content);

			// content has been modified or selected (can happen with mouse or keys)
			u.e.addEvent(li._input, "keyup", this._changed_content);
			u.e.addEvent(li._input, "mouseup", this._changed_content);

			// add focus and blur handlers
			u.e.addEvent(li._input, "focus", this._focused_content);
			u.e.addEvent(li._input, "blur", this._blurred_content);

			// Show hint on mouseover
			if(u.e.event_pref == "mouse") {
				u.e.addEvent(li._input, "mouseenter", u.f._mouseenter);
				u.e.addEvent(li._input, "mouseleave", u.f._mouseleave);
			}

			// add paste event handler
			u.e.addEvent(li._input, "paste", this._pasted_content);

			return li;
		}



		// TEXT TAG

		// add new text node
		field.addTextTag = function(type, value) {

			var tag = this.createTag(this.text_allowed, type);

			// text input
			tag._input = u.ae(tag, "div", {"class":"text", "contentEditable":true});
			tag._input.tag = tag;
			tag._input.field = this;

			// declare get/set value funtion
			tag._input.val = function(value) {
				if(value !== undefined) {
					this.innerHTML = value;
				}
				return this.innerHTML;
			}
			// set value if any is sent
			tag._input.val(u.stringOr(value));


			// monitor changes and selections
			// kills ENTER event
			u.e.addEvent(tag._input, "keydown", this._changing_content);

			// content has been modified or selected (can happen with mouse or keys)
			u.e.addEvent(tag._input, "keyup", this._changed_content);
			u.e.addEvent(tag._input, "mouseup", this._changed_content);

			// add focus and blur handlers
			u.e.addEvent(tag._input, "focus", this._focused_content);
			u.e.addEvent(tag._input, "blur", this._blurred_content);

			// Show hint on mouseover
			if(u.e.event_pref == "mouse") {
				u.e.addEvent(tag._input, "mouseenter", u.f._mouseenter);
				u.e.addEvent(tag._input, "mouseleave", u.f._mouseleave);
			}

			// add paste event handler
			u.e.addEvent(tag._input, "paste", this._pasted_content);


			// callback for "add new"
			tag.addNew = function() {
				this.field.addTextItem(this.field.text_allowed[0]);
			}

			// enable dragging of html-tags
			u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

			return tag;
		}


		// EVENT HANDLERS 

		// gained focus on individual tag._input
		// TODO: Tabbing detection flawed
		// TODO: consider looping back to original field._focused (for callbacks)
		field._focused_content = function(event) {
//			u.bug("field._focused_content");

			// add focus state
			this.field.focused = true;
			u.ac(this.tag, "focus");
			u.ac(this.field, "focus");

			// make sure field goes all the way in front - hint/error must be seen
			u.as(this.field, "zIndex", this.field._input.form._focus_z_index);

			// position hint in case there is an error
			u.f.positionHint(this.field);

			// if tabbing to gain focus, move cursor to end
			// TODO: does not always detect tabbing correctly - maybe look at key?
			if(event.rangeOffset == 1) {
				var range = document.createRange();
				range.selectNodeContents(this);
				range.collapse(false);

				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}

		}
		// lost focus on individual tag._input
		// TODO: consider looping back to original field._blurred (for callbacks)
		field._blurred_content = function() {
//			u.bug("_blurred_content:" + this.val());

			// remove focus state
			this.field.focused = false;
			u.rc(this.tag, "focus");
			u.rc(this.field, "focus");

			// put back in correct place
			u.as(this.field, "zIndex", this.field._base_z_index);

			// position hint in case there is an error
			u.f.positionHint(this.field);

			// hide options (will not be hidden if they are needed)
			this.field.hideSelectionOptions();
		}



		// attached to tag._input node for text-tags and list-tags
		field._file_updated = function(event) {

			// create data form object to upload file
			var form_data = new FormData();

			// append relevant data
			form_data.append(this.name, this.files[0], this.value);
			form_data.append("csrf-token", this.form.fields["csrf-token"].val());

			// response handler
			this.response = function(response) {

				page.notify(response);

				if(response.cms_status && response.cms_status == "success") {

					// remove file input and update information for viewer and content
					this.parentNode.removeChild(this);
					this.tag._label.innerHTML = response.cms_object["name"] + " ("+ u.round((response.cms_object["filesize"]/1000), 2) +"Kb)";
					this.tag._variant = response.cms_object["variant"];
					this.tag._filesize = response.cms_object["filesize"]
					this.tag._name = response.cms_object["name"]
					this.tag._item_id = response.cms_object["item_id"]
					u.ac(this.tag._label, "done");

					// update viewer
					this.tag.field.update();

					// save after upload is complete
					this.tag.field._input.form.submit();
				}
			}
			u.request(this, this.field.file_add_action+"/"+this.field.item_id, {"method":"post", "params":form_data});

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


		// attached to tag._input node for text-tags and list-tags
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

					// list element - create new li
					if(u.hc(this.tag, this.field.list_allowed.join("|"))) {

						var new_li = this.field.addListItem(this.tag);
						var next_li = u.ns(this.li);
						if(next_li) {
							this.tag.insertBefore(new_li, next_li);
						}
						else {
							this.tag.appendChild(new_li);
						}

						new_li._input.focus();
					}

					// text element, create new text node
					else {

						var new_tag = this.field.addTextTag(this.field.text_allowed[0]);
						var next_tag = u.ns(this.tag);
						if(next_tag) {
							this.tag.parentNode.insertBefore(new_tag, next_tag);
						}
						else {
							this.tag.parentNode.appendChild(new_tag);
						}

						new_tag._input.focus();
					}

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
			else if(event.keyCode == 8) {

				// node in deletable state?
				if(this.is_deletable) {
//					u.bug("go ahead delete me")

					u.e.kill(event);

					var all_tags = u.qsa("div.tag", this.field);
					var all_lis = u.qsa("div.li", this.tag);

					// check for previous element before removing anything
					var prev = this.field.findPreviousInput(this);


					// list element
					if(u.hc(this.tag, this.field.list_allowed.join("|"))) {

						// never delete last tag - only delete li if there are more li's or tags
						if(all_tags.length > 1 || all_lis.length > 1) {

							// remove li
							this.tag.removeChild(this.li);

							// if we just removed last li in list, now remove list
							if(!u.qsa("div.li", this.tag).length) {

								// remove list
								this.tag.parentNode.removeChild(this.tag);
							}
						}
					}

					// text element
					else {

						// never delete last tag
						if(all_tags.length > 1) {
							this.tag.parentNode.removeChild(this.tag);

						}
					}


					// enable dragging of html-tags
					u.sortable(this.field._editor, {"draggables":"tag", "targets":"editor"});

					// set focus on prev element
					if(prev) {
						prev.focus();
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


			// hide existing options
			this.field.hideSelectionOptions();


			// new selection
			if(selection && !selection.isCollapsed) {

				// check if
				var node = selection.anchorNode;

				// test u.nodeWithin for this purpose

				while(node != this) {
					if(node.nodeName == "HTML" || !node.parentNode) {
						break;
					}
					node = node.parentNode;
				}

				// Text has been selected, show selection options
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

			// global update
			this.field.update();
		}




		// PASTE FILTERING

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


		// on delete, find the previous input to send focus to
		field.findPreviousInput = function(iN) {

			var prev = false;

			// list 
			if(u.hc(iN.tag, this.list_allowed.join("|"))) {

				prev = u.ps(iN.li, "drag|remove|type");
			}

			if(!prev) {
				prev = u.ps(iN.tag);

				if(prev && u.hc(prev, this.list_allowed.join("|"))) {

					var items = u.qsa("div.li", prev);
					prev = items[items.length-1];
				}
			}

			// no previous tags, first tag is best option
			if(!prev) {
				prev = u.qs("div.tag", this);

				if(u.hc(prev, this.list_allowed.join("|"))) {

					prev = u.qs("div.li", prev);
				}
			}

			// return input or false
			return prev ? prev._input : false;
		}



		// SELECTION OPTIONS PANE

		// hide the options pane and update content 
		field.hideSelectionOptions = function() {

			// only hide if not in interaction mode
			if(this.selection_options && !this.selection_options.is_active) {
				this.selection_options.parentNode.removeChild(this.selection_options);
				this.selection_options = null;
			}

			this.update();
		}

		// show options for selection
		field.showSelectionOptions = function(node, selection) {

			// position of node
			var x = u.absX(node);
			var y = u.absY(node);

			// create options div
			this.selection_options = u.ae(document.body, "div", {"id":"selection_options"});

			// position options pane according to field
			u.as(this.selection_options, "top", y+"px");
			u.as(this.selection_options, "left", (x + node.offsetWidth) +"px");

			var ul = u.ae(this.selection_options, "ul", {"class":"options"});

			// link option
			this.selection_options._link = u.ae(ul, "li", {"class":"link", "html":"Link"});
			this.selection_options._link.field = this;
			this.selection_options._link.selection = selection;
			u.ce(this.selection_options._link);
			this.selection_options._link.inputStarted = function(event) {
				u.e.kill(event);
				this.field.selection_options.is_active = true;
			}
			this.selection_options._link.clicked = function(event) {
				u.e.kill(event);
				this.field.addAnchorTag(this.selection);
			}

			// EM option
			this.selection_options._em = u.ae(ul, "li", {"class":"em", "html":"Itallic"});
			this.selection_options._em.field = this;
			this.selection_options._em.selection = selection;
			u.ce(this.selection_options._em);
			this.selection_options._em.inputStarted = function(event) {
				u.e.kill(event);
			}
			this.selection_options._em.clicked = function(event) {
				u.e.kill(event);
				this.field.addEmTag(this.selection);
			}

			// STRONG option
			this.selection_options._strong = u.ae(ul, "li", {"class":"strong", "html":"Bold"});
			this.selection_options._strong.field = this;
			this.selection_options._strong.selection = selection;
			u.ce(this.selection_options._strong);
			this.selection_options._strong.inputStarted = function(event) {
				u.e.kill(event);
			}
			this.selection_options._strong.clicked = function(event) {
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

						if(this.node.field.selection_options) {
							this.node.field.selection_options.is_active = false;
							this.node.field.hideSelectionOptions();
						}

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
			var inline_tags = u.qsa("a,strong,em,span", input);

			for(i = 0; node = inline_tags[i]; i++) {
				node.field = input.field;
				this.deleteOption(node);
			}
		}





		// INLINE FORMATTING HELPERS FOR TEXT NODES

		// extend options pane with Anchor options
		field.anchorOptions = function(node) {

			var form = u.f.addForm(this.selection_options, {"class":"labelstyle:inject"});
			u.ae(form, "h3", {"html":"Link options"});
			var fieldset = u.f.addFieldset(form);
			var input_url = u.f.addField(fieldset, {"label":"url", "name":"url"});

			// TODO: change to checkbox field
			var input_target = u.f.addField(fieldset, {"type":"checkbox", "label":"New window?", "name":"target"});
			var bn_save = u.f.addAction(form, {"value":"Create link", "class":"button"});
			u.f.init(form);


			form.a = node;
			form.field = this;

			form.submitted = function() {

				if(this.fields["url"].val() && this.fields["url"].val() != this.fields["url"].default_value) {
					this.a.href = this.fields["url"].val();
				}

				if(this.fields["target"].val() && this.fields["target"].val() != this.fields["target"].default_value) {
//					this.a.target = this.fields["target"].val();
					this.a.target = "_blank";
				}
				this.field.selection_options.is_active = false;
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
//			u.bug("field:" + u.nodeId(this));

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

		// add span options
		field.spanOptions = function(node) {}
		
		// add span tag
		field.addSpanTag = function(selection) {

			var span = document.createElement("span");
			span.field = this;

			var range = selection.getRangeAt(0);
			range.surroundContents(span);
			selection.removeAllRanges();

			this.deleteOption(span);
			this.hideSelectionOptions();
		}





		// INDEX EXISTING CONTENT 


		// inject value into viewer div, to be able to inspect for DOM content on initialization
		field._viewer.innerHTML = field._input.val();


		// TODO: 
		// if value of textarea is not HTML formatted
		// change double linebreak to </p><p> (or fitting) once you are sure text is wrapped in node


		var value, node, i, tag, j, lis, li;
//		field._fields = new Array();


		// check for valid nodes, excluding <br>
		var nodes = u.cn(field._viewer, "br");
		if(nodes.length) {


			// loop through childNodes
			for(i = 0; node = field._viewer.childNodes[i]; i++) {

//				u.bug("node" + u.nodeId(node) + ", " + node.nodeName + ", " + typeof(node.nodeName));


				// lost fragment of unspecified text
				// wrap in p tag if content is more than whitespace or newline
				if(node.nodeName == "#text") {
					if(node.nodeValue.trim()) {

						// locate double linebreaks and split into several paragraphs 
						var fragments = node.nodeValue.trim().split(/\n\r\n\r|\n\n|\r\r/g);
						if(fragments) {
							for(index in fragments) {
								value = fragments[index].replace(/\n\r|\n|\r/g, "<br>");
								tag = field.addTextTag("p", fragments[index]);
								field.activateInlineFormatting(tag._input);
							}
						}
						// wrap textnode in one paragraph
						else {
							value = node.nodeValue; //.replace(/\n\r|\n|\r/g, "<br>");
							tag = field.addTextTag("p", value);
							field.activateInlineFormatting(tag._input);
						}

					}
				}

				// valid text node (h1-h6, p, code)
				else if(node.nodeName.toLowerCase().match(field.text_allowed.join("|"))) {

					// handle plain text node
					// TODO: this will not work with <code> (cannot replace newline in code element)

					value = node.innerHTML.replace(/\n\r|\n|\r/g, "<br>"); // .replace(/\<br[\/]?\>/g, "\n");

					// add new text node to editor
					tag = field.addTextTag(node.nodeName.toLowerCase(), value);
					field.activateInlineFormatting(tag._input);

				}
				// valid list node (ul, ol)
				else if(node.nodeName.toLowerCase().match(field.list_allowed.join("|"))) {


					// handle list node
					var lis = u.qsa("li", node);
					value = lis[0].innerHTML.replace(/\n\r|\n|\r/g, "<br>");


					// add new list node, and first li to editor
					tag = field.addListTag(node.nodeName.toLowerCase(), value);

					// activate Inline
					var li = u.qs("div.li", tag);
					field.activateInlineFormatting(li._input);


					// loop through remaining li-element and add them, one by one
					if(lis.length > 1) {
						for(j = 1; li = lis[j]; j++) {
							value = li.innerHTML.replace(/\n\r|\n|\r/g, "<br>");
							li = field.addListItem(tag, value);
							field.activateInlineFormatting(li._input);
						}
					}
				}


				// divs containing file info (media, vimeo, youtube, file)
				else {

					// FILE
					if(u.hc(node, "file")) {
						field.addFileTag(node);
					}

					// TODO: implement media and external video
					// else if(u.hc(node, "youtube")) {
					//
					// }
					else {
						alert("HTML contains unautorized node:" + node.nodeName + "\nIt has been altered to conform with SEO and design.");
					}
				}

			}
		}

		// single unformatted textnode
		// wrap in <p> and replace newline with <br>
		else {

			value = field._viewer.innerHTML.replace(/\<br[\/]?\>/g, "\n");
			//.replace(/\n\r|\n|\r/g, "<br>");
			//
			tag = field.addTextTag(field.text_allowed[0], value);
			field.activateInlineFormatting(tag._input);

		}



		// enable dragging of html-tags
		u.sortable(field._editor, {"draggables":"tag", "targets":"editor"});

		// update viewer after indexing
		field.updateViewer();

		// add extra editor actions
		field.addOptions();

	}




	// TODO: update validation

	// validate input
	// - string
	// - number
	// - integer
	// - tel
	// - email
	// - text
	// - select
	// - radiobuttons
	// - checkbox|boolean
	// - password
	// - string
	// - date
	// - datetime
	// - files
	this.validate = function(iN) {
//		u.bug("validate:" + iN.name)


		// validation is disabled
		if(!iN.form._validation) {
			return true;
		}


		var min, max, pattern;
		var validated = false;


		// start by checking if value is empty or default_value
		// not required, and empty (should still be validated if it has content)
		if(!u.hc(iN.field, "required") && iN.val() === "") {
//			u.bug("valid empty:" + u.nodeId(iN))

			this.fieldCorrect(iN);
			return true;
		}
		// required, and empty
		else if(u.hc(iN.field, "required") && iN.val() === "") {
//			u.bug("invalid empty:" + u.nodeId(iN) + ", " + iN.val() + ", " + (iN.val() === ""))

			this.fieldError(iN);
			return false;
		}


		// loop through custom validations
		var custom_validate;
		for(custom_validate in u.f.customValidate) {
			if(u.hc(iN.field, custom_validate)) {
				u.f.customValidate[custom_validate](iN);
				validated = true;
			}
		}

		// still not validated?
		if(!validated) {

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

				if(iN.val() !== "") {
					this.fieldCorrect(iN);
				}
				else {
					this.fieldError(iN);
				}
			}

			// TODO: needs to be tested
			// checkbox/radio validation
			else if(u.hc(iN.field, "checkbox|boolean|radiobuttons")) {

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

				// location is typically a three input structure
				// try to validate all three
				var loc_fields = 0;

				// location input
				if(iN.field._input) {

					loc_fields++;

					min = 1;
					max = 255;

					if(
						iN.field._input.val().length >= min &&
						iN.field._input.val().length <= max
					) {
						this.fieldCorrect(iN.field._input);
					}
					else {
						this.fieldError(iN.field._input);
					}
				}

				// latitude input
				if(iN.field.lat_input) {

					loc_fields++;

					min = -90;
					max = 90;

					if(
						!isNaN(iN.field.lat_input.val()) && 
						iN.field.lat_input.val() >= min && 
						iN.field.lat_input.val() <= max
					) {
						this.fieldCorrect(iN.field.lat_input);
					}
					else {
						this.fieldError(iN.field.lat_input);
					}
				}

				// longitude input
				if(iN.field.lon_input) {

					loc_fields++;

					min = -180;
					max = 180;

					if(
						!isNaN(iN.field.lon_input.val()) && 
						iN.field.lon_input.val() >= min && 
						iN.field.lon_input.val() <= max
					) {
						this.fieldCorrect(iN.field.lon_input);
					}
					else {
						this.fieldError(iN.field.lon_input);
					}
				}

				// any errors after validation
				if(u.qsa("input.error", iN.field).length) {

					u.rc(iN.field, "correct");
					u.ac(iN.field, "error");
				}
				// are all fields correct, then apply field correct state
				else if(u.qsa("input.correct", iN.field).length == loc_fields) {

					u.ac(iN.field, "correct");
					u.rc(iN.field, "error");
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
					u.hc(iN, "uploaded") ||
					(iN.val().length >= min && 
					iN.val().length <= max)
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

}


// Implement FormData method for Metro project

// get params from form
// optional parameters as object
// type - any defined type.
// - parameters - regular parameter string (default)
// - json - json object based on input names with endless nesting
// - optional local extension
// ignore_inputs - input classnames to identify inputs to ignore, multiple classes can be | seperated (string is used as regular expression)
u.f.getParams = function(form, _options) {


	// default values
	var send_as = "params";
	var ignore_inputs = "ignoreinput";

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {

				case "ignore_inputs"    : ignore_inputs     = _options[_argument]; break;
				case "send_as"          : send_as           = _options[_argument]; break;
			}

		}
	}


	// get inputs
	var i, input, select, textarea, param, params;

	// Object for found inputs/selects/textareas
	// iOS treats FormData as object
	if(send_as == "formdata" && (typeof(window.FormData) == "function" || typeof(window.FormData) == "object")) {
		params = new FormData();

	}
	else {
		// browser doesn't support formdata
		if(send_as == "formdata") {
			send_as == "params";
		}

		params = new Object();
		// create dummy function (but keep optional filename for compatibility)
		params.append = function(name, value, filename) {
			this[name] = value;
		}
	}

	// add submit button to params if available
	if(form._submit_button && form._submit_button.name) {
		params.append(form._submit_button.name, form._submit_button.value);
	}


	var inputs = u.qsa("input", form);
	var selects = u.qsa("select", form)
	var textareas = u.qsa("textarea", form)

	// get all inputs
	for(i = 0; input = inputs[i]; i++) {

		// exclude specific inputs (defined by ignore_inputs)
		if(!u.hc(input, ignore_inputs)) {

			// if checkbox/radio and node is checked
			if((input.type == "checkbox" || input.type == "radio") && input.checked) {

				if(typeof(input.val) == "function") {
//						u.bug("value:" + u.nodeId(input) + "=" + input.val())
					params.append(input.name, input.val());
//						params[input.name] = input.val();
				}
				else {
					params.append(input.name, input.value);
					//params[input.name] = input.value;
				}

			}
			// file input
			else if(input.type == "file") {

				var f, file, files;
				
				if(typeof(input.val) == "function") {
					files = input.val();
				}
				else {
					files = input.value;
				}

				if(files) {
					// append files individually
					for(f = 0; file = files[f]; f++) {
	//						u.bug("value:" + u.nodeId(input) + "=" + file)
	//						params.append(input.name.replace(/\[\]/, "")+"["+f+"]", file, file.name);

						// PHP should be able to handle it like this
						params.append(input.name, file, file.name);
					}
				}
				else {
					params.append(input.name, "");
				}

			}

			// if anything but buttons and radio/checkboxes
			// - hidden, text, html5 input-types
			else if(!input.type.match(/button|submit|reset|file|checkbox|radio/i)) {

				if(typeof(input.val) == "function") {
//						u.bug("value:" + u.nodeId(input) + "=" + input.val())
					params.append(input.name, input.val());
				}
				else {
					params.append(input.name, input.value);
				}
			}
		}
	}

	for(i = 0; select = selects[i]; i++) {
		// exclude specific inputs (defined by ignore_inputs)
		if(!u.hc(select, ignore_inputs)) {

			if(typeof(select.val) == "function") {
//					u.bug("value:" + u.nodeId(select) + "=" + select.val())
				params.append(select.name, select.val());
			}
			else {
				params.append(select.name, select.options[select.selectedIndex].value);
			}
		}
	}

	for(i = 0; textarea = textareas[i]; i++) {
		// exclude specific inputs (defined by ignore_inputs)
		if(!u.hc(textarea, ignore_inputs)) {

			if(typeof(textarea.val) == "function") {
//					u.bug("value:" + u.nodeId(textarea) + "=" + textarea.val())
				params.append(textarea.name, textarea.val());
			}
			else {
				params.append(textarea.name, textarea.value);
			}
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

	// return as or formdata
	else if(send_as == "formdata") {

		return params;
	}

	// return as js object
	else if(send_as == "object") {

		// remove append function before returning object
		params.append = null;

		return params;
	}

	// return as parameter string
	// send_as == "params" (or unknown send_as type)
	else {

//			u.xInObject(params);

		var string = "";
		for(param in params) {
//				u.bug("param:" + typeof(params[param]) + ", " + param)
			if(typeof(params[param]) != "function") {
				string += (string ? "&" : "") + param + "=" + encodeURIComponent(params[param]);
			}
		}
		return string;

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
ADD to u-form-builder in v0.9
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
	else if(field_type == "checkbox") {
		var input = u.ae(field, "input", {"id":input_id, "value":"true", "name":field_name, "type":field_type});
		var label = u.ae(field, "label", {"for":input_id, "html":field_label});
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


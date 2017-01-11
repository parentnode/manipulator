Util.Form = u.f = new function() {

	// create extension object
	// this is used to add custom init, validate and send methods to the form module
	this.customInit = {};
	this.customValidate = {};
	this.customSend = {};
	this.customHintPosition = {};



	// extensive activation of form
	// indexes fields and actions (inputs and buttons)
	// - adds realtime validation, by settng correct/error classname
	// - sets focus classname on field focus
	// - adds callback
	this.init = function(_form, _options) {
//		u.bug("init form:" + u.nodeId(_form));

		var i, j, field, action, input, hidden_field;


		// check for type of "form"
		// on some systems there is ONE universal form - this allows for pseudo forms, represented by a div
		if(_form.nodeName.toLowerCase() != "form") {

			// look for form 
			_form.native_form = u.pn(_form, {"include":"form"});

			// a "form" must have parent form
			if(!_form.native_form) {
				u.bug("there is no form in this document??");
				return;
			}

		}

		// form is actual form
		else {

			// make sure native_form can be used
			_form.native_form = _form;
		}


		// Default values

		// field focus z-index
		_form._focus_z_index = 50;
		_form._hover_z_index = 49;

		// validate fields continuously and when submitting
		_form._validation = true;

		// u.bug list form.fields and form.actions
		_form._debug_init = false;

		// additional info passed to function as JSON object
		if(typeof(_options) == "object") {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {

					case "validation"       : _form._validation      = _options[_argument]; break;
					case "focus_z"          : _form._focus_z_index   = _options[_argument]; break;

					case "debug"            : _form._debug_init      = _options[_argument]; break;
				}
			}
		}

		// disable regular form submit
		_form.native_form.onsubmit = function(event) {
			// if submit event comes from _form element, do not submit
			// but allow submit for other elements (in cases of global form usage like sharepoint/.net)
			if(event.target._form) {
				return false;
			}
		}

		// do not use HTML5 validation
		// we'll do all validation internally
		_form.native_form.setAttribute("novalidate", "novalidate");

		// set submit reference to internal submit handler
		// but keep reference to DOM submit
		_form.DOMsubmit = _form.native_form.submit;
		_form.submit = this._submit;


		// set reset reference to internal reset handler
		// but keep reference to DOM reset
		_form.DOMreset = _form.native_form.reset;
		_form.reset = this._reset;


		// objects for fields and actions
		// all named fields and buttons can be accessed through this objects
		_form.fields = {};
		_form.actions = {};
		_form.error_fields = {};

		// Label styles - defines special handling of label values
		// specified via form classname as labelstyle:inject
		// Currently implemented: none or inject
		_form.labelstyle = u.cv(_form, "labelstyle");


		// get all fields
		var fields = u.qsa(".field", _form);
		for(i = 0; field = fields[i]; i++) {
//			u.bug("field found:" + u.nodeId(field))


			// get field original z-index
			field._base_z_index = u.gcs(field, "z-index");


			// find help (hints and errors)
			field._help = u.qs(".help", field);
			field._hint = u.qs(".hint", field);
			field._error = u.qs(".error", field);


			// Add required indicator (for showing icons)
			field._indicator = u.ae(field, "div", {"class":"indicator"});


			// Implementing support for non-manipulator system HTML output
			// This allows for Manipulator form to run on HTML output which cannot be fine-tuned serverside
			if(typeof(u.f.fixFieldHTML) == "function") {
				u.f.fixFieldHTML(field);
			}


			// setup field status
			field._initialized = false;


			// check for custom inits
			// allows to overwrite any field type or built custom field types
			var custom_init;
			for(custom_init in this.customInit) {
				if(u.hc(field, custom_init)) {
					this.customInit[custom_init](_form, field);
					field._initialized = true;
				}
			}


			// do not perform other inits if custom init was executed
			if(!field._initialized) {


				// regular inputs initialization
				if(u.hc(field, "string|email|tel|number|integer|password|date|datetime")) {

					field._input = u.qs("input", field);
					field._input._form = _form;
					field._input.field = field;

					// add input to fields array
					_form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for='"+field._input.id+"']", field);

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
					field._input._form = _form;
					field._input.field = field;

					// add input to fields array
					_form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for='"+field._input.id+"']", field);

					// get/set value function
					field._input.val = this._value;

					// resize textarea while typing
					if(u.hc(field, "autoexpand")) {

						// no scrollbars on auto expanded fields
						var current_height = parseInt(u.gcs(field._input, "height"));
//						u.bug("AE current_height:" + current_height + "," + iN.scrollHeight);

						// save current value while calculating height offset
						var current_value = field._input.val();

						field._input.value = "";
						u.as(field._input, "overflow", "hidden");
				//		u.bug(current_height + "," + iN.scrollHeight);

						// get textarea height value offset - webkit and IE/Opera scrollHeight differs from height
						// implenting different solutions is the only way to achive similar behaviour across browsers
						// fallback support is Mozilla 

						field._input.autoexpand_offset = 0;
						if(parseInt(u.gcs(field._input, "height")) != field._input.scrollHeight) {
							field._input.autoexpand_offset = field._input.scrollHeight - parseInt(u.gcs(field._input, "height"));
						}

						// set existing value again
						field._input.value = current_value;

						// set correct height
						field._input.setHeight = function() {
//							u.bug("field._input.setHeight:" + u.nodeId(this) + ", this.scrollHeight:" + this.scrollHeight + ", " + this.autoexpand_offset + ", " + this.scrollWidth + ", " + this.scrollTop);

							var textarea_height = parseInt(u.gcs(this, "height"));

//							u.bug("browser:" + u.browser())

							if(this.val()) {
								if(u.browser("webkit") || u.browser("firefox", ">=29")) {
//									u.bug("webkit model")
									if(this.scrollHeight - this.autoexpand_offset > textarea_height) {
										u.a.setHeight(this, this.scrollHeight);
									}
								}
								else if(u.browser("opera") || u.browser("explorer")) {
//									u.bug("opera model")
									if(this.scrollHeight > textarea_height) {
										u.a.setHeight(this, this.scrollHeight);
									}
								}
								else {
//									u.bug("fallback model")
									u.a.setHeight(this, this.scrollHeight);
								}
							}
						}

						u.e.addEvent(field._input, "keyup", field._input.setHeight);

						field._input.setHeight();

//						this.autoExpand(field._input);
					}

					// change/update events
					u.e.addEvent(field._input, "keyup", this._updated);
					u.e.addEvent(field._input, "change", this._changed);

					// activate input
					this.activateInput(field._input);

					// validate field now
					this.validate(field._input);

				}

				// select initialization
				else if(u.hc(field, "select")) {

					field._input = u.qs("select", field);
					field._input._form = _form;
					field._input.field = field;

					// add input to fields array
					_form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for='"+field._input.id+"']", field);

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
					field._input._form = _form;
					field._input.field = field;

					// get input label
					field._input._label = u.qs("label[for='"+field._input.id+"']", field);

					// add input to fields array
					_form.fields[field._input.name] = field._input;

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
					_form.fields[field._input.name] = field._input;

					// initalize individual radio buttons
					for(j = 0; input = field._inputs[j]; j++) {
						input.field = field;
						input._form = _form;

						// get input label
						input._label = u.qs("label[for='"+input.id+"']", field);

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
					field._input._form = _form;
					field._input.field = field;

					// add input to fields array
					_form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for='"+field._input.id+"']", field);

					// change and update event
					u.e.addEvent(field._input, "change", this._updated);
					u.e.addEvent(field._input, "change", this._changed);




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

					// get/set value function
					field._input.val = this._value_file;

					// validate field now
					this.validate(field._input);

				}


				// when these gets extended they should end up as custom initializers


				// tags initialization (standard Janitor implementation)
				// currently identical to string - but keep separate for customization
				else if(u.hc(field, "tags")) {

					field._input = u.qs("input", field);
					field._input._form = _form;
					field._input.field = field;

					// add input to fields array
					_form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for='"+field._input.id+"']", field);

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
					field._input._form = _form;
					field._input.field = field;

					// add input to fields array
					_form.fields[field._input.name] = field._input;

					// get input label
					field._input._label = u.qs("label[for='"+field._input.id+"']", field);

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
		var hidden_fields = u.qsa("input[type=hidden]", _form);
		for(i = 0; hidden_field = hidden_fields[i]; i++) {

			// do not overwrite fields index with hidden field
			if(!_form.fields[hidden_field.name]) {
				_form.fields[hidden_field.name] = hidden_field;

				// add get/set value funtion
				hidden_field.val = this._value;
			}
		}


		// get all actions
		var actions = u.qsa(".actions li input[type=button],.actions li input[type=submit],.actions li input[type=reset],.actions li a.button", _form);
		for(i = 0; action = actions[i]; i++) {

			// make sure even a.buttons knows form
			// IE 8 cannot redeclare form on form-elements
//			if(!action.form) {
				action._form = _form;
//			}

			// activate button, adding focus and blur
			this.activateButton(action);

		}


		// u.bug list of fields and actions
		if(_form._debug_init) {
			u.bug(u.nodeId(_form) + ", fields:");
			u.xInObject(_form.fields);
			u.bug(u.nodeId(_form) + ", actions:");
			u.xInObject(_form.actions);
		}

	}


	// Reset
	// internal reset handler - attatched to form as form.reset
	// original form.reset will be available as form.DOMreset
	this._reset = function (event, iN) {

//		u.bug("reset")

		// do pre validation of all fields
		for (name in this.fields) {
			if (this.fields[name] && this.fields[name].field && this.fields[name].type != "hidden" && !this.fields[name].getAttribute("readonly")) {

//				u.bug("reset:" + name);
				this.fields[name].used = false;
				this.fields[name].val("");

			}
		}
	}



	// Submit
	// internal submit handler - attatched to form as form.submit
	// original form.submit will be available as form.DOMsubmit
	this._submit = function(event, iN) {

//		u.bug("_submitted:" + this._validation)

		// do pre validation of all fields
		for(name in this.fields) {
			// make sure field actually references a valid Manipulator input
			if(this.fields[name] && this.fields[name].field && typeof(this.fields[name].val) == "function") {
//				u.bug("field:" + name);
				// change used state for input
				this.fields[name].used = true;
				// validate
//				u.bug("validate from _submit")
				u.f.validate(this.fields[name]);
			}
		}

//		u.bug("submitted");
//		console.log(iN ? iN : this.fields[Object.keys(this.error_fields)[0]])

		// if error is found after validation
		if(!Object.keys(this.error_fields).length) {

//			this.updateFormValidationState(iN ? iN : this.fields[Object.keys(this.error_fields)[0]]);

//		}
//		else {
			// does callback exist
			if(typeof(this.submitted) == "function") {
				this.submitted(iN);
			}
			// actual submit
			else {

				// Prevent from sending default values when form is submitted without javascript
				// and labelstyle:inject is applied
				for(name in this.fields) {
//					u.bug(name + ", " + this.fields[name] + ", " + this.fields[name].default_value + ", " + typeof(this.fields[name].val) + "; " + this.fields[name].val())
						
					// element does not have value
					if(this.fields[name] && this.fields[name].default_value && typeof(this.fields[name].val) == "function" && !this.fields[name].val()) {
						// input is actually input
						if(this.fields[name].nodeName.match(/^(input|textarea)$/i)) {
							this.fields[name].value = "";
						}
					}
				}

				//u.bug("this is where I should cut the rope")
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
			for(i = 0; option = this.field._inputs[i]; i++) {

				// finding it not unlikely that radio value could be strings "true"/"false"
				// compensate for forgetting the string aspect of true/false
				if(option.value == value || (option.value == "true" && value) || (option.value == "false" && value === false)) {
					option.checked = true;

					// validate after setting value
					u.f.validate(this);
				}
				// uncheck (to ensure reset works)
				else {
					option.checked = false;
				}

			}
		}
		// find checked option
		else {
			for(i = 0; option = this.field._inputs[i]; i++) {
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
	// value get/setter for selects
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
			// deselect but no empty value option
			if (value === "") {
				this.selectedIndex = -1;
				u.f.validate(this);
				return -1;
			}

			return false;
		}
		else {
			return (this.selectedIndex >= 0 && this.default_value != this.options[this.selectedIndex].value) ? this.options[this.selectedIndex].value : "";
		}
	}
	// value get/setter for file inputs
	this._value_file = function(value) {
		if(value !== undefined) {
			this.value = value;
//				alert('adding values manually to input type="file" is not supported')

			// resetting like this is not crossbrowser safe
			if (value === "") {
				this.value = null;
			}
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
				this._form.submitInput = this;
				// delete any previous submit info
				this._form.submitButton = false;

				// internal submit
				this._form.submit(event, this);
			}
		}

		u.e.addEvent(node, "keydown", node.keyPressed);
	}

	// submit form when [ENTER] is pressed on button
	this.buttonOnEnter = function(node) {
		node.keyPressed = function(event) {
//			u.bug("keypressed:" + event.keyCode);

			// ENTER key
			if(event.keyCode == 13 && !u.hc(this, "disabled") && typeof(this.clicked) == "function") {
				u.e.kill(event);

				this.clicked(event);
//				u.bug("[ENTER] pressed:" + u.nodeId(this));

				// store submit info
				// this._form.submit_input = false;
				// // delete any previous submit info
				// this._form.submit_button = this;
				//
				// // internal submit
				// this._form.submit(event);
			}
		}

		u.e.addEvent(node, "keydown", node.keyPressed);
	}




	// Event handlers


	// internal - input is changed (onchange event) - attached to input
	this._changed = function(event) {
//		u.bug("value changed:" + this.name + ":" + event.type);

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

		// does field have callback declared
		if(typeof(this.field.changed) == "function") {
			this.field.changed(this);
		}

		// does form have callback declared
		if(typeof(this._form.changed) == "function") {
			this._form.changed(this);
		}
	}
	// internal - input is updated (onkeyup event) - attached to input
	this._updated = function(event) {
//		u.bug("value updated:" + this.name + ":" + event.type);

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

			// does field have callback declared
			if(typeof(this.field.updated) == "function") {
				this.field.updated(this);
			}

			// does form have callback declared
			if(typeof(this._form.updated) == "function") {
				this._form.updated(this);
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
		u.as(this.field, "zIndex", this.field._input._form._hover_z_index);

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
//		u.bug("this._focus:" + u.nodeId(this) + ", " + typeof(this.focused) +","+ typeof(this.field._input.focused))

		this.field.is_focused = true;
		this.is_focused = true;

		u.ac(this.field, "focus");
		u.ac(this, "focus");

		// make sure field goes all the way in front - hint/error must be seen
		u.as(this.field, "zIndex", this._form._focus_z_index);

		// is help element available, then position it appropriately to input
		u.f.positionHint(this.field);


		// callbacks
		// does input have callback
		if(typeof(this.focused) == "function") {
//			u.bug("should call back")
			this.focused();
		}
		// certain fields with multiple input will have callback declared on first input only
		// like radio buttons
		else if(this.field._input && typeof(this.field._input.focused) == "function") {
			this.field._input.focused(this);
		}

		// does form have callback declared
		if(typeof(this._form.focused) == "function") {
			this._form.focused(this);
		}
	}
	// internal blur handler - attatched to inputs
	this._blur = function(event) {
//		u.bug("this._blur:" + u.nodeId(this))

		this.field.is_focused = false;
		this.is_focused = false;

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
		if(typeof(this._form.blurred) == "function") {
			this._form.blurred(this);
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
		if(typeof(this._form.focused) == "function") {
			this._form.focused(this);
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
		if(typeof(this._form.blurred) == "function") {
			this._form.blurred(this);
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
			
			// check for custom hint position
			// allows to overwrite any field type hint position
			var custom_hint_position;
			for(custom_hint_position in this.customHintPosition) {
				if(u.hc(field, custom_hint_position)) {
					this.customHintPosition[custom_hint_position](field._form, field);
					return;
				}
			}
			

			var input_middle, help_top;

 			if(u.hc(field, "html")) {
				input_middle = field._editor.offsetTop + (field._editor.offsetHeight / 2);
			}
			else {
				input_middle = field._input.offsetTop + (field._input.offsetHeight / 2);
			}

			help_top = input_middle - field._help.offsetHeight / 2;
			u.as(field._help, "top", help_top + "px");
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
		if(iN._form.labelstyle == "inject") {

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

		// if submit or reset button, make sure it does not submit form without validation or reset native form, when form is a pseudo form
		if(action.type && action.type == "submit" || action.type == "reset") {
			// need to cancel onclick event to avoid normal post in older browsers where killing mouseup/down is not enough
			action.onclick = function(event) {
				u.e.kill(event ? event : window.event);
			}
		}

		// handle button click
		u.ce(action);

		// apply action if action has not already been declared
		if(!action.clicked) {


			// default handling - can be overwritten in local implementation
			action.clicked = function(event) {
				u.e.kill(event);

				// don't execute if button is disabled
				if(!u.hc(this, "disabled")) {
					if(this.type && this.type.match(/submit/i)) {

						// store submit button info
						this._form._submit_button = this;
						// remove any previous submit info
						this._form._submit_input = false;

						// internal submit
						this._form.submit(event, this);
					}
					else if (this.type && this.type.match(/reset/i)) {

						// store submit button info
						this._form._submit_button = false;
						// remove any previous submit info
						this._form._submit_input = false;

						// internal submit
						this._form.reset(event, this);
					}

					// TODO: what is default action when not a submit button??
					else {
						location.href = this.url;
					}
				}
			}
			
		}

		// handle [ENTER] on button
		this.buttonOnEnter(action);


		// add to actions index if button has a name
		var action_name = action.name ? action.name : action.parentNode.className;
		if(action_name) {
			action._form.actions[action_name] = action;
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

//		u.bug("updateDefaultState for:" + u.nodeId(iN) + ", " + (iN.val() === "") + ", " + iN.is_focused)
		// is input focused
		if(iN.is_focused || iN.val() !== "") {

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

			iN._form.error_fields[iN.name] = true;

			this.updateFormValidationState(iN);

// 			// input validation failed
// 			if(typeof(iN.validationFailed) == "function") {
// 				iN.validationFailed();
// 			}
//
// 			if(typeof(iN._form.validationFailed) == "function") {
// //				u.bug("fieldError validation failed")
// 				iN._form.validationFailed(iN._form.error_fields);
// 			}

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

		delete iN._form.error_fields[iN.name];

		this.updateFormValidationState(iN);

		// if(!Object.keys(iN._form.error_fields).length) {
		// 	if(typeof(iN._form.validationPassed) == "function") {
		// 		iN._form.validationPassed();
		// 	}
		// }
		// else {
		// 	if(typeof(iN._form.validationFailed) == "function") {
		// 		iN._form.validationFailed(iN._form.error_fields);
		// 	}
		// }
	}

	// check current state of validation
	// check for errors
	// make sure required fields are filled out
	this.checkFormValidation = function(form) {

		if(Object.keys(form.error_fields).length) {
			return false;
		}

		var x, field;
		for(x in form.fields) {
			input = form.fields[x];
			if(input.field && u.hc(form.fields[x].field, "required") && !u.hc(form.fields[x].field, "correct")) {
				return false;
			}
		}

		return true;
	}

	this.updateFormValidationState = function(iN) {
		if(this.checkFormValidation(iN._form)) {

			if(typeof(iN.validationPassed) == "function") {
				iN.validationPassed();
			}

			if(typeof(iN.field.validationPassed) == "function") {
				iN.field.validationPassed();
			}

			if(typeof(iN._form.validationPassed) == "function") {
				iN._form.validationPassed();
			}

			return true;
		}
		else {

			if(typeof(iN.validationFailed) == "function") {
				iN.validationFailed(iN._form.error_fields);
			}

			if(typeof(iN.field.validationFailed) == "function") {
				iN.field.validationFailed(iN._form.error_fields);
			}

			if(typeof(iN._form.validationFailed) == "function") {
				iN._form.validationFailed(iN._form.error_fields);
			}

			return false;
		}

	}
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
		if(!iN._form._validation) {
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

				if(iN.val() !== "") {
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


			// TODO: move to custom inputs
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

			// TODO: move to custom inputs
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
u.f.getParams = function(_form, _options) {


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
	if(_form._submit_button && _form._submit_button.name) {
		params.append(_form._submit_button.name, _form._submit_button.value);
	}


	var inputs = u.qsa("input", _form);
	var selects = u.qsa("select", _form)
	var textareas = u.qsa("textarea", _form)

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
		return this.customSend[send_as](params, _form);
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
		delete params.append;

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




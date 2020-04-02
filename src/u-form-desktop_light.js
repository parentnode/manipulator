Util.Form = u.f = new function() {

	// create extension objects
	// this is used to add 
	// - custom fields (customInit and customValidate)
	// - custom data export types (customDataFormat)
	// - hint positioning (customHintPosition)
	//
	// Label styles not supported for desktop_light
	// See u-form-custom for examples of usage
	this.customInit = {};
	this.customValidate = {};
	this.customDataFormat = {};
	this.customHintPosition = {};


	// extensive activation of form
	// indexes fields and actions (inputs and buttons)
	// - adds realtime validation, by setting correct/error classname
	// - sets focus classname on field focus
	// - adds callback
	//
	// form is a reserved property, so we use _form
	this.init = function(_form, _options) {
		// u.bug("init form:", _form);

		var i, j, field, action, input, hidden_input;


		// enter initialization (bulk operation) state
		// When initializing the form less feedback will be routed through to callbacks methods
		// to avoid callbacks with partial validation result
		// The bulk operation state will be exited when all fields have been validated
		_form._bulk_operation = true;


		// check for type of "form"
		// on some systems there is ONE universal form, covering the whole page
		// Manipulator allows for pseudo forms, represented in scope by a div
		// - But there must always be a form element, wrapping the inputs
		if(_form.nodeName.toLowerCase() != "form") {

			// look for form 
			_form.native_form = u.pn(_form, {"include":"form"});

			// a "form" must have parent form
			if(!_form.native_form) {
				u.bug("there is no form in this document??");
				return;
			}

		}

		// form is actual form element
		else {

			// make sure native_form can be used
			_form.native_form = _form;
		}


		// Default values

		// field focus z-index
		_form._focus_z_index = 50;

		// validate fields continuously and when submitting
		_form._validation = true;

		// u.bug list form.inputs and form.actions
		_form._debug = false;


		// Callbacks
		_form._callback_ready = "ready";
		_form._callback_submitted = "submitted";
		_form._callback_pre_submitted = "preSubmitted";
		_form._callback_resat = "resat";

		_form._callback_updated = "updated";
		_form._callback_changed = "changed";
		_form._callback_blurred = "blurred";
		_form._callback_focused = "focused";

		_form._callback_input_validation_failed = "inputValidationFailed";
		_form._callback_input_validation_passed = "inputValidationPassed";
		_form._callback_validation_failed = "validationFailed";
		_form._callback_validation_passed = "validationPassed";


		// additional info passed to function as JSON object
		if(obj(_options)) {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {

					case "validation"               : _form._validation                = _options[_argument]; break;
					case "debug"                    : _form._debug                     = _options[_argument]; break;

					case "focus_z"                  : _form._focus_z_index             = _options[_argument]; break;

					case "callback_ready"           : _form._callback_ready            = _options[_argument]; break;
					case "callback_submitted"       : _form._callback_submitted        = _options[_argument]; break;
					case "callback_pre_submitted"   : _form._callback_pre_submitted    = _options[_argument]; break;
					case "callback_resat"           : _form._callback_resat            = _options[_argument]; break;

					case "callback_updated"         : _form._callback_updated          = _options[_argument]; break;
					case "callback_changed"         : _form._callback_changed          = _options[_argument]; break;
					case "callback_blurred"         : _form._callback_blurred          = _options[_argument]; break;
					case "callback_focused"         : _form._callback_focused          = _options[_argument]; break;

					case "callback_input_validation_failed"   : _form._callback_input_validation_failed    = _options[_argument]; break;
					case "callback_input_validation_passed"   : _form._callback_input_validation_passed    = _options[_argument]; break;
					case "callback_validation_failed"         : _form._callback_validation_failed          = _options[_argument]; break;
					case "callback_validation_passed"         : _form._callback_validation_passed          = _options[_argument]; break;
				}
			}
		}

		// make sure hover is below focus z-index
		_form._hover_z_index = _form._focus_z_index - 1;


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


		// Map getData shortcut to _form
		_form.getData = function(_options) {
			return u.f.getFormData(this, _options);
		}


		// objects for inputs and actions
		// all named fields and buttons can be accessed through this objects
		_form.inputs = {};
		_form.actions = {};


		// internal error bookkeeper
		_form._error_inputs = {};


		// Index proper fields (in correct markup) first – the have presedence over hidden inputs
		// get all fields
		var fields = u.qsa(".field", _form);
		for(i = 0; i < fields.length; i++) {
			field = fields[i];

			// u.bug("field found:", field);
			u.f.initField(_form, field);

		}



		// reference hidden fields to allow accessing them through form fields array
		var hidden_inputs = u.qsa("input[type=hidden]", _form);
		for(i = 0; i < hidden_inputs.length; i++) {
			hidden_input = hidden_inputs[i];

			// do not overwrite inputs index with hidden input
			// (fx frequently checkboxes has a shadow input to ensure checked state is sent)
			if(!_form.inputs[hidden_input.name]) {
				_form.inputs[hidden_input.name] = hidden_input;

				// map internal form reference
				hidden_input._form = _form;

				// add get/set value funtion
				hidden_input.val = this._value;
			}
		}


		// get all actions
		var actions = u.qsa(".actions li input[type=button],.actions li input[type=submit],.actions li input[type=reset],.actions li a.button", _form);
		for(i = 0; i < actions.length; i++) {
			action = actions[i];

			// u.bug("button found:", action);
			this.initButton(_form, action);

		}


		// Set up asynchronous initial bulk validation
		// To receive one single callback on first validation
		// (also to allow declaration of callback methods, which can only be mapped to inputs after u.f.init, 
		// so by delaying validation, main thread is allowed to continue before validate is envoked) 
		u.t.setTimer(_form, function() {

			var validate_inputs = [];
			for(input in this.inputs) {

				// Collect fields for bulk validation
				if(this.inputs[input].field) {
					validate_inputs.push(this.inputs[input]);
				}
			}

			// Perform bulk validation (now issuing relevant callbacks)
			u.f.bulkValidate(validate_inputs);


			// Dedault debug output
			if(_form._debug) {
				u.bug(_form, "inputs:", _form.inputs, "actions:", _form.actions);
			}

			// Make ready callback if required for animation timing
			if(fun(this[this._callback_ready])) {
				this[this._callback_ready]();
			}

		}, 100);

	}


	// Initialize field
	// will be used for all initial fields, but can also be used to add more fields after first initialization
	this.initField = function(_form, field) {
		// u.bug("initField:", field);


		// Let field know about it's form
		field._form = _form;


		// get field original z-index
		field._base_z_index = u.gcs(field, "z-index");


		// find help (hints and errors)
		field.help = u.qs(".help", field);
		field.hint = u.qs(".hint", field);
		field.error = u.qs(".error", field);


		// choose first label as primary field label
		field.label = u.qs("label", field);


		// Add required indicator (for showing icons)
		field.indicator = u.ae(field.label, "span", {"class":"indicator", "html":"&nbsp;*"});


		// Implementing support for non-manipulator system HTML output
		// This allows for Manipulator form to run on HTML output which cannot be fine-tuned serverside
		if(fun(u.f.fixFieldHTML)) {
			u.f.fixFieldHTML(field);
		}


		// setup field status
		field._custom_initialized = false;

		// check for custom inits
		// precedence allows to overwrite any default field type
		var custom_init;
		for(custom_init in this.customInit) {

			// u.bug("custom field", custom_init);
			if(u.hc(field, custom_init)) {

				// u.bug("custom field match", field.className);
				this.customInit[custom_init](field);
				field._custom_initialized = true;
				break;

			}

		}


		// do not perform other inits if custom init was executed
		if(!field._custom_initialized) {
			// u.bug("standard field", field.className);


			/**
			* DEFAULT INITIALIZATIONS 
			* - string
			* - email
			* - tel
			* - number
			* - integer
			* - password
			* - date
			* - datetime
			* - text
			* - select
			* - radiobuttons
			* - checkbox
			* - boolean
			* - files
			*/


			// regular inputs initialization
			if(u.hc(field, "string|email|tel|number|integer|password|date|datetime")) {

				// Register field type
				field.type = field.className.match(/(?:^|\b)(string|email|tel|number|integer|password|date|datetime)(?:\b|$)/)[0];

				// Get primary input
				field.input = u.qs("input", field);
				// form is a reserved property, so we use _form
				field.input._form = _form;
				// Get associated label
				field.input.label = u.qs("label[for='"+field.input.id+"']", field);
				// Let it know it's field
				field.input.field = field;

				// get/set value function
				field.input.val = this._value;

				// change/update(keyup) events to generic callback handler
				u.e.addEvent(field.input, "keyup", this._updated);
				u.e.addEvent(field.input, "change", this._changed);

				// submit on enter (checks for autocomplete etc)
				this.inputOnEnter(field.input);

				// Add additional standard event listeners and labelstyle
				this.activateInput(field.input);

			}

			// textarea initialization
			else if(u.hc(field, "text")) {

				// Register field type
				field.type = "text";

				// Get primary input
				field.input = u.qs("textarea", field);
				// form is a reserved property, so we use _form
				field.input._form = _form;
				// Get associated label
				field.input.label = u.qs("label[for='"+field.input.id+"']", field);
				// Let it know it's field
				field.input.field = field;

				// get/set value function
				field.input.val = this._value;

				// resize textarea while typing
				if(u.hc(field, "autoexpand")) {

					// no scrollbars on auto expanded fields
					var current_height = parseInt(u.gcs(field.input, "height"));
					// u.bug("AE current_height:" + current_height + "," + iN.scrollHeight);

					// save current value while calculating height offset
					var current_value = field.input.val();

					field.input.value = "";
					u.as(field.input, "overflow", "hidden");
					// u.bug(current_height + "," + iN.scrollHeight);

					// get textarea height value offset - webkit and IE/Opera scrollHeight differs from height
					// implenting different solutions is the only way to achive similar behaviour across browsers
					// fallback support is Mozilla 

					field.input.autoexpand_offset = 0;
					if(parseInt(u.gcs(field.input, "height")) != field.input.scrollHeight) {
						field.input.autoexpand_offset = field.input.scrollHeight - parseInt(u.gcs(field.input, "height"));
					}

					// set existing value again
					field.input.value = current_value;

					// set correct height
					field.input.setHeight = function() {
						// u.bug("field.input.setHeight:", this);
						// u.bug("this.scrollHeight:" + this.scrollHeight + ", " + this.autoexpand_offset + ", " + this.scrollWidth + ", " + this.scrollTop);

						var textarea_height = parseInt(u.gcs(this, "height"));

						// u.bug("browser:" + u.browser());

						// Use val function if declared, which it isn't on initial run
						if(this.val()) {

							// Figure out right time to apply height
							if(u.browser("webkit") || u.browser("firefox", ">=29")) {
								// u.bug("webkit model");
								if(this.scrollHeight - this.autoexpand_offset > textarea_height) {

									u.ass(this, {
										"height":this.scrollHeight + "px"
									});

								}
							}
							else if(u.browser("opera") || u.browser("explorer")) {
								// u.bug("opera model");
								if(this.scrollHeight > textarea_height) {

									u.ass(this, {
										"height":this.scrollHeight + "px"
									});

								}
							}
							else {
								// u.bug("fallback model");

								u.ass(this, {
									"height":this.scrollHeight + "px"
								});

							}
						}
					}

					u.e.addEvent(field.input, "keyup", field.input.setHeight);
					field.input.setHeight();
				}

				// change/update events
				u.e.addEvent(field.input, "keyup", this._updated);
				u.e.addEvent(field.input, "change", this._changed);

				// Add additional standard event listeners and labelstyle
				this.activateInput(field.input);

			}

			// select initialization
			else if(u.hc(field, "select")) {

				// Register field type
				field.type = "select";

				// Get primary input
				field.input = u.qs("select", field);
				// form is a reserved property, so we use _form
				field.input._form = _form;
				// Get associated label
				field.input.label = u.qs("label[for='"+field.input.id+"']", field);
				// Let it know it's field
				field.input.field = field;

				// get/set value function
				field.input.val = this._value_select;

				// change/update events
				u.e.addEvent(field.input, "change", this._updated);
				u.e.addEvent(field.input, "keyup", this._updated);
				u.e.addEvent(field.input, "change", this._changed);

				// Add additional standard event listeners and labelstyle
				this.activateInput(field.input);

			}

			// checkbox/boolean (also checkbox) initialization
			else if(u.hc(field, "checkbox|boolean")) {

				// Register field type
				field.type = field.className.match(/(?:^|\b)(checkbox|boolean)(?:\b|$)/)[0];

				// Get primary input
				field.input = u.qs("input[type=checkbox]", field);
				// form is a reserved property, so we use _form
				field.input._form = _form;
				// Get associated label
				field.input.label = u.qs("label[for='"+field.input.id+"']", field);
				// Let it know it's field
				field.input.field = field;

				// get/set value function
				field.input.val = this._value_checkbox;

				// Update checkbox field classname whenever value is changed
				u.f._update_checkbox_field.bind(field.input)();

				// special setting for IE8 and less (bad onchange handler)
				if(u.browser("explorer", "<=8")) {
					field.input.pre_state = field.input.checked;
					field.input._changed = this._changed;
					field.input._updated = this._updated;
					field.input._update_checkbox_field = this._update_checkbox_field;
					field.input._clicked = function(event) {
						if(this.checked != this.pre_state) {
							this._changed(window.event);
							this._updated(window.event);
							this._update_checkbox_field(window.event);
						}
						this.pre_state = this.checked;
					}
					u.e.addEvent(field.input, "click", field.input._clicked);

				}
				else {
					// opposite order of elsewhere to ensure instant validation
					u.e.addEvent(field.input, "change", this._changed);
					u.e.addEvent(field.input, "change", this._updated);
					u.e.addEvent(field.input, "change", this._update_checkbox_field);
				}

				// submit on enter (checks for autocomplete etc)
				this.inputOnEnter(field.input);

				// activate input
				this.activateInput(field.input);

			}

			// radio button initialization
			else if(u.hc(field, "radiobuttons")) {

				// Radio buttons are tricky, because there are multiple inputs but only one name
				// field input reference points to first radio button
				// Requires some extra checks, which are built into all event handlers

				// Register field type
				field.type = "radiobuttons";

				// get all inputs
				field.inputs = u.qsa("input", field);

				// use first input as field input 
				field.input = field.inputs[0];


				// initalize individual radio buttons
				for(j = 0; j < field.inputs.length; j++) {
					input = field.inputs[j];

					// form is a reserved property, so we use _form
					input._form = _form;
					// get input label
					input.label = u.qs("label[for='"+input.id+"']", field);
					// Let it know it's field
					input.field = field;

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
							for(i = 0; i < this.field.input.length; i++) {
								input = this.field.input[i];

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

			}

			// file input initialization
			else if(u.hc(field, "files")) {

				// Register field type
				field.type = "files";

				// Get primary input
				field.input = u.qs("input", field);
				// form is a reserved property, so we use _form
				field.input._form = _form;
				// Get associated label
				field.input.label = u.qs("label[for='"+field.input.id+"']", field);
				// Let it know it's field
				field.input.field = field;

				// get/set value function
				field.input.val = this._value_file;

				// Find or Add filelist for visual file selection feedback
				field.filelist = u.qs("ul.filelist", field);
				if(!field.filelist) {
					field.filelist = u.ae(field, "ul", {"class":"filelist"});
					// position list correctly in field (before help)
					field.insertBefore(field.help, field.filelist);
				}
				// Let filelist know about it's field
				field.filelist.field = field;
				// Get already uploaded files
				// field.uploaded_files = u.qsa("li", field.filelist);
				field.uploaded_files = u.qsa("li.uploaded", field.filelist);

				// Update filelist now
				this._update_filelist.bind(field.input)();


				// change and update event
				u.e.addEvent(field.input, "change", this._updated);
				u.e.addEvent(field.input, "change", this._changed);

				// Update filelist whenever value is changed
				u.e.addEvent(field.input, "change", this._update_filelist);

				// Add additional standard event listeners and labelstyle
				this.activateInput(field.input);

			}

			// UNKNOWN FIELD
			// Give developer a fair chance of finding it
			else {
				u.bug("UNKNOWN FIELD IN FORM INITIALIZATION:", field, field.input);
			}

		}


		// Map generic references for all fields - and validate
		if(field.input) {

			// add input to inputs array
			_form.inputs[field.input.name] = field.input;

			// validate field now (only when form is not being initialized)
			if(!_form._bulk_operation) {
				this.validate(field.input);
			}

		}

	}



	// Initialize button
	// will be used for all initial buttons, but can also be used to add more buttons after first initialization
	this.initButton = function(_form, action) {
		// u.bug("initButton", action);

		// make sure even a.buttons knows form
		action._form = _form;

		// handle [ENTER] on button
		this.buttonOnEnter(action);

		// activate button, adding focus and blur
		this.activateButton(action);

	}



	// Internal base method definitions
	// – will be applied with eventListeners or mapped to form or inputs
	// They should never be invoked directly in the u.f scope.



	// Reset
	// internal reset handler - attatched to form as form.reset
	// original form.reset will be available as form.DOMreset
	this._reset = function(event, iN) {
		// u.bug("RESET:", iN);

		// update value of all fields (except hidden or readonly fields)
		for (name in this.inputs) {
			if (this.inputs[name] && this.inputs[name].field && this.inputs[name].type != "hidden" && !this.inputs[name].getAttribute("readonly")) {

				// u.bug("reset:" + name);
				this.inputs[name]._used = false;
				this.inputs[name].val("");

			}
		}

		// has callback handler been declared
		if(fun(this[this._callback_resat])) {
			this[this._callback_resat](iN);
		}

	}



	// Submit
	// internal submit handler - attatched to form as form.submit
	// original form.submit will be available as form.DOMsubmit
	this._submit = function(event, iN) {
		// u.bug("_submit:", this._validation, iN);

		var validate_inputs = [];

		// do pre validation of all fields
		for(name in this.inputs) {
			// make sure field actually references a valid Manipulator input
			if(this.inputs[name] && this.inputs[name].field && fun(this.inputs[name].val)) {
				// u.bug("field:" + name);

				// change used state for input
				this.inputs[name]._used = true;

				// validate
				validate_inputs.push(this.inputs[name]);

			}
		}

		// Bulk validation (to avoid partial validation callbacks)
		u.f.bulkValidate(validate_inputs);


		// if no error is found after validation
		if(!Object.keys(this._error_inputs).length) {


			// Non obstructive callback before valid "Full" submit
			if(fun(this[this._callback_pre_submitted])) {
				this[this._callback_pre_submitted](iN);
			}


			// has callback handler been declared
			if(fun(this[this._callback_submitted])) {
				this[this._callback_submitted](iN);
			}

			// otherwise actual submit
			else {

				// Prevent from accidentially sending default values when form is submitted without Manipulator
				// (and i.e. labelstyle:inject is applied)
				for(name in this.inputs) {
					// u.bug(name, this.inputs[name]);

					// element does not have value
					if(this.inputs[name] && this.inputs[name].default_value && this.inputs[name].nodeName.match(/^(input|textarea)$/i)) {
						// input is actually input
						if(fun(this.inputs[name].val) && !this.inputs[name].val()) {
							this.inputs[name].value = "";
						}
					}
				}

				// u.bug("this is where I should cut the rope, 2004");
				this.DOMsubmit();
			}
		}
	}



	// Cross type internal get/set value functions 


	// value get/setter for regular inputs
	this._value = function(value) {

		// Set value? (value could be false or 0)
		if(value !== undefined) {
			this.value = value;

			// if actual value, remove default state
			if(value !== this.default_value) {
				u.rc(this, "default");
			}

			// validate after setting value
			u.f.validate(this);
		}

		// Return value
		return (this.value != this.default_value) ? this.value : "";
	}
	// value get/setter for radio buttons
	this._value_radiobutton = function(value) {
		var i, option;

		// Set value? (value could be false or 0)
		if(value !== undefined) {

			// find option with matching value
			for(i = 0; i < this.field.inputs.length; i++) {
				option = this.field.inputs[i];

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

		// Return value if any selected
		for(i = 0; i < this.field.inputs.length; i++) {
			option = this.field.inputs[i];

			if(option.checked) {
				return option.value;
			}
		}

		// default return value
		return "";
	}
	// value get/setter for checkbox inputs
	this._value_checkbox = function(value) {

		// Set value? (value could be false or 0)
		if(value !== undefined) {
			if(value) {
				this.checked = true
			}
			else {
				this.checked = false;
			}

			// Update checkbox field classname whenever value is changed
			u.f._update_checkbox_field.bind(this)();

			// validate after setting value
			u.f.validate(this);
		}

		// Return value if checked
		if(this.checked) {
			return this.value;
		}

		// default return value
		return "";
	}
	// value get/setter for selects
	this._value_select = function(value) {

		// Set value? (value could be false or 0)
		if(value !== undefined) {

			var i, option;
			// find option with matching value option
			for(i = 0; i < this.options.length; i++) {
				option = this.options[i];

				if(option.value == value) {
					this.selectedIndex = i;

					// validate after setting value
					u.f.validate(this);

					return this.options[this.selectedIndex].value;
				}
			}

			// deselect but no empty value option
			if (value === "") {

				// Set to -1 for unselected
				this.selectedIndex = -1;

				// validate after setting value
				u.f.validate(this);

				return "";
			}

		}

		// Return value
		return (this.selectedIndex >= 0 && this.default_value != this.options[this.selectedIndex].value) ? this.options[this.selectedIndex].value : "";
	}
	// value get/setter for file inputs
	this._value_file = function(value) {

		// Set value? (value could be false or 0)
		if(value !== undefined) {

			// resetting like this is not 100% crossbrowser safe, but works most places
			if(value === "") {
				this.value = null;
			}
			else {
				// Let it be known – developer help :-)
				u.bug('ADDING VALUES MANUALLY TO INPUT type="file" IS NOT SUPPORTED IN JAVASCRIPT');
			}
			// Update filelist whenever value is changed
			u.f._update_filelist.bind(this)();

			// validate after setting value
			u.f.validate(this);
		}

		// Return value
		// general support
		if(this.files && this.files.length) {
			var i, file, files = [];

			for(i = 0; i < this.files.length; i++) {
				file = this.files[i];

				files.push(file);
			}
			return files;
		}
		// <= IE9 support
		else if(!this.files && this.value) {
			return this.value;
		}
		// File was already uploaded – custom return value
		else if(this.field.uploaded_files && this.field.uploaded_files.length){
			return true;
		}

		// default 
		return "";
	}



	// Event handlers


	// internal - input is changed (onchange event) - attached to input
	this._changed = function(event) {
		// u.bug("_changed:", this.name, event.type);

		// callbacks
		// does input have callback
		if(fun(this[this._form._callback_changed])) {
			this[this._form._callback_changed](this);
		}
		// certain fields with multiple input will have callback declared on first input only
		// like radio buttons
		else if(fun(this.field.input[this._form._callback_changed])) {
			this.field.input[this._form._callback_changed](this);
		}


		// does form have callback declared
		if(fun(this._form[this._form._callback_changed])) {
			this._form[this._form._callback_changed](this);
		}

	}
	// internal - input is updated (onkeyup event) - attached to input
	this._updated = function(event) {
		// u.bug("_updated:", this.name, event.type);

		// if key is not [TAB], [ENTER], [SHIFT], [CTRL], [ALT]
		if(event.keyCode != 9 && event.keyCode != 13 && event.keyCode != 16 && event.keyCode != 17 && event.keyCode != 18) {
			// u.bug("_updated keyCode:" + event.keyCode);

			// Validate all updates
			u.f.validate(this);


			// callbacks
			// does input have callback
			if(fun(this[this._form._callback_updated])) {
				this[this._form._callback_updated](this);
			}
			// certain fields with multiple input will have callback declared on first input only
			// like radio buttons
			else if(fun(this.field.input[this._form._callback_updated])) {
				this.field.input[this._form._callback_updated](this);
			}


			// does form have callback declared
			if(fun(this._form[this._form._callback_updated])) {
				this._form[this._form._callback_updated](this);
			}

		}

	}
	// internal - checkbox is changed - update field state (for fake checkboxes)
	this._update_checkbox_field = function(event) {
		// u.bug("_update_checkbox_field", this);

		if(this.checked) {
			u.ac(this.field, "checked");
		}
		else {
			u.rc(this.field, "checked");
		}
	}
	// internal - filelist is changed - update visual filelisting
	this._update_filelist = function(event) {
		// u.bug("_update_filelist", this);

		var i;
		var files = this.val();

		// Clear list
		this.field.filelist.innerHTML = "";

		// Add hint or label as visual
		u.ae(this.field.filelist, "li", {"html":this.field.hint ? u.text(this.field.hint) : u.text(this.label), "class":"label"})

		// Selected new files for upload
		if(files && files.length) {
			// u.bug("new files exist:" + this.name);

			u.ac(this.field, "has_new_files");

			var i;

			// Add files to list
			for(i = 0; i < files.length; i++) {
				u.ae(this.field.filelist, "li", {"html":files[i].name, "class":"new"})
			}

			// Keep uploaded files in list for multiple file inputs
			if(this.multiple) {
				for(i = 0; i < this.field.uploaded_files.length; i++) {
					u.ae(this.field.filelist, this.field.uploaded_files[i]);
				}
			}
			

		}
		// Already uploaded files
		else if(this.field.uploaded_files && this.field.uploaded_files.length) {
			// u.bug("old files exist:" + this.name);

			u.rc(this.field, "has_new_files");

			var i;
			// add already uploaded files
			for(i = 0; i < this.field.uploaded_files.length; i++) {
				u.ae(this.field.filelist, this.field.uploaded_files[i]);
			}

		}
		// No files
		else {
			// u.bug("no files exist:" + this.name);

			u.rc(this.field, "has_new_files");

		}

	}

	// internal - mouseenter handler - attatched to inputs
	this._mouseenter = function(event) {
		// u.bug("this._mouseenter:", this);

		u.ac(this.field, "hover");
		u.ac(this, "hover");

		// in case of overlapping hint/errors, make sure this one is on top
		u.as(this.field, "zIndex", this._form._hover_z_index);

		// is help element available, then position it appropriately to input
		u.f.positionHint(this.field);

	}
	// internal - mouseleave handler - attatched to inputs
	this._mouseleave = function(event) {
		// u.bug("this._mouseleave:", this);

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
		// u.bug("this._focus:", this, event);

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
		if(fun(this[this._form._callback_focused])) {
			this[this._form._callback_focused]();
		}
		// certain fields with multiple input will have callback declared on first input only
		// like radio buttons
		else if(fun(this.field.input[this._form._callback_focused])) {
			this.field.input[this._form._callback_focused](this);
		}


		// does form have callback declared
		if(fun(this._form[this._form._callback_focused])) {
			this._form[this._form._callback_focused](this);
		}

	}
	// internal blur handler - attatched to inputs
	this._blur = function(event) {
		// u.bug("this._blur:", this, event);

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
		this._used = true;


		// callbacks
		// does input have callback
		if(fun(this[this._form._callback_blurred])) {
			this[this._form._callback_blurred]();
		}
		// certain fields with multiple input will have callback declared on first input only
		// like radio buttons
		else if(fun(this.field.input[this._form._callback_blurred])) {
			this.field.input[this._form._callback_blurred](this);
		}


		// does form have callback declared
		if(fun(this._form[this._form._callback_blurred])) {
			this._form[this._form._callback_blurred](this);
		}

	}

	// internal blur handler - attatched to buttons
	this._button_focus = function(event) {

		u.ac(this, "focus");

		// callbacks
		// does button have callback
		if(fun(this[this._form._callback_focused])) {
			this[this._form._callback_focused]();
		}

		// does form have callback
		if(fun(this._form[this._form._callback_focused])) {
			this._form[this._form._callback_focused](this);
		}

	}
	// internal blur handler - attatched to buttons
	this._button_blur = function(event) {

		u.rc(this, "focus");

		// callbacks
		// does button have callback
		if(fun(this[this._form._callback_blurred])) {
			this[this._form._callback_blurred]();
		}

		// does form have callback
		if(fun(this._form[this._form._callback_blurred])) {
			this._form[this._form._callback_blurred](this);
		}

	}


	// internal - validate input (event handler) - attached to input
	this._validate = function(event) {
		// u.bug("validate from _validate", this);

		u.f.validate(this);

	}



	// Helper functions


	// [ENTER] handling

	// Handle ENTER in inputs
	// submit form when [ENTER] is pressed
	this.inputOnEnter = function(node) {
		node.keyPressed = function(event) {
			// u.bug("keypressed:" + event.keyCode);

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
				// u.bug("[ENTER] pressed:", this);

				// Prevent bubbling
				u.e.kill(event);

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

		// Listen for keydowns
		u.e.addEvent(node, "keydown", node.keyPressed);
	}

	// Handle ENTER on buttons
	// invoke clicked when [ENTER] is pressed on button
	this.buttonOnEnter = function(node) {
		node.keyPressed = function(event) {
			// u.bug("keypressed:" + event.keyCode);

			// ENTER key
			if(event.keyCode == 13 && !u.hc(this, "disabled") && fun(this.clicked)) {
				u.e.kill(event);

				// Loop back to declared click handler
				this.clicked(event);
			}
		}

		// Listen for keydowns
		u.e.addEvent(node, "keydown", node.keyPressed);
	}



	// Event handlers etc

	// activate input
	// apply standard eventlisteners
	this.activateInput = function(iN) {
		// u.bug("activateInput:", iN);

		// add focus and blur event handlers
		u.e.addEvent(iN, "focus", this._focus);
		u.e.addEvent(iN, "blur", this._blur);


		// added accessibility for devices with mouse input support
		if(u.e.event_support != "touch") {
			u.e.addEvent(iN, "mouseenter", this._mouseenter);
			u.e.addEvent(iN, "mouseleave", this._mouseleave);
		}

		// validate on input blur
		u.e.addEvent(iN, "blur", this._validate);

		// declare default value
		iN.default_value = "";

	}

	// activate button
	this.activateButton = function(action) {
		// u.bug("activateButton:", action);

		// if submit or reset button
		// make sure it does not submit form without validation or reset native form, when form is a pseudo form
		if(action.type && action.type == "submit" || action.type == "reset") {
			// we need to cancel regular onclick event to avoid uncontrolled invokation in older browsers
			// where killing mouseup/down is not enough
			action.onclick = function(event) {
				u.e.kill(event ? event : window.event);
			}
		}

		// make button clickable
		u.ce(action);

		// apply clicked callback if not already declared
		if(!action.clicked) {

			// default handling - can be overwritten in local implementation
			action.clicked = function(event) {
				// TODO: some uncertainty about the need for this kill
				// u.e.kill(event);

				// don't execute if button is disabled
				if(!u.hc(this, "disabled")) {

					// Native submit button
					if(this.type && this.type.match(/submit/i)) {

						// store submit button info
						this._form._submit_button = this;
						// remove any previous submit info
						this._form._submit_input = false;

						// internal submit
						this._form.submit(event, this);
					}
					// Native reset button
					else if(this.type && this.type.match(/reset/i)) {

						// store submit button info
						this._form._submit_button = false;
						// remove any previous submit info
						this._form._submit_input = false;

						// internal submit
						this._form.reset(event, this);
					}

					// Does action have url – indicates link
					else if(this.url) {

						// meta key pressed
						if(event && (event.metaKey || event.ctrlKey)) {
							window.open(this.url);
						}
						else {
							// HASH/POPSTATE navigation
							if(obj(u.h) && u.h.is_listening) {
								u.h.navigate(this.url, this);
							}
							else {
								location.href = this.url;
							}
						}

					}

				}
			}

		}

		// add to actions index if button has an unused identifier (button name or normalized classname or value)
		var action_name = action.name ? action.name : (action.parentNode.className ? u.superNormalize(action.parentNode.className) : (action.value ? u.superNormalize(action.value) : u.superNormalize(u.text(action))));
		if(action_name && !action._form.actions[action_name]) {
			action._form.actions[action_name] = action;
		}

		// keyboard shortcut
		if(obj(u.k) && u.hc(action, "key:[a-z0-9]+")) {
			u.k.addKey(action, u.cv(action, "key"));
		}

		// add focus and blur handlers
		u.e.addEvent(action, "focus", this._button_focus);
		u.e.addEvent(action, "blur", this._button_blur);

	}

	// position hint appropriately to input
	this.positionHint = function(field) {

		// is help element available, then position it appropriately to input
		if(field.help) {
			
			// check for custom hint position
			// allows to overwrite any field type hint position
			var custom_hint_position;
			for(custom_hint_position in this.customHintPosition) {
				if(u.hc(field, custom_hint_position)) {
					this.customHintPosition[custom_hint_position](field);
					return;
				}
			}


			// Default positioning
			var input_middle = field.input.offsetTop + (field.input.offsetHeight / 2);
			var help_top = input_middle - field.help.offsetHeight / 2;

			u.ass(field.help, {
				"top": help_top + "px"
			});

		}

	}

	// Update filelist based on server response
	this.updateFilelistStatus = function(form, response) {

		// Do we have valid form and response
		if(form && form.inputs && response && response.cms_status == "success" && response.cms_object && response.cms_object.mediae) {

			// clone response mediae
			var mediae = JSON.parse(JSON.stringify(response.cms_object.mediae));

			// Get all filelists
			var filelists = u.qsa("div.field.files ul.filelist", form);


			var i, j, k, filelist, old_files, old_file, new_files, new_files;
			for(i = 0; i < filelists.length; i++) {
				filelist = filelists[i];

				// Get new files from filelist
				new_files = u.qsa("li.new", filelist);

				// only do anything if filelist contains new files
				if(new_files.length) {

					// First filter out any "old" files first (to make matching safer)

					// Get old files from filelist
					old_files = u.qsa("li.uploaded", filelist);
					if(old_files.length) {

						// Loop through mediae to compare with old files
						for(j in mediae) {

							media = mediae[j];

							// media matches this filelist
							if(media.variant.match("^" + filelist.field.input.name.replace(/\[\]$/, "") + "(\-|$)")) {

								// Find this media in old files of this filelist
								for(k = 0; k < old_files.length; k++) {
									old_file = old_files[k];

									// If id matches, then remove media from collection (it's not a new file)
									if(u.cv(old_file, "media_id") == media.id) {

										// Don't bother with this media anymore
										delete mediae[j];
									}
								}
							}
						}
					}

					// No need to continue if no more media exists (whatever is left must be new files)
					if(Object.keys(mediae).length) {

						// Loop through remaining mediae to compare with new files
						for(j in mediae) {

							media = mediae[j];

							// media matches this filelist
							if(media.variant.match("^"+filelist.field.input.name.replace(/\[\]$/, "")+"(\-|$)")) {

								// Loop through new files to find the matching media
								for(k = 0; k < new_files.length; k++) {
									new_file = new_files[k];

									// We only have name to compare with 
									// (which leaves a small risk of mis-identification)
									if(u.text(new_file) == media.name || u.text(new_file)+".zip" == media.name) {

										new_file.innerHTML = media.name;

										// Update classname
										u.rc(new_file, "new");
										u.ac(new_file, "uploaded media_id:"+media.id+" variant:"+media.variant+" format:"+media.format+" width:"+media.width+" height:"+media.height);

										// Don't bother with this media anymore
										delete mediae[j];
									}
								}
							}
						}
					}
				}

				filelist.field.uploaded_files = u.qsa("li.uploaded", filelist);

			}

		}

	}



	// Validation helpers

	// input has error - decide whether it is reasonable to show error or not
	this.inputHasError = function(iN) {
		// u.bug("inputHasError", "used:" + iN._used);

		// Leave correct state
		u.rc(iN, "correct");
		u.rc(iN.field, "correct");
		delete iN.is_correct;

		// do not add visual feedback until field has been used by user - or if it contains value (reloads)
		if(iN.val() !== "") {

			if(!iN.has_error && (iN._used || iN._form._bulk_operation)) {

				// Remember error in error list
				iN._form._error_inputs[iN.name] = true;


				// Register error on field and input
				u.ac(iN, "error");
				u.ac(iN.field, "error");
				iN.has_error = true;

				// State has changed
				this.updateInputValidationState(iN);

			 }

		}
		// visual validation on empty, used fields
		else if(!iN.has_error && iN._used) {

			// Remember error in error list
			iN._form._error_inputs[iN.name] = true;

			// Register error on field and input
			u.ac(iN, "error");
			u.ac(iN.field, "error");
			iN.has_error = true;

			// State has changed
			this.updateInputValidationState(iN);

		}
		// remove visual validation on resat fields
		// reset – remove error indications which should no longer be shown
		// also used by compare to validations, where we might validate a second field before it being used
		// else if(iN.has_error && !iN._used) {
		else if(!iN._used) {

			// delete error from error list
			delete iN._form._error_inputs[iN.name];

			// Remove error from field and input
			u.rc(iN, "error");
			u.rc(iN.field, "error");
			delete iN.has_error;

		}


		// if help element is available
		this.positionHint(iN.field);

	}

	// input is correct - decide whether to show it or not
	this.inputIsCorrect = function(iN) {
		// u.bug("inputIsCorrect", "used:" + iN._used);


		// Remove error on field and input
		u.rc(iN, "error");
		u.rc(iN.field, "error");
		delete iN.has_error;

		// delete from internal error collection
		delete iN._form._error_inputs[iN.name];


		// does field have value? 
		// Non-required fields can be empty - but should not have visual validation
		if(iN.val() !== "") {

			if(!iN.is_correct) {

				// When ever a field is declared correct, then also mark input and form as used for instant
				iN._used = true;

				// Enter correct state
				u.ac(iN, "correct");
				u.ac(iN.field, "correct");
				iN.is_correct = true;

				// State has changed
				this.updateInputValidationState(iN);

			}

		}

		// Shift from has_error is needed to trigger updateFormValidationState
		else if(iN.is_correct || iN.has_error) {

			// remove visual validation on empty fields
			u.rc(iN, "correct");
			u.rc(iN.field, "correct");
			delete iN.is_correct;

			// State has changed
			this.updateInputValidationState(iN);

		}

	}

	// Update input validation state and provide callbacks as needed
	// Also updates form validation state
	this.updateInputValidationState = function(iN) {
		// u.bug("updateInputValidationState:" + iN.name + "," + iN.has_error + "," + iN.is_correct);

		// validation failed – callback if needed
		if(iN.has_error && fun(iN[iN._form._callback_input_validation_failed])) {
			iN[iN._form._callback_input_validation_failed]();
		}

		// validation passed – callback if needed
		else if(iN.is_correct && fun(iN[iN._form._callback_input_validation_passed])) {
			iN[iN._form._callback_input_validation_passed]();
		}

		// Update form validation state (if needed)
		this.updateFormValidationState(iN._form);

	}

	// Update the form validation state and provide callbacks as needed
	this.updateFormValidationState = function(_form) {
		// u.bug("updateFormValidationState", _form._bulk_operation);

		// Do not update form validation state during bulk operations
		// Form validation state callback will be done seperately after bulk operation
		if(!_form._bulk_operation) {

			// error_inputs contain elements 
			// Form is not valid
			if(Object.keys(_form._error_inputs).length) {

				// Keep track of form validation state
				_form._validation_state = "error";

				// form is different from last update
				if(_form._error_inputs !== _form._reference_error_inputs) {
			
					// Make callback if available
					if(fun(_form[_form._callback_validation_failed])) {
						_form[_form._callback_validation_failed](_form._error_inputs);
					}

				}

			}

			// No errors – check if everything validates
			// required fields corresponds to required, correct fields
			else if(u.qsa(".field.required", _form).length === u.qsa(".field.required.correct", _form).length) {

				// If state is changing - make callback as needed
				if(fun(_form[_form._callback_validation_passed]) && _form._validation_state !== "correct") {
					_form[_form._callback_validation_passed]();
				}

				_form._validation_state = "correct";

			}
			// Form is in "in-between" state
			// Remember this for change detection
			else {

				_form._validation_state = "void";
			}

			// clone error inputs array for state reference
			_form._reference_error_inputs = JSON.parse(JSON.stringify(_form._error_inputs));

		}

	}

	// Bulk validation
	// Validating array of inputs, while not updating form validation state, until all inputs have been validated
	this.bulkValidate = function(inputs) {

		// Valid array
		if(inputs && inputs.length) {

			// get form reference from 1st input
			var _form = inputs[0]._form;

			// Enter bulk operaion mode
			_form._bulk_operation = true;

			var i;
			for(i = 0; i < inputs.length; i++) {

				// Validate each input in bulk operation mode
				u.f.validate(inputs[i]);
			
			}

			// Leave bulk operation mode
			_form._bulk_operation = false;

			// Update form validation state
			this.updateFormValidationState(_form);

		}

	}

	/**
	* validate input
	* - string
	* - number
	* - integer
	* - tel
	* - email
	* - text
	* - select
	* - radiobuttons
	* - checkbox
	* - boolean
	* - password
	* - date
	* - datetime
	* - files
	*/
	this.validate = function(iN) {
		// u.bug("validate name: " + iN.name + ", value: " + iN.val(), iN);

		// validation is disabled or input has no field – validation success
		if(!iN._form._validation || !iN.field) {
			return true;
		}


		var min, max, pattern;
		var validated = false;

		// Get compare_to value if it exists
		var compare_to = iN.getAttribute("data-compare-to");


		// start by checking if value is empty or default_value
		// not required, and empty (should still be validated if it has content)
		if(!u.hc(iN.field, "required") && iN.val() === "" && (!compare_to || iN._form.inputs[compare_to].val() === "")) {
			// u.bug("valid empty:", iN);

			this.inputIsCorrect(iN);
			return true;
		}
		// required, and empty
		else if(u.hc(iN.field, "required") && iN.val() === "") {
			// u.bug("invalid empty:", iN, iN.val());

			this.inputHasError(iN);
			return false;
		}


		// loop through custom validations – precedence allows for overwriting validation for any type
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
				max = max ? max : 255;
				pattern = iN.getAttribute("pattern");

				if(
					iN.val().length >= min && 
					iN.val().length <= max && 
					(!pattern || iN.val().match("^"+pattern+"$")) &&
					(!compare_to || iN.val() == iN._form.inputs[compare_to].val())
				) {
					this.inputIsCorrect(iN);
					if(compare_to) {
						this.inputIsCorrect(iN._form.inputs[compare_to]);
					}
				}
				else {
					this.inputHasError(iN);
					if(compare_to) {
						this.inputHasError(iN._form.inputs[compare_to]);
					}
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
					this.inputIsCorrect(iN);
				}
				else {
					this.inputHasError(iN);
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
					this.inputIsCorrect(iN);
				}
				else {
					this.inputHasError(iN);
				}
			}

			// telephone validation
			else if(u.hc(iN.field, "tel")) {

				pattern = iN.getAttribute("pattern");

				if(
					(
						(!pattern && iN.val().match(/^([\+0-9\-\.\s\(\)]){5,18}$/)) 
						||
						(pattern && iN.val().match("^"+pattern+"$"))
					)
					&&
					(!compare_to || iN.val() == iN._form.inputs[compare_to].val())
				) {
					this.inputIsCorrect(iN);
					if(compare_to) {
						this.inputIsCorrect(iN._form.inputs[compare_to]);
					}
				}
				else {
					this.inputHasError(iN);
					if(compare_to) {
						this.inputHasError(iN._form.inputs[compare_to]);
					}
				}
			}

			// email validation
			else if(u.hc(iN.field, "email")) {

				pattern = iN.getAttribute("pattern");

				if(
					(
						(!pattern && iN.val().match(/^([^<>\\\/%$])+\@([^<>\\\/%$])+\.([^<>\\\/%$]{2,20})$/)) 
						||
						(pattern && iN.val().match("^"+pattern+"$"))
					)
					&&
					(!compare_to || iN.val() == iN._form.inputs[compare_to].val())
				) {
					this.inputIsCorrect(iN);
					if(compare_to) {
						this.inputIsCorrect(iN._form.inputs[compare_to]);
					}
				}
				else {
					this.inputHasError(iN);
					if(compare_to) {
						this.inputHasError(iN._form.inputs[compare_to]);
					}
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
					this.inputIsCorrect(iN);
				}
				else {
					this.inputHasError(iN);
				}
			}

			// date validation
			else if(u.hc(iN.field, "date")) {

				min = u.cv(iN.field, "min");
				max = u.cv(iN.field, "max");
				pattern = iN.getAttribute("pattern");

				if(
					(!min || new Date(decodeURIComponent(min)) <= new Date(iN.val())) &&
					(!max || new Date(decodeURIComponent(max)) >= new Date(iN.val())) &&
					(
						(!pattern && iN.val().match(/^([\d]{4}[\-\/\ ]{1}[\d]{2}[\-\/\ ][\d]{2})$/))
						||
						(pattern && iN.val().match("^"+pattern+"$"))
					)
				) {
					this.inputIsCorrect(iN);
				}
				else {
					this.inputHasError(iN);
				}
			}

			// datetime validation
			else if(u.hc(iN.field, "datetime")) {

				min = u.cv(iN.field, "min");
				max = u.cv(iN.field, "max");
				pattern = iN.getAttribute("pattern");

				if(
					(!min || new Date(decodeURIComponent(min)) <= new Date(iN.val())) &&
					(!max || new Date(decodeURIComponent(max)) >= new Date(iN.val())) &&
					(
						(!pattern && iN.val().match(/^([\d]{4}[\-\/\ ]{1}[\d]{2}[\-\/\ ][\d]{2} [\d]{2}[\-\/\ \:]{1}[\d]{2}[\-\/\ \:]{0,1}[\d]{0,2})$/))
						||
						(pattern && iN.val().match(pattern))
					)
				) {
					this.inputIsCorrect(iN);
				}
				else {
					this.inputHasError(iN);
				}
			}

			// files validation
			else if(u.hc(iN.field, "files")) {

				// min and max length
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 1;
				max = max ? max : 10000000;

				// Acceptable file types
				pattern = iN.getAttribute("accept");

				// collect list of added and already uploaded files
				var i, value = iN.val(), files = [];
				if(iN.field.uploaded_files && iN.field.uploaded_files.length) {
					for(i = 0; i < iN.field.uploaded_files.length; i++) {
						files.push("." + u.cv(iN.field.uploaded_files[i], "format").toLowerCase());
					}
				}
				if(value && value.length) {
					for(i = 0; i < value.length; i++) {
						files.push(value[i].name.substring(value[i].name.lastIndexOf(".")));
					}
				}

				if(
					(files.length >= min && files.length <= max)
					&&
					(!pattern || files.every(function(v) {return pattern.split(",").indexOf(v) !== -1}))
				) {
					this.inputIsCorrect(iN);
				}
				else {
					this.inputHasError(iN);
				}
			}

			// select validation
			else if(u.hc(iN.field, "select")) {

				if(iN.val() !== "") {
					this.inputIsCorrect(iN);
				}
				else {
					this.inputHasError(iN);
				}
			}

			// checkbox/radiobutton validation
			else if(u.hc(iN.field, "checkbox|boolean|radiobuttons")) {

				if(iN.val() !== "") {
					this.inputIsCorrect(iN);
				}
				else {
					this.inputHasError(iN);
				}
			}

			// string validation (classname has been known to exist on other types, 
			// leave it last to give other types precedence
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
					&&
					(!compare_to || iN.val() == iN._form.inputs[compare_to].val())
				) {
					this.inputIsCorrect(iN);
					if(compare_to) {
						this.inputIsCorrect(iN._form.inputs[compare_to]);
					}
				}
				else {
					this.inputHasError(iN);
					if(compare_to) {
						this.inputHasError(iN._form.inputs[compare_to]);
					}
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


	/**
	* Get data from form (Manipulator form or not)
	*
	* Optional parameters as object
	* - format - any defined type.
	* 	- formdata - Formdata object (default)
	* 	- params - regular parameter string
	* 	- object - JS object with key value pairs
	* 	- optional local extension via u.f.customDataFormat
	* - ignore_inputs - input classnames to identify inputs to ignore, multiple classes can be | seperated (string is used as regular expression)
	*/
	// TODO: getParams is DEPRECATED (remove when filtered out of code)
	this.getFormData = this.getParams = function(_form, _options) {


		// default values
		var format = "params";
		var ignore_inputs = "ignoreinput";


		// additional info passed to function
		if(obj(_options)) {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {

					case "ignore_inputs"    : ignore_inputs     = _options[_argument]; break;
					case "format"           : format            = _options[_argument]; break;
				}

			}
		}


		// get inputs
		var i, input, select, textarea, param, params;


		// Object for found inputs/selects/textareas
		// Use FormData Object for data collection ONLY if supported by browser
		// iOS <= 9 treats FormData as object
		if(format == "formdata" && (fun(window.FormData) || obj(window.FormData))) {
			params = new FormData();

		}
		else {
			// browser doesn't support formdata
			if(format == "formdata") {
				format == "params";
			}

			params = new Object();
			// create dummy function (but keep optional filename for compatibility)
			params.append = function(name, value, filename) {
				this[name] = filename || value;
			}
		}


		// add submit button to params if available
		if(_form._submit_button && _form._submit_button.name) {
			params.append(_form._submit_button.name, _form._submit_button.value);
		}


		// get all inputs, selects and textareas
		var inputs = u.qsa("input", _form);
		var selects = u.qsa("select", _form)
		var textareas = u.qsa("textarea", _form)


		// Add inputs
		for(i = 0; i < inputs.length; i++) {
			input = inputs[i];

			// exclude specific inputs (defined by ignore_inputs)
			if(!u.hc(input, ignore_inputs)) {

				// if checkbox/radio and node is checked
				if((input.type == "checkbox" || input.type == "radio") && input.checked) {

					// Manipulator initiated input
					if(fun(input.val)) {
						params.append(input.name, input.val());
					}
					// Regular input
					else {
						params.append(input.name, input.value);
					}

				}
				// file input
				else if(input.type == "file") {

					var f, file, files;

					// Manipulator initiated input
					if(fun(input.val)) {
						files = input.val();
					}
					// Regular input
					else if(input.files) {
						files = input.files;
					}

					if(files && files.length) {

						// append files individually
						for(f = 0; f < files.length; f++) {
							file = files[f];

							// PHP should be able to handle it like this
							params.append(input.name, file, file.name);
						}
					}
					// No files
					else {
						params.append(input.name, "");
					}

				}

				// if anything but buttons and radio/checkboxes
				// - hidden, text, html5 input-types
				else if(!input.type.match(/button|submit|reset|file|checkbox|radio/i)) {

					// Manipulator initiated input
					if(fun(input.val)) {
						params.append(input.name, input.val());
					}
					// Regular input
					else {
						params.append(input.name, input.value);
					}

				}
			}
		}

		// Add selects
		for(i = 0; i < selects.length; i++) {
			select = selects[i];

			// exclude specific inputs (defined by ignore_inputs)
			if(!u.hc(select, ignore_inputs)) {

				// Manipulator initiated input
				if(fun(select.val)) {
					params.append(select.name, select.val());
				}
				// Regular input
				else {
					params.append(select.name, select.options[select.selectedIndex] ? select.options[select.selectedIndex].value : "");
				}
			}
		}

		// Add textareas
		for(i = 0; i < textareas.length; i++) {
			textarea = textareas[i];

			// exclude specific inputs (defined by ignore_inputs)
			if(!u.hc(textarea, ignore_inputs)) {

				// Manipulator initiated input
				if(fun(textarea.val)) {
					params.append(textarea.name, textarea.val());
				}
				// Regular input
				else {
					params.append(textarea.name, textarea.value);
				}
			}
		}


		// look for local extension types
		if(format && fun(this.customDataFormat[format])) {
			return this.customDataFormat[format](params, _form);
		}



		// or use defaults

		// return as or formdata
		else if(format == "formdata") {

			return params;
		}

		// return as js object
		else if(format == "object") {

			// remove append function before returning object
			delete params.append;

			return params;
		}

		// return as parameter string
		// format == "params" (or unknown format)
		else {

			// Build and return GET parameter string
			var string = "";
			for(param in params) {
				if(!fun(params[param])) {
					string += (string ? "&" : "") + param + "=" + encodeURIComponent(params[param]);
				}
			}
			return string;

		}

	}

}

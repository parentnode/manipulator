// Form module
Util.Form = u.f = new function() {

	// create extension objects
	// this is used to add 
	// - custom fields (customInit and customValidate)
	// - custom data export types (customDataFormat)
	// - hint positioning (customHintPosition)
	// - and label styles (customLabelStyle)
	//
	// See u-form-custom for examples of usage
	this.customInit = {};
	this.customValidate = {};
	this.customDataFormat = {};
	this.customHintPosition = {};
	this.customLabelStyle = {};



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


		// find item id, extended files preview functionality requires knowing item_id
		// TODO: should be extended to look in other places
		_form._item_id = _form.getAttribute("data-item_id");
		if(!_form._item_id) {

			// could be in form action (last fragment of url)
			var item_id_match = _form.action.match(/\/([0-9]+)(\/|$)/);
			if(item_id_match) {
				_form._item_id = item_id_match[1];
			}

		}


		// Label styles - defines special handling of label values
		// specified via form classname as labelstyle:inject or sent via _options array
		// Currently implemented: none or inject
		_form._label_style = u.cv(_form, "labelstyle");


		// Callbacks
		_form._callback_ready = "ready";
		_form._callback_submitted = "submitted";
		_form._callback_submit_failed = "submitFailed";
		_form._callback_pre_submitted = "preSubmitted";
		_form._callback_resat = "resat";

		_form._callback_updated = "updated";
		_form._callback_changed = "changed";
		_form._callback_blurred = "blurred";
		_form._callback_focused = "focused";

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

					case "label_style"              : _form._label_style               = _options[_argument]; break;

					case "callback_ready"           : _form._callback_ready            = _options[_argument]; break;
					case "callback_submitted"       : _form._callback_submitted        = _options[_argument]; break;
					case "callback_submit_failed"   : _form._callback_submit_failed    = _options[_argument]; break;
					case "callback_pre_submitted"   : _form._callback_pre_submitted    = _options[_argument]; break;
					case "callback_resat"           : _form._callback_resat            = _options[_argument]; break;

					case "callback_updated"         : _form._callback_updated          = _options[_argument]; break;
					case "callback_changed"         : _form._callback_changed          = _options[_argument]; break;
					case "callback_blurred"         : _form._callback_blurred          = _options[_argument]; break;
					case "callback_focused"         : _form._callback_focused          = _options[_argument]; break;

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


		// reference hidden fields to allow accessing them through form fields array
		// Do this first, since this makes csrf token availble
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


		// Index proper fields (in correct markup) first – the have presedence over hidden inputs
		// get all fields
		var fields = u.qsa(".field", _form);
		for(i = 0; i < fields.length; i++) {
			field = fields[i];

			// u.bug("field found:", field);
			u.f.initField(_form, field);

		}


		// get all actions
		var actions = u.qsa(".actions li input[type=button],.actions li input[type=submit],.actions li input[type=reset],.actions li a.button", _form);
		for(i = 0; i < actions.length; i++) {
			action = actions[i];

			// u.bug("button found:", action, _form);
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
		field.indicator = u.ae(field, "div", {"class":"indicator"});


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
			if(u.hc(field, "string|email|tel|number|integer|password")) {

				// Register field type
				field.type = field.className.match(/(?:^|\b)(string|email|tel|number|integer|password)(?:\b|$)/)[0];

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

					// Remove scrollbars
					u.ass(field.input, {
						"overflow": "hidden"
					});

					// set correct height
					field.input.setHeight = function() {

						u.ass(this, {
							height: "auto"
						});

						u.ass(this, {
							height: (this.scrollHeight) + "px"
						});

					}
					// Listen for input
					u.e.addEvent(field.input, "input", field.input.setHeight);
					field.input.setHeight();
				}

				// change/update events
				u.e.addEvent(field.input, "keyup", this._updated);
				u.e.addEvent(field.input, "change", this._changed);

				// Add additional standard event listeners and labelstyle
				this.activateInput(field.input);

			}

			// textarea initialization
			else if(u.hc(field, "json")) {

				// Register field type
				field.type = "json";

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

					// Remove scrollbars
					u.ass(field.input, {
						"overflow": "hidden"
					});

					// set correct height
					field.input.setHeight = function() {

						u.ass(this, {
							height: "auto"
						});

						u.ass(this, {
							height: (this.scrollHeight) + "px"
						});

					}
					// Listen for input
					u.e.addEvent(field.input, "input", field.input.setHeight);
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


				// opposite order of elsewhere to ensure instant validation
				u.e.addEvent(field.input, "change", this._changed);
				u.e.addEvent(field.input, "change", this._updated);
				u.e.addEvent(field.input, "change", this._update_checkbox_field);

				// submit on enter
				this.inputOnEnter(field.input);

				// Add additional standard event listeners and labelstyle
				this.activateInput(field.input);

				// added accessibility for devices with mouse input support
				// apply hover to label as well
				if(u.e.event_support != "touch") {
					u.e.addEvent(field.input.label, "mouseenter", this._mouseenter.bind(field.input));
					u.e.addEvent(field.input.label, "mouseleave", this._mouseleave.bind(field.input));
				}

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

				// use first input as primary field input 
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

					// change and update event
					u.e.addEvent(input, "change", this._changed);
					u.e.addEvent(input, "change", this._updated);

					// submit on enter
					this.inputOnEnter(input);

					// Add additional standard event listeners and labelstyle
					this.activateInput(input);

					// added accessibility for devices with mouse input support
					// apply hover to label as well
					if(u.e.event_support != "touch") {
						u.e.addEvent(input.label, "mouseenter", this._mouseenter.bind(input));
						u.e.addEvent(input.label, "mouseleave", this._mouseleave.bind(input));
					}

				}

			}

			// date/datetime inputs initialization
			else if(u.hc(field, "date|datetime")) {

				// Register field type
				field.type = field.className.match(/(?:^|\b)(date|datetime)(?:\b|$)/)[0];

				// Get primary input
				field.input = u.qs("input", field);
				// form is a reserved property, so we use _form
				field.input._form = _form;
				// Get associated label
				field.input.label = u.qs("label[for='"+field.input.id+"']", field);
				// Let it know it's field
				field.input.field = field;

				// get/set value function
				field.input.val = this._value_date;

				// change/update(keyup) events to generic callback handler
				u.e.addEvent(field.input, "keyup", this._updated);
				u.e.addEvent(field.input, "change", this._changed);
				u.e.addEvent(field.input, "change", this._updated);

				// submit on enter (checks for autocomplete etc)
				this.inputOnEnter(field.input);

				// Add additional standard event listeners and labelstyle
				this.activateInput(field.input);

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

				// extended functionality urls
				field.file_delete_action = field.getAttribute("data-file-delete");
				field.file_order_action = field.getAttribute("data-file-order");
				field.file_update_metadata_action = field.getAttribute("data-file-update-metadata");
				field.file_media_info_action = field.getAttribute("data-file-media-info");


				// extended files preview functionality requires knowing item_id
				field._item_id = _form._item_id;


				// get/set value function
				field.input.val = this._value_file;


				// Create droparea to have relative container for file input, file list and preview
				field.div_droparea = u.we(field.input, "div", {"class":"droparea"});


				// Find or Add filelist for visual file selection feedback
				// Create filelist if not exists
				field.filelist = u.qs("ul.filelist", field);
				if(!field.filelist) {
					field.filelist = u.ae(field.div_droparea, "ul", {"class":"filelist"});
				}
				// Move filelist to droparea
				else {
					field.div_droparea.appendChild(field.filelist);
				}

				// Let filelist know about it's field
				field.filelist.field = field;
				// Get already uploaded files
				field.uploaded_files = u.qsa("li.uploaded", field.filelist);

				// Update filelist now
				this._update_filelist.bind(field.input)();

				// Update filelist whenever value is changed (and before callback to application)
				u.e.addEvent(field.input, "change", this._update_filelist);

				// // change and update event
				// Now called when filelist has been updated to allow for clientside width/height checks
				// u.e.addEvent(field.input, "change", this._updated);
				// u.e.addEvent(field.input, "change", this._changed);

				// activate focus on input mouse/drag interaction
				if(u.e.event_support != "touch") {
					u.e.addEvent(field.input, "dragenter", this._focus);
					u.e.addEvent(field.input, "dragleave", this._blur);
					u.e.addEvent(field.input, "drop", this._blur);
				}


				// Add additional standard event listeners and labelstyle
				this.activateInput(field.input);

			}

			// UNKNOWN FIELD
			// Give developer a fair chance of finding it
			else {
				u.bug("UNKNOWN FIELD IN FORM INITIALIZATION:", field);
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

		// Experimental tabindex fix for virtual inputs without contentEditable (select)
		// u.bug("field.input.virtual_input", field.virtual_input);
		if(field.virtual_input && !field.virtual_input.tabindex) {
			field.virtual_input.setAttribute("tabindex", 0);
			field.input.setAttribute("tabindex", 0);
		}
		else if(field.input && field.input.getAttribute("readonly")) {
			field.input.setAttribute("tabindex", -1);
		}
		else if(field.input && !field.input.tabindex) {
			field.input.setAttribute("tabindex", 0);
		}
	}


	// Initialize button
	// will be used for all initial buttons, but can also be used to add more buttons after first initialization
	this.initButton = function(_form, action) {
		// u.bug("initButton", action);

		// make sure even a.buttons knows form
		action._form = _form;

		// Include buttons in tabindex
		action.setAttribute("tabindex", 0);

		// Does button require confirmation?
		action.confirm = action.getAttribute("data-confirm");

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


				// Is there a defaultState updater (for a labelstyle)
				if(fun(u.f.updateDefaultState)) {
					u.f.updateDefaultState(this.inputs[name]);
				}

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

		// do pre validation of all inputs
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
		else {

			// has callback handler been declared
			if(fun(this[this._callback_submit_failed])) {
				this[this._callback_submit_failed](iN);
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
	// value get/setter for date/datetime inputs
	this._value_date = function(value) {
		// u.bug("date_v", value);
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
		return (this.value != this.default_value) ? this.value.replace("T", " ") : "";
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

		u.f.positionHint(this.field);

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
		this.e_updated = event;

		// Add hint or label as visual
		u.ae(this.field.filelist, "li", {
			"html":this.field.hint ? u.text(this.field.hint) : u.text(this.label), class:"label",
		});

		// Selected new files for upload
		if(files && files.length) {
			// u.bug("new files exist:" + this.name);

			u.ac(this.field, "has_new_files");

			var i, file, li_file;
			this.field.filelist.load_queue = 0;

			// Add files to list
			for(i = 0; i < files.length; i++) {
				file = files[i];

				li_file = u.ae(this.field.filelist, "li", {"html":file.name, "class":"new"})
				li_file.setAttribute("data-format", file.name.substring(file.name.lastIndexOf(".")+1).toLowerCase());

				li_file.input = this;


				// TODO: extend to cover audio
				// Preload image files to enable width/height/proportion validation
				if(file.type.match(/image/)) {
					li_file.image = new Image();
					li_file.image.li = li_file;
					u.ac(li_file, "loading");
					this.field.filelist.load_queue++;

					li_file.image.onload = function() {
						this.li.setAttribute("data-width", this.width);
						this.li.setAttribute("data-height", this.height);

						u.rc(this.li, "loading");
						this.li.input.field.filelist.load_queue--;

						delete this.li.image;

						u.f.filelistUpdated(this.li.input);

					}
					li_file.image.src = URL.createObjectURL(file);

				}
				else if(file.type.match(/video/)) {
					li_file.video = document.createElement("video");
					li_file.video.preload = "metadata";
					li_file.video.li = li_file;
					u.ac(li_file, "loading");
					this.field.filelist.load_queue++;

					li_file.video.onloadedmetadata = function() {
						// u.bug("loaded", this, this.videoWidth);

						// JS not able to get video properties and
						// Serverside identification is available
						if(!this.videoWidth || !this.videoHeight && this.li.input._form && this.li.input.field.file_media_info_action) {

							delete this.li.video;

							var data = new FormData();
							data.append("input_name", "video");
							data.append("video[]", file, file.name);
							data.append("csrf-token", this.li.input._form.inputs["csrf-token"].val());
							this.response = function(response) {
								u.bug("response", response);

								var width = 0;
								var height = 0;
								if(response && response.cms_object && response.cms_object.length && response.cms_object[0].width && response.cms_object[0].height) {
									width = response.cms_object[0].width;
									height = response.cms_object[0].height;
								}

								this.li.setAttribute("data-width", width);
								this.li.setAttribute("data-height", height);
								u.rc(this.li, "loading");
								this.li.input.field.filelist.load_queue--;

								u.f.filelistUpdated(this.li.input);

							}
							u.request(this, this.li.input.field.file_media_info_action, {
								"method": "post",
								"data": data,
							});
							return;
						}

						// Update video info 
						this.li.setAttribute("data-width", this.videoWidth);
						this.li.setAttribute("data-height", this.videoHeight);

						u.rc(this.li, "loading");
						this.li.input.field.filelist.load_queue--;

						delete this.li.video;

						u.f.filelistUpdated(this.li.input);

					}
					li_file.video.src = URL.createObjectURL(file);

				}

			}

			// Keep uploaded files in list for multiple file inputs
			if(this.multiple) {
				for(i = 0; i < this.field.uploaded_files.length; i++) {
					u.ae(this.field.filelist, this.field.uploaded_files[i]);
				}
			}
			// one file only – reset uploaded files
			else {

				this.field.uploaded_files = [];

			}

			u.f.filelistUpdated(this);

			// Set focus on file input
			// This sets focus on input after drop file – not sure if there can be some unintended sideeffect
			this.focus();

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

		u.f.updateFilePreview(this.field);

	}
	// Filelist update handler (waiting for image files to be loaded)
	this.filelistUpdated = function(input) {
		// u.bug("this.filelistUpdated");

		if(input.field.filelist.load_queue === 0) {
			this._changed.bind(input.field.input)(input.e_updated);
			this._updated.bind(input.field.input)(input.e_updated);
			delete input.e_updated;
		}
	}

	// Create file preview – only previewing uploaded files
	this.updateFilePreview = function(field) {
		// u.bug("update file preview", field, field.filelist);

		// Single file input – do preview in drop-area
		if(!field.input.multiple) {

			// Remove preview if exists
			if(field.filelist.preview) {

				// Remove preview and preview actions
				// If new file was added on top, then preview still exists, but already detatched from DOM
				if(field.filelist.preview.parentNode) {
					field.filelist.removeChild(field.filelist.preview);
				}

				// Remove edit / delete actions
				if(field.filelist.preview.ul_actions) {
					field.div_droparea.removeChild(field.filelist.preview.ul_actions);
				}

				// Remove video controls
				if(field.filelist.preview.ul_controls) {
					field.div_droparea.removeChild(field.filelist.preview.ul_controls);
				}

				// Remove any existing shortcut
				if(obj(u.k)) {
					u.k.removeKey(field.filelist.preview.keyboard_target, "e");
					u.k.removeKey(field.filelist.preview.keyboard_target, "DELETE");
				}

				// Delete reference
				delete field.filelist.preview;

				// Let it be known
				u.rc(field.filelist, "previewing");

			}

			var file = u.qs("li.uploaded", field.filelist);
			if(file) {

				// Let filelist know it is now previewing uploaded file
				u.ac(field.filelist, "previewing");

				field.filelist.preview = u.ae(field.filelist, "li", {"class":"preview"});
				field.filelist.preview.field = field;
				field.filelist.preview.file = file;
				field.filelist.preview.controls_parent = field.div_droparea;
				field.filelist.preview.keyboard_target = field;

				// Add new preview (will automatically determine correct preview type)
				u.f.addPreview(field.filelist.preview);

			}

		}

		// Multiple files input.
		// Separate preview list needed
		else {

			// u.bug("Multiple files input", field.ul_previews);

			// Remove preview if exists
			if(field.ul_previews) {

				var preview, li_preview, i, files, file, previews;

				// Remove preview keyboard shortcuts
				previews = u.qsa("li.preview", field.ul_previews);
				for(i = 0; i < previews.length; i++) {
					preview = previews[i];

					if(obj(u.k)) {
						u.k.removeKey(preview.keyboard_target, "e");
						u.k.removeKey(preview.keyboard_target, "DELETE");
					}

				}

				// Remove preview list
				field.removeChild(field.ul_previews);

				// Delete reference
				delete field.ul_previews;
			}


			// Remove Start from scratch to secure fresh start
			field.ul_previews = u.ae(field, "ul", {"class": "previews"});
			field.ul_previews.field = field;

			files = u.qsa("li.uploaded", field.filelist);
			if(files) {

				for(i = 0; i < files.length; i++) {
					file = files[i];

					preview = u.ae(field.ul_previews, "li", {"class":"preview", "tabindex": 0});
					preview.field = field;
					preview.file = file;
					preview.controls_parent = preview;
					preview.keyboard_target = preview;

					// Add new preview (will automatically determine correct preview type)
					u.f.addPreview(preview);
				}

			}

			// sortable list
			if(field.file_order_action) {

				u.sortable(field.ul_previews);

				field.ul_previews.picked = function(node) {}
				field.ul_previews.dropped = function(node) {

					// Get node order (getNodeOrder comes from u.sortable)
					var order = this.getNodeOrder({node_property:"media_id"});

					var form_data = new FormData();
					form_data.append("csrf-token", this.field._form.inputs["csrf-token"].val());
					form_data.append("item_id", this.field._item_id);
					form_data.append("order", order.join(","));

					this.response = function(response) {
						// Notify of event
						page.notify(response);
					}
					u.request(this, field.file_order_action, {
						"method": "post", 
						"data": form_data
					});

				}

			}

		}

	}

	// Select correct preview for file
	this.addPreview = function(preview) {
		// u.bug("add new preview", preview.file, preview);

		preview.media_id = preview.file.getAttribute("data-media_id");

		preview.media_name = preview.file.innerHTML;
		preview.media_description = preview.file.getAttribute("data-description");

		preview.media_format = preview.file.getAttribute("data-format");
		preview.media_variant = preview.file.getAttribute("data-variant");

		preview.media_width = preview.file.getAttribute("data-width");
		preview.media_height = preview.file.getAttribute("data-height");

		preview.media_created_at = preview.file.getAttribute("data-created_at");
		preview.media_poster = preview.file.getAttribute("data-poster");

		// preview.field = list.field;
		// preview.file = file;


		// Add view with filename
		preview.view = u.ie(preview, "div", {"class":"view"});
		u.ae(preview.view, "span", {"class": "name", "html": preview.media_name});


		// Editable or Deletable
		if(preview.field.file_delete_action || preview.field.file_update_metadata_action) {
			preview.ul_actions = u.ae(preview.controls_parent, "ul", {"class":"actions"});
		}

		// Editable 
		if(preview.field.file_update_metadata_action) {

			preview.bn_edit = u.ae(preview.ul_actions, "li", {"class": "edit", "html": "edit"});
			preview.bn_edit.preview = preview;

			u.ce(preview.bn_edit);
			// Prevent bubbling to drag
			preview.bn_edit.inputStarted = function(event) {
				u.e.kill(event);
			}
			preview.bn_edit.clicked = function(event) {
				u.e.kill(event);
				u.f.editMetadata(this.preview);
			}

			// Add edit shortcut
			if(obj(u.k)) {
				u.k.addKey(preview.keyboard_target, "e", {
					"callback": preview.bn_edit.clicked.bind(preview.bn_edit),
					"focused": true,
				});
			}

		}

		// Deletable
		if(preview.field.file_delete_action) {

			preview.bn_delete = u.ae(preview.ul_actions, "li", {"class": "delete", "html": "Are you sure?"});
			preview.bn_delete.preview = preview;

			u.ce(preview.bn_delete);
			// Prevent bubbling to drag
			preview.bn_delete.inputStarted = function(event) {
				u.e.kill(event);
			}
			preview.bn_delete.clicked = function(event) {
				u.e.kill(event);

				// Confirm deletion
				if(u.hc(this, "confirm")) {
					// u.f.deleteFile(this.preview.field._item_id, this.preview.variant);
					u.f.deleteFile(this.preview);
				}
				else {
					u.ac(this, "confirm");
					this.t_confirm = u.t.setTimer(this, "restore", 1500);
				}

			}
			preview.bn_delete.restore = function() {
				u.rc(this, "confirm");
			}

			// Add delete shortcut
			if(obj(u.k)) {
				u.k.addKey(preview.keyboard_target, "DELETE", {
					"callback": preview.bn_delete.clicked.bind(preview.bn_delete),
					"focused": true,
				});
			}
		}


		// set media type
		if(preview.media_format.match(/^(jpg|png|gif)$/i)) {
			u.f.addImagePreview(preview);
		}
		else if(preview.media_format.match(/^(mp3|ogg|wav|aac)$/i)) {
			u.f.addAudioPreview(preview);
		}
		else if(preview.media_format.match(/^(mov|mp4|ogv|3gp)$/i)) {
			u.f.addVideoPreview(preview);
		}
		else if(preview.media_format.match(/^zip$/i)) {
			u.f.addZipPreview(preview);
		}
		else if(preview.media_format.match(/^pdf$/i)) {
			u.f.addPdfPreview(preview);
		}




		// return preview;
	}

	// file preview, IMAGE
	this.addImagePreview = function(preview) {
		// u.bug("addImagePreview", preview);

		u.ac(preview, "preview_image");

		var image_src = "/images/"+preview.field._item_id+"/"+preview.media_variant+"/"+preview.offsetWidth+"x."+preview.media_format;

		// Adjust preview size
		u.ass(preview.view, {
			"aspect-ratio": preview.media_width / preview.media_height,
			"backgroundImage": "url("+image_src+"?"+u.randomString(4)+")"
		});

	}

	// file preview, PDF
	this.addPdfPreview = function(preview) {
		// u.bug("addPdfPreview", preview);

		u.ac(preview, "preview_pdf");

		// Adjust preview height
		u.ass(preview.view, {
			"backgroundImage": "url(/images/0/pdf/30x.png)"
		});

	}

	// file preview, ZIP
	this.addZipPreview = function(preview) {
		// u.bug("addZipPreview", preview);

		u.ac(preview, "preview_zip");

		// Adjust preview height
		u.ass(preview.view, {
			"backgroundImage": "url(/images/0/zip/30x.png)"
		});

	}

	// file preview, AUDIO
	this.addAudioPreview = function(preview) {

		u.ac(preview, "preview_audio");

		// enable playback
		var audio_src = "/audios/"+preview.field._item_id+"/"+preview.media_variant+"/128."+preview.media_format;
		preview.player = u.audioPlayer({"loop":true, "preload":"metadata"});
		preview.player.preview = preview;
		u.ae(preview.view, preview.player);

		// Load url to show first frame
		preview.player.load(audio_src+"?"+u.randomString(4));

		// Add media preview controls (play / mute)
		this.addMediaPlayerControls(preview.player);

	}

	// file preview, VIDEO
	this.addVideoPreview = function(preview) {

		u.ac(preview, "preview_video");

		// enable playback
		var video_src = "/videos/"+preview.field._item_id+"/"+preview.media_variant+"/1000x."+preview.media_format;
		preview.player = u.videoPlayer({"muted":true, "loop":true, "preload":"metadata"});
		preview.player.media.setAttribute("tabindex", -1);
		preview.player.preview = preview;
		u.ae(preview.view, preview.player);

		// Wait for preview to be generated
		u.ac(preview, "loading-preview");
		preview.player.loadedmetadata = function(event) {
			u.rc(this.preview, "loading-preview");
		}

		// Load url to show first frame
		preview.player.load(video_src+"?"+u.randomString(4));


		// Adjust preview size
		u.ass(preview.view, {
			"aspect-ratio": preview.media_width / preview.media_height,
			// "width": (preview.offsetHeight / preview.media_height * preview.media_width) + "px",
		});


		// Add poster
		if(preview.media_poster) {
			var poster_src = "/images/"+preview.field._item_id+"/"+preview.media_variant+"/1000x."+preview.media_poster;
			preview.player.media.poster = poster_src;
		}

		// Add media preview controls (play / mute)
		this.addMediaPlayerControls(preview.player);

	}


	// add play form
	this.addMediaPlayerControls = function(player) {

		var ul_controls = u.ae(player.preview.controls_parent, "ul", {"class":"controls"});
		player.preview.ul_controls = ul_controls;

		// Create play button
		var bn_play = u.ae(ul_controls, "li", {"class":"play"});
		bn_play.player = player;
		bn_play.ul_controls = ul_controls;


		u.ce(bn_play);
		// Prevent bubbling to drag
		bn_play.inputStarted = function(event) {
			u.e.kill(event);
		}
		bn_play.clicked = function(event) {
			u.e.kill(event);

			if(!u.hc(this.ul_controls, "playing")) {
				this.player.play();
				u.ac(this.ul_controls, "playing");
			}
			else {
				this.player.pause();
				u.rc(this.ul_controls, "playing");
			}
		}

		// Auto play video on hover – disabled for now
		// u.e.hover(player);
		// player.over = function() {
		// 	this.play();
		// 	u.ac(this.preview.ul_controls, "playing");
		// }
		// player.out = function() {
		// 	this.pause();
		// 	u.rc(this.preview.ul_controls, "playing");
		// }


		// Only include mute on video preview
		if(u.hc(player.preview, "preview_video")) {

			// Create mute button
			var bn_mute = u.ae(ul_controls, "li", {"class":"mute"});
			// node.bn_play.preview = node.preview;
			bn_mute.player = player;
			bn_mute.ul_controls = ul_controls;

			u.ce(bn_mute);
			// Prevent bubbling to drag
			bn_mute.inputStarted = function(event) {
				u.e.kill(event);
			}
			bn_mute.clicked = function(event) {
				u.e.kill(event);

				if(!u.hc(this.ul_controls, "muted")) {
					this.player.mute();
					u.ac(this.ul_controls, "muted");
				}
				else {
					this.player.unmute();
					u.rc(this.ul_controls, "muted");
				}
			}
			// Starting in muted state
			u.ac(ul_controls, "muted");

		}

	}



	// Open tag data input overlay
	// For media, file and external video meta data
	this.editMetadataOverlay = function(preview, title) {

		var overlay = u.overlay({
			"title": title,
			"width": 600,
			"height": 510,
			"esc": true
		});

		overlay.preview = preview;

		overlay.closed = function(event) {

			// TODO: focus could be returned to preview for multiple inputs, but previews are re-generated on update
			this.preview.field.input.focus();

		}

		return overlay;
	}

	// Overlay for external video meta data
	this.editMetadata = function(preview) {

		preview.overlay = this.editMetadataOverlay(preview, preview.media_name);


		var form = u.f.addForm(preview.overlay.div_content);
		form.preview = preview;

		// Store item_id for default form handling
		form.setAttribute("data-item_id", preview.field._item_id);

		// Add csrf-token
		u.f.addField(form, {
			"name": "csrf-token",
			"type": "hidden",
			"value": preview.field._form.inputs["csrf-token"].val(),
		});



		// Create inputs
		var fieldset = u.f.addFieldset(form);

		// Show poster?
		if(u.hc(preview, "preview_video")) {
			u.f.addField(fieldset, {
				"name": "file_poster[0]",
				"type": "files",
				"max": 1,
				"label": "Poster for this file name.",
				"value": (preview.media_poster ? [{
					"name": "Poster",
					"variant": preview.media_variant,
					"format": preview.media_poster,
					"width": preview.media_width,
					"height": preview.media_height,
					
				}] : false),
				"hint_message": "Add a poster for the file. This will be provided to search engines for better ranking.",

				"file_delete": preview.field.getAttribute("data-file-delete"),
				"is_poster": true,
			});
		}

		u.f.addField(fieldset, {
			"name": "file_name",
			"type": "string",
			"label": "SEO friendly file name.",
			"value": preview.media_name,
			"hint_message": "Enter the name or title of the file. This will be provided to search engines for better ranking.",
		});
		u.f.addField(fieldset, {
			"name": "created_at",
			"type": "datetime",
			"label": "Created date and time",
			"value": (preview.media_created_at ? preview.media_created_at : u.date("Y-m-d H:i:s")),
			"hint_message": "When was the file created. This will be provided to search engines for better ranking.",
		});
		u.f.addField(fieldset, {
			"name": "file_description",
			"type": "text",
			"label": "Description",
			"value": preview.media_description,
			"hint_message": "Enter a meaningful description for the file. This will be provided to search engines for better ranking.",
		});

		// Create buttons
		u.f.addAction(form, {
			"name": "update",
			"value": "Update",
			"class": "button primary",
		});
		u.f.addAction(form, {
			"name": "cancel",
			"value": "Cancel",
			"class": "button",
		});


		// Initialize form
		u.f.init(form);


		// Close overlay on cancel
		form.actions.cancel.clicked = function() {
			this._form.preview.overlay.close();
		}

		// Add save shortcut
		u.k.addKey(form, "s", {
			"callback":"submit",
			"focused":true
		});

		// Focus on first field
		if(u.hc(preview, "preview_video")) {
			form.inputs["file_poster[0]"].focus();
		}
		else {
			form.inputs["file_name"].focus();
		}



		// Handle submission
		form.submitted = function(iN) {

			var form_data = this.getData();
			form_data.append("file_variant", this.preview.media_variant);
			form_data.append("item_id", this.preview.field._item_id);

			u.ac(this, "submitting");


			this.response = function(response) {

				page.notify(response);

				u.rc(this, "submitting");

				// success
				if(response && response.cms_status == "success") {

					// Update filelist node and preview
					this.preview.file.innerHTML = response.cms_object.name;
					this.preview.file.setAttribute("data-media_id", response.cms_object.id);
					this.preview.file.setAttribute("data-description", response.cms_object.description);
					this.preview.file.setAttribute("data-variant", response.cms_object.variant);
					this.preview.file.setAttribute("data-format", response.cms_object.format);
					this.preview.file.setAttribute("data-height", response.cms_object.height ? response.cms_object.height : "");
					this.preview.file.setAttribute("data-width", response.cms_object.width ? response.cms_object.width : "");
					this.preview.file.setAttribute("data-poster", response.cms_object.poster ? response.cms_object.poster : "");
					this.preview.file.setAttribute("data-created_at", response.cms_object.created_at);

					u.f.updateFilePreview(this.preview.field);

					// Close overlay
					this.preview.overlay.close();
				}

			}
			u.request(this, this.preview.field.file_update_metadata_action, {
				"method":"post",
				"data":form_data
			});

		}

	}

	// Delete file
	// Delete button is related to preview, which also has a reference to the filelist element
	this.deleteFile = function(preview) {
		// u.bug("deletefile", preview);

		// Create form data object
		var form_data = new FormData();

		// append csrf token from main form
		form_data.append("csrf-token", preview.field._form.inputs["csrf-token"].val());
		form_data.append("item_id", preview.field._item_id);
		form_data.append("file_variant", preview.media_variant);


		// Special poster condition
		// If file is actually a poster for other file, then deletion should only delete poster, not the main media
		if(preview.field.getAttribute("data-is-poster")) {
			form_data.append("is_poster", preview.field.getAttribute("data-is-poster"));
		}


		// request response handler
		preview.deleteResponse = function(response) {
			// u.bug("deleteResponse", response);

			// notify interface
			page.notify(response);

			// if every thing is good udate and save
			if(response.cms_status && response.cms_status == "success") {

				// Remove uploaded file
				this.file.parentNode.removeChild(this.file);

				// Update uploaded file list
				this.field.uploaded_files = u.qsa("li.uploaded", this.field.filelist);

				// Update preview
				u.f.updateFilePreview(this.field);

				// Callback to make sure update can be handled elsewhere
				if(fun(this.field.input.fileDeleted)) {
					this.field.input.fileDeleted(this.file);
				}

			}

		}
		u.request(preview, preview.field.file_delete_action, {
			"callback": "deleteResponse",
			"method": "post",
			"data": form_data
		});
	}

	// Update filelist based on server response
	this.updateFilelistStatus = function(form, response) {
		// u.bug("updateFilelistStatus", form, response);

		// Do we have valid form and response
		// Response can be either one 
		if(form && form.inputs && response && response.cms_status == "success" && response.cms_object && (response.cms_object.mediae || response.cms_object.length && response.cms_object[0].variant)) {

			// clone response mediae
			var mediae;
			if(response.cms_object.mediae) {
				mediae = JSON.parse(JSON.stringify(response.cms_object.mediae));
			}
			else {
				mediae = JSON.parse(JSON.stringify(response.cms_object));
			}

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
									// if(u.cv(old_file, "media_id") == media.id) {
									if(old_file.getAttribute("data-media_id") === media.id) {

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

										// Remove file from fileinput
										u.f.removeFileFromFileInput(filelist.field.input, media.name);

										// Update classname
										u.rc(new_file, "new");
										u.ac(new_file, "uploaded");
										new_file.setAttribute("data-medie-id", media.id);
										new_file.setAttribute("data-variant", media.variant);
										new_file.setAttribute("data-format", media.format);
										new_file.setAttribute("data-width", media.width);
										new_file.setAttribute("data-height", media.height);
										new_file.setAttribute("data-description", media.description);
										new_file.setAttribute("data-created_at", media.created_at);


										// Don't bother with this media anymore
										delete mediae[j];
									}
								}
							}
						}
					}


					// Update field state
					// Check if all files were uploaded
					var remaining_new_files = u.qsa("li.new", filelist);
					if(!remaining_new_files.length) {
						u.rc(filelist.field, "has_new_files");
					}

				}

				filelist.field.uploaded_files = u.qsa("li.uploaded", filelist);

			}

		}

	}

	// Remove file for file input selection (after upload or if user modifies selected files before upload)
	this.removeFileFromFileInput = function(input, file_name) {
		// u.bug("removeFileFromFileInput", input.files, file_name);

		var datatransfer = new DataTransfer();
		var i, file;
		var files = Array.from(input.files);

		// Loop through all selected files and move all other files to datatransfor object
		for(i = 0; i < files.length; i++) {
			file = files[i];
			if(file_name !== file.name) {
				datatransfer.items.add(file);
			}
		}

		// Set updated files array as files property on input
		input.files = datatransfer.files;

	}



	// Update different aspects of form after submission response has been received
	// Fx. filelists, filepreviews
	// Must be called manually from response receiver, 
	// (since there is no way of knowing how submission and reception reception is handled)
	this.updateFormAfterResponse = function(form, response) {
		// u.bug("updateFormAfterResponse", form, response, form.inputs);

		this.updateFilelistStatus(form, response);

		var input;
		for(input in form.inputs) {
			if(form.inputs[input].field && form.inputs[input].field.type === "files") {
				this.updateFilePreview(form.inputs[input].field);
			}
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
			this[this._form._callback_focused](this);
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
			this[this._form._callback_blurred](this);
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
		// u.bug("_button_focus", this);

		u.ac(this, "focus");

		// callbacks
		// does button have callback
		if(fun(this[this._form._callback_focused])) {
			this[this._form._callback_focused](this);
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
			this[this._form._callback_blurred](this);
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
	// apply standard eventlisteners and apply labelstyle
	this.activateInput = function(iN) {
		// u.bug("activateInput:", iN, iN._form._label_style);

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


		// Labelstyle is defined?
		if(iN._form._label_style && fun(this.customLabelStyle[iN._form._label_style])) {

			// u.bug("custom label style", iN._form._label_style, iN);
			this.customLabelStyle[iN._form._label_style](iN);

		}
		// declare default value
		else {

			iN.default_value = "";

		}

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
				u.e.kill(event);
			}
		}

		// make button clickable
		u.ce(action);

		// apply clicked callback if not already declared
		if(!action.clicked) {

			// Create restore function if confirmation is required
			if(action.confirm) {
				// u.bug("confirm action:", action);

				action.restore = function() {
					u.rc(this, "confirm");
					this.wait_for_confirm = false;

					// Restore button value
					this.value = this.confirm_default_value;
				}
			}

			// default handling - can be overwritten in local implementation
			action.clicked = function(event) {
				// TODO: some uncertainty about the need for this kill
				// u.e.kill(event);

				// don't execute if button is disabled
				if(!u.hc(this, "disabled")) {

					// Confirmation required, enter wait for confirm state
					if(this.confirm && !this.wait_for_confirm) {

						// Wait for confirmation
						this.wait_for_confirm = true;

						// Enter confirm state
						u.ac(this, "confirm");

						// Set button value to confirm text
						this.confirm_default_value = this.value;
						this.value = this.confirm;

						// Set timeout for restoring original state
						this.t_confirm = u.t.setTimer(this, this.restore, 3000);

						return;
					}
					// Reset restore timer
					else if(this.confirm && this.t_confirm) {
						u.t.resetTimer(this.t_confirm);
					}

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

		// keyboard shortcut (mapped to form and only execute when a form field is focused)
		if(obj(u.k) && u.hc(action, "key:[a-z0-9]+")) {
			u.k.addKey(action._form, u.cv(action, "key"), {
				"callback": action.clicked.bind(action),
				"focused": true
			});
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
			var input_middle, help_top;
			if(field.virtual_input) {
				input_middle = field.virtual_input.parentNode.offsetTop + (field.virtual_input.parentNode.offsetHeight / 2);
			}
			else {
				input_middle = field.input.offsetTop + (field.input.offsetHeight / 2);
			}
			help_top = input_middle - field.help.offsetHeight / 2;

			u.ass(field.help, {
				"top": help_top + "px"
			});

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

		// if help element is available
		this.positionHint(iN.field);

	}

	// Update input validation state and provide callbacks as needed
	// Also updates form validation state
	this.updateInputValidationState = function(iN) {
		// u.bug("updateInputValidationState:" + iN.name + "," + iN.has_error + "," + iN.is_correct);

		// validation failed – callback if needed
		if(iN.has_error && fun(iN[iN._form._callback_validation_failed])) {
			iN[iN._form._callback_validation_failed]();
		}

		// validation passed – callback if needed
		else if(iN.is_correct && fun(iN[iN._form._callback_validation_passed])) {
			iN[iN._form._callback_validation_passed]();
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
		// u.bug("validate name: " + iN.name + ", value: " + iN.val());

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

			// json validation
			else if(u.hc(iN.field, "json")) {

				// min and max length
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 2;
				max = max ? max : 10000000;

				if(
					iN.val().length >= min && 
					iN.val().length <= max && 
					(function(value) {
						try {
							JSON.parse(value);
							return true;
						}
						catch(exception) {
							return false;
						}
					}(iN.val()))
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
				// u.bug("validate file");

				// min and max number of files
				min = Number(u.cv(iN.field, "min"));
				max = Number(u.cv(iN.field, "max"));
				min = min ? min : 1;
				max = max ? max : 10000000;

				// Acceptable file types
				pattern = iN.getAttribute("accept");
				if(pattern) {
					pattern = pattern.split(",");
				}

				// collect list of added and already uploaded files
				var i, files = Array.prototype.slice.call(u.qsa("li:not(.label,.preview)", iN.field.filelist));

				// Min width, min height, allowed sizes and proportions
				var min_width = Number(iN.getAttribute("data-min-width"));
				var min_height = Number(iN.getAttribute("data-min-height"));
				var allowed_sizes = iN.getAttribute("data-allowed-sizes");
				if(allowed_sizes) {
					allowed_sizes = allowed_sizes.split(",");
				}
				var allowed_proportions = iN.getAttribute("data-allowed-proportions");
				if(allowed_proportions) {
					allowed_proportions = allowed_proportions.split(",");
					for(i = 0; i < allowed_proportions.length; i++) {
						// Proportions are typically stated as divisions, like "16/9"
						// – must be "calculated" for comparison
						allowed_proportions[i] = u.round(eval(allowed_proportions[i]), 4);
					}
				}

				if(
					(files.length >= min && files.length <= max)
					&&
					(!pattern || files.every(function(node) {return pattern.indexOf("."+node.getAttribute("data-format")) !== -1}))
					&&
					(!min_width || files.every(function(node) {return node.getAttribute("data-width") >= min_width}))
					&&
					(!min_height || files.every(function(node) {return node.getAttribute("data-height") >= min_height}))
					&&
					(!allowed_sizes || files.every(function(node) {return allowed_sizes.indexOf(node.getAttribute("data-width")+"x"+node.getAttribute("data-height")) !== -1}))
					&&
					(!allowed_proportions || files.every(function(node) {return allowed_proportions.indexOf(u.round(Number(node.getAttribute("data-width"))/Number(node.getAttribute("data-height")), 4)) !== -1}))
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
		var format = "formdata";
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

		// Use FormData Object for data collection
		if(format == "formdata") {
			params = new FormData();

		}
		// Create data collection object
		else {
			params = new Object();
			// create dummy append function (but keep optional filename for compatibility)
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
						params.append(input.name, (input.value || ""));
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
		// format == "params" (or unknown format type)
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

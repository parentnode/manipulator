Util.Form = u.f = new function() {

	// extensive activation of form
	// indexes fields and 
	// - adds realtime validation, by settng correct/error classname
	// - sets focus classname on field focus
	// - adds callback for form change, update and submit
	this.init = function(form) {
//		u.bug("init form")
		var i, o;

		// TODO: add error callback

		// disable regular form submit
		form.onsubmit = function(event) {

			// TODO: add onclicks to buttons to avoid any ordinary submitting
//			alert("bad submit!")
			return false;
		}

		// do not
		form.setAttribute("novalidate", "novalidate");
		// set submit reference
		form._submit = this._submit;

		// objects for fields, actions and params
		form.fields = new Object();
		form.field_order = new Array();
		form.actions = new Object();

		// get all fields
		var fields = u.qsa(".field", form);
		for(i = 0; field = fields[i]; i++) {

			// remove requirement indicators
			var abbr = u.qs("abbr", field);
			if(abbr) {
				abbr.parentNode.removeChild(abbr);
			}

			// setup dynamic fields
//			u.bug("field:" + field.className)

			// get input label
			field.lN = u.qs("label", field);
			field._form = form;
//			field._required = field.className.match(/required/);

			// text inputs
			if(u.hasClass(field, "string|email|tel")) {
				field.iN = u.qs("input", field);
				field.iN.field = field;
				field.iN.val = function(value) {if(value) {this.value = value;} else {return this.value;}}

				// reference node
				form.fields[field.iN.name] = field.iN;

				// know position in field-order
				field.iN.field_order = form.field_order.length;
				form.field_order[form.field_order.length] = field.iN;

				this.activate(field.iN);
				// validate now
				this.validate(field.iN);


				u.e.addEvent(field.iN, "keyup", this._update);
				u.e.addEvent(field.iN, "change", this._changed);
				this.submitOnEnter(field.iN);
			}

			// numeric inputs
			if(field.className.match(/numeric|integer/)) {
				field.iN = u.qs("input", field);
				field.iN.field = field;
				field.iN.val = function(value) {if(value) {this.value = value;} else {return this.value;}}

				// reference node
				form.fields[field.iN.name] = field.iN;

				// know position in field-order
				field.iN.field_order = form.field_order.length;
				form.field_order[form.field_order.length] = field.iN;

				this.activate(field.iN);
				// validate now
				this.validate(field.iN);


				u.e.addEvent(field.iN, "keyup", this._update);
				u.e.addEvent(field.iN, "change", this._changed);
				this.submitOnEnter(field.iN);
			}

			// textareas
			if(field.className.match(/text/)) {
				field.iN = u.qs("textarea", field);
				field.iN.field = field;
				field.iN.val = function(value) {if(value !== undefined) {this.value = value;} else {return this.value;}}

				// reference node
				form.fields[field.iN.name] = field.iN;

				// know position in field-order
				field.iN.field_order = form.field_order.length;
				form.field_order[form.field_order.length] = field.iN;

				this.activate(field.iN);
				// validate now
				this.validate(field.iN);


				u.e.addEvent(field.iN, "keyup", this._update);
				u.e.addEvent(field.iN, "change", this._changed);


				// resize textarea while typing
				if(u.hc(field.iN, "autoexpand")) {
					// get textarea height value offset - webkit and IE/Opera scrollHeight differs from height
					// implenting different solutions is the only way to achive similar behaviour across browsers
					// fallback support is Mozilla 

					field.iN.offset = 0;
					if(parseInt(u.gcs(field.iN, "height")) != field.iN.scrollHeight) {
						field.iN.offset = field.iN.scrollHeight - parseInt(u.gcs(field.iN, "height"));
					}

					// set correct height
					field.iN.setHeight = function() {
						var textarea_height = parseInt(u.gcs(this, "height"));

						if(this.value) {
							if(u.webkit()) {
								if(this.scrollHeight - this.offset > textarea_height) {
									u.as(this, "height", this.scrollHeight+"px");
								}
							}
							else if(u.opera() || u.explorer()) {
								if(this.scrollHeight > textarea_height) {
									u.as(this, "height", this.scrollHeight+"px");
								}
							}
							else {
								u.as(this, "height", this.scrollHeight+"px");
							}
						}
					}
					u.e.addEvent(field.iN, "keyup", field.iN.setHeight);					
				}

			}

			// selects
			if(field.className.match(/select/)) {
				field.iN = u.qs("select", field);
				field.iN.field = field;
				field.iN.val = function(value) {
					if(value !== undefined) {
						var i, option;
						for(i = 0; option = this.options[i]; i++) {
							if(option.value == value) {
								this.selectedIndex = i;
								return i;
							}
						}
						return false;
					}
					else {
						return this.options[this.selectedIndex].value;
					}
				}

				form.fields[field.iN.name] = field.iN;

				// know position in field-order
				field.iN.field_order = form.field_order.length;
				form.field_order[form.field_order.length] = field.iN;

				this.activate(field.iN);
				// validate now
				this.validate(field.iN);


				u.e.addEvent(field.iN, "change", this._update);
				u.e.addEvent(field.iN, "change", this._changed);

//				TODO: handle enter if possible - enter can also mean change so catching that event might be sufficient
//				this.submitOnEnter(field.iN);
			}

			// checkbox/boolean (also checkbox)
			if(field.className.match(/checkbox|boolean/)) {
				field.iN = u.qs("input[type=checkbox]", field);
				field.iN.field = field;
				field.iN.val = function(value) {
					if(value) {
						this.checked = true
					}
					else {
						if(this.checked) {
							return this.value;
						}
					}
					return false;
				}

				form.fields[field.iN.name] = field.iN;

				// know position in field-order
				field.iN.field_order = form.field_order.length;
				form.field_order[form.field_order.length] = field.iN;

				this.activate(field.iN);
				// validate now
				this.validate(field.iN);

				// special setting for IE8 and less (bad onchange handler)
				if(u.explorer(8, "<=")) {
					field.iN.pre_state = field.iN.checked;

					field.iN._changed = u.f._changed;
					field.iN._update = u.f._update;
					field.iN._clicked = function(event) {
//						u.bug("clicked:" + this.checked + ":" + this.pre_state + ":" + u.nodeId(this));
						// if state is changed - callback to change and update notifier
						if(this.checked != this.pre_state) {
							this._changed(window.event);
							this._update(window.event);
						}
						this.pre_state = this.checked;
					}
					u.e.addEvent(field.iN, "click", field.iN._clicked);

				}
				else {
					u.e.addEvent(field.iN, "change", this._update);
					u.e.addEvent(field.iN, "change", this._changed);
				}
			}

			// radio button
			if(field.className.match(/radio/)) {
				field.iNs = u.qsa("input", field);
				var j, radio;
				for(j = 0; radio = field.iNs[j]; j++) {
					radio.field = field;

					radio.val = function(value) {
						if(value) {
							for(i = 0; option = this.field._form[this.name][i]; i++) {
								if(option.value == value) {
									option.checked = true;
								}
							}
						}
						else {
							var i, option;
							for(i = 0; option = this.field._form[this.name][i]; i++) {
								if(option.checked) {
									return option.value;
								}
							}
						}
						return false;
					}

					// TODO: this way we only reference one of the radio buttons
					form.fields[radio.name] = radio;


					// know position in field-order
					radio.field_order = form.field_order.length;
					form.field_order[form.field_order.length] = radio;


					this.activate(radio);
					// validate now
					this.validate(radio);

					// special setting for IE8 and less (bad onchange handler)
					if(u.explorer(8, "<=")) {
						radio.pre_state = radio.checked;

						radio._changed = u.f._changed;
						radio._update = u.f._update;
						radio._clicked = function(event) {
//							u.bug("clicked:" + this.checked + ":" + this.pre_state + ":" + u.nodeId(this));
							// if state is changed - callback to change and update notifier
							if(this.checked != this.pre_state) {
								this._changed(window.event);
								this._update(window.event);
							}
							// update prestates for all radios in set
							for(i = 0; iN = this.field.iNs[i]; i++) {
								iN.pre_state = iN.checked;
							}
						}
						u.e.addEvent(radio, "click", radio._clicked);

					}
					else {
						u.e.addEvent(radio, "change", this._update);
						u.e.addEvent(radio, "change", this._changed);
					}
				}
			}


			// Date field initialization
			if(field.className.match(/date/)) {
				// custom variation
				if(typeof(this.customInit) == "object" && typeof(this.customInit["date"]) == "function") {
					this.customInit["date"](field);
				}
				else {

					field.iNs = u.qsa("select,input", field);

					var date = field.iNs[0];
					this.submitOnEnter(date);
					date.field = field;
					var month = field.iNs[1];
					this.submitOnEnter(month);
					month.field = field;
					var year = field.iNs[2];
					this.submitOnEnter(year);
					year.field = field;

					this.activate(date);
					this.activate(month);
					this.activate(year);

					u.e.addEvent(date, "change", this._validateInput);
					u.e.addEvent(month, "change", this._validateInput);
					u.e.addEvent(year, "change", this._validateInput);
					// validate now
					this.validate(date)
					this.validate(month)
					this.validate(year)

				}
			}

			// File field initialization
			if(field.className.match(/file/)) {
				// custom variation
				if(typeof(this.customInit) == "object" && typeof(this.customInit["file"]) == "function") {
					this.customInit["file"](field);
				}
				else {
					field.iN = u.qs("input", field);
					field.iN.field = field;
					field.iN.val = function(value) {if(value) {this.value = value;} else {return this.value;}}

					// reference node
					form.fields[field.iN.name] = field.iN;

					// know position in field-order
					field.iN.field_order = form.field_order.length;
					form.field_order[form.field_order.length] = field.iN;

					this.activate(field.iN);
					// validate now
					this.validate(field.iN);

					u.e.addEvent(field.iN, "keyup", this._update);
					u.e.addEvent(field.iN, "change", this._changed);
				}
			}

			// check for custom inits
			if(typeof(this.customInit) == "object") {

				for(type in this.customInit) {
					if(field.className.match(type)) {
						this.customInit[type](field);
					}
				}

			}
			
		}


		// reference hidden fields
		var hidden_fields = u.qsa("input[type=hidden]", form);
		for(i = 0; hidden_field = hidden_fields[i]; i++) {
			// hidden fields
			// TODO: add theses to other scope?
			// dublet input names from simple_form??
			if(!form.fields[hidden_field.name]) {
				form.fields[hidden_field.name] = hidden_field;
				hidden_field.val = function(value) {if(value) {this.value = value;} else {return this.value;}}
			}
		}


		// get all actions
		var actions = u.qsa(".actions li", form);
		for(i = 0; action = actions[i]; i++) {
			// get action input-button/a
			action.iN = u.qs("input,a", action);

//			u.bug(u.listObjectContent(action.iN));

			// if submit button
			if(typeof(action.iN) == "object" && action.iN.type == "submit") {
//				u.bug("action:" + action + ":" + action.iN.name);

				// need to cancel onclick event to avoid normal post
				action.iN.onclick = function(event) {
					u.e.kill(event ? event : window.event);
				}

				u.e.click(action.iN);
				action.iN.clicked = function(event) {
//					alert("fusk:" + event)
					u.e.kill(event);

					// don't execute if button is disabled
					if(!u.hasClass(this, "disabled")) {
						// store submit button info
						this.form.submitButton = this;
						// remove any previous submit info
						this.form.submitInput = false;
						this.form._submit(event);
					}
				}
			}


// TODO: ONLY STORE NAMED BUTTONS?


			if(typeof(action.iN) == "object" && action.iN.name) {
				form.actions[action.iN.name] = action;
			}

			// shortcuts
//			u.bug(u.hc(action.iN, "key:[a-z0-9]+"));
			if(typeof(u.e.k) == "object" && u.hc(action.iN, "key:[a-z0-9]+")) {
				u.e.k.addShortcut(u.getIJ(action.iN, "key"), action.iN);
			}

//			u.bug("action:" + action.className)
		}
//		u.bug(u.listObjectContent(form.nodes));
	}


	// input is changed (onchange event)
	this._changed = function(event) {
//		u.bug("value changed:" + this.name + ":" + event.type + ":" + u.nodeId(event.srcElement));

		if(typeof(this.changed) == "function") {
			this.changed(this);
		}
		if(typeof(this.field._form.changed) == "function") {
			this.field._form.changed(this);
		}
	}

	// input is updated (onkeyup event)
	this._update = function(event) {
//		u.bug("value updated:" + this.name + ":" + event.type + ":" + u.nodeId(event.srcElement));

		// if key is not [TAB], [ENTER], [SHIFT], [CTRL], [ALT]
		if(event.keyCode != 9 && event.keyCode != 13 && event.keyCode != 16 && event.keyCode != 17 && event.keyCode != 18) {
//			u.bug("update:" + event.keyCode);

			// do not validate onkeyup - vestas requirement (could be reintroduced later)
//			u.f.validate(this);

			if(typeof(this.updated) == "function") {
				this.updated(this);
			}
			if(typeof(this.field._form.updated) == "function") {
				this.field._form.updated(this);
			}
		}

	}

	this._submit = function(event, iN) {

//		alert("submitted");
//		u.bug(u.listObjectContent(event));

		// do pre validation of all fields
		for(name in this.fields) {
			if(this.fields[name].field) {
//				u.bug("field:" + name);
				this.fields[name].used = true;
				u.f.validate(this.fields[name]);
			}
		}

//		u.bug("error:" + u.qs(".field.error", this))


		if(u.qs(".field.error", this)) {
			if(typeof(this.validationFailed) == "function") {
				this.validationFailed();
			}
		}
		else {
			if(typeof(this.submitted) == "function") {
				this.submitted(iN);
			}
			else {
				this.submit();
			}
		}
	}

	// validate input
	// TODO: phase out
	this._validate = function() {
		u.f.validate(this);
	}


	// submit field on [ENTER]
	this.submitOnEnter = function(iN) {
		iN._onkeydown = function(event) {
//			u.bug(event.keyCode);

			// TODO: IE 8 quickfix
			event = event ? event : window.event;

			if(event.keyCode == 13) {
				u.e.kill(event);

// TODO: do not submit disabled inputs

				// store submit info
				this.field._form.submitInput = this;
				// delete any previous submit info
				this.field._form.submitButton = false;
				this.field._form._submit(event);
			}
		}
		u.e.addEvent(iN, "keydown", iN._onkeydown);
	}


	// activate input - add focus and blur events
	this.activate = function(iN) {

		this._focus = function(event) {
			this.field.focused = true;
			u.ac(this.field, "focus");
			u.ac(this, "focus");

			// field has been interacted with
			this.used = true;
		}

		this._blur = function(event) {
			this.field.focused = false;
			u.rc(this.field, "focus");
			u.rc(this, "focus");
		}

		u.e.addEvent(iN, "focus", this._focus);
		u.e.addEvent(iN, "blur", this._blur);

		// validate on field blur
		u.e.addEvent(iN, "blur", this._validate);

	}




	// check if input value is default value
	this.isDefault = function(iN) {
		if(iN.field.default_value && iN.val() == iN.field.default_value) {
			return true;
		}
		return false;
	}

	// field has error - decide whether it is reasonable to show it or not
	this.fieldError = function(iN) {
//		u.bug("error:" + iN.name);
		u.rc(iN, "correct");
		u.rc(iN.field, "correct");
		// do not add visual feedback until field has been used by user - or if it contains value (reloads)
		if(iN.used || !this.isDefault(iN) && iN.val()) {
//			u.bug("ready for error state")
			u.ac(iN, "error");
			u.ac(iN.field, "error");

			// input validation failed
			if(typeof(iN.validationFailed) == "function") {
				iN.validationFailed();
			}

		}
	}

	// field is correct - decide whether to show it or not
	this.fieldCorrect = function(iN) {
//		u.bug("correct:" + iN.name);
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

	// validate input
	// - string (min 2 chars)
	// - numeric
	// - integer
	// - tel (+.- and min 5 max 14)
	// - email (valid email)
	// - text (text area - min 3 chars)
	// - select (option must have value)
	//
	// TODO: handle multiple validations on same field
	// - date
	this.validate = function(iN) {
//		u.bug("validate:" + iN.name)

		// string validation
		if(u.hc(iN.field, "string")) {

			if((iN.value.length > 0 && !this.isDefault(iN)) || !u.hc(iN.field, "required")) {
				this.fieldCorrect(iN);
			}
			else {
				this.fieldError(iN);
			}
		}

		// number validation
		if(u.hc(iN.field, "numeric")) {

			if((iN.value && !isNaN(iN.value) && !this.isDefault(iN)) || (!u.hc(iN.field, "required") && !iN.value)) {
				this.fieldCorrect(iN);
			}
			else {
				this.fieldError(iN);
			}
		}

		// integer validation
		if(u.hc(iN.field, "integer")) {

			if((iN.value && !isNaN(iN.value) && Math.round(iN.value) == iN.value && !this.isDefault(iN)) || (!u.hc(iN.field, "required") && !iN.value)) {
				this.fieldCorrect(iN);
			}
			else {
				this.fieldError(iN);
			}
		}

		// telephone validation
		if(u.hc(iN.field, "tel")) {

			if((iN.value.match(/^([\+0-9\-\.\s\(\)]){5,14}$/) && !this.isDefault(iN)) || (!u.hc(iN.field, "required") && !iN.value)) {
				this.fieldCorrect(iN);
			}
			else {
				this.fieldError(iN);
			}
		}

		// email validation
		if(u.hc(iN.field, "email")) {

			if((iN.value.match(/^([^<>\\\/%$])+\@([^<>\\\/%$])+\.([^<>\\\/%$]{2,20})$/) && !this.isDefault(iN)) || (!u.hc(iN.field, "required") && !iN.value)) {
				this.fieldCorrect(iN);
			}
			else {
				this.fieldError(iN);
			}
		}

		// text validation
		if(u.hc(iN.field, "text")) {

			if((iN.value.length > 2 && !this.isDefault(iN)) || !u.hc(iN.field, "required")) {
				this.fieldCorrect(iN);
			}
			else {
				this.fieldError(iN);
			}
		}

		// select validation
		if(u.hc(iN.field, "select")) {

			if(iN.options[iN.selectedIndex].value != "" || !u.hc(iN.field, "required")) {
				this.fieldCorrect(iN);
			}
			else {
				this.fieldError(iN);
			}
		}

		// checkbox/radio validation
		if(u.hc(iN.field, "checkbox|radio|boolean")) {

			if(iN.val() != "" || !u.hc(iN.field, "required")) {
				this.fieldCorrect(iN);
			}
			else {
				this.fieldError(iN);
			}
		}


//		u.bug("typeof(u.f.customValidate):" + typeof(u.f.customValidate))
		// loop through custom validations
		if(typeof(u.f.customValidate) == "object") {
			var custom_validation;
			for(custom_validation in u.f.customValidate) {
				if(u.hc(iN.field, custom_validation)) {
					u.f.customValidate[custom_validation](iN);
				}
//				u.bug("custom_validation:" + custom_validation)
			}
		}


		// date validation
		if(u.hc(iN.field, "date")) {

			// custom variation
			if(typeof(u.f.customValidate) == "object" && typeof(u.f.customValidate["date"]) == "function") {
				u.f.customValidate["date"](iN);
			}
			else {


				// if(iN.options[iN.selectedIndex].value != "" || !iN.field._required) {
				// 	this.fieldCorrect(iN);
				// }
				// else {
				// 	this.fieldError(iN);
				// }

			}

		}
		
		

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
	// - optional local extension via u.f.sendas array
	// ignore - input classnames to identify inputs to ignore, multiple classes can be | seperated (string is used as regular expression)
	this.getParams = function(form) {

		// define default options
		var type = "parameters";
		var ignore = false;

		// additional info passed to function as JSON object
		if(arguments.length > 1 && typeof(arguments[1]) == "object") {
			for(argument in arguments[1]) {

				switch(argument) {
					case "type": type = arguments[1][argument]; break;
					case "ignore" : ignore = new RegExp("(^|\\s)" + arguments[1][argument] + "(\\s|$)"); break;
				}

			}
		}

		// get inputs
		var i, input, select, textarea, param;

		// Object for found inputs/selects/textareas
		params = new Object();

		// add submit button to params if available
		if(form.submitButton && form.submitButton.name) {
			params[form.submitButton.name] = form.submitButton.value;
		}

		var inputs = u.qsa("input", form);
		var selects = u.qsa("select", form)
		var textareas = u.qsa("textarea", form)

		for(i = 0; input = inputs[i]; i++) {
			// exclude specific inputs (defined by ignoreinput and optional parameter ignore)
			if(!input.className.match(/ignoreinput/i) && (!ignore || !input.className.match(ignore))) {

				// if checkbox/radio and node is checked
				if((input.type == "checkbox" || input.type == "radio") && input.checked) {
					params[input.name] = input.value;
				}

				// if anything but buttons and radio/checkboxes
				// - hidden, text, html5 input-types
				else if(!input.type.match(/button|submit|checkbox|radio/i)) {
					params[input.name] = input.value;
				}
				
				// TODO: reset button?
			}
		}

		for(i = 0; select = selects[i]; i++) {
			// exclude specific inputs (defined by ignoreinput and optional parameter ignore)
			if(!select.className.match(/ignoreinput/i) && (!ignore || !select.className.match(ignore))) {
				params[select.name] = select.options[select.selectedIndex].value;
			}
		}

		for(i = 0; textarea = textareas[i]; i++) {
			// exclude specific inputs (defined by ignoreinput and optional parameter ignore)
			if(!textarea.className.match(/ignoreinput/i) && (!ignore || !textarea.className.match(ignore))) {
				params[textarea.name] = textarea.value;
			}
		}



		// look for local extension types
		if(typeof(this.customSend) == "object" && typeof(this.customSend[type]) == "function") {
			return this.customSend[type](params, form);
		}
		// or use defaults
		// return as parameter string
		else if(type == "parameters") {

			var string = "";
			for(param in params) {
				string += param + "=" + encodeURIComponent(params[param]) + "&";
			}
			return string;
		}

		// return as json string
		else if(type == "json") {

			// convert to JSON object
			object = u.f.convertNamesToJsonObject(params);
			return JSON.stringify(object);
		}

		// return as js object
		else if(type == "object") {

			return params;
		}

	}
}

// Convert param names to nested JSON object structure
u.f.convertNamesToJsonObject = function(params) {
 	var indexes, root, indexes_exsists;
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
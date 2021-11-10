Util.Form.customInit["checkbox"] = function(field) {
	// u.bug("init checkbox", field);

	// Register field type
	field.type = "checkbox";

	// Get primary input
	field.input = u.qs("input[type=checkbox]", field);
	// form is a reserved property, so we use _form
	field.input._form = field._form;
	// Get associated label
	field.input.label = u.qs("label[for='"+field.input.id+"']", field);
	// Let it know it's field
	field.input.field = field;

	field._value_checkbox = function(value) {

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
			this.field.virtual_input.val(value);

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
	// get/set value function
	field.input.val = field._value_checkbox;

	// Update checkbox field classname whenever value is changed
	u.f._update_checkbox_field.bind(field.input)();



	// inject UI elements
	// Wrap contentEditable element in div, to prevent bug in MS Edge (12-16), where it removes part of the DOM when pressing delete or selecting last char and typing.
	var virtual_input_wrapper = u.ae(field, "div", {"class": "virtual"});
	field.insertBefore(virtual_input_wrapper, field.input);

	field.virtual_input = u.ae(virtual_input_wrapper, "div", {"class": "input"});
	// map relevant references
	field.virtual_input._form = field._form;
	field.virtual_input.field = field;

	// inject arrow
	field.gx_checkmark = u.svg({
		"name":"checkbox_checkmark",
		"node":field.virtual_input,
		"class":"checkbox_checkmark",
		"width":30,
		"height":30,
		"viewBox": "0 0 30 30",
		"shapes":[
			{
				"type": "line",
				"class":"checkmark",
				"x1": 7,
				"y1": 15,
				"x2": 14,
				"y2": 26
			},
			{
				"type": "line",
				"class":"checkmark",
				"x1": 14,
				"y1": 26,
				"x2": 23,
				"y2": 6
			}
		]
	});



	// get/set value for virtual dropdown input
	field._value_virtual = function(value) {
		// u.bug("_value_virtual", value, this.field.select_options.nodes);

		// set value
		if (value !== undefined) {

			this.field.input.val(value);
			this.field.input.dispatchEvent(new Event("change"));
			return;

		}
		// get value
		else {
			return this.field.input.val();
		}

	}

	// map special val() function to dropdown field
	field.virtual_input.val = field._value_virtual;

	if(u.e.event_support != "touch") {
		u.e.addEvent(field.virtual_input, "mouseenter", u.f._mouseenter);
		u.e.addEvent(field.virtual_input, "mouseleave", u.f._mouseleave);
	}


	// opposite order of elsewhere to ensure instant validation
	u.e.addEvent(field.input, "change", u.f._changed);
	u.e.addEvent(field.input, "change", u.f._updated);
	u.e.addEvent(field.input, "change", u.f._update_checkbox_field);

	field.windowClick = function() {
		// u.bug("windowClick", this);
		this.virtual_input.blur();
	}

	// internal focus handler - attatched to inputs
	field.virtual_input._focus = function(event) {
		// u.bug("this._focus:", this);

		if(!this.is_focused) {
			this.blur_event_id = u.e.addWindowEndEvent(this.field, this.field.windowClick);


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
			if(this.field.input && typeof(this.field.input.focused) == "function") {
				this.field.input.focused(this);
			}

			// does form have callback declared
			if(typeof(this._form.focused) == "function") {
				this._form.focused(this);
			}
		}

	}

	// internal blur handler - attatched to inputs
	field.virtual_input.blur = function() {
		// u.bug("this.blur:", this, this.blur_event_id);

		u.e.removeWindowEndEvent(this.blur_event_id);

		u.rc(this.field, "focus");
		u.rc(this, "focus");


		// field has been interacted with (content can now be validated)
		this.field.input._used = true;

		// validate on blur
		u.f.validate(this.field.input);

		this.is_focused = false;
		this.field.is_focused = false;

		// drop back to base z-index
		u.as(this.field, "zIndex", this.field._base_z_index);


		// callbacks
		// does input have callback
		if(this.field.input && typeof(this.field.input.blurred) == "function") {
			this.field.input.blurred(this);
		}

		// does form have callback declared
		if(typeof(this._form.blurred) == "function") {
			this._form.blurred(this);
		}
	}

	// add focus and blur event handlers to virtual input
	u.e.addEvent(field.virtual_input, "focus", field.virtual_input._focus);


	field.virtual_input.preKeyEvent = function (event) {
		// u.bug("preKeyEvent key:" + event.keyCode);

		// [ENTER] - select highlighted_option if it extist - otherwise ignore
		if (event.keyCode == 13) {
			u.e.kill(event);

			this._form.submit();

		}
		// [TAB] - select highlighted_option if it extist - otherwise it is just a space
		else if (event.keyCode == 9) {

			this.blur();

		}
		// [SPACE] - select highlighted_option if it extist - otherwise it is just a space
		else if (event.keyCode == 32) {

			this.clicked();

		}

	}
	u.e.addEvent(field.virtual_input, "keydown", field.virtual_input.preKeyEvent);


	// Toggle options view when clicking on input area
	u.ce(field.virtual_input);
	field.virtual_input.clicked = function(event) {
		// u.bug("clicked", this.field.input.checked);
		u.e.kill(event);

		if(this.field.input.checked) {
			this.field.input.checked = false;
		}
		else {
			this.field.input.checked = true;
		}

		this.field.input.dispatchEvent(new Event("change"));
	}

	// Add additional standard event listeners and labelstyle
	u.f.activateInput(field.input);

}

// Validator
Util.Form.customValidate["checkbox"] = function(iN) {

	if(iN.val()) {
		u.f.inputIsCorrect(iN);
	}
	else {
		u.f.inputHasError(iN);
	}

}



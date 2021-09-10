Util.Form.customInit["select"] = function(field) {

	// Register field type
	field.type = "select";

	// Get primary input
	field.input = u.qs("select", field);
	// form is a reserved property, so we use _form
	field.input._form = field._form;
	// Get associated label
	field.input.label = u.qs("label[for='"+field.input.id+"']", field);
	// Let it know it's field
	field.input.field = field;


	// value get/setter for selects
	field._value_select = function (value) {
		// u.bug("_value_select", value);

		// only return value if no value is passed (value could be false or 0)
		if (value !== undefined) {

			var i, option;
			// find option with matching value option
			for (i = 0; option = this.options[i]; i++) {
				if (option.value == value) {
					this.selectedIndex = i;

					// validate after setting value
					u.f.validate(this);

					this.field.virtual_input.val(option.text);

					return i;
				}
			}
			// deselect but no empty value option
			if (value === "") {
				this.selectedIndex = -1;
				u.f.validate(this);

				this.field.virtual_input.val("");

				return -1;
			}

			return false;
		}
		else {
			return (this.selectedIndex >= 0 && this.default_value != this.options[this.selectedIndex].value) ? this.options[this.selectedIndex].value : "";
		}
	}

	// get/set value function
	// maybe we need two value functions - one for the actual input and one the the contentEditable 
	field.input.val = field._value_select;



	// inject UI elements
	// Wrap contentEditable element in div, to prevent bug in MS Edge (12-16), where it removes part of the DOM when pressing delete or selecting last char and typing.
	var virtual_input_wrapper = u.ae(field, "div", {"class": "virtual"});
	field.insertBefore(virtual_input_wrapper, field.input);

	field.virtual_input = u.ae(virtual_input_wrapper, "div", {"class": "input", "tabindex": 1});
	// map relevant references
	field.virtual_input._form = field._form;
	field.virtual_input.field = field;

	// inject option selector button
	field.bn_select = u.ae(virtual_input_wrapper, "div", {"class": "button"});
	// map relevant references
	field.bn_select._form = field._form;
	field.bn_select.field = field;



	// create options list
	field.select_options = u.ae(virtual_input_wrapper, "div", { "class": "options" });
	field.select_options.field = field;
	field.select_options_list = u.ae(field.select_options, "ul", { "class": "options" });


	// get/set value for virtual dropdown input
	field._value_virtual = function(value) {
		// u.bug("_value_virtual", value, this.field.select_options.nodes);

		// set value
		if (value !== undefined) {
			this.field.virtual_input.innerHTML = value;

			var i, node;
			for(i = 0; option = this.field.select_options.nodes[i]; i++) {
				if(option.option_text == value) {
					// add selection marker
					u.ac(option, "selected");
				}
				else {
					u.rc(option, "selected");
				}
			}

			u.f._updated.call(this.field.input, {"type":"update", "target":this.field.input});
			u.f._changed.call(this.field.input, {"type":"update", "target":this.field.input});

			return;

		}
		// get value
		else {
			if (this.field.virtual_input) {
				return u.text(this.field.virtual_input);
			} else {
				return "";
			}
		}

	}

	// map special val() function to dropdown field
	field.virtual_input.val = field._value_virtual;



	// change/update events
	u.e.addEvent(field.input, "change", u.f._updated);
	u.e.addEvent(field.input, "keyup", u.f._updated);
	u.e.addEvent(field.input, "change", u.f._changed);



	// internal focus handler - attatched to inputs
	field.virtual_input._focus = function(event) {
		// u.bug("this._focus:", this);

		if(!this.is_focused) {
			this.field.blur_event_id = u.e.addWindowStartEvent(this, this._blur);
		}

		this.field.is_focused = true;
		this.is_focused = true;

		u.ac(this.field, "focus");
		u.ac(this, "focus");

		// make sure field goes all the way in front - hint/error must be seen
		u.as(this.field, "zIndex", this._form._focus_z_index);

		// Show options
		u.ass(this.field.select_options, {
			transition: "all 0.3s ease-in-out",
			height: this.field.select_options_list.offsetHeight + "px"
		});


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

	// internal blur handler - attatched to inputs
	field.virtual_input._blur = function(event) {
		// u.bug("this._blur:", this, event.target, this.field.blur_event_id);

		u.e.removeWindowStartEvent(this, this.field.blur_event_id);


		u.rc(this.field, "focus");
		u.rc(this, "focus");


		// Unset highlighted option
		if(this.field.highlighted_option) {
			u.rc(this.field.highlighted_option, "hover");
			this.field.highlighted_option = false;
		}

		// field has been interacted with (content can now be validated)
		this.field.input._used = true;

		// Show options
		this.field.select_options.transitioned = function() {
			this.field.is_focused = false;
			this.field.virtual_input.is_focused = false;

			// drop back to base z-index
			u.as(this.field, "zIndex", this.field._base_z_index);

		}
		u.ass(this.field.select_options, {
			transition: "all 0.2s ease-in-out",
			height: "0px"
		});

		// validate on blur
		u.f.validate(this.field.input);


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
	u.e.addEvent(field.virtual_input, "blur", field.virtual_input._blur);



	// handle all keyevent on virtual taxonomy input
	field.virtual_input.preKeyEvent = function (event) {
		// u.bug("key:" + event.keyCode);

		// [ESC] - clean up virtual dropdown input and re-activate cursor
		if (event.keyCode == 27) {
			u.e.kill(event);
			this.blur();
		}
		// [ENTER] - select highlighted_option if it extist - otherwise ignore
		else if (event.keyCode == 13) {

			u.e.kill(event);

			// if tag is selected in tags list
			if (this.field.highlighted_option) {

				this.field.selectOption(this.field.highlighted_option);
				this.blur();
			}

		}
		// [TAB] - select highlighted_option if it extist - otherwise it is just a space
		// I shiftKey is pressed it is just a backwards tab
		else if (event.keyCode == 9 && !event.shiftKey) {

			// if tag is selected in tags list
			if (this.field.highlighted_option) {
				u.e.kill(event);

				this.field.selectOption(this.field.highlighted_option);
				this.blur();
			}

		}
		// [SPACE] - select highlighted_option if it extist - otherwise it is just a space
		else if (event.keyCode == 32) {

			// if tag is selected in tags list
			if (this.field.highlighted_option) {
				u.e.kill(event);

				this.field.selectOption(this.field.highlighted_option);
				this.blur();
			}

		}
		// [ARROW UP] - look for previous option
		else if (event.keyCode == 38) {
			u.e.kill(event);

			this.field.selectPreviousOption();
		}
		// [ARROW DOWN] - look for next option
		else if (event.keyCode == 40) {
			u.e.kill(event);

			this.field.selectNextOption();
		}
	}
	u.e.addEvent(field.virtual_input, "keydown", field.virtual_input.preKeyEvent);


	// find next available option
	field.selectNextOption = function() {
		// u.bug("next option:" + field.highlighted_option);
	
		var node;

		// a node is already selected - start with that
		if(this.highlighted_option) {
			node = u.ns(this.highlighted_option);
		}
		else {
			node = this.select_options.nodes[0];
		}

		if(node) {

			// update selection info
			if (this.highlighted_option) {
				u.rc(this.highlighted_option, "hover");
			}

			u.ac(node, "hover");
			this.highlighted_option = node;

		}

	}

	// find previous available option
	field.selectPreviousOption = function() {
		// u.bug("prev option:" + field.highlighted_option);

		var node;

		// a node is already selected - start with that
		if(this.highlighted_option) {
			node = u.ps(this.highlighted_option);
		}

		if(node) {

			// update selection info
			if (field.highlighted_option) {
				u.rc(field.highlighted_option, "hover");
			}
			u.ac(node, "hover");
			field.highlighted_option = node;

		}

	}



	// add option to dropdown
	field.addOption = function (node) {
		// u.bug("addOption", node, node.text);

		if(node.text) {

			// add list element
			var li = u.ae(this.select_options_list, "li", { "class": (!node.value ? " default" : ""), "html": node.text });
			li.field = this;
			li.option_value = node.value;
			li.option_text = node.text;

			// add click handler to list element
			u.ce(li);
			li.inputStarted = function (event) {
				u.e.kill(event);
				// select this option
				this.field.selectOption(this);
				this.field.virtual_input.blur();
			}

			// handlers for mouseover and mouseout
			li.mouseover = function (event) {

				if(this.field.highlighted_option) {
					u.rc(this.field.highlighted_option, "hover");
				}

				u.ac(this, "hover");
				this.field.highlighted_option = this;
			}
			u.e.addEvent(li, "mouseover", li.mouseover);

			li.mouseout = function (event) {

				u.rc(this, "hover");
				this.field.highlighted_option = false;
			}
			u.e.addEvent(li, "mouseout", li.mouseout);

		}

	}

	// select option
	field.selectOption = function(li) {
		// u.bug("selectOption:" + li.option_text);

		// update search text
		this.input.val(li.option_value);

	}

	// open dropdown – unless already open
	field.bn_select.clicked = function() {
		if(!this.field.is_focused) {
			this.field.virtual_input.focus();
		}
	}
	u.e.click(field.bn_select);


	// load options
	field.loadOptions = function() {

		// use existing select options
		// loop through response nodes and add elements to tag list
		var i, node, li;
		for (i = 0; node = this.input.options[i]; i++) {

			// add option to virtual dropdown
			this.addOption(node);
		}

		// get list of all tag nodes
		this.select_options.nodes = u.qsa("li", this.select_options_list);

		// Update to current selected value
		this.input.val(this.input.val());

	}

	field.loadOptions();

	// Add additional standard event listeners and labelstyle
	u.f.activateInput(field.input);

}

// example validator - matches field with "example" class
Util.Form.customValidate["select"] = function(iN) {

	if(iN.val()) {
		u.f.inputIsCorrect(iN);
	}
	else {
		u.f.inputHasError(iN);
	}

}



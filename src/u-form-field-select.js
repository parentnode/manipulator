Util.Form.customInit["select"] = function(field) {
	// u.bug("init select", field);

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

	field.virtual_input = u.ae(virtual_input_wrapper, "div", {"class": "input"});
	// map relevant references
	field.virtual_input._form = field._form;
	field.virtual_input.field = field;

	// inject option selector button
	field.bn_select = u.ae(virtual_input_wrapper, "div", {"class": "button"});

	// inject arrow
	field.bn_select.arrow = u.svg({
		"name":"arrow",
		"node":field.bn_select,
		"class":"arrow",
		"width":30,
		"height":30,
		"viewBox": "0 0 30 30",
		"shapes":[
			{
				"type": "line",
				"x1": 8,
				"y1": 12,
				"x2": 15,
				"y2": 19
			},
			{
				"type": "line",
				"x1": 22,
				"y1": 12,
				"x2": 15,
				"y2": 19
			}
		]
	});


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

			// this.field.input.dispatchEvent(new Event("update"));
			this.field.input.dispatchEvent(new Event("change"));
			// u.f._updated.call(this.field.input, {"type":"update", "target":this.field.input});
			// u.f._changed.call(this.field.input, {"type":"change", "target":this.field.input});

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

	if(u.e.event_support != "touch") {
		u.e.addEvent(field.virtual_input, "mouseenter", u.f._mouseenter);
		u.e.addEvent(field.virtual_input, "mouseleave", u.f._mouseleave);
	}


	// change/update events
	u.e.addEvent(field.input, "change", u.f._updated);
	u.e.addEvent(field.input, "keyup", u.f._updated);
	u.e.addEvent(field.input, "change", u.f._changed);


	field.windowClick = function() {
		// Hide options if shown
		// u.bug("windowClick", this);
		
		this.optionsHidden = function() {
			this.virtual_input.blur();
			delete this.optionsHidden;

		}
		this.hideOptions();

	}
	// internal focus handler - attatched to inputs
	field.virtual_input._focus = function(event) {
		u.bug("this._focus:", this);

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
		u.bug("this.blur:", this, this.blur_event_id);


		u.e.removeWindowEndEvent(this.blur_event_id);

		u.rc(this.field, "focus");
		u.rc(this, "focus");


		// Unset highlighted option
		if(this.field.highlighted_option) {
			u.rc(this.field.highlighted_option, "hover");
			this.field.highlighted_option = false;
		}

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

		// [ESC] - clean up virtual dropdown input and re-activate cursor
		if (event.keyCode == 27) {
			u.e.kill(event);
			this.field.hideOptions();
			// this.blur();
		}
		// [ENTER] - select highlighted_option if it extist - otherwise ignore
		else if (event.keyCode == 13) {
			u.e.kill(event);


			if (this.field.highlighted_option && this.field.is_expanded) {
				this.field.selectOption(this.field.highlighted_option);
			}
			// if tag is selected in tags list
			else if(this.field.is_expanded) {
				this.field.hideOptions();
			}
			else if(!this.field.is_expanded) {
				this._form.submit();
			}

		}
		// [TAB] - select highlighted_option if it extist - otherwise it is just a space
		else if (event.keyCode == 9) {

			// if tag is selected in tags list
			if (this.field.highlighted_option) {
				this.field.selectOption(this.field.highlighted_option);
			}
			else {
				this.field.hideOptions();
			}
			this.blur();

		}
		// [SPACE] - select highlighted_option if it extist - otherwise it is just a space
		else if (event.keyCode == 32) {

			if (!this.field.is_expanded) {
				this.field.showOptions();
			}
			// if tag is selected in tags list
			else if (this.field.highlighted_option) {
				this.field.selectOption(this.field.highlighted_option);
			}
			else {
				this.field.hideOptions();
			}

		}
		// [ARROW UP] - look for previous option
		else if (event.keyCode == 38) {
			u.e.kill(event);

			if (!this.field.is_expanded) {
				this.field.showOptions();
			}
			else {
				this.field.highlightPreviousOption();
			}
		}
		// [ARROW DOWN] - look for next option
		else if (event.keyCode == 40) {
			u.e.kill(event);

			if (!this.field.is_expanded) {
				this.field.showOptions();
			}
			else {
				this.field.highlightNextOption();
			}
		}
	}
	u.e.addEvent(field.virtual_input, "keydown", field.virtual_input.preKeyEvent);


	// Toggle options view when clicking on input area
	u.ce(field.virtual_input);
	field.virtual_input.clicked = function(event) {
		// u.bug("field.virtual_input.clicked", this, event);

		u.e.kill(event);

		if(this.field.is_expanded) {
			this.field.hideOptions();
		}
		else {
			this.field.showOptions();
		}
	}

	// u.f.inputOnEnter(field.virtual_input);

	// Show options
	field.showOptions = function() {
		// u.bug("showOptions:" + field);

		if(!this.is_expanded) {
			// Show options
			u.ass(this.select_options, {
				transition: "all 0.3s ease-in-out",
				height: this.select_options_list.offsetHeight + "px"
			});

			this.is_expanded = true;
		}

	}

	// Hide options
	field.hideOptions = function() {

		if(this.is_expanded) {
			this.select_options.transitioned = function() {
				if(fun(this.field.optionsHidden)) {
					this.field.optionsHidden();
				}
			}

			u.ass(this.select_options, {
				transition: "all 0.2s ease-in-out",
				height: "0px"
			});

			this.is_expanded = false;
		}
		else if(fun(this.optionsHidden)) {
			this.optionsHidden();
		}

	}

	// find next available option
	field.highlightNextOption = function() {
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
	field.highlightPreviousOption = function() {
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
			li.clicked = function (event) {
				u.e.kill(event);
				// select this option
				this.field.selectOption(this);
				// this.field.virtual_input.blur();
			}

			u.e.hover(li);
			// handlers for mouseover and mouseout
			li.over = function (event) {

				if(this.field.highlighted_option) {
					u.rc(this.field.highlighted_option, "hover");
				}

				u.ac(this, "hover");
				this.field.highlighted_option = this;
			}
			// u.e.addEvent(li, "mouseover", li.mouseover);

			li.out = function (event) {

				u.rc(this, "hover");
				this.field.highlighted_option = false;
			}
			// u.e.addEvent(li, "mouseout", li.mouseout);

		}

	}

	// select option
	field.selectOption = function(li) {
		// u.bug("selectOption:" + li.option_text);

		// update search text
		this.input.val(li.option_value);
		this.hideOptions();

	}

	// open dropdown – unless already open
	field.bn_select.clicked = function(event) {
		u.e.kill(event);

		this.field.virtual_input.focus();

 		if(this.field.is_expanded) {
			this.field.hideOptions();
		}
		else {
			this.field.showOptions();
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

// Validator
Util.Form.customValidate["select"] = function(iN) {

	if(iN.val()) {
		u.f.inputIsCorrect(iN);
	}
	else {
		u.f.inputHasError(iN);
	}

}



Util.Form.customInit["dropdown"] = function(field) {
	// u.bug("init dropdown:", field);

	// Register field type
	field.type = "dropdown";


	// Get primary input
	field.input = u.qs("select", field);
	// form is a reserved property, so we use _form
	field.input._form = field._form;
	// Get associated label
	field.input.label = u.qs("label[for='"+field.input.id+"']", field);
	// Let it know it's field
	field.input.field = field;



	// value get/setter for selects
	field._value_select = function(value) {

		// only return value if no value is passed (value could be false or 0)
		if(value !== undefined) {

			// new:: option – create new option to enable serverside creation of new option
			if(value.match(/^new::/)) {

				if(!this.field.new_option) {
					this.field.new_option = document.createElement("option");
					this.add(this.field.new_option);
				}

				var text = value.replace(/^new::/, "");
				this.field.new_option.value = value;
				this.field.new_option.text = text;

				this.selectedIndex = this.options.length-1;
				u.f.validate(this);

				this.field.virtual_input.val(text);
				
				return this.selectedIndex;

			}


			// find option with matching value option if it exists
			var i, option;
			for(i = 0; i < this.options.length; i++) {
				option = this.options[i];
				if(option.value == value) {
					this.selectedIndex = i;

					// validate after setting value
					u.f.validate(this);

					this.field.virtual_input.val(option.text);

					return i;
				}
			}


			// deselect but no empty value option
			if(value === "") {
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
	field.input.val = field._value_select;

	u.e.addEvent(field.input, "change", u.f._changed);
	u.e.addEvent(field.input, "update", u.f._updated);




	// inject UI elements
	// Wrap contentEditable element in div, to prevent bug in MS Edge (12-16), where it removes part of the DOM when pressing delete or selecting last char and typing.
	var virtual_input_wrapper = u.ae(field, "div", {"class": "virtual"});
	field.virtual_input = u.ae(virtual_input_wrapper, "div", {"class": "input"});
	field.insertBefore(virtual_input_wrapper, field.input);

	// map relevant references
	field.virtual_input._form = field._form;
	field.virtual_input.field = field;


	// get/set value for virtual dropdown input
	field._value_virtual = function(value) {
		// u.bug("set value:", value);

		// set value
		if(value !== undefined) {

			if(!this.field.span_search.is_focused) {
				this.field.span_search.innerHTML = value;
			}


			// Clear selection info
			this.field.selected_option = false;
			u.rc(this.field.span_search, "selection");

			// Re-evaluate selection
			var i, option;
			for(i = 0; i < this.field.dropdown_options.nodes.length; i++) {
				option = this.field.dropdown_options.nodes[i];
				if(option.option_text == value) {

					// add selection marker
					u.ac(this.field.span_search, "selection");

					// remember li reference
					this.field.selected_option = option;

					// only one selection posible
					return;
				}
			}

		}
		// get value
		else {
			if(this.field.span_search) {
				return u.text(this.field.span_search);
			}
			else {
				return "";
			}
		}

	}
	// map special val() function to dropdown field
	field.virtual_input.val = field._value_virtual;


	// if click occurs on search text - allow positioning of cursor according to click
	field.virtual_input.clicked = function(event) {
		// u.bug("clicked")

		// re-activate cursor
		this.field.activateSearchCursor();

	}
	u.e.click(field.virtual_input);

	// handle all keydown events on virtual input
	field.virtual_input.preKeyEvent = function (event) {
		// u.bug("preKeyEvent:", event.keyCode);


		// [ESC] - clean up virtual dropdown input and re-activate cursor
		if(event.keyCode == 27) {

			u.e.kill(event);

			// end show_all state
			this.field._show_all = false;

			// re-activate cursor
			this.field.activateSearchCursor();

		}
		// [ENTER] - select highlighted_option if it extist - otherwise ignore
		else if(event.keyCode == 13) {

			u.e.kill(event);

			// if option is highlighted, then select
			if(this.field.highlighted_option) {
				this.field.selectOption(this.field.highlighted_option);
			}

		}
		// [TAB] + [SHIFT]
		else if(event.shiftKey && event.keyCode == 9) {

			// additional blur handler (used along with window mousedown/touchstart)
			// invoke blur with body as event.target
			this.field.span_search._blur({"target": document.body});

		}
		// [TAB] - select highlighted_option if it extist - otherwise it is just a tab
		else if(event.keyCode == 9) {

			// if option is highlighted
			if(this.field.highlighted_option) {

				u.e.kill(event);
				this.field.selectOption(this.field.highlighted_option);

			}
			else {

				// additional blur handler (used along with window mousedown/touchstart)
				// invoke blur with body as event.target
				this.field.span_search._blur({"target": document.body});

			}

		}
		// [SPACE] - select highlighted_option if it extist - otherwise it is just a space
		else if(event.keyCode == 32) {

			// if option is highlighted
			if(this.field.highlighted_option) {

				u.e.kill(event);
				this.field.selectOption(this.field.highlighted_option);

			}

		}
		// [ARROW UP] - look for previous option
		else if(event.keyCode == 38 && !event.shiftKey) {

			u.e.kill(event);
			this.field.highlightPreviousOption();

		}
		// [ARROW DOWN] - look for next option
		else if(event.keyCode == 40 && !event.shiftKey) {

			u.e.kill(event);

			// Navigate options if available
			if(this.field.available_options) {
				this.field.highlightNextOption();
			}
			// show all options
			else {
				this.field._show_all = true;
			}

		}
	}

	// handle all keyup events on virtual input
	field.virtual_input.postKeyEvent = function(event) {
		// u.bug("postKeyEvent:", event.keyCode, this.field.input.val());

		// end show_all state when actual input is received
		if(event.keyCode == 8 || event.keyCode == 32 || event.keyCode >= 65) {
			this.field._show_all = false;
		}

		var value = this.field.virtual_input.val();

		// this is done on any key input to be absolutely sure – will also match any existing options
		// selected_option not set – or does not match search text
		if(!this.field.selected_option || this.field.selected_option.option_text != value) {

			// Clear selection option
			// updateDropdownValue uses this property to decide appropriate action
			this.field.selected_option = false;

			var i, option;
			for(i = 0; i < this.field.dropdown_options.nodes.length; i++) {
				option = this.field.dropdown_options.nodes[i];
				if(option.option_text.toLowerCase() == value.toLowerCase()) {
					this.field.selected_option = option;
					break;
				}
			}

			// Update select – cascades to other interface settings
			this.field.updateDropdownValue();

		}

		// just typing - start search with small delay
		u.t.resetTimer(this.field.t_search);
		this.field.t_search = u.t.setTimer(this.field, this.field.searchOptions, 200);

	}
	u.e.addEvent(field.virtual_input, "keyup", field.virtual_input.postKeyEvent);
	u.e.addEvent(field.virtual_input, "keydown", field.virtual_input.preKeyEvent);




	// inject actual search input
	field.span_search = u.ae(field.virtual_input, "span", {"class": "search", "contentEditable": "true"});
	// map relevant references
	field.span_search._form = field._form;
	field.span_search.field = field;


	// internal focus handler - attatched to inputs
	field.span_search._focus = function(event) {
		// u.bug("this._focus:", this);

		if(!this.is_focused) {
			this.field.blur_event_id = u.e.addWindowStartEvent(this, this._blur);
		}

		this.field.is_focused = true;
		this.is_focused = true;

		u.ac(this.field, "focus");
		u.ac(this, "focus");
		u.ac(this.field.virtual_input, "focus");


		// make sure field goes all the way in front - hint/error must be seen
		u.as(this.field, "zIndex", this._form._focus_z_index);


		// is help element available, then position it appropriately to input
		u.f.positionHint(this.field);


		// re-activate cursor
		this.field.activateSearchCursor();



		// callbacks
		// does input have callback
		if(typeof(this.focused) == "function") {
			this.focused();
		}
		// certain fields with multiple input will have callback declared on first input only
		// like radio buttons
		else if(this.field.input && typeof(this.field.input.focused) == "function") {
			this.field.input.focused(this);
		}

		// does form have callback declared
		if(typeof(this._form.focused) == "function") {
			this._form.focused(this);
		}

	}

	// internal blur handler - attatched to inputs
	field.span_search._blur = function(event) {
		// u.bug("this._blur:", this);

		if(!u.contains(this.field, event.target)) {
			// u.bug("blurred", this.field, event.target);

			u.e.removeWindowStartEvent(this, this.field.blur_event_id);

			this.field.is_focused = false;
			this.is_focused = false;

			u.rc(this.field, "focus");
			u.rc(this, "focus");
			u.rc(this.field.virtual_input, "focus");

			// drop back to base z-index
			u.as(this.field, "zIndex", this.field._base_z_index);


			// field has been interacted with (content can now be validated)
			this._used = true;


			// end show_all state
			this.field._show_all = false;


			// Update select – cascades to other interface settings
			this.field.updateDropdownValue();

			// Hide options in case they were shown
			this.field.hideOptions();


			// validate on blur
			u.f.validate(this.field.input);


			// callbacks
			// does input have callback
			if(typeof(this.blurred) == "function") {
				this.blurred();
			}
			// certain fields with multiple input will have callback declared on first input only
			// like radio buttons
			else if(this.field.input && typeof(this.field.input.blurred) == "function") {
				this.field.input.blurred(this);
			}

			// does form have callback declared
			if(typeof(this._form.blurred) == "function") {
				this._form.blurred(this);
			}
		}
	}

	// allow search click without re-activating cursor
	field.span_search.clicked = function(event) {
		u.e.kill(event);
	}
	u.e.click(field.span_search);

	// add focus and blur event handlers to taxonomy input
	u.e.addEvent(field.span_search, "focus", field.span_search._focus);



	// inject option selector button
	field.bn_dropdown = u.ae(virtual_input_wrapper, "div", {"class": "button"});

	// inject arrow
	field.bn_dropdown.arrow = u.svg({
		"name":"arrow",
		"node":field.bn_dropdown,
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
	field.bn_dropdown.field = field;


	// open dropdown
	u.ce(field.bn_dropdown);
	field.bn_dropdown.clicked = function() {

		if(this.field.is_expanded) {

			this.field._show_all = false;
			this.field.hideOptions();

		}
		else {

			// Show all options – search will show options 
			this.field._show_all = true;
			this.field.searchOptions();

		}

		// Bring focus back to search input
		this.field.span_search.focus();

	}

	// [ENTER], [SPACE] and [ARROW DOWN] opens dropdown options
	field.bn_dropdown.keyEvent = function(event) {
		// u.bug("dropdown_select - keyddown:" + event.keyCode)

		if (event.keyCode == 13 || event.keyCode == 32 || event.keyCode == 40) {
			u.e.kill(event);

			this.clicked();
		}

	}
	u.e.addEvent(field.bn_dropdown, "keydown", field.bn_dropdown.keyEvent);



	// create tag list
	field.dropdown_options = u.ae(virtual_input_wrapper, "div", {"class": "options"});
	field.dropdown_options_list = u.ae(field.dropdown_options, "ul", {"class": "options"});

	// map relevant references
	field.dropdown_options.field = field;



	// handle search cursor activation
	field.activateSearchCursor = function() {
		// u.bug("activateSearchCursor", this, this.input.val());

		// bring focus to search 
		this.span_search.focus();

		var range = document.createRange();

		// Select whole text
		range.selectNodeContents(this.span_search);

		// place cursor at the end, if option is not default
		if(this.input.val()) {
			range.collapse(false);
		}

		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);

	}



	// Show options
	field.showOptions = function() {
		// u.bug("showOptions:" + field);

		// Show options
		// Also do this is dropdown is already open to adjust height continuously
		u.ass(this.dropdown_options, {
			transition: "all 0.3s ease-in-out",
			height: this.dropdown_options_list.offsetHeight + "px"
		});

		this.is_expanded = true;

	}

	// Hide options
	field.hideOptions = function() {

		if(this.is_expanded) {
			this.dropdown_options.transitioned = function() {
				if(fun(this.field.optionsHidden)) {
					this.field.optionsHidden();
				}
			}

			u.ass(this.dropdown_options, {
				transition: "all 0.2s ease-in-out",
				height: "0px"
			});

			this.is_expanded = false;
		}
		else if(fun(this.optionsHidden)) {
			this.optionsHidden();
		}

		// Remove any highlighting when closing options to avoid key input selects hidden option
		if(this.highlighted_option) {
			u.rc(this.highlighted_option, "hover");
			this.highlighted_option = false;
		}

	}

	// find next available option
	field.highlightNextOption = function() {
		// u.bug("next option:" + this.highlighted_option);

		if(this.available_options) {

			var node;

			// a node is already selected - start with that
			if(this.highlighted_option) {
				node = u.ns(this.highlighted_option);
			}
			else {
				node = this.dropdown_options.nodes[0];
			}


			// loop through available options to find one that is active
			while(node && node.is_hidden) {

				// get next node
				node = u.ns(node);

				// start over if end is reached
				// Disabled for more clear user interaction
				// if(!node) {
				// 	node = this.dropdown_options.nodes[0];
				// }

			}

			if(node) {

				// update highlight info
				if(this.highlighted_option) {
					u.rc(this.highlighted_option, "hover");
				}

				u.ac(node, "hover");
				this.highlighted_option = node;

				// make sure highlighted_option is vithin view
				this.showHighlighedOption();

			}

		}

	}

	// find previous available option
	field.highlightPreviousOption = function() {
		// u.bug("prev option:" + this.highlighted_option);

		var node;

		// a node is already selected - start with that
		if(this.highlighted_option) {
			node = u.ps(this.highlighted_option);
		}

		// loop through available options
		while(node && node.is_hidden) {

			// get previous node
			node = u.ps(node);

			// start over if end is reached
			// Disabled – prev on first element now deselects highlighting
			// if(!node) {
			// 	node = field.dropdown_options.nodes[field.dropdown_options.nodes.length - 1];
			// }

		}

		if(node) {

			// update highlight info
			if(this.highlighted_option) {
				u.rc(this.highlighted_option, "hover");
			}

			u.ac(node, "hover");
			this.highlighted_option = node;

			// make sure highlighted_option is vithin view
			this.showHighlighedOption()

		}

		// Clear any existing highlight state
		else {

			// Deselect highlight option
			if(this.highlighted_option) {
				u.rc(this.highlighted_option, "hover");
				this.highlighted_option = false;
			}

		}

	}

	// make sure highlighted_option is vithin view
	field.showHighlighedOption = function() {

		// do not attempt repositioning if no tag is selected
		if(this.highlighted_option) {

			// if option is too far down
			if(this.highlighted_option.offsetTop + this.highlighted_option.offsetHeight > this.dropdown_options.offsetHeight + this.dropdown_options.scrollTop) {
				this.dropdown_options.scrollTop = (this.highlighted_option.offsetTop + this.highlighted_option.offsetHeight) - this.dropdown_options.offsetHeight;
			}
			// if option is too far up
			else if(this.highlighted_option.offsetTop < this.dropdown_options.scrollTop) {
				this.dropdown_options.scrollTop = this.highlighted_option.offsetTop;
			}

		}

	}



	// Search options
	field.searchOptions = function() {
		// u.bug("searchOptions: show_all:" + this._show_all + ", selection:" + this.selected_option);


		var i, node;

		// update flag indicating available options
		this.available_options = false;


		// if show_all state is enabled - show all options
		if(this._show_all) {

			for(i = 0; i < this.dropdown_options.nodes.length; i++) {
				node = this.dropdown_options.nodes[i];

				// Do not show already selected option
				if(this.selected_option == node) {

					u.ass(node, {
						"display": "none",
					});

					if(node == this.highlighted_option) {
						this.highlighted_option = false;
						u.rc(node, "hover");
					}

					node.is_hidden = true;

				}
				// Show all other nodes
				else {

					u.ass(node, {
						"display": "block",
					});

					node.innerHTML = node.option_text.replace(value_reg_exp, "<span>$1</span>");
					node.is_hidden = false;

					this.available_options = true;

				}

			}

		}
		// regular search
		else {

			// get text from input field
			var value = this.virtual_input.val();
			var value_reg_exp = new RegExp("(" + value + ")", "gi");

			// loop through options to identify which are matching search term
			for(i = 0; i < this.dropdown_options.nodes.length; i++) {
				node = this.dropdown_options.nodes[i];

				// node matches search, excluding any selected option
				if(value && node.option_text.match(value_reg_exp) && this.selected_option != node) {

					u.ass(node, {
						"display": "block",
					});

					node.innerHTML = node.option_text.replace(value_reg_exp, "<span>$1</span>");

					node.is_hidden = false;

					this.available_options = true;

				}
				// node does not match search
				else {

					u.ass(node, {
						"display": "none",
					});

					if(node == this.highlighted_option) {
						this.highlighted_option = false;
						u.rc(node, "hover");
					}
					node.is_hidden = true;

				}

			}

		}

		// Show options if any
		if(this.available_options) {
			this.showOptions();
		}
		else {
			this.hideOptions();
		}

	}

	// select option
	field.selectOption = function(li) {
		// u.bug("selectOption:" + li.option_text)

		// Leave show all state
		this._show_all = false;

		// update search text
		this.span_search.innerHTML = li.option_text;

		// Remove any highlight info
		if(this.highlighted_option) {
			u.rc(this.highlighted_option, "hover");
			this.highlighted_option = false;
		}


		// remember li reference
		this.selected_option = li;


		// update real dropdown value
		this.updateDropdownValue();


		this.hideOptions();


		// re-activate cursor
		this.activateSearchCursor();

	}


	// update the real dropdown input
	field.updateDropdownValue = function() {
		// u.bug("updateDropdownValue updated:", this.selected_option, this.virtual_input.val());

		var value = this.virtual_input.val();


		// Regular update of select – option exists
		if(this.selected_option) {
			this.input.val(this.selected_option.option_value);
		}

		// Option does not exist – make sure it is created
		else {
			this.input.val("new::"+value);
		}

		// throw updated / changed event
		this.input.dispatchEvent(new Event("change"));

	}


	// handle repeated clicks on virtual dropdown input
	// to avoid cursor ending up some weird place
	// u.e.dblclick(field._virtual_input);
	//
	// // double click should be allowed to select text
	// field._virtual_input.dblclicked = function(event) {}



	// add option to dropdown
	field.addOption = function (node) {
		if(node.text) {

			// add list element
			var li = u.ae(this.dropdown_options_list, "li", {"class": (!node.value ? "default" : ""), "html": node.text});
			li.field = this;
			li.option_value = node.value;
			li.option_text = node.text;

			// add click handler to list element
			u.ce(li);
			li.inputStarted = function (event) {

				// kill event to avoid blur
				u.e.kill(event);

				// select this option
				this.field.selectOption(this);

			}

			u.e.hover(li);
			// handlers for mouseover and mouseout
			li.over = function (event) {

				if(this.field.highlighted_option) {
					u.rc(this.field.highlighted_option, "hover");
				}

				// u.f.resetSelection(this.field);
				u.ac(this, "hover");
				this.field.highlighted_option = this;

			}

		}

	}

	// load options
	field.loadOptions = function() {

		var existing_value = this.input.val();

		// add select options

		// loop through response nodes and add elements to tag list
		var i, node;
		for(i = 0; i < this.input.options.length; i++) {
			node = this.input.options[i];

			// add option to virtual dropdown
			this.addOption(node);
		}

		// get list of all tag nodes
		this.dropdown_options.nodes = u.qsa("li", this.dropdown_options);

		// Set selected option (cascades to the whole UI)
		this.input.val(existing_value);

	}

	// activate input
	u.f.activateInput(field.input);

	// validate field now
	u.f.validate(field.input);


	// load options (needs to be done initially to recreate existing values)
	field.loadOptions();
}


// validator
Util.Form.customValidate["dropdown"] = function(iN) {
	// u.bug("validate dropdown:" + iN.val());

	if (iN.val() !== "") {
		u.f.inputIsCorrect(iN);
	} else {
		u.f.inputHasError(iN);
	}

}


// custom JS build method
Util.Form.customBuild["dropdown"] = function(node, _options) {
	// u.bug("build DropDown", _options);

	// default values
	var field_name = "js_name";
	var field_label = "Label";
	var field_type = "string";
	var field_value = "";
	var field_options = [];

	var field_class = "";
	var field_id = "";

	var field_disabled = false;

	var field_required = false;

	var field_error_message = "There is an error in your input";
	var field_hint_message = "";


	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "name"					: field_name			= _options[_argument]; break;
				case "label"				: field_label			= _options[_argument]; break;
				case "type"					: field_type			= _options[_argument]; break;
				case "value"				: field_value			= _options[_argument]; break;
				case "options"				: field_options			= _options[_argument]; break;

				case "class"				: field_class			= _options[_argument]; break;
				case "id"					: field_id				= _options[_argument]; break;

				case "disabled"				: field_disabled		= _options[_argument]; break;

				case "required"				: field_required		= _options[_argument]; break;

				case "error_message"		: field_error_message	= _options[_argument]; break;
				case "hint_message"			: field_hint_message	= _options[_argument]; break;

			}
		}
	}

	// make appropriate id for input (if none is specified)
	field_id = field_id ? field_id : "input_"+field_type+"_"+field_name;


	// compile full classname value (check for existing values)
	field_class += field_disabled ? (!field_class.match(/(^| )disabled( |$)/) ? " disabled" : "") : "";
	field_class += field_required ? (!field_class.match(/(^| )required( |$)/) ? " required" : "") : "";


	var field = u.ae(node, "div", {"class":"field "+field_type+" "+field_class});

	attributes = {
		"id":field_id, 
		"name":field_name, 
		"disabled":field_disabled
	};

	u.ae(field, "label", {"for":field_id, "html":field_label});

	var select = u.ae(field, "select", u.f.verifyAttributes(attributes));
	// add options
	if(field_options) {

		// options array available
		if(field_options.length) {
			var i, option, selected_option;

			for(i = 0; option = field_options[i]; i++) {

				if(option.value == field_value) {
					selected_option = u.ae(select, "option", { "value": option.value, "html": option.text, "selected": "selected" });
				}
				else {
					u.ae(select, "option", { "value": option.value, "html": option.text });
				}
			}

			// no matching option and field_value is empty string
			if(!selected_option && !field_value) {
				select.selectedIndex = -1;
			}

		}

	}


	// add hint and error message
	if(field_hint_message || field_error_message) {
		var help = u.ae(field, "div", {"class":"help"});
		if(field_hint_message) {
			u.ae(help, "div", { "class": "hint", "html": field_hint_message });
		}
		if(field_error_message) {
			u.ae(help, "div", { "class": "error", "html": field_error_message });
		}
	}


	return field;

}

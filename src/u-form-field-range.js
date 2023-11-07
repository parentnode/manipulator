// initializer
Util.Form.customInit["range"] = function(field) {
	// u.bug("init input range", field);

	// Register field type
	field.type = "range";


	// Get primary input
	field.input = u.qs("input", field);
	// form is a reserved property, so we use _form
	field.input._form = field._form;
	// Get associated label
	field.input.label = u.qs("label[for='"+field.input.id+"']", field);
	// Let it know it's field
	field.input.field = field;


	// get/set value function
	field.input.val = u.f._value;


	field._virtual_input_wrapper = u.ae(field, "div", {"class":"input_wrapper"});
	field.insertBefore(field._virtual_input_wrapper, field.input);
	field._virtual_input = u.ae(field._virtual_input_wrapper, "div", {"class":"input", "contentEditable":"true"});
	
	field.min = field.input.getAttribute("min");
	field.max = field.input.getAttribute("max");
	field.postfix = field.input.getAttribute("postfix");
	field.locale = field.input.getAttribute("locale") || document.documentElement.lang;

	field._virtual_input._form = field._form;
	field._virtual_input.field = field;

	field._input_range_updated = function() {
		// u.bug("_input_range_updated", this.value);

		var range_value = this.val();
		var formatted_range = Number(range_value).toLocaleString(this.field.locale) + (this.field.postfix ? " "+this.field.postfix : "");
		this.field._virtual_input.innerHTML = formatted_range;

	}
	field._virtual_input_keydown = function(event) {
		// [ENTER] - ignore input
		if (event.keyCode == 13) {
			u.e.kill(event);
		}
	}
	field._virtual_input_updated = function(event) {
		// u.bug("_virtual_input_updated updated");

		var range_value = this.innerHTML.replace(/[\., a-zA-Z\(\)\;\$\<\>]+/g, "");
		if(!range_value) {
			range_value = this.field.min;
		}
		this.field.input.val(range_value);

		// Make sure updated callback is executed
		u.f._updated.bind(this.field.input)(event);

	}
	field._virtual_input_blurred = function() {
		// u.bug("virtual blurred");

		u.rc(this.field, "focus");
		u.rc(this, "focus");

		var range_value = Number(this.innerHTML.replace(/[\., a-zA-Z\(\)\;\$\<\>]+/g, ""));
		var min = this.field.input.getAttribute("min");
		var max = this.field.input.getAttribute("max");

		
		if(range_value < this.field.min) {
			range_value = this.field.min;
		}
		else if(range_value > this.field.max) {
			range_value = this.field.max;
		}

		var formatted_price = Number(range_value).toLocaleString(this.field.locale) + (this.field.postfix ? " "+this.field.postfix : "");
		this.innerHTML = formatted_price;

	}
	field._virtual_input_focused = function() {
		// u.bug("virtual focused");

		u.ac(this.field, "focus");
		u.ac(this, "focus");

		var range_value = this.innerHTML.replace(/[\., a-zA-Z\(\)\;\$\<\>]+/g, "");
		this.innerHTML = range_value;

		var selection = window.getSelection();
		var range = document.createRange();
		range.selectNodeContents(this);
		selection.removeAllRanges();
		selection.addRange(range);

	}

	// Filter out invalid input
	u.e.addEvent(field._virtual_input, "keydown", field._virtual_input_keydown);

	u.e.addEvent(field._virtual_input, "input", field._virtual_input_updated);
	u.e.addEvent(field._virtual_input, "blur", field._virtual_input_blurred);
	u.e.addEvent(field._virtual_input, "focus", field._virtual_input_focused);

	// change/update events
	u.e.addEvent(field.input, "input", field._input_range_updated);
	u.e.addEvent(field.input, "change", field._input_range_changed);

	u.e.addEvent(field.input, "input", u.f._updated);
	u.e.addEvent(field.input, "change", u.f._changed);

	// Add additional standard event listeners and labelstyle
	u.f.activateInput(field.input);

	// Update field (input and virtual input)
	field._input_range_updated.bind(field.input)();

}

// validator
Util.Form.customValidate["range"] = function(iN) {
	// u.bug("validate", iN.val());

	if(
		!isNaN(iN.val())
	) {
		u.f.inputIsCorrect(iN);
	}
	else {
		u.f.inputHasError(iN);
	}

}

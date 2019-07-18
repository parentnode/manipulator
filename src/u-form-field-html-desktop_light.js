// Location custom field
// initializer and validator
// Location is a multi input field


// initializer
Util.Form.customInit["html"] = function(field) {

	// Get primary input
	field._input = u.qs("textarea", field);
	// form is a reserved property, so we use _form
	field.input._form = field._form;
	// Get associated label
	field._input.label = u.qs("label[for='"+field._input.id+"']", field);
	// Let it know it's field
	field.input.field = field;

	// get/set value function
	field._input.val = u.f._value;

	// change/update events
	u.e.addEvent(field._input, "keyup", u.f._updated);
	u.e.addEvent(field._input, "change", u.f._changed);

	// submit on enter
	u.f.inputOnEnter(field._input);

	// Add additional standard event listeners and labelstyle
	u.f.activateInput(field._input);

}

// validator
Util.Form.customValidate["html"] = function(iN) {

	// min and max length
	min = Number(u.cv(iN.field, "min"));
	max = Number(u.cv(iN.field, "max"));
	min = min ? min : 1;
	max = max ? max : 10000000;
	pattern = iN.getAttribute("pattern");

	if(
		iN.val() &&
		iN.val().length >= min && 
		iN.val().length <= max && 
		(!pattern || iN.val().match("^"+pattern+"$"))
	) {
		u.f.inputIsCorrect(iN);
	}
	else {
		u.f.inputHasError(iN);
	}

}

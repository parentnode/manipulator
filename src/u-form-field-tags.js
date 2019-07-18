// initializer
Util.Form.customInit["tags"] = function(field) {

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

	// change/update events
	u.e.addEvent(field.input, "keyup", u.f._updated);
	u.e.addEvent(field.input, "change", u.f._changed);

	// submit on enter
	u.f.inputOnEnter(field.input);

	// Add additional standard event listeners and labelstyle
	u.f.activateInput(field.input);

}

// validator
Util.Form.customValidate["tags"] = function(iN) {

	var pattern = iN.getAttribute("pattern");

	if(
		!pattern && iN.val().match(/\:/) ||
		(pattern && iN.val().match("^"+pattern+"$"))
	) {
		u.f.inputIsCorrect(iN);
	}
	else {
		u.f.inputHasError(iN);
	}

}
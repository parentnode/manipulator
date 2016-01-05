// Location custom field
// initializer and validator
// Location is a multi input field


// initializer
Util.Form.customInit["html"] = function(_form, field) {

	field._input = u.qs("textarea", field);
	field._input._form = _form;
	field._input.field = field;

	// add input to fields array
	_form.fields[field._input.name] = field._input;

	// get input label
	field._input._label = u.qs("label[for='"+field._input.id+"']", field);

	// get/set value function
	field._input.val = u.f._value;

	// change/update events
	u.e.addEvent(field._input, "keyup", u.f._updated);
	u.e.addEvent(field._input, "change", u.f._changed);

	// submit on enter (checks for autocomplete etc)
	u.f.inputOnEnter(field._input);

	// activate input
	u.f.activateInput(field._input);

	// validate field now
	u.f.validate(field._input);

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
		u.f.fieldCorrect(iN);
	}
	else {
		u.f.fieldError(iN);
	}

}

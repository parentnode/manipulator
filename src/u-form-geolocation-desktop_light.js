// Location custom field
// initializer and validator
// Location is a multi input field


// initializer
Util.Form.customInit["location"] = function(_form, field) {

	// location, latitude and longitude

	// get all inputs
	field._inputs = u.qsa("input", field);

	// use first input as field input 
	field._input = field._inputs[0];

	for(j = 0; input = field._inputs[j]; j++) {
		input.field = field;
		input._form = _form;

		// add input to fields array
		_form.fields[input.name] = input;

		// get input label
		input._label = u.qs("label[for='"+input.id+"']", field);


		// get/set value function
		input.val = u.f._value;

		// change/update events
		u.e.addEvent(input, "keyup", u.f._updated);
		u.e.addEvent(input, "change", u.f._changed);

		// submit on enter (checks for autocomplete etc)
		u.f.inputOnEnter(input);

		// activate input
		u.f.activateInput(input);
	}

	// validate field now
	u.f.validate(field._input);
}

// validator
Util.Form.customValidate["location"] = function(iN) {

	// location is typically a three input structure
	// try to validate all three
	var loc_fields = 0;

	// location input
	if(iN.field._input) {

		loc_fields++;

		min = 1;
		max = 255;

		if(
			iN.field._input.val().length >= min &&
			iN.field._input.val().length <= max
		) {
			u.f.fieldCorrect(iN.field._input);
		}
		else {
			u.f.fieldError(iN.field._input);
		}
	}

	// latitude input
	if(iN.field.lat_input) {

		loc_fields++;

		min = -90;
		max = 90;

		if(
			!isNaN(iN.field.lat_input.val()) && 
			iN.field.lat_input.val() >= min && 
			iN.field.lat_input.val() <= max
		) {
			u.f.fieldCorrect(iN.field.lat_input);
		}
		else {
			u.f.fieldError(iN.field.lat_input);
		}
	}

	// longitude input
	if(iN.field.lon_input) {

		loc_fields++;

		min = -180;
		max = 180;

		if(
			!isNaN(iN.field.lon_input.val()) && 
			iN.field.lon_input.val() >= min && 
			iN.field.lon_input.val() <= max
		) {
			u.f.fieldCorrect(iN.field.lon_input);
		}
		else {
			u.f.fieldError(iN.field.lon_input);
		}
	}

	// any errors after validation
	if(u.qsa("input.error", iN.field).length) {

		u.rc(iN.field, "correct");
		u.ac(iN.field, "error");
	}
	// are all fields correct, then apply field correct state
	else if(u.qsa("input.correct", iN.field).length == loc_fields) {

		u.ac(iN.field, "correct");
		u.rc(iN.field, "error");
	}

}



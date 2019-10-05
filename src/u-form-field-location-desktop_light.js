// Location custom field
// initializer and validator
// Location is a multi input field


// initializer
Util.Form.customInit["location"] = function(field) {

	// location, latitude and longitude
	var i, input;

	// get all inputs
	field.inputs = u.qsa("input", field);

	// use first input as field input 
	field.input = field.inputs[0];

	for(i = 0; i < field.inputs.length; i++) {
		input = field.inputs[i];

		// form is a reserved property, so we use _form
		input._form = field._form;
		// Get associated label
		input.label = u.qs("label[for='"+input.id+"']", field);
		// Let it know it's field
		input.field = field;

		// get/set value function
		input.val = u.f._value;

		// change/update events
		u.e.addEvent(input, "keyup", u.f._updated);
		u.e.addEvent(input, "change", u.f._changed);

		// submit on enter
		u.f.inputOnEnter(input);

		// Add additional standard event listeners
		u.f.activateInput(input);
	}

}

// validator
Util.Form.customValidate["location"] = function(iN) {

	// location is typically a three input structure
	// try to validate all three
	var loc_fields = 0;

	// location input
	if(iN.field.input) {

		loc_fields++;

		min = 1;
		max = 255;

		if(
			iN.field.input.val().length >= min &&
			iN.field.input.val().length <= max
		) {
			u.f.inputIsCorrect(iN.field.input);
		}
		else {
			u.f.inputHasError(iN.field.input);
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
			u.f.inputIsCorrect(iN.field.lat_input);
		}
		else {
			u.f.inputHasError(iN.field.lat_input);
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
			u.f.inputIsCorrect(iN.field.lon_input);
		}
		else {
			u.f.inputHasError(iN.field.lon_input);
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



// EXTENSIONS EXAMPLES

// example Fix field HTML - is run on form init
// Util.Form.fixFieldHTML = function(field) {
//
// 	if(field.indicator && field.label) {
// 		// move indicator to label
// 		u.ae(field.label, field.indicator);
// 	}
// }

// example initializer – matches field with "example" class
Util.Form.customInit["example"] = function(field) {

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

	// Add additional standard event listeners and labelstyle
	u.f.activateInput(field.input);

}

// example validator - matches field with "example" class
Util.Form.customValidate["example"] = function(iN) {
	if(iN.val()) {
		u.f.inputIsCorrect(iN);
	}
	else {
		u.f.inputHasError(iN);
	}
}

// example hint positioner - matches field with "example" class
Util.Form.customHintPosition["example"] = function(field) {

	// Default positioning
	var input_middle = field.input.offsetTop + (field.input.offsetHeight / 2);
	var help_top = input_middle - field.help.offsetHeight / 2;

	u.ass(field.help, {
		"top": help_top + "px"
	});

}

// example label style - will be applied to all inputs if classname labelstyle:example exists on form
Util.Form.customLabelStyle["example"] = function(iN) {
	u.ae(iN.field, iN.label);
}


// example data parser - hooked into u.f.getData()
Util.Form.customDataFormat["example"] = function(data) {
	return JSON.strigify(data);
}

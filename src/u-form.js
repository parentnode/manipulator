

// Get all form element names and values
Util.getFormElements = function(form, as_parameters) {
	var input, inputs, select, selects, textarea, textareas, i;
	var elements = new Object();
	// Inputs
	inputs = form.getElementsByTagName("input");
	for(i = 0; input = inputs[i]; i++) {
		// only get enabled inputs
		if(input.type != "button" && !input.disabled && !input.name != "list:search" && !input.name != "list:selectall") {
			if(input.type == "text" || input.type == "password" || input.type == "hidden") {
				elements[input.name] = input.value;
			}
			else if((input.type == "checkbox" || input.type == "radio") && input.checked) {
				elements[input.name] = input.value;
			}
		}
	}
	// Selects
	selects = form.getElementsByTagName("select");
	for(i = 0; select = selects[i]; i++) {
		if(!select.disabled && select.options.length) {
			elements[select.name] = select.options[select.selectedIndex].value;
		}
	}
	// Textareas
	textareas = form.getElementsByTagName("textarea");
	for(i = 0; textarea = textareas[i]; i++) {
		if(!textarea.disabled) {
			elements[textarea.name] = textarea.value;
		}
	}
	return as_parameters ? u.formObjectToString(elements) : elements;
}

Util.formObjectToString = function(elements) {
	if(typeof(elements) == "string") {
		return elements;
	}
	else if(typeof(elements) == "object") {
		var string = "";
		for(index in elements) {
			if(typeof(elements[index]) == "string") {
				string += index + '=' + encodeURIComponent(elements[index]) + '&';
			}
		}
		return string;
	}
	return "";
}
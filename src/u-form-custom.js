// Method to correct HTML output from other systems
// can be adapted locally for greater flexibility
Util.Form.fixFieldHTML = function(field) {

	// remove requirement indicators (simple_form)
	var abbr = u.qs("abbr", field);
	if(abbr) {
		abbr.parentNode.removeChild(abbr);
	}

	// optional messages in data-error and data-hint attributes
	var error_message = field.getAttribute("data-error");
	var hint_message = field.getAttribute("data-hint");
	if(error_message || hint_message) {
		if(!field._help) {
			field._help = u.ae(field, "div", {"class":"help"});
		}
	}
	if(hint_message) {
		if(!field._hint) {
			field._hint = u.ae(field._help, "div", {"class":"hint", "html":hint_message})
		}
		else {
			field._hint.innerHTML = hint_message
		}
	}
	if(error_message) {
		if(!field._error) {
			field._error = u.ae(field._help, "div", {"class":"error", "html":error_message})
		}
		else {
			field._error.innerHTML = error_message
		}
	}

}

// custom send types
Util.Form.customSend["jdata"] = function(params) {

	object = u.f.convertNamesToJsonObject(params);
	return "jdata=" + escape(JSON.stringify(object));
}


// TODO: refine this setup function for ease of use
// TODO: move tags and prices to custom fuctions as they are very Janitor specific


// custom initializations
Util.Form.customInit["customfield"] = function(field) {
	u.bug("custom field")
	field._input = u.qs("input", field);
	field._input.field = field;

	field._input.form.fields[field._input.name] = field._input;

	// get input label
	field._input._label = u.qs("label[for="+field._input.id+"]", field);

	u.bug("field._input._label:" + field._input._label)

	// get/set value function
	field._input.val = u.f._value;

	// change/update events
	u.e.addEvent(field._input, "keyup", u.f._updated);
	u.e.addEvent(field._input, "change", u.f._changed);

	// submit on enter (checks for autocomplete etc)
	u.f.inputOnEnter(field._input);

	// activate field
	u.f.activateField(field._input);

	// validate field now
	u.f.validate(field._input);


//	u.f.formIndex(field._input.form, field._input);

}


// custom validations
Util.Form.customValidate["customfield"] = function(input) {

	if((input.value == "customfield" && !u.f.isDefault(input)) || (!u.hc(input.field, "required") && !input.value)) {
		u.f.fieldCorrect(input);
	}
	else {
		u.f.fieldError(input);
	}

}


// COMPATIBILITY FUNCTIONS


// Simple_form converter
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
// SAP JAVA Platform
Util.Form.customSend["jdata"] = function(params) {

	object = u.f.convertNamesToJsonObject(params);
	return "jdata=" + escape(JSON.stringify(object));
}


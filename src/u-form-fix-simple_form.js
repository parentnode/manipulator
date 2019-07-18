

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
		if(!field.help) {
			field.help = u.ae(field, "div", {"class":"help"});
		}
	}
	if(hint_message) {
		if(!field.hint) {
			field.hint = u.ae(field.help, "div", {"class":"hint", "html":hint_message})
		}
		else {
			field.hint.innerHTML = hint_message
		}
	}
	if(error_message) {
		if(!field.error) {
			field.error = u.ae(field.help, "div", {"class":"error", "html":error_message})
		}
		else {
			field.error.innerHTML = error_message
		}
	}

}

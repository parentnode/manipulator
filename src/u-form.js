Util.Form = u.f = new function() {


	this.labelInput = function(iN) {

		// remove abbriviation before using label
		var abbr = u.qs("abbr", iN.field.lN);
		if(abbr) {
			iN.field.lN.removeChild(abbr);
		}
		iN.field.default_value = iN.field.lN.textContent;

		if(!iN.value) {
			iN.value = iN.field.default_value;
			u.ac(iN, "default");
		}

		iN.labelFocus = function(event) {
			if(this.value == this.field.default_value) {
				this.value = "";
			}
			u.rc(this.field, "default");
		}
		iN.labelBlur = function(event) {
			if(this.value == "") {
				this.value = this.field.default_value;
				u.ac(this.field, "default");
			}
		}

		u.e.addEvent(iN, "focus", iN.labelFocus);
		u.e.addEvent(iN, "blur", iN.labelBlur);
	}
	
	this.activate = function(iN) {

		iN.activeFocus = function(event) {
			this.field.focused = true;
			u.ac(this.field, "focus");
			u.ac(this, "focus");
		}

		iN.activeBlur = function(event) {
			this.field.focused = false;
			u.rc(this.field, "focus");
			u.rc(this, "focus");
		}

		u.e.addEvent(iN, "focus", iN.activeFocus);
		u.e.addEvent(iN, "blur", iN.activeBlur);

	}


	this.validateForm = function(form) {

	}
	
	this.validateInput = function(iN) {

		// string validation
		if(iN.field.className.match(/string/)) {
			if(iN.value.length > 1) {
				u.ac(iN, "correct");
				u.ac(iN.field, "correct");
			}
			else {
				u.rc(iN, "correct");
				u.rc(iN.field, "correct");
			}
		}

		// number validation
		if(iN.field.className.match(/numeric/)) {
			if(iN.value && !isNaN(iN.value)) {
				u.ac(iN, "correct");
				u.ac(iN.field, "correct");
			}
			else {
				u.rc(iN, "correct");
				u.rc(iN.field, "correct");
			}
		}

		// text validation
		if(iN.field.className.match(/text/)) {
			if(iN.value.length > 2) {
				u.ac(iN, "correct");
				u.ac(iN.field, "correct");
			}
			else {
				u.rc(iN, "correct");
				u.rc(iN.field, "correct");
			}
		}

		// select/country/date validation
		if(iN.field.className.match(/select|country|date/)) {
			if(iN.options[iN.selectedIndex].value != "") {
				u.ac(iN, "correct");
				u.ac(iN.field, "correct");
			}
			else {
				u.rc(iN, "correct");
				u.rc(iN.field, "correct");
			}
		}

		// file validation
		if(iN.field.className.match(/file/)) {
			if(iN.value.length > 1) {
				u.ac(iN, "correct");
				u.ac(iN.field, "correct");
			}
			else {
				u.rc(iN, "correct");
				u.rc(iN.field, "correct");
			}
		}


	}

}

Util.Objects["form"] = new function() {
	this.init = function(e) {
		var i, o;

		// get all fields
		var fields = u.qsa(".field", e);
		for(i = 0; field = fields[i]; i++) {

			// setup dynamic fields

			// get input label
			field.lN = u.qs("label", field);


			// text inputs
			if(field.className.match(/string/)) {
				field.iN = u.qs("input", field);
				field.iN.field = field;

//				this.labelInput(field.iN);
				this.activate(field.iN);

				if(field.className.match(/required/)) {
					field.iN.validate = function() {
						u.o.form.validate(this);
					}
					u.e.addEvent(field.iN, "keyup", field.iN.validate);
					// validate now
					field.iN.validate();
				}
			}

			// numeric inputs
			if(field.className.match(/numeric/)) {
				field.iN = u.qs("input", field);
				field.iN.field = field;

//				this.labelInput(field.iN);
				this.activate(field.iN);

				if(field.className.match(/required/)) {
					field.iN.validate = function() {
						u.o.form.validate(this);
					}
					u.e.addEvent(field.iN, "keyup", field.iN.validate);
					// validate now
					field.iN.validate();
				}
			}

			// textareas
			if(field.className.match(/text/)) {
				field.iN = u.qs("textarea", field);
				field.iN.field = field;

				this.activate(field.iN);

				if(field.className.match(/required/)) {
					field.iN.validate = function() {
						u.o.form.validate(this);
					}
					u.e.addEvent(field.iN, "keyup", field.iN.validate);
					// validate now
					field.iN.validate();
				}

				// resize textarea while typing

				// get textarea height value offset - webkit scrollHeight differs from height
				// check by setting height to scrollHeight and then comparing new height to scrollHeight
				u.as(field.iN, "height", field.iN.scrollHeight+"px");
				field.iN.offset = 0;
				if(parseInt(u.gcs(field.iN, "height")) != field.iN.scrollHeight) {
					field.iN.offset = field.iN.scrollHeight - parseInt(u.gcs(field.iN, "height"));
				}
				// set correct height
				u.as(field.iN, "height", (field.iN.scrollHeight - field.iN.offset) +"px");
				field.iN.setHeight = function() {
					var height = parseInt(u.gcs(this, "height")) + this.offset;
					if(this.value && this.scrollHeight > height) {
						u.as(this, "height", (this.scrollHeight - this.offset) +"px");
					}
				}
				u.e.addEvent(field.iN, "keyup", field.iN.setHeight);
			}

			if(field.className.match(/select|country/)) {
				field.iN = u.qs("select", field);
				field.iN.field = field;

				this.activate(field.iN);

				if(field.className.match(/required/)) {
					field.iN.validate = function() {
						u.o.form.validate(this);
					}
					u.e.addEvent(field.iN, "change", field.iN.validate);
					// validate now
					field.iN.validate();
				}
			}

			// file inputs
			if(field.className.match(/file/)) {
				field.iN = u.qs("input", field);
				field.iN.field = field;

//				this.labelInput(field.iN);
				this.activate(field.iN);

				field.file_input = u.ae(field, "div", "input_file");
				var file_button = u.ae(field, "div", "button");
				var file_a = u.ae(file_button, "a").innerHTML = "Browse";
				field.iN.size = "39"

				if(field.className.match(/required/)) {
					field.iN.validate = function() {
						u.o.form.validate(this);
					}
					u.e.addEvent(field.iN, "change", field.iN.validate);
					// validate now
					field.iN.validate();
				}

				// replicate file value to file_input on change
				field.iN.changed = function() {
					this.field.file_input.innerHTML = this.value;
				}
				u.e.addEvent(field.iN, "change", field.iN.changed);
			}

			// Date field initialization
			if(field.className.match(/date/)) {
				field.iNs = u.qsa("select", field);

				var date = field.iNs[0];
				date.field = field;
				var month = field.iNs[1];
				month.field = field;
				var year = field.iNs[2];
				year.field = field;

				this.activate(date);
				this.activate(month);
				this.activate(year);

				if(field.className.match(/required/)) {
					field.validate = function() {
						u.o.form.validate(this);
					}
					u.e.addEvent(date, "change", field.validate);
					u.e.addEvent(month, "change", field.validate);
					u.e.addEvent(year, "change", field.validate);
					// validate now
					u.o.form.validate(date)
					u.o.form.validate(month)
					u.o.form.validate(year)
				}
			}


		
		}
	}
	

}


/*
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
*/
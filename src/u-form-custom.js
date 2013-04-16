// custom send types
Util.Form.customSend["jdata"] = function(params) {

	object = u.f.convertNamesToJsonObject(params);
	return "jdata=" + escape(JSON.stringify(object));
}


// custom initializations
Util.Form.customInit["customfield"] = function(field) {

	field._input = u.qs("input", field);
	field._input.field = field;

	u.f.formIndex(field._input.form, field._input);
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


// Add new send types if required

Util.Form.customSend = new Object();

Util.Form.customSend["jdata"] = function(params) {

	object = u.f.convertNamesToJsonObject(params);

	return "jdata=" + escape(JSON.stringify(object));

}


// custom validations
Util.Form.customValidate = new Object();
Util.Form.customValidate["password"] = function(iN) {
	if((iN.value.length >= 8 && iN.value.length <= 20 && !u.f.isDefault(iN)) || !u.hc(iN.field, "required")) {
		u.f.fieldCorrect(iN);
	}
	else {
		u.f.fieldError(iN);
	}
}

Util.Form.customInit = new Object();
Util.Form.customInit["password"] = function(field) {

	field.iN = u.qs("input", field);
	field.iN.field = field;
	field.iN.val = function(value) {if(value) {this.value = value;} else {return this.value;}}

	// reference node
	field.iN.form.fields[field.iN.name] = field.iN;

	// know position in field-order
	field.iN.field_order = field.iN.form.field_order.length;
	field.iN.form.field_order[field.iN.form.field_order.length] = field.iN;

	u.f.activate(field.iN);
	// validate now
	u.f.validate(field.iN);


	u.e.addEvent(field.iN, "keyup", u.f._update);
	u.e.addEvent(field.iN, "change", u.f._changed);
	u.f.submitOnEnter(field.iN);

}

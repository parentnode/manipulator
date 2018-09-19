// JS FORM BUILDING 
u.f.customBuild = {};


// Add new form element 
u.f.addForm = function(node, _options) {
//	u.bug("addform")
	
	// default values
	var form_name = "js_form";
	var form_action = "#";
	var form_method = "post";
	var form_class = "";

	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "name"			: form_name				= _options[_argument]; break;
				case "action"		: form_action			= _options[_argument]; break;
				case "method"		: form_method			= _options[_argument]; break;
				case "class"		: form_class			= _options[_argument]; break;
			}

		}
	}

	var form = u.ae(node, "form", {"class":form_class, "name": form_name, "action":form_action, "method":form_method});
	return form;
}

// Add fieldset
u.f.addFieldset = function(node, _options) {
	var fieldset_class = "";

	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "class"			: fieldset_class			= _options[_argument]; break;
			}
		}
	}

	return u.ae(node, "fieldset", {"class":fieldset_class});
}

// Add field
u.f.addField = function(node, _options) {
	
	// default values
	var field_name = "js_name";
	var field_label = "Label";
	var field_type = "string";
	var field_value = "";
	var field_options = [];
	var field_checked = false;

	var field_class = "";
	var field_id = "";

	var field_max = false;
	var field_min = false;

	var field_disabled = false;
	var field_readonly = false;

	var field_required = false;
	var field_pattern = false;

	var field_error_message = "There is an error in your input";
	var field_hint_message = "";


	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "name"					: field_name			= _options[_argument]; break;
				case "label"				: field_label			= _options[_argument]; break;
				case "type"					: field_type			= _options[_argument]; break;
				case "value"				: field_value			= _options[_argument]; break;
				case "options"				: field_options			= _options[_argument]; break;
				case "checked"				: field_checked			= _options[_argument]; break;

				case "class"				: field_class			= _options[_argument]; break;
				case "id"					: field_id				= _options[_argument]; break;

				case "max"					: field_max				= _options[_argument]; break;
				case "min"					: field_min				= _options[_argument]; break;

				case "disabled"				: field_disabled		= _options[_argument]; break;
				case "readonly"				: field_readonly		= _options[_argument]; break;

				case "required"				: field_required		= _options[_argument]; break;
				case "pattern"				: field_pattern			= _options[_argument]; break;

				case "error_message"		: field_error_message	= _options[_argument]; break;
				case "hint_message"			: field_hint_message	= _options[_argument]; break;
			}
		}
	}





	// loop through custom building methods
	var custom_build;
	if(field_type in u.f.customBuild) {
		return u.f.customBuild[field_type](node, _options);
	}


	// make appropriate id for input (if none is specified)
	field_id = field_id ? field_id : "input_"+field_type+"_"+field_name;


	// compensate for certain values being indicated via field_class (is commonly used)
	field_disabled = !field_disabled ? (field_class.match(/(^| )disabled( |$)/) ? "disabled" : false) : "disabled";
	field_readonly = !field_readonly ? (field_class.match(/(^| )readonly( |$)/) ? "readonly" : false) : "readonly";
	field_required = !field_required ? (field_class.match(/(^| )required( |$)/) ? true : false) : true;

//	u.bug("field_disabled:" + field_disabled + ", field_readonly:" + field_readonly + ", field_required:" + field_required)

	// compile full classname value (check for existing values)
	field_class += field_disabled ? (!field_class.match(/(^| )disabled( |$)/) ? " disabled" : "") : "";
	field_class += field_readonly ? (!field_class.match(/(^| )readonly( |$)/) ? " readonly" : "") : "";
	field_class += field_required ? (!field_class.match(/(^| )required( |$)/) ? " required" : "") : "";

	field_class += field_min ? (!field_class.match(/(^| )min:[0-9]+( |$)/) ? " min:"+field_min : "") : "";
	field_class += field_max ? (!field_class.match(/(^| )max:[0-9]+( |$)/) ? " max:"+field_max : "") : "";


	// HIDDEN (STRING)
	// no field wrapper for hidden fields
	if (field_type == "hidden") {
		return u.ae(node, "input", {"type":"hidden", "name":field_name, "value":field_value, "id":field_id});
	}


	// create field
	var field = u.ae(node, "div", {"class":"field "+field_type+" "+field_class});
	var attributes = {};


	// TEXT (STRING)
	if(field_type == "string") {
		field_max = field_max ? field_max : 255;

		attributes = {
			"type":"text", 
			"id":field_id, 
			"value":field_value, 
			"name":field_name, 
			"maxlength":field_max, 
			"minlength":field_min,
			"pattern":field_pattern,
			"readonly":field_readonly,
			"disabled":field_disabled
		};

		u.ae(field, "label", {"for":field_id, "html":field_label});
		u.ae(field, "input", u.f.verifyAttributes(attributes));
	}

	// EMAIL, TEL, PASSWORD
	else if(field_type == "email" || field_type == "tel" || field_type == "password") {
		field_max = field_max ? field_max : 255;

		attributes = {
			"type":field_type, 
			"id":field_id, 
			"value":field_value, 
			"name":field_name, 
			"maxlength":field_max, 
			"minlength":field_min,
			"pattern":field_pattern,
			"readonly":field_readonly,
			"disabled":field_disabled
		};

		u.ae(field, "label", {"for":field_id, "html":field_label});
		u.ae(field, "input", u.f.verifyAttributes(attributes));
	}

	// NUMBER, INTEGER, DATE, DATETIME
	else if(field_type == "number" || field_type == "integer" || field_type == "date" || field_type == "datetime") {

		attributes = {
			"type":field_type, 
			"id":field_id, 
			"value":field_value, 
			"name":field_name, 
			"max":field_max, 
			"min":field_min,
			"pattern":field_pattern,
			"readonly":field_readonly,
			"disabled":field_disabled
		};

		u.ae(field, "label", {"for":field_id, "html":field_label});
		u.ae(field, "input", u.f.verifyAttributes(attributes));
	}

	// CHECKBOX
	else if(field_type == "checkbox") {

		attributes = {
			"type":field_type, 
			"id":field_id, 
			"value":field_value ? field_value : "true", 
			"name":field_name, 
			"disabled":field_disabled,
			"checked":field_checked
		};

		u.ae(field, "input", {"name":field_name, "value":"false", "type":"hidden"});
		u.ae(field, "input", u.f.verifyAttributes(attributes));
		u.ae(field, "label", {"for":field_id, "html":field_label});
	}

	// TEXTAREA (TEXT)
	else if(field_type == "text") {

		attributes = {
			"id":field_id, 
			"html":field_value, 
			"name":field_name, 
			"maxlength":field_max, 
			"minlength":field_min,
			"pattern":field_pattern,
			"readonly":field_readonly,
			"disabled":field_disabled
		};

		u.ae(field, "label", {"for":field_id, "html":field_label});
		u.ae(field, "textarea", u.f.verifyAttributes(attributes));
	}

	// SELECT
	else if(field_type == "select") {

		attributes = {
			"id":field_id, 
			"name":field_name, 
			"disabled":field_disabled
		};

		u.ae(field, "label", {"for":field_id, "html":field_label});

		var select = u.ae(field, "select", u.f.verifyAttributes(attributes));
		// add options
		if(field_options) {
			var i, option;
			for(i = 0; i < field_options.length; i++) {
				option = field_options[i];
				
				if(option.value == field_value) {
					u.ae(select, "option", {"value":option.value, "html":option.text, "selected":"selected"});
				}
				else {
					u.ae(select, "option", {"value":option.value, "html":option.text});
				}
			}
		}
	}

	// RADIOBUTTONS
	else if(field_type == "radiobuttons") {


		u.ae(field, "label", {"html":field_label});

		if(field_options) {
			var i, option;
			for(i = 0; i < field_options.length; i++) {
				option = field_options[i];

				var div = u.ae(field, "div", {"class":"item"});
				
				if(option.value == field_value) {
					u.ae(div, "input", {"value":option.value, "id":field_id+"-"+i, "type":"radio", "name":field_name, "checked":"checked"});
					u.ae(div, "label", {"for":field_id+"-"+i, "html":option.text});
				}
				else {
					u.ae(div, "input", {"value":option.value, "id":field_id+"-"+i, "type":"radio", "name":field_name});
					u.ae(div, "label", {"for":field_id+"-"+i, "html":option.text});
				}
			}
		}

	}

	// FILES
	else if(field_type == "files") {

		u.ae(field, "label", {"for":field_id, "html":field_label});
		u.ae(field, "input", {"id":field_id, "name":field_name, "type":"file"});
	}


	else {
		u.bug("input type not implemented")
	}


	// add hint and error message
	if(field_hint_message || field_error_message) {
		var help = u.ae(field, "div", {"class":"help"});
		if (field_hint_message) {
			u.ae(help, "div", { "class": "hint", "html": field_hint_message });
		}
		if(field_error_message) {
			u.ae(help, "div", { "class": "error", "html": field_error_message });
		}
	}

	return field;
}

// checking attributes for valid values, removing empty ones to not create faulty attributes
u.f.verifyAttributes = function(attributes) {

	for(attribute in attributes) {
		if(attributes[attribute] === undefined || attributes[attribute] === false || attributes[attribute] === null) {
//			u.bug("invalid attribute:" + attribute + "("+attributes[attribute]+")")
			delete attributes[attribute];
		}
	}
//	console.log(attributes);
	return attributes;

}


u.f.addAction = function(node, _options) {

	// default values
	var action_type = "submit";
	var action_name = "js_name";
	var action_value = "";
	var action_class = "";

	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "type"			: action_type			= _options[_argument]; break;
				case "name"			: action_name			= _options[_argument]; break;
				case "value"		: action_value			= _options[_argument]; break;
				case "class"		: action_class			= _options[_argument]; break;
			}
		}
	}

	// find actions ul
	var p_ul = node.nodeName.toLowerCase() == "ul" ? node : u.pn(node, {"include":"ul.actions"});
	// check if ul is actions ul
	// if not, it should be created automatically
	if(!p_ul || !u.hc(p_ul, "actions")) {

		// action is appended directly to form?
		if(node.nodeName.toLowerCase() == "form") {
			// look for existing actions
			p_ul = u.qs("ul.actions", node);
		}

		// create new actions if none is found
		p_ul = p_ul ? p_ul : u.ae(node, "ul", {"class":"actions"});
	}

	// check if action is injected into ul.actions li
	var p_li = node.nodeName.toLowerCase() == "li" ? node : u.pn(node, {"include":"li"});

	// li should be directly in parent ul.actions
	if(!p_li || p_ul != p_li.parentNode) {
		p_li = u.ae(p_ul, "li", {"class":action_name});
	}
	else {
		p_li = node;
	}

	var action = u.ae(p_li, "input", {"type":action_type, "class":action_class, "value":action_value, "name":action_name})

	return action;
}


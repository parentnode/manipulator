// JS FORM BUILDING 


// Add new form element 
u.f.addForm = function(node, _options) {
//	u.bug("addform")
	
	// default values
	var form_name = "js_form";
	var form_action = "#";
	var form_method = "post";
	var form_class = "";

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
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
	if(typeof(_options) == "object") {
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
	var field_type = "string";
	var field_label = "Value";
	var field_name = "js_name";
	var field_value = "";
	var field_class = "";
	var field_maxlength = "";

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "type"			: field_type			= _options[_argument]; break;
				case "label"		: field_label			= _options[_argument]; break;
				case "name"			: field_name			= _options[_argument]; break;
				case "value"		: field_value			= _options[_argument]; break;
				case "class"		: field_class			= _options[_argument]; break;
				case "max"			: field_maxlength		= _options[_argument]; break;
			}
		}
	}

	var input_id = "input_"+field_type+"_"+field_name;
	var field = u.ae(node, "div", {"class":"field "+field_type+" "+field_class});


	// TODO: add all field types
	if(field_type == "string") {
		var label = u.ae(field, "label", {"for":input_id, "html":field_label});
		var input = u.ae(field, "input", {"id":input_id, "value":field_value, "name":field_name, "type":"text", "maxlength":field_maxlength});
	}
	else if(field_type == "email" || field_type == "number" || field_type == "tel") {
		var label = u.ae(field, "label", {"for":input_id, "html":field_label});
		var input = u.ae(field, "input", {"id":input_id, "value":field_value, "name":field_name, "type":field_type});
	}
	else if(field_type == "checkbox") {
		var input = u.ae(field, "input", {"id":input_id, "value":(field_value ? field_value : "true"), "name":field_name, "type":field_type});
		var label = u.ae(field, "label", {"for":input_id, "html":field_label});
	}
	else if(field_type == "text") {
		var label = u.ae(field, "label", {"for":input_id, "html":field_label});
		var input = u.ae(field, "textarea", {"id":input_id, "html":field_value, "name":field_name});
	}

	else if(field_type == "select") {
		u.bug("Select not implemented yet")
	}
	else {
		u.bug("input type not implemented yet")
	}

	return field;
}

u.f.addAction = function(node, _options) {


	// default values
	var action_type = "submit";
	var action_name = "js_name";
	var action_value = "";
	var action_class = "";

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
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
	var p_ul = node.nodeName.toLowerCase() == "ul" ? node : u.pn(node, {"include":"ul"});
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


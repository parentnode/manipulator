u.template = function(template, json, _options) {
	// u.bug("### TEMPLATE ###");
	// u.bug("template typeof:" + typeof(template));
	// u.bug("json typeof:" + typeof(json));
	// console.log(json);


	var string = "";
	var template_string = "";
	var clone, container, item_template, dom, node_list, type_template, type_parent;

	// settings
	// append results to node
	var append_to_node = false;

	// apply parameters
	if (obj(_options)) {
		var _argument;
		for (_argument in _options) {
			switch (_argument) {
				case "append": 	append_to_node = _options[_argument];			break;
			}
		}
	}



	// Identify template type, depending on template content
	// IE 7 doesn't accept constructor to identify node, using nodeName as replacement

	// HTML Object
	if(obj(template) && typeof(template.nodeName) != "undefined") {
//		u.bug("HTML template")

		type_template = "HTML";
	}
	// JSON Object
	else if(obj(template) && JSON.stringify(template)) {
//		u.bug("JSON template")

		type_template = "JSON";
	}
	// JSON String
	else if(str(template) && template.match(/^(\{|\[)/)) {
//		u.bug("JSON string template")

		type_template = "JSON_STRING";
	}
	// HTML String
	else if(str(template) && template.match(/^<.+>$/)) {
//		u.bug("HTML string template")

		type_template = "HTML_STRING";
	}
	// plain string
	else if(str(template)) {
//		u.bug("plain string template")

		type_template = "STRING";
	}



	// Prepare template string (for string replacement/manipulation)

	// HTML node or HTML STRING
	if(type_template == "HTML_STRING" || type_template == "HTML") {
//		u.bug("TEMPLATE:" + template);

		// HTML node
		if(type_template == "HTML") {
			clone = template.cloneNode(true);
			u.rc(clone, "template");

			if(template.nodeName == "LI") {
				type_parent = "ul";
				container = document.createElement(type_parent);
			}
			else if(template.nodeName == "TR") {
				type_parent = "table";
				container = document.createElement("table").appendChild(document.createElement("tbody"));
			}
			else {
				type_parent = "div";
				container = document.createElement("div");
			}

			container.appendChild(clone);
			template_string = container.innerHTML;
			template_string = template_string.replace(/href\=\"([^\"]+)\"/g, function(string) {return decodeURIComponent(string);});
			template_string = template_string.replace(/src\=\"([^\"]+)\"/g, function(string) {return decodeURIComponent(string);});
		}

		// string based (HTML string)
		else {

			if(template.match(/^<li/i)) {
				type_parent = "ul";
			}
			else if(template.match(/^<tr/i)) {
				type_parent = "table";
			}
			else {
				type_parent = "div";
			}

			template_string = template;
		}
	}
	// JSON object string
	else if(type_template == "JSON") {

		template_string = JSON.stringify(template).replace(/^{/g, "MAN_JSON_START").replace(/}$/g, "MAN_JSON_END");
	}
	// string based (JSON string)
	else if(type_template == "JSON_STRING") {

		template_string = template.replace(/^{/g, "MAN_JSON_START").replace(/}$/g, "MAN_JSON_END");
	}
	// string based (PLAIN string)
	else if(type_template == "STRING") {

		template_string = template;
	}



	// is JSON object or array of objects
	if(obj(json) && ((json.length == undefined && Object.keys(json).length) || json.length)) {

//		console.log("OBJECT:", json, json["pattern"]);

		// multiple results
		if(json.length) {
//			u.bug("multiple results");

			// use _item (WITH UNDERSCORE) to help IE, where item will be interpreted as item()
			for(_item in json) {

				if(json.hasOwnProperty(_item)) {

					item_template = template_string;

					// look for functions and conditional statements
					// TODO: not finalized
	// 				if(item_template.match(/\{\{/)) {
	// 
	// 					
	// 					// first get expression to evaluate
	// //					look for ?
	// //					 and :
	// 
	// //					alert(item_template)
	// 					expression = item_template.match(/\{\{(.+?)\}/g);
	// 
	// 					//{{checked} ? checked="checked" : }
	// 					
	// //					expression = template.match(/\{\{(.+?)\}[\s\?]+(.+?)[\s\:]+(.+?)\}/);
	// //					item_template = item_template.replace();
	// 					
	// 
	// 					u.bug("contains if:" + expression)
	// 
	// 					
	// 
	// 					if(expression.length && json[item][expression[1]]) {
	// 						u.bug("true")
	// 					}
	// 				}
					// item_template = template.replace(/\{{(.+?)\}/g, "");
					// 						u.bug("temp:" + string)
					// 						if(string.match("{{")) {
					// 							u.bug("function")
					// 						}

											//}
											//else 
				

					string += item_template.replace(/\{(.+?)\}/g, function(string) {

						// if(string == "{children}") {
						// 	if(json[_item].children && json[_item].children.length) {
						// 		var parent_node = template.parentNode.nodeName.toLowerCase();
						// 		var parent_class = template.parentNode.className;
						// 		return '<'+parent_node+' class="'+parent_class+'">'+u.template(template, json[_item].children)+'</'+parent_node+'>';
						// 	}
						// 	else {
						// 		return "";
						// 	}
						// }
						// else 

						var key = string.toString().replace(/[\{\}]/g, "");

						// clean up strings
						if(str(json[_item][key]) && json[_item][key]) {
							return json[_item][key].toString().replace(/(\\|\"|\')/g, "\\$1").replace(/\n/g, "\\n");
						}
						// return numbers correct
						else if(typeof(json[_item][key]) == "number") {
							// Insert NUM marker, to be replaced with real number
							// (not encapsulated in quotes) before string is returned as JSON
							return "MAN_NUM" + json[_item][key] + "MAN_NUM";
						}
						// return booleans correct
						else if(typeof(json[_item][key]) == "boolean") {
							// Insert BOOL marker, to be replaced with real boolean
							// (not encapsulated in quotes) before string is returned as JSON
							return "MAN_BOOL" + json[_item][key] + "MAN_BOOL";
						}
						// return null correct
						else if(json[_item][key] === null) {
							// Insert NULL marker, to be replaced with null or empty string 
							// (depending on template type)
							return "MAN_NULL";
						}
						// return objects correct
						else if(obj(json[_item][key])) {
							// Insert OBJ marker, to be replaced with real object
							// (not encapsulated in quotes) before string is returned as JSON
							return "MAN_OBJ" + JSON.stringify(json[_item][key]).replace(/(\"|\')/g, "\\$1") + "MAN_OBJ";
						}
						else {
							return "";
						}
					});
				}

			}
		}
		// only one result (or empty array)
		else {
			// u.bug("single result");

			string += template_string.replace(/\{(.+?)\}/g, function(string) {

				var key = string.toString().replace(/[\{\}]/g, "");

				// clean up strings
				if(str(json[key]) && json[key]) {
					return json[key].replace(/(\\|\"|\')/g, "\\$1").replace(/\n/g, "\\n");
				}
				// return numbers correct
				else if(typeof(json[key]) == "number") {
					// Insert NUM marker, to be replaced with real number
					// (not encapsulated in quotes) before string is returned as JSON
					return "MAN_NUM" + json[key] + "MAN_NUM";
				}
				// return booleans correct
				else if(typeof(json[key]) == "boolean") {
					// Insert BOOL marker, to be replaced with real boolean
					// (not encapsulated in quotes) before string is returned as JSON
					return "MAN_BOOL" + json[key] + "MAN_BOOL";
				}
				// return null correct
				else if(json[key] === null) {
					// Insert NULL marker, to be replaced with null or empty string
					// (depending on template type)
					return "MAN_NULL";
				}
				// return objects correct
				else if(obj(json[key])) {
					// Insert OBJ marker, to be replaced with real object
					// (not encapsulated in quotes) before string is returned as JSON
					return "MAN_OBJ" + JSON.stringify(json[key]).replace(/(\"|\')/g, "\\$1") + "MAN_OBJ";
				}
				else {
					return "";
				}
			});
		}
	}
	// else {
	// 	console.log("no results");
	// }

	// Post process string for MARKERS
	// Prepare final return object/string

	// html strings or objects
	if(type_template == "HTML_STRING" || type_template == "HTML") {

		// BOOLEANS + NUMBERS
		string = string.replace(/MAN_(BOOL|NUM)(.+?(?=MAN_(BOOL|NUM)))MAN_(BOOL|NUM)/g, "$2");

		// null value = empty string
		string = string.replace(/MAN_NULL/g, "");

		// OBJECTS
		string = string.replace(/MAN_OBJ(.+?(?=MAN_OBJ))MAN_OBJ/g, function(string) {
			// remove marker
			string = string.replace(/MAN_OBJ(.+?(?=MAN_OBJ))MAN_OBJ/g, "$1");
			// unescape quotes
			return string.replace(/\\(\\|"|')/g, "$1");
		});

		// unescape quotes when outputting to HTML
		string = string.replace(/\\(\\|"|')/g, "$1");

		// IE <=9 doesn't support table.innerHTML, so wrap node in div and innerHTML entire table
		if(type_parent == "table") {
			dom = document.createElement("div");
			dom.innerHTML = "<table><tbody>"+string+"</tbody></table>";
			dom = u.qs("tbody", dom);
		}
		else {
			dom = document.createElement(type_parent);
			dom.innerHTML = string;
		}

		// should children be appended to node automatically
		if(append_to_node) {
			node_list = [];

			// doing innerHTML cancels events on header - instead use dom
			while(dom.childNodes.length) {
				node_list.push(u.ae(append_to_node, dom.childNodes[0]));
			}
			// return array of appended nodes
			return node_list;
		}

		// return childNodes object
		return dom.childNodes;
	}

	// json strings or objects
	else if(type_template == "JSON_STRING" || type_template == "JSON") {

		// BOOLEANS + NUMBERS
		string = string.replace(/[\"]?MAN_(BOOL|NUM)(.+?(?=MAN_(BOOL|NUM)))MAN_(BOOL|NUM)[\"]?/g, "$2");

		// null value = null
		string = string.replace(/[\"]?MAN_NULL[\"]?/g, "null");

		// OBJECTS
		string = string.replace(/[\"]?MAN_OBJ(.+?(?=MAN_OBJ))MAN_OBJ[\"]?/g, function(string) {
			// remove marker
			string = string.replace(/[\"]?MAN_OBJ(.+?(?=MAN_OBJ))MAN_OBJ[\"]?/g, "$1");
			// unescape quotes
			return string.replace(/\\("|')/g, "$1");
		});

		return eval("["+string.replace(/MAN_JSON_START/g, "{").replace(/MAN_JSON_END/g, "},")+"]");
	}

	// plain string
	else if(type_template == "STRING") {

		// BOOLEANS + NUMBERS
		string = string.replace(/MAN_(BOOL|NUM)(.+?(?=MAN_(BOOL|NUM)))MAN_(BOOL|NUM)/g, "$2");

		// null value = empty string
		string = string.replace(/MAN_NULL/g, "");

		// OBJECTS
		string = string.replace(/MAN_OBJ(.+?(?=MAN_OBJ))MAN_OBJ/g, function(string) {
			// remove marker
			string = string.replace(/MAN_OBJ(.+?(?=MAN_OBJ))MAN_OBJ/g, "$1");
			// unescape quotes
			return string.replace(/\\(\\|"|')/g, "$1");
		});

		// remove any double escapes
		return string.replace(/\\(\\|"|')/g, "$1");
	}

}


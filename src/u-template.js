u.template = function(template, json, _options) {

	var string = "";
	var template_string = "";
	var clone, container, item_template, dom, node_list, type_template, type_parent, template_contructor;

	// settings
	// append results to node
	var append_to_node = false;

	// apply parameters
	if (typeof(_options) == "object") {
		var _argument;
		for (_argument in _options) {
			switch (_argument) {
				case "append": 	append_to_node = _options[_argument];			break;
			}
		}
	}

	// IE 7 doesn't accept constructor to identify node, using nodeName as replacement

	// identify template type
	if(typeof(template) == "object" && typeof(template.nodeName) != "undefined") {
//		u.bug("HTML template")

		type_template = "HTML";

	}
	else if(typeof(template) == "object" && JSON.stringify(template)) {
//		u.bug("JSON template")

		type_template = "JSON";

	}
	else if(typeof(template) == "string" && template.match(/^(\{|\[)/)) {
//		u.bug("JSON string template")

		type_template = "JSON_STRING";
	}
	else if(typeof(template) == "string" && template.match(/^<.+>$/)) {
//		u.bug("HTML string template")

		type_template = "HTML_STRING";
	}



	if(json) {

		// No array in json means json.length == undefined
		// and the template function is used for something it wasn't intented to.
		// Therefore we let it clone the node.
		// Without this check jsons with an empty result array will create a "ghost" node.
		if (json.length == undefined || (json.length && json.length > 0)) {


			// HTML node or HTML STRING
			if(type_template == "HTML_STRING" || type_template == "HTML") {
//				u.bug("TEMPLATE:" + template.innerHTML)

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
			// string based (JSON object string)
			else if(type_template == "JSON") {

				template_string = JSON.stringify(template).replace(/^{/g, "MAN_JSON_START").replace(/}$/g, "MAN_JSON_END");
			}
			// string based (JSON string)
			else if(type_template == "JSON_STRING") {

				template_string = template.replace(/^{/g, "MAN_JSON_START").replace(/}$/g, "MAN_JSON_END");
			}
			
		}
		
		// multiple results
		if(json.length) {
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

						if(typeof(json[_item][key]) == "string" && json[_item][key]) {
							return json[_item][key].toString().replace(/(\"|\')/g, "\\$1");
						}
						else if (typeof (json[_item][key]) == "number") {
							return json[_item][key];
						}
						else if(typeof(json[_item][key]) == "boolean") {
							// Insert BOOL marker, to be replaced with real boolean
							// (not encapsulated in quotes) before string is returned
							return "MAN_BOOL" + json[_item][key] + "MAN_BOOL";
						}
						else if (typeof (json[_item][key]) == "object") {
							return "MAN_OBJ" + JSON.stringify(json[_item][key]) + "MAN_OBJ";
						}
						else {
							return "";
						}

					});
				}

			}
		}
		// only one result
		else {
			string += template_string.replace(/\{(.+?)\}/g, function(string) {
				var key = json[string.replace(/[\{\}]/g, "")];

				// clean up strings
				if(typeof(json[key]) == "string" && json[key]) {
					return json[key].replace(/(\"|\')/g, "\\$1")
				}
				// return numbers correct
				else if (typeof (json[key]) == "number") {
					return json[key];
				}
				else if(typeof(json[key]) == "boolean") {

					// Insert BOOL marker, to be replaced with real boolean
					// (not encapsulated in quotes) before string is returned
					return "MAN_BOOL" + json[key] + "MAN_BOOL";
				}
				else if (typeof (json[key]) == "object") {
					return "MAN_OBJ" + JSON.stringify(json[key]).replace(/(\"|\')/g, "\\$1") + "MAN_OBJ";
				}
				else {
					return "";
				}
			});
		}
	}

	// replace boolean markers with real boolean values
	string = string.replace(/\"MAN_BOOLtrueMAN_BOOL\"/g, "true");
	string = string.replace(/\"MAN_BOOLfalseMAN_BOOL\"/g, "false");

	// replace object markers with real object
	string = string.replace(/\"MAN_OBJ(.+)MAN_OBJ\"/g, function (string) {
		string = string.replace(/\"MAN_OBJ(.+)MAN_OBJ\"/g, "$1");
		return string.replace(/\\("|')/g, "$1");
	});


	if(type_template == "HTML_STRING" || type_template == "HTML") {

		// unescape quotes when outputting to HTML
		string = string.replace(/\\("|')/g, "$1");

		// IE <=9 doesn't support table.innerHTML, so wrap node in div and innerHTML entire table
		if (type_parent == "table") {
			dom = document.createElement("div");
			dom.innerHTML = "<table><tbody>"+string+"</tbody></table>";
			dom = u.qs("tbody", dom);
		}
		else {
			dom = document.createElement(type_parent);
			dom.innerHTML = string;
			
		}

		// should children be appended to node automatically
		if (append_to_node) {
			node_list = [];

			// doing innerHTML cancels events on header - instead use dom
			while (dom.childNodes.length) {
				node_list.push(u.ae(append_to_node, dom.childNodes[0]));
			}
			// return array of appended nodes
			return node_list;
		}

		// return childNodes object
		return dom.childNodes;
	}

	// JSON objects
	else if(type_template == "JSON_STRING" || type_template == "JSON") {
		// u.bug(string)
		// u.bug(string.replace(/MAN_JSON_START/g, "{").replace(/MAN_JSON_END/g, "},"))
		return eval("["+string.replace(/MAN_JSON_START/g, "{").replace(/MAN_JSON_END/g, "},")+"]");
	}

}


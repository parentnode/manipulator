u.template = function(template, json, _options) {

	var html = "";
	var template_string = "";
	var clone, container, item_template, dom, node_list;

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


	if(json) {

		// No array in json means json.length == undefined
		// and the template function is used for something it wasn't intented to.
		// Therefore we let it clone the node.
		// Without this check jsons with an empty result array will create a "ghost" node.
		if (json.length == undefined || (json.length && json.length > 0)) {
			clone = template.cloneNode(true);
			u.rc(clone, "template");

			if(template.nodeName == "LI") {
				container = document.createElement("ul");
			}
			else if(template.nodeName == "TR") {
				container = document.createElement("table").appendChild(document.createElement("tbody"));
			}
			else {
				container = document.createElement("div");
			}


			container.appendChild(clone);
			template_string = container.innerHTML;
			template_string = template_string.replace(/href\=\"([^\"]+)\"/g, function(string) {return decodeURIComponent(string);});
			template_string = template_string.replace(/src\=\"([^\"]+)\"/g, function(string) {return decodeURIComponent(string);});
			item_template;
		}
		
		// multiple results
		if(json.length) {
			// use _item (WITH UNDERSCORE) to help IE, where item will be interpreted as item()
			for(_item in json) {

//				u.bug("item:" + _item)
				item_template = template_string;

				// look for functions
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
				

				html += item_template.replace(/\{(.+?)\}/g, 
					function(string) {
						if(string == "{children}") {
							if(json[_item].children && json[_item].children.length) {
								var parent_node = template.parentNode.nodeName.toLowerCase();
								var parent_class = template.parentNode.className;
								return '<'+parent_node+' class="'+parent_class+'">'+u.template(template, json[_item].children)+'</'+parent_node+'>';
							}
							else {
								return "";
							}
						}
						else if(json[_item][string.replace(/[\{\}]/g, "")]) {
							if(json[_item][string.replace(/[\{\}]/g, "")] === true) {
								return "true";
							}
							
							return json[_item][string.replace(/[\{\}]/g, "")];
						}
						else if(json[_item][string.replace(/[\{\}]/g, "")] === false) {
							return "false";
						}
						else {
							return "";
						}
					}
				);
			}
		}
		// only one result
		else {
			html += template_string.replace(/\{(.+?)\}/g, function(string) {if(json[string.replace(/[\{\}]/g, "")]) {return json[string.replace(/[\{\}]/g, "")]}else{return ""}});
		}
	}


	// node is already attached to DOM - use parentNode
	if(template.parentNode) {
		dom = document.createElement(template.parentNode.nodeName);
	}
	// choose appropiate parentNode type for node
	else {
		if(template.nodeName == "LI") {
			dom = document.createElement("ul");
		}
		else if(template.nodeName == "TR") {
			dom = document.createElement("table").appendChild(document.createElement("tbody"));
		}
		else {
			dom = document.createElement("div");
		}
	}
	dom.innerHTML = html;

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


//
// u.template = function(node, response) {
//
// 	var html = "";
// 	var clone = "";
// 	var container = "";
// 	var template = "";
// 	var item_template = "";
//
// 	if(response) {
//
// 		// No array in response means response.length == undefined
// 		// and the template function is used for something it wasn't intented to.
// 		// Therefore we let it clone the node.
// 		// Without this check responses with an empty result array will create a "ghost" node.
// 		if (response.length == undefined || (response.length && response.length > 0)) {
// 			clone = node.cloneNode(true);
// 			u.rc(clone, "template");
// 			container = document.createElement("div");
// 			container.appendChild(clone);
// 			template = container.innerHTML;
// 			template = template.replace(/href\=\"([^\"]+)\"/g, function(string) {return decodeURIComponent(string);});
// 			template = template.replace(/src\=\"([^\"]+)\"/g, function(string) {return decodeURIComponent(string);});
// 			item_template;
// 		}
//
// 		// multiple results
// 		if(response.length) {
// 			// use _item (WITH UNDERSCORE) to help IE, where item will be interpreted as item()
// 			for(_item in response) {
//
// //				u.bug("item:" + _item)
// 				item_template = template;
//
// 				// look for functions
// // 				if(item_template.match(/\{\{/)) {
// //
// //
// // 					// first get expression to evaluate
// // //					look for ?
// // //					 and :
// //
// // //					alert(item_template)
// // 					expression = item_template.match(/\{\{(.+?)\}/g);
// //
// // 					//{{checked} ? checked="checked" : }
// //
// // //					expression = template.match(/\{\{(.+?)\}[\s\?]+(.+?)[\s\:]+(.+?)\}/);
// // //					item_template = item_template.replace();
// //
// //
// // 					u.bug("contains if:" + expression)
// //
// //
// //
// // 					if(expression.length && response[item][expression[1]]) {
// // 						u.bug("true")
// // 					}
// // 				}
// 				// item_template = template.replace(/\{{(.+?)\}/g, "");
// 				// 						u.bug("temp:" + string)
// 				// 						if(string.match("{{")) {
// 				// 							u.bug("function")
// 				// 						}
//
// 										//}
// 										//else
//
//
// 				html += item_template.replace(/\{(.+?)\}/g,
// 					function(string) {
// 						if(string == "{children}") {
// 							if(response[_item].children && response[_item].children.length) {
// 								var parent_node = node.parentNode.nodeName.toLowerCase();
// 								var parent_class = node.parentNode.className;
// 								return '<'+parent_node+' class="'+parent_class+'">'+u.template(node, response[_item].children)+'</'+parent_node+'>';
// 							}
// 							else {
// 								return "";
// 							}
// 						}
// 						else if(response[_item][string.replace(/[\{\}]/g, "")]) {
// 							if(response[_item][string.replace(/[\{\}]/g, "")] === true) {
// 								return "true";
// 							}
//
// 							return response[_item][string.replace(/[\{\}]/g, "")];
// 						}
// 						else if(response[_item][string.replace(/[\{\}]/g, "")] === false) {
// 							return "false";
// 						}
// 						else {
// 							return "";
// 						}
// 					}
// 				);
// 			}
// 		}
// 		// only one result
// 		else {
// 			html += template.replace(/\{(.+?)\}/g, function(string) {if(response[string.replace(/[\{\}]/g, "")]) {return response[string.replace(/[\{\}]/g, "")]}else{return ""}});
// 		}
// 	}
//
//
// 	// doing innerHTML cancels events on header - instead use dom
// 	var dom = document.createElement(node.parentNode.nodeName);
// 	dom.innerHTML = html;
//
// 	// return childNodes object
// 	return dom.childNodes;
// }
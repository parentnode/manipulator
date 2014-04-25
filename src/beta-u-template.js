
u.template = function(node, response) {

	var html = "";
	var clone = "";
	var container = "";
	var template = "";
	var item_template = "";

	if(response) {

		// No array in response means response.length == undefined
		// and the template function is used for something it wasn't intented to.
		// Therefore we let it clone the node.
		// Without this check responses with an empty result array will create a "ghost" node.
		if (response.length == undefined || (response.length && response.length > 0)) {
			clone = node.cloneNode(true);
			u.rc(clone, "template");
			container = document.createElement("div");
			container.appendChild(clone);
			template = container.innerHTML;
			template = template.replace(/href\=\"([^\"]+)\"/g, function(string) {return decodeURIComponent(string);});
			template = template.replace(/src\=\"([^\"]+)\"/g, function(string) {return decodeURIComponent(string);});
			item_template;
		}
		
		// multiple results
		if(response.length) {
			// use _item (WITH UNDERSCORE) to help IE, where item will be interpreted as item()
			for(_item in response) {

//				u.bug("item:" + _item)
				item_template = template;

				// look for functions
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
// 					if(expression.length && response[item][expression[1]]) {
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
							if(response[_item].children && response[_item].children.length) {
								var parent_node = node.parentNode.nodeName.toLowerCase();
								var parent_class = node.parentNode.className;
								return '<'+parent_node+' class="'+parent_class+'">'+u.template(node, response[_item].children)+'</'+parent_node+'>';
							}
							else {
								return "";
							}
						}
						else if(response[_item][string.replace(/[\{\}]/g, "")]) {
							if(response[_item][string.replace(/[\{\}]/g, "")] === true) {
								return "true";
							}
							
							return response[_item][string.replace(/[\{\}]/g, "")];
						}
						else if(response[_item][string.replace(/[\{\}]/g, "")] === false) {
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
			html += template.replace(/\{(.+?)\}/g, function(string) {if(response[string.replace(/[\{\}]/g, "")]) {return response[string.replace(/[\{\}]/g, "")]}else{return ""}});
		}
	}
	

	// doing innerHTML cancels events on header - instead use dom
	var dom = document.createElement(node.parentNode.nodeName);
	dom.innerHTML = html;

	// return childNodes object
	return dom.childNodes;
}
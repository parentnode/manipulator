// cross-browser querySelector
Util.querySelector = u.qs = function(query, scope) {
	scope = scope ? scope : document;
	return scope.querySelector(query);
}

// cross-browser querySelectorAll
Util.querySelectorAll = u.qsa = function(query, scope) {
	try {
		scope = scope ? scope : document;
		return scope.querySelectorAll(query);
	}
	catch(exception) {
		u.exception("u.qsa", arguments, exception);
	}
	return [];
}

// Get element (id/class/tag)
// Returns elementById if possible
// else Returns first element with (partial) matching classname from target
// If no matches, return first element with tagname from target
Util.getElement = u.ge = function(identifier, scope) {
	var node, i, regexp;
	if(document.getElementById(identifier)) {
		return document.getElementById(identifier);
	}
	scope = scope ? scope : document;
	regexp = new RegExp("(^|\\s)" + identifier + "(\\s|$|\:)");
	for(i = 0; node = scope.getElementsByTagName("*")[i]; i++) {
		if(regexp.test(node.className)) {
			return node;
		}
	}
	return scope.getElementsByTagName(identifier).length ? scope.getElementsByTagName(identifier)[0] : false;
}
// Get elements (class/tag)
// Returns all elements with (partial) matching classname from target
// If no matches, return elements with tagname from target
Util.getElements = u.ges = function(identifier, scope) {
	var node, i, regexp;
	var nodes = new Array();
	scope = scope ? scope : document;
	regexp = new RegExp("(^|\\s)" + identifier + "(\\s|$|\:)");
	for(i = 0; node = scope.getElementsByTagName("*")[i]; i++) {
		if(regexp.test(node.className)) {
			nodes.push(node);
		}
	}
	return nodes.length ? nodes : scope.getElementsByTagName(identifier);
}



// get parent node
// excludes nodes matched by exclude=css selector
// includes nodes matched by include=css selector
Util.parentNode = u.pn = function(node, _options) {

	var exclude = "";
	var include = "";

	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "include"      : include       = _options[_argument]; break;
				case "exclude"      : exclude       = _options[_argument]; break;
			}
		}
	}

	// get include and exclude nodes if needed
	var exclude_nodes = exclude ? u.qsa(exclude) : [];
	var include_nodes = include ? u.qsa(include) : [];


	// get parentNode using standard JS
	node = node.parentNode;

	// compare and keep iterating if not valid match
	// ignore comment and text nodes
	while(node && (node.nodeType == 3 || node.nodeType == 8 || (exclude && (u.inNodeList(node, exclude_nodes))) || (include && (!u.inNodeList(node, include_nodes))))) {
		node = node.parentNode;
	}

	return node;
}


// Returns previous sibling, not counting text+comment nodes as siblings 
// excludes nodes matched by exclude=css selector
// includes nodes matched by include=css selector
Util.previousSibling = u.ps = function(node, _options) {
//	u.bug("ps:" + u.nodeId(node));

	var exclude = "";
	var include = "";

	// TODO: Consider option to start over from end, if no prev is found
	// var loop = false;

	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "include"      : include       = _options[_argument]; break;
				case "exclude"      : exclude       = _options[_argument]; break;

//				case "loop"            : loop             = _options[_argument]; break;
			}
		}
	}

	// get include and exclude nodes if needed
	var exclude_nodes = exclude ? u.qsa(exclude, node.parentNode) : [];
	var include_nodes = include ? u.qsa(include, node.parentNode) : [];
	
	// get previousSibling using standard JS
	node = node.previousSibling;

	// compare and keep iterating if not valid match
	// ignore comment and text nodes
	while(node && (node.nodeType == 3 || node.nodeType == 8 || (exclude && (u.inNodeList(node, exclude_nodes))) || (include && (!u.inNodeList(node, include_nodes))))) {
		node = node.previousSibling;
	}

	return node;
}


// Returns next sibling, not counting text+comment nodes as siblings 
// excludes nodes matched by exclude=css selector
// includes nodes matched by include=css selector
Util.nextSibling = u.ns = function(node, _options) {
//	u.bug("ns:" + u.nodeId(node));

	var exclude = "";
	var include = "";

	// TODO: Consider option to start over, if no next is found
	// var loop = false;

	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "include"      : include       = _options[_argument]; break;
				case "exclude"      : exclude       = _options[_argument]; break;

//				case "loop"            : loop             = _options[_argument]; break;
			}
		}
	}

	// get include and exclude nodes if needed
	var exclude_nodes = exclude ? u.qsa(exclude, node.parentNode) : [];
	var include_nodes = include ? u.qsa(include, node.parentNode) : [];

	// get previousSibling using standard JS
	node = node.nextSibling;

	// compare and keep iterating if not valid match
	// ignore comment and text nodes
	while(node && (node.nodeType == 3 || node.nodeType == 8 || (exclude && (u.inNodeList(node, exclude_nodes))) || (include && (!u.inNodeList(node, include_nodes))))) {
		node = node.nextSibling;
	}
	return node;
}



// Get childnodes array with 
// excludes nodes matched by exclude=css selector
// includes nodes matched by include=css selector
Util.childNodes = u.cn = function(node, _options) {

	var exclude = "";
	var include = "";

	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "include"      : include       = _options[_argument]; break;
				case "exclude"      : exclude       = _options[_argument]; break;
			}
		}
	}

	// get include and exclude nodes if needed
	var exclude_nodes = exclude ? u.qsa(exclude, node) : [];
	var include_nodes = include ? u.qsa(include, node) : [];

	var i, child;
	var children = new Array();
	for(i = 0; child = node.childNodes[i]; i++) {
		if(child && child.nodeType != 3 && child.nodeType != 8 && (!exclude || (!u.inNodeList(child, exclude_nodes))) && (!include || (u.inNodeList(child, include_nodes)))) {
			children.push(child);
		}
	}
	return children;
}




/**
* append child to element e
* add reference to e on node
* @param node e html element to append new child to
* @param String node_type new node to create and append - can be either node type of actual node
* @param Optional ClassName or attribute object
* return HTML node
*/
Util.appendElement = u.ae = function(_parent, node_type, attributes) {
	try {
		// is node_type already DOM node
		var node = (typeof(node_type) == "object") ? node_type : document.createElement(node_type);
		node = _parent.appendChild(node);

		// add attributes
		if(attributes) {
			var attribute;
			for(attribute in attributes) {
				if(attribute == "html") {
					node.innerHTML = attributes[attribute];
				}
				else {
					node.setAttribute(attribute, attributes[attribute]);
				}
			}
		}
		return node;
	}
	catch(exception) {
		u.exception("u.ae", arguments, exception);
	}
	return false;
}

/**
* Insert element
*/
Util.insertElement = u.ie = function(_parent, node_type, attributes) {
	try {
		var node = (typeof(node_type) == "object") ? node_type : document.createElement(node_type);
		node = _parent.insertBefore(node, _parent.firstChild);
		// add attributes
		if(attributes) {
			var attribute;
			for(attribute in attributes) {
				if(attribute == "html") {
					node.innerHTML = attributes[attribute];
				}
				else {
					node.setAttribute(attribute, attributes[attribute]);
				}
			}
		}
		return node;
	}
	catch(exception) {
		u.exception("u.ie", arguments, exception);
	}
	return false;
}


// insert element in wrap-element and return wrapper
Util.wrapElement = u.we = function(node, node_type, attributes) {
	try {
		var wrapper_node = node.parentNode.insertBefore(document.createElement(node_type), node);
		if(attributes) {
			var attribute;
			for(attribute in attributes) {
				wrapper_node.setAttribute(attribute, attributes[attribute]);
			}
		}	
		wrapper_node.appendChild(node);
		return wrapper_node;
	}
	catch(exception) {
		u.exception("u.we", arguments, exception);
	}
	return false;
}


// wrap content of node in wrap-element and return wrapper
Util.wrapContent = u.wc = function(node, node_type, attributes) {
	try {
		var wrapper_node = document.createElement(node_type);
		if(attributes) {
			var attribute;
			for(attribute in attributes) {
				wrapper_node.setAttribute(attribute, attributes[attribute]);
			}
		}	
		while(node.childNodes.length) {
			wrapper_node.appendChild(node.childNodes[0]);
		}

		node.appendChild(wrapper_node);
		return wrapper_node;
	}
	catch(exception) {
		u.exception("u.wc", arguments, exception);
	}
	return false;
}

// get node textcontent shorthand 
// basically this is not needed for newer browsers, but required to align syntax for older browsers
Util.textContent = u.text = function(node) {
	try {
		return node.textContent;
	}
	catch(exception) {
		u.exception("u.text", arguments, exception);
	}
	return "";
}


// make element clickable with options
// options can also contain tracking information
Util.clickableElement = u.ce = function(node, _options) {

	node._use_link = "a";
	node._click_type = "manual";

	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "use"			: node._use_link		= _options[_argument]; break;
				case "type"			: node._click_type		= _options[_argument]; break;
			}

		}
	}

	// look for link
	var a = (node.nodeName.toLowerCase() == "a" ? node : u.qs(node._use_link, node));
	if(a) {
		u.ac(node, "link");
		// only set url, if a has href attribute
		if(a.getAttribute("href") !== null) {
			node.url = a.href;
			a.removeAttribute("href");

			node._a = a;
		}
	}
	else {
		u.ac(node, "clickable");
	}

	if(typeof(u.e) != "undefined" && typeof(u.e.click) == "function") {

		// set up click event handler and pass options for tracking
		u.e.click(node, _options);
		if(node._click_type == "link") {


			// apply full link fun
			node.clicked = function(event) {

				// allow for custom action before actual click is executed
				if(typeof(node.preClicked) == "function") {
					node.preClicked();
				}

				// meta key pressed
				if(event && (event.metaKey || event.ctrlKey)) {
					window.open(this.url);
				}
				else {
					// HASH/POPSTATE navigation
					if(typeof(u.h) != "undefined" && u.h.is_listening) {
						u.h.navigate(this.url, this);
					}
					else {
						location.href = this.url;
					}
				}
			}
		}
	}

	return node;
}

// Get JSS class value
Util.classVar = u.cv = function(node, var_name) {
//	u.bug(u.nodeId(node) + ":" + node.className);
	try {
		var regexp = new RegExp("(\^| )" + var_name + ":[?=\\w/\\#~:.,?+=?&%@!\\-]*");
		var match = node.className.match(regexp);
		if(match) {
			return match[0].replace(var_name + ":", "").trim();
		}
	}
	catch(exception) {
		u.exception("u.cv", arguments, exception);
	}
	return false;
}

// set classname on element, replacing all others
Util.setClass = u.sc = function(node, classname) {
	try {
		var old_class = node.className;
		node.className = classname;

		// force dom update
		node.offsetTop;
		return old_class;
	}
	catch(exception) {
		u.exception("u.sc", arguments, exception);
	}
	// return false on error
	return false;
}
// Element has classname
Util.hasClass = u.hc = function(node, classname) {
	try {
		if(classname) {
			var regexp = new RegExp("(^|\\s)(" + classname + ")(\\s|$)");
			if(regexp.test(node.className)) {
				return true;
			}
		}
	}
	catch(exception) {
		u.exception("u.hc", arguments, exception);
	}
	// return false on error
	return false;
}


// Add classname to element if it is not already there
Util.addClass = u.ac = function(node, classname, dom_update) {
	try {
		if(classname) {
			if(node.classList){
				node.classList.add(classname);
				// force dom update (performance killer, but will make rendering more detailed)
				dom_update === false ? false : node.offsetTop;
			}
			else {
				var regexp = new RegExp("(^|\\s)" + classname + "(\\s|$)");
				if(!regexp.test(node.className)) {
					node.className += node.className ? " " + classname : classname;
					dom_update === false ? false : node.offsetTop;
				}
			}
			
			return node.className;
		}
	}
	catch(exception) {
		u.exception("u.ac", arguments, exception);
	}
	return false;
}

// Remove all instances of classname from element
// TODO: SVG.className cannot be set (needs to be SVG.className.baseVal || use classList works from IE 11)
Util.removeClass = u.rc = function(node, classname, dom_update) {
	try {
		if(classname) {
			if(node.classList.contains(classname)) {
				node.classList.remove(classname);
			}
			else {
				var regexp = new RegExp("(\\b)" + classname + "(\\s|$)", "g");
				node.className = node.className.replace(regexp, " ").trim().replace(/[\s]{2}/g, " ");
	
				// force dom update (performance killer, but will make rendering more detailed)
				dom_update === false ? false : node.offsetTop;
				return node.className;
			}
		}
	}
	catch(exception) {
		u.exception("u.rc", arguments, exception);
	}
	return false;
}
// Toggle classname on element
// if class is applied, then remove
// if not applied, then apply
// if _classname is given as parameter, switch between to two classnames
Util.toggleClass = u.tc = function(node, classname, _classname, dom_update) {
	try {
		if(node.classList) {

			if(node.classList.contains(classname)) {
				node.classList.remove(classname);
				if(_classname) {
					node.classList.add(_classname);
				}
			}

			else {
				node.classList.add(classname);
				if(_classname) {
					node.classList.remove(_classname);
				}
			}
		}
		else {
			var regexp = new RegExp("(^|\\s)" + classname + "(\\s|$|\:)");
			if(regexp.test(node.className)) {
				u.rc(node, classname, false);
				if(_classname) {
					u.ac(node, _classname, false);
				}
			}

			else {
				u.ac(node, classname, false);
				if(_classname) {
					u.rc(node, _classname, false);
				}
			}
	
			dom_update === false ? false : node.offsetTop;
			return node.className;
		}
	}
	catch(exception) {
		u.exception("u.tc", arguments, exception);
	}
	return false;
}


// apply style
// set style value and query DOM to force update
// Uses u.venderProperty to uses prefix if needed
Util.applyStyle = u.as = function(node, property, value, dom_update) {

	node.style[u.vendorProperty(property)] = value;

	dom_update === false ? false : node.offsetTop;
}

// apply styles
// set style values and query DOM to force update
// Uses u.venderProperty to uses prefix if needed
Util.applyStyles = u.ass = function(node, styles, dom_update) {

	if(styles) {
		var style;
		for(style in styles) {
			node.style[u.vendorProperty(style)] = styles[style];
		}
	}

	dom_update === false ? false : node.offsetTop;
}


// Get elements computed style value for css property
// compensated for JS value syntax
Util.getComputedStyle = u.gcs = function(node, property) {

	// query DOM to force update
	node.offsetHeight;

//	property = property.replace(/([A-Z]{1})/g, function(word){return word.replace(/([A-Z]{1})/, "-$1").toLowerCase()});

	// also convert vendor prefix
//	property = property.replace(/([A-Z]{1})/g, function(word){return word.replace(/([A-Z]{1})/, "-$1").toLowerCase()}).replace(/^(webkit|ms|moz)/g, "-$1");

//	u.bug("gcs property1:" + property)
	property = (u.vendorProperty(property).replace(/([A-Z]{1})/g, "-$1")).toLowerCase().replace(/^(webkit|ms)/, "-$1");

//	u.bug("gcs property2:" + property)
	// return computed style if method is supported
	if(window.getComputedStyle) {
		return window.getComputedStyle(node, null).getPropertyValue(property);
	}
	return false;
}


// has fixed parent - lots of things needs to be calculated differently if parent is fixed
Util.hasFixedParent = u.hfp = function(node) {
	while(node.nodeName.toLowerCase() != "body") {
		if(u.gcs(node.parentNode, "position").match("fixed")) {
			return true;
		}
		node = node.parentNode;
	}
	return false;
}




// FOR CONSIDERATION
/**
* FOR CONSIDERATION
*/
Util.insertAfter = u.ia = function(after_node, insert_node) {
	var next_node = u.ns(after_node);
	if(next_node) {
		after_node.parentNode.insertBefore(next_node, insert_node);
	}
	else {
		after_node.parentNode.appendChild(insert_node);
	}
}


// select text in node
// TODO: Extend with Fallback support
Util.selectText = function(node) {

	var selection = window.getSelection();
	var range = document.createRange();
	range.selectNodeContents(node);
	selection.removeAllRanges();
	selection.addRange(range);

}

// is node in NodeList
Util.inNodeList = function(node, list) {

	var i, list_node;
	for(i = 0; list_node = list[i]; i++) {
		if(list_node === node) {
			return true;
		}
	}

	return false;
}

// is node within scope
u.contains = Util.nodeWithin = u.nw = function(node, scope) {

	if(scope != node) {
		if(scope.contains(node)) {
			return true
		}
	}
	return false;

}
u.containsOrIs = function(node, scope) {

	if(scope == node || u.contains(node, scope)) {
		return true
	}
	return false;
}
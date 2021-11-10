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
	var node, nodes, i, regexp;
	if(document.getElementById(identifier)) {
		return document.getElementById(identifier);
	}
	scope = scope ? scope : document;
	regexp = new RegExp("(^|\\s)" + identifier + "(\\s|$|\:)");
	nodes = scope.getElementsByTagName("*");
	for(i = 0; i < nodes.length; i++) {
		node = nodes[i];
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
	var node, nodes, i, regexp;
	var return_nodes = new Array();
	scope = scope ? scope : document;
	regexp = new RegExp("(^|\\s)" + identifier + "(\\s|$|\:)");
	nodes = scope.getElementsByTagName("*");
	for(i = 0; i < nodes.length; i++) {
		node = nodes[i];
		if(regexp.test(node.className)) {
			return_nodes.push(node);
		}
	}
	return return_nodes.length ? return_nodes : scope.getElementsByTagName(identifier);
}



// get parent node
// excludes nodes matched by exclude=css selector
// includes nodes matched by include=css selector
Util.parentNode = u.pn = function(node, _options) {

	var exclude = "";
	var include = "";

	if(obj(_options)) {
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
	// u.bug("ps:", node);

	var exclude = "";
	var include = "";

	// TODO: Consider option to start over from end, if no prev is found
	// var loop = false;

	if(obj(_options)) {
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
	// u.bug("ns:", node);

	var exclude = "";
	var include = "";

	// TODO: Consider option to start over, if no next is found
	// var loop = false;

	if(obj(_options)) {
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

	// get nextSibling using standard JS
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

	if(obj(_options)) {
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
	for(i = 0; i < node.childNodes.length; i++) {
		child = node.childNodes[i]
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
		var node = (obj(node_type)) ? node_type : (node_type == "svg" ? document.createElementNS("http://www.w3.org/2000/svg", node_type) : document.createElement(node_type));
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
		var node = (obj(node_type)) ? node_type : (node_type == "svg" ? document.createElementNS("http://www.w3.org/2000/svg", node_type) : document.createElement(node_type));
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

	if(obj(_options)) {
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
			a.url = a.href;
			// a.href = node.url;
			// Experimental – keeps hrefs for better accesibility (user can see/copy links)
			// a.removeAttribute("href");
			// And then prevent href from hijacking click
			node.onclick = function(event) {
				event.preventDefault();
			}
			node._a = a;
		}
	}
	else {
		u.ac(node, "clickable");
	}

	if(obj(u.e) && fun(u.e.click)) {

		// set up click event handler and pass options for tracking
		u.e.click(node, _options);
		if(node._click_type == "link") {


			// apply full link fun
			node.clicked = function(event) {

				// allow for custom action before actual click is executed
				if(fun(node.preClicked)) {
					node.preClicked();
				}

				// meta key pressed
				if(event && (event.metaKey || event.ctrlKey || (this._a && this._a.target))) {
					window.open(this.url);
				}
				else {
					// HASH/POPSTATE navigation
					if(obj(u.h) && u.h.is_listening) {
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
	// u.bug(node, var_name, node.className);
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
Util.setClass = u.sc = function(node, classname, dom_update) {

	// save old classname
	var old_class;

	// Special case for SVGs
	if(node instanceof SVGElement) {
		old_class = node.className.baseVal;

		// NOTE: Chrome from v61 has a bug where class attribute on SVGs is not updated
		// when mixing use of baseVal and classList to add or remove classes
		// – issue appears to have been introduced when classList.replace was implemented
		// node.className.baseVal = classname;

		// Setting class on SVG with setAttribute fixes the problem
		node.setAttribute("class", classname);
	}
	// HTML
	else {
		old_class = node.className;
		node.className = classname;
	}

	// force dom update (performance killer, but will make rendering more detailed)
	dom_update = (dom_update === false) || (node.offsetTop);

	// return replaced classname
	return old_class;
}

// Element has classname (or classnames specified as RegEx)
Util.hasClass = u.hc = function(node, classname) {

	// try doing it via classList
	if(node.classList.contains(classname)) {
		return true;
	}
	// try regular expression
	else {
		var regexp = new RegExp("(^|\\s)(" + classname + ")(\\s|$)");
		// Special case for SVGs
		if(node instanceof SVGElement) {
			if(regexp.test(node.className.baseVal)) {
				return true;
			}
		}
		// HTML
		else {
			if(regexp.test(node.className)) {
				return true;
			}
		}
	}

	// return false on error
	return false;
}

// Add classname to element if it is not already there
Util.addClass = u.ac = function(node, classname, dom_update) {

	// Add class
	var classnames = classname.split(" ");
	while(classnames.length) {
		node.classList.add(classnames.shift());
	}

	// force dom update (performance killer, but will make rendering more detailed)
	dom_update = (dom_update === false) || (node.offsetTop);

	// return updated classname
	return node.className;
}

// Remove all instances of classname from element (or classnames represented as RegEx)
Util.removeClass = u.rc = function(node, classname, dom_update) {

	// try removing classname via classList
	if(node.classList.contains(classname)) {
		node.classList.remove(classname);
	}
	// try regular expression
	else {

		var regexp = new RegExp("(^|\\s)(" + classname + ")(?=[\\s]|$)", "g");

		// Replace pattern and fix any doublespaces
		// Special case for SVGs
		if(node instanceof SVGElement) {

			// NOTE: Chrome from v61 has a bug where class attribute on SVGs is not updated
			// when mixing use of baseVal and classList to add or remove classes
			// – issue appears to have been introduced when classList.replace was implemented
			// node.className.baseVal = node.className.baseVal.replace(regexp, " ").trim().replace(/[\s]{2}/g, " ");

			// Setting class on SVG with setAttribute fixes the problem
			node.setAttribute("class", node.className.baseVal.replace(regexp, " ").trim().replace(/[\s]{2}/g, " "));
		}
		// HTML
		else {
			node.className = node.className.replace(regexp, " ").trim().replace(/[\s]{2}/g, " ");
		}
	}

	// force dom update (performance killer, but will make rendering more detailed)
	dom_update = (dom_update === false) || (node.offsetTop);

	// return updated classname
	return node.className;
}

// Toggle classname on element
// if class is applied, then remove
// if not applied, then apply
// if _classname is given as parameter, switch between to two classnames
Util.toggleClass = u.tc = function(node, classname, _classname, dom_update) {

	// Node has classname
	if(u.hc(node, classname)) {

		// then remove it
		u.rc(node, classname, dom_update);

		// Add alt classname if passed
		if(_classname) {
			u.ac(node, _classname, dom_update);
		}
	}
	// Node does not have classname
	else {

		// Add it
		u.ac(node, classname);

		// Remove alt classname if passed
		if(_classname) {
			u.rc(node, _classname, dom_update);
		}
	}

	// force dom update (performance killer, but will make rendering more detailed)
	dom_update = (dom_update === false) || (node.offsetTop);

	// return updated classname
	return node.className;
}


// apply style
// set style value and query DOM to force update
// Uses u.venderProperty to uses prefix if needed
Util.applyStyle = u.as = function(node, property, value, dom_update) {

	node.style[u.vendorProperty(property)] = value;

	// force dom update (performance killer, but will make rendering more detailed)
	dom_update = (dom_update === false) || (node.offsetTop);
}

// apply styles
// set style values and query DOM to force update
// Uses u.venderProperty to uses prefix if needed
Util.applyStyles = u.ass = function(node, styles, dom_update) {

	if(styles) {
		var style;
		for(style in styles) {
			if(obj(u.a) && style == "transition") {
				u.a.transition(node, styles[style]);
			}
			else {
				node.style[u.vendorProperty(style)] = styles[style];
			}
		}
	}

	// force dom update (performance killer, but will make rendering more detailed)
	// default false
	// dom_update = (!dom_update) || (node.offsetTop);

	// default true
	dom_update = (dom_update === false) || (node.offsetTop);
}


// Get elements computed style value for css property
// compensated for JS value syntax
Util.getComputedStyle = u.gcs = function(node, property) {

	// query DOM to attempt to force update
	var dom_update = node.offsetHeight;

	property = (u.vendorProperty(property).replace(/([A-Z]{1})/g, "-$1")).toLowerCase().replace(/^(webkit|ms)/, "-$1");

	return window.getComputedStyle(node, null).getPropertyValue(property);
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


// Does scope contain node
u.contains = function(scope, node) {

	if(scope != node) {
		if(scope.contains(node)) {
			return true
		}
	}
	return false;

}

// is node equal to or withing scope
u.containsOrIs = function(scope, node) {

	if(scope == node || u.contains(scope, node)) {
		return true
	}
	return false;
}

// Does selector match element
u.elementMatches = u.em = function(node, selector) {
	return node.matches(selector);
	
}


// FOR CONSIDERATION
/**
* FOR CONSIDERATION
*/
Util.insertAfter = u.ia = function(insert_node, after_node) {
	var next_node = u.ns(after_node);
	if(next_node) {
		after_node.parentNode.insertBefore(insert_node, next_node);
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
	for(i = 0; i < list.length; i++) {
		list_node = list[i]
		if(list_node === node) {
			return true;
		}
	}

	return false;
}


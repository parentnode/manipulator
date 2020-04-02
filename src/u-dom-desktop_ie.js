// only punish older IEs <= 10
// Cannot set value properties directly


if(document.documentMode && document.documentMode <= 10 && document.documentMode >= 8) {
	// alert("<= 10");

	// IE attribute bug - will not apply value for checkboxes
	Util.appendElement = u.ae = function(_parent, node_type, attributes) {
		try {
			// is node_type already DOM node
			var node = (obj(node_type)) ? node_type : (node_type == "svg" ? document.createElementNS("http://www.w3.org/2000/svg", node_type) : document.createElement(node_type));

			if(attributes) {
				var attribute;
				for(attribute in attributes) {
	//				u.bug("append:" + attribute);
					if(!attribute.match(/^(value|html)$/)) {
						node.setAttribute(attribute, attributes[attribute]);
					}
				}

			}
			// have to modify the node before appending it to the DOM
			node = _parent.appendChild(node);

			if(attributes) {
				// IE specific extension
				// Value must be set after appending to dom
				if(attributes["value"]) {
					node.value = attributes["value"];
				}
				if(attributes["html"]) {
					node.innerHTML = attributes["html"];
				}
			}

			return node;
		}
		catch(exception) {
			u.exception("u.ae (desktop_ie10)", arguments, exception);
		}

	}

	// IE attribute bug - will not apply value for checkboxes
	Util.insertElement = u.ie = function(_parent, node_type, attributes) {
		try {
			var node = (obj(node_type)) ? node_type : (node_type == "svg" ? document.createElementNS("http://www.w3.org/2000/svg", node_type) : document.createElement(node_type));

			if(attributes) {
				var attribute;
				for(attribute in attributes) {
		//			u.bug(attribute)
					if(!attribute.match(/^(value|html)$/)) {
						node.setAttribute(attribute, attributes[attribute]);
					}
				}

			}

			// have to modify the node before inserting it in the DOM
			node = _parent.insertBefore(node, _parent.firstChild);

			if(attributes) {
				// IE specific extension
				// Value must be set after appending to dom
				if(attributes["value"]) {
					node.value = attributes["value"];
				}
				if(attributes["html"]) {
					node.innerHTML = attributes["html"];
				}
			}

			return node;
		}
		catch(exception) {
			u.exception("u.ie (desktop_ie10)", arguments, exception);
		}
	}

}


// Cannot use classList on SVGs
if(document.documentMode && document.documentMode <= 11 && document.documentMode >= 8) {
	// alert("<= 11");

	// Element has classname
	Util.hasClass = u.hc = function(node, classname) {

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

		// return false on error
		return false;
	}

	// Add classname to element if it is not already there
	Util.addClass = u.ac = function(node, classname, dom_update) {

		var classnames = classname.split(" ");
		while(classnames.length) {
			classname = classnames.shift();

			var regexp = new RegExp("(^|\\s)" + classname + "(\\s|$)");
			if(node instanceof SVGElement) {
				if(!regexp.test(node.className.baseVal)) {
					node.className.baseVal += node.className.baseVal ? " " + classname : classname;
				}
			}
			else {
				if(!regexp.test(node.className)) {
					node.className += node.className ? " " + classname : classname;
				}
			}
		}

		// force dom update (performance killer, but will make rendering more detailed)
		dom_update = (!dom_update) || (node.offsetTop);

		// return updated classname
		return node.className;
	}

	// Remove all instances of classname from element
	Util.removeClass = u.rc = function(node, classname, dom_update) {

		var regexp = new RegExp("(^|\\s)(" + classname + ")(?=[\\s]|$)", "g");

		// Replace pattern and fix any doublespaces
		// Special case for SVGs
		if(node instanceof SVGElement) {
			node.className.baseVal = node.className.baseVal.replace(regexp, " ").trim().replace(/[\s]{2}/g, " ");
		}
		// HTML
		else {
			node.className = node.className.replace(regexp, " ").trim().replace(/[\s]{2}/g, " ");
		}

		// force dom update (performance killer, but will make rendering more detailed)
		dom_update = (!dom_update) || (node.offsetTop);

		// return updated classname
		return node.className;
	}

}

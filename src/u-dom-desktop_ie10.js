// only punish older IEs
if(/*@cc_on!@*/false && document.documentMode <= 10) {

	// IE attribute bug - will not apply value for checkboxes
	Util.appendElement = u.ae = function(_parent, node_type, attributes) {
		try {
			// is node_type already DOM node
			var node = (typeof(node_type) == "object") ? node_type : document.createElement(node_type);

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
			var node = (typeof(node_type) == "object") ? node_type : document.createElement(node_type);

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
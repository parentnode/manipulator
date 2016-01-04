// Save cookie
// Session-cookie as default - set keep for extended validity
Util.saveCookie = function(name, value, _options) {

	var expires = true;
	var path = false;

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "expires"	: expires	= _options[_argument]; break;
				case "path"		: path		= _options[_argument]; break;
			}

		}
	}

	// create correct expire value
	if(expires === false) {
		expires = ";expires=Mon, 04-Apr-2020 05:00:00 GMT";
	}
	else if(typeof(expires) === "string") {
		expires = ";expires="+expires;
	}
	else {
		expires = "";
	}

	// create correct path value
	if(typeof(path) === "string") {
		path = ";path="+path;
	}
	else {
		path = "";
	}

	document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + path + expires;
}

// Get cookie
Util.getCookie = function(name) {
	var matches;
	return (matches = document.cookie.match(encodeURIComponent(name) + "=([^;]+)")) ? decodeURIComponent(matches[1]) : false;
}

// Delete cookie
Util.deleteCookie = function(name, _options) {

	var path = false;

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "path"	: path	= _options[_argument]; break;
			}

		}
	}

	// create correct path value
	if(typeof(path) === "string") {
		path = ";path="+path;
	}
	else {
		path = "";
	}

	document.cookie = encodeURIComponent(name) + "=" + path + ";expires=Thu, 01-Jan-70 00:00:01 GMT";
}



// Node cookies
Util.saveNodeCookie = function(node, name, value, _options) {

	var ref = u.cookieReference(node, _options);
	var mem = JSON.parse(u.getCookie("man_mem"));
	if(!mem) {
		mem = {};
	}
	if(!mem[ref]) {
		mem[ref] = {};
	}
	mem[ref][name] = (value !== false && value !== undefined) ? value : "";

	u.saveCookie("man_mem", JSON.stringify(mem), {"path":"/"});
}


Util.getNodeCookie = function(node, name, _options) {

	var ref = u.cookieReference(node, _options);
	var mem = JSON.parse(u.getCookie("man_mem"));
	if(mem && mem[ref]) {
		if(name) {
			return mem[ref][name] ? mem[ref][name] : "";
		}
		else {
			return mem[ref];
		}
	}
	return false;
}

Util.deleteNodeCookie = function(node, name, _options) {

	var ref = u.cookieReference(node, _options);
	var mem = JSON.parse(u.getCookie("man_mem"));
	if(mem && mem[ref]) {
		if(name) {
			delete mem[ref][name];
		}
		else {
			delete mem[ref];
		}
	}

	u.saveCookie("man_mem", JSON.stringify(mem), {"path":"/"});
}

// create cookie reference for node - to map a certain value to a node (like open/closed/selected state or search value)
Util.cookieReference = function(node, _options) {
	var ref;

	var ignore_classnames = false;
	var ignore_classvars = false;

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "ignore_classnames"	: ignore_classnames	= _options[_argument]; break;
				case "ignore_classvars" 	: ignore_classvars	= _options[_argument]; break;
			}

		}
	}


	if(node.id) {
		ref = node.nodeName + "#" + node.id;
	}
	else {
		// find best identifier
		var node_identifier = "";

		// element.name is best identifier
		if(node.name) {
			node_identifier = node.nodeName + "["+node.name+"]";
		}

		// className is best identifier
		else if(node.className) {
			var classname = node.className;

			// ignore listed classnames
			if(ignore_classnames) {
				var regex = new RegExp("(^| )("+ignore_classnames.split(",").join("|")+")($| )", "g");
				classname = classname.replace(regex, " ").replace(/[ ]{2,4}/, " ");
			}

			// ignore classVars
			if(ignore_classvars) {
				classname = classname.replace(/(^| )[a-zA-Z_]+\:[\?\=\w\/\\#~\:\.\,\+\&\%\@\!\-]+(^| )/g, " ").replace(/[ ]{2,4}/g, " ");
			}

			// replace spaces with dots
			node_identifier = node.nodeName+"."+classname.trim().replace(/ /g, ".");

		}
		// nodeName is best identifier
		else {
			node_identifier = node.nodeName
		}

		// find parentNode with id
		var id_node = node;
		while(!id_node.id) {
			id_node = id_node.parentNode;
		}

		if(id_node.id) {
			ref = id_node.nodeName + "#" + id_node.id + " " + node_identifier;
		}
		else {
			ref = node_identifier;
		}
	}
//	u.bug("ref:" + ref)
	return ref;
}

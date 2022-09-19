// Save cookie
// Session-cookie as default - set keep for extended validity

// Using localStorage when possible, to avoid sending data back and forth
Util.saveCookie = function(name, value, _options) {

	var expires = true;
	var path = false;
	var samesite = "lax";

	// force oldschool cookie
	var force = false;

	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "expires"	: expires	= _options[_argument]; break;
				case "path"		: path		= _options[_argument]; break;
				case "samesite"	: samesite	= _options[_argument]; break;

				case "force"	: force		= _options[_argument]; break;
			}

		}
	}

	// check localStorage first, undless the force is against it
	if(!force && obj(window.localStorage) && obj(window.sessionStorage)) {
		if(expires === true) {
			window.sessionStorage.setItem(name, value);
		}
		else {
			window.localStorage.setItem(name, value);
		}
		return;
	}


	// use cookie
	// create correct expire value
	if(expires === false) {
		// default 1 year
		expires = ";expires="+(new Date((new Date()).getTime() + (1000*60*60*24*365))).toGMTString();
	}
	else if(str(expires)) {
		expires = ";expires="+expires;
	}
	else {
		expires = "";
	}

	// create correct path value
	if(str(path)) {
		path = ";path="+path;
	}
	else {
		path = "";
	}

	// Create samesite value
	samesite = ";samesite="+samesite;

	document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + path + expires + samesite;
}

// Get cookie
Util.getCookie = function(name) {
	var matches;

	// check localStarage first
	if(obj(window.sessionStorage) && window.sessionStorage.getItem(name)) {
		return window.sessionStorage.getItem(name)
	}
	else if(obj(window.localStorage) && window.localStorage.getItem(name)) {
		return window.localStorage.getItem(name)
	}

	// check cookie if no match was found
	return (matches = document.cookie.match(encodeURIComponent(name) + "=([^;]+)")) ? decodeURIComponent(matches[1]) : false;
}

// Delete cookie
// Deletes all types of cookies
Util.deleteCookie = function(name, _options) {

	var path = false;

	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "path"	: path	= _options[_argument]; break;
			}

		}
	}

	// clear all references
	if(obj(window.sessionStorage)) {
		window.sessionStorage.removeItem(name);
	}
	if(obj(window.localStorage)) {
		window.localStorage.removeItem(name);
	}

	// create correct path value
	if(str(path)) {
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
			return (typeof(mem[ref][name]) != "undefined") ? mem[ref][name] : false;
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
	if(obj(_options)) {
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
				classname = classname.replace(/\b[a-zA-Z_]+\:[\?\=\w\/\\#~\:\.\,\+\&\%\@\!\-]+\b/g, "").replace(/[ ]{2,4}/g, " ");
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

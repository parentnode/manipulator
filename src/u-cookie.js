// Save cookie
// Session-cookie as default - set keep for extended validity
Util.saveCookie = function(name, value, options) {

	expiry = false;
	path = false;

	// additional info passed to function as JSON object
	if(typeof(options) == "object") {
		var argument;
		for(argument in options) {

			switch(argument) {
				case "expiry"	: expiry	= (typeof(options[argument]) == "string" ? options[argument] : "Mon, 04-Apr-2020 05:00:00 GMT"); break;
				case "path"		: path		= options[argument]; break;
			}

		}
	}

	document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) +";" + (path ? "path="+path+";" : "") + (expiry ? "expires="+expiry+";" : "")
}

// Get cookie
Util.getCookie = function(name) {
	var matches;
	return (matches = document.cookie.match(encodeURIComponent(name) + "=([^;]+)")) ? decodeURIComponent(matches[1]) : false;
}
// Delete cookie
Util.deleteCookie = function(name, options) {
	path = false;

	// additional info passed to function as JSON object
	if(typeof(options) == "object") {
		var argument;
		for(argument in options) {

			switch(argument) {
				case "path"	: path	= options[argument]; break;
			}

		}
	}

	document.cookie = encodeURIComponent(name) + "=;" + (path ? "path="+path+";" : "") + "expires=Thu, 01-Jan-70 00:00:01 GMT";
}


// Node cookies
Util.saveNodeCookie = function(node, name, value) {

	var ref = u.cookieReference(node);
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


Util.getNodeCookie = function(node, name) {

	var ref = u.cookieReference(node);
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

Util.deleteNodeCookie = function(node, name) {

	var ref = u.cookieReference(node);
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
Util.cookieReference = function(node) {
	var ref;

	if(node.id) {
		ref = node.nodeName + "#" + node.id;
	}
	else {
		var id_node = node;
		while(!id_node.id) {
			id_node = id_node.parentNode;
		}

		if(id_node.id) {
			ref = id_node.nodeName + "#"+id_node.id + " " + (node.name ? (node.nodeName + "["+node.name+"]") : (node.className ? (node.nodeName+"."+node.className) : node.nodeName));
		}
	}

	return ref;
}

// default debug is console
u.bug_console_only = true;

// test urls
Util.debugURL = function(url) {
	if(u.bug_force) {
		return true;
	}
	return document.domain.match(/(\.local|\.proxy)$/);
}

// identify node
Util.nodeId = function(node, include_path) {
	console.log("Util.nodeId IS DEPRECATED. Use commas in u.bug in stead.");
	console.log(arguments.callee.caller);
	try {
		if(!include_path) {
			return node.id ? node.nodeName+"#"+node.id : (node.className ? node.nodeName+"."+node.className : (node.name ? node.nodeName + "["+node.name+"]" : node.nodeName));
		}
		else {
			if(node.parentNode && node.parentNode.nodeName != "HTML") {
				return u.nodeId(node.parentNode, include_path) + "->" + u.nodeId(node);
			}
			else {
				return u.nodeId(node);
			}
		}
	}
	catch(exception) {
		u.exception("u.nodeId", arguments, exception);
	}
	return "Unindentifiable node!";
}



Util.exception = function(name, _arguments, _exception) {

	u.bug("Exception in: " + name + " (" + _exception + ")");
	console.error(_exception);
	u.bug("Invoked with arguments:");
	console.log(_arguments);

	// u.bug("Called from:");
	//
	// // does caller has name
	// if(_arguments.callee.caller.name) {
	// 	u.bug("arguments.callee.caller.name:" + _arguments.callee.caller.name)
	// }
	// // show a part of the caller function code
	// else {
	// 	u.bug("arguments.callee.caller:" + _arguments.callee.caller.toString().substring(0, 250));
	// }
}


// write output to screen
Util.bug = function() {
	if(u.debugURL()) {

		if(!u.bug_console_only) {

			var i, message;

			// also output console if available (but not only in console)
			if(obj(console)) {
				for(i = 0; i < arguments.length; i++) {
					if(arguments[i] || typeof(arguments[i]) == "undefined") {
						// console.trace();
						console.log(arguments[i]);
					}
				}
			}

			// TODO move to separate function
			var option, options = new Array([0, "auto", "auto", 0], [0, 0, "auto", "auto"], ["auto", 0, 0, "auto"], ["auto", "auto", 0, 0]);

			var corner = u.bug_corner ? u.bug_corner : 0;
			var color = u.bug_color ? u.bug_color : "black";

			
			option = options[corner];

			if(!document.getElementById("debug_id_"+corner)) {
				var d_target = u.ae(document.body, "div", {"class":"debug_"+corner, "id":"debug_id_"+corner});
				d_target.style.position = u.bug_position ? u.bug_position : "absolute";
				d_target.style.zIndex = 16000;
				d_target.style.top = option[0];
				d_target.style.right = option[1];
				d_target.style.bottom = option[2];
				d_target.style.left = option[3];
				d_target.style.backgroundColor = u.bug_bg ? u.bug_bg : "#ffffff";
				d_target.style.color = "#000000";
				d_target.style.fontSize = "11px";
				d_target.style.lineHeight = "11px";
				d_target.style.textAlign = "left";
				if(d_target.style.maxWidth) {
					d_target.style.maxWidth = u.bug_max_width ? u.bug_max_width+"px" : "auto";
				}
				d_target.style.padding = "2px 3px";
			}

			for(i = 0; i < arguments.length; i++) {

				if(arguments[i] === undefined) {
					message = "undefined";
				}
				else if(!str(arguments[i]) && fun(arguments[i].toString)) {
					message = arguments[i].toString();
				}
				else {
					message = arguments[i];
				}

				var debug_div = document.getElementById("debug_id_"+corner);
				message = message ? message.replace(/\>/g, "&gt;").replace(/\</g, "&lt;").replace(/&lt;br&gt;/g, "<br>") : "Util.bug with no message?";
				u.ae(debug_div, "div", {"style":"color: " + color, "html": message});

			}

		}
		else if(typeof(console) !== "undefined" && obj(console)) {

			var i;
			for(i = 0; i < arguments.length; i++) {
				console.log(arguments[i]);
			}
		}
	}
}


Util.xInObject = function(object, _options) {
	if(u.debugURL()) {

		var return_string = false;
		var explore_objects = false;


		// additional info passed to function as JSON object
		if(obj(_options)) {
			var _argument;
			for(_argument in _options) {

				switch(_argument) {
					case "return"     : return_string               = _options[_argument]; break;
					case "objects"    : explore_objects             = _options[_argument]; break;
				}
			}
		}


		var x, s = "--- start object ---\n";
		for(x in object) {

			if(explore_objects && object[x] && obj(object[x]) && !str(object[x].nodeName)) {
				s += x + "=" + object[x]+" => \n";
				s += u.xInObject(object[x], true);
			}
			else if(object[x] && obj(object[x]) && str(object[x].nodeName)) {
				s += x + "=" + object[x]+" -> " + u.nodeId(object[x], 1) + "\n";
			}
			else if(object[x] && fun(object[x])) {
				s += x + "=function\n";
			}
			else {
				s += x + "=" + object[x]+"\n";
			}

		}
		s += "--- end object ---\n";

		if(return_string) {
			return s;
		}
		else {
			u.bug(s);
		}

	}
}

// test urls
Util.debugURL = function(url) {
	if(u.bug_force) {
		return true;
	}
	return document.domain.match(/.local$/);
}
// identify node
Util.nodeId = function(node, include_path) {
	try {
	// if(!node) {
	// 	u.bug("Not a node:" + node + " - called from: "+arguments.callee.caller)
	// 	return "Unindentifiable node!";
	// }

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

//		u.bug("Exception ("+exception+") in u.nodeId("+node+"), called from: "+arguments.callee.caller);
	}
	return "Unindentifiable node!";
}



Util.exception = function(name, arguments, exception) {

	u.bug("Exception in: " + name + " (" + exception + ")");
	u.bug("Invoked with arguments:");
	u.xInObject(arguments);

	u.bug("Called from:");

	// does caller has name
	if(arguments.callee.caller.name) {
		u.bug("arguments.callee.caller.name:" + arguments.callee.caller.name)
	}
	// show a part of the caller function code
	else {
		u.bug("arguments.callee.caller:" + arguments.callee.caller.toString().substring(0, 250));
	}


// // 	u.bug("arguments.callee.caller.name:" + arguments.callee.caller.name);
// // 	u.bug("arguments.callee.name:" + arguments.callee.name);
// // 	u.bug("arguments.callee:" + arguments.callee);
// // 	u.bug("arguments.callee.caller:" + arguments.callee.caller);
// //
// // //	arguments
// // 	u.xInObject(arguments);
// //
// // 	u.bug("Exception ("+exception+") in "+_in);
//
// 	var x;
// 	for(x in regarding) {
// 		if(x == "node") {
// 			u.bug("node:" + (typeof(node.nodeName) ? u.nodeId(regarding[x], 1) : "Unindentifiable node:" + regarding[x]));
// 		}
// 		else {
// 			if(typeof(regarding[x]) == "object") {
// 				u.bug(x+":");
// 				u.xInObject(regarding[x]);
// 			}
// 			else {
// 				u.bug(x+"="+regarding[x]);
// 			}
// 		}
// 	}
// 	u.bug("Called from: "+_from);

}


// exception explorer
Util.exception2 = function(_in, _from, exception, regarding) {

	u.bug("Exception ("+exception+") in "+_in);

	var x;
	for(x in regarding) {
		if(x == "node") {
			u.bug("node:" + (typeof(node.nodeName) ? u.nodeId(regarding[x], 1) : "Unindentifiable node:" + regarding[x]));
		}
		else {
			if(typeof(regarding[x]) == "object") {
				u.bug(x+":");
				u.xInObject(regarding[x]);
			}
			else {
				u.bug(x+"="+regarding[x]);
			}
		}
	}
	u.bug("Called from: "+_from);

}

// write output to screen
Util.bug = function(message, corner, color) {
	if(u.debugURL()) {

		if(!u.bug_console_only) {
			var option, options = new Array([0, "auto", "auto", 0], [0, 0, "auto", "auto"], ["auto", 0, 0, "auto"], ["auto", "auto", 0, 0]);
			if(isNaN(corner)) {
				color = corner;
				corner = 0;
			}
			if(typeof(color) != "string") {
				color = "black";
			}
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
				d_target.style.textAlign = "left";
				if(d_target.style.maxWidth) {
					d_target.style.maxWidth = u.bug_max_width ? u.bug_max_width+"px" : "auto";
				}
				d_target.style.padding = "3px";
			}

			if(typeof(message) != "string") {
				message = message.toString();
			}

			var debug_div = document.getElementById("debug_id_"+corner);
			message = message ? message.replace(/\>/g, "&gt;").replace(/\</g, "&lt;").replace(/&lt;br&gt;/g, "<br>") : "Util.bug with no message?";
			u.ae(debug_div, "div", {"style":"color: " + color, "html": message});
		}
		if(typeof(console) == "object") {
			console.log(message);
		}
	}
}


Util.xInObject = function(object, return_string) {
	if(u.debugURL()) {

		var x, s = "--- start object ---\n";
		for(x in object) {

		//	u.bug(x + ":" + object[x] + ":" + typeof(object[x]));
			if(object[x] && typeof(object[x]) == "object" && typeof(object[x].nodeName) != "string") {
				s += x + "=" + object[x]+" => \n";
				s += u.xInObject(object[x], true);
			}
			else if(object[x] && typeof(object[x]) == "object" && typeof(object[x].nodeName) == "string") {
				s += x + "=" + object[x]+" -> " + u.nodeId(object[x], 1) + "\n";
			}
			else if(object[x] && typeof(object[x]) == "function") {
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


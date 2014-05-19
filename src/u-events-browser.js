u.e.addDOMReadyEvent = function(action) {

	// support for readyState AND not old IE
	if(document.readyState && document.addEventListener) {

		// DOM is already loaded
		// interactive is set too soon in IE, but check is required for webkit
		if((document.readyState == "interactive" && !u.browser("ie")) || document.readyState == "complete" || document.readyState == "loaded") {
//		if(document.readyState == "complete" || document.readyState == "loaded") {
			action();
		}
		else {
			// save action on window object
			var id = u.randomString();
			window["DOMReady_" + id] = action;

			eval('window["_DOMReady_' + id + '"] = function() {window["DOMReady_'+id+'"](); u.e.removeEvent(document, "DOMContentLoaded", window["_DOMReady_' + id + '"])}');
			u.e.addEvent(document, "DOMContentLoaded", window["_DOMReady_" + id]);
		}
	}
	// fallback, set onload event
	else {
		u.e.addOnloadEvent(action);
	}
}


u.e.addOnloadEvent = function(action) {

	// support for readyState, check if document is ready
	if(document.readyState && (document.readyState == "complete" || document.readyState == "loaded")) {
		action();
	}
	else {

		// save action on window object
		var id = u.randomString();
		window["Onload_" + id] = action;
		eval('window["_Onload_' + id + '"] = function() {window["Onload_'+id+'"](); u.e.removeEvent(window, "load", window["_Onload_' + id + '"])}');

		u.e.addEvent(window, "load", window["_Onload_" + id]);
	}
}



/**
* THEORETIC STUFF - might bring more overhead than benefits
*/

// probably just use on event listener and make it call all appropriate callbacks on registrered nodes
u.e.addResizeEvent = function(node, action) {

}
u.e.removeResizeEvent = function(node, action) {

}

// probably just use on event listener and make it call all appropriate callbacks on registrered nodes
u.e.addScrollEvent = function(node, action) {

}
u.e.removeScrollEvent = function(node, action) {

}


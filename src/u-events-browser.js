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
u.e.addWindowResizeEvent = function(node, action) {
	var id = u.randomString();
	u.ac(node, id);
	eval('window["_Onresize_' + id + '"] = function() {var node = u.qs(".'+id+'"); node._Onresize_'+id+' = '+action+'; node._Onresize_'+id+'();}');

	u.e.addEvent(window, "resize", window["_Onresize_" + id]);
	return id;
}
u.e.removeWindowResizeEvent = function(node, id) {
	u.rc(node, id);
	u.e.removeEvent(window, "resize", window["_Onresize_" + id]);
}

// create window scroll event listener with callback to node.action
// returns hidden mapping id, to enable event removal
u.e.addWindowScrollEvent = function(node, action) {
	var id = u.randomString();
	u.ac(node, id);
	eval('window["_Onscroll_' + id + '"] = function() {var node = u.qs(".'+id+'"); node._Onscroll_'+id+' = '+action+'; node._Onscroll_'+id+'();}');

	u.e.addEvent(window, "scroll", window["_Onscroll_" + id]);
	return id;
}
// Remove window scroll event from node based on hidden id
u.e.removeWindowScrollEvent = function(node, id) {
	u.rc(node, id);
	u.e.removeEvent(window, "scroll", window["_Onscroll_" + id]);
}



// Move event on window with rerouting of event
u.e.addWindowMoveEvent = function(node, action) {
	var id = u.randomString();
	u.ac(node, id);
	eval('window["_Onmove_' + id + '"] = function(event) {var node = u.qs(".'+id+'"); node._Onmove_'+id+' = '+action+'; node._Onmove_'+id+'(event);}');

	u.e.addMoveEvent(window, window["_Onmove_" + id]);
	return id;
}
u.e.removeWindowMoveEvent = function(node, id) {
	u.rc(node, id);
	u.e.removeMoveEvent(window, window["_Onmove_" + id]);
}


// End event on window with rerouting of event
u.e.addWindowEndEvent = function(node, action) {
	var id = u.randomString();
	u.ac(node, id);
	eval('window["_Onend_' + id + '"] = function(event) {var node = u.qs(".'+id+'"); node._Onend_'+id+' = '+action+'; node._Onend_'+id+'(event);}');

	u.e.addEndEvent(window, window["_Onend_" + id]);
	return id;
}
u.e.removeWindowEndEvent = function(node, id) {
	u.rc(node, id);
	u.e.removeEndEvent(window, window["_Onend_" + id]);
}


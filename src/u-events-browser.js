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


// Window events
u.e.addWindowEvent = function(node, type, action) {
	var id = u.randomString();

	window["_OnWindowEvent_node_"+ id] = node;
	// callback passed as function reference
	if(typeof(action) == "function") {
		eval('window["_OnWindowEvent_callback_' + id + '"] = function(event) {window["_OnWindowEvent_node_'+ id + '"]._OnWindowEvent_callback_'+id+' = '+action+'; window["_OnWindowEvent_node_'+ id + '"]._OnWindowEvent_callback_'+id+'(event);};');
	} 
	// callback passed as function name value
	else {
		eval('window["_OnWindowEvent_callback_' + id + '"] = function(event) {if(typeof(window["_OnWindowEvent_node_'+ id + '"]["'+action+'"]) == "function") {window["_OnWindowEvent_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addEvent(window, type, window["_OnWindowEvent_callback_" + id]);
	return id;
}
u.e.removeWindowEvent = function(node, type, id) {

	// remove event listener
	u.e.removeEvent(window, type, window["_OnWindowEvent_callback_"+id]);

	// remove callback references
//	window["_OnWindowEvent_node_"+id]["_OnWindowEvent_callback_"+id] = null;
	window["_OnWindowEvent_node_"+id] = null;
	window["_OnWindowEvent_callback_"+id] = null;
}



// Move event on window with rerouting of event
u.e.addWindowStartEvent = function(node, action) {
	var id = u.randomString();

	window["_Onstart_node_"+ id] = node;
	// callback passed as function reference
	if(typeof(action) == "function") {
		eval('window["_Onstart_callback_' + id + '"] = function(event) {window["_Onstart_node_'+ id + '"]._Onstart_callback_'+id+' = '+action+'; window["_Onstart_node_'+ id + '"]._Onstart_callback_'+id+'(event);};');
	} 
	// callback passed as function name value
	else {
		eval('window["_Onstart_callback_' + id + '"] = function(event) {if(typeof(window["_Onstart_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onstart_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addStartEvent(window, window["_Onstart_callback_" + id]);
	return id;
}
u.e.removeWindowStartEvent = function(node, id) {

	// remove event listener
	u.e.removeStartEvent(window, window["_Onstart_callback_"+id]);

	// remove callback references
	window["_Onstart_node_"+id]["_Onstart_callback_"+id] = null;
	window["_Onstart_node_"+id] = null;
	window["_Onstart_callback_"+id] = null;
}


// Move event on window with rerouting of event
u.e.addWindowMoveEvent = function(node, action) {
	var id = u.randomString();

	window["_Onmove_node_"+ id] = node;
	// callback passed as function reference
	if(typeof(action) == "function") {
		eval('window["_Onmove_callback_' + id + '"] = function(event) {window["_Onmove_node_'+ id + '"]._Onmove_callback_'+id+' = '+action+'; window["_Onmove_node_'+ id + '"]._Onmove_callback_'+id+'(event);};');
	} 
	// callback passed as function name value
	else {
		eval('window["_Onmove_callback_' + id + '"] = function(event) {if(typeof(window["_Onmove_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onmove_node_'+id+'"]["'+action+'"](event);}};');
	}

	// add event listener
	u.e.addMoveEvent(window, window["_Onmove_callback_" + id]);
	return id;
}
u.e.removeWindowMoveEvent = function(node, id) {

	// remove event listener
	u.e.removeMoveEvent(window, window["_Onmove_callback_" + id]);

	// remove callback references
	window["_Onmove_node_"+ id]["_Onmove_callback_"+id] = null;
	window["_Onmove_node_"+ id] = null;
	window["_Onmove_callback_"+ id] = null;
}


// End event on window with rerouting of event
u.e.addWindowEndEvent = function(node, action) {
	var id = u.randomString();

	window["_Onend_node_"+ id] = node;
	// callback passed as function reference
	if(typeof(action) == "function") {
		eval('window["_Onend_callback_' + id + '"] = function(event) {window["_Onend_node_'+ id + '"]._Onend_callback_'+id+' = '+action+'; window["_Onend_node_'+ id + '"]._Onend_callback_'+id+'(event);};');
	} 
	// callback passed as function name value
	else {
		eval('window["_Onend_callback_' + id + '"] = function(event) {if(typeof(window["_Onend_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onend_node_'+id+'"]["'+action+'"](event);}};');
	}

	// add event listener
	u.e.addEndEvent(window, window["_Onend_callback_" + id]);
	return id;
}
u.e.removeWindowEndEvent = function(node, id) {

	// remove event listener
	u.e.removeEndEvent(window, window["_Onend_callback_" + id]);

	// remove callback references
	window["_Onend_node_"+ id]["_Onend_callback_"+id] = null;
	window["_Onend_node_"+ id] = null;
	window["_Onend_callback_"+ id] = null;
}




/**
* THEORETIC STUFF - Ready to be deprecated in favor of plain u.e.addWindowEvent
*/

// probably just use on event listener and make it call all appropriate callbacks on registrered nodes
u.e.addWindowResizeEvent = function(node, action) {
	var id = u.randomString();

	window["_Onresize_node_"+ id] = node;
	// callback passed as function reference
	if(typeof(action) == "function") {
		eval('window["_Onresize_callback_' + id + '"] = function(event) {window["_Onresize_node_'+ id + '"]._Onresize_callback_'+id+' = '+action+'; window["_Onresize_node_'+ id + '"]._Onresize_callback_'+id+'(event);};');
	} 
	// callback passed as function name value
	else {
		eval('window["_Onresize_callback_' + id + '"] = function(event) {if(typeof(window["_Onresize_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onresize_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addEvent(window, "resize", window["_Onresize_callback_" + id]);
	return id;
}
u.e.removeWindowResizeEvent = function(node, id) {

	// remove event listener
	u.e.removeEvent(window, "resize", window["_Onresize_callback_"+id]);

	// remove callback references
	window["_Onresize_node_"+id]["_Onresize_callback_"+id] = null;
	window["_Onresize_node_"+id] = null;
	window["_Onresize_callback_"+id] = null;
}

// create window scroll event listener with callback to node
// returns hidden mapping id, to enable event removal
u.e.addWindowScrollEvent = function(node, action) {
	var id = u.randomString();

	window["_Onscroll_node_"+ id] = node;
	// callback passed as function reference
	if(typeof(action) == "function") {
		eval('window["_Onscroll_callback_' + id + '"] = function(event) {window["_Onscroll_node_'+ id + '"]._Onscroll_callback_'+id+' = '+action+'; window["_Onscroll_node_'+ id + '"]._Onscroll_callback_'+id+'(event);};');
	} 
	// callback passed as function name value
	else {
		eval('window["_Onscroll_callback_' + id + '"] = function(event) {if(typeof(window["_Onscroll_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onscroll_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addEvent(window, "scroll", window["_Onscroll_callback_" + id]);
	return id;
}
// Remove window scroll event from node based on hidden id
u.e.removeWindowScrollEvent = function(node, id) {

	// remove event listener
	u.e.removeEvent(window, "scroll", window["_Onscroll_callback_"+id]);

	// remove callback references
	window["_Onscroll_node_"+id]["_Onscroll_callback_"+id] = null;
	window["_Onscroll_node_"+id] = null;
	window["_Onscroll_callback_"+id] = null;
}


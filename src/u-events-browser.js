u.e.addDOMReadyEvent = function(action) {
	// u.bug("u.e.addDOMReadyEvent", action);

	// support for readyState AND not old IE
	if(document.readyState && document.addEventListener) {

		// DOM is already loaded
		// interactive is set too soon in IE, but check is required for webkit
		if((document.readyState == "interactive" && !u.browser("ie")) || document.readyState == "complete" || document.readyState == "loaded") {
			action();
		}
		else {
			// save action on window object
			var id = u.randomString();
			window["_DOMReady_" + id] = {
				id: id,
				action: action,
				callback: function(event) {
					if(fun(this.action)) {
						this.action.bind(window)(event);
					}
					else if(fun(this[this.action])){
						this[this.action].bind(window)(event);
					}
 
 					u.e.removeEvent(document, "DOMContentLoaded", window["_DOMReady_" + this.id].eventCallback); 
					delete window["_DOMReady_" + this.id];
 
				}
			}
			eval('window["_DOMReady_' + id + '"].eventCallback = function() {window["_DOMReady_'+id+'"].callback(event);}');
			u.e.addEvent(document, "DOMContentLoaded", window["_DOMReady_" + id].eventCallback);
		}
	}
	// fallback, set onload event
	else {
		u.e.addOnloadEvent(action);
	}
}


u.e.addOnloadEvent = function(action) {
	// u.bug("u.e.addOnloadEvent", action);

	// support for readyState, check if document is ready
	if(document.readyState && (document.readyState == "complete" || document.readyState == "loaded")) {
		action();
	}
	else {

		// save action on window object
		var id = u.randomString();

		window["_Onload_" + id] = {
			id: id,
			action: action,
			callback: function(event) {
				if(fun(this.action)) {
					this.action.bind(window)(event);
				}
				else if(fun(this[this.action])){
					this[this.action].bind(window)(event);
				}

				u.e.removeEvent(document, "load", window["_Onload_" + this.id].eventCallback); 
				delete window["_Onload_" + this.id];

			}
		}
		eval('window["_Onload_' + id + '"].eventCallback = function() {u.bug("load");window["_Onload_'+id+'"].callback(event);}');
		u.e.addEvent(window, "load", window["_Onload_" + id].eventCallback);
	}
}


// Window events
u.e.addWindowEvent = function(node, type, action) {
	var id = u.randomString();
	// u.bug("addWindowEvent", node, id, type, action);

	window["_OnWindowEvent_"+ id] = {
		id: id,
		node: node,
		type: type,
		action: action,
		callback: function(event) {
			if(fun(this.action)) {
				this.action.bind(this.node)(event);
			}
			else if(fun(this[this.action])){
				this[this.action](event);
			}
		}
	};

	eval('window["_OnWindowEvent_' + id + '"].eventCallback = function(event) {window["_OnWindowEvent_'+ id + '"].callback(event);}');
	u.e.addEvent(window, type, window["_OnWindowEvent_" + id].eventCallback);

	return id;
}
u.e.removeWindowEvent = function(id) {

	if(window["_OnWindowEvent_" + id]) {
		// remove event listener
		u.e.removeEvent(window, window["_OnWindowEvent_"+id].type, window["_OnWindowEvent_"+id].eventCallback);

		// remove callback references
		delete window["_OnWindowEvent_"+id];
	}

}


// Move event on window with rerouting of event
u.e.addWindowStartEvent = function(node, action) {
	var id = u.randomString();

	window["_OnWindowStartEvent_"+ id] = {
		id: id,
		node: node,
		action: action,
		callback: function(event) {
			if(fun(this.action)) {
				this.action.bind(this.node)(event);
			}
			else if(fun(this[this.action])){
				this[this.action](event);
			}
		}
	};

	eval('window["_OnWindowStartEvent_' + id + '"].eventCallback = function(event) {window["_OnWindowStartEvent_'+ id + '"].callback(event);}');
	u.e.addStartEvent(window, window["_OnWindowStartEvent_" + id].eventCallback);

	return id;
}
u.e.removeWindowStartEvent = function(id) {

	if(window["_OnWindowStartEvent_" + id]) {
		// remove event listener
		u.e.removeStartEvent(window, window["_OnWindowStartEvent_"+id].eventCallback);

		// remove callback references
		delete window["_OnWindowStartEvent_"+id];
	}

}


// Move event on window with rerouting of event
u.e.addWindowMoveEvent = function(node, action) {
	var id = u.randomString();

	window["_OnWindowMoveEvent_"+ id] = {
		id: id,
		node: node,
		action: action,
		callback: function(event) {
			if(fun(this.action)) {
				this.action.bind(this.node)(event);
			}
			else if(fun(this[this.action])){
				this[this.action](event);
			}
		}
	};

	eval('window["_OnWindowMoveEvent_' + id + '"].eventCallback = function(event) {window["_OnWindowMoveEvent_'+ id + '"].callback(event);}');
	u.e.addMoveEvent(window, type, window["_OnWindowMoveEvent_" + id].eventCallback);

	return id;
}
u.e.removeWindowMoveEvent = function(id) {

	if(window["_OnWindowMoveEvent_" + id]) {
		// remove event listener
		u.e.removeMoveEvent(window, window["_OnWindowMoveEvent_"+id].eventCallback);

		// remove callback references
		delete window["_OnWindowMoveEvent_"+id];
	}

}


// End event on window with rerouting of event
u.e.addWindowEndEvent = function(node, action) {
	var id = u.randomString();

	window["_OnWindowEndEvent_"+ id] = {
		id: id,
		node: node,
		action: action,
		callback: function(event) {

			if(fun(this.action)) {
				this.action.bind(this.node)(event);
			}
			else if(fun(this[this.action])){
				this[this.action](event);
			}
		}
	};

	eval('window["_OnWindowEndEvent_' + id + '"].eventCallback = function(event) {window["_OnWindowEndEvent_'+ id + '"].callback(event);}');
	u.e.addEndEvent(window, window["_OnWindowEndEvent_" + id].eventCallback);

	return id;
}
u.e.removeWindowEndEvent = function(id) {

	if(window["_OnWindowEndEvent_" + id]) {
		// remove event listener
		u.e.removeEndEvent(window, window["_OnWindowEndEvent_" + id].eventCallback);

		delete window["_OnWindowEndEvent_"+id];
	}

}

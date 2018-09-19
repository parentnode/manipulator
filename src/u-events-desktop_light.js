// IE specific event forwarder
// IE sends all event to the window object - these functions make sure the events return to element in a w3c style

if(document.all && document.addEventListener == undefined) {

//	alert("fallback events")

	// create window control array to store event, element and action information
	window.attachedEvents = {};

	// create window event handler to handle event forwarding
	window.eventHandler = function(eid) {
//		alert("event occured")
		var element, i;
//		u.xInObject(window.event);

		if(eid != "window") {
			element = u.ge("eid:"+eid);
		}
		else {
			element = window;
		}

//		u.bug("handle event:" + u.nodeId(element) + ":" + window.event.type, "red");
		// create fake element, because window.event cannot be modified
		// update event with target attribute
		var win_event = new Object();
		for(x in window.event) {
			win_event[x] = window.event[x];
		}
//		window.event.target = element;
		win_event.target = element;
		win_event.currentTarget = element;
//		u.xInObject(win_event);
//		u.bug("window.event.timeStamp a" + win_event.timeStamp)

//		window.event.timeStamp = 100; //new Date().getTime();
		win_event.timeStamp = new Date().getTime();
//		u.bug("window.event.timeStamp b" + win_event.timeStamp)

		// is all information available to execute event handling?
		if(element && eid && window.attachedEvents[eid] && window.attachedEvents[eid][window.event.type]) {

			// loop through event callbacks
			var i, attachedAction;
			for(i = 0; i < window.attachedEvents[eid][window.event.type].length; i++) {
				attachedAction = window.attachedEvents[eid][window.event.type][i];

//				u.bug("execute:" + u.nodeId(element) + ":" + attachedAction.toString().substring(0, 40))

				// add function to element, to achieve "this" context
				element.ie_event_action = attachedAction;
				// execute function, sending modified event
//				element.ie_event_action(window.event);
				element.ie_event_action(win_event);
			}

		}
		return;

	}



	// set event preferences to strictly mouse
	u.e.event_pref = "mouse";
	u.e.event_support = "mouse";

	// kill the event in the IE way
	u.e.kill = function(event) {

//		u.bug("kill:" + event);

		if(event) {
			event.cancelBubble = true;
			event.returnValue = false;
		}
	}

	/**
	* Add event handler to element - IE style
	*
	* @param HTML node e - Element to attach event to
	* @param String type - Event type
	* @param function action - Function to execute
	*/
	u.e.addEvent = function(node, type, action) {

//		u.bug("add event:" + u.nodeId(node) + ":" + type + ":" + action.toString().substring(0, 30) + ", " + typeof(node) + ", " + node.getElementById)
//		u.xInObject(node);

		// adding eventlistener for objects (like the XMLHttpRequest)
		if(obj(node) && typeof(node.childNodes) == "undefined") {
			// simply hardcode events - it works further back browser wise
			node["on"+ type] = action;
			return;
		}

		else if(node != window) {
			// check for existing event id (eid)
			var eid = u.cv(node, "eid");

			if(!eid) {
				// generate event id and add to element, to be able to map event and element later
				var eid = u.randomString();
				u.ac(node, "eid:"+eid)
			}
		}
		else {
			eid = "window";
		}


		// store type and action for given eid 
		if(!window.attachedEvents[eid]) {
			window.attachedEvents[eid] = {};
		}
		if(!window.attachedEvents[eid][type]) {
			window.attachedEvents[eid][type] = new Array();
		}

		// only add one event handler pr. event type
		if(window.attachedEvents[eid][type].length == 0) {
			// create callback function for node
			eval('node._'+type+'eventhandler = function() {window.eventHandler("'+eid+'")}');
			node.attachEvent("on"+type, node["_"+type+"eventhandler"]);
		}

		if(window.attachedEvents[eid][type].indexOf(action) == -1) {
//			u.bug("add for real:" + eid + ":" + type + ":" + u.nodeId(e))
			window.attachedEvents[eid][type].push(action);
		}
	}

	/**
	* Remove event handler from element
	*
	* @param HTML node e - Element to remove event from
	* @param String type - Event type
	* @param function action - Function to remove
*/
	u.e.removeEvent = function(node, type, action) {
//		u.bug("remove event:" + u.nodeId(node) + ":" + type)

		if(obj(node) && typeof(node.childNodes) == "undefined") {
			// simply hardcode events - it works further back browser wise
			node["on"+ type] = null;
			return;
		}
		// different approach needed for window element
		else if(node != window) {
			// check for existing event id (eid)
			var eid = u.cv(node, "eid");
		}
		else {
			eid = "window";
		}

		// remove event from event array
		// if event type exists for element
		if(eid && window.attachedEvents[eid] && window.attachedEvents[eid][type]) {

			// look for action
			for(i in window.attachedEvents[eid][type]) {
				if(window.attachedEvents[eid][type][i] == action) {
					// remove action from event extender
					window.attachedEvents[eid][type].splice(i,1);

					// no more attached events - detachEvent
					if(!window.attachedEvents[eid][type].length) {
						node.detachEvent("on"+type, node["_"+type+"eventhandler"])
					}
				}
			}

		}

	}
}

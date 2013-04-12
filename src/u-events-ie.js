// IE specific event forwarder
// IE sends all event to the window object - these functions make sure the events return to element in a w3c style

// create window control array to store event, element and action information
window.attachedEvents = new Array();

// create window event handler to handle event forwarding
window.eventHandler = function() {
	var element, eid, i;

	// loop through elements, trying to find element with event - end on HTML node
	element = window.event.srcElement;
	while(element && element.nodeName != "HTML") {

		// look for element event id (eid)
		eid = u.getIJ(element, "eid");

		// if key and element event info exists, execute event flow
		if(eid && window.attachedEvents[eid] && window.attachedEvents[eid][window.event.type]) {

//			u.bug(element + ":"+ eid + "::" + window.event.type + ":" + window.attachedEvents[eid])
//			u.bug("execute")

			// loop through event callbacks
			for(i in window.attachedEvents[eid][window.event.type]) {

				// fill out missing event values - IE does not have the same event values and some will be required elsewhere
				event.target = element;

				// add function to element, to achieve "this" context
				element.ie_event_action = window.attachedEvents[eid][window.event.type][i];

//				alert("action:" + element.ie_event_action)

				// execute function, sending modified event
				element.ie_event_action(event);
			}

		}

		// look at next element
		element = element.parentNode;
	}

}

// set event preferences to strictly mouse
u.e.event_pref = "mouse";

// kill the event in the IE way
u.e.kill = function(event) {
	if(event) {
		event.cancelBubble = true;
	}
}

/**
* Add event handler to element - IE style
*
* @param HTML node e - Element to attach event to
* @param String type - Event type
* @param function action - Function to execute
*/
u.e.addEvent = function(e, type, action) {

	// check for existing event id (eid)
	var eid = u.getIJ(e, "eid");

	if(!eid) {
		// generate event id and add to element, to be able to map event and element later
		var eid = u.randomKey();
		u.ac(e, "eid:"+eid)
	}

	// store type and action for given eid 
	if(!window.attachedEvents[eid]) {
		window.attachedEvents[eid] = new Array();
	}
	if(!window.attachedEvents[eid][type]) {
		window.attachedEvents[eid][type] = new Array();
	}
	window.attachedEvents[eid][type][window.attachedEvents[eid][type].length] = action;

	// attach event
	e.attachEvent("on"+type, window.eventHandler);
}

/**
* Remove event handler from element
*
* @param HTML node e - Element to remove event from
* @param String type - Event type
* @param function action - Function to remove
*/
u.e.removeEvent = function(e, type, action) {

	// check for existing event id (eid)
	var eid = u.getIJ(e, "eid");

	if(eid) {
		// if event type exists for element
		if(window.attachedEvents[eid] && window.attachedEvents[eid][type]) {

			// look for action
			for(i in window.attachedEvents[eid][type]) {
				if(window.attachedEvents[eid][window.event.type][i] == action) {

//					u.bug("a" + window.attachedEvents[eid][window.event.type]);
					
					// remove action from event extender
					window.attachedEvents[eid][window.event.type].splice(i,1);

//					u.bug("b" + window.attachedEvents[eid][window.event.type]);

				}
			}

		}
	}

	// detach event
	e.detachEvent("on"+type, action);
}
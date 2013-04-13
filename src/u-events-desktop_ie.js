// IE specific event forwarder
// IE sends all event to the window object - these functions make sure the events return to element in a w3c style
if(document.all) {

	// create window control array to store event, element and action information
	window.attachedEvents = new Array();

	// create window event handler to handle event forwarding
	window.eventHandler = function() {
		var element, eid, i;

		// loop through elements, trying to find element with event - end on HTML node
		element = window.event.srcElement;

//		u.bug(u.listObjectContent(window.event));
//		u.bug("handle event:" + u.nodeId(element) + ":" + window.event.type)

		while(element && element.nodeName != "HTML") {

			// look for element event id (eid)
			eid = u.getIJ(element, "eid");

			// if key and element event info exists, execute event flow
			if(eid && window.attachedEvents[eid] && window.attachedEvents[eid][window.event.type]) {

	//			u.bug("execute")

				// loop through event callbacks
//				for(i in window.attachedEvents[eid][window.event.type]) {
				var i, attachedAction;
				for(i = 0; attachedAction = window.attachedEvents[eid][window.event.type][i]; i++) {

					// fill out missing event values - IE does not have the same event values and some will be required elsewhere
					window.event.target = element;

					// add function to element, to achieve "this" context
					element.ie_event_action = attachedAction;
//					element.ie_event_action = window.attachedEvents[eid][window.event.type][i];


	//				u.bug(element + ":"+ eid + "::" + (element.id ? element.id : element.className) + ":" + window.event.type + ":" + window.attachedEvents[eid])
//					u.bug("action:" + element.ie_event_action)

					// execute function, sending modified event
					element.ie_event_action(window.event);
				}
				return;

			}

			// look at next element
			element = element.parentNode;
		}

//		u.bug("event:" + window.event.type)

		// maybe event is on window - then class identifier does not work
		if(window.attachedEvents["window"] && window.attachedEvents["window"][window.event.type]) {

//			u.bug("look on window")

			// loop through event callbacks
//			for(i in window.attachedEvents["window"][window.event.type]) {
			var i, attachedAction;
			for(i = 0; attachedAction = window.attachedEvents["window"][window.event.type][i]; i++) {

//				u.bug("i:" + i + ":" + typeof(window.attachedEvents["window"][window.event.type][i]))

				// fill out missing event values - IE does not have the same event values and some will be required elsewhere
				window.event.target = window;

				// add function to element, to achieve "this" context
				window.ie_event_action = attachedAction;
//				window.ie_event_action = window.attachedEvents["window"][window.event.type][i];


	//			u.bug(element + ":"+ eid + "::" + (element.id ? element.id : element.className) + ":" + window.event.type + ":" + window.attachedEvents[eid])
//				u.bug("event:" + window.event.type + ":action:" + window.ie_event_action)

				// execute function, sending modified event
				window.ie_event_action(window.event);
			}
			return;

		}

	}

	// set event preferences to strictly mouse
	u.e.event_pref = "mouse";

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
	u.e.addEvent = function(e, type, action) {

//		alert("add event:" + u.nodeId(e) + ":" + type + ":" + action)
	//	u.bug("add event:" + (e.id ? e.id : e.className) + ":" + type)

		if(e != window) {
			// check for existing event id (eid)
			var eid = u.getIJ(e, "eid");

			if(!eid) {
				// generate event id and add to element, to be able to map event and element later
				var eid = u.randomKey();
				u.ac(e, "eid:"+eid)
			}
		}
		else {
	//		u.bug("added to window:" + type)
			eid = "window";
		}

		// store type and action for given eid 
		if(!window.attachedEvents[eid]) {
			window.attachedEvents[eid] = new Array();
		}
		if(!window.attachedEvents[eid][type]) {
			window.attachedEvents[eid][type] = new Array();
		}
		if(window.attachedEvents[eid][type].indexOf(action) == -1) {
	//		u.bug("add for real")
			window.attachedEvents[eid][type][window.attachedEvents[eid][type].length] = action;
		}

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

//		u.bug("remove event:" + (e.id ? e.id : e.className) + ":" + type)


		// different approach needed for window element
		if(e != window) {
			// check for existing event id (eid)
			var eid = u.getIJ(e, "eid");
		}
		else {
			eid = "window";
		}

		// remove event from event array
		if(eid) {
			// if event type exists for element
			if(window.attachedEvents[eid] && window.attachedEvents[eid][type]) {

				// look for action
				for(i in window.attachedEvents[eid][type]) {
					if(window.attachedEvents[eid][type][i] == action) {
					
						// remove action from event extender
						window.attachedEvents[eid][type].splice(i,1);

	//					u.bug("b" + window.attachedEvents[eid][window.event.type]);

					}
				}

			}
		}

		// detach event
		e.detachEvent("on"+type, window.eventHandler);
	//	e.detachEvent("on"+type, action);

	}
}

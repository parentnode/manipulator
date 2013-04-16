/*
JSS events
click/tap
hold
dblclick/doubletap

Event that identifies jss event:
click/tap - up/end
hold - down/start
dblclick/doubletap - up/end

Parameters:
click/tap - element
hold - element
dblclick/doubletap - element

Notifications:
click/tap - clicked/tapped
hold - held
dblclick/doubletap - dblclicked/doubletapped

*/

/**
*	When using this on eventhandler functions "this" is the HTML element
*
*/
Util.Events = u.e = new function() {

	// auto-choose default event type
	this.event_pref = typeof(document.ontouchmove) == "undefined" ? "mouse" : "touch";

	/**
	* Kill event
	*/
	this.kill = function(event) {
		if(event) {
			event.preventDefault();
			event.stopPropagation()
		}
	}

	/**
	* Add event handler to element
	*
	* @param HTML node - Element to attach event to
	* @param String type - Event type
	* @param function action - Function to execute
	*/
	this.addEvent = function(node, type, action) {
		try {
			node.addEventListener(type, action, false);
		}
		catch(exception) {
			alert("exception in addEvent:" + node + "," + type + ":" + exception);
		}
	}

	/**
	* Remove event handler from element
	*
	* @param HTML node - Element to remove event from
	* @param String type - Event type
	* @param function action - Function to remove
	*/
	this.removeEvent = function(node, type, action) {
		try {
			node.removeEventListener(type, action, false);
		}
		catch(exception) {
			u.bug("exception in removeEvent:" + node + "," + type + ":" + exception);
		}
	}


	/**
	* Add mousedown/touchstart event
	* Shorthand function to ensure correct event type is added
	* @param e element to add event to
	* @param action Action to execute on event
	*/
	this.addStartEvent = this.addDownEvent = function(node, action) {
//		u.bug("addStartEvent")
		u.e.addEvent(node, (this.event_pref == "touch" ? "touchstart" : "mousedown"), action);
	}

	this.removeStartEvent = this.removeDownEvent = function(node, action) {
//		u.bug("removeStartEvent")
		u.e.removeEvent(node, (this.event_pref == "touch" ? "touchstart" : "mousedown"), action);
	}

	/**
	* Add mousemove/touchmove event
	* Shorthand function to ensure correct event type is added
	* @param e element to add event to
	* @param action Action to execute on event
	*/
	this.addMoveEvent = function(node, action) {
//		u.bug("addMoveEvent:" + e.nodeName)
		u.e.addEvent(node, (this.event_pref == "touch" ? "touchmove" : "mousemove"), action);
	}
	this.removeMoveEvent = function(node, action) {
//		u.bug("removeMoveEvent:" + e.nodeName)
		u.e.removeEvent(node, (this.event_pref == "touch" ? "touchmove" : "mousemove"), action);
	}

	/**
	* Add mouseup/touchend event
	* Shorthand function to ensure correct event type is added
	* @param e element to add event to
	* @param action Action to execute on event
	*/
	this.addEndEvent = this.addUpEvent = function(node, action) {
//		u.bug("addEndEvent:" + e.nodeName + ":" + (e.id ? e.id : e.className));// + ":" + action)
		u.e.addEvent(node, (this.event_pref == "touch" ? "touchend" : "mouseup"), action);

		// add additional mouseout handler if needed
		if(node.snapback && u.e.event_pref == "mouse") {
			u.e.addEvent(node, "mouseout", this._snapback);
		}

	}
	this.removeEndEvent = this.removeUpEvent = function(node, action) {
//		u.bug("removeEndEvent:" + e.nodeName)
		u.e.removeEvent(node, (this.event_pref == "touch" ? "touchend" : "mouseup"), action);

		// remove additional mouseout handler if needed
		if(node.snapback && u.e.event_pref == "mouse") {
			u.e.removeEvent(node, "mouseout", this._snapback);
		}

	}


	// reset events for click, hold and dblclick
	this.resetClickEvents = function(node) {
//		u.bug("resetClickEvents:" + u.nodeId(node));

		u.t.resetTimer(node.t_held);
		u.t.resetTimer(node.t_clicked);
	
		this.removeEvent(node, "mouseup", this._dblclicked);
		this.removeEvent(node, "touchend", this._dblclicked);

		this.removeEvent(node, "mousemove", this._clickCancel);
		this.removeEvent(node, "touchmove", this._clickCancel);

		this.removeEvent(node, "mousemove", this._move);
		this.removeEvent(node, "touchmove", this._move);
	}



	// reset events for node
	this.resetEvents = function(node) {
//		u.bug("resetEvents:" + u.nodeId(node))

		this.resetClickEvents(node);

		// is drag event enabled?
		if(typeof(this.resetDragEvents) == "function") {
			this.resetDragEvents(node);
		}
	}

	// reset events in nested elements
	// used to reset event on outer elements
	this.resetNestedEvents = function(node) {

		while(node && node.nodeName != "HTML") {
//			u.bug("reset nested:" + e.nodeName)
			this.resetEvents(node);
			node = node.parentNode;
		}

	}

	/**
	* Input started
	*
	* Attach additional events
	* Multiple event possible
	*/
	this._inputStart = function(event) {
//		u.bug("_inputStart:" + u.nodeId(this));

		// used to handle dblclick timeout event forwarding
		this.event_var = event;
//		alert("test:" + u.nodeId(this))
		this.input_timestamp = event.timeStamp;
//		alert("test2")

//		u.e.setEventPref(event.type);

//		u.bug(event + ":" + this.className);
	
		// get event positions relative to screen
		this.start_event_x = u.eventX(event) - u.scrollX();
		this.start_event_y = u.eventY(event) - u.scrollY();

		// reset speed
		this.current_xps = 0;
		this.current_yps = 0;

		// reset swipe detections
		this.swiped = false;


//		u.e.kill(event);

//		u.bug(1, "start");
		
		// ordinary click events
//		u.bug(this.e_click)
		if(this.e_click || this.e_dblclick || this.e_hold) {
//			u.bug("click set:" + u.nodeId(this));


			// TODO: do we need to reset on mouseout??

			// only reset onmove if element is draggable
			var node = this;
			while(node) {
				if(node.e_drag || node.e_swipe) {
//					u.bug("move reset: drag or swipe on:" + u.nodeId(node) + ": add clickCancel on:" + u.nodeId(this));

					u.e.addMoveEvent(this, u.e._cancelClick);
					break;
//					node = false;
				}
				else {
					node = node.parentNode;
				}
			}

			// move callback - for custom handling of mousedown+move combo
			u.e.addMoveEvent(this, u.e._move);
			// execute on mouse up
			u.e.addEndEvent(this, u.e._dblclicked);
			
		}
		// listen for hold?
		if(this.e_hold) {
			this.t_held = u.t.setTimer(this, u.e._held, 750);
		}

		// drag enabled? (cannot co-exist with swipe)
		if(this.e_drag || this.e_swipe) {
//			u.bug("drag set" + this.nodeName)
			u.e.addMoveEvent(this, u.e._pick);
			u.e.addEndEvent(this, u.e._drop);
		}


		if(this.e_scroll) {
//			u.bug("drag set" + this.nodeName)
			u.e.addMoveEvent(this, u.e._scrollStart);
			u.e.addEndEvent(this, u.e._scrollEnd);
		}


		// callback TODO - what function name?
		if(typeof(this.inputStarted) == "function") {
			this.inputStarted(event);
		}


	}


	this._cancelClick = function(event) {
//		u.bug("_cancelClick:" + u.nodeId(this))

		u.e.resetClickEvents(this);

		// new event
		if(typeof(this.clickCancelled) == "function") {
			this.clickCancelled(event);
		}
	}

	this._move = function(event) {
		// new event
		if(typeof(this.moved) == "function") {
			this.moved(event);
		}
	}

	/**
	* Notifies:
	* element.held
	*/
	this.hold = function(node) {
		node.e_hold = true;
		u.e.addStartEvent(node, this._inputStart);
	}
	this._held = function(event) {
//		u.bug("_held:" + u.nodeId(this));

		// track event
		u.stats.event(this, "held");

		//remove event up/end
		u.e.resetNestedEvents(this);

		// notify held
		if(typeof(this.held) == "function") {
			this.held(event);
		}
	}

	/**
	* Notifies:
	* element.clicked
	*/
	this.click = this.tap = function(node) {
//		u.bug("set click:"+e.nodeName)
		node.e_click = true;
		u.e.addStartEvent(node, this._inputStart);
	}
	this._clicked = function(event) {
//		u.bug("_clicked:" + u.nodeId(this))


		// track event
		u.stats.event(this, "clicked");


		// remove up/end event
//		u.e.resetEvents(this);
		u.e.resetNestedEvents(this);

		// notify of click
		if(typeof(this.clicked) == "function") {
			this.clicked(event);
		}

	}

	/**
	* Notifies:
	* element.dblclicked
	*/
	this.dblclick = this.doubletap = function(node) {
		node.e_dblclick = true;
		u.e.addStartEvent(node, this._inputStart);
	}
	this._dblclicked = function(event) {
//		u.bug("_dblclicked:" + u.nodeId(this))

		// if valid click timer, treat as dblclick
		if(u.t.valid(this.t_clicked) && event) {


			// track event
			u.stats.event(this, "dblclicked");


			// remove up/end event
//			u.e.resetEvents(this);
			u.e.resetNestedEvents(this);

			// notify base
			if(typeof(this.dblclicked) == "function") {
				this.dblclicked(event);
			}
			return;
		}

		// no dbl-click event
		else if(!this.e_dblclick) {
			// rerouting event
			this._clicked = u.e._clicked;
			this._clicked(event);
		}
		// if no event, click timeout response
		else if(!event) {
			this._clicked = u.e._clicked;
			this._clicked(this.event_var);
		}
		// no valid timer, first click
		else {
			// set click timer, waiting for second click
			u.e.resetNestedEvents(this);
			this.t_clicked = u.t.setTimer(this, u.e._dblclicked, 400);
		}

	}


}

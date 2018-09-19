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

	// TODO: Wrap event_pref in function to be able to use library functions in event detection
	// now we can't use u.system because function is not declared before execution

//	alert("navigator.maxTouchPoints:" + navigator.maxTouchPoints + ", document.ontouchmove:" + document.ontouchmove + "," + 
	// auto-choose default event type

//	this.event_pref = typeof(document.ontouchmove) == "undefined" || (navigator.maxTouchPoints > 1) ? "mouse" : "touch";

	// Windows with touch screen has dual input and no event bubble between types
	// at this point we cannot support touch and mouse on windows platform

	// DEPRECATED - old event preference detection
	this.event_pref = typeof(document.ontouchmove) == "undefined" || (navigator.maxTouchPoints > 1 && navigator.userAgent.match(/Windows/i)) ? "mouse" : "touch";


	// theoretical support for dual input sources
	// TODO: in some rare edge cases Firefox on windows ontouchmove and onmousemove are both null but maxTouchPoints is 0.
	// In most cases this in-between state disappears after restarting the computer (maybe maxTouchPoints should not be used for this detection??)

	if(navigator.maxTouchPoints > 1) {

		if((typeof(document.ontouchmove) == "undefined" && typeof(document.onmousemove) == "undefined") || (document.ontouchmove === null && document.onmousemove === null)) {

			this.event_support = "multi";
		}

	}

	if(!this.event_support) {

		if(typeof(document.ontouchmove) == "undefined") {

			this.event_support = "mouse";

		}
		else {

			this.event_support = "touch";

		}

	}

	// console.log(this.event_support);

//	this.event_support = navigator.maxTouchPoints > 1 "multi" ? : (typeof(document.ontouchmove) == "undefined" ? "touch" : "mouse"));
//	this.event_pref = "touch";

	this.events = {
		"mouse": {
			"start":"mousedown",
			"move":"mousemove",
			"end":"mouseup",

			"over":"mouseover",
			"out":"mouseout"
			
		},
		"touch": {

			"start":"touchstart",
			"move":"touchmove",
			"end":"touchend",

			"over":"touchstart",
			"out":"touchend"
			
		}
	}

//	} = this.event_support == "touch" ? (this.event_support == "touch" ? "touchstart" : "mousedown")
//	alert("this.event_pref:" + this.event_pref)

	/**
	* Kill event
	*/
	this.kill = function(event) {
		if(event) {
			event.preventDefault();
			event.stopPropagation();
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
	* @param node element to add event to
	* @param action Action to execute on event
	*/
	this.addStartEvent = this.addDownEvent = function(node, action) {
//		u.bug("addStartEvent")
		if(this.event_support == "multi") {
//			u.bug("multi:" + this.events.mouse.start)
			u.e.addEvent(node, this.events.mouse.start, action);
			u.e.addEvent(node, this.events.touch.start, action);
		}
		else {
//			u.bug("single:" + this.events[this.event_support].start)
			u.e.addEvent(node, this.events[this.event_support].start, action);
			
		}
//		u.e.addEvent(node, (this.event_pref == "touch" ? "touchstart" : "mousedown"), action);
	}

	this.removeStartEvent = this.removeDownEvent = function(node, action) {
//		u.bug("removeStartEvent")

		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.start, action);
			u.e.removeEvent(node, this.events.touch.start, action);
		}
		else {
//			u.bug("single:" + this.events[this.event_support].start)
			u.e.removeEvent(node, this.events[this.event_support].start, action);
		
		}
//		u.e.removeEvent(node, (this.event_pref == "touch" ? "touchstart" : "mousedown"), action);
	}

	/**
	* Add mousemove/touchmove event
	* Shorthand function to ensure correct event type is added
	* @param node element to add event to
	* @param action Action to execute on event
	*/
	this.addMoveEvent = function(node, action) {
//		u.bug("addMoveEvent:" + u.nodeId(node) + ", " + (this.event_pref == "touch" ? "touchmove" : "mousemove"));

		if(this.event_support == "multi") {
//			u.bug("multi:" + this.events.mouse.start)
			u.e.addEvent(node, this.events.mouse.move, action);
			u.e.addEvent(node, this.events.touch.move, action);
		}
		else {
//			u.bug("single:" + this.events[this.event_support].start)
			u.e.addEvent(node, this.events[this.event_support].move, action);
			
		}

//		u.e.addEvent(node, (this.event_pref == "touch" ? "touchmove" : "mousemove"), action);
	}
	this.removeMoveEvent = function(node, action) {
//		u.bug("removeMoveEvent:" + e.nodeName)
		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.move, action);
			u.e.removeEvent(node, this.events.touch.move, action);
		}
		else {
//			u.bug("single:" + this.events[this.event_support].start)
			u.e.removeEvent(node, this.events[this.event_support].move, action);
		
		}

//		u.e.removeEvent(node, (this.event_pref == "touch" ? "touchmove" : "mousemove"), action);
	}

	/**
	* Add mouseup/touchend event
	* Shorthand function to ensure correct event type is added
	* @param node element to add event to
	* @param action Action to execute on event
	*/
	this.addEndEvent = this.addUpEvent = function(node, action) {
//		u.bug("addEndEvent:" + u.nodeId(node));// + ":" + action)

		if(this.event_support == "multi") {
//			u.bug("multi:" + this.events.mouse.start)
			u.e.addEvent(node, this.events.mouse.end, action);
			u.e.addEvent(node, this.events.touch.end, action);
		}
		else {
//			u.bug("single:" + this.events[this.event_support].start)
			u.e.addEvent(node, this.events[this.event_support].end, action);
			
		}
//		u.e.addEvent(node, (this.event_pref == "touch" ? "touchend" : "mouseup"), action);

		// add additional mouseout handler if needed
		// if(node.snapback && u.e.event_pref == "mouse") {
		// 	u.e.addEvent(node, "mouseout", this._snapback);
		// }

	}
	this.removeEndEvent = this.removeUpEvent = function(node, action) {
//		u.bug("removeEndEvent:" + e.nodeName)
//		u.e.removeEvent(node, (this.event_pref == "touch" ? "touchend" : "mouseup"), action);

		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.end, action);
			u.e.removeEvent(node, this.events.touch.end, action);
		}
		else {
//			u.bug("single:" + this.events[this.event_support].start)
			u.e.removeEvent(node, this.events[this.event_support].end, action);
		
		}

		// remove additional mouseout handler if needed
		// if(node.snapback && u.e.event_pref == "mouse") {
		// 	u.e.removeEvent(node, "mouseout", this._snapback);
		// }

	}


	/**
	* Add mouseover/touchstart event
	* Shorthand function to ensure correct event type is added
	* @param node element to add event to
	* @param action Action to execute on event
	*/
	this.addOverEvent = function(node, action) {
//		u.bug("addOverEvent:" + u.nodeId(node));

		if(this.event_support == "multi") {
			u.e.addEvent(node, this.events.mouse.over, action);
			u.e.addEvent(node, this.events.touch.over, action);
		}
		else {
			u.e.addEvent(node, this.events[this.event_support].over, action);
			
		}
	}
	this.removeOverEvent = function(node, action) {
//		u.bug("removeOverEvent:" + u.nodeId(node));
		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.over, action);
			u.e.removeEvent(node, this.events.touch.over, action);
		}
		else {
			u.e.removeEvent(node, this.events[this.event_support].over, action);
		}
	}


	/**
	* Add mouseover/touchstart event
	* Shorthand function to ensure correct event type is added
	* @param node element to add event to
	* @param action Action to execute on event
	*/
	this.addOutEvent = function(node, action) {
//		u.bug("addOutEvent:" + u.nodeId(node));

		if(this.event_support == "multi") {
			u.e.addEvent(node, this.events.mouse.out, action);
			u.e.addEvent(node, this.events.touch.out, action);
		}
		else {
			u.e.addEvent(node, this.events[this.event_support].out, action);
			
		}
	}
	this.removeOutEvent = function(node, action) {
//		u.bug("removeOutEvent:" + u.nodeId(node));
		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.out, action);
			u.e.removeEvent(node, this.events.touch.out, action);
		}
		else {
			u.e.removeEvent(node, this.events[this.event_support].out, action);
		}
	}


	// reset events for click, hold and dblclick
	this.resetClickEvents = function(node) {
		// u.bug("resetClickEvents:", node);

		u.t.resetTimer(node.t_held);
		u.t.resetTimer(node.t_clicked);
	
		this.removeEvent(node, "mouseup", this._dblclicked);
		this.removeEvent(node, "touchend", this._dblclicked);

		this.removeEvent(node, "mousemove", this._cancelClick);
		this.removeEvent(node, "touchmove", this._cancelClick);
		this.removeEvent(node, "mouseout", this._cancelClick);

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
//		u.bug("resetEvents:" + u.nodeId(node))

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
		// u.bug("_inputStart:", this);

//		u.xInObject(event);

		// used to handle dblclick timeout event forwarding
		this.event_var = event;
		this.input_timestamp = event.timeStamp;
	
	
		// get event positions relative to screen
		// this.start_event_x = u.eventX(event) - u.scrollX();
		// this.start_event_y = u.eventY(event) - u.scrollY();
		this.start_event_x = u.eventX(event);
		this.start_event_y = u.eventY(event);
//		u.bug("this.start_event_y:" + this.start_event_y)

		// reset speed
		this.current_xps = 0;
		this.current_yps = 0;

		// reset move calculation values
		this.move_timestamp = event.timeStamp;
		this.move_last_x = 0;
		this.move_last_y = 0;

		// keep track of moves after start event to cancel event more controlled (after a number of moves)
//		this._moves_cancel = 0;
//		u.bug("this._moves_counted:" + this._moves_counted);
//		this._moves_counted = 0;

		// reset swipe detections
		this.swiped = false;

		// ordinary click events
		if(this.e_click || this.e_dblclick || this.e_hold) {
//			u.bug("click set:" + u.nodeId(this));

			// mouseinput - only reset onmove if element is draggable
			if(event.type.match(/mouse/)) {
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

				// cancel click on mouseout for mouse events
				u.e.addEvent(this, "mouseout", u.e._cancelClick);
			}

			// cancel click on move for touch input as default
			else {
				u.e.addMoveEvent(this, u.e._cancelClick);
			}



			// move callback - for custom handling of mousedown+move combo
			u.e.addMoveEvent(this, u.e._move);

			// TODO: EXPERIMENTAL
			// cancel click on move for touch devices as default
			// if(u.e.event_pref == "touch") {
			// 	u.e.addMoveEvent(this, u.e._cancelClick);
			// }

			//
			// execute on mouse up
			u.e.addEndEvent(this, u.e._dblclicked);


			// reset events on mouseout
			// if(u.e.event_pref == "mouse") {
			// 	u.e.addEvent(this, "mouseout", u.e._cancelClick);
			// }
		}
		// listen for hold?
		if(this.e_hold) {
			this.t_held = u.t.setTimer(this, u.e._held, 750);

		}

		// drag enabled? (cannot co-exist with swipe)
		if(this.e_drag || this.e_swipe) {
//			u.bug("drag set" + this.nodeName)
			u.e.addMoveEvent(this, u.e._pick);
//			u.e.addEndEvent(this, u.e._drop);
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
		// u.bug("_cancelClick:", this);

		// use complete move since inputStart to determine whether to cancel click
		var offset_x = u.eventX(event) - this.start_event_x;
		var offset_y = u.eventY(event) - this.start_event_y;

		// should click be cancelled
		if(event.type.match(/mouseout/) || (event.type.match(/move/) && (Math.abs(offset_x) > 15 || Math.abs(offset_y) > 15))) {
//		if(event.type.match(/mouseout/) || this._moves_cancel > 5 || (event.type.match(/move/) && (Math.abs(offset_x) > 15 || Math.abs(offset_y) > 15))) {

			u.e.resetClickEvents(this);

			// new event
			if(typeof(this.clickCancelled) == "function") {
				this.clickCancelled(event);
			}

		}

		// count move events to cancel click appropriately
		// else if(event.type.match(/move/)) {
		//
		// 	this._moves_cancel++;
		// }

	}

	this._move = function(event) {
//		u.bug("_move:" + u.nodeId(this))
		// new event

		if(typeof(this.moved) == "function") {

			this.current_x = u.eventX(event) - this.start_event_x;
			this.current_y = u.eventY(event) - this.start_event_y;

			// calculate speed
			// current speed per second
			this.current_xps = Math.round(((this.current_x - this.move_last_x) / (event.timeStamp - this.move_timestamp)) * 1000);
			this.current_yps = Math.round(((this.current_y - this.move_last_y) / (event.timeStamp - this.move_timestamp)) * 1000);
		//	u.bug(this.current_x + ":" + this.move_last_x + ":" + event.timeStamp + ":" + this.move_timestamp)
		//	u.bug("this.current_xps:" + this.current_xps + " x " + "this.current_yps:" + this.current_yps)


			// remember current move time for next event
			this.move_timestamp = event.timeStamp;
			this.move_last_x = this.current_x;
			this.move_last_y = this.current_y;


			this.moved(event);
		}
	}

	/**
	* Notifies:
	* element.held
	*/
	this.hold = function(node, _options) {

		node.e_hold_options = _options ? _options : {};
		node.e_hold_options.eventAction = u.stringOr(node.e_hold_options.eventAction, "Held");

		node.e_hold = true;
		u.e.addStartEvent(node, this._inputStart);
	}
	this._held = function(event) {
//		u.bug("_held:" + u.nodeId(this));

		// track event
		this.e_hold_options.event = event;
		u.stats.event(this, this.e_hold_options);

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
	this.click = this.tap = function(node, _options) {
//		u.bug("set click:"+u.nodeId(node));

		node.e_click_options = _options ? _options : {};
		node.e_click_options.eventAction = u.stringOr(node.e_click_options.eventAction, "Clicked");

		node.e_click = true;
		u.e.addStartEvent(node, this._inputStart);
	}
	this._clicked = function(event) {
//		u.bug("_clicked:" + u.nodeId(this))

		// dblclick and hold event bubble to _clicked if they do not meet the requirement 
		// (holding for 750ms or clicking twice withing 400ms)
		if(this.e_click_options) {
			// track event
			this.e_click_options.event = event;
			u.stats.event(this, this.e_click_options);
		}

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
	this.dblclick = this.doubletap = function(node, _options) {

		node.e_dblclick_options = _options ? _options : {};
		node.e_dblclick_options.eventAction = u.stringOr(node.e_dblclick_options.eventAction, "DblClicked");

		node.e_dblclick = true;
		u.e.addStartEvent(node, this._inputStart);
	}
	this._dblclicked = function(event) {
		// u.bug("_dblclicked:",this, event.type);

		// if valid click timer, treat as dblclick
		if(u.t.valid(this.t_clicked) && event) {

			// track event
			this.e_dblclick_options.event = event;
			u.stats.event(this, this.e_dblclick_options);

			// remove up/end event
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
		else if(event.type == "timeout") {

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


	// enable true over / out callbacks
	// only makes over callback if node is not already hovered
	// only makes out callback if exit is not to child node
	this.hover = function(node, _options) {

		// default values
		node._hover_out_delay = 100;
		node._hover_over_delay = 0;
		node._callback_out = "out";
		node._callback_over = "over";


		// additional info passed to function as JSON object
		if(typeof(_options) == "object") {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "over"				: node._callback_over		= _options[argument]; break;
					case "out"				: node._callback_out		= _options[argument]; break;
					case "delay_over"		: node._hover_over_delay	= _options[argument]; break;
					case "delay"			: node._hover_out_delay		= _options[argument]; break;
				}
			}
		}

		node.e_hover = true;
		u.e.addOverEvent(node, this._over);
		u.e.addOutEvent(node, this._out);
	}

	// actual mouseover event - wait for delay, if any
	this._over = function(event) {
//		u.bug("_over:" + u.nodeId(this));

		u.t.resetTimer(this.t_out);

		// no delay
		if(!this._hover_over_delay) {
			u.e.__over.call(this, event);
		}
		// set wait delay
		else if(!u.t.valid(this.t_over)) {
			this.t_over = u.t.setTimer(this, u.e.__over, this._hover_over_delay, event);
		}
	}

	this.__over = function(event) {
//		u.bug("__over:" + u.nodeId(this));

		u.t.resetTimer(this.t_out);

		// only notify base when state changes
		if(!this.is_hovered) {
			this.is_hovered = true;

			// skip initial over delay while in hovered state
			u.e.removeOverEvent(this, u.e._over);
			u.e.addOverEvent(this, u.e.__over);

			
			// notify base (but only when state changes)
			if(typeof(this[this._callback_over]) == "function") {
				this[this._callback_over](event);
			}

		}

	}
	// actual mouseout event - wait for delay
	this._out = function(event) {
//		u.bug("_out:" + u.nodeId(this));

		u.t.resetTimer(this.t_over);
		u.t.resetTimer(this.t_out);

		// update out delay
		this.t_out = u.t.setTimer(this, u.e.__out, this._hover_out_delay, event);

	}
	// delayed out event with callback
	this.__out = function(event) {
//		u.bug("_out_is_real:" + u.nodeId(this));

		this.is_hovered = false;

		// restore event handlers
		u.e.removeOverEvent(this, u.e.__over);
		u.e.addOverEvent(this, u.e._over);

		// notify base
		if(typeof(this[this._callback_out]) == "function") {
			this[this._callback_out](event);
		}
		
	}
}

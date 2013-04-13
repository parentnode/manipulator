/*
JSS events
hold
click/tap
dblclick/doubletap
swipe
drag
pinch/zoom/rotate (later)

Event that identifies jss event:
hold - down/start
click/tap - up/end
dblclick/doubletap - up/end
swipe - move
drag - move
pinch/zoom/rotate - move

Parameters:
hold - element
click/tap - element
dblclick/doubletap - element
swipe - element, boundaries (target, array), strict
drag - element, boundaries (target, array), strict, snapback, processtime
pinch - element, max
zoom - element, min
rotate - element

Notifications:
hold - held
click/tap - clicked/tapped
dblclick/doubletap - dblclicked/doubletapped
swipe - picked,swipedleft,swipedright,swipedup,swipeddown,dropped
drag - picked, moved, dropped
pinch - pinched
zoom - zoomed
rotate - rotated










Calculate processtime based on element size


*/

/**
*	When using this on eventhandler functions "this" is the HTML element
*
*	e.start_drag_y - start coord for drag area
*	e.end_drag_y - end coord for drag area
*
*	e.start_input_y - start coord of touch input event
*
*	e.current_y - current coord of input
*	e.element_y - calculated new coord of element relative to input
*	e.offset_y - offset between events - to calcilated direction
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
	* @param HTML node e - Element to attach event to
	* @param String type - Event type
	* @param function action - Function to execute
	*/
	this.addEvent = function(e, type, action) {
		try {
			e.addEventListener(type, action, false);
		}
		catch(exception) {
			alert("exception in addEvent:" + e + "," + type + ":" + exception);
		}
	}

	/**
	* Remove event handler from element
	*
	* @param HTML node e - Element to remove event from
	* @param String type - Event type
	* @param function action - Function to remove
	*/
	this.removeEvent = function(e, type, action) {
		try {
			e.removeEventListener(type, action, false);
		}
		catch(exception) {
			u.bug("exception in removeEvent:" + e + "," + type + ":" + exception);
		}
	}


	/**
	* Add mousedown/touchstart event
	* Shorthand function to ensure correct event type is added
	* @param e element to add event to
	* @param action Action to execute on event
	*/
	this.addStartEvent = this.addDownEvent = function(e, action) {
//		u.bug("addStartEvent")
		u.e.addEvent(e, (this.event_pref == "touch" ? "touchstart" : "mousedown"), action);
	}

	this.removeStartEvent = this.removeDownEvent = function(e, action) {
//		u.bug("removeStartEvent")
		u.e.removeEvent(e, (this.event_pref == "touch" ? "touchstart" : "mousedown"), action);
	}

	/**
	* Add mousemove/touchmove event
	* Shorthand function to ensure correct event type is added
	* @param e element to add event to
	* @param action Action to execute on event
	*/
	this.addMoveEvent = function(e, action) {
//		u.bug("addMoveEvent:" + e.nodeName)
		u.e.addEvent(e, (this.event_pref == "touch" ? "touchmove" : "mousemove"), action);
	}
	this.removeMoveEvent = function(e, action) {
//		u.bug("removeMoveEvent:" + e.nodeName)
		u.e.removeEvent(e, (this.event_pref == "touch" ? "touchmove" : "mousemove"), action);
	}

	/**
	* Add mouseup/touchend event
	* Shorthand function to ensure correct event type is added
	* @param e element to add event to
	* @param action Action to execute on event
	*/
	this.addEndEvent = this.addUpEvent = function(e, action) {
//		u.bug("addEndEvent:" + e.nodeName + ":" + (e.id ? e.id : e.className));// + ":" + action)
		u.e.addEvent(e, (this.event_pref == "touch" ? "touchend" : "mouseup"), action);

		// add additional mouseout handler if needed
		if(e.snapback && u.e.event_pref == "mouse") {
			u.e.addEvent(e, "mouseout", this._snapback);
		}

	}
	this.removeEndEvent = this.removeUpEvent = function(e, action) {
//		u.bug("removeEndEvent:" + e.nodeName)
		u.e.removeEvent(e, (this.event_pref == "touch" ? "touchend" : "mouseup"), action);

		// add additional mouseout handler if needed
		if(e.snapback && u.e.event_pref == "mouse") {
			u.e.removeEvent(e, "mouseout", this._snapback);
		}

	}



	/**
	* Detect overlap between element and target
	* Element is using internal position values element_x and element_y, allowing to test overlap, before moving element
	*
	* Default allows for partial overlap
	* set strict = true for complete overlap
	*
	* return true if overlap is valid
	*/
	this.overlap = function(element, target, strict) {

		// if target is array of coordinates
		if(target.constructor.toString().match("Array")) {
			var target_start_x = Number(target[0]);
			var target_start_y = Number(target[1]);
			var target_end_x = Number(target[2]);
			var target_end_y = Number(target[3]);
		}
		// target is element
		else {
			var target_start_x = target.element_x ? target.element_x : 0;
			var target_start_y = target.element_y ? target.element_y : 0;
			var target_end_x = Number(target_start_x + target.offsetWidth);
			var target_end_y = Number(target_start_y + target.offsetHeight);
		}

		// element proporties
		var element_start_x = Number(element.element_x);
		var element_start_y = Number(element.element_y);
		var element_end_x = Number(element_start_x + element.offsetWidth);
		var element_end_y = Number(element_start_y + element.offsetHeight);

//		u.bug("esx: "+element_start_x+":esy: "+element_start_y+":eex: "+element_end_x+":eey: "+element_end_y);
//		u.bug("tsx: "+target_start_x+":tsy: "+target_start_y+":tex: "+target_end_x+":tey: "+target_end_y);

		// strict - check boundaries
		if(strict && element_start_x >= target_start_x && element_start_y >= target_start_y && element_end_x <= target_end_x && element_end_y <= target_end_y) {
			return true;
		}
		else if(strict) {
			return false;
		}
		// not strict - out of scope detection (much simpler algoritm)
		else if(element_end_x < target_start_x || element_start_x > target_end_x || element_end_y < target_start_y || element_start_y > target_end_y) {
			return false;
		}
		return true;
	}


	this.resetClickEvents = function(e) {
//		u.bug("reset click events:" + (e.id ? e.id : e.className));

		u.t.resetTimer(e.t_held);
		u.t.resetTimer(e.t_clicked);
	
		this.removeEvent(e, "mouseup", this._dblclicked);
		this.removeEvent(e, "touchend", this._dblclicked);

		this.removeEvent(e, "mousemove", this._clickCancel);
		this.removeEvent(e, "touchmove", this._clickCancel);

		this.removeEvent(e, "mousemove", this._move);
		this.removeEvent(e, "touchmove", this._move);
	}

	this.resetDragEvents = function(e) {
//		u.bug("reset drag events:" + (e.id ? e.id : e.className));

		this.removeEvent(e, "mousemove", this._pick);
		this.removeEvent(e, "touchmove", this._pick);

		this.removeEvent(e, "mousemove", this._drag);
		this.removeEvent(e, "touchmove", this._drag);

		this.removeEvent(e, "mouseup", this._drop);
		this.removeEvent(e, "touchend", this._drop);

		this.removeEvent(e, "mouseout", this._snapback);
		this.removeEvent(e, "mouseout", this._drop);



		this.removeEvent(e, "mousemove", this._scrollStart);
		this.removeEvent(e, "touchmove", this._scrollStart);
		this.removeEvent(e, "mousemove", this._scrolling);
		this.removeEvent(e, "touchmove", this._scrolling);
		this.removeEvent(e, "mouseup", this._scrollEnd);
		this.removeEvent(e, "touchend", this._scrollEnd);
		

	}

	this.resetEvents = function(e) {

//		u.bug("reset:" + e.nodeName)

		this.resetClickEvents(e);
		this.resetDragEvents(e);
//		u.bug(1, "reset:"+e.id+":"+e.className)




	}

	this.resetNestedEvents = function(e) {

		while(e && e.nodeName != "HTML") {
//			u.bug("reset nested:" + e.nodeName)
			this.resetEvents(e);
			e = e.parentNode;
		}

	}

	/**
	* Input started
	*
	* Attach additional events
	* Multiple event possible
	*/
	this._inputStart = function(event) {
//		u.bug("_inputStart:" + this.className);

		// used to handle dblclick timeout event forwarding
		this.event_var = event;
		this.input_timestamp = new Date().getTime();

//		u.e.setEventPref(event.type);

//		u.bug(event + ":" + this.className);
		this.start_event_x = u.eventX(event);
		this.start_event_y = u.eventY(event);


		this.current_xps = 0;
		this.current_yps = 0;
		this.swiped = false;

//		u.e.kill(event);

//		u.bug(1, "start");
		
		// ordinary click events
//		u.bug(this.e_click)
		if(this.e_click || this.e_dblclick || this.e_hold) {
//			u.bug("click set:" + (this.id ? this.id : this.className));


			// TODO: do we need to reset on mouseout??

//			var test = this;
//			while(test) {
//				if(test.e_drag || test.e_swipe) {
//					u.bug("click over drag");
//				}
//				test = test.parentNode;
//			}
			
			// only reset onmove if element is draggable
			var node = this;
			while(node) {
				if(node.e_drag || node.e_swipe) {
//					u.bug("move reset:" + (node.id ? node.id : node.className))
					u.e.addMoveEvent(this, u.e._clickCancel);
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
//		u.bug("_inputClickMove:" + (this.id ? this.id : this.className))

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
	this.hold = function(e) {
		e.e_hold = true;
		u.e.addStartEvent(e, this._inputStart);
	}
	this._held = function(event) {

		//remove event up/end
		u.e.resetEvents(this);

		// notify held
		if(typeof(this.held) == "function") {
			this.held(event);
		}
	}

	/**
	* Notifies:
	* element.clicked
	*/
	this.click = this.tap = function(e) {
//		u.bug("set click:"+e.nodeName)
		e.e_click = true;
		u.e.addStartEvent(e, this._inputStart);
	}
	this._clicked = function(event) {
		// track event
		u.stats.event(this, "clicked");


		// TODO: should reset parent events as well


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
	this.dblclick = this.doubletap = function(e) {
		e.e_dblclick = true;
		u.e.addStartEvent(e, this._inputStart);
	}
	this._dblclicked = function(event) {
//		u.bug("dblclicked:" + event)
		
		// if valid click timer, treat as dblclick
		if(u.t.valid(this.t_clicked) && event) {


			// TODO: should reset parent events as well


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

	/**
	* Drag element e within boundaries specified
	*
	* e - element to be dragged
	* target - scope element or array of boundaries
	* strict - sets allowed_offset = 0 (default allowed_offset = 250 / elastica = 2)
	* snapback - for dragging smaller items - attempts to snap the element back onmouseout
	* process_time - miliseconds between updates. Large elements should be updated less frequent. Default = 50
	*
	* Notifies:
	* element.picked
	* element.moved
	* element.dropped
	*/
//	this.drag = function(e, target, strict, snapback, process_time) {
	this.drag = function(e, target, strict, snapback) {
//		u.bug("set click:"+e.nodeName)
		e.e_drag = true;

		// set elastic effect when dragging out of scope
		e.strict = strict ? true : false;
		e.allowed_offset = e.strict ? 0 : 250;
		e.elastica = 2;
		e.snapback = snapback ? true : false;
//		e.process_time = process_time ? process_time : 0;

//		e.mtm_avg = new Array();

		// remember boundaries
		// if target is array of coordinates
		if(target.constructor.toString().match("Array")) {
			e.start_drag_x = Number(target[0]);
			e.start_drag_y = Number(target[1]);
			e.end_drag_x = Number(target[2]);
			e.end_drag_y = Number(target[3]);
		}
		// target is element
		else {
			e.start_drag_x = target.element_x ? target.element_x : 0;
			e.start_drag_y = target.element_y ? target.element_y : 0;
			e.end_drag_x = Number(e.start_drag_x + target.offsetWidth);
			e.end_drag_y = Number(e.start_drag_y + target.offsetHeight);
		}

//		u.bug(u.absLeft(e)+":"+ e.start_drag_x +":"+ e.end_drag_x +"-"+ e.start_drag_x)
/*
		var display_drag = u.ae(document.body, "div", "display_drag")
		display_drag.style.position = "absolute";
		display_drag.style.left = Number(u.absLeft(e)) - Number(e.start_drag_x) + "px";
		display_drag.style.top = u.absTop(e) - e.start_drag_y + "px";
		display_drag.style.width = e.end_drag_x - e.start_drag_x + "px";
		display_drag.style.height = e.end_drag_y - e.start_drag_y + "px";
		display_drag.style.border = "1px solid red";
		display_drag.style.zIndex = 1
*/

		e.element_x = e.element_x ? e.element_x : 0;
		e.element_y = e.element_y ? e.element_y : 0;

		// offsetHeight and Width may change during a rotation, so better to save starting point values
		// dragging locked (only event catching)
		e.locked = ((e.end_drag_x - e.start_drag_x == e.offsetWidth) && (e.end_drag_y - e.start_drag_y == e.offsetHeight));
		// is the drag one-dimentional
		e.vertical = (!e.locked && e.end_drag_x - e.start_drag_x == e.offsetWidth);
		e.horisontal = (!e.locked && e.end_drag_y - e.start_drag_y == e.offsetHeight);

//		u.bug(2, e.className + "::"+ e.start_drag_x +":"+e.start_drag_y+":"+e.end_drag_x+":"+e.end_drag_y);

		u.e.addStartEvent(e, this._inputStart);

//		u.e.addEvent(e, "mousedown", this._inputStart);
//		u.e.addEvent(e, "touchstart", this._inputStart);
	}

	/**
	* Input picks element - handlder
	* Sets default values for following inputDrag
	*
	* Calls return function element.picked to notify of event
	*/
	this._pick = function(event) {
//		u.bug("_pick:" + u.nodeId(this) + this.element_x + u.gcs(this, "left"));


		// detect if drag is relevant for element
		var init_speed_x = Math.abs(this.start_event_x - u.eventX(event));
		var init_speed_y = Math.abs(this.start_event_y - u.eventY(event));

//		u.bug("speed:" + Math.abs(this.start_event_x - u.eventX(event)) + "," + Math.abs(this.start_event_y - u.eventY(event)));

		/*
		if(init_speed_x > init_speed_y && this.horisontal) {
			u.bug("hori ok")
		}
		else if(init_speed_x < init_speed_y && this.vertical) {
			u.bug("vert ok")
		}
		*/

/*

abs(a - b)

x: -2 -> 2 = 4 (-2 - 2)
y: 2 -> 3 = 1 (2 - 3)

x: 2 -> 5 = 3 (2 - 5)
y: 1 -> 4 = 3 (1 - 4)

x: 2 -> -4 = 6 (2 - -4)
y: 1 -> 3 = 2 (1 - 3)

x: 2 -> -4 = 6 (2 - -4)
y: -3 -> 4 = 7 (-3 - 4)

x: 2 -> 3 = 1 (2 - 3)
y: 3 -> -2 = 5 (3 - -2)

*/
		// reset inital events
		u.e.resetNestedEvents(this);


		if(init_speed_x > init_speed_y && this.horisontal || init_speed_x < init_speed_y && this.vertical || !this.vertical && !this.horisontal) {

			// kill event to prevent dragging deeper element
			// could possibly be forced into callback to allow for double drag
		    u.e.kill(event);


			// reset click/hold timers
	//		u.t.resetTimer(this.t_held);
	//		u.t.resetTimer(this.t_clicked);


			// set initial move timestamp
			this.move_timestamp = new Date().getTime();
	//		u.bug(this.end_drag_x +"-"+ this.start_drag_x +"=="+ this.offsetWidth)

			// dragging locked (only event catching)
	//		this.locked = ((this.end_drag_x - this.start_drag_x == this.offsetWidth) && (this.end_drag_y - this.start_drag_y == this.offsetHeight));
			// is the drag one-dimentional
	//		this.vertical = (!this.locked && this.end_drag_x - this.start_drag_x == this.offsetWidth);
	//		this.horisontal = (!this.locked && this.end_drag_y - this.start_drag_y == this.offsetHeight);




			// set element offset, internal value or relative position
	//		this.offset_x = this.element_x = this.element_x ? this.element_x : 0;
	//		this.offset_y = this.element_y = this.element_y ? this.element_y : 0;

	//		this.offset_x = 0; //this.offsetLeft;
	//		this.offset_y = 0; //this.offsetTop;

			// declare element_x value if not set already
	//		this.element_x = this.element_x ? this.element_x : 0;
	//		this.element_y = this.element_y ? this.element_y : 0;

	//		u.bug("dtl", this.offset_x+":"+this.offset_y);

			// set current speed
			this.current_xps = 0;
			this.current_yps = 0;

	//		u.bug("ol:"+this.offsetLeft +","+ this.offsetWidth)
	//		u.bug("ot:"+this.offsetTop +","+ this.offsetHeight)

			// remember starting point of drag - to signal drag is ready and to calculate speed
			// relative to parentNode
	//		this.start_input_x = u.getInputX(event, this);//.targetTouches ? event.targetTouches[0].pageX : event.pageX) - u.absLeft(this);
	//		this.start_input_y = u.getInputY(event, this);//.targetTouches ? event.targetTouches[0].pageY : event.pageY) - u.absTop(this);

			// relative to screen
			this.start_input_x = u.eventX(event) - this.element_x; // - u.absLeft(this);//(event.targetTouches ? event.targetTouches[0].pageX : event.pageX);
			this.start_input_y = u.eventY(event) - this.element_y; // - u.absTop(this);//.targetTouches ? event.targetTouches[0].pageY : event.pageY);

	//		u.bug("st:"+this.className +"::"+this.start_input_x +","+ this.start_input_y)

			u.a.transition(this, "none");

			// notify of pick
			if(typeof(this.picked) == "function") {
				this.picked(event);
			}


			// reset events and setting drag events
			u.e.addMoveEvent(this, u.e._drag);
			u.e.addEndEvent(this, u.e._drop);


		}



		// Undesired effect when sliding the presentation, could be enabled for small elements in large scopes using mouse
//		if(this.snapback && u.e.event_pref == "mouse") {
//			u.e.addEvent(this, "mouseout", u.e._snapback);
//		}
//		else if(!this.snapback &&  u.e.event_pref == "mouse") {
			
//		}
	}

	/**
	* Drags element, within boundaries set in inputPick
	* Calls return function element.moved to notify of event
	*/
	this._drag = function(event) {
//		u.bug("_drag:" + u.nodeId(this));


		// If init values are set
//		if(this.start_input_x && this.start_input_y) {

			// get comparison timestamp
			this.new_move_timestamp = new Date().getTime();

			// If timedelay is kept
			// Time delay prevents slow animation by overloading the browser with events
			// The value can be adjusted with light animations
//			if(this.new_move_timestamp - this.move_timestamp > this.process_time) {
				var offset = false;
//				var speed_ex, speed_ey, speed_mtm;

				// Get current input coordinates relative to parent
				this.current_x = u.eventX(event) - this.start_input_x;
				this.current_y = u.eventY(event) - this.start_input_y;


//				u.bug("cc"+this.current_x + "::" + this.element_y + "::" + this);
//				this.current_x = event.targetTouches ? event.targetTouches[0].pageX : event.pageX;
//				this.current_y = event.targetTouches ? event.targetTouches[0].pageY : event.pageY;


				// CHECK THIS
//	 			if(!this.strict) {

				// set variables for speed calculation
//				speed_ex = this.element_x;
//				speed_ey = this.element_y;
//				speed_mtm = this.new_move_timestamp - this.move_timestamp;



//	 			if(!this.strict) {
					this.current_xps = Math.round(((this.current_x - this.element_x) / (this.new_move_timestamp - this.move_timestamp)) * 1000);
//					u.bug("(("+this.current_x +"-"+ this.element_x+") /"+ speed_mtm+")*1000");
					this.current_yps = Math.round(((this.current_y - this.element_y) / (this.new_move_timestamp - this.move_timestamp)) * 1000);

//					this.current_xps = Math.round(((this.current_x - this.start_input_x + this.offset_x - speed_ex) / speed_mtm)*1000);
//					this.current_yps = Math.round(((this.current_y - this.start_input_y + this.offset_y - speed_ey) / speed_mtm)*1000);

//					u.bug("ispeed:" + this.current_xps + "x" + this.current_yps)
//					u.bug(1, "speed x:" + this.current_xps + " ("+this.element_x+ "-"+ speed_ex+ "/" +speed_mtm+")");
					// u.bug(1, "speed y:" + this.current_yps + " ("+this.element_y+ "-"+ speed_ey+ "/" +speed_mtm+")");
//				}


//				}

//				u.bug(2, speed_mtm);
//				this.mtm_avg[this.mtm_avg.length] = speed_mtm; 

				// set new move timestamp
				this.move_timestamp = this.new_move_timestamp;

				// calulate new coordinates
//				u.bug("dbr", this.current_x +":"+ this.current_y);


				// MAKE LINEAR DRAG DETECTION ON INIT

				// check for natural drag limitations
				// linear drag, vertical (element as high as boundary allows - no stretch over fixed lines)
//				if(this.end_drag_x - this.start_drag_x == this.offsetWidth) {
//				if(this.locked) {
//					u.bug("lo");
//					this.element_x = this.element_x;
//					this.element_y = this.current_y;

//				}
//				else 
				if(this.vertical) {
					// only set new y
//					u.bug("ve"+this.element_y+ "="+ this.current_y +"-"+ this.start_input_y +"+"+ this.offset_y);
					this.element_y = this.current_y;
//					this.element_y = this.current_y - this.start_input_y + this.offset_y;
				}
				// linear drag, horisontal (element as wide as boundary allows - no stretch over fixed lines)
//				else if(this.end_drag_y - this.start_drag_y == this.offsetHeight) {
				else if(this.horisontal) {
					// only set new x
//					u.bug("ho"+this.element_x+ "="+ this.current_x +"-"+ this.start_input_x +"+"+ this.offset_x);
//					this.element_x = this.current_x - this.start_input_x + this.offset_x;
					this.element_x = this.current_x;
				}
				// free drag (within boundaries)
				else if(!this.locked) {
//					u.bug("fr:"+this.element_x+ "="+ this.current_x +"-"+ this.start_input_x);

					this.element_x = this.current_x;
					this.element_y = this.current_y;
//					this.element_x = this.current_x - this.start_input_x + this.offset_x;
//					this.element_y = this.current_y - this.start_input_y + this.offset_y;
				}

				// calculate speed (strict does not accumulate speed)
//	 			if(!this.strict) {
//					this.current_xps = Math.round(((this.element_x - speed_ex) / speed_mtm)*1000);
//					this.current_yps = Math.round(((this.element_y - speed_ey) / speed_mtm)*1000);

//					u.bug("speed:" + this.current_xps + "x" + this.current_yps)
					// u.bug(1, "speed x:" + this.current_xps + " ("+this.element_x+ "-"+ speed_ex+ "/" +speed_mtm+")");
					// u.bug(1, "speed y:" + this.current_yps + " ("+this.element_y+ "-"+ speed_ey+ "/" +speed_mtm+")");
//				}


				// only perform overlap test and movement if the drag element is not locked
				if(!this.locked) {
					
					
					// Move element if strict boundaries are kept
					if(u.e.overlap(this, new Array(this.start_drag_x, this.start_drag_y, this.end_drag_x, this.end_drag_y), true)) {

//						u.bug("noos");

	//					u.bug(1, this.current_xps +"x"+this.current_yps);
						// calc swipe
						if(this.current_xps && (Math.abs(this.current_xps) > Math.abs(this.current_yps) || this.horisontal)) {
//							u.bug("xps:" + this.current_xps);
							if(this.current_xps < 0) {
								this.swiped = "left";
//								u.bug(1, "sideways left")
							}
							else {
								this.swiped = "right";
//								u.bug(1, "sideways right")
							}
						}
						else if(this.current_yps && (Math.abs(this.current_xps) < Math.abs(this.current_yps) || this.vertical)) {
							if(this.current_yps < 0) {
								this.swiped = "up";
	//							u.bug(1, "up")
							}
							else {
								this.swiped = "down";
	//							u.bug(1, "down")
							}
						}

	//					u.bug("move:" + this.element_x+","+ this.element_y)
						u.a.translate(this, this.element_x, this.element_y);
					}
					// Out of scope
					else {

//						u.bug(4, "oos")
						this.swiped = false;

						// reset speed
						this.current_xps = 0;
						this.current_yps = 0;


						// correct overflow
						// if overflow found:
						// - get offset (corrected for allowed offset)
						// - set correct element_x (for snapback function on drop)
						// - set temorary element x (calculated by drag, allowed_offset and elestica)
						// right out of scope and not locked vertically
						if(this.element_x < this.start_drag_x && !this.vertical) {
							offset = this.element_x < this.start_drag_x - this.allowed_offset ? - this.allowed_offset : this.element_x - this.start_drag_x;
							this.element_x = this.start_drag_x;
							this.current_x = this.element_x + offset + (Math.round(Math.pow(offset, 2)/this.allowed_offset)/this.elastica);
						}
						// left out of scope and not locked vertically
						else if(this.element_x + this.offsetWidth > this.end_drag_x && !this.vertical) {
							offset = this.element_x + this.offsetWidth > this.end_drag_x + this.allowed_offset ? this.allowed_offset : this.element_x + this.offsetWidth - this.end_drag_x;
							this.element_x = this.end_drag_x - this.offsetWidth;
							this.current_x = this.element_x + offset - (Math.round(Math.pow(offset, 2)/this.allowed_offset)/this.elastica);
						}
						else {
							this.current_x = this.element_x;
						}

						// top out of scope
						if(this.element_y < this.start_drag_y && !this.horisontal) {
							offset = this.element_y < this.start_drag_y - this.allowed_offset ? - this.allowed_offset : this.element_y - this.start_drag_y;
							this.element_y = this.start_drag_y;
							this.current_y = this.element_y + offset + (Math.round(Math.pow(offset, 2)/this.allowed_offset)/this.elastica);
//							u.bug(3, "oos0"+offset);
						}
						// bottom out of scope
						else if(this.element_y + this.offsetHeight > this.end_drag_y && !this.horisontal) {
							offset = (this.element_y + this.offsetHeight > this.end_drag_y + this.allowed_offset) ? this.allowed_offset : (this.element_y + this.offsetHeight - this.end_drag_y);
							this.element_y = this.end_drag_y - this.offsetHeight;
							this.current_y = this.element_y + offset - (Math.round(Math.pow(offset, 2)/this.allowed_offset)/this.elastica);
//							u.bug(3, "oos1"+offset);
						}
						else {
//							u.bug(3, "oos2"+offset);
							this.current_y = this.element_y;
						}

						// if offset found, move to these coordinates
						if(offset) {
//							u.bug("offset"+offset)
	//						u.bug("offset:" + this.element_x+","+ this.element_y)
							u.a.translate(this, this.current_x, this.current_y);
						}
//				}
					}

				}

			// notify of movement
			if(typeof(this.moved) == "function") {
				this.moved(event);
			}
//		}
	}

	/**
	* Input drops element
	*
	* Calls return function element.dropped to notify of event
	*/
	this._drop = function(event) {
//		u.bug("_drop");
//		u.bug(2, "#"+this.mtm_avg.length);

//		var sum = 0;
//		for(var i = 0; i < this.mtm_avg.length; i++) {
//			sum += this.mtm_avg[i];
//			u.bug(3, this.mtm_avg[i] + ":"+sum);
//		}

//		u.bug("average:" + sum);
//		u.bug(1, sum/(i) + "("+(this.mtm_avg.length)+")");

		u.e.resetEvents(this);

		// return swipe events to handlers
		if(this.e_swipe && this.swiped) {
//			u.bug("swiped"+this.swiped);

			if(this.swiped == "left") {
				if(typeof(this.swipedLeft) == "function") {
					this.swipedLeft(event);
				}
			}
			else if(this.swiped == "right") {
				if(typeof(this.swipedRight) == "function") {
					this.swipedRight(event);
				}
			}
			else if(this.swiped == "down") {
				if(typeof(this.swipedDown) == "function") {
					this.swipedDown(event);
				}
			}
			else if(this.swiped == "up") {
				if(typeof(this.swipedUp) == "function") {
					this.swipedUp(event);
				}
			}
//			this.swiped = false;
//			u.bug(1, this.swiped);
			
		}
		// else transition element into place
		else if(!this.locked && this.start_input_x && this.start_input_y) {
			// block init values
			this.start_input_x = false;
			this.start_input_y = false;

			// get projected coords based on current speed (devided by 2 for better visual effect)
			this.current_x = this.element_x + (this.current_xps/2);
			this.current_y = this.element_y + (this.current_yps/2);

			// correct out of scope values for projected coordinates
			if(this.current_x < this.start_drag_x) {
				this.current_x = this.start_drag_x;
			}
			else if(this.current_x + this.offsetWidth > this.end_drag_x) {
				this.current_x = this.end_drag_x - this.offsetWidth;
			}
			if(this.current_y < this.start_drag_y) {
				this.current_y = this.start_drag_y;
			}
			else if(this.current_y + this.offsetHeight > this.end_drag_y) {
				this.current_y = this.end_drag_y - this.offsetHeight;
			}

			// if speed is not 0, execute projection
			if(!this.strict && (this.current_xps || this.current_yps)) {
				u.a.transition(this, "all 1s cubic-bezier(0,0,0.25,1)");

				// set projected value new coordinates
//				this.element_x = this.current_x;
//				this.element_y = this.current_y;
			}
			// use faster transition if its a snapback (coordinates are already set)
			else {
				u.a.transition(this, "all 0.1s cubic-bezier(0,0,0.25,1)");
//				u.a.transition(this, "all 0.1s ease");
			}

			// execute projection or snapback
			u.a.translate(this, this.current_x, this.current_y);


		}

		// notify of drop
		if(typeof(this.dropped) == "function") {
			this.dropped(event);
		}

	}



	/**
	swipe
		set boundaries (target/array)

		add event down/start _swipe

	_swipe
		add event move _swiping

	_swiping
		run two simulataneous event handlers?
		start Drag
		start Swipe
		add event up/end _swiped

	_swiped
		remove event move _swiping
		remove event up/end _swiped
		notify swiped
	*
	Swipe
		swipe returns are automatically defined by boundaries, linear horisontal boundaries can only return left/right etc.
		detect swipe movements
		notify swipe
	* Notifies:
	* element.picked
	* element.moved
	* element.dropped
	*
	* ? element.swipedUp
	* ? element.swipedRight
	* ? element.swipedDown
	* ? element.swipedLeft
	*/
	this.swipe = function(e, target, strict) {
		e.e_swipe = true;

		u.e.drag(e, target, strict);

		/*
		// set elastic effect when dragging out of scope
		e.strict = strict ? true : false;
		e.allowed_offset = e.strict ? 0 : 250;
		e.elastica = 2;

		e.mtm_avg = new Array();

		// remember boundaries
		// if target is array of coordinates
		if(target.constructor.toString().match("Array")) {
			e.start_drag_x = Number(target[0]);
			e.start_drag_y = Number(target[1]);
			e.end_drag_x = Number(target[2]);
			e.end_drag_y = Number(target[3]);
		}
		// target is element
		else {
			e.start_drag_x = target.element_x ? target.element_x : 0;
			e.start_drag_y = target.element_y ? target.element_y : 0;
			e.end_drag_x = Number(e.start_drag_x + target.offsetWidth);
			e.end_drag_y = Number(e.start_drag_y + target.offsetHeight);
		}

		u.e.addEvent(e, "mousedown", this._inputStart);
		u.e.addEvent(e, "touchstart", this._inputStart);
		*/
	}


	/**
	* Input picks element - handlder
	* Sets default values for following inputDrag
	*
	* Calls return function element.picked to notify of event
	*/
	this._swipe = function(event) {
//	    u.e.kill(event);


	}

	this.scroll = function(e) {
		e.e_scroll = true;

		e.element_x = e.element_x ? e.element_x : 0;
		e.element_y = e.element_y ? e.element_y : 0;

		u.e.addStartEvent(e, this._inputStart);
	}
	this._scrollStart = function(event) {
//		u.bug("scrollstart")

		u.e.resetNestedEvents(this);

		this.move_timestamp = new Date().getTime();

		// set current speed
		this.current_xps = 0;
		this.current_yps = 0;

		// relative to screen
		this.start_input_x = u.eventX(event) - this.element_x;
		this.start_input_y = u.eventY(event) - this.element_y;

		u.a.transition(this, "none");

		// notify of pick
		if(typeof(this.picked) == "function") {
			this.picked(event);
		}

		// reset events and setting drag events
		u.e.addMoveEvent(this, u.e._scrolling);
		u.e.addEndEvent(this, u.e._scrollEnd);

	}
	this._scrolling = function(event) {
//		u.bug("scrolling")
		this.new_move_timestamp = new Date().getTime();

		// Get current input coordinates relative to parent
		this.current_x = u.eventX(event) - this.start_input_x;
		this.current_y = u.eventY(event) - this.start_input_y;

		this.current_xps = Math.round(((this.current_x - this.element_x) / (this.new_move_timestamp - this.move_timestamp)) * 1000);
		this.current_yps = Math.round(((this.current_y - this.element_y) / (this.new_move_timestamp - this.move_timestamp)) * 1000);

		// set new move timestamp
		this.move_timestamp = this.new_move_timestamp;

		// scroll manually to keep events popping
		if(u.scrollY() > 0 && -(this.current_y) + u.scrollY() > 0) {
//			u.bug("killed:")
			u.e.kill(event);
			window.scrollTo(0, -(this.current_y) + u.scrollY());
		}

		// notify of movement
		if(typeof(this.moved) == "function") {
			this.moved(event);
		}
	}

	this._scrollEnd = function(event) {
//		u.bug("scrollEnd");

		u.e.resetEvents(this);

		// notify of drop
		if(typeof(this.dropped) == "function") {
			this.dropped(event);
		}
	}




	/**
	* Input lost, often on mouse out on element while dragging
	* Trys to catch up with input source
	*/
	this._snapback = function(event) {
	    u.e.kill(event);

		u.bug(2, "snap")

		if(this.start_input_x && this.start_input_y) {

//			u.bug("dtl", this.element_x+":"+this.element_y+":"+this.current_x+":"+this.current_y);

			input_x = event.targetTouches ? event.targetTouches[0].pageX : event.pageX;
			input_y = event.targetTouches ? event.targetTouches[0].pageY : event.pageY;

			offset_x = 0;
			offset_y = 0;

			// linear drag, vertical (element as high as boundary allows - no stretch over fixed lines)
//			if(this.end_drag_x - this.start_drag_x == this.offsetWidth) {
			if(this.vertical) {
				// only set new y
				offset_y = input_y - this.current_y;
			}
			// linear drag, horisontal (element as wide as boundary allows - no stretch over fixed lines)
//			else if(this.end_drag_y - this.start_drag_y == this.offsetHeight) {
			else if(this.horisontal) {
				// only set new x
				offset_x = input_x - this.current_x;
			}
			// free drag (within boundaries)
			else {
				offset_x = input_x - this.current_x;
				offset_y = input_y - this.current_y;
			}

			u.a.translate(this, (this.element_x+offset_x), (this.element_y+offset_y));
//			u.bug("dtl", this.element_x+"x"+this.element_y+":"+this.current_x+"x"+this.current_y+"::"+input_x+"x"+input_y);

		}
	}

}

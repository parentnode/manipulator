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
			event.stopPropagation();
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
			if(document.all) {
				u.bug("exception:" + e + "," + type + ":" + exception);
//				e.attachEvent("on" + type, action);
			}
			else {
				u.bug("exception:" + e + "," + type + ":" + exception);
			}
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
//			if(document.all) {
//				e.detachEvent("on" + type, action);
//			}
		}
	}


	/**
	* Add mousedown/touchstart event
	* Shorthand function to ensure correct event type is added
	* @param e element to add event to
	* @param action Action to execute on event
	*/
	this.onStart = this.onDown = function(e, action) {
//		u.bug("onstart")
		u.e.addEvent(e, (this.event_pref == "touch" ? "touchstart" : "mousedown"), action);
	}

	this.removeOnStart = this.removeOnDown = function(e, action) {
//		u.bug("onstart")
		u.e.addEvent(e, (this.event_pref == "touch" ? "touchstart" : "mousedown"), action);
	}

	/**
	* Add mousemove/touchmove event
	* Shorthand function to ensure correct event type is added
	* @param e element to add event to
	* @param action Action to execute on event
	*/
	this.onMove = function(e, action) {
//		u.bug("onmove:" + e.nodeName)
		u.e.addEvent(e, (this.event_pref == "touch" ? "touchmove" : "mousemove"), action);
	}

	/**
	* Add mouseup/touchend event
	* Shorthand function to ensure correct event type is added
	* @param e element to add event to
	* @param action Action to execute on event
	*/
	this.onEnd = this.onUp = function(e, action) {
//		u.bug("set onend:" + e.className)
		u.e.addEvent(e, (this.event_pref == "touch" ? "touchend" : "mouseup"), action);

		// add additional mouseout handler if needed
		if(e.snapback && u.e.event_pref == "mouse") {
			u.e.addEvent(e, "mouseout", this._snapback);
		}
		// mouse out is also invoked by dragging over another element - bad
		else if(e.drag && u.e.event_pref == "mouse") {
//			u.e.addEvent(e, "mouseout", action);
		}


	}



	/**
	*
	*/

	this.transform = function(e, x, y) {
//		u.bug("trans e")

		// transition support, use transform
		if(typeof(e.style.MozTransition) != "undefined" || typeof(e.style.webkitTransition) != "undefined") {
			e.style.MozTransform = "translate("+x+"px, "+y+"px)";
			e.style.webkitTransform = "translate3d("+x+"px, "+y+"px, 0)";
			e.element_x = x;
			e.element_y = y;
		}
		// use bacis css positioning
		else {
			e.style.position = "absolute";
			u.bug("duration:" + e.duration);
			// perform move, no duration
			if(!e.duration) {
//				u.bug("m:" + x + "," + y);
				e.style.left = x+"px";
				e.style.top = y+"px";
				e.element_x = x;
				e.element_y = y;
			}
			// if transition is set, start timeout based transition
			else {
//				u.bug("m2:" + x + "," + y);

//				u.bug("trsna:"+e.duration + ":" + x + "," + y)

				e.transitions = 15;
				e.transition_progress = 0;

				e.element_x = e.element_x ? e.element_x : 0;
				e.element_y = e.element_y ? e.element_y : 0;

				e.transitionTo = function() {
						++this.transition_progress;
//						u.bug("t:"+this.transitioned)
//						var new_pos = this.distance_x - this.interval_x*this.transitioned;

//						u.bug("new pos:"+new_pos);

//						u.bug("ol" + this.offsetLeft + ":ic"+(this.interval_x)+"*"+(this.transition_progress) + "=" + (this.end_x-(this.distance_x - (this.interval_x*this.transitioned))));
						this.style.left =  this.end_x-(this.distance_x - (this.interval_x*this.transition_progress))+"px";
//						this.style.left =  this.end_x-this.distance_x - this.interval_x*this.transition_progress+"px";
						this.style.top =  this.end_y-this.distance_y - this.interval_y*this.transition_progress+"px";
						this.element_x = this.end_x-(this.distance_x - (this.interval_x*this.transition_progress));
						this.element_y = this.end_y-(this.distance_y - (this.interval_y*this.transition_progress));
					
//					this.style.left = this.offsetLeft + (this.distance/16) + "px";
//					u.t.setTimer(this, this.transitionTo, e.transtion/10);
				}

				e.end_x = x;
				e.end_y = y;

//				u.bug("e" + e.element_x)
				// d 100
				if(e.end_x > e.element_x) {

					// ex/ox 200/100, 100/0, 50/-50, 0/-100
					if(e.end_x > 0 && e.element_x >= 0 || e.end_x >= 0 && e.element_x < 0) {
						e.distance_x = e.end_x - e.element_x;
					}
					// ex/ox -100/-200
					else {
						e.distance_x = e.element_x - e.end_x;
					}
				}
				// d -100
				else if(e.end_x < e.element_x) {

					// ex/ox -50/50, 0/100, -200/-100, -100/0
					if(e.end_x <= 0 && e.element_x > 0 || e.end_x < 0 && e.element_x <= 0) {
						e.distance_x = e.end_x - e.element_x;
					}
					// ex/ox 100/200
					else {
						e.distance_x = e.element_x - e.end_x;
	//					u.bug("right3:" + this.offsetLeft + "->" +this.end_x + "=" + this.distance_x)
					}
				}
				else {
					e.distance_x = 0;
				}
				

				// d 100
				if(e.end_y > e.element_y) {

					// ex/ox 200/100, 100/0, 50/-50, 0/-100
					if(e.end_y > 0 && e.element_y >= 0 || e.end_y >= 0 && e.element_y < 0) {
						e.distance_y = e.end_y - e.element_y;
//						u.bug("left1:" + e.element_y + "->" +e.end_x + "=" + e.distance_x)
					}
					// ex/ox -100/-200
					else {
						e.distance_y = e.element_y - e.end_y;
//						u.bug("left2:" + e.element_y + "->" +e.end_x + "=" + e.distance_x)
					}
				}
				// d -100
				else if(e.end_y < e.element_y) {

					// ex/ox -50/50, 0/100, -200/-100, -100/0
					if(e.end_y <= 0 && e.element_y > 0 || e.end_y < 0 && e.element_y <= 0) {
						e.distance_y = e.end_y - e.element_y;
//						u.bug("right1:" + e.element_y + "->" +e.end_x + "=" + e.distance_x)
					}
					// ex/ox 100/200
					else {
						e.distance_y = e.element_y - e.end_y;
//						u.bug("right2:" + e.element_y + "->" +e.end_x + "=" + e.distance_x)
					}
				}
				else {
					e.distance_y = 0;
				}

				e.interval_x = e.distance_x/e.transitions;
				e.interval_y = e.distance_y/e.transitions;

//				u.bug(e.interval_x + "," + e.interval_y);

				for(var i = 0; i < e.transitions; i++) {
//					u.bug(this.transition + ":" + (this.transition/16)*i);
					u.t.setTimer(e, e.transitionTo, (e.duration/e.transitions)*i);
					
				}
				if(typeof(e.transitioned) == "function") {
					u.t.setTimer(e, e.transitioned, e.duration);
				}
//				e.style.left = x+"px";
//				e.style.top = y+"px";
			}
		}
		// remember value for cross method compability
	}

	/**
	* Set element transition
	* Detects if CSS transitions are supported
	* If not it prepares transtion time for fallback animation
	*/
	this.transition = function(e, transition) {
		// transitions support
		if(typeof(e.style.MozTransition) != "undefined" || typeof(e.style.webkitTransition) != "undefined") {
			e.style.MozTransition = transition;
			e.style.webkitTransition = transition;

			// set callback
			if(typeof(e.transitioned) == "function") {
				this.onTransitionEnd(e, e.transitioned);
			}
		}
		// parse and calculated ms duration
		else {
			var duration = transition.match(/[0-9.]+[ms]/g) ? transition.match(/[0-9.]+[ms]/g).toString() : false;
			e.duration = duration ? (duration.match("ms") ? parseFloat(duration) : parseFloat(duration) * 1000) : false;
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

//		u.bug("dbl", "esx: "+element_start_x+":esy: "+element_start_y+":eex: "+element_end_x+":eey: "+element_end_y);
//		u.bug("dbl", "tsx: "+target_start_x+":tsy: "+target_start_y+":tex: "+target_end_x+":tey: "+target_end_y);

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


	this.resetEvents = function(e) {

//		u.bug("reset:" + e.nodeName)
//		u.bug(1, "reset:"+e.id+":"+e.className)

		u.t.resetTimer(e.t_held);
		u.t.resetTimer(e.t_clicked);

		this.removeEvent(e, "mouseup", this._dblclicked);
		this.removeEvent(e, "touchend", this._dblclicked);

		this.removeEvent(e, "mousemove", this._inputClickMove);
		this.removeEvent(e, "touchmove", this._inputClickMove);

		this.removeEvent(e, "mousemove", this._pick);
		this.removeEvent(e, "touchmove", this._pick);

		this.removeEvent(e, "mousemove", this._drag);
		this.removeEvent(e, "touchmove", this._drag);

		this.removeEvent(e, "mouseup", this._drop);
		this.removeEvent(e, "touchend", this._drop);

		this.removeEvent(e, "mouseout", this._snapback);
		this.removeEvent(e, "mouseout", this._drop);

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
		this.current_xps = 0;
		this.current_yps = 0;
		this.swiped = false;

//		u.e.kill(event);

//		u.bug(1, "start");
		
		// ordinary click events
//		u.bug(this.e_click)
		if(this.e_click || this.e_dblclick || this.e_hold) {
//			u.bug("click set:" + this.nodeName);
			u.e.onMove(this, u.e._inputClickMove);
			u.e.onEnd(this, u.e._dblclicked);
		}
		// listen for hold?
		if(this.e_hold) {
			this.t_held = u.t.setTimer(this, u.e._held, 750);
		}

		// drag enabled? (cannot co-exist with swipe)
		if(this.e_drag || this.e_swipe) {
//			u.bug("drag set" + this.nodeName)
			u.e.onMove(this, u.e._pick);
			u.e.onEnd(this, u.e._drop);
		}


		// callback TODO - what function name?
		if(typeof(this.inputStarted) == "function") {
			this.inputStarted(event);
		}


	}


	this._inputClickMove = function(event) {
		u.e.resetEvents(this);
		// old event
		if(typeof(this.clickMoved) == "function") {
			this.clickMoved(event);
		}
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
		u.e.onStart(e, this._inputStart);
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
		u.e.onStart(e, this._inputStart);
	}
	this._clicked = function(event) {

		// remove up/end event
		u.e.resetEvents(this);

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
		u.e.onStart(e, this._inputStart);
	}
	this._dblclicked = function(event) {
//		u.bug("dblclicked:" + event)
		
		// if valid click timer, treat as dblclick
		if(u.t.valid(this.t_clicked) && event) {

			// remove up/end event
			u.e.resetEvents(this);

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
			u.e.resetEvents(this);
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
//		u.bug("e.vertical:" + e.horisontal + ":" + e.className + ":" + e.offsetHeight);

//		u.bug(2, e.className + "::"+ e.start_drag_x +":"+e.start_drag_y+":"+e.end_drag_x+":"+e.end_drag_y);

		u.e.onStart(e, this._inputStart);

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
//		u.bug("_pick:"+this.nodeName);

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

		u.e.transition(this, "none");

		// notify of pick
		if(typeof(this.picked) == "function") {
			this.picked(event);
		}


		// reset events and setting drag events
		u.e.resetEvents(this);
		u.e.onMove(this, u.e._drag);
		u.e.onEnd(this, u.e._drop);

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
//		u.bug("_drag:"+this.nodeName);


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

			u.e.transform(this, (this.element_x+offset_x), (this.element_y+offset_y));
//			u.bug("dtl", this.element_x+"x"+this.element_y+":"+this.current_x+"x"+this.current_y+"::"+input_x+"x"+input_y);

		}
	}

}

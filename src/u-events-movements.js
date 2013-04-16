/*
EVENTS
swipe
drag
pinch/zoom/rotate (later)




*	e.start_drag_y - start coord for drag area
*	e.end_drag_y - end coord for drag area
*
*	e.start_input_y - start coord of touch input event
*
*	e.current_y - current coord of input
*	e.element_y - calculated new coord of element relative to input
*	e.offset_y - offset between events - to calcilated direction
*


TODO: Calculate processtime based on element size

*/


u.e.resetDragEvents = function(node) {
//	u.bug("reset drag events:" + u.nodeId(node));

	this.removeEvent(node, "mousemove", this._pick);
	this.removeEvent(node, "touchmove", this._pick);

	this.removeEvent(node, "mousemove", this._drag);
	this.removeEvent(node, "touchmove", this._drag);

	this.removeEvent(node, "mouseup", this._drop);
	this.removeEvent(node, "touchend", this._drop);

//	this.removeEvent(node, "mouseout", this._snapback);
	this.removeEvent(node, "mouseout", this._drop);



	this.removeEvent(node, "mousemove", this._scrollStart);
	this.removeEvent(node, "touchmove", this._scrollStart);
	this.removeEvent(node, "mousemove", this._scrolling);
	this.removeEvent(node, "touchmove", this._scrolling);
	this.removeEvent(node, "mouseup", this._scrollEnd);
	this.removeEvent(node, "touchend", this._scrollEnd);

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

// calculate overlap of element and target
// strict = true to look for complete overlap
// TODO: rewrite
u.e.overlap = function(node, boundaries, strict) {

	// if target is array of coordinates
	if(boundaries.constructor.toString().match("Array")) {
		var boundaries_start_x = Number(boundaries[0]);
		var boundaries_start_y = Number(boundaries[1]);
		var boundaries_end_x = Number(boundaries[2]);
		var boundaries_end_y = Number(boundaries[3]);
	}
	// target is element
	else if(boundaries.constructor.toString().match("HTML")) {
		var boundaries_start_x = u.absX(boundaries) - u.absX(node);
		var boundaries_start_y =  u.absY(boundaries) - u.absY(node);
		var boundaries_end_x = Number(boundaries_start_x + boundaries.offsetWidth);
		var boundaries_end_y = Number(boundaries_start_y + boundaries.offsetHeight);
	}

	// element proporties
	var node_start_x = Number(node._x);
	var node_start_y = Number(node._y);
	var node_end_x = Number(node_start_x + node.offsetWidth);
	var node_end_y = Number(node_start_y + node.offsetHeight);

//	u.bug("esx: "+element_start_x+":esy: "+element_start_y+":eex: "+element_end_x+":eey: "+element_end_y);
//	u.bug("tsx: "+target_start_x+":tsy: "+target_start_y+":tex: "+target_end_x+":tey: "+target_end_y);

	// strict - check boundaries
	// all boundaries are kept
	if(strict) {
		if(node_start_x >= boundaries_start_x && node_start_y >= boundaries_start_y && node_end_x <= boundaries_end_x && node_end_y <= boundaries_end_y) {
			return true;
		}
		else {
			return false;
		}
	} 
	// not strict - out of scope detection (much simpler algoritm)
	// elements are not overlapping
	else if(node_end_x < boundaries_start_x || node_start_x > boundaries_end_x || node_end_y < boundaries_start_y || node_start_y > boundaries_end_y) {
		return false;
	}
	// elements are overlapping
	return true;
}


/**
* Drag element e within boundaries specified
*
* node - element to be dragged
* boundary - boundary of dragged element, states as Node or array of outer boundaries relative to node

Optional parameters

* strict - default = true
- true: object follow mouse precisely
- false: animates node to projected end coord based on movement speed

* bouncing - default = false
- animates node to projected end coord based on movement speed - bouncing off boundaries (bouncing not implemented)

* elastica - default = 0
- drag over boundary and snap back on release - basically a visuel effect

* dropout - default = true
- drop element on mouseout (safety feature to avoid loosing drag/node relation)

* CONSIDER: processtime for fallback methods - not implemented
* processtime - miliseconds between updates. Large elements should be updated less frequent. Default = 50

*
* Notifies:
* element.picked
* element.moved
* element.dropped
*/
//this.drag = function(e, target, strict, snapback, process_time) {

// it is important to do as many calculation beforehand to make event handling as fast as possible
// if you do too many calculations on each event dragging will be lagging and ... well crappy.
u.e.drag = function(node, boundaries, settings) {

//	u.bug("set click:"+e.nodeName)
	node.e_drag = true;

	// check for empty node
	if(node.childNodes.length < 2 && node.innerHTML.trim() == "") {
		node.innerHTML = "&nbsp;";
	}


	// default values
	node.drag_strict = true;
//	node.drag_projection = false;
	node.drag_elastica = 0;
	node.drag_dropout = true;

	// debug displaying of boundaries
	node.show_bounds = false;


	// additional info passed to function as JSON object
	if(typeof(settings) == "object") {
		for(argument in settings) {

			switch(argument) {
				case "strict"		: node.drag_strict		= settings[argument]; break;
//				case "projection"	: node.drag_projection	= settings[argument]; break;
				case "elastica"		: node.drag_elastica	= Number(settings[argument]); break;
				case "dropout"		: node.drag_dropout		= settings[argument]; break;

				case "show_bounds"	: node.show_bounds		= settings[argument]; break; // NEEDS HELP
			}

		}
	}


//	node.process_time = process_time ? process_time : 0;


//	u.bug("boundaries:" + typeof(boundaries) + "::" + boundaries.constructor.toString());
//	u.xInObject(boundaries);

	if(boundaries.constructor.toString().match("Array")) {

//		u.bug("boundaries are array")

		node.start_drag_x = Number(boundaries[0]);
		node.start_drag_y = Number(boundaries[1]);
		node.end_drag_x = Number(boundaries[2]);
		node.end_drag_y = Number(boundaries[3]);


		// position node absolute top/left in parentNode
		// if node is already positioned, make sure it is to top/left

	}
	// boundaries is node
	else if(boundaries.constructor.toString().match("HTML")) {

//		u.bug("boundaries are node")

		// TODO: if we need to compensate for padding and absolute positioning, do it here


		node.start_drag_x = u.absX(boundaries) - u.absX(node);
		node.start_drag_y = u.absY(boundaries) - u.absY(node);
		node.end_drag_x = node.start_drag_x + boundaries.offsetWidth;
		node.end_drag_y = node.start_drag_y + boundaries.offsetHeight;


		// position node top/left absolute in boundary node
		// if node is already positioned, make sure it is to top/left

		// only change position to absolute on node
		// - never change on other nodes, to avoid other content changing place


		// TODO: should only be required if translate is not supported

		// node is not positioned - change to absolute position
		// if(u.gcs(node, "position").match(/absolute/) == null) {
		// 
		// 	// var relativeParent = u.relativeTo(node);
		// 	// var top = u.absY(node) - u.absY(relativeParent);
		// 	// var left = u.absX(node) - u.absX(relativeParent);
		// 
		// 	var top = u.absY(node) - u.absY(node.offsetParent);
		// 	var left = u.absX(node) - u.absX(node.offsetParent);
		// 
		// 	u.as(node, "position", "absolute");
		// 	u.as(node, "top", top + "px");
		// 	u.as(node, "left", left + "px");
		// }
		// else {
		// 
		// 	// TODO: test correct for right positioning
		// 	// change right to left
		// 	if(u.gcs(node, "right")) {
		// 
		// 		var left = u.absX(node) - u.absX(node.offsetParent);
		// 		u.as(node, "left", left + "px");
		// 		u.as(node, "right", "auto");
		// 	}
		// 	// TODO: test correct for bottom positioning
		// 	// change bottom to top
		// 	if(u.gcs(node, "bottom")) {
		// 
		// 		var top = u.absY(node) - u.absY(node.offsetParent);
		// 		u.as(node, "top", top + "px");
		// 		u.as(node, "bottom", "auto");
		// 	}
		// 	
		// }


	}

	// debug tool - shows boundaries
	if(node.show_bounds) {
		var debug_bounds = u.ae(document.body, "div", {"class":"debug_bounds"})
		debug_bounds.style.position = "absolute";
		debug_bounds.style.background = "red"
		debug_bounds.style.left = (u.absX(node) + node.start_drag_x - 1) + "px";
		debug_bounds.style.top = (u.absY(node) + node.start_drag_y - 1) + "px";
		debug_bounds.style.width = (node.end_drag_x - node.start_drag_x) + "px";
		debug_bounds.style.height = (node.end_drag_y - node.start_drag_y) + "px";
		debug_bounds.style.border = "1px solid white";
		debug_bounds.style.zIndex = 9999;
		debug_bounds.style.opacity = .5;
		if(document.readyState && document.readyState == "interactive") {
			debug_bounds.innerHTML = "WARNING - injected on DOMLoaded"; 
		}
		u.bug("node: "+u.nodeId(node)+" in (" + u.absX(node) + "," + u.absY(node) + "), (" + (u.absX(node)+node.offsetWidth) + "," + (u.absY(node)+node.offsetHeight) +")");
		u.bug("boundaries: (" + node.start_drag_x + "," + node.start_drag_y + "), (" + node.end_drag_x + ", " + node.end_drag_y + ")");
	}



	node.element_x = node.element_x ? node.element_x : 0;
	node.element_y = node.element_y ? node.element_y : 0;

	node._x = node._x ? node._x : 0;
	node._y = node._y ? node._y : 0;

	// offsetHeight and Width may change during a rotation, so better to save starting point values
	// dragging locked (only event catching)
	node.locked = ((node.end_drag_x - node.start_drag_x == node.offsetWidth) && (node.end_drag_y - node.start_drag_y == node.offsetHeight));
	// is the drag one-dimentional
	node.only_vertical = (!node.locked && node.end_drag_x - node.start_drag_x == node.offsetWidth);
	node.only_horisontal = (!node.locked && node.end_drag_y - node.start_drag_y == node.offsetHeight);


	u.e.addStartEvent(node, this._inputStart);
}


/**
* Input picks element - handler
* Sets default values for following inputDrag
*
* Calls return function element.picked to notify of event
*/
u.e._pick = function(event) {
//	u.bug("_pick:" + u.nodeId(this) + ":" + this.element_x);


	// reset inital events to avoid unintended bubbling
	u.e.resetNestedEvents(this);


	// detect if drag is relevant for element
	// if only vertical drag is allowed, only react on vertical movements
	// if only horisontal drag is allowed, only react on horisontal movements
	// to do this we calculate the vertical and horisontal speeds
	var init_speed_x = Math.abs(this.start_event_x - u.eventX(event) - u.scrollX());
	var init_speed_y = Math.abs(this.start_event_y - u.eventY(event) - u.scrollY());

//	u.bug("initial speed:" + init_speed_x + "/" + init_speed_y);

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


	if(init_speed_x > init_speed_y && this.only_horisontal || 
	   init_speed_x < init_speed_y && this.only_vertical ||
	   !this.only_vertical && !this.only_horisontal) {

		// kill event to prevent dragging deeper element
		// could possibly be forced into callback to allow for double drag (but don't see point at current time)
	    u.e.kill(event);


		// set initial move timestamp - used to calculate speed
//		this.move_timestamp = new Date().getTime();
		this.move_timestamp = event.timeStamp;
		this.move_last_x = this._x;
		this.move_last_y = this._y;

		// relative to screen
		this.start_input_x = u.eventX(event) - this._x - u.scrollX(); 
		this.start_input_y = u.eventY(event) - this._y - u.scrollY();


		// reset current speed
		this.current_xps = 0;
		this.current_yps = 0;


		// remove transitions if any
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
	if(this.drag_dropout && u.e.event_pref == "mouse") {
		u.e.addEvent(this, "mouseout", u.e._drop);
	}

}

/**
* Drags element, within boundaries set in inputPick
* Calls return function element.moved to notify of event
*/
u.e._drag = function(event) {
//	u.bug("_drag:" + u.nodeId(this));

//	u.bug("event.timeStamp:" + event.timeStamp);

	// get comparison timestamp
	// use this method for fallback version if event.timeStamp does not exist
//	var timestamp = new Date().getTime();


	// If timedelay is kept
	// Time delay prevents slow animation by overloading the browser with events
	// The value can be adjusted with light animations
//	if(timestamp - this.move_timestamp > this.process_time) {


	// Get current input coordinates relative to starting point
	this.current_x = u.eventX(event) - this.start_input_x - u.scrollX();
	this.current_y = u.eventY(event) - this.start_input_y - u.scrollY();

	// current speed per second
	

	// TODO: error - when locked, speed is calculated from start drag point, should always be speed since last event

	this.current_xps = Math.round(((this.current_x - this.move_last_x) / (event.timeStamp - this.move_timestamp)) * 1000);
	this.current_yps = Math.round(((this.current_y - this.move_last_y) / (event.timeStamp - this.move_timestamp)) * 1000);

	// this.current_xps = Math.round(((this.current_x - this.element_x) / (event.timeStamp - this.move_timestamp)) * 1000);
	// this.current_yps = Math.round(((this.current_y - this.element_y) / (event.timeStamp - this.move_timestamp)) * 1000);

	// remember current move time for next event
	this.move_timestamp = event.timeStamp;
	this.move_last_x = this.current_x;
	this.move_last_y = this.current_y;

	// element can only be dragged vertically
	if(this.only_vertical) {
		// only set new y
		this._y = this.current_y;
	}
	// element can only be dragged horisontally
	else if(this.only_horisontal) {
		// only set new x
		this._x = this.current_x;
	}
	// free drag (within boundaries)
	else if(!this.locked) {
		this._x = this.current_x;
		this._y = this.current_y;
	}


	if(this.e_swipe) {
		// calc swipes event for locked elements
		if(this.current_xps && (Math.abs(this.current_xps) > Math.abs(this.current_yps) || this.only_horisontal)) {
			if(this.current_xps < 0) {
				this.swiped = "left";
	//			u.bug("swiped left")
			}
			else {
				this.swiped = "right";
	//			u.bug("swiped right")
			}
		}
		else if(this.current_yps && (Math.abs(this.current_xps) < Math.abs(this.current_yps) || this.only_vertical)) {
			if(this.current_yps < 0) {
				this.swiped = "up";
	//			u.bug("swiped up")
			}
			else {
				this.swiped = "down";
	//			u.bug("swiped down")
			}
		}
	}


	// only perform overlap test and movement if the drag element is not locked
	if(!this.locked) {


		// Move element if strict boundaries are kept
		if(u.e.overlap(this, [this.start_drag_x, this.start_drag_y, this.end_drag_x, this.end_drag_y], true)) {
//			u.bug("in scope");

//			u.bug("translate:" + this.element_x+","+ this.element_y)
			u.a.translate(this, this._x, this._y);

		}

		// Out of scope

		// elastica - boundaries can be crossed with elastica
		else if(this.drag_elastica) {

			// reset detected swipe
			this.swiped = false;

			// reset speed
			this.current_xps = 0;
			this.current_yps = 0;


			var offset = false;

			// correct overflow
			// if overflow found:
			// - get offset (corrected for allowed offset)
			// - set correct element_x (for snapback function on drop)
			// - set temorary element x (calculated by drag, allowed_offset and elestica)
			// right out of scope and not locked vertically
			if(!this.only_vertical && this._x < this.start_drag_x) {
				offset = this._x < this.start_drag_x - this.drag_elastica ? - this.drag_elastica : this._x - this.start_drag_x;
				this._x = this.start_drag_x;
				this.current_x = this._x + offset + (Math.round(Math.pow(offset, 2)/this.drag_elastica));
			}
			// left out of scope and not locked vertically
			else if(!this.only_vertical && this._x + this.offsetWidth > this.end_drag_x) {
				offset = this._x + this.offsetWidth > this.end_drag_x + this.drag_elastica ? this.drag_elastica : this._x + this.offsetWidth - this.end_drag_x;
				this._x = this.end_drag_x - this.offsetWidth;
				this.current_x = this._x + offset - (Math.round(Math.pow(offset, 2)/this.drag_elastica));
			}
			else {
				this.current_x = this._x;
			}

			// top out of scope
			if(!this.only_horisontal && this._y < this.start_drag_y) {
				offset = this.element_y < this.start_drag_y - this.drag_elastica ? - this.drag_elastica : this._y - this.start_drag_y;
				this._y = this.start_drag_y;
				this.current_y = this._y + offset + (Math.round(Math.pow(offset, 2)/this.drag_elastica));
//				u.bug("oos0"+offset);
			}
			// bottom out of scope
			else if(!this.horisontal && this._y + this.offsetHeight > this.end_drag_y) {
				offset = (this._y + this.offsetHeight > this.end_drag_y + this.drag_elastica) ? this.drag_elastica : (this._y + this.offsetHeight - this.end_drag_y);
				this._y = this.end_drag_y - this.offsetHeight;
				this.current_y = this._y + offset - (Math.round(Math.pow(offset, 2)/this.drag_elastica));
//				u.bug("oos1"+offset);
			}
			else {
//				u.bug("oos2"+offset);
				this.current_y = this._y;
			}

			// if offset found, move to these coordinates
			if(offset) {
//				u.bug("offset"+offset)
//				u.bug("offset:" + this.element_x+","+ this.element_y)
				u.a.translate(this, this.current_x, this.current_y);
			}

		}
		// correct out of bounds coord
		else {
//			u.bug("out of scope", "red")
			

			// reset detected swipe
			this.swiped = false;

			// reset speed
			this.current_xps = 0;
			this.current_yps = 0;


			if(this._x < this.start_drag_x) {
				this._x = this.start_drag_x;
			}
			else if(this._x + this.offsetWidth > this.end_drag_x) {
				this._x = this.end_drag_x - this.offsetWidth;
			}

			if(this._y < this.start_drag_y) {
				this._y = this.start_drag_y;
			}
			else if(this._y + this.offsetHeight > this.end_drag_y) { 
				this._y = this.end_drag_y - this.offsetHeight;
			}

			// set corrected values
			u.a.translate(this, this._x, this._y);
		}

	}

	// notify of movement
	if(typeof(this.moved) == "function") {
		this.moved(event);
	}

}

/**
* Input drops element
*
* Calls return function element.dropped to notify of event
*/
u.e._drop = function(event) {
//	u.bug("_drop:" + event.type);

	// reset events to prepare for new drag
	u.e.resetEvents(this);


	// return swipe events to handlers
	if(this.e_swipe && this.swiped) {
//		u.bug("swiped:"+this.swiped);

		if(this.swiped == "left" && typeof(this.swipedLeft) == "function") {
			this.swipedLeft(event);
		}
		else if(this.swiped == "right" && typeof(this.swipedRight) == "function") {
			this.swipedRight(event);
		}
		else if(this.swiped == "down" && typeof(this.swipedDown) == "function") {
			this.swipedDown(event);
		}
		else if(this.swiped == "up" && typeof(this.swipedUp) == "function") {
			this.swipedUp(event);
		}
//		this.swiped = false;
//		u.bug(this.swiped);
		
	}
	// else transition element into place
	


//	else if(!this.drag_strict && !this.locked && this.start_input_x && this.start_input_y) {

	// projection is enabled
	else if(!this.drag_strict && !this.locked) {


		// block init values
		// this.start_input_x = false;
		// this.start_input_y = false;

		// get projected coords based on current speed (devided by 2 for better visual effect)
		this.current_x = this._x + (this.current_xps/2);
		this.current_y = this._y + (this.current_yps/2);


		// correct out of scope values for projected coordinates
		if(this.only_vertical || this.current_x < this.start_drag_x) {
			this.current_x = this.start_drag_x;
		}
		else if(this.current_x + this.offsetWidth > this.end_drag_x) {
			this.current_x = this.end_drag_x - this.offsetWidth;
		}
		if(this.only_horisontal || this.current_y < this.start_drag_y) {
			this.current_y = this.start_drag_y;
		}
		else if(this.current_y + this.offsetHeight > this.end_drag_y) {
			this.current_y = this.end_drag_y - this.offsetHeight;
		}


		// callback for projection
		this.transitioned = function() {
			this.transitioned = null;
			u.a.transition(this, "none");

			if(typeof(this.projected) == "function") {
				this.projected(event);
			}
		}


		// if speed is not 0, execute projection
		if(this.current_xps || this.current_yps) {
			u.a.transition(this, "all 1s cubic-bezier(0,0,0.25,1)");
		}
		// so speed, no transition
		else {
			u.a.transition(this, "none");
		}

		// execute projection
		u.a.translate(this, this.current_x, this.current_y);
	}
	

	// notify of drop
	if(typeof(this.dropped) == "function") {
		this.dropped(event);
	}

}



/**
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
u.e.swipe = function(node, boundaries, settings) {
	node.e_swipe = true;

	u.e.drag(node, boundaries, settings);
}



u.e.scroll = function(e) {
	e.e_scroll = true;

	e.element_x = e.element_x ? e.element_x : 0;
	e.element_y = e.element_y ? e.element_y : 0;

	e._x = e._x ? e._x : 0;
	e._y = e._y ? e._y : 0;

	u.e.addStartEvent(e, this._inputStart);
}
u.e._scrollStart = function(event) {
//	u.bug("scrollstart")

	u.e.resetNestedEvents(this);

	this.move_timestamp = new Date().getTime();

	// set current speed
	this.current_xps = 0;
	this.current_yps = 0;

	// relative to screen
	this.start_input_x = u.eventX(event) - this._x;
	this.start_input_y = u.eventY(event) - this._y;

	u.a.transition(this, "none");

	// notify of pick
	if(typeof(this.picked) == "function") {
		this.picked(event);
	}

	// reset events and setting drag events
	u.e.addMoveEvent(this, u.e._scrolling);
	u.e.addEndEvent(this, u.e._scrollEnd);

}
u.e._scrolling = function(event) {
//	u.bug("scrolling")
	this.new_move_timestamp = new Date().getTime();

	// Get current input coordinates relative to parent
	this.current_x = u.eventX(event) - this.start_input_x;
	this.current_y = u.eventY(event) - this.start_input_y;

	this.current_xps = Math.round(((this.current_x - this._x) / (this.new_move_timestamp - this.move_timestamp)) * 1000);
	this.current_yps = Math.round(((this.current_y - this._y) / (this.new_move_timestamp - this.move_timestamp)) * 1000);

	// set new move timestamp
	this.move_timestamp = this.new_move_timestamp;

	// scroll manually to keep events popping
	if(u.scrollY() > 0 && -(this.current_y) + u.scrollY() > 0) {
//		u.bug("killed:")
		u.e.kill(event);
		window.scrollTo(0, -(this.current_y) + u.scrollY());
	}

	// notify of movement
	if(typeof(this.moved) == "function") {
		this.moved(event);
	}
}

u.e._scrollEnd = function(event) {
//	u.bug("scrollEnd");

	u.e.resetEvents(this);

	// notify of drop
	if(typeof(this.dropped) == "function") {
		this.dropped(event);
	}
}




// /**
// * Input lost, often on mouse out on element while dragging
// * Trys to catch up with input source
// */
// u.e._snapback = function(event) {
//     u.e.kill(event);
// 
// 	u.bug(2, "snap")
// 
// 	if(this.start_input_x && this.start_input_y) {
// 
// //		u.bug("dtl", this.element_x+":"+this.element_y+":"+this.current_x+":"+this.current_y);
// 
// 		input_x = event.targetTouches ? event.targetTouches[0].pageX : event.pageX;
// 		input_y = event.targetTouches ? event.targetTouches[0].pageY : event.pageY;
// 
// 		offset_x = 0;
// 		offset_y = 0;
// 
// 		// linear drag, vertical (element as high as boundary allows - no stretch over fixed lines)
// //		if(this.end_drag_x - this.start_drag_x == this.offsetWidth) {
// 		if(this.vertical) {
// 			// only set new y
// 			offset_y = input_y - this.current_y;
// 		}
// 		// linear drag, horisontal (element as wide as boundary allows - no stretch over fixed lines)
// //		else if(this.end_drag_y - this.start_drag_y == this.offsetHeight) {
// 		else if(this.horisontal) {
// 			// only set new x
// 			offset_x = input_x - this.current_x;
// 		}
// 		// free drag (within boundaries)
// 		else {
// 			offset_x = input_x - this.current_x;
// 			offset_y = input_y - this.current_y;
// 		}
// 
// 		u.a.translate(this, (this.element_x+offset_x), (this.element_y+offset_y));
// //		u.bug("dtl", this.element_x+"x"+this.element_y+":"+this.current_x+"x"+this.current_y+"::"+input_x+"x"+input_y);
// 
// 	}
// }



/* before scrolling - iPad/iPhone missing event */
u.e.beforeScroll = function(node) {

	node.e_beforescroll = true;
	u.e.addStartEvent(node, this._inputStartDrag);
}

u.e._inputStartDrag = function() {
	u.e.addMoveEvent(this, u.e._beforeScroll);
}
u.e._beforeScroll = function(event) {
	u.e.removeMoveEvent(this, u.e._beforeScroll);

	// notify of pick
	if(typeof(this.picked) == "function") {
		this.picked(event);
	}

}
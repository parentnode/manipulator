/**
* INITIAL SCROLL TESTING
*/


u.e.scroll = function(e) {
	e.e_scroll = true;

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
// //		u.bug("dtl", this._x+":"+this._y+":"+this.current_x+":"+this.current_y);
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
// 		// linear drag, horizontal (element as wide as boundary allows - no stretch over fixed lines)
// //		else if(this.end_drag_y - this.start_drag_y == this.offsetHeight) {
// 		else if(this.horizontal) {
// 			// only set new x
// 			offset_x = input_x - this.current_x;
// 		}
// 		// free drag (within boundaries)
// 		else {
// 			offset_x = input_x - this.current_x;
// 			offset_y = input_y - this.current_y;
// 		}
// 
// 		u.a.translate(this, (this._x+offset_x), (this._y+offset_y));
// //		u.bug("dtl", this._x+"x"+this._y+":"+this.current_x+"x"+this.current_y+"::"+input_x+"x"+input_y);
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
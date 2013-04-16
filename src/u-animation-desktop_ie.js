// Fallback specific animation handler
// tries to mimic transitions by using timeouts

this.transition = function(e, transition) {
	var duration = transition.match(/[0-9.]+[ms]+/g);
	if(duration) {
		var d = duration[0];
//		u.bug(d);
		e.duration = d.match("ms") ? parseFloat(d) : (parseFloat(d) * 1000);
	}
	else {
		e.duration = false;

		// reset running animations?
		// u.t.resetTimer(e.t_transition);
	}

	// update dom
//	e.offsetHeight;
}


// set opacity of element
u.a.setOpacity = function(e, opacity) {
//	if(e.className == "article") {
//		u.bug("set opacity:" + (e.id ? e.id : e.className) + ":" + opacity);
//	}

	// duration and transition not supported
	if(e.duration && !this.support()) {

		// TODO: gcs(opacity) probably does NOT work in IE 8 - test and implement solution
//		u.bug("gcs-opacity:" + u.gcs(e, "opacity"));
//		u.bug("IE:" + u.gcs(e, "filter"))

		e.o_start = e._opacity ? e._opacity : u.gcs(e, "opacity");
		e.o_transitions = e.duration/50;
//		u.bug(e.o_transitions + ":" + opacity + ":" + e.o_start)
		e.o_change = (opacity - e.o_start) / e.o_transitions;
		e.o_progress = 0;

//		u.bug("duration ("+(e.id ? e.id : e.className)+"):" + e.duration + ":from:" + e.start_opacity + ":to:" + opacity + ":" + e.transitions + ":" + e.change_pr_transition);

		e.o_transitionTo = function() {
			++this.o_progress;

			var new_opacity = (Number(this.o_start) + Number(this.o_progress * this.o_change));


//			if(this.className == "article") {
//				u.bug("new opacity:" + (e.id ? e.id : e.className) + ":" + new_opacity + ":" + Number(this.o_start) + "+"+ this.o_progress +"*"+ this.o_change);
//			}

			// CSS
			u.as(this, "opacity", new_opacity);
		}

		for(var i = 0; i < e.o_transitions; i++) {
			u.t.setTimer(e, e.o_transitionTo, 50 * i);
		}

		// callback to transition end handler
		// set it initially with full duration instead of calling on last "frame"
		if(typeof(e.transitioned) == "function") {
			u.t.setTimer(e, e.transitioned, e.duration);
		}
		

	}
	// no transition or transitions supported by browser
	else {
		
		e.style.opacity = opacity;
	}

	e._opacity = opacity;
	e.transition_timestamp = new Date().getTime();

	// update dom
	e.offsetHeight;
}

u.a.setWidth = function(e, width) {

//	u.bug("setWidth (al):" + u.nodeId(e) + ":" + width);
	// duration and transition not supported
	if(e.duration && !this.support()) {

		// set up transition values
		e.w_start = e._width ? e._width : u.gcs(e, "width").replace("px", "");
		e.w_transitions = e.duration/50;
		e.w_change = (width - e.w_start) / e.w_transitions;

		e.w_progress = 0;

		// transition handler
		e.w_transitionTo = function() {
			++this.w_progress;

			var new_width = (Number(this.w_start) + Number(this.w_progress * this.w_change));
//			u.bug("tTo:" + new_width + ":" + this.w_start + ":" + this.w_progress + ":" + this.w_change + ":" + (this.w_progress * this.w_change))

			// CSS
			u.as(this, "width", new_width+"px");
		}

		// set transition timers
		for(var i = 0; i < e.w_transitions; i++) {
			u.t.setTimer(e, e.w_transitionTo, 50 * i);
		}

		// callback to transition end handler
		// set it initially with full duration instead of calling on last "frame"
		if(typeof(e.transitioned) == "function") {
			u.t.setTimer(e, e.transitioned, e.duration);
		}


	}
	else {
		var width_px = (width == "auto" ? width : width+"px");
//		width += width == "auto" ? "" : "px";
		u.as(e, "width", width_px);
	}

	e._width = width;
	e.transition_timestamp = new Date().getTime();

	// update dom
	e.offsetHeight;
}

u.a.setHeight = function(e, height) {

	// duration and transition not supported
	if(e.duration && !this.support()) {

//		u.bug(e._height)
		// set up transition values
		e.h_start = e._height ? e._height : u.gcs(e, "height").replace("px", "");
		e.h_transitions = e.duration/50;
		e.h_change = (height - e.h_start) / e.h_transitions;

//		u.bug("set height:" + e.h_transitions + ":" + height + ":" + e.h_start)

		e.h_progress = 0;

		// transition handler
		e.h_transitionTo = function() {
			++this.h_progress;

			var new_height = (Number(this.h_start) + Number(this.h_progress * this.h_change));

//			u.bug("new height:" + (this.id ? this.id : this.className) + ":" + new_height + ":" + Number(this.h_start) + "+"+ this.h_progress +"*"+ this.h_change);

			// CSS
			u.as(this, "height", new_height+"px");
		}

		// set transition timers
		for(var i = 0; i < e.h_transitions; i++) {
			u.t.setTimer(e, e.h_transitionTo, 50 * i);
		}

		// callback to transition end handler
		// set it initially with full duration instead of calling on last "frame"
		if(typeof(e.transitioned) == "function") {
			u.t.setTimer(e, e.transitioned, e.duration);
		}

	}
	// no duration or transition support
	else {
		var height_px = (height == "auto" ? height : height+"px");
		u.as(e, "height", height_px);
//		e.style.height = height;
	}


	e._height = height;
	e.transition_timestamp = new Date().getTime();

	// update dom
	e.offsetHeight;
}


u.a.setBgPos = function(node, x, y) {

//	x = (x.toString().match(/auto|center|top|left|bottom|right/) ? x : (x.toString().match(/\%/) ? x : x + "px"));
//	y = (y.toString().match(/auto|center|top|left|bottom|right/) ? y : (y.toString().match(/\%/) ? y : y + "px"));

	// duration and transition not supported
	if(node.duration && !this.support()) {

		node._bg_same_x = false;
		node._bg_same_y = false;
		node.bg_transitions = node.duration/50;
//		u.bug(e._height)
		// set up transition values
		// u.bug("pos:" + u.gcs(node, "background-position-y"))
		// u.bug("x:" + u.gcs(node, "background-position").split(" ")[0])
		// u.bug("y:" + u.gcs(node, "background-position").split(" ")[1])
		if(u.gcs(node, "background-position-x") != x) {
			node.bg_start_x = node._bg_x ? node._bg_x : u.gcs(node, "background-position-x").replace("px", "");
			node.bg_change_x = (x - node.bg_start_x) / node.bg_transitions;
		}
		else {
			node._bg_same_x = true;
		}

		if(u.gcs(node, "background-position-y") != y) {
			node.bg_start_y = node._bg_y ? node._bg_y : u.gcs(node, "background-position-y").replace("px", "");
			node.bg_change_y = (y - node.bg_start_y) / node.bg_transitions;
		}
		else {
			node._bg_same_y = true;
		}


//		u.bug("set bgpos:" + y + ":" + node._bg_same_y + ":" + node.bg_start_y)

		node.bg_progress = 0;

		// transition handler
		node.bg_transitionTo = function() {
			++this.bg_progress;

			var new_x, new_y;
			if(!this._bg_same_x) {
				new_x = Math.round((Number(this.bg_start_x) + Number(this.bg_progress * this.bg_change_x)));
			}
			else {
				new_x = this._bg_x;
			}

			if(!this._bg_same_y) {
				new_y = Math.round((Number(this.bg_start_y) + Number(this.bg_progress * this.bg_change_y)));
			}
			else {
				new_y = this._bg_y;
			}
			

//			u.bug("new:" + new_x + ":" + new_y);

//			u.bug("new height:" + (this.id ? this.id : this.className) + ":" + new_height + ":" + Number(this.h_start) + "+"+ this.h_progress +"*"+ this.h_change);

			// CSS
//			u.bug("value:" + (new_x.toString().match(/\%|top|left|right|center|bottom/) ? new_x : new_x + "px") + " " + (new_y.toString().match(/\%|top|left|right|center|bottom/) ? new_y : new_y + "px"));
			u.as(this, "backgroundPosition", (new_x.toString().match(/\%|top|left|right|center|bottom/) ? new_x : new_x + "px") + " " + (new_y.toString().match(/\%|top|left|right|center|bottom/) ? new_y : new_y + "px"));
//			u.bug("background:" + u.gcs(this, "background-position"));
			this.offsetHeight;
		}

		// same coords, no transition
		if(!node._bg_same_x || !node._bg_same_x) {
			// set transition timers
			for(var i = 0; i < node.bg_transitions; i++) {
				u.t.setTimer(node, node.bg_transitionTo, 50 * i);
			}

			// callback to transition end handler
			// set it initially with full duration instead of calling on last "frame"
			if(typeof(node.transitioned) == "function") {
				u.t.setTimer(node, node.transitioned, node.duration);
			}
		}


	}
	// no duration or transition support
	else {
//		var height_px = (height == "auto" ? height : height+"px");
		u.as(node, "backgroundPosition", (x.toString().match(/\%|top|left|right|center|bottom/) ? x : x + "px") + " " + (y.toString().match(/\%|top|left|right|center|bottom/) ? y : y + "px"));
//		u.as(node, "backgroundPosition", x + " " + y);
//		e.style.height = height;
	}


	node._bg_x = x;
	node._bg_y = y;
	node.transition_timestamp = new Date().getTime();

	// update dom
	node.offsetHeight;
}

/**
*
*/

// TODO: implement sequentiel execution of transitions in all functions
// TODO: add interval variable
u.a.translate = function(e, x, y) {
	var i;

//	u.bug("translate desktop_ie:" + u.nodeId(e) + ":" + x + "x" + y);

	// first translation?
	if(e.translate_offset_x == undefined) {
		
		// first get element offset to first relative parent
		var abs_left = u.gcs(e, "left");
		var abs_top = u.gcs(e, "top");

		if(abs_left.match(/px/)) {
			e.translate_offset_x = parseInt(abs_left);
		}
		else {
			e.translate_offset_x = u.relX(e);
		}
		if(abs_top.match(/px/)) {
			e.translate_offset_y = parseInt(abs_top);
		}
		else {
			e.translate_offset_y = u.relY(e);
		}

//		u.bug("abs_left:" + u.nodeId(e) + ":" + abs_left)


		// set internal coordinate value
		e.element_x = e.element_x ? e.element_x : 0;
		e.element_y = e.element_y ? e.element_y : 0;

		e._x = e._x ? e._x : 0;
		e._y = e._y ? e._y : 0;

//		u.bug("e.element_x:" + e.element_x + ": e.t_offset_x:" + e.translate_offset_x + "::" + u.nodeId(e));

		// safe guard if device has transitions - to avoid double transitions
		if(this.support()) {
			// set transition to "none" directly, and keep duration value
			e.style[this.variant()+"Transition"] = "none";
		}

		// set new absolute coordinates
//		u.as(e, "left", e.translate_offset_x+"px");
//		u.as(e, "top", e.translate_offset_y+"px");

		// set position absolute
//		u.as(e, "position", "absolute");

//		u.bug("init translate:" + e.t_offset_x + ":" + e.element_x + "::" + e.t_offset_y + ":" + e.element_y)
	}

	// possibly only run if x != element_x || y != element_y
	if(e.duration) {

//		u.bug("translate with duration:" + u.nodeId(e) + ": dur:" + e.duration + ": x" + x + ": y:" + y);

		// calculate transition
		e.x_start = e._x;
		e.y_start = e._y;
		e.translate_transitions = e.duration/25;
		e.translate_progress = 0;
		e.x_change = (x - e.x_start) / e.translate_transitions;
		e.y_change = (y - e.y_start) / e.translate_transitions;

//		u.bug("x_change:" + e.x_change);
//		u.bug("y_change:" + e.y_change);


		e.translate_transitionTo = function(event) {
			++this.translate_progress;

			var new_x = (Number(this.x_start) + Number(this.translate_progress * this.x_change));
			var new_y = (Number(this.y_start) + Number(this.translate_progress * this.y_change));

			// var new_x = (Number(this.x_start) + Number(this.translate_progress * this.x_change) + this.translate_offset_x);
			// var new_y = (Number(this.y_start) + Number(this.translate_progress * this.y_change) + this.translate_offset_y);

//			u.bug("transition move:" + u.nodeId(this) + ":" + u.nodeId(this.parentNode) + ": new_x:" + new_x + ": new_y:" + new_y);

			e.style["msTransform"] = "translate("+ new_x + "px, " + new_y +"px)";

//			u.as(e, "left", new_x + "px");
//			u.as(e, "top", new_y + "px");

			// test
			if(this.translate_progress < this.translate_transitions) {


				this.t_transition = u.t.setTimer(this, this.translate_transitionTo, 25);
			}
			// last step
			else {

				if(typeof(this.transitioned) == "function") {
					this.transitioned(event);
				}
			}
		}

		// test
		e.translate_transitionTo();

//		for(i = 0; i < e.t_transitions; i++) {
//			u.t.setTimer(e, e.t_transitionTo, 25 * i);
//		}

		// callback to transition end handler
		// set it initially with full duration instead of calling on last "frame"

		// causes multiple callbacks
// 		if(typeof(e.transitioned) == "function") {
// //			u.t.setTimer(e, e.transitioned, e.duration);
// 			u.t.setTimer(e, u.a._callback, e.duration);
// 		}

	}
	else {

//		u.bug("direct move or support:" + (e.t_offset_x + x) + "::" + (e.t_offset_y + y))
		e.style["msTransform"] = "translate("+ x + "px, " + y +"px)";

//		u.as(e, "left", (e.translate_offset_x + x)+"px");
//		u.as(e, "top", (e.translate_offset_y + y)+"px");

	}

	
	// remember value for cross method compability
	e.element_x = x;
	e.element_y = y;
	e._x = x;
	e._y = y;
	e.transition_timestamp = new Date().getTime();

	// update dom
	e.offsetHeight;

}

u.a._callback = function(event) {
	if(typeof(this.transitioned) == "function") {
		this.transitioned(event);
	}
}


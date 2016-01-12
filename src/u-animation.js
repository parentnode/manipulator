Util.Animation = u.a = new function() {


	// translate3d support?
	this.support3d = function() {
		// only run detection once
		if(this._support3d === undefined) {
			var node = u.ae(document.body, "div");

			try {
				u.as(node, "transform", "translate3d(10px, 10px, 10px)");
				if(u.gcs(node, "transform").match(/matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 10, 10, 1\)/)) {
					this._support3d = true;
				}
				else {
					this._support3d = false;
				}
			}
			catch(exception) {
//				u.bug("exception:" + exception)
				this._support3d = false;
			}

			document.body.removeChild(node);
		}
//		u.bug("3d test result:" + this._support3d);
		return this._support3d;
	}



	/**
	* Apply CSS transition to node
	*/
	this.transition = function(node, transition, callback) {
//		u.bug("add transition:" + u.nodeId(node) + ", " + transition + ", " + callback);

		try {

			// get duration
			var duration = transition.match(/[0-9.]+[ms]+/g);
			if(duration) {
		//		u.bug(duration[0]);
				node.duration = duration[0].match("ms") ? parseFloat(duration[0]) : (parseFloat(duration[0]) * 1000);

				// custom transition callback
				if(callback) {
//					u.bug("custom transition callback:" + callback + ", " + u.nodeId(node))

					var transitioned;
					transitioned = (function(event) {

//						u.bug("custom transitioned:" + callback  + ", " + u.nodeId(event.target) + ", " + u.nodeId(this) + ", " + typeof(callback) + ", " + typeof(this[callback]))
						u.e.removeEvent(event.target, u.a.transitionEndEventName(), transitioned);

						if(event.target == this) {

							u.a.transition(this, "none");

							if(typeof(callback) == "function") {
								var key = u.randomString(4);
								node[key] = callback;
								node[key].callback(event);
								node[key] = null;
								callback = null;
							}
							else if(typeof(this[callback]) == "function") {
//								u.bug("callback to: " + callback + ", " + this[callback])
								this[callback](event);
								this[callback] = null;
							}


						}
						else {
//							u.e.kill(event);
						}
					});

					u.e.addEvent(node, u.a.transitionEndEventName(), transitioned);
				}
				else {
//					u.bug("standard transition callback:" + u.nodeId(node))

					// only set transitionEnd listener if transition has duration
					u.e.addEvent(node, u.a.transitionEndEventName(), this._transitioned);
				}

			}
			else {
				node.duration = false;

				// delete transitioned callback when "none" transition is set (cleanup)
				// if(transition.match(/none/i)) {
				// 	node.transitioned = null;
				// }
			}

			u.as(node, "transition", transition);
//			node.style[this.vendor("Transition")] = transition;

		}
		catch(exception) {
			u.exception("u.a.transition", arguments, exception);
		}
		
	}

	// helper function to determine transitionend event name
	// Opera and Chrome introduced prefixed event name in early versions
	this.transitionEndEventName = function() {

		if(!this._transition_end_event_name) {

			// default name
			this._transition_end_event_name = "transitionend";

			var transitions = {
				"transition": "transitionend",
				"MozTransition": "transitionend",
				"msTransition": "transitionend",
				"webkitTransition": "webkitTransitionEnd",
				"OTransition": "otransitionend"
			};

			var x, div = document.createElement("div");
			for(x in transitions){
				if(typeof(div.style[x]) !== "undefined") {
					this._transition_end_event_name = transitions[x];
					break;
				}
			}
		}

		return this._transition_end_event_name;
	}

	// transition end handler
	// not for chained transitions - will reset node.transitioned and remove transition
	this._transitioned = function(event) {

//		u.bug("default transitioned:" + u.nodeId(this))
//		u.bug("transitioned: " + u.nodeId(event.target) + ", " + u.nodeId(this) + ", " + typeof(this.transitioned))

		// remove event listener - it's job is done
		u.e.removeEvent(event.target, u.a.transitionEndEventName(), u.a._transitioned);

		// transition should be removed here to be cleared before callback
		u.a.transition(event.target, "none");

		// only do callback to correct targets
		if(event.target == this && typeof(this.transitioned) == "function") {

			this.transitioned(event);

			this.transitioned = null;

		}

	}




	// EXPERIMENTAL: remove transform, because Firefox 23 makes render-error, when returning to 0 in translates
	// DEPRECATED: excess code to replicate one-liner
	this.removeTransform = function(node) {
		u.as(node, "transform", "none");

	}


	/**
	* Simple translate cross-browser
	*/
	this.translate = function(node, x, y) {

		// use translate3d when supported as it is more often hardware accelerated
		if(this.support3d()) {
			u.as(node, "transform", "translate3d("+x+"px, "+y+"px, 0)");
		}
		else {
			u.as(node, "transform", "translate("+x+"px, "+y+"px)");
		}

		// new value holder
		node._x = x;
		node._y = y;

		// update dom
//		node.offsetHeight;
	}


	this.rotate = function(node, deg) {
		u.as(node, "transform", "rotate("+deg+"deg)");
//		node.style[this.vendor("Transform")] = "rotate("+deg+"deg)";

		node._rotation = deg;

		// update dom
//		node.offsetHeight;
	}

	this.scale = function(node, scale) {
		u.as(node, "transform", "scale("+scale+")");
//		node.style[this.vendor("Transform")] = "scale("+scale+")";

		node._scale = scale;

		// update dom
//		node.offsetHeight;
	}


	this.setOpacity = this.opacity = function(node, opacity) {
		u.as(node, "opacity", opacity);
//		node.style.opacity = opacity;

		node._opacity = opacity;

		// update dom
//		node.offsetHeight;
	}

	this.setWidth = this.width = function(node, width) {
		width = width.toString().match(/\%|auto|px/) ? width : (width + "px");
		node.style.width = width;

		node._width = width;

		// update dom
		node.offsetHeight;
	}

	this.setHeight = this.height = function(node, height) {
		height = height.toString().match(/\%|auto|px/) ? height : (height + "px");
		node.style.height = height;

		node._height = height;

		// update dom
		node.offsetHeight;
	}


	this.setBgPos = this.bgPos = function(node, x, y) {
		x = x.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? x : (x + "px");
		y = y.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? y : (y + "px");
		node.style.backgroundPosition = x + " " + y;

		node._bg_x = x;
		node._bg_y = y;

		// update dom
		node.offsetHeight;
	}


	this.setBgColor = this.bgColor = function(node, color) {
		node.style.backgroundColor = color;

		node._bg_color = color;

		// update dom
		node.offsetHeight;
	}



	// Combined Transforms. Make it possible to run several animation effects at the same time (EX: rotate + scale + translate).
	// DEPRECATED: this can easily be done using u.as now
	//
	// // Rotate & Scale
	// this.rotateScale = function(node, deg, scale) {
	//
	// 	u.as(node, "transform", "rotate("+deg+"deg) scale("+scale+")");
	//
	// 	node.style[this.vendor("Transform")] = "rotate("+deg+"deg) scale("+scale+")";
	// 	node._rotation = deg;
	// 	node._scale = scale;
	//
	// 	// update dom
	// 	node.offsetHeight;
	// }
	//
	// // Scale, Rotate, Translate
	// this.scaleRotateTranslate = function(node, scale, deg, x, y) {
	//
	// 	if(this.support3d()) {
	// 		node.style[this.vendor("Transform")] = "scale("+scale+") rotate("+deg+"deg) translate3d("+x+"px, "+y+"px, 0)";
	// 	}
	// 	else {
	// 		node.style[this.vendor("Transform")] = "scale("+scale+") rotate("+deg+"deg) translate("+x+"px, "+y+"px)";
	// 	}
	//
	// 	// store value
	// 	node._rotation = deg;
	// 	node._scale = scale;
	// 	node._x = x;
	// 	node._y = y;
	//
	// 	// update dom
	// 	node.offsetHeight;
	// }


	this._animationqueue = {};
	this.requestAnimationFrame = function(node, callback, duration) {
//		u.bug("requestAnimationFrame:" + callback + ", " + duration + ", " + u.nodeId(node) + ", " + u.a._requestAnimationId)

		if(!u.a.__animation_frame_start) {
			u.a.__animation_frame_start = Date.now();
		}
		// add animation to stack
//		var start = Date.now() - u.a.__animation_frame_start;
		var id = u.randomString();

//		u.bug("now:" + Date.now() + ", " + start)

		// create object with all information
		u.a._animationqueue[id] = {};
		u.a._animationqueue[id].id = id;
		u.a._animationqueue[id].node = node;
		u.a._animationqueue[id].callback = callback;
//		u.a._animationqueue[id].start = start;
		u.a._animationqueue[id].duration = duration;

		// TODO: timers are not very precise - is this a good idea+
		// add duration timer
		u.t.setTimer(u.a, function() {u.a.finalAnimationFrame(id)}, duration);

		// first addition, set up animationframe loop
		if(!u.a._animationframe) {

			// create function references 
			window._requestAnimationFrame = eval(u.vendorProperty("requestAnimationFrame"));
			window._cancelAnimationFrame = eval(u.vendorProperty("cancelAnimationFrame"));

			// animationframe iterator
			u.a._animationframe = function(timestamp) {

//				u.bug("frame:" + timestamp);



				var id, animation;
				for(id in u.a._animationqueue) {

					animation = u.a._animationqueue[id];

					if(!animation["__animation_frame_start_"+id]) {
						// add animation to stack
						animation["__animation_frame_start_"+id] = timestamp;
//						animation["__animation_frame_start_"+id] = (Date.now() - u.a.__animation_frame_start) + timestamp;
//						u.bug("now:" + animation["__animation_frame_start_"+id])
					}
					

					// progress callback
					animation.node[animation.callback]((timestamp-animation["__animation_frame_start_"+id]) / animation.duration);
				}

				// continue animationFrame loop
				if(Object.keys(u.a._animationqueue).length) {

					u.a._requestAnimationId = window._requestAnimationFrame(u.a._animationframe);
				}
			}
		}


		// loop will be pause when no animations are active
		// restart requestAnimationFrame loop if it is paused
		if(!u.a._requestAnimationId) {

//			u.bug("restart")
			u.a._requestAnimationId = window._requestAnimationFrame(u.a._animationframe);
//			u.bug("u.a._requestAnimationId:" + u.a._requestAnimationId)
		}

		return id;
	}

	this.finalAnimationFrame = function(id) {
//		u.bug("finalAnimationFrame:" + ", " + id + ", " + u.a._requestAnimationId);

		var animation = u.a._animationqueue[id];
		animation["__animation_frame_start_"+id] = false;
		animation.node[animation.callback](1);

		if(typeof(animation.node.transitioned) == "function") {
//			u.bug("callback:" + u.nodeId(animation.node));
			animation.node.transitioned({});
		}

		// delete animation;
		// delete animation;
		delete u.a._animationqueue[id];


		// continue animationFrame loop
		if(!Object.keys(u.a._animationqueue).length) {

			this.cancelAnimationFrame(id);
		}
	}

	this.cancelAnimationFrame = function(id) {
//		u.bug("cancelAnimationFrame:" + ", " + id + ", " + u.a._requestAnimationId);


		if(id && u.a._animationqueue[id]) {

			// delete animation;
			delete u.a._animationqueue[id];
		}

		if(u.a._requestAnimationId) {

//				u.bug(this.vendor("cancelAnimationFrame"));
			window._cancelAnimationFrame(u.a._requestAnimationId);

			u.a.__animation_frame_start = false;
			u.a._requestAnimationId = false;
		}
	}


}

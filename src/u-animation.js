Util.Animation = u.a = new function() {


	// translate3d support?
	this.support3d = function() {
		// only run detection once
		if(this._support3d === undefined) {
			var node = document.createElement("div");
			try {
				var test = "translate3d(10px, 10px, 10px)";
				node.style[this.vendor("Transform")] = test;

//				u.bug("3d test:" + test + "::" + node.style[this.vendor("Transform")]);
				if(node.style[this.vendor("Transform")] == test) {
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
		}
//		u.bug("3d test result:" + this._support3d);
		return this._support3d;
	}

//	alert("rest")

	// get vendor, to avoid setting more than the required type
	// exceptions to be aware of
	this._vendor_exceptions = {
		"mozTransform":"MozTransform","mozTransition":"MozTransition","mozTransitionEnd":"transitionend","mozTransformOrigin":"MozTransformOrigin","mozPerspectiveOrigin":"MozPerspectiveOrigin","mozTransformStyle":"MozTransformStyle","mozPerspective":"MozPerspective"
	};
	// method cache - when a vendor method has been requested once, 
	// it will be stored, to avoid wasting time every time
	this._vendor_methods = {};

	// find correct method
	// checks for exceptions and stores method in cache (_vendor_methods)
 	this.vendorMethod = function(method) {
		var vender_method = this._vendor+method;
		method = this._vendor ? method.replace(/^([a-z]{1})/, function(word){return word.toUpperCase()}) : method;

		if(this._vendor_exceptions[this._vendor+method]) {
			this._vendor_methods[vender_method] = this._vendor_exceptions[this._vendor+method];
			return;
		}
 		this._vendor_methods[vender_method] = this._vendor+method;
 		return;
	}

	// get vendor and optional method name
	// returns name from cache (_vendor_methods)
	// or checks method using vendorMethod
	this.vendor = function(method) {
//		u.bug("vendor: "+ this._vendor + ":" + method);

		// only run detection once
		if(this._vendor === undefined) {
//			u.bug("no implementation")


			if(document.documentElement.style.webkitTransform != undefined) {
//			if(document.body.style.webkitTransform != undefined) {
//				u.bug("vendor: webkit")
				this._vendor = "webkit";
			}
			else if(document.documentElement.style.MozTransform != undefined) {
//			else if(document.body.style.MozTransform != undefined) {
//				u.bug("vendor: moz")
				this._vendor = "moz";
			}
			else if(document.documentElement.style.oTransform != undefined) {
//			else if(document.body.style.oTransform != undefined) {
//				u.bug("vendor: o")
				this._vendor = "o";
			}
			else if(document.documentElement.style.msTransform != undefined) {
//			else if(document.body.style.msTransform != undefined) {
//				u.bug("vendor: ms")
				this._vendor = "ms";
			}
			else {
//				u.bug("vendor: unknown")
				this._vendor = "";
			}
		}

		if(!method) {
			return this._vendor;
		}

		if(this._vendor_methods[this._vendor+method] === undefined) {
			this.vendorMethod(method);
		}

		return this._vendor_methods[this._vendor+method];
	}



	/**
	* Apply CSS transition to node
	*/
	this.transition = function(node, transition) {
//		u.bug("add transition:" + u.nodeId(node) + ", " + transition);

		try {

			// get duration
			var duration = transition.match(/[0-9.]+[ms]+/g);
			if(duration) {
		//		u.bug(duration[0]);
				node.duration = duration[0].match("ms") ? parseFloat(duration[0]) : (parseFloat(duration[0]) * 1000);

				// only set transitionEnd listener if transition has duration
				u.e.addEvent(node, this.vendor("transitionEnd"), this._transitioned);
			}
			else {
				node.duration = false;

				// delete transitioned callback when "none" transition is set (cleanup)
				if(transition.match(/none/i)) {
					node.transitioned = null;
				}
			}

			node.style[this.vendor("Transition")] = transition;

		}
		catch(exception) {
			u.exception("u.a.transition", arguments, exception);
		}
		
	}

	// transition end handler
	this._transitioned = function(event) {

		// remove event listener - it's job is done
		u.e.removeEvent(this, u.a.vendor("transitionEnd"), u.a._transitioned);

		if(event.target == this && typeof(this.transitioned) == "function") {
			this.transitioned(event);
		}

		// automatically remove transition
		u.a.transition(this, "none");
	}




	// EXPERIMENTAL: remove transform, because Firefox 23 makes render-error, when returning to 0 in translates
	this.removeTransform = function(node) {
		node.style[this.vendor("Transform")] = "none";
	}


	// Set origin
	this.origin = function(node, x, y) {

		// set origin
		node.style[this.vendor("TransformOrigin")] = x +"px "+ y +"px";

		// store values
		node._origin_x = x;
		node._origin_y = y;

		// update dom
		node.offsetHeight;
	}


	/**
	* Simple translate cross-browser
	*/
	this.translate = function(node, x, y) {
		// use translate3d when supported as it is more often hardware accelerated
		if(this.support3d()) {
			node.style[this.vendor("Transform")] = "translate3d("+x+"px, "+y+"px, 0)";
		}
		else {
			node.style[this.vendor("Transform")] = "translate("+x+"px, "+y+"px)";
		}

		// new value holder
		node._x = x;
		node._y = y;

		// update dom
		node.offsetHeight;
	}


	this.rotate = function(node, deg) {
		node.style[this.vendor("Transform")] = "rotate("+deg+"deg)";
		node._rotation = deg;

		// update dom
		node.offsetHeight;
	}

	this.scale = function(node, scale) {
		node.style[this.vendor("Transform")] = "scale("+scale+")";
		node._scale = scale;

		// update dom
		node.offsetHeight;
	}


	this.setOpacity = function(node, opacity) {
		node.style.opacity = opacity;
		node._opacity = opacity;

		// update dom
		node.offsetHeight;
	}

	this.setWidth = function(node, width) {
		width = width.toString().match(/\%|auto|px/) ? width : (width + "px");
		node.style.width = width;
		node._width = width;

		// update dom
		node.offsetHeight;
	}

	this.setHeight = function(node, height) {
		height = height.toString().match(/\%|auto|px/) ? height : (height + "px");
		node.style.height = height;
		node._height = height;

		// update dom
		node.offsetHeight;
	}


	this.setBgPos = function(node, x, y) {
		x = x.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? x : (x + "px");
		y = y.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? y : (y + "px");
		node.style.backgroundPosition = x + " " + y;
		node._bg_x = x;
		node._bg_y = y;

		// update dom
		node.offsetHeight;
	}


	this.setBgColor = function(node, color) {
		node.style.backgroundColor = color;
		node._bg_color = color;

		// update dom
		node.offsetHeight;
	}



	// Combined Transforms. Make it possible to run several animation effects at the same time (EX: rotate + scale + translate).

	// Rotate & Scale
	this.rotateScale = function(node, deg, scale) {
		node.style[this.vendor("Transform")] = "rotate("+deg+"deg) scale("+scale+")";
		node._rotation = deg;
		node._scale = scale;

		// update dom
		node.offsetHeight;
	}
	
	// Scale, Rotate, Translate
	this.scaleRotateTranslate = function(node, scale, deg, x, y) {

		if(this.support3d()) {
			node.style[this.vendor("Transform")] = "scale("+scale+") rotate("+deg+"deg) translate3d("+x+"px, "+y+"px, 0)";
		}
		else {
			node.style[this.vendor("Transform")] = "scale("+scale+") rotate("+deg+"deg) translate("+x+"px, "+y+"px)";
		}

		// store value
		node._rotation = deg;
		node._scale = scale;
		node._x = x;
		node._y = y;

		// update dom
		node.offsetHeight;
	}



	// ANIMATION FRAME

	this._animationqueue = {};
	this.requestAnimationFrame = function(node, callback, duration) {
//		u.bug("requestAnimationFrame:" + callback + ", " + duration + ", " + u.nodeId(node) + ", " + u.a._requestAnimationId)

		// add animation to stack
		var start = new Date().getTime();
		var id = u.randomString();

		// create object with all information
		u.a._animationqueue[id] = {};
		u.a._animationqueue[id].id = id;
		u.a._animationqueue[id].node = node;
		u.a._animationqueue[id].callback = callback;
		u.a._animationqueue[id].start = start;
		u.a._animationqueue[id].duration = duration;

		// TODO: timers are not very precise - is this a good idea+
		// add duration timer
		u.t.setTimer(u.a, function() {u.a.finalAnimationFrame(id)}, duration);

		// first addition, set up animationframe loop
		if(!u.a._animationframe) {

			// create function references 
			window._requestAnimationFrame = eval(this.vendor("requestAnimationFrame"));
			window._cancelAnimationFrame = eval(this.vendor("cancelAnimationFrame"));

			// animationframe iterator
			u.a._animationframe = function(timestamp) {

//				u.bug("frame:" + timestamp);

				var id, animation;
				for(id in u.a._animationqueue) {

					animation = u.a._animationqueue[id];

					// progress callback
					animation.node[animation.callback]((timestamp-animation.start) / animation.duration);
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
		animation.node[animation.callback](1);

		if(typeof(animation.node.transitioned) == "function") {
//			u.bug("callback:" + u.nodeId(animation.node));
			animation.node.transitioned({});
		}

		// delete animation;
		delete animation;
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

			u.a._requestAnimationId = false;
		}
	}


}

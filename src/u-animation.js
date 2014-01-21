Util.Animation = u.a = new function() {

	
	// transitions support - required to perform animations
	// this.support = function() {
	// 
	// 	// only run detection once
	// 	if(this._support === undefined) {
	// 		var node = document.createElement("div");
	// 		u.bug("transition:" + node.style[this.variant() + "Transition"] + ", " + (this.variant() + "Transition" in document.documentElement.style));
	// 		if(node.style[this.variant() + "Transition"] !== undefined) {
	// 			this._support = true;
	// 		}
	// 		else {
	// 			this._support = false;
	// 		}
	// 	}
	// 
	// 	return this._support;
	// }

	// translate3d support?
	this.support3d = function() {
		// only run detection once
		if(this._support3d === undefined) {
			var node = document.createElement("div");
			try {
				var test = "translate3d(10px, 10px, 10px)";
				node.style[this.variant() + "Transform"] = test;

//				u.bug("3d test:" + test + "::" + node.style[this.variant() + "Transform"]);
				if(node.style[this.variant() + "Transform"] == test) {
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


	// get variant, to avoid setting more than the required type
	// TODO : extend variant with specific names - to compensate for transitionend messup

	this.variant = function() {
//		u.bug("variant: "+ this.implementation)

		// only run detection once
		if(this._variant === undefined) {
//			u.bug("no implementation")
			if(document.body.style.webkitTransform != undefined) {
//				u.bug("variant: webkit")
				this._variant = "webkit";
			}
			else if(document.body.style.MozTransform != undefined) {
//				u.bug("variant: moz")
				this._variant = "Moz";
			}
			else if(document.body.style.oTransform != undefined) {
//				u.bug("variant: o")
				this._variant = "o";
			}
			else if(document.body.style.msTransform != undefined) {
//				u.bug("variant: ms")
				this._variant = "ms";
			}
			else {
//				u.bug("variant: unknown")
				this._variant = "";
			}
		}
		return this._variant;
	}



	/**
	* Apply CSS transition to node
	*/
	this.transition = function(node, transition) {
		try {		
			node.style[this.variant() + "Transition"] = transition;

			// automatically enable transitionend callback
			// Moz implementation is off track :)
			if(this.variant() == "Moz") {
				u.e.addEvent(node, "transitionend", this._transitioned);
			}
			// standard 
			else {
				u.e.addEvent(node, this.variant() + "TransitionEnd", this._transitioned);
			}

			// get duration
			var duration = transition.match(/[0-9.]+[ms]+/g);
			if(duration) {
		//		u.bug(duration[0]);
				node.duration = duration[0].match("ms") ? parseFloat(duration[0]) : (parseFloat(duration[0]) * 1000);
			}
			else {
				node.duration = false;

				if(transition.match(/none/i)) {
					// if(u.hc(node, "subjects")) {
					// 	u.bug("EXPERIMENTAL subjects reset transition end:" + transition + ", " + u.nodeId(node), 2, "red")
					// }
					// TODO: experimental - auto reset of transitioned callback
					node.transitioned = null;
				}
			}

		}
		catch(exception) {
			u.bug("Exception ("+exception+") in u.a.transition(" + node + "), called from: "+arguments.callee.caller);
		}
		
	}

	// transition end handler
	this._transitioned = function(event) {
		if(event.target == this && typeof(this.transitioned) == "function") {
			this.transitioned(event);
		}
	}


	// EXPERIMENTAL: remove transform, because Firefox 23 makes render-error, when returning to 0 in translates
	this.removeTransform = function(node) {
		node.style[this.variant() + "Transform"] = "none";
	}


	/**
	* Simple translate cross-browser
	*/
	this.translate = function(node, x, y) {
		// use translate3d when supported as it is more often hardware accelerated
		if(this.support3d()) {
			node.style[this.variant() + "Transform"] = "translate3d("+x+"px, "+y+"px, 0)";
		}
		else {
			node.style[this.variant() + "Transform"] = "translate("+x+"px, "+y+"px)";
		}

		// new value holder
		node._x = x;
		node._y = y;

		// DEPRECATED
		// node.transition_timestamp = new Date().getTime();

		// update dom
		node.offsetHeight;
	}


	this.rotate = function(node, deg) {
		node.style[this.variant() + "Transform"] = "rotate("+deg+"deg)";
		node._rotation = deg;

		// DEPRECATED
		// node.transition_timestamp = new Date().getTime();

		// update dom
		node.offsetHeight;
	}

	this.scale = function(node, scale) {
		node.style[this.variant() + "Transform"] = "scale("+scale+")";
		node._scale = scale;

		// DEPRECATED
		// node.transition_timestamp = new Date().getTime();

		// update dom
		node.offsetHeight;
	}


	this.setOpacity = function(node, opacity) {
		node.style.opacity = opacity;
		node._opacity = opacity;

		// DEPRECATED
		// node.transition_timestamp = new Date().getTime();

		// update dom
		node.offsetHeight;
	}

	this.setWidth = function(node, width) {
		width = width.toString().match(/\%|auto|px/) ? width : (width + "px");
		node.style.width = width;
		node._width = width;

		// DEPRECATED
		// node.transition_timestamp = new Date().getTime();

		// update dom
		node.offsetHeight;
	}

	this.setHeight = function(node, height) {
		height = height.toString().match(/\%|auto|px/) ? height : (height + "px");
		node.style.height = height;
		node._height = height;

		// DEPRECATED
		// node.transition_timestamp = new Date().getTime();

		// update dom
		node.offsetHeight;
	}


	this.setBgPos = function(node, x, y) {
		x = x.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? x : (x + "px");
		y = y.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? y : (y + "px");
		node.style.backgroundPosition = x + " " + y;
		node._bg_x = x;
		node._bg_y = y;

		// DEPRECATED
		//node.transition_timestamp = new Date().getTime();

		// update dom
		node.offsetHeight;
	}


	this.setBgColor = function(node, color) {
		node.style.backgroundColor = color;
		node._bg_color = color;

		// DEPRECATED
		// node.transition_timestamp = new Date().getTime();

		// update dom
		node.offsetHeight;
	}

	// Combined Transforms. Make it possible to run several animation effects at the same time (EX: rotate + scale + translate).

	// Rotate & Scale
	this.rotateScale = function(node, deg, scale) {
		node.style[this.variant() + "Transform"] = "rotate("+deg+"deg) scale("+scale+")";
		node._rotation = deg;
		node._scale = scale;

		// update dom
		node.offsetHeight;
	}
	
	// Scale, Rotate, Translate
	this.scaleRotateTranslate = function(node, scale, deg, x, y) {

		if(this.support3d()) {
			node.style[this.variant() + "Transform"] = "scale("+scale+") rotate("+deg+"deg) translate3d("+x+"px, "+y+"px, 0)";
		}
		else {
			node.style[this.variant() + "Transform"] = "scale("+scale+") rotate("+deg+"deg) translate("+x+"px, "+y+"px)";
		}

		// store value
		node._rotation = deg;
		node._scale = scale;
		node._x = x;
		node._y = y;

		// update dom
		node.offsetHeight;
	}


}

Util.Animation = u.a = new function() {

	this.support = function() {
		var node = document.createElement("div");
		if(node.style[this.variant() + "Transition"] !== undefined) {
			return true;
		}
		return false;
	}

	// get variant, to avoid setting more than the required type
	this.variant = function(e) {
//		u.bug("variant: "+ this.implementation)
		if(this.implementation == undefined) {
//			u.bug("no implementation")
			if(document.body.style.webkitTransition != undefined) {
//				u.bug("variant: webkit")
				this.implementation = "webkit";
			}
			else if(document.body.style.MozTransition != undefined) {
//				u.bug("variant: moz")
				this.implementation = "Moz";
			}
			else if(document.body.style.oTransition != undefined) {
//				u.bug("variant: o")
				this.implementation = "o";
			}
			else {
//				u.bug("variant: unknown")
				this.implementation = "";
			}
		}
		return this.implementation;
	}
	/**
	*
	*/
	this.translate = function(e, x, y) {

//		u.bug("trans a")
		var variant_string = this.variant();
		if(variant_string == "webkit") {
//			u.bug("3d");
			e.style[variant_string + "Transform"] = "translate3d("+x+"px, "+y+"px, 0)";
		}
		else {
//			u.bug("not 3d")
			e.style[variant_string + "Transform"] = "translate("+x+"px, "+y+"px)";
		}

//		u.bug(x + ":" + y)

//		e.style.MozTransform = "translate("+x+"px, "+y+"px)";
//		e.style.webkitTransform = "translate3d("+x+"px, "+y+"px, 0)";
		e.element_x = x;
		e.element_y = y;
		e._x = x;
		e._y = y;

		e.transition_timestamp = new Date().getTime();

		e.offsetHeight;
	}

	this.rotate = function(e, deg) {
//		u.bug("rotate a")
		e.style[this.variant() + "Transform"] = "rotate("+deg+"deg)";

//		e.style.MozTransform = "rotate("+deg+"deg)";
//		e.style.webkitTransform = "rotate("+deg+"deg)";
		e._rotation = deg;

		e.transition_timestamp = new Date().getTime();

		e.offsetHeight;
	}

	this.scale = function(e, scale) {
//		u.bug("scale a")
		e.style[this.variant() + "Transform"] = "scale("+scale+")";
//		e.style.MozTransform = "scale("+scale+")";
//		e.style.webkitTransform = "scale("+scale+")";
		e.scale = scale;
		e._scale = scale;
		e.transition_timestamp = new Date().getTime();

		// update dom
		e.offsetHeight;
	}


	this.setOpacity = function(e, opacity) {
		e.style.opacity = opacity;

		e._opacity = opacity;

		e.transition_timestamp = new Date().getTime();

		// update dom
		e.offsetHeight;
	}

	this.setWidth = function(e, width) {
//		u.bug("setWidth:" + e)
		var width_px = (width == "auto" ? width : (width.toString().match(/\%/) ? width : width+"px"));
//		var width_px = (width == "auto" ? width : width+"px");
//		width += width == "auto" ? "" : "px";
		e.style.width = width_px;

		e._width = width;

		e.transition_timestamp = new Date().getTime();

		// update dom
		e.offsetHeight;
	}

	this.setHeight = function(e, height) {
		var height_px = (height == "auto" ? height : (height.toString().match(/\%/) ? height : height+"px"));
//		var height_px = (height == "auto" ? height : height+"px");
//		height += height == "auto" ? "" : "px";
		e.style.height = height_px;

		e._height = height;

		e.transition_timestamp = new Date().getTime();

		// update dom
		e.offsetHeight;
	}



	this.rotateTranslate = function(e, deg, x, y) {

//		u.bug("trans a")
		e.style[this.variant() + "Transform"] = "rotate("+deg+"deg) translate("+x+"px, "+y+"px)";

//		u.bug(x + ":" + y)

//		e.style.MozTransform = "translate("+x+"px, "+y+"px)";
//		e.style.webkitTransform = "translate3d("+x+"px, "+y+"px, 0)";
		e.rotation = deg;
		e.element_x = x;
		e.element_y = y;

		e._rotation = deg;
		e._x = x;
		e._y = y;

		e.transition_timestamp = new Date().getTime();

		// update dom
		e.offsetHeight;
	}


	this.translateRotate = function(e, x, y, deg) {
		e.style[this.variant() + "Transform"] = "translate("+x+"px, "+y+"px) rotate("+deg+"deg)";
		e.element_x = x;
		e.element_y = y;
		e.rotation = deg;

		e._x = x;
		e._y = y;
		e._rotation = deg;

		e.transition_timestamp = new Date().getTime();

		// update dom
		e.offsetHeight;
	}



	/**
	*
	*/
	this.transition = function(e, transition) {
		try {
		
			e.style[this.variant() + "Transition"] = transition;
		//	e.style["Transition"] = transition;
		//	e.style.webkitTransition = transition;

			// automatically enable transitionend callback
			u.e.addEvent(e, this.variant() + "TransitionEnd", this._transitioned);
			// Moz implementation is off track :)
			u.e.addEvent(e, "transitionend", this._transitioned);

			var duration = transition.match(/[0-9.]+[ms]+/g);
			if(duration) {
				var d = duration[0];
		//		u.bug(d);
				e.duration = d.match("ms") ? parseFloat(d) : (parseFloat(d) * 1000);
			}
			else {
				e.duration = false;
			}
			// update dom
			e.offsetHeight;
			
		}
		catch(exception) {
			u.bug("Exception ("+exception+") in u.a.transition, called from: "+arguments.callee.caller);
		}
		
	}

	// manual setting of transition end callback (when transitions are declared via CSS instead of JS)
//	this.transitioned = function(e) {
//		u.bug("listen:" + e.className);
//		u.bug(this.variant()+"TransitionEnd")
//		u.e.addEvent(e, this.variant()+"TransitionEnd", u.a._transitioned);
		// Moz implementation is of track :)
//		u.e.addEvent(e, "transitionend", u.a._transitioned);
//	}

	this._transitioned = function(event) {
		// maybe only callback when target == this?

//		u.bug("catch" + event.target.className + "::" + this.className)
		if(event.target == this && typeof(this.transitioned) == "function") {
			this.transitioned(event);
		}
	}

	this.fadeIn = function(e, duration) {
		duration = duration == undefined ? "0.5s" : duration;
		u.as(e, "opacity", 0);
		if(u.gcs(e, "display") == "none") {
			u.as(e, "display", "block");
		}
		u.a.transition(e, "all "+duration+" ease-in");
		u.as(e, "opacity", 1);
	}
	
	
	
}

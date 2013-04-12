Util.Animation = u.a = new function() {

	/**
	*
	*/
	this.translate = function(e, x, y) {
		e.style.MozTransform = "translate("+x+"px, "+y+"px)";
		e.style.webkitTransform = "translate3d("+x+"px, "+y+"px, 0)";
		e.element_x = x;
		e.element_y = y;
	}

	this.rotate = function(e, deg) {
		e.style.MozTransform = "rotate("+deg+"deg)";
		e.style.webkitTransform = "rotate("+deg+"deg)";
		e.rotation = deg;
	}

	this.scale = function(e, scale) {
		e.style.MozTransform = "scale("+scale+")";
		e.style.webkitTransform = "scale("+scale+")";
		e.scale = scale;
	}

	/**
	*
	*/
	this.transition = function(e, transition) {
		e.style.MozTransition = transition;
		e.style.webkitTransition = transition;
	}

}

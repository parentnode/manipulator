Util.Animation = u.a = new function() {

	/**
	*
	*/
	this.transform = function(e, x, y) {
		e.style.MozTransform = "translate("+x+"px, "+y+"px)";
		e.style.webkitTransform = "translate3d("+x+"px, "+y+"px, 0)";
		e.element_x = x;
		e.element_y = y;
	}
	/**
	*
	*/
	this.transition = function(e, transition) {
		e.style.MozTransition = transition;
		e.style.webkitTransition = transition;
	}

}
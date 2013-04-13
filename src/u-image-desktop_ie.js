// IE fallback - bad event loopback on image events

/**
* Load image
*
* @param e event return node
*/
u.i.load = function(e, src) {
//	u.bug("u.i.load:" + src)

	// create new image
	var image = new Image();
	image.e = e;

	u.addClass(e, "loading");

	// regular attachevent returns to window object without any kind of reference to image
	// this is the only way to keep it selfcontained
	image.onload = function() {
//		u.bug("image onload event");

		var event = new Object();
		event.target = this;

		u.removeClass(this.e, "loading");

		// notify base
		if(typeof(this.e.loaded) == "function") {
			this.e.loaded(event);
		}
	}

	image.src = src;
}

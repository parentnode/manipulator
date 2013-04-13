Util.Image = u.i = new function() {

	/**
	* Load image
	*
	* @param e event return node
	*/
	this.load = function(e, src) {
//		u.bug("load image: " + e + ", " + src);

		// create new image
		var image = new Image();
		image.e = e;

		u.addClass(e, "loading");
	    u.e.addEvent(image, 'load', u.i._loaded);

//		u.bug("image load:" + image.onload)
//		u.e.addEvent(image, 'data', u.i._debug);
//		u.e.addEvent(image, 'progress', u.i._debug);
//		u.e.addEvent(image, 'done', u.i._debug);
//		u.e.addEvent(image, 'load', u.i._debug);
//		u.e.addEvent(image, 'complete', u.i._debug);

//		image.onload = function(event) {
			// call event reciever
//			this.e.loaded(event);
//		}

		image.src = src;
	}


	/**
	*
	*/
	this._loaded = function(event) {
		u.removeClass(this.e, "loading");
		// notify base
		if(typeof(this.e.loaded) == "function") {
			this.e.loaded(event);
		}
		
	}

	// ???
	this._progress = function(event) {

		u.bug("progress")
		// notify base
		if(typeof(this.e.progress) == "function") {
			this.e.progress(event);
		}
		
	}

	this._debug = function(event) {
		u.bug("event:" + event.type);
	}

}

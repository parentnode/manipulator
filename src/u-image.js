Util.Image = u.i = new function() {

	/**
	* Load image
	*
	* @param e event return node
	*/
	this.load = function(e, src) {

		// create new image
		var image = new Image();
		image.e = e;

		u.addClass(e, "loading");
	    image.addEventListener('load', u.i._loaded ,false);
//		image.addEventListener('data', u.i._progress, false);
//		image.addEventListener('progress', u.i._progress, false);

//		image.onload = function(event) {
			// call event reciever
//			this.e.loaded(event);
//		}

//		image. = function(event) {
			// call event reciever
//			u.bug("data");
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

}

Util.Image = u.i = new function() {

	/**
	* Load image
	*
	* @param e event return node
	*/
	this.load = function(node, src) {
//		u.bug("load image: " + e + ", " + src);

		// create new image
		var image = new Image();
		image.node = node;

		u.ac(node, "loading");
	    u.e.addEvent(image, 'load', u.i._loaded);

		u.e.addEvent(image, 'error', u.i._error);

//	TODO: error handling?? missing image or other errors
//		u.e.addEvent(image, 'data', u.i._debug);


//		u.bug("image load:" + image.onload)
//		u.e.addEvent(image, 'error', u.i._debug);
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
		u.rc(this.node, "loading");
		// notify base
		if(typeof(this.node.loaded) == "function") {
			this.node.loaded(event);
		}
	}
	this._error = function(event) {
		u.rc(this.node, "loading");
		u.ac(this.node, "error");
		// notify base
		// fallback to loaded if no failed callback function declared 
		if(typeof(this.node.loaded) == "function" && typeof(this.node.failed) != "function") {
			this.node.loaded(event);
		}
		else if(typeof(this.node.failed) == "function") {
			this.node.failed(event);
		}
	}

	// ???
	this._progress = function(event) {

		u.bug("progress")
		// notify base
		if(typeof(this.node.progress) == "function") {
			this.node.progress(event);
		}
		
	}

	this._debug = function(event) {
		u.bug("event:" + event.type);
		u.xInObject(event);
	}

}

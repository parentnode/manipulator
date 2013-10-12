u.scrollTo = function(to, options) {

	// scrollIn - node to do scrolling in??

//	u.bug_console_only = true;


	var callback;
	var scrollIn = window;
	var offset_y = 0;
	var offset_x = 0;

	// additional info passed to function as JSON object
	if(typeof(options) == "object") {
		var argument;
		for(argument in options) {

			switch(argument) {
				case "callback"				: callback				= options[argument]; break;
				case "scrollIn"				: scrollIn				= options[argument]; break;
				case "offset_y"				: offset_y				= options[argument]; break;
				case "offset_x"				: offset_x				= options[argument]; break;
			}

		}
	}



	// scroll event loopback
	scrollIn._scrollToHandler = function(event) {
//		u.bug("_scrollToHandler")

		u.t.resetTimer(this._current_scroll_parent.t_scroll);
		this._current_scroll_parent.t_scroll = u.t.setTimer(this._current_scroll_parent, this._current_scroll_parent._scrollTo, 50);
	}


	// TODO: adjust for page not being high enough for end scroll point - currently relies on #page node
	scrollIn._to_y = u.absY(to);

//	u.bug("scrollIn._to_y:" + scrollIn._to_y)

	// offset y is specified
	if(offset_y) {
		scrollIn._to_y = scrollIn._to_y - offset_y;
	}

//	u.bug("scrollIn._to_y:" + scrollIn._to_y)

	// correct for page height
	if(scrollIn._to_y > u.qs("#page").offsetHeight-u.browserH()) {
		scrollIn._to_y = u.qs("#page").offsetHeight-u.browserH();
	}

	// correct for negative values - cannot scroll to negative value
	if(scrollIn._to_y < 0) {
		scrollIn._to_y = 0;
	}


	scrollIn._scroll_direction = scrollIn._to_y - u.scrollY();


	// _scroll_to_y is the value to scroll to in next event
	scrollIn._scroll_to_y = false;


//	u.bug("scrollto:" + u.scrollY() + " to " + scrollIn._to_y);

	// TODO: make it possible to scroll in other elements than window
	scrollIn._current_scroll_parent = scrollIn;
	u.e.addEvent(scrollIn, "scroll", scrollIn._scrollToHandler);
//	u.bug("add scroll event:" + scrollIn._scrollToHandler.toString().substring(0, 40).replace(/\t|\n/g, ""));

	scrollIn._cancelScrollTo = function() {

		u.t.resetTimer(this.t_scroll);
		u.e.removeEvent(this, "scroll", this._scrollToHandler);
//		u.bug("remove scroll event:" + this + ", " + this._scrollToHandler.toString().substring(0, 40).replace(/\t|\n/g, ""));

		this._scrollTo = null;

	}


	scrollIn._scrollTo = function(start) {

//		u.bug("this:" + this)
		// first loop - do we need to do anything special on first loop?
		if(start) {
		
		}

		
		if(this._scroll_to_y === false || u.scrollY() == this._scroll_to_y) {

			if(this._scroll_direction > 0 && (this._scroll_to_y === false || this._to_y > u.scrollY())) {
//					u.bug("down")
				this._scroll_to_y = Math.ceil(u.scrollY() + (this._to_y - u.scrollY())/4);
			}

			else if(this._scroll_direction < 0 && (this._scroll_to_y === false || this._to_y < u.scrollY())) {
//					u.bug("up")
				this._scroll_to_y = Math.floor(u.scrollY() - (u.scrollY() - this._to_y)/4);
			}
			// done
			else {
//				u.bug("done")

				this._cancelScrollTo();

				// u.t.resetTimer(this.t_scroll);
				// u.e.removeEvent(window, "scroll", window._scrollToHandler);
				// u.bug("remove scroll event:" + window._scrollToHandler.toString().substring(0, 40).replace(/\t|\n/g, ""));

				this.scrollTo(0, this._to_y);

				this._scroll_to_y = false;

				// callback
				if(typeof(this.scrolledTo) == "function") {
					this.scrolledTo();
				}

				return;

			}

			this.scrollTo(0, this._scroll_to_y);

		}

		// if scroll to top function is active and scrolling position has changed from expected, it 
		// must mean user is interacting with browser - so cancel auto-scroll
		else {
//			u.bug("cancel autoscroll");

			this._cancelScrollTo();

			// u.t.resetTimer(this.t_scroll);
			// u.e.removeEvent(window, "scroll", window._scrollToHandler);
			// u.bug("remove scroll event:" + window._scrollToHandler.toString().substring(0, 40).replace(/\t|\n/g, ""));

			window._scroll_to_y = false;

			// callback
			if(typeof(this.scrolledToCancelled) == "function") {
				this.scrolledToCancelled();
			}
		}	
	}

	// start scrolling
	scrollIn._scrollTo(true);

}
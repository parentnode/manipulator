u.scrollTo = function(to, options) {


	// scrollIn - node to do scrolling in??


	var callback, scrollIn = window;
	

	// additional info passed to function as JSON object
	if(typeof(options) == "object") {
		var argument;
		for(argument in options) {

			switch(argument) {
				case "callback"				: callback				= options[argument]; break;
				case "scrollIn"				: scrollIn				= options[argument]; break;
			}

		}
	}



	// scroll event loopback
	window._scrollToHandler = function(event) {

		u.t.resetTimer(this._current_scroll_parent.t_scroll);
		this._current_scroll_parent.t_scroll = u.t.setTimer(this._current_scroll_parent, this._current_scroll_parent._scrollTo, 50);
		
	}

	// TODO: adjust for page not being high enough for end scroll point - currently relies on #page node
	scrollIn._to_y = u.absY(to);
	if(scrollIn._to_y > u.qs("#page").offsetHeight-u.browserH()) {
		scrollIn._to_y = u.qs("#page").offsetHeight-u.browserH();
	}

	scrollIn._scroll_direction = scrollIn._to_y - u.scrollY();


	// _scroll_to_y is the value to scroll to in next event
	scrollIn._scroll_to_y = false;


//	u.bug("scrollto:" + u.scrollY() + " to " + scrollIn._to_y);

	// TODO: make it possible to scroll in other elements than window
	window._current_scroll_parent = scrollIn;
	u.e.addEvent(window, "scroll", window._scrollToHandler);

	scrollIn._scrollTo = function(start) {

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

				u.t.resetTimer(this.t_scroll);
				u.e.removeEvent(window, "scroll", window._scrollToHandler);
				window.scrollTo(0, this._to_y);

				window._scroll_to_y = false;

				// callback
				if(typeof(this.scrolledTo) == "function") {
					this.scrolledTo();
				}

				return;

			}

			window.scrollTo(0, this._scroll_to_y);

		}

		// if scroll to top function is active and scrolling position has changed from expected, it 
		// must mean user is interacting with browser - so cancel auto-scroll
		else {
//			u.bug("cancel autoscroll");

			u.t.resetTimer(this.t_scroll);
			u.e.removeEvent(window, "scroll", window._scrollToHandler);

			window._scroll_to_y = false;

			// callback
			if(typeof(this.scrolledTo) == "function") {
				this.scrolledTo();
			}
		}	
	}

	// start scrolling
	scrollIn._scrollTo(true);

}
u.scrollTo = function(_options) {

	var callback_scroll_to = "scrolledTo";
	var offset_y = 0;
	var offset_x = 0;

	var scroll_to_x = 0;
	var scroll_to_y = 0;
	var node = 0;

	// TODO: expand to work inside nodes as well
	var scrollIn = window;


	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {

				case "callback"       : callback_scroll_to    = _options[_argument]; break;
				case "offset_y"       : offset_y              = _options[_argument]; break;
				case "offset_x"       : offset_x              = _options[_argument]; break;

				case "node"           : node                  = _options[_argument]; break;
				case "x"              : scroll_to_x           = _options[_argument]; break;
				case "y"              : scroll_to_y           = _options[_argument]; break;

				case "scrollIn"       : scrollIn              = _options[_argument]; break;

			}
		}
	}


	// getting internal scroll to coord
	if(node) {
		scrollIn._to_x = u.absX(node);
		scrollIn._to_y = u.absY(node);
	}
	else {
		scrollIn._to_x = scroll_to_x;
		scrollIn._to_y = scroll_to_y;
	}


	// compensate for offset
	scrollIn._to_x = offset_x ? scrollIn._to_x - offset_x : scrollIn._to_x;
	scrollIn._to_y = offset_y ? scrollIn._to_y - offset_y : scrollIn._to_y;


	// u.bug("scrollIn._to_x:" + scrollIn._to_x)
	// u.bug("scrollIn._to_y:" + scrollIn._to_y)


	if(scrollIn._to_y > (scrollIn == window ? document.body.scrollHeight : scrollIn.scrollHeight)-u.browserH()) {
		scrollIn._to_y = (scrollIn == window ? document.body.scrollHeight : scrollIn.scrollHeight)-u.browserH();
	}
	if(scrollIn._to_x > (scrollIn == window ? document.body.scrollWidth : scrollIn.scrollWidth)-u.browserW()) {
		scrollIn._to_x = (scrollIn == window ? document.body.scrollWidth : scrollIn.scrollWidth)-u.browserW();
	}


	// correct for negative values - cannot do native scroll to negative value
	scrollIn._to_x = scrollIn._to_x < 0 ? 0 : scrollIn._to_x;
	scrollIn._to_y = scrollIn._to_y < 0 ? 0 : scrollIn._to_y;


	// calculate scroll direction
	scrollIn._x_scroll_direction = scrollIn._to_x - u.scrollX();
	scrollIn._y_scroll_direction = scrollIn._to_y - u.scrollY();


	// _scroll_to_y and _scroll_to_x is the values to scroll to in next event
	// scrollIn._scroll_to_x = false;
	// scrollIn._scroll_to_y = false;

	scrollIn._scroll_to_x = u.scrollX();
	scrollIn._scroll_to_y = u.scrollY();



	// scroll event loopback
	scrollIn.scrollToHandler = function(event) {
//		u.bug("scrollToHandler:" + u.nodeId(this))

		u.t.resetTimer(this.t_scroll);
		this.t_scroll = u.t.setTimer(this, this._scrollTo, 50);
	}

	// add scroll event
	u.e.addEvent(scrollIn, "scroll", scrollIn.scrollToHandler);

	// cancel scrolling (if user interaction interrupts animation)
	scrollIn.cancelScrollTo = function() {

		u.t.resetTimer(this.t_scroll);
		u.e.removeEvent(this, "scroll", this.scrollToHandler);

		// make sure no further scrolling is done
		this._scrollTo = null;
	}

	// calculating scroll
	scrollIn._scrollTo = function(start) {

		// save current scroll postion for faster calculation
		var s_x = u.scrollX();
		var s_y = u.scrollY();

//		u.bug("_scrollTo: s_x=" + s_x + ", this._scroll_to_x=" + this._scroll_to_x + ", s_y=" + s_y + ", this._scroll_to_y=" + this._scroll_to_y)

		// if scroll value is as expected 
		// (no user interaction, thus current scroll is result of last scroll loop or initial state)
		// then calculate new scrolling values
		if(s_y == this._scroll_to_y && s_x == this._scroll_to_x) {

			// scrolling right
			if(this._x_scroll_direction > 0 && this._to_x > s_x) {
//				u.bug("right")
				this._scroll_to_x = Math.ceil(s_x + (this._to_x - s_x)/4);
			}
			// scrolling left
			else if(this._x_scroll_direction < 0 && this._to_x < s_x) {
//				u.bug("left")
				this._scroll_to_x = Math.floor(s_x - (s_x - this._to_x)/4);
			}
			else {
				this._scroll_to_x = this._to_x;
			}


			// scrolling down
			if(this._y_scroll_direction > 0 && this._to_y > s_y) {
//				u.bug("down")
				this._scroll_to_y = Math.ceil(s_y + (this._to_y - s_y)/4);
			}
			// scrolling up
			else if(this._y_scroll_direction < 0 && this._to_y < s_y) {
//				u.bug("up")
				this._scroll_to_y = Math.floor(s_y - (s_y - this._to_y)/4);
			}
			else {
				this._scroll_to_y = this._to_y;
			}


			// scrolling is considered done
			if(this._scroll_to_x == this._to_x && this._scroll_to_y == this._to_y) {
//				u.bug("done")

				// cancel scrolling
				this.cancelScrollTo();

				// just for the sake of it, go to final coords to compensate for any rounding offsets
				this.scrollTo(this._to_x, this._to_y);

				// callback
				if(typeof(this[this.callback_scroll_to]) == "function") {
					this[this.callback_scroll_to]();
				}

				// return before executing another scroll
				return;

			}

			// execute scroll
			this.scrollTo(this._scroll_to_x, this._scroll_to_y);

		}

		// if scroll function is active and scrolling position has changed from expected, it 
		// must mean user is interacting with browser - so cancel auto-scroll
		else {
//			u.bug("cancel autoscroll");

			// cancel scrolling
			this.cancelScrollTo();

			// callback
			if(typeof(this.scrolledToCancelled) == "function") {
				this.scrolledToCancelled();
			}
		}	
	}


	// start scrolling
	scrollIn._scrollTo();

}
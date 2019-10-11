u.scrollTo = function(node, _options) {

	node._callback_scroll_to = "scrolledTo";
	node._callback_scroll_cancelled = "scrollToCancelled";

	var offset_y = 0;
	var offset_x = 0;

	var scroll_to_x = 0;
	var scroll_to_y = 0;
	var to_node = false;

	node._force_scroll_to = false;



	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {

				case "callback"             : node._callback_scroll_to            = _options[_argument]; break;
				case "callback_cancelled"   : node._callback_scroll_cancelled     = _options[_argument]; break;
				case "offset_y"             : offset_y                           = _options[_argument]; break;
				case "offset_x"             : offset_x                           = _options[_argument]; break;

				case "node"                 : to_node                            = _options[_argument]; break;
				case "x"                    : scroll_to_x                        = _options[_argument]; break;
				case "y"                    : scroll_to_y                        = _options[_argument]; break;

				case "scrollIn"             : scrollIn                           = _options[_argument]; break;

				case "force"                : node._force_scroll_to              = _options[_argument]; break;

			}
		}
	}


	// getting internal scroll to coord
	if(to_node) {
		node._to_x = u.absX(to_node);
		node._to_y = u.absY(to_node);
	}
	else {
		node._to_x = scroll_to_x;
		node._to_y = scroll_to_y;
	}


	// compensate for offset
	node._to_x = offset_x ? node._to_x - offset_x : node._to_x;
	node._to_y = offset_y ? node._to_y - offset_y : node._to_y;


	// u.bug("node._to_x:" + node._to_x)
	// u.bug("node._to_y:" + node._to_y)


	// Native smoot-scrolling supported
	if (Util.support("scrollBehavior")) {
		var test = node.scrollTo({top:node._to_y, left:node._to_x, behavior: 'smooth'});
	}

	// Manual fallback method
	else {

		// Fix impossible values
		// Endpoint is outside page content
		if(node._to_y > (node == window ? document.body.scrollHeight : node.scrollHeight)-u.browserH()) {
			node._to_y = (node == window ? document.body.scrollHeight : node.scrollHeight)-u.browserH();
		}
		if(node._to_x > (node == window ? document.body.scrollWidth : node.scrollWidth)-u.browserW()) {
			node._to_x = (node == window ? document.body.scrollWidth : node.scrollWidth)-u.browserW();
		}

		// correct for negative values - cannot do native scroll to negative value
		node._to_x = node._to_x < 0 ? 0 : node._to_x;
		node._to_y = node._to_y < 0 ? 0 : node._to_y;


		// calculate scroll direction
		node._x_scroll_direction = node._to_x - u.scrollX();
		node._y_scroll_direction = node._to_y - u.scrollY();


		// _scroll_to_y and _scroll_to_x is the values to scroll to in next event
		// node._scroll_to_x = false;
		// node._scroll_to_y = false;

		node._scroll_to_x = u.scrollX();
		node._scroll_to_y = u.scrollY();


		node._ignoreWheel = function(event) {
			// u.bug("ignore wheel");
			u.e.kill(event);
		}
		if(node._force_scroll_to) {
			u.e.addEvent(node, "wheel", node._ignoreWheel);
		}


		// scroll event loopback
		node._scrollToHandler = function(event) {
			// u.bug("_scrollToHandler:", event);

			u.t.resetTimer(this.t_scroll);
			this.t_scroll = u.t.setTimer(this, this._scrollTo, 25);
		}

		// add scroll event
		// Cannot rely on scroll events as Safari doesn't throw all scroll event in zoomed state
		// u.e.addEvent(node, "scroll", node._scrollToHandler);

		// cancel scrolling (if user interaction interrupts animation)
		node._cancelScrollTo = function() {
			// console.log("_cancelScrollTo", this._force_scroll_to);
			if(!this._force_scroll_to) {

				u.t.resetTimer(this.t_scroll);
				// u.e.removeEvent(this, "scroll", this._scrollToHandler);

				// make sure no further scrolling is done
				this._scrollTo = null;
			
			}
		}

		// scrolling ended
		node._scrollToFinished = function() {
			// console.log("_scrollToFinished");
			// console.log(this);
			u.t.resetTimer(this.t_scroll);
			// u.e.removeEvent(this, "scroll", this._scrollToHandler);
			u.e.removeEvent(this, "wheel", this._ignoreWheel);

			// make sure no further scrolling is done
			this._scrollTo = null;

		}

		// IEMobile is not completely precise in scrolling, so to make it work we have to allow a little offset
		// Also an issue in Safari when browser is zoomed to non 100%
		// Issues are: window.scrollTo does not scroll to the stated coordinate (0, 1 or 2 px off)
		node._ZoomScrollFix = function(s_x, s_y) {

			if(Math.abs(this._scroll_to_y - s_y) <= 2 && Math.abs(this._scroll_to_x - s_x) <= 2) {
				return true;
			}
		
			return false;

		}

		// calculating scroll
		node._scrollTo = function(start) {
			// save current scroll postion for faster calculation
			var s_x = u.scrollX();
			var s_y = u.scrollY();

			// u.bug("_scrollTo: s_x=" + s_x + ", this._scroll_to_x=" + this._scroll_to_x + ", s_y=" + s_y + ", this._scroll_to_y=" + this._scroll_to_y)

			// if scroll value is as expected or forced scroll
			// (no user interaction, thus current scroll is result of last scroll loop or initial state)
			// then calculate new scrolling values
			// allow more relaxed comparison for IEMobile and zoomed browser view
			if((s_y == this._scroll_to_y && s_x == this._scroll_to_x) || this._force_scroll_to || this._ZoomScrollFix(s_x, s_y)) {

				// scrolling right
				if(this._x_scroll_direction > 0 && this._to_x > s_x) {
					// u.bug("right");
					// User projected value instead of current value to compensate for zoomed mis-calculation (see _ZoomScrollFix)
					this._scroll_to_x = Math.ceil(this._scroll_to_x + (this._to_x - this._scroll_to_x)/6);
					// this._scroll_to_x = Math.ceil(s_x + (this._to_x - s_x)/8);
				}
				// scrolling left
				else if(this._x_scroll_direction < 0 && this._to_x < s_x) {
					// u.bug("left");
					// User projected value instead of current value to compensate for zoomed mis-calculation (see _ZoomScrollFix)
					this._scroll_to_x = Math.floor(this._scroll_to_x - (this._scroll_to_x - this._to_x)/6);
					// this._scroll_to_x = Math.floor(s_x - (s_x - this._to_x)/8);
				}
				else {
					this._scroll_to_x = this._to_x;
				}


				// scrolling down
				if(this._y_scroll_direction > 0 && this._to_y > s_y) {
					// u.bug("down");
					// User projected value instead of current value to compensate for zoomed mis-calculation (see _ZoomScrollFix)
					this._scroll_to_y = Math.ceil(this._scroll_to_y + (this._to_y - this._scroll_to_y)/6);
					// this._scroll_to_y = Math.ceil(s_y + (this._to_y - s_y)/8);
				}
				// scrolling up
				else if(this._y_scroll_direction < 0 && this._to_y < s_y) {
					// u.bug("up");
					// User projected value instead of current value to compensate for zoomed mis-calculation (see _ZoomScrollFix)
					this._scroll_to_y = Math.floor(this._scroll_to_y - (this._scroll_to_y - this._to_y)/6);
					// this._scroll_to_y = Math.floor(s_y - (s_y - this._to_y)/8);
				}
				else {
					this._scroll_to_y = this._to_y;
				}


				// scrolling is considered done
				// console.log(this._scroll_to_y, this._to_y);
				if(this._scroll_to_x == this._to_x && this._scroll_to_y == this._to_y) {
					// u.bug("done")

					// scrolling finished
					this._scrollToFinished();

					// just for the sake of it, go to final coords to compensate for any rounding offsets
					this.scrollTo(this._to_x, this._to_y);

					// callback
					if(fun(this[this._callback_scroll_to])) {
						this[this._callback_scroll_to]();
					}

					// return before executing another scroll
					return;

				}

				// console.log("this._scroll_to_y:", this._scroll_to_y, "("+this._to_y+")");
				// execute scroll
				this.scrollTo(this._scroll_to_x, this._scroll_to_y);

				// Continue
				this._scrollToHandler();
			}

			// if scroll function is active and scrolling position has changed from expected, it 
			// must mean user is interacting with browser - so cancel auto-scroll
			else {
	//			u.bug("cancel autoscroll");

				// cancel scrolling
				this._cancelScrollTo();

				// callback
				if(fun(this[this._callback_scroll_cancelled])) {
					this[this._callback_scroll_cancelled]();
				}
			}	
		}


		// start scrolling
		node._scrollTo();

	}

}
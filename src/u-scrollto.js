u.scrollTo = function(node, _options) {

	node.callback_scroll_to = "scrolledTo";
	node.callback_scroll_cancelled = "scrolledToCancelled";

	var offset_y = 0;
	var offset_x = 0;

	var scroll_to_x = 0;
	var scroll_to_y = 0;
	var to_node = false;



	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {

				case "callback"             : node.callback_scroll_to           = _options[_argument]; break;
				case "callback_cancelled"   : node.callback_scroll_cancelled    = _options[_argument]; break;
				case "offset_y"             : offset_y                           = _options[_argument]; break;
				case "offset_x"             : offset_x                           = _options[_argument]; break;

				case "node"              : to_node                               = _options[_argument]; break;
				case "x"                    : scroll_to_x                        = _options[_argument]; break;
				case "y"                    : scroll_to_y                        = _options[_argument]; break;

				case "scrollIn"             : scrollIn                           = _options[_argument]; break;

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



	// scroll event loopback
	node.scrollToHandler = function(event) {
//		u.bug("scrollToHandler:" + u.nodeId(this))

		u.t.resetTimer(this.t_scroll);
		this.t_scroll = u.t.setTimer(this, this._scrollTo, 50);
	}

	// add scroll event
	u.e.addEvent(node, "scroll", node.scrollToHandler);

	// cancel scrolling (if user interaction interrupts animation)
	node.cancelScrollTo = function() {

		u.t.resetTimer(this.t_scroll);
		u.e.removeEvent(this, "scroll", this.scrollToHandler);

		// make sure no further scrolling is done
		this._scrollTo = null;
	}

	// IEMobile is not completely precise in scrolling, so to make it work we have to allow a little offset
	node.IEScrollFix = function(s_x, s_y) {
		if(!u.browser("ie")) {
			return false;
		}
		else if((s_y == this._scroll_to_y && (s_x == this._scroll_to_x+1 || s_x == this._scroll_to_x-1)) ||	(s_x == this._scroll_to_x && (s_y == this._scroll_to_y+1 || s_y == this._scroll_to_y-1))) {
			return true;
		}

	}

	// calculating scroll
	node._scrollTo = function(start) {

		// save current scroll postion for faster calculation
		var s_x = u.scrollX();
		var s_y = u.scrollY();

//		u.bug("_scrollTo: s_x=" + s_x + ", this._scroll_to_x=" + this._scroll_to_x + ", s_y=" + s_y + ", this._scroll_to_y=" + this._scroll_to_y)

		// if scroll value is as expected 
		// (no user interaction, thus current scroll is result of last scroll loop or initial state)
		// then calculate new scrolling values
		// allow more relaxed comparison for IEMobile
		if((s_y == this._scroll_to_y && s_x == this._scroll_to_x) || this.IEScrollFix(s_x, s_y)) {

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
			if(typeof(this[this.callback_scroll_cancelled]) == "function") {
				this[this.callback_scroll_cancelled]();
			}
		}	
	}


	// start scrolling
	node._scrollTo();

}
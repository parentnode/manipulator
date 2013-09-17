	window.scrollToTopHandler = function(event) {

		this._current_scroll_parent.t_scroll = u.t.setTimer(this._current_scroll_parent, this._current_scroll_parent.scrollToTop, 50);
		
	}

	page.cN.scrollToTop = function(start) {

		if(start) {

			window._current_scroll_parent = this;
			u.e.addEvent(window, "scroll", window.scrollToTopHandler);

			// custom - hide footer
			u.qs("#page").fN.hide();
		}
		if(u.scrollY() > 1) {
			// if scroll to top function is active and scrolling position is larger than last position, it 
			// must mean user is interacting with browser - so cancel auto-scroll
			if(!window._scroll_to_y || window._scroll_to_y >= u.scrollY()) {
				window._scroll_to_y = Math.floor(u.scrollY()-u.scrollY()/4);

				// TODO: timer is not set while iOS scrolling is in progress
				// could be fixed by adding scroll event, and setting timer on this event? But this might conflict with other scroll-handling

				window.scrollTo(0, window._scroll_to_y);
//				this.t_scroll = u.t.setTimer(this, this.scrollToTop, 50);
			}
			else {
				u.t.resetTimer(this.t_scroll);
				u.e.removeEvent(window, "scroll", window.scrollToTopHandler);
				window._scroll_to_y = false;
				this.changeContent();
			}
		}
		else {
			u.t.resetTimer(this.t_scroll);
			u.e.removeEvent(window, "scroll", window.scrollToTopHandler);
			window._scroll_to_y = false;
			window.scrollTo(0, 0);
			this.changeContent();
		}
	}
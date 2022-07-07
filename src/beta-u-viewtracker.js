u.viewTracker = function(node, _options) {

	node._view_offset_top = 0;
	node._view_offset_bottom = 0;

	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "offset_top"       : node._view_offset_top             = _options[_argument]; break;
				case "offset_bottom"    : node._view_offset_bottom          = _options[_argument]; break;
			}

		}
	}


	// Function that detects wether or not element is in view;
	node._is_visible = function(event) {

		// Get elements coordinates from window view
		var bounding = this.getBoundingClientRect();

		// Assigning element top and bottom for comparison
		var top = bounding.top;
		var bottom = bounding.bottom;


		// Get supported version of window height depending on browser
		var window_height = (window.innerHeight || document.documentElement.clientHeight);

		// If either top or bottom is bigger than 0 offset by navigations height and top is under window height,
		// then return true. Else return false.
		if(
			(top  > 0 + this._view_offset_top || bottom > 0 + this._view_offset_top)
			&&
			top < window_height
		) {
			if(fun(this.isVisible)) {
				this.isVisible({top: top, bottom: window_height - bottom, event:event});
			}
		}
		else {
			if(fun(this.isHidden)) {
				this.isHidden();
			}
		}

	}

	u.e.addWindowEvent(node, "scroll", node._is_visible);
}
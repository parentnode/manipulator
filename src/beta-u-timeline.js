u.timeline = function(node) {

	node._timeline_future_actions = [];

	// at timestamp, do action
	node.atDo = function(timestamp, action, id) {
		id = id || "";
		this._timeline_future_actions.push({"timestamp":timestamp, "action":action, "id":id});
	}

	node.playTimeline = function(_options) {

		var speed = 1;
		var start = 0;

		// additional info passed to function as JSON object
		if(obj(_options)) {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "speed"       : speed             = _options[argument]; break;
					case "start"       : start             = _options[argument]; break;
				}

			}
		}
		this._timeline_speed = speed;
		this._timeline_start = start;
		this._animationframe_cancelled = false;

//		console.log(JSON.parse(JSON.stringify(this._timeline_future_actions)));

		// start playback
		this._animationframe = window[u.vendorProperty("requestAnimationFrame")](this._first_timeline_frame.bind(this));
	}

	node.stopTimeline = function() {
		this._animationframe_cancelled = true;
		window[u.vendorProperty("cancelAnimationFrame")](this._animationframe);

		if(fun(this.timelineStopped)) {
			this.timelineStopped();
		}
	}



	node.finishTimelineAtOnce = function() {
		this._animationframe_cancelled = true;
		window[u.vendorProperty("cancelAnimationFrame")](this._animationframe);

		var i, frame;
		for(i = 0; i < this._timeline_future_actions.length; i++) {
			frame = this._timeline_future_actions[i];

			frame.action.bind(this)();
		}

		if(fun(this.timelineEnded)) {
			this.timelineEnded();
		}

	}

	// pass through this for the first frame to get starting time
	node._first_timeline_frame = function(timestamp) {
		this._animationframe_start = timestamp;
		this._animationframe = window[u.vendorProperty("requestAnimationFrame")](this._timeline_frame.bind(this));
	}

	node._timeline_frame = function(timestamp) {

		var progress = ((timestamp - this._animationframe_start) * this._timeline_speed) + this._timeline_start;
//		u.bug("progress:" + progress)

		// execute any relevant frames
		var i, frame;
		for(i = 0; i < this._timeline_future_actions.length; i++) {
			frame = this._timeline_future_actions[i];

			if(frame.timestamp < progress) {

				// execute action
				frame.action.bind(this)();

				// remove action
				this._timeline_future_actions.splice(i, 1);

				// compesate for the spliced action
				i--;
			}
			else {
				break;
			}
		}


		if(this._timeline_future_actions.length && !this._animationframe_cancelled) {
			this._animationframe = window[u.vendorProperty("requestAnimationFrame")](this._timeline_frame.bind(this));
		}
		else {
			if(fun(this.timelineEnded)) {
				this.timelineEnded();
			}
		}
	}

}
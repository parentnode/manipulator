
// Event chain
// Experimental approach (part of searching for optimal animation approach)
u.eventChain = function(node, _options) {

	// event array
	node._ec_events = [];

	// Add event to chain
	node.addEvent = function(node, action, duration) {
		this._ec_events.push({"node":node, "action":action, "duration":duration});
	}

	// start playback of event chaing
	node.play = function() {
		// this._ec_start_time = (this._ec_start_time == false ? Date.now() : this._ec_start_time);
		// u.bug("play:" + (this._ec_start_time - Date.now()) + ", " + this._ec_start_time);

		// stop any existing timers
		u.t.resetTimer(this.t_eventchain);

		// more events in chain?
		if(this._ec_events.length) {

			// get next event
			var _event = this._ec_events.shift();
			// execute action
			_event.action.call(_event.node);

			// set timeout for next event
			this.t_eventchain = u.t.setTimer(this, "play", _event.duration);
		}
		// chain has reached its end
		else {

			// callback if declared
			if(typeof(this.eventChainEnded) == "function") {
				this.eventChainEnded();
			}
		}
	}

	// stop event chain
	node.stop = function() {

		// stop any existing timers
		u.t.resetTimer(this.t_eventchain);

		// TODO: stop any running animations?

		// callback if declared
		if(typeof(this.eventChainEnded) == "function") {
			this.eventChainEnded();
		}
	}

}

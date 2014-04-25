// Ontimeout event handler object
Util.Timer = u.t = new function() {

	// actions to be preformed on onTimeout
	this._timers = new Array();


	// Add new timer to object
	this.setTimer = function(node, action, timeout) {
//		u.bug("setTimer:"+u.nodeId(node)+", "+typeof(action) +", "+timeout)

		var id = this._timers.length;
		this._timers[id] = {"_a":action, "_n":node, "_t":setTimeout("u.t._executeTimer("+id+")", timeout)};

		return id;
	}

	// Reset timer
	this.resetTimer = function(id) {
//		u.bug("resetTimer:");
//		u.xInObject(this._timers[id]);

		if(this._timers[id]) {
			clearTimeout(this._timers[id]._t);
			this._timers[id] = false;
		}
	}

	// execute added function on onTimeout
	this._executeTimer = function(id) {
//		u.bug("executeTimer:" + typeof(this._timers[id]._a) + ", " + this._timers[id]._n)

		var node = this._timers[id]._n;
		node._timer_action = this._timers[id]._a;
		node._timer_action();
		node._timer_action = null;

		this._timers[id] = false;
	}

	// Add new timer to object
	this.setInterval = function(node, action, interval) {

		var id = this._timers.length;
		this._timers[id] = {"_a":action, "_n":node, "_i":setInterval("u.t._executeInterval("+id+")", interval)};

		return id;
	}

	// Reset timer
	this.resetInterval = function(id) {

		if(this._timers[id]) {
			clearInterval(this._timers[id]._i);
			this._timers[id] = false;
		}
	}

	// execute added function on interval
	this._executeInterval = function(id) {

		var node = this._timers[id]._n;
		node._interval_action = this._timers[id]._a;
		node._interval_action();
		node._timer_action = null;
	}

	// is timer/interval valid (still active)
	this.valid = function(id) {
		return this._timers[id] ? true : false;
	}

	// reset all existing timers - should only be used if EVERYTHING needs to stop
	this.resetAllTimers = function() {
		var i, t;
		for(i = 0; i < this._timers.length; i++) {
			if(this._timers[i] && this._timers[i]._t) {
				this.resetTimer(i);
			}
		}
	}

	// reset all existing intervals - should only be used if EVERYTHING needs to stop
	this.resetAllIntervals = function() {
		var i, t;
		for(i = 0; i < this._timers.length; i++) {
			if(this._timers[i] && this._timers[i]._i) {
				this.resetInterval(i);
			}
		}
	}
}

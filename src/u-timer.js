// Ontimeout event handler object
Util.Timer = u.t = new function() {

	// actions to be preformed on onTimeout
	this._timers = new Array();


	// Add new timer to object
	this.setTimer = function(node, action, timeout, param) {
		// u.bug("setTimer:", node, typeof(action), timeout, typeof(timeout));

		var id = this._timers.length;
		param = param != undefined ? param : {"target":node, "type":"timeout"};

		this._timers[id] = {"_a":action, "_n":node, "_p":param, "_t":setTimeout("u.t._executeTimer("+id+")", timeout)};
		return id;
	}

	// Reset timer
	this.resetTimer = function(id) {
		// u.bug("resetTimer:", id, this._timers[id]);

		if(this._timers[id]) {
			clearTimeout(this._timers[id]._t);
			this._timers[id] = false;
		}
	}

	// execute added function on onTimeout
	this._executeTimer = function(id) {
		// u.bug("executeTimer:", id, this._timers[id]);

		var timer = this._timers[id];

		// clear timer (so callback will not be confused about existing timer)
		this._timers[id] = false;

		var node = timer._n;
		
		// function reference
		if(fun(timer._a)) {
			node._timer_action = timer._a;
			node._timer_action(timer._p);
			node._timer_action = null;
		}
		// function name
		else if(fun(node[timer._a])) {
			node[timer._a](timer._p);
		}

	}

	// Add new timer to object
	this.setInterval = function(node, action, interval, param) {

		var id = this._timers.length;
		param = param ? param : {"target":node, "type":"timeout"};
		this._timers[id] = {"_a":action, "_n":node, "_p":param, "_i":setInterval("u.t._executeInterval("+id+")", interval)};

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
		if(fun(this._timers[id]._a)) {
			node._interval_action = this._timers[id]._a;
			node._interval_action(this._timers[id]._p);
			node._interval_action = null;
		}
		else if(fun(node[this._timers[id]._a])) {
			node[this._timers[id]._a](this._timers[id]._p);
		}

	}

	// is timer/interval valid (still active)
	this.valid = function(id) {
//		u.bug("check timer:" + this._timers[id])
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

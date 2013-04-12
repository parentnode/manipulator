// Ontimeout event handler object
Util.Timer = u.t = new function() {

	// actions to be preformed on onTimeout
	this.actions = new Array();
	this.objects = new Array();
	this.timers = new Array();

	// Add new timer to object
	this.setTimer = function(object, action, timeout) {
		var id = this.actions.length;
		this.actions[id] = action;
		this.objects[id] = object;
		this.timers[id] = setTimeout("u.t.execute("+id+")", timeout);
		return id;
	}
	// Reset timer
	this.resetTimer = function(id) {
		clearTimeout(this.timers[id]);
		this.objects[id] = false;
	}

	// execute added function on onTimeout
	this.execute = function(id) {
		this.objects[id].exe = this.actions[id];
		this.objects[id].exe();

		// clear timeout info
		this.objects[id].exe = null;
		this.actions[id] = null;
		this.objects[id] = false;
		this.timers[id] = null;
	}

	this.valid = function(id) {
		return this.objects[id] ? true : false;
	}
}

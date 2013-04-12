Util.Onload = new function() {

	// actions to be preformed on onload
	this.actions = new Array();

	// forwarding function (onload event happens on window object)
	this.onloadCatcher = function(event) {
		Util.Onload.execute(event);
	}

	// add new funtion to onload 
	this.addAction = function(action) {

		// start catching event
		if(!this.actions.length) {
			Util.addEventHandler(window, "load", this.onloadCatcher);
		}
		// add action
		this.actions[this.actions.length] = action;
	}

	// execute added function on onload
	this.execute = function() {
		var i, action;

		// Run onload initialization and test functions here
		// Init interface
//		u.init(document.body);
		//Util.addEventHandler(document, "keydown", Util.Onkeydown.shortcutCatcher);
		//testIt();

		// functions kept in actions array
		for(i = 0; action = this.actions[i]; i++) {

			// decide type and execute accordingly
			if(typeof(action) == "function") {
				action();
			}
			else {
				eval(action);
			}
		}
	}
}
// Turn on onload event execution
//Util.addEventHandler(window, "load", Util.Onload.onloadCatcher);
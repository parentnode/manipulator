
// Onkeydown event handler object
Util.Keys = u.k = new function() {

	// container for shortcuts
	this.shortcuts = new Array();
//	this.input = "";

	// timer for shortcut timewindow
//	this.timer = null;

	// forwarding function (onkeydown event happens on window object)
	this.onkeydownCatcher = function(event) {
//		Util.nonClick(event);
		u.k.catchKey(event);
	}

	// end time loop (has to be global because setTimeout executes on window object)
//	this.stopSCWindow = function() {
//		Util.Onkeydown.timer = null;
//		Util.Onkeydown.execute();
//	}

	// add new shortcut
	this.addKey = function(key, action) {

//		u.bug("ad");
		// start catching event
		if(!this.shortcuts.length) {
			u.e.addEvent(document, "keydown", this.onkeydownCatcher);
		}
		
		if(!this.shortcuts[key.toString().toUpperCase()]) {
//			Util.debug("a"+this.shortcuts[key.toString().toUpperCase()]);
			this.shortcuts[key.toString().toUpperCase()] = new Array();
		}

		this.shortcuts[key.toString().toUpperCase()].push(action);
//		this.shortcuts[key.toString().toUpperCase()] = action;
		
//		Util.debug("l:" + this.shortcuts.length)
		
//		Util.debug("a"+this.shortcuts[key.toString().toUpperCase()]);
		// set shortcut if it doesnt exist
//		if(this.shortcuts[key.toString().toUpperCase()] == undefined) {
//		}
//		else{
//			alert("Shortcut for: " + key + "\nconflicts with shortcut\naction: " + this.shortcuts[key].action);
//		}
		// set shortcut if it doesnt exist
//		if(this.shortcuts[key.toString().toUpperCase()] == undefined) {
//			this.shortcuts[key.toString().toUpperCase()] = action;
//		}
//		else{
//			alert("Shortcut for: " + key + "\nconflicts with shortcut\naction: " + this.shortcuts[key].action);
//		}
	}

	// execute 
//	this.execute = function(event) {
//		if(this.shortcuts[this.input] && (event.ctrlKey || event.metaKey)) {
//			Util.nonClick(event);
//			eval(this.shortcuts[this.input]);
//		}
//		this.input = "";
//	}

	// catch key
	this.catchKey = function(event) {
		var action, i, key;
		event = event ? event : window.event;
		key = String.fromCharCode(event.keyCode);

		u.bug("e:" + key + ":"+event.keyCode+":" + this.shortcuts.length)
		if((event.ctrlKey || event.metaKey) && this.shortcuts[key]) {
			u.e.kill(event);
			action = this.shortcuts[key].pop();
//			for(i = 0; action = this.shortcuts[key][i]; i++) {
//				u.bug(key+":"+action + "::" + action.parentNode);
				if(typeof(action) == "object") {
					action.clicked();
				}
				else if(typeof(action) == "function") {
					action();
				}
				else {
					eval(action);
				}
//			}

		}
		if(event.keyCode == 27 && this.shortcuts["ESC"]) {
			u.e.kill(event);

			action = this.shortcuts["ESC"].pop();
//			for(i = 0; action = this.shortcuts["ESC"][i]; i++) {
				u.bug("esc:"+action + "::" + u.nodeId(action) + ", " + typeof(action));
				if(typeof(action) == "object") {
					action.clicked();
				}
				else if(typeof(action) == "function") {
					action();
				}
				else {
					eval(action);
				}
//			}
		}
//		alert("Key: " + pressed_key + "\nKeyCode: " + event.keyCode + "\nCtrl:"  + event.ctrlKey + "\nMeta:"  + event.metaKey);

		// if ESC -> start shortcut time window
//		if(event.keyCode == 27) {
//			this.timer = setTimeout('Util.Onkeydown.stopSCWindow()', 2000);
//		}
		// if timewindow is open, react to input
//		else if(this.timer) {
//			this.input += pressed_key;
//		}
//		this.execute(event);
	}
}

//Util.Onkeydown.addShortcut("s", "alert('test')");

// Keyboard event handler object
Util.Keyboard = u.k = new function() {

	// Array for shortcuts
	this.shortcuts = new Array();

	// forwarding function (onkeydown event happens on window object)
	this.onkeydownCatcher = function(event) {

		u.k.catchKey(event);
	}


// TODO: refine function syntax

// u.k.addKey(node, key, _options) ?
// where options are
// - node
// - function ?
// - callback ? (string with function name or full function)
// - what is eval intended for currently??

// we should always have a node reference to check whether node still exists when shortcut is invoked
// theory: if node does not exist, pop it and try previous
//  - this allows for a stack of actions which should work on ajax sites


	// default callback: clicked

	// add new shortcut
	this.addKey = function(node, key, _options) {

		node.callback_keyboard = "clicked";
		node.metakey_required = true;

		if(typeof(_options) == "object") {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "callback"		: node.callback_keyboard	= _options[argument]; break;
					case "metakey"		: node.metakey_required		= _options[argument]; break;
				}

			}
		}

		// start catching event on first added key
		if(!this.shortcuts.length) {
			u.e.addEvent(document, "keydown", this.onkeydownCatcher);
		}

		if(!this.shortcuts[key.toString().toUpperCase()]) {
//			Util.debug("a"+this.shortcuts[key.toString().toUpperCase()]);
			this.shortcuts[key.toString().toUpperCase()] = new Array();
		}

		// add key and node to shortcut array
		this.shortcuts[key.toString().toUpperCase()].push(node);
	}


	// catch key
	// executes when key is pressed
	// callback to node.callback_keyboard (default clicked)
	this.catchKey = function(event) {

		var nodes, node, i, key;

		// correct old IE event
		event = event ? event : window.event;

		// get key value
		key = String.fromCharCode(event.keyCode);
		// special case for ESC key
		if(event.keyCode == 27) {
			key = "ESC";
		}

//		u.bug("catchKey:" + key + ":"+event.keyCode+":" + this.shortcuts.length)
		u.xInObject(this.shortcuts);


		// is anything registered for this key
		if(this.shortcuts[key]) {

			// get related nodes
			nodes = this.shortcuts[key];

			for(i = 0; node = nodes[i]; i++) {

				// is node still defined
				if(node) {

					// only execute visible nodes and check for metakey
					if(node.offsetHeight && ((event.ctrlKey || event.metaKey) || !node.metakey_required)) {
						u.e.kill(event);

						// execute
						if(typeof(node[node.callback_keyboard]) == "function") {
							node[node.callback_keyboard](event);
						}
					}
					
				}
				// on ajax sites shortcuts array may live for a long time - keep it trimmed
				// node is lost, remove from shortcuts array
				else {
					this.shortcuts[key].splice(i, 1);
					i--;
				}
			}
		}

		u.xInObject(this.shortcuts);


// 		if((event.ctrlKey || event.metaKey) || !node.metakey_required) {
// 			u.e.kill(event);
// //			action = this.shortcuts[key].pop();
// //			for(i = 0; action = this.shortcuts[key][i]; i++) {
// //				u.bug(key+":"+action + "::" + action.parentNode);
// 				if(typeof(action) == "object") {
// 					action.clicked();
// 				}
// 				else if(typeof(action) == "function") {
// 					action();
// 				}
// 				else {
// 					eval(action);
// 				}
// //			}
//
// 		}
// 		if(event.keyCode == 27 && this.shortcuts["ESC"]) {
// 			u.e.kill(event);
//
// 			action = this.shortcuts["ESC"].pop();
// //			for(i = 0; action = this.shortcuts["ESC"][i]; i++) {
// 				u.bug("esc:"+action + "::" + u.nodeId(action) + ", " + typeof(action));
// 				if(typeof(action) == "object") {
// 					action.clicked();
// 				}
// 				else if(typeof(action) == "function") {
// 					action();
// 				}
// 				else {
// 					eval(action);
// 				}
// //			}
// 		}
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

// Keyboard shortcut event handler object
// maps keys to nodes
// default callback is node.clicked
// metakey/ctrlkey is required as default unless it is ESC-key
// optional restrict callback to focused stack
// optional value to pass with callback
Util.Keyboard = u.k = new function() {

	// Object for shortcuts
	this.shortcuts = {};

	// forwarding function (onkeydown event happens on window object)
	this.onkeydownCatcher = function(event) {

		u.k.catchKey(event);
	}


	// default callback: clicked
	// add new shortcut to node
	this.addKey = function(node, key, _options) {

		var shortcut = {"node": node};
		shortcut.callback_keyboard = "clicked";
		shortcut.metakey_required = true;

		shortcut.focus_required = false;

		// value to pass on with callback
		shortcut.value = false;


		if(obj(_options)) {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "callback"		: shortcut.callback_keyboard	= _options[argument]; break;
					case "metakey"		: shortcut.metakey_required		= _options[argument]; break;

					case "focused"		: shortcut.focus_required		= _options[argument]; break;

					case "value"		: shortcut.value				= _options[argument]; break;
				}

			}
		}

		var key_index = key.toString().toUpperCase();

		// start catching event on first added key
		if(!this.shortcuts.length) {
			u.e.addEvent(document, "keydown", this.onkeydownCatcher);
		}

		if(!this.shortcuts[key_index]) {
//			Util.debug("a"+this.shortcuts[key.toString().toUpperCase()]);
			this.shortcuts[key_index] = new Array();
		}

		// add key and node to shortcut array
		this.shortcuts[key_index].push(shortcut);
	}


	// catch key
	// executes when key is pressed
	// callback to node.callback_keyboard (default clicked)
	this.catchKey = function(event) {

		// correct old IE event
		event = event ? event : window.event;

		// get key value
		var key = String.fromCharCode(event.keyCode);


		// special case for ESC key
		if(event.keyCode == 27) {
			key = "ESC";
		}
		// special case for arrow up key
		else if(event.keyCode == 38) {
			key = "UP";
		}
		// special case for arrow right key
		else if(event.keyCode == 39) {
			key = "RIGHT";
		}
		// special case for arrow down key
		else if(event.keyCode == 40) {
			key = "DOWN";
		}
		// special case for arrow left key
		else if(event.keyCode == 37) {
			key = "LEFT";
		}
		// special case for arrow ENTER key
		else if(event.keyCode == 13) {
			key = "ENTER";
		}
		// special case for TAB key
		else if(event.keyCode == 9) {
			key = "TAB";
		}
		// special case for DELETE key
		else if(event.keyCode == 8) {
			key = "DELETE";
		}
		// special case for + key
		else if(event.keyCode == 171) {
			key = "+";
		}

		// u.bug("catchKey:" + key + ":"+event.keyCode, this.shortcuts[key], event);


		// is anything registered for this key
		if(this.shortcuts[key]) {

			var shortcuts, shortcut, i;

			// get related nodes
			shortcuts = this.shortcuts[key];

			// loop throgh nodes
			for(i = 0; i < shortcuts.length; i++) {
				shortcut = shortcuts[i];

				// is node still attached to document.body
				if(u.contains(document.body, shortcut.node)) {

					// only execute visible nodes and check for metakey
					if(shortcut.node.offsetHeight && ((event.ctrlKey || event.metaKey) || (!shortcut.metakey_required || key == "ESC"))) {

						// Only execute shortcut if event occured in focused stack
						if(!shortcut.focus_required || u.containsOrIs(shortcut.node, event.target)) {

							u.e.kill(event);


							// execute
							// function reference
							if(fun(shortcut.callback_keyboard)) {
								shortcut.callback_keyboard(event, shortcut.value);
							}
							// function name
							else if(fun(shortcut.node[shortcut.callback_keyboard])) {
								shortcut.node[shortcut.callback_keyboard](event, shortcut.value);
							}

						}

					}

				}

				// node is lost, remove from shortcuts array
				// on ajax sites shortcuts object may live for a long time - keep it trimmed
				// node is not collected by garbage collector as long as it is referenced
				else {

					// remove from array
					this.shortcuts[key].splice(i, 1);

					// remove key index if no nodes exist for key
					if(!this.shortcuts[key].length) {
						delete this.shortcuts[key];
						break;
					}
					else {
						i--;
					}
				}

			}
		}

	}

	// remove shortcut from node
	this.removeKey = function(node, key) {

		var key_index = key.toString().toUpperCase();

		// u.bug("removeKey", node, key, this.shortcuts[key_index]);

		if(this.shortcuts && this.shortcuts[key_index]) {

			// look for node in shortcut index
			var index = u.arrayKeyValue(this.shortcuts[key_index], "node", node);
			if(index !== false) {
				this.shortcuts[key_index].splice(index, 1);
			}

		}

		// u.bug("removed", this.shortcuts[key_index]);

	}

}

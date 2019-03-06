// Keyboard shortcut event handler object
// maps keys to nodes
// default callback is node.clicked
// metakey/ctrlkey is required as default unless it is ESC-key
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

		node.callback_keyboard = "clicked";
		node.metakey_required = true;

		if(obj(_options)) {
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

		// correct old IE event
		event = event ? event : window.event;

		// get key value
		var key = String.fromCharCode(event.keyCode);

		// special case for ESC key
		if(event.keyCode == 27) {
			key = "ESC";
		}

//		u.bug("catchKey:" + key + ":"+event.keyCode + ", " + this.shortcuts[key]);
//		u.e.kill(event);
//		u.xInObject(this.shortcuts);


		// is anything registered for this key
		if(this.shortcuts[key]) {

			var nodes, node, i;

			// get related nodes
			nodes = this.shortcuts[key];

			// loop throgh nodes
			for(i = 0; i < nodes.length; i++) {
				node = nodes[i];

				// is node still attached to document.body
				if(u.contains(document.body, node)) {

					// only execute visible nodes and check for metakey
					if(node.offsetHeight && ((event.ctrlKey || event.metaKey) || (!node.metakey_required || key == "ESC"))) {
						u.e.kill(event);

						// execute
						if(fun(node[node.callback_keyboard])) {
							node[node.callback_keyboard](event);
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

}

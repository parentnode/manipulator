// ABOUT THE fontsReady module
//
// STANDARD METHOD
// Use the font API (document.fonts) to check if the font is loaded.
//
//
// FALLBACK METHOD
// Create two div's, one with reference Times text and one with selected font and Times as secondary font.
// When the sizes of the two element differ, then the selected font has been loaded.
// This approach is broken in newer webkit browsers, where the size differs, but the font still isn't ready for rendering.


// specify fonts like this:
// only family is required

// {"family":"OpenSans", "weight":"600", "style":"italic", "size": "16px"}
// to load more fonts, put the objects in an array like
// [{"family":"OpenSans", "weight":"600", "style":"italic"},{"family":"OpenSans", "weight":"600", "style":"italic"}]


u.fontsReady = function(node, fonts, _options) {

	var callback_loaded = "fontsLoaded";
	var callback_timeout = "fontsNotLoaded";
	var max_time = 3000;

	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "callback"					: callback_loaded		= _options[_argument]; break;
				case "timeout"					: callback_timeout		= _options[_argument]; break;
				case "max"						: max_time				= _options[_argument]; break;
			}
		}
	}


	// create global font stack to void loading the same font twice
	window["_man_fonts_"] = window["_man_fonts_"] || {};

	// detect font api availability
	window["_man_fonts_"].fontApi = document.fonts && fun(document.fonts.check) ? true : false;
	window["_man_fonts_"].fonts = window["_man_fonts_"].fonts || {};


	var font, node, i;

	// convert to array if is not already
	if(typeof(fonts.length) == "undefined") {
		font = fonts;
		fonts = new Array();
		fonts.push(font);
	}


	// create unique loadkey for current stack (to provide individual callbacks for separate checks)
	var loadkey = u.randomString(8);
	
	// create loader object (object or node for fallback method)
	// Is font API available
	if(window["_man_fonts_"].fontApi) {

		// Create loading object
		window["_man_fonts_"+loadkey] = {};
	}
	else {

		// Create and append loading node
		window["_man_fonts_"+loadkey] = u.ae(document.body, "div");

		// object for style/weight reference nodes
		window["_man_fonts_"+loadkey].basenodes = {};

	}


	// create load stack
	window["_man_fonts_"+loadkey].nodes = [];

	// Start Timeout checker
	window["_man_fonts_"+loadkey].t_timeout = u.t.setTimer(window["_man_fonts_"+loadkey], "fontCheckTimeout", max_time);

	// store load settings
	window["_man_fonts_"+loadkey].loadkey = loadkey;
	window["_man_fonts_"+loadkey].callback_node = node;
	window["_man_fonts_"+loadkey].callback_loaded = callback_loaded;
	window["_man_fonts_"+loadkey].callback_timeout = callback_timeout;


	// Prepare fonts for loaded-test
	for(i = 0; i < fonts.length; i++) {
		font = fonts[i];

		// set default style + weight
		font.style = font.style || "normal";
		font.weight = font.weight || "400";
		font.size = font.size || "16px";
		font.status = "waiting";

		font.id = u.superNormalize(font.family+font.style+font.weight);

		// add to global stack (to avoid loading a font that was previously loaded)
		if(!window["_man_fonts_"].fonts[font.id]) {
			window["_man_fonts_"].fonts[font.id] = font;
		}


		// Is font API available
		if(window["_man_fonts_"].fontApi) {

			// create object for font information
			node = {};

		}
		// Fallback
		else {

			// add reference base font with given weight+style, if it does not already exist
			if(!window["_man_fonts_"+loadkey].basenodes[u.superNormalize(font.style+font.weight)]) {
				window["_man_fonts_"+loadkey].basenodes[u.superNormalize(font.style+font.weight)] = u.ae(window["_man_fonts_"+loadkey], "span", {"html":"I'm waiting for your fonts to load!","style":"font-family: Times !important; font-style: "+font.style+" !important; font-weight: "+font.weight+" !important; font-size: "+font.size+" !important; line-height: 1em !important; opacity: 0 !important;"});
			}

			// add font node font information and for testing this variant
			node = u.ae(window["_man_fonts_"+loadkey], "span", {"html":"I'm waiting for your fonts to load!","style":"font-family: '"+font.family+"', Times !important; font-style: "+font.style+" !important; font-weight: "+font.weight+" !important; font-size: "+font.size+" !important; line-height: 1em !important; opacity: 0 !important;"});

		}


		// map font info to test object
		node.font_size = font.size;
		node.font_family = font.family;
		node.font_weight = font.weight;
		node.font_style = font.style;
		node.font_id = font.id;
		node.loadkey = loadkey;


		// add this font to current font load stack
		window["_man_fonts_"+loadkey].nodes.push(node);

	}


	// Use fonts api to check if fonts are loaded
	window["_man_fonts_"+loadkey].checkFontsAPI = function() {
		// u.bug("checkFontsAPI", this.loadkey);

		var i, node, font_string;

		for(i = 0; i < this.nodes.length; i++) {
			node = this.nodes[i];

			// only load if font has not already been loaded (in this or other context)
			if(window["_man_fonts_"].fonts[node.font_id] && window["_man_fonts_"].fonts[node.font_id].status == "waiting") {
	
				// font string to load
				font_string = node.font_style + " " + node.font_weight + " " + node.font_size + " " + node.font_family;

				// load font and deal with load result
				document.fonts.load(font_string).then(function(fontFaceSetEvent) {

					if(fontFaceSetEvent && fontFaceSetEvent.length && fontFaceSetEvent[0].status == "loaded") {
						window["_man_fonts_"].fonts[this.font_id].status = "loaded";
					}
					else {
						window["_man_fonts_"].fonts[this.font_id].status = "failed";
					}

					// check current load status (if loading is still in progress)
					if(window["_man_fonts_"+this.loadkey] && fun(window["_man_fonts_"+this.loadkey].checkFontsStatus)) {
						window["_man_fonts_"+this.loadkey].checkFontsStatus();
					}

				}.bind(node));

			}

		}

		// check current load status
		if(fun(this.checkFontsStatus)) {
			this.checkFontsStatus();
		}

	}


	// Use fallback method to check if fonts are loaded
	window["_man_fonts_"+loadkey].checkFontsFallback = function() {
		// u.bug("checkFontsFallback", this.loadkey);

		var basenode, i, node;

		for(i = 0; i < this.nodes.length; i++) {
			node = this.nodes[i];

			// find basenode for comparison
			basenode = this.basenodes[u.superNormalize(node.font_style+node.font_weight)];

			// check node sizes -  when node changes size, then it is loaded
			if(node.offsetWidth != basenode.offsetWidth || node.offsetHeight != basenode.offsetHeight) {
				window["_man_fonts_"].fonts[node.font_id].status = "loaded";
			}
		}

		// plan next check in 30ms
		this.t_fallback = u.t.setTimer(this, "checkFontsFallback", 30);

		// check current load status
		if(fun(this.checkFontsStatus)) {
			this.checkFontsStatus();
		}

	}

	// callback on timeout
	window["_man_fonts_"+loadkey].fontCheckTimeout = function(event) {
		// u.bug("timeout", this.loadkey);

		// cancel fallback timer just in case
		u.t.resetTimer(this.t_fallback);

		// clean up
		delete window["_man_fonts_"+this.loadkey];

		// remove fallback nodes
		if(this.parentNode) {
			this.parentNode.removeChild(this);
		}

		// give up - max time has passed
		if(fun(this.callback_node[this.callback_timeout])) {
			this.callback_node[this.callback_timeout](this.nodes);
		}
		// return response to loaded in case timeout callback has not been declared
		else if(fun(this.callback_node[this.callback_loaded])) {
			this.callback_node[this.callback_loaded](this.nodes);
		}

	}

	// Check font status
	// Loops through fonts to check if they are all loaded
	// Make callback and clean-up if everything is loaded – do nothing if not
	window["_man_fonts_"+loadkey].checkFontsStatus = function(event) {
		// u.bug("checkFontsStatus", this.loadkey);

		var i, node;
		for(i = 0; i < this.nodes.length; i++) {
			node = this.nodes[i];

			// Look for any not-yet-loaded fonts
			if(window["_man_fonts_"].fonts[node.font_id].status == "waiting") {
				return;
			}

		}


		// All fonts are loaded


		// stop timer
		u.t.resetTimer(this.t_timeout);
		u.t.resetTimer(this.t_fallback);

		// clean up
		delete window["_man_fonts_"+this.loadkey];

		// remove fallback nodes
		if(this.parentNode) {
			this.parentNode.removeChild(this);
		}


		// callbacks?
		if(fun(this.callback_node[this.callback_loaded])) {

			// API
			if(this.fontApi) {
				this.callback_node[this.callback_loaded](this.nodes);
			}
			// Fallback - Allow browser to digest font (without delay, font doesn't always render correctly)
			else {
				setTimeout(function() {
					this.callback_node[this.callback_loaded](this.nodes); 
				}.bind(this), 250);
			}

		}

	}




	// Start loading/checker
	// API available
	if(window["_man_fonts_"].fontApi) {

		// Start checking using the Font API
		window["_man_fonts_"+loadkey].checkFontsAPI();
	}
	// Fallback method
	else {

		// Start checking using fallback method
		window["_man_fonts_"+loadkey].checkFontsFallback();
	}

}
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
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "callback"					: callback_loaded		= _options[_argument]; break;
				case "timeout"					: callback_timeout		= _options[_argument]; break;
				case "max"						: max_time				= _options[_argument]; break;
			}
		}
	}


	// detect font api availability
	// create global font stack to void loading the same font twice
	window["_man_fonts_"] = window["_man_fonts_"] || {};

//	var fontApi = false;
	window["_man_fonts_"].fontApi = document.fonts && typeof(document.fonts.check) == "function" ? true : false;
	window["_man_fonts_"].fonts = window["_man_fonts_"].fonts || {};



	var font, node, i;

	// convert to array if is not already
	if(typeof(fonts.length) == "undefined") {
		font = fonts;
		fonts = new Array();
		fonts.push(font);
	}

	//	u.bug("fonts:" + fonts.length);


	// create unique loadkey for current stack (to provide individual callbacks for separate checks)
	var loadkey = u.randomString(8);
	
	// create loader object (object or node for fallback method)
	// Is font API available
	if(window["_man_fonts_"].fontApi) {

		window["_man_fonts_"+loadkey] = {};

		// set timeout checker
		window["_man_fonts_"+loadkey].t_timeout = u.t.setTimer(window["_man_fonts_"+loadkey], "checkFontsStatus", max_time);

	}
	else {
		
		// append loader
		window["_man_fonts_"+loadkey] = u.ae(document.body, "div");

		// object for style/weight reference nodes
		window["_man_fonts_"+loadkey].basenodes = {};

	}

	// create load stack
	window["_man_fonts_"+loadkey].nodes = [];


	// store load settings
	window["_man_fonts_"+loadkey].loadkey = loadkey;
	window["_man_fonts_"+loadkey].callback_node = node;
	window["_man_fonts_"+loadkey].callback_name = callback_loaded;
	window["_man_fonts_"+loadkey].callback_timeout = callback_timeout;
	window["_man_fonts_"+loadkey].max_time = max_time;
	window["_man_fonts_"+loadkey].start_time = new Date().getTime();


	// Prepare fonts for loaded-test
	for(i = 0; font = fonts[i]; i++) {

		// set default style + weight
		font.style = font.style || "normal";
		font.weight = font.weight || "400";
		font.size = font.size || "16px";
		font.status = "waiting";

		font.id = u.normalize(font.family+font.style+font.weight);

		// add to global stack
		if(!window["_man_fonts_"].fonts[font.id]) {
			window["_man_fonts_"].fonts[font.id] = font;
		}


		// Is font API available
		if(window["_man_fonts_"].fontApi) {

			// create object for font information
			node = {};

		}
		else {

			// add reference base font with given weight+style, if it does not already exist
			if(!window["_man_fonts_"+loadkey].basenodes[font.style+font.weight]) {
				window["_man_fonts_"+loadkey].basenodes[font.style+font.weight] = u.ae(window["_man_fonts_"+loadkey], "span", {"html":"I'm waiting for your fonts to load!","style":"font-family: Times !important; font-style: "+font.style+" !important; font-weight: "+font.weight+" !important; font-size: "+font.size+" !important; line-height: 1em !important; opacity: 0 !important;"});
			}

			// add font for testing this variant
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


	window["_man_fonts_"+loadkey].checkFontsAPI = function() {


		var i, node, font_string;

		for(i = 0; node = this.nodes[i]; i++) {

			// only load if font has not already been loaded
			if(window["_man_fonts_"].fonts[node.font_id] && window["_man_fonts_"].fonts[node.font_id].status == "waiting") {
	

				// font string to load
				font_string = node.font_style + " " + node.font_weight + " " + node.font_size + " " + node.font_family;
//				console.log(font_string);


//				console.log("check:" + document.fonts.check(font_string))


				// load font and deal with load result
				document.fonts.load(font_string).then(function(fontFaceSetEvent) {

					if(fontFaceSetEvent && fontFaceSetEvent.length && fontFaceSetEvent[0].status == "loaded") {
						window["_man_fonts_"].fonts[this.font_id].status = "loaded";
					}
					else {
//						console.log("FAILED TO LOAD FONT: " + this.font_family + ", " + this.font_weight + ", " + this.font_style);
						window["_man_fonts_"].fonts[this.font_id].status = "failed";
					}

//					console.log("font loaded");
//					console.log("time:" + (new Date().getTime() - window["_man_fonts_"+this.loadkey].start_time));
//					console.log(fontFaceSetEvent);
//					console.log(this);

//					console.log("load stack:")
//					console.log(window["_man_fonts_"+this.loadkey])
//					console.log(typeof(window["_man_fonts_"+this.loadkey].checkFontsStatus));


					// check current load status
					if(window["_man_fonts_"+this.loadkey] && typeof(window["_man_fonts_"+this.loadkey].checkFontsStatus) == "function") {
//						console.log("do check")
						window["_man_fonts_"+this.loadkey].checkFontsStatus();
					}

				}.bind(node));


			}
			else {
//				console.log("already loaded: " + node.font_style + " " + node.font_weight + " " + node.font_size + " " + node.font_family)
			}

		}

		// check current load status
		if(typeof(this.checkFontsStatus) == "function") {
			this.checkFontsStatus();
		}

	}


	window["_man_fonts_"+loadkey].checkFontsStatus = function(event) {
//		u.bug("checkFontsStatus");

		var i, node;
		for(i = 0; node = this.nodes[i]; i++) {
//			console.log(window["_man_fonts_"].fonts[node.font_id]);
			if(window["_man_fonts_"].fonts[node.font_id].status == "waiting") {

				// continue checking if max time has not been reached
				if(this.start_time + this.max_time <= new Date().getTime()) {

					// give up - max time has passed
					if(typeof(this.callback_node[this.callback_timeout]) == "function") {
						this.callback_node[this.callback_timeout]();
					}
					else if(typeof(this.callback_node[this.callback_name]) == "function") {
						this.callback_node[this.callback_name]();
					}

					// stop timer
					u.t.resetTimer(this.t_timeout);
					// clean up
					delete window["_man_fonts_"+this.loadkey];


				}

				return;
			}

		}



		// all fonts are loaded
		if(typeof(this.callback_node[this.callback_name]) == "function") {
			this.callback_node[this.callback_name]();
		}

		// stop timer
		u.t.resetTimer(this.t_timeout);
		// clean up
		delete window["_man_fonts_"+this.loadkey];
		
	}



	// checking if fonts are loaded (fallback method)
	window["_man_fonts_"+loadkey].checkFontsFallback = function() {

		var basenode, i, node, loaded = 0;

		for(i = 0; node = this.nodes[i]; i++) {

			// find basenode for comparison
			basenode = this.basenodes[node.font_style+node.font_weight];

			// check node
			if(node.offsetWidth != basenode.offsetWidth || node.offsetHeight != basenode.offsetHeight) {
				loaded++;
			}
		}

		// all fonts loaded
		if(loaded == this.nodes.length) {
			if(typeof(this.callback_node[this.callback_name]) == "function") {
				this.callback_node[this.callback_name]();
			}

			// clean up
			this.parentNode.removeChild(this);
		}
		// continue checking
		else {
			// continue checking if max time has not been reached
			if(this.start_time + this.max_time > new Date().getTime()) {
				u.t.setTimer(this, "checkfonts", 30);
			}

			// give up - max time has passed
			else {
				if(typeof(this.callback_node[this.callback_timeout]) == "function") {
					this.callback_node[this.callback_timeout]();
				}
				else if(typeof(this.callback_node[this.callback_name]) == "function") {
					this.callback_node[this.callback_name]();
				}
			}
		}

	}



	if(window["_man_fonts_"].fontApi) {

		// start checking using the Font API
		window["_man_fonts_"+loadkey].checkFontsAPI();

	}
	else {

		// start checking using fallback method
		window["_man_fonts_"+loadkey].checkFontsFallback();

	}

}
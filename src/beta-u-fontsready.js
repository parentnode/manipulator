// specify fonts like this:

// {"family":"OpenSans", "weight":"600", "style":"italic"}
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



	var font, node, i;
	var loadkey = u.randomString(8);

	// convert to array if is not already
	if(typeof(fonts.length) == "undefined") {
		font = fonts;
		fonts = new Array();
		fonts.push(font);
	}
	
//	u.bug("fonts:" + fonts.length);

	window["_man_fonts_"+loadkey] = u.ae(document.body, "div");
	window["_man_fonts_"+loadkey].nodes = [];

	// object for style/weight reference nodes
	window["_man_fonts_"+loadkey].font_style_weight = {};

	// store callback information
	window["_man_fonts_"+loadkey].callback_node = node;
	window["_man_fonts_"+loadkey].callback_name = callback_loaded;
	window["_man_fonts_"+loadkey].callback_timeout = callback_timeout;
	window["_man_fonts_"+loadkey].max_time = max_time;
	window["_man_fonts_"+loadkey].start_time = new Date().getTime();

	// create reference and test nodes
	for(i = 0; font = fonts[i]; i++) {

		// set default style + weight
		font.style = font.style ? font.style : "normal";
		font.weight = font.weight ? font.weight : "400";

		// add base font with given weight+style
		if(!window["_man_fonts_"+loadkey].font_style_weight[font.style+font.weight]) {
			window["_man_fonts_"+loadkey].font_style_weight[font.style+font.weight] = u.ae(window["_man_fonts_"+loadkey], "span", {"html":"I'm waiting for your fonts to load!","style":"font-family: Times !important; font-style: "+font.style+" !important; font-weight: "+font.weight+" !important; font-size: 20px !important; line-height: 1em !important; opacity: 0 !important;"});
		}

		// add font for loaded test
		node = u.ae(window["_man_fonts_"+loadkey], "span", {"html":"I'm waiting for your fonts to load!+?","style":"font-family: '"+font.family+"', Times !important; font-style: "+font.style+" !important; font-weight: "+font.weight+" !important; font-size: 20px !important; line-height: 1em !important; opacity: 0 !important;"});
		node._family = font.family;
		node._weight = font.weight;
		node._style = font.style;
		window["_man_fonts_"+loadkey].nodes.push(node);
	}

	// checking if fonts are loaded
	window["_man_fonts_"+loadkey].checkfonts = function() {

		var basenode, i, node, loaded = 0;

		for(i = 0; node = this.nodes[i]; i++) {

			// find basenode for comparison
			basenode = this.font_style_weight[node._style+node._weight];

//			u.bug("font "+i+":" + node._family + ", " + node.offsetWidth + "x" + node.offsetHeight + "("+basenode.offsetWidth +"x"+basenode.offsetHeight+")");

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

	// start checking
	window["_man_fonts_"+loadkey].checkfonts();

}
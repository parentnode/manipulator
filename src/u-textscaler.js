// scales texts-tags in node
//
// Default scales * between 200px and 3000px, using relative font-sizes from 1rem to 40rem
// pass settings in options JSON object


u.textscaler = function(node, _settings) {
//	u.bug("set text scaling")

//	u.bug_console_only = true;
//	console.log(node);


	// additional info passed to function as JSON object
	if(typeof(_settings) != "object") {
		_settings = {
			"*":{
				"unit":"rem",
				"min_size":1,
				"min_width":200,
				"min_height":200,
				"max_size":40,
				"max_width":3000,
				"max_height":2000
			}
		};
	}

	// apply unique identifier
	node.text_key = u.randomString(8);
	u.ac(node, node.text_key);

	// map setting on node 
	// but make sure to get copy of settings - not just reference passed object
	node.text_settings = JSON.parse(JSON.stringify(_settings));


	node.scaleText = function() {
		var tag;

//		u.bug("scale node:" + u.nodeId(node));
		// var i, blob;
		// for(i = 0; blob = window._man_text.nodes[i]; i++) {
		// 	u.bug("blob:" + u.nodeId(blob) + "; " + blob.text_settings["h2"].css_rule);
		// 	u.xInObject(blob.text_settings["h2"].css_rule);
		// }


//		if(u.hc(this, "i1")) {
//			u.bug("scale text:" + u.nodeId(this))
//			u.xInObject(this.text_settings["h2"])
//			u.bug(this.text_settings["h2"].css_rule.cssText)
//		}
		// loop through all tags with settings
		for(tag in this.text_settings) {
			var settings = this.text_settings[tag];

//			u.bug("scale tag:" + tag + ", " + settings.width_factor + ", " + settings.height_factor)
			// if both width and height is set - lowest value should be used
			var width_wins = false;
			var height_wins = false;

			// if both height and width is defined, figure out which one wins
			if(settings.width_factor && settings.height_factor) {

				// settings: 600-1200 + 400-1000
				// size: 800x500 = width should count
				// side: 700x600 = height should count
				// height - min_height < width - min_width

				if(window._man_text._height - settings.min_height < window._man_text._width - settings.min_width) {
//					u.bug("height wins");
					height_wins = true;
				}
				else {
					width_wins = true;
				}
			}


			if(settings.width_factor && !height_wins) {
				
				if(settings.min_width <= window._man_text._width && settings.max_width >= window._man_text._width) {
	//				u.bug(width + ", " + settings.min_width + ", " + settings.width_factor)
					var font_size = settings.min_size + (settings.size_factor * (window._man_text._width - settings.min_width) / settings.width_factor);
	//				u.bug("font-size:" + font_size);

	//				u.xInObject(man_text.style_tag.sheet.cssRules.style);
					// update font size
					settings.css_rule.style.setProperty("font-size", font_size + settings.unit, "important");
	//				u.bug("size for:" + font_size + settings.unit + "," + settings.css_rule.cssText);
				}
				// too big
				else if(settings.max_width < window._man_text._width) {
	//				u.bug("font-size max:" + settings.max_size);
					settings.css_rule.style.setProperty("font-size", settings.max_size + settings.unit, "important");
				}
				// too small
				else if(settings.min_width > window._man_text._width) {
	//				u.bug("font-size min:" + settings.min_size);
					settings.css_rule.style.setProperty("font-size", settings.min_size + settings.unit, "important");
				}

			}
			else if(settings.height_factor) {

//				u.bug(window._man_text._height + ", " + settings.min_height + ", " + settings.height_factor)

				if(settings.min_height <= window._man_text._height && settings.max_height >= window._man_text._height) {
					var font_size = settings.min_size + (settings.size_factor * (window._man_text._height - settings.min_height) / settings.height_factor);

					// update font size
					settings.css_rule.style.setProperty("font-size", font_size + settings.unit, "important");
	//				u.bug("size for:" + font_size + settings.unit + "," + settings.css_rule.cssText);
				}
				// too big
				else if(settings.max_height < window._man_text._height) {
					settings.css_rule.style.setProperty("font-size", settings.max_size + settings.unit, "important");
				}
				// too small
				else if(settings.min_height > window._man_text._height) {
					settings.css_rule.style.setProperty("font-size", settings.min_size + settings.unit, "important");
				}

			}


//			u.bug("window._man_text._width:" + window._man_text._width);

		}

//		u.bug("scale text")
//		u.xInObject(options);
	}

	node.cancelTextScaling = function() {

		// pop node from window._man_text.nodes and remove listener when no more nodes
		u.e.removeEvent(window, "resize", window._man_text.scale);
	}

	// not initialized
	if(!window._man_text) {
		var man_text = {};
		man_text.nodes = [];

		// create style tag for custom rules
		var style_tag = document.createElement("style");
		style_tag.setAttribute("media", "all")
		style_tag.setAttribute("type", "text/css")
		man_text.style_tag = u.ae(document.head, style_tag);

		// TODO: suposedly fix for webkit problem - check if real
		man_text.style_tag.appendChild(document.createTextNode(""))

//		u.bug("node:" + man_text.style_tag);
//		u.xInObject(man_text.style_tag.sheet);

		// create scale controller
		window._man_text = man_text;
		// get base value for first run
		window._man_text._width = u.browserW();
		window._man_text._height = u.browserH();

		// text scaler function (invoked on resize)
		window._man_text.scale = function() {

			// get width just once for each event
			var _width = u.browserW();
			var _height = u.browserH();

			window._man_text._width = u.browserW();
			window._man_text._height = u.browserH();


			var i, node;
			for(i = 0; i < window._man_text.nodes.length; i++) {
				node = window._man_text.nodes[i];
//				u.bug("scale:" + node + ", " + node._man_text);

				// if(node._man_text.ref) {
				// 				window._man_text._width = node._man_text.ref.offsetWidth;
				// 				window._man_text._height = node._man_text.ref.offsetHeight;
				//
				// }
				// else {
				// 				window._man_text._width = _width;
				// 				window._man_text._height = _height;
				//
				// }

				// is node still a part of the dom
				// don't want to make this check to complex, or it will slow down rendering
				if(node.parentNode) { // && node.offsetHeight
					node.scaleText();
				}
				else {
					// pop node from window._man_text.nodes and remove listener when no more nodes

//					u.xInObject(window._man_text.nodes);
					window._man_text.nodes.splice(window._man_text.nodes.indexOf(node), 1);

//					u.xInObject(window._man_text.nodes);
					if(!window._man_text.nodes.length) {
//						u.bug("end textscaler event")
						u.e.removeEvent(window, "resize", window._man_text.scale);
						window._man_text = false;
						break;
					}
				}
			}
		}
		// scale on resize
		u.e.addEvent(window, "resize", window._man_text.scale);


		// precalculate values for speedy execution
		window._man_text.precalculate = function() {
//			u.bug("precalc")

			var i, node, tag;
			for(i = 0; i < window._man_text.nodes.length; i++) {
				node = window._man_text.nodes[i];

//				u.bug("scale:" + node);
				if(node.parentNode) { // && node.offsetHeight

					var settings = node.text_settings;
					for(tag in settings) {
//						u.bug("precalc tag:" + tag)
						// optional whether resizing is done by width or height or both

						// width settings available
						if(settings[tag].max_width && settings[tag].min_width) {
							settings[tag].width_factor = settings[tag].max_width-settings[tag].min_width;
						}
						// transfer values from global setting
						else if(node._man_text.max_width && node._man_text.min_width) {
							settings[tag].max_width = node._man_text.max_width;
							settings[tag].min_width = node._man_text.min_width;
							settings[tag].width_factor = node._man_text.max_width-node._man_text.min_width;
						}
						// no values available
						else {
							settings[tag].width_factor = false;
						}

						// height settings available
						if(settings[tag].max_height && settings[tag].min_height) {
							settings[tag].height_factor = settings[tag].max_height-settings[tag].min_height;
						}
						// transfer values from global setting
						else if(node._man_text.max_height && node._man_text.min_height) {
							settings[tag].max_height = node._man_text.max_height;
							settings[tag].min_height = node._man_text.min_height;
							settings[tag].height_factor = node._man_text.max_height-node._man_text.min_height;
						}
						// no values available
						else {
							settings[tag].height_factor = false;
						}

						// 
						settings[tag].size_factor = settings[tag].max_size-settings[tag].min_size;

						if(!settings[tag].unit) {
							settings[tag].unit = node._man_text.unit;
						}

//						u.xInObject(settings[tag])
					}
				}
			}
			
		}
	}


//	u.bug("index:" + u.nodeId(node))
//	u.xInObject(window._man_text.style_tag)
//	u.xInObject(window._man_text.style_tag.sheet)
	var tag;
	// map global settings to node for referencing in pre-calculation
	node._man_text = {};
	// add rule for each tag in settings
	for(tag in node.text_settings) {

		// global width + height settings
		if(tag == "min_height" || tag == "max_height" || tag == "min_width" || tag == "max_width" || tag == "unit" || tag == "ref") {
			node._man_text[tag] = node.text_settings[tag];
			node.text_settings[tag] = null;
			delete node.text_settings[tag];
		}
		else {
			// create specific rule for each tag
			selector = "."+node.text_key + ' ' + tag + ' ';
			node.css_rules_index = window._man_text.style_tag.sheet.insertRule(selector+'{}', 0);
	//		u.bug("selector:" + selector + ", " + node.css_rules_index + "; " + u.nodeId(node))

			// save rule reference to avoid looking for it later (insert puts new rule as first index)
			node.text_settings[tag].css_rule = window._man_text.style_tag.sheet.cssRules[0];
		}

		
//		u.bug("cssText:" + node.text_settings[tag].css_rule.cssText + ", " + u.nodeId(node));
//					u.xInObject(settings[tag].css_rule);
	}


	window._man_text.nodes.push(node);


	// precalculate value as many values for nodes
	window._man_text.precalculate();

	// scale text based on current width
	node.scaleText();

//	u.xInObject(window._man_text)

}
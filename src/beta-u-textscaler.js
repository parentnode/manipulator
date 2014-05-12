// scales texts-tags in node
//
// Default scales * between 200px and 3000px, using relative font-sizes from 1rem to 40rem
// pass settings in options JSON object


u.textscaler = function(node, settings) {
//	u.bug("set text scaling")

//	u.bug_console_only = true;



	// additional info passed to function as JSON object
	if(typeof(settings) != "object") {
		settings = {
			"*":{
				"unit":"rem",
				"min_size":1,
				"min_width":200,
				"max_size":40,
				"max_width":3000
			}
		};
	}

	// apply unique identifier
	node.text_key = u.randomString(8);
	u.ac(node, node.text_key);

	// map setting on node
	node.text_settings = JSON.parse(JSON.stringify(settings));
//	node.text_settings = settings;

	node.scaleText = function() {
		var tag;

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

//			u.bug("window._man_text._width:" + window._man_text._width);
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
		window._man_text.scale = function() {

			// get width just once for each event
			window._man_text._width = u.browserW();

			var i, node;
			for(i = 0; node = window._man_text.nodes[i]; i++) {
//				u.bug("scale:" + node);
				// is node still a part of the dom
				if(node.parentNode) { // && node.offsetHeight
					node.scaleText();
				}
				else {
					// TODO: pop node from window._man_text.nodes and remove listener when no more nodes
//					u.xInObject(window._man_text.nodes);
					window._man_text.nodes.splice(window._man_text.nodes.indexOf(node), 1);
//					u.xInObject(window._man_text.nodes);
					if(!window._man_text.nodes.length) {
//						u.bug("end textscaler event")
						u.e.removeEvent(window, "resize", window._man_text.scale);
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
			for(i = 0; node = window._man_text.nodes[i]; i++) {
//				u.bug("scale:" + node);
				if(node.parentNode) { // && node.offsetHeight

					var settings = node.text_settings;
					for(tag in settings) {
						settings[tag].width_factor = settings[tag].max_width-settings[tag].min_width;
						settings[tag].size_factor = settings[tag].max_size-settings[tag].min_size;

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
	// add rule for each tag in settings
	for(tag in node.text_settings) {

		// create specific rule for each tag
		selector = "."+node.text_key + ' ' + tag + ' ';
		node.css_rules_index = window._man_text.style_tag.sheet.insertRule(selector+'{}', 0);
//		u.bug("selector:" + selector + ", " + node.css_rules_index + "; " + u.nodeId(node))

		// save rule reference to avoid looking for it later (insert puts new rule as first index)
		node.text_settings[tag].css_rule = window._man_text.style_tag.sheet.cssRules[0];

//		u.bug("cssText:" + node.text_settings[tag].css_rule.cssText + ", " + u.nodeId(node));
//					u.xInObject(settings[tag].css_rule);
	}


	window._man_text.nodes.push(node);

	// var rule;
	// for(rule in window._man_text.style_tag.sheet.cssRules) {
	// 	if(!isNaN(rule)) {
	// 		u.bug("rules:" + rule + "," + window._man_text.style_tag.sheet.cssRules[rule].cssText +", "+ u.nodeId(window._man_text.style_tag.sheet.cssRules[rule].node))
	// 	}
	// }
	// 
	// 
	// var i, blob;
	// for(i = 0; blob = window._man_text.nodes[i]; i++) {
	// 	u.bug("blob2:" + u.nodeId(blob) + "; " + blob.text_settings["h2"].css_rule.cssText);
	// 	u.xInObject(blob.text_settings["h2"].css_rule);
	// }


	// precalculate value as many values for nodes
	window._man_text.precalculate();
	// scale text based on current width
	node.scaleText();

//	u.xInObject(window._man_text)

}
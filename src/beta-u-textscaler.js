// scales texts-tags in node
//
// Default scales * between 200px and 3000px, using relative font-sizes from 1rem to 40rem
// pass settings in options JSON object


u.textscaler = function(node, settings) {

//	u.bug_console_only = true;



	// additional info passed to function as JSON object
	if(!typeof(settings) == "object") {
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

	
	node.text_key = u.randomString(8);
	u.ac(node, node.text_key);

	node.text_settings = settings;

	node.scaleText = function() {

		var width = u.browserW();

		// loop through all tags with settings
		for(tag in this.text_settings) {
			var settings = this.text_settings[tag];
			// TODO: re-SET MIN and MAX sizes when out of scope, to be more precise 

			if(settings.min_width <= width && settings.max_width >= width) {
//				u.bug(width + ", " + settings.min_width + ", " + settings.width_factor)
				var font_size = settings.min_size + (settings.size_factor * (width - settings.min_width) / settings.width_factor);
//				var size = settings.size_factor * prop;
//				u.bug("prop:" + this.text_settings[tag].max_width +"-"+ this.text_settings[tag].min_width+") / ("+width+"-"+this.text_settings[tag].min_width+")")
//				u.bug("prop:" + prop)

//				u.xInObject(jes_text.style_tag.sheet.cssRules.style);

//				var css_string = node.css_rule_selector + '{font-size: 10px;}';
//				if(!getCSSRule("."+this.text_settings[tag].text_key + ' ' + tag)) {
				
//				u.bug("size:"+ font_size + settings.unit + ", " + settings.css_rule.cssText);
//				u.xInObject(settings);
				// update font size
				settings.css_rule.style.setProperty("font-size", font_size + settings.unit, "important");
//				node.css_rule.style.setProperty("font-size", u.random(100, 200) + "px", "important");
//				node.offsetHeight;
//				}

				// set size for
//				u.bug("size for:" + node.css_rule.cssText);
			}
		}

//		u.bug("scale text")
//		u.xInObject(options);
	}

	node.cancelTextScaling = function() {

		// pop node from window._jes_text.nodes and remove listener when no more nodes
		u.e.removeEvent(window, "resize", window._jes_text.scale);
	}

	// not initialized
	if(!window._jes_text) {
		var jes_text = {};
		jes_text.nodes = [];

		// create style tag for custom rules
		var style_tag = document.createElement("style");
		style_tag.setAttribute("media", "all")
		style_tag.setAttribute("type", "text/css")
		jes_text.style_tag = u.ae(document.head, style_tag);
		jes_text.style_tag.appendChild(document.createTextNode(""))

//		u.bug("node:" + jes_text.style_tag);
//		u.xInObject(jes_text.style_tag.sheet);

		// create scale controller
		window._jes_text = jes_text;
		window._jes_text.scale = function() {
			for(i = 0; node = this._jes_text.nodes[i]; i++) {
//				u.bug("scale:" + node);
				if(node.parentNode) { // && node.offsetHeight
					node.scaleText();
				}
				else {
					// TODO: pop node from window._jes_text.nodes and remove listener when no more nodes
					u.e.removeEvent(window, "resize", window._jes_text.scale);
				}
			}
		}
		// scale on resize
		u.e.addEvent(window, "resize", window._jes_text.scale);
	}



	// add rule for each tag in settings
//	u.bug("jes_text.style_tag.rules:" + jes_text.style_tag.sheet.cssRules);
//	u.xInObject(window._jes_text.style_tag)
//	u.xInObject(window._jes_text.style_tag.sheet)

	for(tag in settings) {

		// precalculate values for speedy execution
		settings[tag].width_factor = settings[tag].max_width-settings[tag].min_width;
		settings[tag].size_factor = settings[tag].max_size-settings[tag].min_size;

//			u.bug(settings[tag].size_factor + ", " + settings[tag].width_factor)

//			u.bug(window._jes_text.style_tag.sheet);
		// create specific rule for each tag
		selector = "."+node.text_key + ' ' + tag + ' ';
		node.css_rules_index = window._jes_text.style_tag.sheet.insertRule(selector+'{}', 0);
//		u.bug("node.css_rules_index:" + node.css_rules_index + "("+window._jes_text.style_tag.sheet.cssRules.length+")");
//			u.bug(window._jes_text.style_tag.sheet.insertRule(selector+'{}', 0));

		// save rule reference to avoid looking for it later
		settings[tag].css_rule = window._jes_text.style_tag.sheet.cssRules[0];
//		settings[tag].css_rule = window._jes_text.style_tag.sheet.cssRules[window._jes_text.style_tag.sheet.cssRules.length-1];
//					u.bug("node.css_rule:" + settings[tag].css_rule);
		//			u.xInObject(node.css_rule);
		
//					u.xInObject(settings[tag].css_rule);
	
		// scale node to current size

	}
	node.scaleText();
//	node.text_settings = settings;
	 
	window._jes_text.nodes.push(node);

//	u.xInObject(window._jes_text)

//	u.e.removeEvent(window, "resize", this._scrollToHandler);

}
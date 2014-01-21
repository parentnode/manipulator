// Fallback specific animation handler
// tries to mimic transitions by using timeouts and uses most advanced method available

u.a.transition = function(node, transition) {
	var duration = transition.match(/[0-9.]+[ms]+/g);
	if(duration) {
		node.duration = duration[0].match("ms") ? parseFloat(duration[0]) : (parseFloat(duration[0]) * 1000);
	}
	else {
		node.duration = false;

		if(transition.match(/none/i)) {
			// if(u.hc(node, "subjects")) {
			// 	u.bug("EXPERIMENTAL subjects reset transition end:" + transition + ", " + u.nodeId(node), 2, "red")
			// }
			// TODO: experimental - auto reset of transitioned callback
			node.transitioned = null;
		}

		// TODO: reset running animations?
		// u.t.resetTimer(e.t_transition);
	}

	// safeguard - avoid double transitions if browser supports CSS transitions
	if(u.support(this.variant()+"Transition")) {
		// set transition to "none" directly, and keep duration value
		node.style[this.variant()+"Transition"] = "none";
	}
}


// IE9 fallback, using translate with timeouts
u.a.translate = function(node, x, y) {
//	u.bug("translate desktop_ie:" + u.nodeId(node) + ":" + x + "x" + y);

	// updates for animation in ms (1000/25 = 40fps)
	var update_frequency = 25;

	// set internal values
	node._x = node._x ? node._x : 0;
	node._y = node._y ? node._y : 0;


	// TODO: reset running animations?


	// only run if coords are different from current values
	if(node.duration && (node._x != x || node._y != y)) {
//		u.bug("translate with duration:" + u.nodeId(node) + ": dur:" + node.duration + ": x:" + x + ": y:" + y);

		// calculate transition
		node.x_start = node._x;
		node.y_start = node._y;
		node.translate_transitions = node.duration/update_frequency;
		node.translate_progress = 0;
		node.x_change = (x - node.x_start) / node.translate_transitions;
		node.y_change = (y - node.y_start) / node.translate_transitions;

//		u.bug("x_change:" + e.x_change);
//		u.bug("y_change:" + e.y_change);


		node.translate_transitionTo = function(event) {
			++this.translate_progress;

			var new_x = (Number(this.x_start) + Number(this.translate_progress * this.x_change));
			var new_y = (Number(this.y_start) + Number(this.translate_progress * this.y_change));
//			u.bug("transition move:" + u.nodeId(this, 1) + ": new_x:" + new_x + ": new_y:" + new_y);

			// hardcoded msTransform
			this.style["msTransform"] = "translate("+ new_x + "px, " + new_y +"px)";

			// update dom
			this.offsetHeight;

			// more transitions to go?
			if(this.translate_progress < this.translate_transitions) {

				this.t_translate_transition = u.t.setTimer(this, this.translate_transitionTo, update_frequency);
			}
			// last step - adjust any miscalculations and callback
			else {

				this.style["msTransform"] = "translate("+ this._x + "px, " + this._y +"px)";

				if(typeof(this.transitioned) == "function") {
					this.transitioned(event);
				}
			}
		}

		// start transition
		node.translate_transitionTo();
	}
	// no duration - just move, and no transition callback (bacause CSS transitions has no callback when no duration is given)
	else {
//		u.bug("direct move")

		node.style["msTransform"] = "translate("+ x + "px, " + y +"px)";
	}

	// remember value for cross method compability
	node._x = x;
	node._y = y;

	// update dom
	node.offsetHeight;
}


// IE9 fallback, using rotate with timeouts
u.a.rotate = function(node, deg) {
	//	u.bug("rotate desktop_ie:" + u.nodeId(e) + ":" + x + "x" + y);

	// updates for animation in ms (1000/25 = 40fps)
	var update_frequency = 25;

	// set internal value
	node._rotation = node._rotation ? node._rotation : 0;


	// TODO: reset running animations?

	// only run if rotation is different from current value
	if(node.duration && node._rotation != deg) {
//		u.bug("rotate with duration:" + u.nodeId(node) + ": dur:" + node.duration + ": deg:" + deg);

		// calculate transition
		node.rotate_start = node._rotation;
		node.rotate_transitions = node.duration/update_frequency;
		node.rotate_progress = 0;
		node.rotate_change = (deg - node.rotate_start) / node.rotate_transitions;

//		u.bug("rotate_change:" + node.rotate_change);


		node.rotate_transitionTo = function(event) {
			++this.rotate_progress;

			var new_deg = (Number(this.rotate_start) + Number(this.rotate_progress * this.rotate_change));
//			u.bug("transition rotate:" + u.nodeId(this, 1) + ": deg:" + new_deg);

			// hardcoded msTransform
			this.style["msTransform"] = "rotate("+ new_deg + "deg)";

			// update dom
			this.offsetHeight;

			// more transitions to go?
			if(this.rotate_progress < this.rotate_transitions) {

				this.t_rotate_transition = u.t.setTimer(this, this.rotate_transitionTo, update_frequency);
			}
			// last step - adjust any miscalculations and callback
			else {

				this.style["msTransform"] = "rotate("+ this._rotation + "deg)";

				if(typeof(this.transitioned) == "function") {
					this.transitioned(event);
				}
			}
		}

		// start transition
		node.rotate_transitionTo();
	}
	// no duration - just move, and no transition callback (bacause CSS transitions has no callback when no duration is given)
	else {
//		u.bug("direct rotate")

		node.style["msTransform"] = "rotate("+ deg + "deg)";
	}

	// remember value for cross method compability
	node._rotation = deg;

	// update dom
	node.offsetHeight;
}

// IE9 fallback, using scale with timeouts
u.a.scale = function(node, scale) {
	//	u.bug("scale desktop_ie:" + u.nodeId(e) + ":" + x + "x" + y);

	// updates for animation in ms (1000/25 = 40fps)
	var update_frequency = 25;

	// set internal value
	node._scale = node._scale ? node._scale : 0;


	// TODO: reset running animations?

	// only run if scale is different from current value
	if(node.duration && node._scale != scale) {
//		u.bug("scale with duration:" + u.nodeId(node) + ": dur:" + node.duration + ": deg:" + deg);

		// calculate transition
		node.scale_start = node._scale;
		node.scale_transitions = node.duration/update_frequency;
		node.scale_progress = 0;
		node.scale_change = (scale - node.scale_start) / node.scale_transitions;

//		u.bug("scale_change:" + node.scale_change);


		node.scale_transitionTo = function(event) {
			++this.scale_progress;

			var new_scale = (Number(this.scale_start) + Number(this.scale_progress * this.scale_change));
//			u.bug("transition scale:" + u.nodeId(this, 1) + ": scale:" + new_scale);

			// hardcoded msTransform
			this.style["msTransform"] = "scale("+ new_scale +")";

			// update dom
			this.offsetHeight;

			// more transitions to go?
			if(this.scale_progress < this.scale_transitions) {

				this.t_scale_transition = u.t.setTimer(this, this.scale_transitionTo, update_frequency);
			}
			// last step - adjust any miscalculations and callback
			else {

				this.style["msTransform"] = "scale("+ this._scale +")";

				if(typeof(this.transitioned) == "function") {
					this.transitioned(event);
				}
			}
		}

		// start transition
		node.scale_transitionTo();
	}
	// no duration - just move, and no transition callback (bacause CSS transitions has no callback when no duration is given)
	else {
//		u.bug("direct scale")

		node.style["msTransform"] = "scale("+ scale +")";
	}

	// remember value for cross method compability
	node._scale = scale;

	// update dom
	node.offsetHeight;
}


// IE9 fallback, using opacity with timeouts
u.a.setOpacity = function(node, opacity) {

	// updates for animation in ms (1000/25 = 40fps)
	var update_frequency = 25;

	// set internal value
	node._opacity = node._opacity ? node._opacity : u.gcs(node, "opacity");


	// TODO: reset running animations?


	// only run if opacity is different from current value
	if(node.duration && node._opacity != opacity) {
//		u.bug("opacity with duration:" + u.nodeId(node) + ": dur:" + node.duration + ": opacity:" + opacity);

		// calculate transition
		node.opacity_start = node._opacity;
		node.opacity_transitions = node.duration/update_frequency;
		node.opacity_change = (opacity - node.opacity_start) / node.opacity_transitions;
		node.opacity_progress = 0;

//		u.bug("opacity_change:" + node.opacity_change);

		node.opacity_transitionTo = function(event) {
			++this.opacity_progress;

			var new_opacity = (Number(this.opacity_start) + Number(this.opacity_progress * this.opacity_change));
//			u.bug("transition opacity:" + u.nodeId(this, 1) + ": opacity:" + new_opacity);

			// CSS
			u.as(this, "opacity", new_opacity);

			// update dom
			this.offsetHeight;

			// more transitions to go?
			if(this.opacity_progress < this.opacity_transitions) {

				this.t_opacity_transition = u.t.setTimer(this, this.opacity_transitionTo, update_frequency);
			}
			// last step - adjust any miscalculations and callback
			else {

				this.style.opacity = this._opacity;

				if(typeof(this.transitioned) == "function") {
					this.transitioned(event);
				}
			}

		}

		// start transition
		node.opacity_transitionTo();

	}
	// no duration - just move, and no transition callback (bacause CSS transitions has no callback when no duration is given)
	else {
//		u.bug("direct opacity")
		
		node.style.opacity = opacity;
	}

	// remember value for cross method compability
	node._opacity = opacity;

	// update dom
	node.offsetHeight;
}


// IE9 fallback, using regular CSS width with timeouts
u.a.setWidth = function(node, width) {

	// updates for animation in ms (1000/25 = 40fps)
	var update_frequency = 25;

	// set internal value
	node._width = node._width ? node._width : u.gcs(node, "width").match("px") ? u.gcs(node, "width").replace("px", "") : 0;


	// TODO: reset running animations?


	// only run if width is different from current value
	if(node.duration && node._width != width) {

		// set up transition values
		node.width_start = node._width;
		node.width_transitions = node.duration/update_frequency;
		node.width_change = (width - node.width_start) / node.width_transitions;
		node.width_progress = 0;

//		u.bug("width_change:" + node.width_change);

		// transition handler
		node.width_transitionTo = function(event) {
			++this.width_progress;

			var new_width = (Number(this.width_start) + Number(this.width_progress * this.width_change));
//			u.bug("transition width:" + u.nodeId(this, 1) + ": width:" + new_width);

			// CSS
			u.as(this, "width", new_width+"px");

			// update dom
			this.offsetHeight;

			// more transitions to go?
			if(this.width_progress < this.width_transitions) {

				this.t_width_transition = u.t.setTimer(this, this.width_transitionTo, update_frequency);
			}
			// last step - adjust any miscalculations and callback
			else {

				u.as(this, "width", this._width);

				if(typeof(this.transitioned) == "function") {
					this.transitioned(event);
				}
			}
		}

		// start transition
		node.width_transitionTo();

	}
	// no duration - just move, and no transition callback (bacause CSS transitions has no callback when no duration is given)
	else {
//		u.bug("direct opacity")

		var new_width = width.toString().match(/\%|auto/) ? width : width + "px";
		u.as(node, "width", new_width);
	}

	// remember value for cross method compability
	node._width = width;

	// update dom
	node.offsetHeight;
}


// IE9 fallback, using regular CSS height with timeouts
u.a.setHeight = function(node, height) {

	// updates for animation in ms (1000/25 = 40fps)
	var update_frequency = 25;

	// set internal value
	node._height = node._height ? node._height : u.gcs(node, "height").match("px") ? u.gcs(node, "height").replace("px", "") : 0;


	// TODO: reset running animations?


	// only run if height is different from current value
	if(node.duration && node._height != height) {

		// set up transition values
		node.height_start = node._height;
		node.height_transitions = node.duration/update_frequency;
		node.height_change = (height - node.height_start) / node.height_transitions;
		node.height_progress = 0;

//		u.bug("height_change:" + node.height_change);

		// transition handler
		node.height_transitionTo = function(event) {
			++this.height_progress;

			var new_height = (Number(this.height_start) + Number(this.height_progress * this.height_change));
//			u.bug("transition height:" + u.nodeId(this, 1) + ": height:" + new_height);

			// CSS
			u.as(this, "height", new_height+"px");

			// update dom
			this.offsetHeight;

			// more transitions to go?
			if(this.height_progress < this.height_transitions) {

				this.t_height_transition = u.t.setTimer(this, this.height_transitionTo, update_frequency);
			}
			// last step - adjust any miscalculations and callback
			else {

				u.as(this, "height", this._height);

				if(typeof(this.transitioned) == "function") {
					this.transitioned(event);
				}
			}
		}

		// start transition
		node.height_transitionTo();

	}
	// no duration - just move, and no transition callback (bacause CSS transitions has no callback when no duration is given)
	else {
//		u.bug("direct opacity")

		var new_height = height.toString().match(/\%|auto/) ? height : height + "px";
		u.as(node, "height", new_height);
	}

	// remember value for cross method compability
	node._height = height;

	// update dom
	node.offsetHeight;
}


// IE9 fallback, using regular CSS background-position with timeouts
u.a.setBgPos = function(node, x, y) {

	// updates for animation in ms (1000/25 = 40fps)
	var update_frequency = 25;

	// TODO: consider converting values if % or top, left, bottom, right, auto ??
	// Maybe overkill, as there is still no way of converting from % to px
	// top = 0%
	// bottom = 100%
	// left = 0%
	// right = 100%
	// center = 50%

	var current_bg_x = u.gcs(node, "background-position-x");
	var current_bg_y = u.gcs(node, "background-position-y");

	// set internal values - if current value is not in px, animation cannot be calculated, so pretend no change has happened
	node._bg_x = node._bg_x ? node._bg_x : current_bg_x.match("px") ? current_bg_x.replace("px", "") : x;
	node._bg_y = node._bg_y ? node._bg_y : current_bg_y.match("px") ? current_bg_y.replace("px", "") : y;


	// TODO: reset running animations?


	// only run if one value is different from current value
	if(node.duration && (node._bg_x != x || node._bg_y != y)) {

		// u.bug("pos:" + u.gcs(node, "background-position-y"))
		// u.bug("x:" + u.gcs(node, "background-position").split(" ")[0])
		// u.bug("y:" + u.gcs(node, "background-position").split(" ")[1])

		node._bg_same_x = false;
		node._bg_same_y = false;

		// set up transition values
		node.bg_transitions = node.duration/update_frequency;

		// is x value changed and value does not contain %, top, left, bottom, right
		if(node._bg_x != x) {
			node.bg_start_x = node._bg_x;
			node.bg_change_x = (x - node.bg_start_x) / node.bg_transitions;
		}
		else {
			node._bg_same_x = true;
		}

		// is y value changed and value does not contain %, top, left, bottom, right
		if(node._bg_y != y) {
			node.bg_start_y = node._bg_y;
			node.bg_change_y = (y - node.bg_start_y) / node.bg_transitions;
		}
		else {
			node._bg_same_y = true;
		}
		node.bg_progress = 0;

//		u.bug("bg_change_x:" + node.bg_change_x + ", " + "bg_change_y:" + node.bg_change_y);


		// transition handler
		node.bg_transitionTo = function(event) {
			++this.bg_progress;

			var new_x, new_y;
			if(!this._bg_same_x) {
				new_x = Math.round((Number(this.bg_start_x) + Number(this.bg_progress * this.bg_change_x)));
			}
			else {
				new_x = this._bg_x;
			}

			if(!this._bg_same_y) {
				new_y = Math.round((Number(this.bg_start_y) + Number(this.bg_progress * this.bg_change_y)));
			}
			else {
				new_y = this._bg_y;
			}

//			u.bug("new:" + new_x + ":" + new_y);
			var new_bg_x = new_x.toString().match(/\%|top|left|right|center|bottom/) ? new_x : (new_x + "px");
			var new_bg_y = new_y.toString().match(/\%|top|left|right|center|bottom/) ? new_y : (new_y + "px");

			// CSS
			u.as(this, "backgroundPosition", new_bg_x + " " + new_bg_y);

			// update dom
			this.offsetHeight;

			// more transitions to go?
			if(this.bg_progress < this.bg_transitions) {

				this.t_bg_transition = u.t.setTimer(this, this.bg_transitionTo, update_frequency);
			}
			// last step - adjust any miscalculations and callback
			else {

				var new_bg_x = x.toString().match(/\%|top|left|right|center|bottom/) ? this._bg_x : (this._bg_x + "px");
				var new_bg_y = y.toString().match(/\%|top|left|right|center|bottom/) ? this._bg_y : (this._bg_y + "px");
				u.as(this, "backgroundPosition", new_bg_x + " " + new_bg_y);

				if(typeof(this.transitioned) == "function") {
					this.transitioned(event);
				}
			}
		}

		// start transition
		node.bg_transitionTo();

	}
	// no duration - just move, and no transition callback (bacause CSS transitions has no callback when no duration is given)
	else {
//		u.bug("direct opacity")

		var new_bg_x = x.toString().match(/\%|top|left|right|center|bottom/) ? x : (x + "px");
		var new_bg_y = y.toString().match(/\%|top|left|right|center|bottom/) ? y : (y + "px");
		u.as(node, "backgroundPosition", new_bg_x + " " + new_bg_y);
	}

	// remember value for cross method compability
	node._bg_x = x;
	node._bg_y = y;

	// update dom
	node.offsetHeight;
}




// IE9 fallback bgColor - manual calculation with timeouts (identical to desktop_light version)
u.a.setBgColor = function(node, color) {

	// updates for animation in ms (1000/25 = 40fps)
	var update_frequency = 100;

	// check for valid values
	if(isNaN(node._bg_color_r) || isNaN(node._bg_color_g) || isNaN(node._bg_color_b)) {

		var current_bg_color = u.gcs(node, "background-color");
		var matches;
		var current_bg_color_r, current_bg_color_g, current_bg_color_b;
		var new_bg_color_r = false;
		var new_bg_color_g = false;
		var new_bg_color_b = false;

		// convert current color statement
		// #00000-#ffffff or #000-#fff
		if(current_bg_color.match(/#[\da-fA-F]{3,6}/)) {
			if(current_bg_color.length == 7) {
				matches = current_bg_color.match(/#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/);
			}
			else {
				matches = current_bg_color.match(/#([\da-fA-F]{1}),[ ]?([\da-fA-F]{1}),[ ]?([\da-fA-F]{1})/);
			}
			current_bg_color_r = u.hexToNum(matches[1]);
			current_bg_color_g = u.hexToNum(matches[2]); 
			current_bg_color_b = u.hexToNum(matches[3]);
		}
		// rgb(0, 0, 0)-rbg(255, 255, 255)
		else if(current_bg_color.match(/rgb\([\d]{1,3},[ ]?[\d]{1,3},[ ]?[\d]{1,3}\)/)) {
			matches = current_bg_color.match(/rgb\(([\d]{1,3}),[ ]?([\d]{1,3}),[ ]?([\d]{1,3})\)/);
			current_bg_color_r = matches[1];
			current_bg_color_g = matches[2];
			current_bg_color_b = matches[3];
		}
		// rbga(0, 0, 0, 0)-rbga(255, 255, 255, 1) - alpha channel ignored for now
		else if(current_bg_color.match(/rgba\([\d]{1,3},[ ]?[\d]{1,3},[ ]?[\d]{1,3},[ ]?[\d\.]+\)/)) {
			matches = current_bg_color.match(/rgba\(([\d]{1,3}),[ ]?([\d]{1,3}),[ ]?([\d]{1,3}),[ ]?([\d\.]+)\)/);
			current_bg_color_r = matches[1];
			current_bg_color_g = matches[2];
			current_bg_color_b = matches[3];
		}
	}

	// convert color input statement
	if(color.match(/#[\da-fA-F]{3,6}/)) {
		if(color.length == 7) {
			matches = color.match(/#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/);
		}
		else {
			matches = color.match(/#([\da-fA-F]{1}),[ ]?([\da-fA-F]{1}),[ ]?([\da-fA-F]{1})/);
		}
		new_bg_color_r = u.hexToNum(matches[1]);
		new_bg_color_g = u.hexToNum(matches[2]);
		new_bg_color_b = u.hexToNum(matches[3]);
	}


	// set internal values - if current value is not in px, animation cannot be calculated, so pretend no change has happened
	node._bg_color_r = !isNaN(node._bg_color_r) ? node._bg_color_r : !isNaN(current_bg_color_r) ? current_bg_color_r : false;
	node._bg_color_g = !isNaN(node._bg_color_g) ? node._bg_color_g : !isNaN(current_bg_color_g) ? current_bg_color_g : false;
	node._bg_color_b = !isNaN(node._bg_color_b) ? node._bg_color_b : !isNaN(current_bg_color_b) ? current_bg_color_b : false;

//	u.bug("current:" + node._bg_color_r + ", " + node._bg_color_g + ", " + node._bg_color_b);
//	u.bug("new:" + new_bg_color_r + ", " + new_bg_color_g + ", " + new_bg_color_b);


	// TODO: reset running animations?


	// only run if one value is different from current value and valid
	if(node.duration && 
	node._bg_color_r !== false && 
	node._bg_color_g !== false && 
	node._bg_color_b !== false && 

	new_bg_color_r !== false && 
	new_bg_color_g !== false && 
	new_bg_color_b !== false &&

	(new_bg_color_r != node._bg_color_r ||
	new_bg_color_g != node._bg_color_g ||
	new_bg_color_b != node._bg_color_b)) {

		// set up transition values
		node.bg_color_r_start = node._bg_color_r;
		node.bg_color_g_start = node._bg_color_g;
		node.bg_color_b_start = node._bg_color_b;

		node.bg_color_transitions = node.duration/update_frequency;
		node.bg_color_r_change = (new_bg_color_r - node.bg_color_r_start) / node.bg_color_transitions;
		node.bg_color_g_change = (new_bg_color_g - node.bg_color_g_start) / node.bg_color_transitions;
		node.bg_color_b_change = (new_bg_color_b - node.bg_color_b_start) / node.bg_color_transitions;
		node.bg_color_progress = 0;

//		u.bug("bg_color_r_change:" + node.bg_color_r_change + ", bg_color_g_change:" + node.bg_color_g_change + ", bg_color_b_change:" + node.bg_color_b_change);

		// transition handler
		node.bg_color_transitionTo = function(event) {
			++this.bg_color_progress;

			var new_bg_color_r = Math.round(Number(this.bg_color_r_start) + Number(this.bg_color_progress * this.bg_color_r_change));
			var new_bg_color_g = Math.round(Number(this.bg_color_g_start) + Number(this.bg_color_progress * this.bg_color_g_change));
			var new_bg_color_b = Math.round(Number(this.bg_color_b_start) + Number(this.bg_color_progress * this.bg_color_b_change));
//			u.bug("transition height:" + u.nodeId(this, 1) + ", #" + new_bg_color_r + "=" + u.numToHex(new_bg_color_r) + ":" + new_bg_color_g + "=" + u.numToHex(new_bg_color_g) + ":" + new_bg_color_b + "=" + u.numToHex(new_bg_color_b));

			var bg_hex_r = u.prefix(u.numToHex(new_bg_color_r), 2);
			var bg_hex_g = u.prefix(u.numToHex(new_bg_color_g), 2);
			var bg_hex_b = u.prefix(u.numToHex(new_bg_color_b), 2);

			// CSS
			u.as(this, "backgroundColor", "#" + bg_hex_r + bg_hex_g + bg_hex_b);

			// update dom
			this.offsetHeight;
		
			// more transitions to go?
			if(this.bg_color_progress < this.bg_color_transitions) {
					
				this.t_bg_color_transition = u.t.setTimer(this, this.bg_color_transitionTo, update_frequency);
			}
			// last step - adjust any miscalculations and callback
			else {

				u.as(this, "backgroundColor", this._bg_color);

				if(typeof(this.transitioned) == "function") {
					this.transitioned(event);
				}
			}
		}

		// start transition
		node.bg_color_transitionTo();
	}
	//
	// no duration - just move, and no transition callback (bacause CSS transitions has no callback when no duration is given)
	else {
//		u.bug("direct bgcolor")

		node.style.backgroundColor = color;
	}

	node._bg_color = color;

	// update dom
	node.offsetHeight;
}


// Rotate & Scale
u.a.rotateScale = function(node, deg, scale) {
	node.style[u.a.variant() + "Transform"] = "rotate("+deg+"deg) scale("+scale+")";
	node._rotation = deg;
	node._scale = scale;

	// update dom
	node.offsetHeight;
}

// Scale, Rotate, Translate
u.a.scaleRotateTranslate = function(node, scale, deg, x, y) {

	node.style[u.a.variant() + "Transform"] = "scale("+scale+") rotate("+deg+"deg) translate("+x+"px, "+y+"px)";

	// store value
	node._rotation = deg;
	node._scale = scale;
	node._x = x;
	node._y = y;

	// update dom
	node.offsetHeight;
}

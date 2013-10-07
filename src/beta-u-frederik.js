u.frederik = function() {
//	u.bug("activate frederik")

//	u.xInObject(window._jes_text);
	window._frederik = u.ae(document.body, "div", {"class":"frederik"});
	window._frederik._version = 2;
	window._frederik._base_size = parseInt(u.gcs(document.body, "font-size"));
	window._frederik._toolbar = u.ae(window._frederik, "div", {"class":"toolbar", "html":"<h1>FREDERIK!</h1>"});

	// full change log included
	window._frederik._change_log = {
		2:[
			"Added toggle on/off using ESC key",
			"Added changelog sceen on new version"
		],
		3:[
			"TODO: Added fake save using CTRL/CMD + S"
		]
	}

	// show intro + changelog
	if(!u.getCookie("frederik") || u.getCookie("frederik") < window._frederik._version) {
		window._frederik._whatisnew = u.ae(window._frederik, "div", {"class":"whatisnew"});
		u.ae(window._frederik._whatisnew, "h1", {"html":"Frederik has been updated"});
		u.ae(window._frederik._whatisnew, "p", {"html":"Check out the new features:"});

		var logs = u.ae(window._frederik._whatisnew, "ul");
		for(i = u.eitherOr(u.getCookie("frederik"), 0); i <= window._frederik._version; i++) {
			if(window._frederik._change_log[i]) {
				for(j in window._frederik._change_log[i]) {
					u.ae(logs, "li", {"html":window._frederik._change_log[i][j]});
				}
			}
		}
		u.e.click(window._frederik._whatisnew);
		window._frederik._whatisnew.clicked = function() {
			this.parentNode.removeChild(this);
			u.saveCookie("frederik", window._frederik._version);
		}
	}

	window._frederik._focus = function() {
		u.e.addEvent(this, "keydown", window._frederik._update);
	}
	window._frederik._blur = function() {
		u.e.removeEvent(this, "keydown", window._frederik._update);
	}

	window._frederik._update = function(event) {

		event = event ? event : window.event;
		if(event.keyCode == 38) {
			if((event.ctrlKey || event.metaKey || event.shiftKey)) {
				this.value = (parseInt(this.value)+10);
			}
			else {
				this.value = (parseInt(this.value)+1);
			}
		}
		else if(event.keyCode == 40) {
			if((event.ctrlKey || event.metaKey || event.shiftKey)) {
				this.value = (parseInt(this.value)-10);
			}
			else {
				this.value = (parseInt(this.value)-1);
			}
		}
		window._jes_text.nodes[0].text_settings[this.node.s_tag][this.node.s_size] = this.value/window._frederik._base_size;

		window._jes_text.precalculate();
		window._jes_text.scale();
//		u.xInObject(window._jes_text.nodes[0].text_settings[this.node.s_tag]);

	}

	var i, node;
	for(i = 0; node = window._jes_text.nodes[i]; i++) {
		if(node.parentNode && node.offsetHeight) {

			var tag_index = 1;
			for(tag in node.text_settings) {
				var settings = node.text_settings[tag];

				var _tag = u.ae(window._frederik, "div", {"class":"tag tag"+tag_index});
				var tag_index = tag_index+1;

				// inject levers for each tag

				// min lever
				_tag._min = u.ae(_tag, "div", {"class":"min"});
				_tag._min.s_tag = tag;
				_tag._min.s_width = "min_width";
				_tag._min.s_size = "min_size";

				// _tag._min.width_setting = settings.min_width;
				// _tag._min.size_setting = settings.min_size;

				_tag._min.tag = u.ae(_tag._min, "div", {"class":"head"});
				u.ae(_tag._min.tag, "h2", {"html":tag+" min"});
				var w = u.ae(_tag._min.tag, "div", {"class":"width", "html":"<label>width:</label>"});
				var s = u.ae(_tag._min.tag, "div", {"class":"size", "html":"<label>size:</label>"});

				_tag._min._width = u.ae(w, "span", {"class":"width", "html":settings.min_width});
				_tag._min._size = u.ae(s, "input", {"class":"size", "value":settings.min_size*window._frederik._base_size});
				_tag._min._size.node = _tag._min;

				u.e.addEvent(_tag._min._size, "focus", window._frederik._focus);
				u.e.addEvent(_tag._min._size, "blur", window._frederik._blur);

				// position lever
				u.as(_tag._min, "left", settings.min_width+"px");


				// max lever
				_tag._max = u.ae(_tag, "div", {"class":"max"});
				_tag._max.s_tag = tag;
				_tag._max.s_width = "max_width";
				_tag._max.s_size = "max_size";

				// _tag._max.width_setting = settings.max_width;
				// _tag._max.size_setting = settings.max_size;

				_tag._max.tag = u.ae(_tag._max, "div", {"class":"head"});
				u.ae(_tag._max.tag, "h2", {"html":tag+" max"});
				var w = u.ae(_tag._max.tag, "div", {"class":"width", "html":"<label>width:</label>"});
				var s = u.ae(_tag._max.tag, "div", {"class":"size", "html":"<label>size:</label>"});

				_tag._max._width = u.ae(w, "span", {"class":"width", "html":settings.max_width});
				_tag._max._size = u.ae(s, "input", {"class":"size", "value":settings.max_size*window._frederik._base_size});
				_tag._max._size.node = _tag._max;

				u.e.addEvent(_tag._max._size, "focus", window._frederik._focus);
				u.e.addEvent(_tag._max._size, "blur", window._frederik._blur);


				// position lever
				u.as(_tag._max, "left", settings.max_width+"px");


				// enable drag
				u.frederikEnableDrag(_tag._min);
				u.frederikEnableDrag(_tag._max);

			}
		}
	}

}

u.frederikEnableDrag = function(node) {

	// click
	u.e.click(node);
	node.moved = function(event) {
		u.e.kill(event);
		// mouse offset to top/left corner
		this._offset_x = u.absX(this) - u.eventX(event);
		this._offset_y = u.absY(this) - u.eventY(event);

		document.body._frederik_is_dragging = this;

		// follow mouse events
		u.e.addMoveEvent(document.body, u.frederikDrag);
		u.e.addEndEvent(document.body, u.frederikDrop);
	}
	
	node._hessitate_at = {
		"600":true,
		"800":true,
		"960":true,
		"1024":true,
		"1366":true,
		"1280":true,
		"1600":true,
		"1920":true
	}
}

u.frederikDrag = function(event) {

	var node = document.body._frederik_is_dragging;

	var x = u.eventX(event)+node._offset_x;

	window._jes_text.nodes[0].text_settings[node.s_tag][node.s_width] = x;
	// if x is hessitation point, start timer
	// TODO: extend to check if number is passed since last event
	if(node._hessitate_at[x]) {
		node._width.innerHTML = x;
		node._hessitate_for = 17;
	}

	if(node && !node._hessitate_for) {
		node._width.innerHTML = x;
		u.as(node, "left", x + "px");
	}
	if(node._hessitate_for) {
		node._hessitate_for = node._hessitate_for-1;
	}

	window._jes_text.precalculate();
	window._jes_text.scale();

//	u.bug(window._jes_text.nodes[0].min_width);
//	u.xInObject(window._jes_text.nodes[0].text_settings["h1"]);
//	u.bug(node.width_setting);
}
u.frederikDrop = function() {
	u.e.removeMoveEvent(document.body, u.frederikDrag);
	u.e.removeEndEvent(document.body, u.frederikDrop);
	
	document.body._frederik_is_dragging = false;
}

// login to FREDERIK
u.isFrederik = function(event) {

	this._is_really_frederik = this._is_really_frederik ? this._is_really_frederik : [];
	event = event ? event : window.event;
	var key = String.fromCharCode(event.keyCode);

	// add key and test
	this._is_really_frederik.push(key);
	if(this._is_really_frederik.join("").toLowerCase() == "frederik") {

		u.e.removeEvent(document, "keydown", u.isFrederik);

		u.e.addEvent(document, "keydown", u.toggleFrederik);
		u.frederik();
	}
	// still on track
	else if(!("frederik").match(this._is_really_frederik.join("").toLowerCase())) {
		this._is_really_frederik = [];
	}

}

// toggle FREDERIK ON/OFF
u.toggleFrederik = function(event) {
	event = event ? event : window.event;
	if(event.keyCode == 27) {
		if(u.gcs(window._frederik, "display") == "none") {
			u.as(window._frederik, "display", "block");
		}
		else {
			u.as(window._frederik, "display", "none");
		}
	}
}


u.e.addEvent(document, "keydown", u.isFrederik);

// Location custom field
// initializer and validator
// Location is a multi input field


// initializer
Util.Form.customInit["location"] = function(_form, field) {

	// location, latitude and longitude

	// get all inputs
	field._inputs = u.qsa("input", field);

	// use first input as field input 
	field._input = field._inputs[0];

	for(j = 0; input = field._inputs[j]; j++) {
		input.field = field;
		input._form = _form;

		// add input to fields array
		_form.fields[input.name] = input;

		// get input label
		input._label = u.qs("label[for='"+input.id+"']", field);


		// get/set value function
		input.val = u.f._value;

		// change/update events
		u.e.addEvent(input, "keyup", u.f._updated);
		u.e.addEvent(input, "change", u.f._changed);

		// submit on enter (checks for autocomplete etc)
		u.f.inputOnEnter(input);

		// activate input
		u.f.activateInput(input);
	}

	// inject Geolocation button if browser supports geolocation
	if(navigator.geolocation) {


		u.f.geoLocation(field);


	}

	// validate field now
	u.f.validate(field._input);
}

// validator
Util.Form.customValidate["location"] = function(iN) {

	// location is typically a three input structure
	// try to validate all three
	var loc_fields = 0;

	// location input
	if(iN.field._input) {

		loc_fields++;

		min = 1;
		max = 255;

		if(
			iN.field._input.val().length >= min &&
			iN.field._input.val().length <= max
		) {
			u.f.fieldCorrect(iN.field._input);
		}
		else {
			u.f.fieldError(iN.field._input);
		}
	}

	// latitude input
	if(iN.field.lat_input) {

		loc_fields++;

		min = -90;
		max = 90;

		if(
			!isNaN(iN.field.lat_input.val()) && 
			iN.field.lat_input.val() >= min && 
			iN.field.lat_input.val() <= max
		) {
			u.f.fieldCorrect(iN.field.lat_input);
		}
		else {
			u.f.fieldError(iN.field.lat_input);
		}
	}

	// longitude input
	if(iN.field.lon_input) {

		loc_fields++;

		min = -180;
		max = 180;

		if(
			!isNaN(iN.field.lon_input.val()) && 
			iN.field.lon_input.val() >= min && 
			iN.field.lon_input.val() <= max
		) {
			u.f.fieldCorrect(iN.field.lon_input);
		}
		else {
			u.f.fieldError(iN.field.lon_input);
		}
	}

	// any errors after validation
	if(u.qsa("input.error", iN.field).length) {

		u.rc(iN.field, "correct");
		u.ac(iN.field, "error");
	}
	// are all fields correct, then apply field correct state
	else if(u.qsa("input.correct", iN.field).length == loc_fields) {

		u.ac(iN.field, "correct");
		u.rc(iN.field, "error");
	}

}


// inject GeoLocation button in location field
// Extended geolocation interface
Util.Form.geoLocation = function(field) {

	u.ac(field, "geolocation");

	field.lat_input = u.qs("div.latitude input", field);
	field.lat_input.autocomplete = "off";
	field.lat_input.field = field;

	field.lon_input = u.qs("div.longitude input", field);
	field.lon_input.autocomplete = "off";
	field.lon_input.field = field;

	// create map if it doesn't exist and position according to field
	field.showMap = function() {
		if(!window._mapsiframe) {
			var lat = this.lat_input.val() !== "" ? this.lat_input.val() : 0;
			var lon = this.lon_input.val() !== "" ? this.lon_input.val() : 0;

			var maps_url = "https://maps.googleapis.com/maps/api/js" + (u.gapi_key ? "?key="+u.gapi_key : "");
			var html = '<html><head>';
			html += '<style type="text/css">body {margin: 0;} #map {width: 300px; height: 300px;} #close {width: 25px; height: 25px; position: absolute; top: 0; left: 0; background: #ffffff; z-index: 10; border-bottom-right-radius: 10px; cursor: pointer;}</style>';
			html += '<script type="text/javascript" src="'+maps_url+'"></script>';
			html += '<script type="text/javascript">';

			html += 'var map, marker;';
			html += 'var initialize = function() {';
			html += '	window._map_loaded = true;';
			html += '	var close = document.getElementById("close");';
			html += '	close.onclick = function() {field.hideMap();};';
			html += '	var mapOptions = {center: new google.maps.LatLng('+lat+', '+lon+'),zoom: 15, streetViewControl: false, zoomControlOptions: {position: google.maps.ControlPosition.LEFT_CENTER}};';
			html += '	map = new google.maps.Map(document.getElementById("map"),mapOptions);';
			html += '	marker = new google.maps.Marker({position: new google.maps.LatLng('+lat+', '+lon+'), draggable:true});';
			html += '	marker.setMap(map);';

			html += '	marker.dragend = function(event_type) {';
			html += '		var lat_marker = Math.round(marker.getPosition().lat()*100000)/100000;';
			html += '		var lon_marker = Math.round(marker.getPosition().lng()*100000)/100000;';
			html += '		field.lon_input.val(lon_marker);';
			html += '		field.lat_input.val(lat_marker);';
			html += '	};';
			html += '	marker.addListener("dragend", marker.dragend);';
			html += '};';

			html += 'var centerMap = function(lat, lon) {';
			html += '	var loc = new google.maps.LatLng(lat, lon);';
			html += '	map.setCenter(loc);';
			html += '	marker.setPosition(loc);';
			html += '};';
			html += 'google.maps.event.addDomListener(window, "load", initialize);';
			html += '</script>';
			html += '</head><body><div id="map"></div><div id="close"></div></body></html>';

			window._mapsiframe = u.ae(document.body, "iframe", {"id":"geolocationmap"});
			window._mapsiframe.field = this;

			window._mapsiframe.doc = window._mapsiframe.contentDocument ? window._mapsiframe.contentDocument : window._mapsiframe.contentWindow.document;
			window._mapsiframe.doc.open();
			window._mapsiframe.doc.write(html);
			window._mapsiframe.doc.close();

		}
		else {

			// TODO: avoid this
//				this.updateMap();


		}

		window._mapsiframe.contentWindow.field = this;
		u.as(window._mapsiframe, "left", (u.absX(this.bn_geolocation)+this.bn_geolocation.offsetWidth+10)+"px");
		u.as(window._mapsiframe, "top", (u.absY(this.bn_geolocation) + (this.bn_geolocation.offsetHeight/2) -(window._mapsiframe.offsetHeight/2))+"px");
	}
	// update map center
	field.updateMap = function() {

		if(window._mapsiframe && window._mapsiframe.contentWindow && window._mapsiframe.contentWindow._map_loaded) {
			window._mapsiframe.contentWindow.centerMap(this.lat_input.val(), this.lon_input.val());
		}
	}
	// move map based on key presses or current values
	field.moveMap = function(event) {

		var factor;
		if(this._move_direction) {

			// TODO: find way to adjust factor to current zoom state
			if(event && event.shiftKey) {
				factor = 0.001;
			}
			else {
				factor = 0.0001;
			}
			
			if(this._move_direction == "38") {
				this.lat_input.val(u.round(parseFloat(this.lat_input.val())+factor, 6));
			}
			else if(this._move_direction == "40") {
				this.lat_input.val(u.round(parseFloat(this.lat_input.val())-factor, 6));
			}
			else if(this._move_direction == "39") {
				this.lon_input.val(u.round(parseFloat(this.lon_input.val())+factor, 6));
			}
			else if(this._move_direction == "37") {
				this.lon_input.val(u.round(parseFloat(this.lon_input.val())-factor, 6));
			}

			this.updateMap();
		}
	}

	field.hideMap = function() {
		u.t.resetTimer(this.t_hide_map);

		if(window._mapsiframe) {
			document.body.removeChild(window._mapsiframe);
			window._mapsiframe = null;
		}
	}

	field._end_move_map = function(event) {

		this.field._move_direction = false;
	}
	field._start_move_map = function(event) {

		if(event.keyCode.toString().match(/37|38|39|40/)) {
			this.field._move_direction = event.keyCode;
			this.field.moveMap(event);
		}

	}


	u.e.addEvent(field.lat_input, "keydown", field._start_move_map);
	u.e.addEvent(field.lon_input, "keydown", field._start_move_map);
	u.e.addEvent(field.lat_input, "keyup", field._end_move_map);
	u.e.addEvent(field.lon_input, "keyup", field._end_move_map);


	field.lat_input.updated = field.lon_input.updated = function() {
		this.field.updateMap();
	}
	field.lat_input.focused = field.lon_input.focused = function() {
		u.t.resetTimer(this.field.t_hide_map);

		this.field.showMap();
	}
	// hide map when lat/long fields loose focus
	field.lat_input.blurred = field.lon_input.blurred = function() {
//			this.field.t_hide_map = u.t.setTimer(this.field, this.field.hideMap, 800);
	}


	field.bn_geolocation = u.ae(field, "div", {"class":"geolocation"});
	field.bn_geolocation.field = field;
	u.ce(field.bn_geolocation);

	// get location from geolocation API
	field.bn_geolocation.clicked = function() {

		// animation while waiting for location
//		u.a.transition(this, "all 0.5s ease-in-out");
		this.transitioned = function() {
			var new_scale;
			if(this._scale == 1.4) {
				new_scale = 1;
			}
			else {
				new_scale = 1.4;
			}
			u.a.scale(this, new_scale);
		}
		this.transitioned();

		window._geoLocationField = this.field;

		window._foundLocation = function(position) {
			var lat = position.coords.latitude;
			var lon = position.coords.longitude;

			window._geoLocationField.lat_input.val(u.round(lat, 6));
			window._geoLocationField.lon_input.val(u.round(lon, 6));
			// trigger validation
			window._geoLocationField.lat_input.focus();
			window._geoLocationField.lon_input.focus();

			// end process animation
			u.a.transition(window._geoLocationField.bn_geolocation, "none");
			u.a.scale(window._geoLocationField.bn_geolocation, 1);

			// show map
			window._geoLocationField.showMap();

			// update map
			window._geoLocationField.updateMap();
		}

		// Location error
		window._noLocation = function() {

			u.a.transition(window._geoLocationField.bn_geolocation, "none");
			u.a.scale(window._geoLocationField.bn_geolocation, 1);

			alert('Could not find location');
		}

		navigator.geolocation.getCurrentPosition(window._foundLocation, window._noLocation);

	}
}


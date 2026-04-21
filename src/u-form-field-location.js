// Location custom field
// initializer and validator
// Location is a multi input field


// initializer
Util.Form.customInit["location"] = function(field) {

	// Register field type
	field.type = "location";

	// location, latitude and longitude

	// get all inputs
	field.inputs = u.qsa("input", field);

	// use first input as field input 
	field.input = field.inputs[0];

	for(j = 0; j < field.inputs.length; j++) {
		input = field.inputs[j];

		// form is a reserved property, so we use _form
		input._form = field._form;
		// Get associated label
		input.label = u.qs("label[for='"+input.id+"']", field);
		// Let it know it's field
		input.field = field;

		// get/set value function
		input.val = u.f._value;

		// change/update events
		u.e.addEvent(input, "keyup", u.f._updated);
		u.e.addEvent(input, "change", u.f._changed);

		// submit on enter
		u.f.inputOnEnter(input);

		// Add additional standard event listeners and labelstyle
		u.f.activateInput(input);
	}

	// inject Geolocation button if browser supports geolocation
	if(navigator.geolocation) {


		u.f.location(field);


	}

}

// validator
Util.Form.customValidate["location"] = function(iN) {

	// location is typically a three input structure
	// try to validate all three
	var loc_fields = 0;

	// location input
	if(iN.field.input) {

		loc_fields++;

		min = 1;
		max = 255;

		if(
			iN.field.input.val().length >= min &&
			iN.field.input.val().length <= max
		) {
			u.f.inputIsCorrect(iN.field.input);
		}
		else {
			u.f.inputHasError(iN.field.input);
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
			u.f.inputIsCorrect(iN.field.lat_input);
		}
		else {
			u.f.inputHasError(iN.field.lat_input);
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
			u.f.inputIsCorrect(iN.field.lon_input);
		}
		else {
			u.f.inputHasError(iN.field.lon_input);
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
Util.Form.location = function(field) {

	u.ac(field, "geolocation");

	field.lat_input = u.qs("div.latitude input", field);
	field.lat_input.autocomplete = "off";
	field.lat_input.field = field;

	field.lon_input = u.qs("div.longitude input", field);
	field.lon_input.autocomplete = "off";
	field.lon_input.field = field;


	// create map if it doesn't exist and position according to field
	field.showMap = function() {

		
		// Do not attempt to create map view without api key
		if(u.gapi_key) {
			if(!this.iframe_maps) {

				var lat = this.lat_input.val() !== "" ? this.lat_input.val() : 0;
				var lon = this.lon_input.val() !== "" ? this.lon_input.val() : 0;

				var maps_url = "https://maps.googleapis.com/maps/api/js?key="+u.gapi_key+"&libraries=marker&callback=initMap&loading=async";
				var html = '<!DOCTYPE html><html><head>';
				html += '</head><body><div id="map"></div><div id="close"></div>';
				html += '<style type="text/css">body {margin: 0;} #map {width: 100%; height: 300px;} #close {width: 25px; height: 25px; position: absolute; top: 0; left: 0; background: #ffffff; z-index: 10; border-bottom-right-radius: 10px; cursor: pointer;} gmp-advanced-marker {outline: none;}</style>';
				html += '<script type="text/javascript">';

				html += 'var map, marker;';
				html += 'var initMap = function() {';
				html += '	window._map_loaded = true;';
				html += '	var close = document.getElementById("close");';
				html += '	close.onclick = function() {field.hideMap();};';
				html += '	var mapOptions = {center: new google.maps.LatLng('+lat+', '+lon+'),zoom: 15, streetViewControl: false, zoomControlOptions: {position: google.maps.ControlPosition.LEFT_CENTER}, mapId:"map"};';
				html += '	map = new google.maps.Map(document.getElementById("map"), mapOptions);';
				html += '	document.getElementById("map").addEventListener("mousedown", function(){clearTimeout(document.field.t_hide_map)});';

				html += '	marker = new google.maps.marker.AdvancedMarkerElement({position: new google.maps.LatLng('+lat+', '+lon+'), map:map, gmpDraggable: true});';
				html += '	marker.field = document.field;';
				html += '	marker.dragend = function(event_type) {';
				html += '		var lat_marker = Math.round(marker.position.lat*100000)/100000;';
				html += '		var lon_marker = Math.round(marker.position.lng*100000)/100000;';
				html += '		this.field.lon_input.val(lon_marker);';
				html += '		this.field.lat_input.val(lat_marker);';
				html += '	};';
				html += '	marker.addListener("dragend", marker.dragend);';

				html += '};';

				html += 'var centerMap = function(lat, lon) {';
				html += '	var loc = new google.maps.LatLng(lat, lon);';
				html += '	map.setCenter(loc);';
				html += '	marker.position = loc;';
				html += '};';
				html += '</script>';
				html += '<script type="text/javascript" src="'+maps_url+'" async></script>';
				html += '</body></html>';

				this.iframe_maps = u.ae(this, "iframe", {"class": "geolocationmap"});

				this.iframe_maps.doc = this.iframe_maps.contentDocument ? this.iframe_maps.contentDocument : this.iframe_maps.contentWindow.document;
				this.iframe_maps.doc.field = this;
				this.iframe_maps.doc.open();
				this.iframe_maps.doc.write(html);
				this.iframe_maps.doc.close();


				u.e.addEvent(this.iframe_maps.doc, "focus", function() {u.t.resetTimer(this.field.t_hide_map)});
				u.e.addEvent(this.iframe_maps.doc, "blur", function() {this.field.startHideTimer();});

			}

		}
		else {
			u.bug("Attempted to include map, but u.gapi_key is missing");
		}

	}

	// update map center
	field.updateMap = function() {

		if(this.iframe_maps && this.iframe_maps.contentWindow && this.iframe_maps.contentWindow._map_loaded) {
			this.iframe_maps.contentWindow.centerMap(this.lat_input.val(), this.lon_input.val());
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

		if(this.iframe_maps) {
			this.removeChild(this.iframe_maps);
			delete this.iframe_maps;
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
		this.field.startHideTimer();
	}

	field.startHideTimer = function() {
		this.t_hide_map = u.t.setTimer(this, this.hideMap, 800);
	}


	field.bn_geolocation = u.ae(field, "div", {"class":"geolocation", "title":"Select current location"});
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

		window._locationField = this.field;

		window._foundLocation = function(position) {
			var lat = position.coords.latitude;
			var lon = position.coords.longitude;

			window._locationField.lat_input.val(u.round(lat, 6));
			window._locationField.lon_input.val(u.round(lon, 6));
			// trigger validation
			window._locationField.lat_input.focus();
			window._locationField.lon_input.focus();

			// end process animation
			u.a.transition(window._locationField.bn_geolocation, "none");
			u.a.scale(window._locationField.bn_geolocation, 1);

			// show map
			window._locationField.showMap();

			// update map
			window._locationField.updateMap();
		}

		// Location error (Could be non SSL site or no access to Location service)
		window._noLocation = function() {

			// Use Copenhagen as starting point
			window._locationField.lat_input.val(55.676098);
			window._locationField.lon_input.val(12.568337);
			// trigger validation
			window._locationField.lat_input.focus();
			window._locationField.lon_input.focus();

			u.a.transition(window._locationField.bn_geolocation, "none");
			u.a.scale(window._locationField.bn_geolocation, 1);

			// show map
			window._locationField.showMap();

			// update map
			window._locationField.updateMap();
		}

		navigator.geolocation.getCurrentPosition(window._foundLocation, window._noLocation);

	}
}


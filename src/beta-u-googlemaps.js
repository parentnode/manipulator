u.googlemaps = new function() {


	this.api_loaded = false;

	// center and map required
	this.map = function(map, center, _options) {

		map._maps_streetview = false;
		map._maps_zoom = 10;
		map._maps_scrollwheel = true;
		map._maps_zoom = 10;
		map._center_latitude = center[0];
		map._center_longitude = center[1];
		


		if(typeof(_options) == "object") {
			var _argument;
			for(_argument in _options) {

				switch(_argument) {
					case "zoom"           : map._maps_zoom               = _options[_argument]; break;
					case "scrollwheel"    : map._maps_scrollwheel        = _options[_argument]; break;
					case "streetview"     : map._maps_streetview         = _options[_argument]; break;
				}

			}
		}


		var map_key = u.randomString(8);
		
		(window[map_key] = function() {

//			u.bug("center:" + center[0] + "," + map._center_longitude + "," + map._maps_zoom)
			var mapOptions = {center: new google.maps.LatLng(center[0], center[1]), zoom: map._maps_zoom, scrollwheel: map._maps_scrollwheel, streetViewControl: map._maps_streetview, zoomControlOptions: {position: google.maps.ControlPosition.LEFT_TOP}};
			map.g_map = new google.maps.Map(map, mapOptions);

			if(typeof(map.APIloaded) == "function") {
				map.APIloaded();
			}

			google.maps.event.addListener(map.g_map, 'tilesloaded', function() {
				if(typeof(map.loaded) == "function") {
					map.loaded();
				}
			});

		});

		// load api?
		if(!this.api_loaded) {
			u.ae(document.head, "script", {"src":"https://maps.googleapis.com/maps/api/js?callback="+map_key+(u.gapi_key ? "&key="+u.gapi_key : "")});
			this.api_loaded = true;
		}
		else {
			window[map_key]();
		}

	}

	// set marker
	this.addMarker = function(map, coords, _options) {
//		u.bug("addMarker:" + coords + ", " + map)

		var _info = false;

		if(typeof(_options) == "object") {
			var _argument;
			for(_argument in _options) {

				switch(_argument) {
					case "info"           : _info               = _options[_argument]; break;
				}

			}
		}


		var marker = new google.maps.Marker({position: new google.maps.LatLng(coords[0], coords[1]), animation:google.maps.Animation.DROP, InfoWindow: {content:"hest"}});
		marker.setMap(map);

		marker.g_map = map;

		google.maps.event.addListener(marker, 'click', function() {
			if(typeof(this.clicked) == "function") {
				this.clicked();
			}
		});
		google.maps.event.addListener(marker, 'mouseover', function() {
			if(typeof(this.entered) == "function") {
				this.entered();
			}
		});
		google.maps.event.addListener(marker, 'mouseout', function() {
			if(typeof(this.exited) == "function") {
				this.exited();
			}
		});

		return marker;
	}

	this.removeMarker = function(map, marker, _options) {

		marker._animation = true;

		if(typeof(_options) == "object") {
			var _argument;
			for(_argument in _options) {

				switch(_argument) {
					case "animation"      : marker._animation            = _options[_argument]; break;
				}

			}
		}


		if(marker._animation) {
			
			var key = u.randomString(8);
			marker.pick_step = 0;

			marker.c_zoom = (1 << map.getZoom());
			marker.c_projection = map.getProjection();
			marker.c_exit = map.getBounds().getNorthEast().lat();

			marker._pickUp = function() {

				var new_position = this.c_projection.fromLatLngToPoint(this.getPosition());
	//			u.bug("weird shit:"  + (1 << map.getZoom()) + ", " + map.getZoom());

				new_position.y -= (20*this.pick_step) / this.c_zoom; 
				new_position = this.c_projection.fromPointToLatLng(new_position);
				this.setPosition(new_position);

				if(this.c_exit < new_position.lat()) {
					this.setMap(null);
					if(typeof(this.removed) == "function") {
						this.removed();
					}
				}
				else{
					this.pick_step++;
					u.t.setTimer(this, this._pickUp, 20);
				}
		
			}
			marker._pickUp();

		}
		else {
			marker.setMap(null);
		}
	}

	this.infoWindow = function(map) {
		map.g_infowindow = new google.maps.InfoWindow({"maxWidth":250});

		google.maps.event.addListener(map.g_infowindow, 'closeclick', function() {
			if(this._marker && typeof(this._marker.closed) == "function") {
				this._marker.closed();
				this._marker = false;
			}
		});
	}

	this.showInfoWindow = function(map, marker, content) {
		map.g_infowindow.setContent(content);
		map.g_infowindow.open(map, marker);
		map.g_infowindow._marker = marker;
	}

	this.hideInfoWindow = function(map) {
		map.g_infowindow.close();

		if(map.g_infowindow._marker && typeof(map.g_infowindow._marker.closed) == "function") {
			map.g_infowindow._marker.closed();
			map.g_infowindow._marker = false;
		}

		map.g_infowindow._marker = false;
	}


	this.zoom = function() {
		
	}

	this.center = function() {
		
	}

}


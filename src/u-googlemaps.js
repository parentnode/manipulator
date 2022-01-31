u.googlemaps = new function() {


	this.api_loading = false;
	this.api_loaded = false;
	this.api_load_queue = [];
	
	// center and map required
	this.map = function(map, center, _options) {

		map._center_latitude = center[0];
		map._center_longitude = center[1];

		map._zoom = 10;

		map._streetview = false;
		map._scrollwheel = true;
		map._styles = false;
		map._disable_ui = false;
		map._fullscreenControl = false;
		map._zoomControl = true;
		map._zoomControlOptions = false;
		map._keyboardShortcuts = false;


		if(obj(_options)) {
			var _argument;
			for(_argument in _options) {

				switch(_argument) {
					case "zoom"                  : map._zoom                    = _options[_argument]; break;

					case "scrollwheel"           : map._scrollwheel             = _options[_argument]; break;
					case "streetview"            : map._streetview              = _options[_argument]; break;
					case "styles"                : map._styles                  = _options[_argument]; break;
					case "disableUI"             : map._disable_ui              = _options[_argument]; break;
					case "fullscreenControl"     : map._fullscreenControl       = _options[_argument]; break;
					case "zoomControl"           : map._zoomControl             = _options[_argument]; break;
					case "zoomControlOptions"    : map._zoomControlOptions      = _options[_argument]; break;
					case "keyboardShortcuts"     : map._keyboardShortcuts       = _options[_argument]; break;
				}

			}
		}


		var map_key = u.randomString(8);
		window[map_key] = function() {

			u.googlemaps.api_loaded = true;
			u.googlemaps.api_loading = false;

			var map;
			while(u.googlemaps.api_load_queue.length) {
				map = u.googlemaps.api_load_queue.shift();
				map.init();
			}

		}
		
		map.init = function() {
			// u.bug("map init");
		//	u.bug(map_key);
//			u.bug("center:" + center[0] + "," + map._center_longitude + "," + map._maps_zoom)
			var mapOptions = {
				center: new google.maps.LatLng(this._center_latitude, this._center_longitude), 
				zoom: this._zoom, 
				scrollwheel: this._scrollwheel, 
				streetViewControl: this._streetview, 
				zoomControl: this._zoomControl, 
				zoomControlOptions: this._zoomControlOptions ? this._zoomControlOptions : {position: google.maps.ControlPosition.LEFT_TOP}, 
				styles: this._styles, 
				disableDefaultUI: this._disable_ui,
				fullscreenControl: this._fullscreenControl,
				keyboardShortcuts: this._keyboardShortcuts,
			};
			this.g_map = new google.maps.Map(this, mapOptions);
			this.g_map.m_map = this



			if(fun(this.APIloaded)) {
				this.APIloaded();
			}

			google.maps.event.addListener(this.g_map, 'tilesloaded', function() {
				if(fun(this.m_map.tilesloaded)) {
					this.m_map.tilesloaded();
				}
			});

			google.maps.event.addListenerOnce(this.g_map, 'tilesloaded', function() {
				if(fun(this.m_map.loaded)) {
					this.m_map.loaded();
				}
			});

		}

		// load api?
		if(!this.api_loaded && !this.api_loading) {
			u.ae(document.head, "script", {"src":"https://maps.googleapis.com/maps/api/js?callback="+map_key+(u.gapi_key ? "&key="+u.gapi_key : "")});
			this.api_loading = true;
			this.api_load_queue.push(map);
		}
		else if(this.api_loading) {
			this.api_load_queue.push(map);
		}
		else {
			map.init();
		}

	}

	// set marker
	this.addMarker = function(map, coords, _options) {
//		u.bug("addMarker:" + coords + ", " + map)

		var _icon;
		var _label = null;

		if(obj(_options)) {
			var _argument;
			for(_argument in _options) {

				switch(_argument) {
					case "icon"           : _icon               = _options[_argument]; break;
					case "label"          : _label              = _options[_argument]; break;
				}

			}
		}


		var marker = new google.maps.Marker({position: new google.maps.LatLng(coords[0], coords[1]), animation:google.maps.Animation.DROP, icon: _icon, label: _label});
		marker.setMap(map.g_map);

		marker.g_map = map.g_map;

		google.maps.event.addListener(marker, 'click', function() {
			if(fun(this.clicked)) {
				this.clicked();
			}
		});
		google.maps.event.addListener(marker, 'mouseover', function() {
			if(fun(this.entered)) {
				this.entered();
			}
		});
		google.maps.event.addListener(marker, 'mouseout', function() {
			if(fun(this.exited)) {
				this.exited();
			}
		});

		return marker;
	}

	this.removeMarker = function(map, marker, _options) {

		marker._animation = true;

		if(obj(_options)) {
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
					if(fun(this.removed)) {
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
			if(this._marker && fun(this._marker.closed)) {
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

		if(map.g_infowindow._marker && fun(map.g_infowindow._marker.closed)) {
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

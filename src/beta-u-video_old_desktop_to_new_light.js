Util.videoPlayer = function(_options) {


	// designed to work with just one player being moved around

	var player = document.createElement("div");
	u.ac(player, "videoplayer");


	// autoplay
	player._autoplay = false;
	player._muted = false;
	player._loop = false;
	player._playsinline = false;
	player._crossorigin = "anonymous";

	// native controls default settings
	player._native_controls = false;


	// play/pause button
	player._controls_playpause = false;
	player._controls_play = false;
	player._controls_pause = false;
	player._controls_stop = false;

	// TODO: zoom/fullscreen button
	player._controls_zoom = false;
	// TODO: volume button
	player._controls_volume = false;
	// TODO: rw/ff buttons
	player._controls_search = false;

	// set ff and rw skip-rate
	player._ff_skip = 2;
	player._rw_skip = 2;


	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "autoplay"     : player._autoplay               = _options[_argument]; break;
				case "controls"     : player._controls               = _options[_argument]; break;

				case "playpause"    : player._controls_playpause     = _options[_argument]; break;
				case "zoom"         : player._controls_zoom          = _options[_argument]; break;
				case "volume"       : player._controls_volume        = _options[_argument]; break;
				case "search"       : player._controls_search        = _options[_argument]; break;

				case "ff_skip"      : player._ff_skip                = _options[_argument]; break;
				case "rw_skip"      : player._rw_skip                = _options[_argument]; break;
			}
		}
	}


	// create HTML5 video node
	player.video = u.ae(player, "video");


	// Does browser support HTML5 video
	if(fun(player.video.play)) {

		// set up functions for HTML5 player

		// Load video
		player.load = function(src, _options) {
			u.bug("load video:" + src);

			// optional controls override
			// if(obj(_options)) {
			// 	var _argument;
			// 	for(_argument in _options) {
			//
			// 		switch(_argument) {
			//
			// 			case "autoplay"     : this._autoplay               = _options[_argument]; break;
			// 			case "controls"     : this._controls               = _options[_argument]; break;
			//
			// 			case "playpause"    : this._controls_playpause     = _options[_argument]; break;
			// 			case "zoom"         : this._controls_zoom          = _options[_argument]; break;
			// 			case "volume"       : this._controls_volume        = _options[_argument]; break;
			// 			case "search"       : this._controls_search        = _options[_argument]; break;
			// 			case "fullscreen"   : this._controls_fullscreen    = _options[_argument]; break;
			//
			// 			case "ff_skip"      : this._ff_skip                = _options[_argument]; break;
			// 			case "rw_skip"      : this._rw_skip                = _options[_argument]; break;
			// 		}
			// 	}
			// }

			// stop video if playing
			if(u.hc(this, "playing")) {
				this.stop();
			}

			// reset video safety net (or old video may show before new one loads)
			this.setup(_options);

			// only attempt to load video if source is available
			if(src) {
//				u.bug(this.correctSource(src));

				// get correct source for browser
				this.video.src = this.correctSource(src);

				// load video
				this.video.load();

				// this.video.controls = player._controls;
				// this.video.autoplay = player._autoplay;
			}
		}

		// Play video
		player.play = function(position) {

			// use position only if stated (position can be 0)
			if(this.video.currentTime && position !== undefined) {
				this.video.currentTime = position;
			}

			// has src? then play
			if(this.video.src) {
				this.video.play();
			}
		}

		// Load and play
		player.loadAndPlay = function(src, _options) {

			// default position is 0
			var position = 0;

			// optional position
			if(obj(_options)) {
				var _argument;
				for(_argument in _options) {

					switch(_argument) {
						case "position"		: position		= _options[_argument]; break;
					}
				}
			}

			// load and send player options
			this.load(src, _options);

			// firefox does not throw canplaythrough event unless I call play when loading
			// TODO: test if this is still firefox issue

			// play when ready
			this.play(position);
		}

		// Pause playback but stay at current position
		player.pause = function() {
			this.video.pause();
		}

		// Stop playback and reset postion
		player.stop = function() {
			this.video.pause();

			// reset position
			if(this.video.currentTime) {
				this.video.currentTime = 0;
			}
		}

		// Fast forward video - only if video is fully loaded
		player.ff = function() {

//			u.bug("player.ff:" + this.video.currentTime);
			if(this.video.src && this.video.currentTime && this.videoLoaded) {
				this.video.currentTime = (this.video.duration - this.video.currentTime >= this._ff_skip) ? (this.video.currentTime + this._ff_skip) : this.video.duration;
				this.video._timeupdate();
			}
		}

		// Rewind video - only if video is fully loaded
		player.rw = function() {
//			u.bug("player.rw:" + this.video.currentTime);
			if(this.video.src && this.video.currentTime && this.videoLoaded) {
				this.video.currentTime = (this.video.currentTime >= this._rw_skip) ? (this.video.currentTime - this._rw_skip) : 0;
				this.video._timeupdate();
			}
		}
 
		// Toggle between play and pause
		player.togglePlay = function() {

			if(u.hc(this, "playing")) {
				this.pause();
			}
			else {
				this.play();
			}
		}

		// set volume
		player.volume = function(value) {
//			u.bug("set volume:" + value)
			this.video.volume = value;

			if(value === 0) {
				u.ac(this, "muted");
			}
			else {
				u.rc(this, "muted");
			}
		}

		// toggle sound on/off
		player.toggleVolume = function() {
			if(this.video.volume) {
				this.video.volume = 0;
				u.ac(this, "muted");
			}
			else {
				this.video.volume = 1;
				u.rc(this, "muted");
			}
		}

		// destroy old player and set up new player from scratch
		player.setup = function() {

			// reset video safety net (or old video may show before new one loads)
			if(this.video) {
				var video = this.removeChild(this.video);
				delete video;
			}

			// add video player again
			this.video = u.ie(this, "video");
			this.video.player = this;


			// set up controls (based on JSON settings)
			this.setControls();


			// reset external values
			this.currentTime = 0;
			this.duration = 0;
			this.videoLoaded = false;
			this.metaLoaded = false;


			// CALLBACK EVENTS

			// loading has started
			this.video._loadstart = function(event) {
//				u.bug("_loadstart");

				u.ac(this.player, "loading");

				if(fun(this.player.loading)) {
					this.player.loading(event);
				}
			}
			u.e.addEvent(this.video, "loadstart", this.video._loadstart);

			// enough is loaded to play entire movie
			this.video._canplaythrough = function(event) {
//				u.bug("_canplaythrough");

				u.rc(this.player, "loading");

				if(fun(this.player.canplaythrough)) {
					this.player.canplaythrough(event);
				}
			}
			u.e.addEvent(this.video, "canplaythrough", this.video._canplaythrough);

			// movie is playing
			this.video._playing = function(event) {
//				u.bug("_playing");

				u.rc(this.player, "loading|paused");
				u.ac(this.player, "playing");

				if(fun(this.player.playing)) {
					this.player.playing(event);
				}
			}
			u.e.addEvent(this.video, "playing", this.video._playing);

			// movie is paused
			this.video._paused = function(event) {
//				u.bug("_paused");

				u.rc(this.player, "playing|loading");
				u.ac(this.player, "paused");

				if(fun(this.player.paused)) {
					this.player.paused(event);
				}
			}
			u.e.addEvent(this.video, "pause", this.video._paused);

			// movie is stalled
			this.video._stalled = function(event) {
//				u.bug("_stalled");

				u.rc(this.player, "playing|paused");
				u.ac(this.player, "loading");

				if(fun(this.player.stalled)) {
					this.player.stalled(event);
				}
			}
			u.e.addEvent(this.video, "stalled", this.video._paused);

			// movie has played til its end
			this.video._ended = function(event) {
//				u.bug("_ended");

				u.rc(this.player, "playing|paused");

				if(fun(this.player.ended)) {
					this.player.ended(event);
				}
			}
			u.e.addEvent(this.video, "ended", this.video._ended);

			// metadata loaded
			this.video._loadedmetadata = function(event) {
//				u.bug("_loadedmetadata:duration:" + this.duration);
//				u.bug("_loadedmetadata:currentTime:" + this.currentTime);

				this.player.duration = this.duration;
				this.player.currentTime = this.currentTime;
				this.player.metaLoaded = true;

				if(fun(this.player.loadedmetadata)) {
					this.player.loadedmetadata(event);
				}
			}
			u.e.addEvent(this.video, "loadedmetadata", this.video._loadedmetadata);

			// video loaded
			this.video._loadeddata = function(event) {
//				u.bug("_loadeddata:" + this.duration);
	
				this.player.videoLoaded = true;

				if(fun(this.player.loadeddata)) {
					this.player.loadeddata(event);
				}
			}
			u.e.addEvent(this.video, "loadeddata", this.video._loadeddata);

			// timeupdate
			this.video._timeupdate = function(event) {
//				u.bug("_timeupdate:" + this.currentTime);
				this.player.currentTime = this.currentTime;

				if(fun(this.player.timeupdate)) {
					this.player.timeupdate(event);
				}
			}
			u.e.addEvent(this.video, "timeupdate", this.video._timeupdate);
		}


		/* FOR EVENT DEBUGGING
		player.video._event = function(event) {
			 u.bug("3", "event:" + event.type);
		}
		u.e.addEvent(this.video, 'progress', 		this.video._event);
		u.e.addEvent(this.video, 'canplay', 		this.video._event);
		u.e.addEvent(this.video, 'canplaythrough', 	this.video._event);
		u.e.addEvent(this.video, 'suspend', 		this.video._event);
		u.e.addEvent(this.video, 'abort', 			this.video._event);
		u.e.addEvent(this.video, 'error', 			this.video._event);
		u.e.addEvent(this.video, 'emptied', 		this.video._event);
		u.e.addEvent(this.video, 'stalled', 		this.video._event);
		u.e.addEvent(this.video, 'loadstart', 		this.video._event);
		u.e.addEvent(this.video, 'loadeddata', 		this.video._event);
		u.e.addEvent(this.video, 'loadedmetadata', 	this.video._event);
		u.e.addEvent(this.video, 'waiting', 		this.video._event);
		u.e.addEvent(this.video, 'playing', 		this.video._event);
		u.e.addEvent(this.video, 'seeking', 		this.video._event);
		u.e.addEvent(this.video, 'seeked', 			this.video._event);
		u.e.addEvent(this.video, 'ended', 			this.video._event);
		u.e.addEvent(this.video, 'durationchange', 	this.video._event);
		u.e.addEvent(this.video, 'timeupdate', 		this.video._event);
		u.e.addEvent(this.video, 'play', 			this.video._event);
		u.e.addEvent(this.video, 'pause', 			this.video._event);
		u.e.addEvent(this.video, 'ratechange', 		this.video._event);
		u.e.addEvent(this.video, 'volumechange', 	this.video._event);
		//vid.webkitEnterFullscreen();
		*/


	}

	// Flash support
	else if(fun(u.videoPlayerFallback)) {

		// remove HTML5 element
		player.removeChild(player.video);
		player = u.videoPlayerFallback(player);
	}

	else {
		player.load = function() {}
		player.play = function() {}
		player.loadAndPlay = function() {}
		player.pause = function() {}
		player.stop = function() {}
		player.ff = function() {}
		player.rw = function() {}
		player.togglePlay = function() {}
	}



	// GLOBAL PLAYER FUNCTIONS


	// find the correct source for the browser
	player.correctSource = function(src) {

		// remove parameters and add them after format change
		var param = src.match(/\?[^$]+/) ? src.match(/(\?[^$]+)/)[1] : "";
		src = src.replace(/\?[^$]+/, "");

		// remove format extension
		src = src.replace(/\.m4v|\.mp4|\.webm|\.ogv|\.3gp|\.mov/, "");


		// u.bug("cpt:m4v"+this.video.canPlayType("video/x-m4v"));
		// u.bug("cpt:mp4"+this.video.canPlayType("video/mp4"));
		// u.bug("cpt:webm"+this.video.canPlayType("video/webm"));
		// u.bug("cpt:ogg+"+this.video.canPlayType('video/ogg; codecs="theora"'));
		// u.bug("cpt:ogg+"+this.video.canPlayType('video/ogg'));
		// u.bug("cpt:3gpp"+this.video.canPlayType("video/3gpp"));
		// u.bug("cpt:mov"+this.video.canPlayType("video/quicktime"));



		// if flash fallback is used, always use mp4
		if(this.flash) {
			return src+".mp4"+param;
		}

		// MP4
		else if(this.video.canPlayType("video/mp4")) {
			return src+".mp4"+param;
		}

		// OGV
		else if(this.video.canPlayType("video/ogg")) {
			return src+".ogv"+param;
		}

		// webm - currently not supported
		//else if(this.video.canPlayType("video/webm")) {
		//	return src+".webm";
		//}

		// 3gp
		else if(this.video.canPlayType("video/3gpp")) {
			return src+".3gp"+param;
		}

		// fallback to oldschool quicktime
		else {
		//else if(this.video.canPlayType("video/quicktime")) {
			return src+".mov"+param;
		}

	}

	// controls overlay
	player.setControls = function() {


		// make sure we do not set double event listeners
		if(this.showControls) {

			if(u.e.event_pref == "mouse") {
				u.e.removeEvent(this, "mousemove", this.showControls);

				u.e.removeEvent(this.controls, "mouseenter", this._keepControls);
				u.e.removeEvent(this.controls, "mouseleave", this._unkeepControls);
			}
			else {
				u.e.removeEvent(this, "touchstart", this.showControls);
			}
		}


		// inject controls layer in video player
		if(this._controls_playpause || this._controls_zoom || this._controls_volume || this._controls_search) {

			if(!this.controls) {

				// player controls
				this.controls = u.ae(this, "div", {"class":"controls"});
				this.controls.player = this;

				// remember default display state (block, inline-block, inline)
				this.controls._default_display = u.gcs(this.controls, "display");

				// hide controls
				this.hideControls = function() {
					u.bug("hide controls")

					if(!this._keep) {
						// reset timer to avoid double actions
						this.t_controls = u.t.resetTimer(this.t_controls);

						u.a.transition(this.controls, "all 0.3s ease-out");
						u.a.setOpacity(this.controls, 0);
					}
				}

				// show controls
				this.showControls = function() {
					u.bug("show controls")

					// reset timer to keep visible
					if(this.t_controls) {
						this.t_controls = u.t.resetTimer(this.t_controls);
					}
					// fade up
					else {
						u.a.transition(this.controls, "all 0.5s ease-out");
						u.a.setOpacity(this.controls, 1);
					}

					// auto hide after 1 sec of inactivity
					this.t_controls = u.t.setTimer(this, this.hideControls, 1500);
				}

				// keep controls (on mouse enter)
				// attatched to controls div
				this._keepControls = function() {
//					u.bug("keep controls")
					this.player._keep = true;
				}

				// un-keep controls (on mouse leave)
				// attatched to controls div
				this._unkeepControls = function() {
//					u.bug("unkeep controls")
					this.player._keep = false;
				}

			}
			// show controls
			else {
				u.as(this.controls, "display", this.controls._default_display);
			}


			// play/pause enabled
			if(this._controls_playpause) {

				// if button does not already exist
				if(!this.controls.playpause) {
			
					// set up playback controls
					this.controls.playpause = u.ae(this.controls, "a", {"class":"playpause"});
					// remember default display state (block, inline-block, inline)
					this.controls.playpause._default_display = u.gcs(this.controls.playpause, "display");
					this.controls.playpause.player = this;

					u.e.click(this.controls.playpause);
					this.controls.playpause.clicked = function(event) {
				//		u.bug("play/pause")
						this.player.togglePlay();
					}
				}
				// it already exists, make it visible
				else {
					u.as(this.controls.playpause, "display", this.controls.playpause._default_display);
				}
			}
			// hide if exists
			else if(this.controls.playpause) {
				u.as(this.controls.playpause, "display", "none");
			}


			// Search (rw/ff)
			if(this._controls_search) {

				// if button does not already exist
				if(!this.controls.search) {
		
					// set up search controls
					this.controls.search_ff = u.ae(this.controls, "a", {"class":"ff"});
					// remember default display state (block, inline-block, inline)
					this.controls.search_ff._default_display = u.gcs(this.controls.search_ff, "display");
					this.controls.search_ff.player = this;

					this.controls.search_rw = u.ae(this.controls, "a", {"class":"rw"});
					// remember default display state (block, inline-block, inline)
					this.controls.search_rw._default_display = u.gcs(this.controls.search_rw, "display");
					this.controls.search_rw.player = this;

					u.e.click(this.controls.search_ff);
					this.controls.search_ff.ffing = function() {
						this.t_ffing = u.t.setTimer(this, this.ffing, 100);
						this.player.ff();
					}
					this.controls.search_ff.inputStarted = function(event) {
						this.ffing();
					}
					this.controls.search_ff.clicked = function(event) {
						u.t.resetTimer(this.t_ffing);
					}

					u.e.click(this.controls.search_rw);
					this.controls.search_rw.rwing = function() {
						this.t_rwing = u.t.setTimer(this, this.rwing, 100);
						this.player.rw();
					}
					this.controls.search_rw.inputStarted = function(event) {
						this.rwing();
					}
					this.controls.search_rw.clicked = function(event) {
						u.t.resetTimer(this.t_rwing);
						this.player.rw();
					}

					this.controls.search = true;

				}
				// it already exists, make it visible
				else {
					u.as(this.controls.search_ff, "display", this.controls.search_ff._default_display);
					u.as(this.controls.search_rw, "display", this.controls.search_rw._default_display);
				}
				
			}
			// hide if exists
			else if(this.controls.search) {
				u.as(this.controls.search_ff, "display", "none");
				u.as(this.controls.search_rw, "display", "none");
			}


			// TODO: zoom
			if(this._controls_zoom && !this.controls.zoom) {}
			else if(this.controls.zoom) {}


			// volume control
			if(this._controls_volume) {
				
				// if button does not already exist
				if(!this.controls.volume) {
			
					// set up volume control
					this.controls.volume = u.ae(this.controls, "a", {"class":"volume"});
					// remember default display state (block, inline-block, inline)
					this.controls.volume._default_display = u.gcs(this.controls.volume, "display");
					this.controls.volume.player = this;

					u.e.click(this.controls.volume);
					this.controls.volume.clicked = function(event) {
						u.bug("volume toggle")
						this.player.toggleVolume();
					}
				}
				// it already exists, make it visible
				else {
					u.as(this.controls.volume, "display", this.controls.volume._default_display);
				}

			}
			// hide if exists
			else if(this.controls.volume) {
				u.as(this.controls.volume, "display", "none");
			}


			// enable controls on mousemove
			if(u.e.event_pref == "mouse") {
				u.e.addEvent(this.controls, "mouseenter", this._keepControls);
				u.e.addEvent(this.controls, "mouseleave", this._unkeepControls);

				u.e.addEvent(this, "mousemove", this.showControls);
			}
			else {
				u.e.addEvent(this, "touchstart", this.showControls);
			}

		}
		else if(this.controls) {
			u.as(this.controls, "display", "none");
		}
	}


	return player;
}
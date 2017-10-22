Util.audioPlayer = function(_options) {


	// designed to work with just one player being moved around

	var player = document.createElement("div");
	u.ac(player, "audioplayer");

	// auto play
	player._autoplay = false;
	player._muted = false;
	player._loop = false;
	player._playsinline = false;



	// native controls default settings
	player._native_controls = false;


	// play/pause button
	player._controls_playpause = false;
	player._controls_play = false;
	player._controls_pause = false;
	player._controls_stop = false;

	// TODO: volume button
	player._controls_volume = false;
	// TODO: rw/ff buttons
	player._controls_search = false;


	// set ff and rw skip-rate
	player._ff_skip = 2;
	player._rw_skip = 2;


	player.audio = u.ie(player, "audio");


	// Does browser have HTML5 support
	if(player.audio && typeof(player.audio.play) == "function") {

		// set up functions for HTML5 player

		// Load audio
		player.load = function(src, _options) {

			// stop audio if playing
			if(u.hc(this, "playing")) {
				this.stop();
			}

			// reset audio safety net (or old video may show before new one loads)
			this.setup(_options);

			// only attempt to load audio if source is available
			if(src) {

				// get correct source for browser
				this.audio.src = this.correctSource(src);

				// load audio
				this.audio.load();

//				this.audio.controls = player._controls;
//				this.audio.autoplay = player._autoplay;
			}
		}

		// Play audio
		player.play = function(position) {
//			console.log(this.audio.currentTime + "; " + position);
			// use position only if stated (position can be 0)
			if(typeof(this.audio.currentTime) == "number" && position !== undefined) {
				this.audio.currentTime = position;
			}

			// has src? then play
			if(this.audio.src) {
				return this.audio.play();
			}
		}

		// Load and play
		player.loadAndPlay = function(src, _options) {

			// default position is 0
			var position = _options.position || 0;

			// load and send player options
			this.load(src, _options);

			// play when ready
			return this.play(position);
		}

		// Pause playback but stay at current position
		player.pause = function() {
			this.audio.pause();
		}

		// Stop playback and reset postion
		player.stop = function() {

			this.audio.pause();

			// reset position
			if(this.audio.currentTime) {
				this.audio.currentTime = 0;
			}
		}

		// Fast forward audio - only if audio is fully loaded
		player.ff = function() {

//			u.bug("player.ff:" + this.video.currentTime);
			if(this.audio.src && this.audio.currentTime && this.audioLoaded) {
				this.audio.currentTime = (this.audio.duration - this.audio.currentTime >= this._ff_skip) ? (this.audio.currentTime + this._ff_skip) : this.audio.duration;
				this.audio._timeupdate();
			}
		}

		// Rewind audio - only if audio is fully loaded
		player.rw = function() {
//			u.bug("player.rw:" + this.video.currentTime);
			if(this.audio.src && this.audio.currentTime && this.audioLoaded) {
				this.audio.currentTime = (this.audio.currentTime >= this._rw_skip) ? (this.audio.currentTime - this._rw_skip) : 0;
				this.audio._timeupdate();
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


		// destroy old player and set up new player from scratch
		player.setup = function(_options) {


			// additional info passed to function as JSON object
			if(typeof(_options) == "object") {
				var _argument;
				for(_argument in _options) {

					switch(_argument) {
						case "autoplay"     : this._autoplay               = _options[_argument]; break;
						case "muted"        : this._muted                  = _options[_argument]; break;
						case "loop"         : this._loop                   = _options[_argument]; break;
						case "playsinline"  : this._playsinline            = _options[_argument]; break;

						case "controls"     : this._native_controls        = _options[_argument]; break;

						case "playpause"    : this._controls_playpause     = _options[_argument]; break;
						case "play"         : this._controls_play          = _options[_argument]; break;
						case "stop"         : this._controls_stop          = _options[_argument]; break;
						case "pause"        : this._controls_pause         = _options[_argument]; break;
						case "volume"       : this._controls_volume        = _options[_argument]; break;
						case "search"       : this._controls_search        = _options[_argument]; break;

						case "ff_skip"      : this._ff_skip                = _options[_argument]; break;
						case "rw_skip"      : this._rw_skip                = _options[_argument]; break;
					}
				}
			}

			// if(!this.audio) {
			// 	var audio = this.removeChild(this.audio);
			// 	delete audio;
			// }

			// add video player again
			if(!this.audio.player) {

				this.audio.player = this;


				// CALLBACK EVENTS

				this.audio._loadstart = function(event) {
	//				u.bug("_loadstart");

					u.ac(this.player, "loading");

					if(typeof(this.player.loading) == "function") {
						this.player.loading(event);
					}
				}
				u.e.addEvent(this.audio, "loadstart", this.audio._loadstart);

				// enough is loaded to play entire audio
				this.audio._canplaythrough = function(event) {
	//				u.bug("_canplaythrough");

					u.rc(this.player, "loading");

					if(typeof(this.player.canplaythrough) == "function") {
						this.player.canplaythrough(event);
					}
				}
				u.e.addEvent(this.audio, "canplaythrough", this.audio._canplaythrough);

				// audio is playing
				this.audio._playing = function(event) {
	//				u.bug("_playing");

					u.rc(this.player, "loading|paused");
					u.ac(this.player, "playing");

					if(typeof(this.player.playing) == "function") {
						this.player.playing(event);
					}
				}
				u.e.addEvent(this.audio, "playing", this.audio._playing);

				// audio is paused
				this.audio._paused = function(event) {
	//				u.bug("_paused");

					u.rc(this.player, "playing|loading");
					u.ac(this.player, "paused");

					if(typeof(this.player.paused) == "function") {
						this.player.paused(event);
					}
				}
				u.e.addEvent(this.audio, "pause", this.audio._paused);

				// audio is stalled
				this.audio._stalled = function(event) {
	//				u.bug("_stalled");

					u.rc(this.player, "playing|paused");
					u.ac(this.player, "loading");

					if(typeof(this.player.stalled) == "function") {
						this.player.stalled(event);
					}
				}
				u.e.addEvent(this.audio, "stalled", this.audio._stalled);

				// audio error
				this.audio._error = function(event) {
					u.bug("_error");

					if(typeof(this.player.error) == "function") {
						this.player.error(event);
					}
				}
				u.e.addEvent(this.audio, "error", this.audio._error);

				// audio has played til its end
				this.audio._ended = function(event) {
	//				u.bug("_ended");

					u.rc(this.player, "playing|paused");

					if(typeof(this.player.ended) == "function") {
						this.player.ended(event);
					}
				}
				u.e.addEvent(this.audio, "ended", this.audio._ended);

				// metadata loaded
				this.audio._loadedmetadata = function(event) {
	//				u.bug("_loadedmetadata:duration:" + this.duration);
	//				u.bug("_loadedmetadata:currentTime:" + this.currentTime);

					this.player.duration = this.duration;
					this.player.currentTime = this.currentTime;
					this.player.metaLoaded = true;

					if(typeof(this.player.loadedmetadata) == "function") {
						this.player.loadedmetadata(event);
					}
				}
				u.e.addEvent(this.audio, "loadedmetadata", this.audio._loadedmetadata);

				// audio loaded
				this.audio._loadeddata = function(event) {
	//				u.bug("_loadeddata:" + this.duration);
	
					this.player.audioLoaded = true;

					if(typeof(this.player.loadeddata) == "function") {
						this.player.loadeddata(event);
					}
				}
				u.e.addEvent(this.audio, "loadeddata", this.audio._loadeddata);

				// timeupdate
				this.audio._timeupdate = function(event) {
	//				u.bug("_timeupdate:" + this.currentTime);
					this.player.currentTime = this.currentTime;

					if(typeof(this.player.timeupdate) == "function") {
						this.player.timeupdate(event);
					}
				}
				u.e.addEvent(this.audio, "timeupdate", this.audio._timeupdate);

			}


			this.audio.autoplay = this._autoplay;
			this.audio.loop = this._loop;

			this.audio.setAttribute("muted", this._muted);;
			this.audio.setAttribute("playsinline", this._playsinline);

			// set up controls (based on JSON settings)
			this.setControls();

			// reset external values
			this.currentTime = 0;
			this.duration = 0;
			this.audioLoaded = false;
			this.metaLoaded = false;

		}



	}
	
	// Flash support
	else if(typeof(u.audioPlayerFallback) == "function") {

		// remove HTML5 element
		player.removeChild(player.audio);
		player = u.audioPlayerFallback(player);

	}

	else {
		player.load = function() {}
		player.play = function() {}
		player.setup = function() {
			console.log("No html5 or fallback support");
		}
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
		src = src.replace(/(.mp3|.ogg|.wav)$/, "");


		// if flash fallback is used, always use mp3
		if(this.flash) {
			return src+".mp3"+param;
		}

		// MP3 support
		if(this.audio.canPlayType("audio/mpeg")) {
			return src+".mp3"+param;
		}

		// OGG support
		else if(this.audio.canPlayType("audio/ogg")) {
			return src+".ogg"+param;
		}

		// fallback to WAV
		else {
			return src+".wav"+param;
		}
	}


	// controls overlay
	player.setControls = function() {

		this._custom_controls = (!this._native_controls && (
			this._controls_playpause ||
			this._controls_play ||
			this._controls_stop ||
			this._controls_pause ||
			this._controls_volume ||
			this._controls_search
		)) || false;

		console.log("this._custom_controls:" + this._custom_controls + ", " + u.nodeId(this, 1));

		// make sure we do not set double event listeners
//		if(this.showControls) {


			// if(u.e.event_pref == "mouse") {
			// 	u.e.removeEvent(this, "mousemove", this.showControls);
			//
			// 	u.e.removeEvent(this.controls, "mouseenter", this._keepControls);
			// 	u.e.removeEvent(this.controls, "mouseleave", this._unkeepControls);
			// }
			// else {
			// 	u.e.removeEvent(this, "touchstart", this.showControls);
			// }
//		}


		// inject controls layer in video player
//		if(this._controls_playpause || this._controls_volume || this._controls_search) {

		this.audio.controls = this._native_controls;

		// When native controls are set, custom controls must be removed
		if((this._native_controls || !this._custom_controls) && this.controls) {
			this.removeChild(this.controls);
			delete this.controls;
		}
		else if(this._custom_controls) {

			if(!this.controls) {

				// player controls
				this.controls = u.ae(this, "div", {"class":"controls"});
				this.controls.player = this;

				// remember default display state (block, inline-block, inline)
//				this.controls._default_display = u.gcs(this.controls, "display");

				// hide controls
				this.controls.out = function() {
//					u.bug("hide controls")

					// if(!this._keep) {
					// 	// reset timer to avoid double actions
					// 	this.t_controls = u.t.resetTimer(this.t_controls);

						u.a.transition(this, "all 0.3s ease-out");
						u.a.setOpacity(this, 0);
//					}
				}

				// show controls
				this.controls.over = function() {
//					u.bug("show controls")

					// // reset timer to keep visible
					// if(this.t_controls) {
					// 	this.t_controls = u.t.resetTimer(this.t_controls);
					// }
					// // fade up
					// else {
						u.a.transition(this, "all 0.5s ease-out");
						u.a.setOpacity(this, 1);
					// }
					//
					// // auto hide after 1 sec of inactivity
					// this.t_controls = u.t.setTimer(this, this.hideControls, 1500);
				}

				u.e.hover(this.controls);

// 				// keep controls (on mouse enter)
// 				// attatched to controls div
// 				this._keepControls = function() {
// //					u.bug("keep controls")
// 					this.player._keep = true;
// 				}
//
// 				// un-keep controls (on mouse leave)
// 				// attatched to controls div
// 				this._unkeepControls = function() {
// //					u.bug("unkeep controls")
// 					this.player._keep = false;
// 				}

			}
			// show controls
			// else {
			// 	u.as(this.controls, "display", this.controls._default_display);
			// }


			// play/pause enabled
			if(this._controls_playpause) {

				// if button does not already exist
				if(!this.controls.playpause) {
			
					// set up playback controls
					this.controls.playpause = u.ae(this.controls, "a", {"class":"playpause"});
					// remember default display state (block, inline-block, inline)
					this.controls.playpause.player = this;

					u.e.click(this.controls.playpause);
					this.controls.playpause.clicked = function(event) {
				//		u.bug("play/pause")
						this.player.togglePlay();
					}
				}

			}
			// hide if exists
			else if(this.controls.playpause) {
				this.controls.playpause.parentNode.removeChild(this.controls.playpause);
				delete this.controls.playpause;
			}

			// play enabled
			if(this._controls_play) {

				// if button does not already exist
				if(!this.controls.play) {
			
					// set up playback controls
					this.controls.play = u.ae(this.controls, "a", {"class":"play"});
					// remember default display state (block, inline-block, inline)
					this.controls.play.player = this;

					u.e.click(this.controls.play);
					this.controls.play.clicked = function(event) {
				//		u.bug("play/pause")
						this.player.togglePlay();
					}
				}

			}
			// hide if exists
			else if(this.controls.play) {
				this.controls.play.parentNode.removeChild(this.controls.play);
				delete this.controls.play;
			}

			// pause enabled
			if(this._controls_pause) {

				// if button does not already exist
				if(!this.controls.pause) {
			
					// set up playback controls
					this.controls.pause = u.ae(this.controls, "a", {"class":"pause"});
					// remember default display state (block, inline-block, inline)
					this.controls.pause.player = this;

					u.e.click(this.controls.pause);
					this.controls.pause.clicked = function(event) {
				//		u.bug("play/pause")
						this.player.togglePlay();
					}
				}

			}
			// hide if exists
			else if(this.controls.pause) {
				this.controls.pause.parentNode.removeChild(this.controls.pause);
				delete this.controls.pause;
			}


			// stop enabled
			if(this._controls_stop) {

				// if button does not already exist
				if(!this.controls.stop) {

					// set up stop controls
					this.controls.stop = u.ae(this.controls, "a", {"class":"stop" });
					// remember default display state (block, inline-block, inline)
					this.controls.stop.player = this;

					u.e.click(this.controls.stop);
					this.controls.stop.clicked = function(event) {
				//		u.bug("stop")
						this.player.stop();
					}
				}
			}
			// hide if exists
			else if(this.controls.stop) {
				this.controls.stop.parentNode.removeChild(this.controls.stop);
				delete this.controls.stop;
			}


			// TODO: update to new standard
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
			else if(this.controls.search) {
				u.as(this.controls.search_ff, "display", "none");
				u.as(this.controls.search_rw, "display", "none");
			}


			// TODO: zoom
			if(this._controls_zoom && !this.controls.zoom) {}
			else if(this.controls.zoom) {}


			// TODO: volume
			if(this._controls_volume && !this.controls.volume) {}
			else if(this.controls.volume) {}


			// // enable controls on mousemove
			// if(u.e.event_pref == "mouse") {
			// 	u.e.addEvent(this.controls, "mouseenter", this._keepControls);
			// 	u.e.addEvent(this.controls, "mouseleave", this._unkeepControls);
			//
			// 	u.e.addEvent(this, "mousemove", this.showControls);
			// }
			// else {
			// 	u.e.addEvent(this, "touchstart", this.showControls);
			// }

		}
		// controls off
		// remove existing control set
// 		else if(this.controls) {
//
// 			this.removeChild(this.controls);
// 			delete this.controls;
//
// //			u.as(this.controls, "display", "none");
//
// 		}
	}


	// create HTML5 audio node
	player.setup(_options);
	// = u.ae(player, "audio");

	return player;

}
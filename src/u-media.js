Util.audioPlayer = function(_options) {
	_options = _options || {};
	_options.type = "audio";
	return u.mediaPlayer(_options);
}

Util.videoPlayer = function(_options) {
	_options = _options || {};
	_options.type = "video";
	return u.mediaPlayer(_options);
}

Util.mediaPlayer = function(_options) {




	var player = document.createElement("div");
	player.type = _options.type || "video";
	u.ac(player, player.type+"player");


	// autoplay
	player._autoplay = false;
	player._muted = false;
	player._loop = false;
	player._playsinline = false;
	player._crossorigin = "anonymous";

	// native controls default settings
	player._controls = false;


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



	// create HTML5 video/audio node
	player.media = u.ae(player, player.type);


	// Does browser support HTML5 media
	if(player.media && typeof(player.media.play) == "function") {

		// set up functions for HTML5 player

		// Load media
		player.load = function(src, _options) {
			u.bug("load media:" + src);


			// stop media if playing
			if(u.hc(this, "playing")) {
				this.stop();
			}

			// reset media safety net (or old media may show before new one loads)
			u.setupMedia(this, _options);

			// only attempt to load media if source is available
			if(src) {
//				u.bug(this.correctSource(src));

				// get correct source for browser
				this.media.src = u.correctMediaSource(this, src);

				// load media
				this.media.load();

			}
		}

		// Play media
		player.play = function(position) {

			// use position only if stated (position can be 0)
			if(this.media.currentTime && position !== undefined) {
				this.media.currentTime = position;
			}

			// has src? then play
			if(this.media.src) {
				return this.media.play();
			}
		}

		// Load and play
		player.loadAndPlay = function(src, _options) {

			// default position is 0
			var position = 0;

			// optional position
			if(typeof(_options) == "object") {
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
			return this.play(position);
		}

		// Pause playback but stay at current position
		player.pause = function() {
			u.bug("pause");
			this.media.pause();
		}

		// Stop playback and reset postion
		player.stop = function() {
			u.bug("stop");
			this.media.pause();

			// reset position
			if(this.media.currentTime) {
				this.media.currentTime = 0;
			}
		}

		// Fast forward media - only if media is fully loaded
		player.ff = function() {

//			u.bug("player.ff:" + this.media.currentTime);
			if(this.media.src && this.media.currentTime && this.mediaLoaded) {
				this.media.currentTime = (this.media.duration - this.media.currentTime >= this._ff_skip) ? (this.media.currentTime + this._ff_skip) : this.media.duration;
				this.media._timeupdate();
			}
		}

		// Rewind media - only if media is fully loaded
		player.rw = function() {
//			u.bug("player.rw:" + this.media.currentTime);
			if(this.media.src && this.media.currentTime && this.mediaLoaded) {
				this.media.currentTime = (this.media.currentTime >= this._rw_skip) ? (this.media.currentTime - this._rw_skip) : 0;
				this.media._timeupdate();
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
			this.media.volume = value;

			if(value === 0) {
				u.ac(this, "muted");
			}
			else {
				u.rc(this, "muted");
			}
		}

		// toggle sound on/off
		player.toggleSound = function() {
			if(this.media.volume) {
				this.media.volume = 0;
				u.ac(this, "muted");
			}
			else {
				this.media.volume = 1;
				u.rc(this, "muted");
			}
		}
		player.mute = function() {
			this.media.muted = true;
		}
		player.unmute = function() {
			this.media.removeAttribute(muted);
		}


		/* FOR EVENT DEBUGGING
		player.media._event = function(event) {
			 u.bug("3", "event:" + event.type);
		}
		u.e.addEvent(this.media, 'progress', 		this.media._event);
		u.e.addEvent(this.media, 'canplay', 		this.media._event);
		u.e.addEvent(this.media, 'canplaythrough', 	this.media._event);
		u.e.addEvent(this.media, 'suspend', 		this.media._event);
		u.e.addEvent(this.media, 'abort', 			this.media._event);
		u.e.addEvent(this.media, 'error', 			this.media._event);
		u.e.addEvent(this.media, 'emptied', 		this.media._event);
		u.e.addEvent(this.media, 'stalled', 		this.media._event);
		u.e.addEvent(this.media, 'loadstart', 		this.media._event);
		u.e.addEvent(this.media, 'loadeddata', 		this.media._event);
		u.e.addEvent(this.media, 'loadedmetadata', 	this.media._event);
		u.e.addEvent(this.media, 'waiting', 		this.media._event);
		u.e.addEvent(this.media, 'playing', 		this.media._event);
		u.e.addEvent(this.media, 'seeking', 		this.media._event);
		u.e.addEvent(this.media, 'seeked', 			this.media._event);
		u.e.addEvent(this.media, 'ended', 			this.media._event);
		u.e.addEvent(this.media, 'durationchange', 	this.media._event);
		u.e.addEvent(this.media, 'timeupdate', 		this.media._event);
		u.e.addEvent(this.media, 'play', 			this.media._event);
		u.e.addEvent(this.media, 'pause', 			this.media._event);
		u.e.addEvent(this.media, 'ratechange', 		this.media._event);
		u.e.addEvent(this.media, 'volumechange', 	this.media._event);
		//vid.webkitEnterFullscreen();
		*/


	}

	// avoid errors
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

	u.setupMedia(player, _options);

	// this will cause callback to ready, when autoplay capabilities has been checked
	u.detectMediaAutoplay(player);


	return player;

}



// set up player (on load or newly created)
u.setupMedia = function(player, _options) {


	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "autoplay"     : player._autoplay               = _options[_argument]; break;
				case "muted"        : player._muted                  = _options[_argument]; break;
				case "loop"         : player._loop                   = _options[_argument]; break;
				case "playsinline"  : player._playsinline            = _options[_argument]; break;

				case "controls"     : player._controls               = _options[_argument]; break;

				case "ff_skip"      : player._ff_skip                = _options[_argument]; break;
				case "rw_skip"      : player._rw_skip                = _options[_argument]; break;
			}
		}
	}


	// update properties on media node
	player.media.autoplay = player._autoplay;
	player.media.loop = player._loop;
	player.media.muted = player._muted;
//	player.media.setAttribute("muted", player._muted);
	player.media.playsinline = player._playsinline;
//	player.media.setAttribute("playsinline", player._playsinline);
//	player.media.setAttribute("webkit-playsinline", player._playsinline);

	player.media.setAttribute("crossorigin", player._crossorigin);


	// set up mediaplayer control UI
	u.setupMediaControls(player, player._controls);


	// reset external values
	player.currentTime = 0;
	player.duration = 0;
	player.mediaLoaded = false;
	player.metaLoaded = false;


	// Apply event handlers, only if player reference doesn't exist
	if(!player.media.player) {

		// set play reference
		player.media.player = player;


		// CALLBACK EVENTS

		// loading has started
		player.media._loadstart = function(event) {
//				u.bug("_loadstart");

			u.ac(this.player, "loading");

			if(typeof(this.player.loading) == "function") {
				this.player.loading(event);
			}
		}
		u.e.addEvent(player.media, "loadstart", player.media._loadstart);

		// enough is loaded to play entire movie
		player.media._canplaythrough = function(event) {
//				u.bug("_canplaythrough");

			u.rc(this.player, "loading");

			if(typeof(this.player.canplaythrough) == "function") {
				this.player.canplaythrough(event);
			}
		}
		u.e.addEvent(player.media, "canplaythrough", player.media._canplaythrough);

		// media is playing
		player.media._playing = function(event) {
			u.bug("_playing");

			u.rc(this.player, "loading|paused");
			u.ac(this.player, "playing");

			if(typeof(this.player.playing) == "function") {
				this.player.playing(event);
			}
		}
		u.e.addEvent(player.media, "playing", player.media._playing);

		// media is paused
		player.media._paused = function(event) {
			u.bug("_paused");

			u.rc(this.player, "playing|loading");
			u.ac(this.player, "paused");

			if(typeof(this.player.paused) == "function") {
				this.player.paused(event);
			}
		}
		u.e.addEvent(player.media, "pause", player.media._paused);

		// media is stalled
		player.media._stalled = function(event) {
//				u.bug("_stalled");

			u.rc(this.player, "playing|paused");
			u.ac(this.player, "loading");

			if(typeof(this.player.stalled) == "function") {
				this.player.stalled(event);
			}
		}
		u.e.addEvent(player.media, "stalled", player.media._paused);

		// media error
		player.media._error = function(event) {
			u.bug("_error");

			if(typeof(this.player.error) == "function") {
				this.player.error(event);
			}
		}
		u.e.addEvent(player.media, "error", player.media._error);

		// media has played til its end
		player.media._ended = function(event) {
//				u.bug("_ended");

			u.rc(this.player, "playing|paused");

			if(typeof(this.player.ended) == "function") {
				this.player.ended(event);
			}
		}
		u.e.addEvent(player.media, "ended", player.media._ended);

		// metadata loaded
		player.media._loadedmetadata = function(event) {
//				u.bug("_loadedmetadata:duration:" + this.duration);
//				u.bug("_loadedmetadata:currentTime:" + this.currentTime);

			this.player.duration = this.duration;
			this.player.currentTime = this.currentTime;
			this.player.metaLoaded = true;

			if(typeof(this.player.loadedmetadata) == "function") {
				this.player.loadedmetadata(event);
			}
		}
		u.e.addEvent(player.media, "loadedmetadata", player.media._loadedmetadata);

		// media loaded
		player.media._loadeddata = function(event) {
//				u.bug("_loadeddata:" + this.duration);

			this.player.mediaLoaded = true;

			if(typeof(this.player.loadeddata) == "function") {
				this.player.loadeddata(event);
			}
		}
		u.e.addEvent(player.media, "loadeddata", player.media._loadeddata);

		// timeupdate
		player.media._timeupdate = function(event) {
//				u.bug("_timeupdate:" + this.currentTime);
			this.player.currentTime = this.currentTime;

			if(typeof(this.player.timeupdate) == "function") {
				this.player.timeupdate(event);
			}
		}
		u.e.addEvent(player.media, "timeupdate", player.media._timeupdate);

	}

}



// find the correct source for the browser
u.correctMediaSource = function(player, src) {

	// remove parameters and add them after format change
	var param = src.match(/\?[^$]+/) ? src.match(/(\?[^$]+)/)[1] : "";
	src = src.replace(/\?[^$]+/, "");

	console.log(player)

	// u.bug("cpt:m4v"+this.media.canPlayType("media/x-m4v"));
	// u.bug("cpt:mp4"+this.media.canPlayType("media/mp4"));
	// u.bug("cpt:webm"+this.media.canPlayType("media/webm"));
	// u.bug("cpt:ogg+"+this.media.canPlayType('media/ogg; codecs="theora"'));
	// u.bug("cpt:ogg+"+this.media.canPlayType('media/ogg'));
	// u.bug("cpt:3gpp"+this.media.canPlayType("media/3gpp"));
	// u.bug("cpt:mov"+this.media.canPlayType("media/quicktime"));


	if(player.type == "video") {

		// remove format extension
		src = src.replace(/(\.m4v|\.mp4|\.webm|\.ogv|\.3gp|\.mov)$/, "");

		// if flash fallback is used, always use mp4
		if(player.flash) {
			return src+".mp4"+param;
		}

		// MP4
		else if(player.media.canPlayType("video/mp4")) {
			return src+".mp4"+param;
		}

		// OGV
		else if(player.media.canPlayType("video/ogg")) {
			return src+".ogv"+param;
		}

		// webm - currently not supported
		//else if(player.media.canPlayType("video/webm")) {
		//	return src+".webm";
		//}

		// 3gp
		else if(player.media.canPlayType("video/3gpp")) {
			return src+".3gp"+param;
		}

		// fallback to oldschool quicktime
		else {
		//else if(player.media.canPlayType("video/quicktime")) {
			return src+".mov"+param;
		}
		
	}
	else {
		
		// remove format extension
		src = src.replace(/(.mp3|.ogg|.wav)$/, "");


		// if flash fallback is used, always use mp3
		if(player.flash) {
			return src+".mp3"+param;
		}

		// MP3 support
		if(player.media.canPlayType("audio/mpeg")) {
			return src+".mp3"+param;
		}

		// OGG support
		else if(player.media.canPlayType("audio/ogg")) {
			return src+".ogg"+param;
		}

		// fallback to WAV
		else {
			return src+".wav"+param;
		}

	}

}


// TODO: Finish control setup
// controls overlay
u.setupMediaControls = function(player, _options) {

	u.bug("u.setupMediaControls");
//	console.log(_options)

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {

				case "playpause"    : player._controls_playpause     = _options[_argument]; break;
				case "play"         : player._controls_play          = _options[_argument]; break;
				case "stop"         : player._controls_stop          = _options[_argument]; break;
				case "pause"        : player._controls_pause         = _options[_argument]; break;
				case "volume"       : player._controls_volume        = _options[_argument]; break;
				case "search"       : player._controls_search        = _options[_argument]; break;

			}
		}
	}

	// if _options, controls are defined
	player._custom_controls = obj(_options) && (
		player._controls_playpause ||
		player._controls_play ||
		player._controls_stop ||
		player._controls_pause ||
		player._controls_volume ||
		player._controls_search
	) || false;

	
//	console.log("player._custom_controls:" + player._custom_controls + ", " + u.nodeId(player, 1));

	if(player._custom_controls || !_options) {
		player.media.removeAttribute("controls");
	}
	else{
		player.media.controls = player._controls;
	}


	// When native controls are set, custom controls must be removed
	if(!player._custom_controls && player.controls) {
		player.removeChild(player.controls);
		delete player.controls;
	}
	else if(player._custom_controls) {

		if(!player.controls) {

			// player controls
			player.controls = u.ae(player, "div", {"class":"controls"});
			player.controls.player = player;

			// hide controls
			player.controls.out = function() {
//				u.bug("hide controls")

				u.a.transition(this, "all 0.3s ease-out");
				u.ass(this, {
					"opacity":0
				});
			}

			// show controls
			player.controls.over = function() {
//				u.bug("show controls")

				u.a.transition(this, "all 0.5s ease-out");
				u.ass(this, {
					"opacity":1
				});
			}

			u.e.hover(player.controls);

		}


		// play/pause enabled
		if(player._controls_playpause) {

			// if button does not already exist
			if(!player.controls.playpause) {
	
				// set up playback controls
				player.controls.playpause = u.ae(player.controls, "a", {"class":"playpause"});
				// remember default display state (block, inline-block, inline)
				player.controls.playpause.player = player;

				u.e.click(player.controls.playpause);
				player.controls.playpause.clicked = function(event) {
			//		u.bug("play/pause")
					this.player.togglePlay();
				}
			}

		}
		// hide if exists
		else if(player.controls.playpause) {
			player.controls.playpause.parentNode.removeChild(player.controls.playpause);
			delete player.controls.playpause;
		}

		// play enabled
		if(player._controls_play) {

			// if button does not already exist
			if(!player.controls.play) {
	
				// set up playback controls
				player.controls.play = u.ae(player.controls, "a", {"class":"play"});
				// remember default display state (block, inline-block, inline)
				player.controls.play.player = player;

				u.e.click(player.controls.play);
				player.controls.play.clicked = function(event) {
			//		u.bug("play/pause")
					this.player.togglePlay();
				}
			}

		}
		// hide if exists
		else if(player.controls.play) {
			player.controls.play.parentNode.removeChild(player.controls.play);
			delete player.controls.play;
		}

		// pause enabled
		if(player._controls_pause) {

			// if button does not already exist
			if(!player.controls.pause) {
	
				// set up playback controls
				player.controls.pause = u.ae(player.controls, "a", {"class":"pause"});
				// remember default display state (block, inline-block, inline)
				player.controls.pause.player = player;

				u.e.click(player.controls.pause);
				player.controls.pause.clicked = function(event) {
			//		u.bug("play/pause")
					this.player.togglePlay();
				}
			}

		}
		// hide if exists
		else if(player.controls.pause) {
			player.controls.pause.parentNode.removeChild(player.controls.pause);
			delete player.controls.pause;
		}


		// stop enabled
		if(player._controls_stop) {

			// if button does not already exist
			if(!player.controls.stop) {

				// set up stop controls
				player.controls.stop = u.ae(player.controls, "a", {"class":"stop" });
				// remember default display state (block, inline-block, inline)
				player.controls.stop.player = player;

				u.e.click(player.controls.stop);
				player.controls.stop.clicked = function(event) {
			//		u.bug("stop")
					this.player.stop();
				}
			}
		}
		// hide if exists
		else if(player.controls.stop) {
			player.controls.stop.parentNode.removeChild(player.controls.stop);
			delete player.controls.stop;
		}


		// TODO: update to new standard
		// Search (rw/ff)
		if(player._controls_search) {

			// if button does not already exist
			if(!player.controls.search) {

				// set up search controls
				player.controls.search_ff = u.ae(player.controls, "a", {"class":"ff"});
				// remember default display state (block, inline-block, inline)
				player.controls.search_ff._default_display = u.gcs(player.controls.search_ff, "display");
				player.controls.search_ff.player = player;

				player.controls.search_rw = u.ae(player.controls, "a", {"class":"rw"});
				// remember default display state (block, inline-block, inline)
				player.controls.search_rw._default_display = u.gcs(player.controls.search_rw, "display");
				player.controls.search_rw.player = player;

				u.e.click(player.controls.search_ff);
				player.controls.search_ff.ffing = function() {
					this.t_ffing = u.t.setTimer(this, this.ffing, 100);
					this.player.ff();
				}
				player.controls.search_ff.inputStarted = function(event) {
					this.ffing();
				}
				player.controls.search_ff.clicked = function(event) {
					u.t.resetTimer(this.t_ffing);
				}

				u.e.click(player.controls.search_rw);
				player.controls.search_rw.rwing = function() {
					this.t_rwing = u.t.setTimer(this, this.rwing, 100);
					this.player.rw();
				}
				player.controls.search_rw.inputStarted = function(event) {
					this.rwing();
				}
				player.controls.search_rw.clicked = function(event) {
					u.t.resetTimer(this.t_rwing);
					this.player.rw();
				}

				player.controls.search = true;

			}
			// it already exists, make it visible
			else {
				u.as(player.controls.search_ff, "display", player.controls.search_ff._default_display);
				u.as(player.controls.search_rw, "display", player.controls.search_rw._default_display);
			}
		
		}
		else if(player.controls.search) {
			u.as(player.controls.search_ff, "display", "none");
			u.as(player.controls.search_rw, "display", "none");
		}


		// TODO: zoom
		if(player._controls_zoom && !player.controls.zoom) {}
		else if(player.controls.zoom) {}


		// TODO: volume
		if(player._controls_volume && !player.controls.volume) {}
		else if(player.controls.volume) {}


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
}


u.detectMediaAutoplay = function(player) {

	if(!u.media_autoplay_detection) {
		u.media_autoplay_detection = [player];

		u.test_autoplay = document.createElement("video");

		// check if test is done and make callback to all queued players
		u.test_autoplay.check = function() {

			if(u.media_can_autoplay !== undefined && u.media_can_autoplay_muted !== undefined) {

				for(var i = 0, player; i < u.media_autoplay_detection.length; i++) {
					player = u.media_autoplay_detection[i];
					player.can_autoplay = u.media_can_autoplay;
					player.can_autoplay_muted = u.media_can_autoplay_muted;

					if(typeof(player.ready) == "function") {
						player.ready();
					}
				}

				u.media_autoplay_detection = true;
				delete u.test_autoplay;

			}

		}

		// autoplay test passed
		u.test_autoplay.playing = function() {
			u.bug("playing");

			u.media_can_autoplay = true;
			u.media_can_autoplay_muted = true;

			this.check();
		}
		// autoplay test failed
		u.test_autoplay.notplaying = function() {
			u.media_can_autoplay = false;

			// switch to muted and try again
			u.test_autoplay.muted = true;
			u.test_autoplay.play().then(
				u.test_autoplay.playing_muted.bind(u.test_autoplay)
			).catch(
				u.test_autoplay.notplaying_muted.bind(u.test_autoplay)
			);

		}
		// autoplay muted test passed
		u.test_autoplay.playing_muted = function() {
			u.bug("playing_muted");
			u.media_can_autoplay_muted = true;

			this.check();
		}
		// autoplay muted test failed
		u.test_autoplay.notplaying_muted = function() {
			u.bug("notplaying_muted");
			u.media_can_autoplay_muted = false;

			this.check();
		}

		// test data
		var mp3 = "data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

		// test properties
		u.test_autoplay.volume = 0.01;
		u.test_autoplay.autoplay = true;
		u.test_autoplay.playsinline = true;
		u.test_autoplay.src = mp3;
		u.test_autoplay.play().then(
			u.test_autoplay.playing.bind(u.test_autoplay)
		).catch(
			u.test_autoplay.notplaying.bind(u.test_autoplay)
		);


	}
	// detection in progress, add player to callback queue
	else if(u.media_can_autoplay_muted !== undefined && u.media_can_autoplay !== undefined) {
		u.media_autoplay_detection.push(player)
	}
	// call back - but break chain of command (let calling function return first)
	else if(typeof(player.ready) == "function") {
		u.t.setTimer(player, "ready", 20);
	}

}

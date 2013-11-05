Util.videoPlayer = function(_options) {

	var player;

	// designed to work with just one player being moved around


	// attach videoplay to node on creation
	// if(node) {
	// 	player = u.ae(node, "div", {"class":"videoplayer"});
	// }
	// // create wrapper and standalone videoplayer node
	// else {
		player = document.createElement("div");
		u.ac(player, "videoplayer");
//	}


	// set ff and rw skip-rate
	// can be overwritten locally
	player.ff_skip = 2;
	player.rw_skip = 2;


	// controls default settings
	// play/pause button
	player._default_playpause = false;

	// TODO: zoom button
	player._default_zoom = false;
	// TODO: volume button
	player._default_volume = false;
	// TODO: rw/ff buttons
	player._default_search = false;


	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var argument;
		for(argument in _options) {

			switch(argument) {
				case "playpause"	: player._default_playpause		= _options[argument]; break;
//				case "zoom"			: player._default_zoom			= _options[argument]; break;
//				case "volume"		: player._default_volume		= _options[argument]; break;
//				case "search"		: player._default_search		= _options[argument]; break;
			}
		}
	}






	// flash fallback (auto detection)
	player.flash = false;

	// test for HTML5 video
	player.video = u.ae(player, "video");


	// HTML5 support
	if(typeof(player.video.play) == "function") {

		// load video
		player.load = function(src, _options) {

			// controller settings
			player._controls_playpause = player._default_playpause;
			player._controls_zoom = player._default_zoom;
			player._controls_volume = player._default_volume;
			player._controls_search = player._default_search;

			// optional controls override
			if(typeof(_options) == "object") {
				var argument;
				for(argument in _options) {

					switch(argument) {
						case "playpause"	: player._controls_playpause	= _options[argument]; break;
		//				case "zoom"			: player._controls_zoom			= _options[argument]; break;
		//				case "volume"		: player._controls_volume		= _options[argument]; break;
		//				case "search"		: player._controls_search		= _options[argument]; break;
					}
				}
			}

			// reset video safety net (or old video may show before new one loads)
			this.setup();

			if(this.className.match("/playing/")) {
				this.stop();
			}
			if(src) {
//				u.bug(this.correctSource(src));
				this.video.src = this.correctSource(src);
				this.video.load();
				this.video.controls = false;
			}
		}

		// Play video
		player.play = function(position) {

			// use position only if stated
			if(this.video.currentTime && position !== undefined) {
				this.video.currentTime = position;
			}

			// has src? then play
			if(this.video.src) {
				this.video.play();
			}
		}

		// load and play
		player.loadAndPlay = function(src, _options) {
			// load src
			var position = 0;

			// optional position
			if(typeof(_options) == "object") {
				var argument;
				for(argument in _options) {

					switch(argument) {
						case "position"		: position		= _options[argument]; break;
					}
				}
			}

			// load and send player options
			this.load(src, _options);

			// firefox does not throw canplaythrough event unless I call play when loading
			// play when ready
			this.play(position);
		}

		player.pause = function() {
			this.video.pause();
		}
		player.stop = function() {
			this.video.pause();
			if(this.video.currentTime) {
				this.video.currentTime = 0;
			}
		}

		player.ff = function() {
//			u.bug("player.ff:" + this.video.currentTime);
			if(this.video.src && this.video.currentTime && this.videoLoaded) {
				this.video.currentTime = (this.video.duration - this.video.currentTime >= this.ff_skip) ? (this.video.currentTime + this.ff_skip) : this.video.duration;
				this.video._timeupdate();
			}
		}
		player.rw = function() {
//			u.bug("player.rw:" + this.video.currentTime);
			if(this.video.src && this.video.currentTime && this.videoLoaded) {
				this.video.currentTime = (this.video.currentTime >= this.rw_skip) ? (this.video.currentTime - this.rw_skip) : 0;
				this.video._timeupdate();
			}
		}
 
		// toggle between play and pause
		player.togglePlay = function() {
			if(this.className.match(/playing/g)) {
				this.pause();
			}
			else {
				this.play();
			}
		}

		player.setup = function() {

			// reset video safety net (or old video may show before new one loads)
			if(u.qs("video", this)) {
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

				if(typeof(this.player.loading) == "function") {
					this.player.loading(event);
				}
			}
			u.e.addEvent(this.video, "loadstart", this._loadstart);

			// enough is loaded to play entire movie
			this.video._canplaythrough = function(event) {
//				u.bug("_canplaythrough");

				u.rc(this.player, "loading");

				if(typeof(this.player.canplaythrough) == "function") {
					this.player.canplaythrough(event);
				}
			}
			u.e.addEvent(this.video, "canplaythrough", this.video._canplaythrough);

			// movie is playing
			this.video._playing = function(event) {
//				u.bug("_playing");

				u.rc(this.player, "loading|paused");
				u.ac(this.player, "playing");

				if(typeof(this.player.playing) == "function") {
					this.player.playing(event);
				}
			}
			u.e.addEvent(this.video, "playing", this.video._playing);

			// movie is paused
			this.video._paused = function(event) {
//				u.bug("_paused");

				u.rc(this.player, "playing|loading");
				u.ac(this.player, "paused");

				if(typeof(this.player.paused) == "function") {
					this.player.paused(event);
				}
			}
			u.e.addEvent(this.video, "pause", this.video._paused);

			// movie is stalled
			this.video._stalled = function(event) {
//				u.bug("_stalled");

				u.rc(this.player, "playing|paused");
				u.ac(this.player, "loading");

				if(typeof(this.player.stalled) == "function") {
					this.player.stalled(event);
				}
			}
			u.e.addEvent(this.video, "stalled", this.video._paused);

			// movie has played til its end
			this.video._ended = function(event) {
//				u.bug("_ended");

				u.rc(this.player, "playing|paused");

				if(typeof(this.player.ended) == "function") {
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

				if(typeof(this.player.loadedmetadata) == "function") {
					this.player.loadedmetadata(event);
				}
			}
			u.e.addEvent(this.video, "loadedmetadata", this.video._loadedmetadata);

			// video loaded
			this.video._loadeddata = function(event) {
//				u.bug("_loadeddata:" + this.duration);
	
				this.player.videoLoaded = true;

				if(typeof(this.player.loadeddata) == "function") {
					this.player.loadeddata(event);
				}
			}
			u.e.addEvent(this.video, "loadeddata", this.video._loadeddata);

			// timeupdate
			this.video._timeupdate = function(event) {
//				u.bug("_timeupdate:" + this.currentTime);
				this.player.currentTime = this.currentTime;

				if(typeof(this.player.timeupdate) == "function") {
					this.player.timeupdate(event);
				}
			}
			u.e.addEvent(this.video, "timeupdate", this.video._timeupdate);
		}



		/*
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
	else if(typeof(u.videoPlayerFallback) == "function") {

		// remove HTML5 element
		player.removeChild(player.video);
		player = u.videoPlayerFallback(player);
	}


	// find the correct source for the browser
	player.correctSource = function(src) {

//		alert(src)
		// remove parameters
		// TODO: make parameter replacement better - keep parameter
		src = src.replace(/\?[^$]+/, "");
		src = src.replace(/\.m4v|\.mp4|\.webm|\.ogv|\.3gp|\.mov/, "");

//		alert(src)

		/*
		u.bug("cpt:m4v"+this.video.canPlayType("video/x-m4v"));
		u.bug("cpt:mp4"+this.video.canPlayType("video/mp4"));
		u.bug("cpt:webm"+this.video.canPlayType("video/webm"));
//		u.bug("cpt:ogg+"+this.video.canPlayType('video/ogg; codecs="theora"'));
		u.bug("cpt:ogg+"+this.video.canPlayType('video/ogg'));
		u.bug("cpt:3gpp"+this.video.canPlayType("video/3gpp"));
		u.bug("cpt:mov"+this.video.canPlayType("video/quicktime"));
		*/

		if(this.flash) {
			return src+".mp4";
		}
		else if(this.video.canPlayType("video/mp4")) {
			return src+".mp4";
		}
		else if(this.video.canPlayType("video/ogg")) {
			return src+".ogv";
		}
		//else if(this.video.canPlayType("video/webm")) {
		//	return src+".webm";
		//}
		else if(this.video.canPlayType("video/3gpp")) {
			return src+".3gp";
		}
		else {
		//else if(this.video.canPlayType("video/quicktime")) {
			return src+".mov";
		}

	}

	player.setControls = function() {

		// make sure we do not set double event listeners
		if(this.showControls) {
			u.e.removeEvent(this, "mousemove", this.showControls);
		}

		// inject controls layer in video player
		if(this._controls_playpause || this._controls_zoom || this._controls_volume || this._controls_search) {

			if(!this.controls) {
				// player controls
				this.controls = u.ae(this, "div", {"class":"controls"});

				// hide controls
				this.hideControls = function() {
					// reset timer to avoid double actions
					this.t_controls = u.t.resetTimer(this.t_controls);

					u.a.transition(this.controls, "all 0.3s ease-out");
					u.a.setOpacity(this.controls, 0);
				}

				// show controls
				this.showControls = function() {
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
			}
			// show controls
			else {
				u.as(this.controls, "display", "block");
			}

			// play/pause enabled
			if(this._controls_playpause) {

				// if button does not already exist
				if(!this.controls.playpause) {
			
					// set up playback controls
					this.controls.playpause = u.ae(this.controls, "a", {"class":"playpause"});
					this.controls.playpause.player = this;

		//			player.controls.playpause = playpause;
					u.e.click(this.controls.playpause);
					this.controls.playpause.clicked = function(event) {
				//		u.bug("play/pause")
						this.player.togglePlay();
					}
				}
				// it already exists, make it visible
				else {
					u.as(this.controls.playpause, "display", "block");
				}
			}
			// hide if exists
			else if(this.controls.playpause) {
				u.as(this.controls.playpause, "display", "none");
			}

			// TODO: zoom
			if(this._controls_zoom && !this.controls.zoom) {}
			else if(this.controls.zoom) {}

			// TODO: volume
			if(this._controls_volume && !this.controls.volume) {}
			else if(this.controls.volume) {}

			// TODO: search (rw/ff)
			if(this._controls_search && !this.controls.search) {}
			else if(this.controls.search) {}


			// enable controls on mousemove
			u.e.addEvent(this, "mousemove", this.showControls);

		}
		else if(this.controls) {
			u.as(this.controls, "display", "none");
		}


	}


	return player;
}
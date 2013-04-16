Util.videoPlayer = function(node) {

	var player;

	// work with just one player
	if(node) {
		player = u.ae(node, "div", {"class":"videoplayer"});
	}
	else {
		player = document.createElement("div");
		u.ac(player, "videoplayer");
	}

	// set ff and rw skip-rate
	// can be overwritten locally
	player.ff_skip = 2;
	player.rw_skip = 2;
	player.flash = false;

	// test for HTML5 video
	player.video = u.ae(player, "video");


	// HTML5 support
	if(typeof(player.video.play) == "function") {

		// load video
		player.load = function(src) {

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
		player.loadAndPlay = function(src, position) {
			// load src
			this.load(src);

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

			// reset external values
			this.currentTime = 0;
			this.duration = 0;
			this.videoLoaded = false;
			this.metaLoaded = false;


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

			// movie has play til its end
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
		src = src.replace(/\.m4v|\.mp4|\.webm|\.ogv|\.3gp|\.mov/, "");

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

	return player;
}
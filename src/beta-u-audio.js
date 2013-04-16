Util.audioPlayer = function(node) {

	var player;

	if(node) {
		player = u.ae(node, "div", {"class":"audioplayer"});
	}
	else {
		player = document.createElement("div");
		u.ac(player, "audioplayer");
	}


	// test for HTML5 audio
	player.audio = u.ae(player, "audio");
	player.audio.controls = false;
//	player.audio.autoplay = false;


	// HTML5 support
	if(typeof(player.audio.play) == "function") {


		player.load = function(src) {
//			u.e.removeEvent(this.video, "canplaythrough", this._canplaythrough);
			if(this.playing) {
				this.stop();
			}

			if(src) {
				this.audio.src = this.correctSource(src);
	//			u.bug(this.audio.src)
				this.audio.load();
			}
		}

		player.play = function(position) {
//			u.bug("audio player:" + this.className + "::" + this.audio.src + "::" + typeof(this.video));

			this.playing = true;
			position = position ? position : 0;
//			if(this.audio.currentTime) {
//				this.audio.currentTime = position;
//			}
//			u.e.addEvent(this.video, "canplaythrough", this._canplaythrough);
			if(this.audio.src) {
				this.audio.play();
			}
		}
		player.loadAndPlay = function(src, position) {
//			u.bug(src);
			this.load(src);
			this.play(position);
		}

		player.pause = function() {
			this.playing = false;
			this.audio.pause();
		}
		player.stop = function() {
			this.pause();
//			if(this.audio.currentTime) {
//				this.audio.currentTime = 0;
//			}
		}


		player._loadstart = function(event) {
			u.removeClass(this.parentNode, "ready")
			u.addClass(this.parentNode, "loading");
		}
		u.e.addEvent(player.audio, "loadstart", player._loadstart);

		player._canplaythrough = function(event) {
//			u.bug("ready")
			u.removeClass(this.parentNode, "loading")
			u.addClass(this.parentNode, "ready");
//			this.play();
		}
		u.e.addEvent(player.audio, "canplaythrough", player._canplaythrough);

		// video loaded
		player._loadeddata = function(event) {
//			u.bug("_loadeddata:" + this.duration);

//			u.bug("_loaded:" + u.nodeId(this) + ":" + this.parentNode);

			this.parentNode.videoLoaded = true;

			if(typeof(this.parentNode.loadeddata) == "function") {
				this.parentNode.loadeddata(event);
			}
		}
		u.e.addEvent(player.audio, "loadeddata", player._loadeddata);

		// movie has play til its end
		player._ended = function(event) {
//			u.bug("_ended");

			u.rc(this, "playing|paused");

			if(typeof(this.parentNode.ended) == "function") {
				this.parentNode.ended(event);
			}
		}
		u.e.addEvent(player.audio, "ended", player._ended);


		player._loadedmetadata = function(event) {
			u.bug("1", "loadedmetadata:duration:" + this.duration);
			u.bug("1", "loadedmetadata:currentTime:" + this.currentTime);
		}
//		u.e.addEvent(player.audio, "loadedmetadata", player._loadedmetadata);


	}
	
	// Flash support
	else if(typeof(u.audioPlayerFallback) == "function") {

		// remove HTML5 element
		player.removeChild(player.video);
		player = u.audioPlayerFallback(player);
	}

	
	else {
		player.load = function() {}
		player.play = function() {}
		player.loadAndPlay = function() {}
		player.pause = function() {}
		player.stop = function() {}
	}

	/*
	// Flash support
	else if (document.all || (navigator.plugins && navigator.mimeTypes["application/x-shockwave-flash"])) {

		// remove HTML5 element
		player.removeChild(player.audio);

		// add flash element
		player.audio = u.flash(e, "media/flash/player.swf");


		// set up Flash API
		player.load = function(src) {
			this.audio.load(src);
		}

		player.play = function(position) {
			// TODO: position

			this.audio.play();
		}

		player.pause = function() {
			this.audio.pause();
		}
	}
	// Other plugin? Create oldschool generic media player plugin
	else {

		alert("no HTML5 or flash")
	}
	*/


	// find the correct source for the browser
	player.correctSource = function(src) {
		src = src.replace(/.mp3|.ogg|.wav/, "");

		if(this.audio.canPlayType("audio/mpeg")) {
			return src+".mp3";
		}
		else if(this.audio.canPlayType("audio/ogg")) {
			return src+".ogg";
		}
		else {
			return src+".wav";
		}
	}


	return player;

}
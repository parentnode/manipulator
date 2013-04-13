Util.videoPlayer = function(node) {

//	var player = u.ae(node, "div", "player");
	var player = document.createElement("div");
	u.ac(player, "player");


	// test for HTML5 video
	player.video = u.ae(player, "video");
	player.video.player = player;




	// HTML5 support
	if(typeof(player.video.play) == "function" && !u.explorer()) {


		player.load = function(src) {
//			u.e.removeEvent(this.video, "canplaythrough", this._canplaythrough);
			if(this.className.match("/playing/")) {
				this.stop();
			}
			if(src) {
//				u.bug(this.correctSource(src));
				this.video.src = this.correctSource(src);
				this.video.load();
//				this.video.controls = "hide";
				this.video.controls = false;
			}
		}
		player.play = function(position) {
//			u.bug("video player:" + this.className + "::" + this.video.src + "::" + typeof(this.audio));

//			this.playing = true;
			position = position == undefined ? false : position;
//			u.bug(this.video.currentTime + "::" + typeof(this.video.currentTime))
//			if(this.video.currentTime) {
//				this.video.currentTime = position;
//			}


			if(this.video.currentTime && position !== false) {
				this.video.currentTime = position;
			}


//			u.e.addEvent(this.video, "canplaythrough", this._canplaythrough);
			if(this.video.src) {
				this.video.play();
			}
		}
		player.loadAndPlay = function(src, position) {
			// TODO: put position into a global var?
			this.load(src);
			// firefox does not throw canplaythrough event unless I call play when loading
			this.play(position);
		}

		player.pause = function() {
//			this.playing = false;
			this.video.pause();
		}
		player.stop = function() {
			this.video.pause();
			if(this.video.currentTime) {
				this.video.currentTime = 0;
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

		player.ff = function() {
			this.video.currentTime += 5;
		}
		player.rw = function() {
			this.video.currentTime -= 5;
		}


		player.video._loadstart = function(event) {
//			u.bug("load");

			u.ac(this.player, "loading");
		}
		u.e.addEvent(player.video, "loadstart", player.video._loadstart);


		// enough is loaded to play entire movie
		player.video._canplaythrough = function(event) {
//			u.bug("ready");

			u.rc(this.player, "loading");
		}
		u.e.addEvent(player.video, "canplaythrough", player.video._canplaythrough);


		// movie is playing
		player.video._playing = function(event) {
//			u.bug("playing");

			u.rc(this.player, "loading");
			u.ac(this.player, "playing");
		}
		u.e.addEvent(player.video, "playing", player.video._playing);


		// movie is paused
		player.video._paused = function(event) {
//			u.bug("paused");

			u.rc(this.player, "playing");
		}
		u.e.addEvent(player.video, "pause", player.video._paused);


		// movie is stalled
		player.video._stalled = function(event) {
//			u.bug("stalled");

			u.rc(this.player, "playing");
			u.ac(this.player, "loading");
		}
		u.e.addEvent(player.video, "stalled", player.video._paused);


		// movie has play til its end
		player.video._ended = function(event) {
//			u.bug("ended");

			u.rc(this.player, "playing");
		}
		u.e.addEvent(player.video, "ended", player.video._ended);


		/*
		player._event = function(event) {
			 u.bug("3", "event:" + event.type);
		}
		player.video.addEventListener('progress', player._event, false);
		player.video.addEventListener('canplay', player._event, false);
		player.video.addEventListener('canplaythrough', player._event, false);
		player.video.addEventListener('suspend', player._event, false);
		player.video.addEventListener('abort', player._event, false);
		player.video.addEventListener('error', player._event, false);
		player.video.addEventListener('emptied', player._event, false);
		player.video.addEventListener('stalled', player._event, false);
		player.video.addEventListener('loadstart', player._event, false);
		player.video.addEventListener('loadeddata', player._event, false);
		player.video.addEventListener('loadedmetadata', player._event, false);
		player.video.addEventListener('waiting', player._event, false);
		player.video.addEventListener('playing', player._event, false);
		player.video.addEventListener('seeking', player._event, false);
		player.video.addEventListener('seeked', player._event, false);
		player.video.addEventListener('ended', player._event, false);
		player.video.addEventListener('durationchange', player._event, false);
		player.video.addEventListener('timeupdate', player._event, false);
		player.video.addEventListener('play', player._event, false);
		player.video.addEventListener('pause', player._event, false);
		player.video.addEventListener('ratechange', player._event, false);
		player.video.addEventListener('volumechange', player._event, false);


		player._loadedmetadata = function(event) {
			u.bug("1", "loadedmetadata:duration:" + this.duration);
			u.bug("1", "loadedmetadata:currentTime:" + this.currentTime);
		}
		//player.video.addEventListener('loadedmetadata', player._loadedmetadata, false);

		player._canplay = function(event) {
			u.bug("1", "canplay:" + this.buffered.end(0));
		}
		//player.video.addEventListener('canplay', player._canplay, false);

		player._timeupdate = function(event) {
			u.bug("2", this.currentTime);
		}
		//player.video.addEventListener('timeupdate', player._timeupdate, false);

		//vid.webkitEnterFullscreen();

		*/

		
	}
	// Flash support
	else if(document.all || (navigator.plugins && navigator.mimeTypes["application/x-shockwave-flash"])) {

		// remove HTML5 element
		player.removeChild(player.video);

		u.bug("id:" + player.id);
		if(!player.id) {
			var id = u.randomString();
			player.id = id;
		}
		player.ready = false;
		// add flash element
		player.video = u.flash(player, "/documentation/media/flash/videoplayer.swf?id="+player.id, false, "100%", "100%");

		u.bug("player.video:" + player.video)
		player.flash = true;


		player.load = function(src) {
			u.bug("load:" + src);
//			u.e.removeEvent(this.video, "canplaythrough", this._canplaythrough);
			if(this.ready) {
				if(this.className.match("/playing/")) {
					this.stop();
				}
				if(src) {
	//				u.bug(this.correctSource(src));

					this.video.loadVideo(this.correctSource(src));
	//				this.video.controls = "hide";
	//				this.video.controls = false;
				}
			}
			else {
				this.queue(this.load, src);
			}

		}
		player.play = function(position) {
			u.bug("play:" + position);
			if(this.ready) {
				this.video.playVideo();
			}
			else {
				this.queue(this.play, position);
			}
		}
		player.loadAndPlay = function(src) {
			u.bug("loadAndPlay:" + src);
			if(this.ready) {
				this.load(src);
				this.play(0);
			}
			else {
				this.queue(this.loadAndPlay, src, "fisk");
			}
		}

		player.pause = function() {
			u.bug("pause");
			if(this.ready) {
				this.video.pauseVideo();
			}
			else {
				this.queue(this.pause);
			}
		}
		player.stop = function() {
			u.bug("stop");
			if(this.ready) {

//				TODO: not implemented in flash
//				this.video.stopVideo();
			}
			else {
				this.queue(this.stop);
			}
		}

		// toggle between play and pause
		player.togglePlay = function() {
			u.bug("togglePlay")
			if(this.ready) {
				if(this.className.match(/playing/g)) {
					this.pause();
				}
				else {
					this.play();
				}
			}
			else {
				this.queue(this.togglePlay);
			}
		}

		player.queue = function(action) {
			if(!this.actionsQueue) {
				this.actionsQueue = new Array();
				this.paramsQueue = new Array();
			}

			this.actionsQueue[this.actionsQueue.length] = action;

			// default no parameters
			var params = false;

			// parameters
			/*
			if(arguments.length > 1) {
				var i, param;
				params = new Array();
				for(i = 1; param = arguments[i]; i++) {
					params[i-1] = param;
				}
			}
			*/
			
			// limit to one param now
			if(arguments.length > 1) {
				params = arguments[1];
			}
			this.paramsQueue[this.paramsQueue.length] = params;

			this.hasQueue = true;
		}

		// callback functions
		u.flashVideoPlayer = new Object();

		// player id is passed to flash and flash uses this id as parameter when calling back to the player

		u.flashVideoPlayer.ready = function(id, check) {
			alert("ready:" + id + ":" + check)
			var player = document.getElementById(id);
			player.ready = true;

			u.bug(player + ":" + player.hasQueue + ":" + player.actionsQueue.length)
			if(player.hasQueue) {
				var i, action;
				for(i = 0; action = player.actionsQueue[i]; i++) {
					player._action = action;
					if(player.paramsQueue[0]) {
						player._action(player.paramsQueue[0]);
					}
					else {
						player._action();
					}

//					u.bug("action:" + action + ":" + player.paramsQueue.toString());
					
				}
			}

		}

		u.flashVideoPlayer.ended = function(id) {
			u.rc(document.getElementById(id), "playing");
//			alert("ended");
		}
		u.flashVideoPlayer.paused = function(id) {
			u.rc(document.getElementById(id), "playing");
//			alert("paused");
		}
		u.flashVideoPlayer.loadstart = function(id) {
			u.ac(document.getElementById(id), "loading");
//			alert("loadstart" + id);
//			document.getElementById(id).pauseVideo();

		}
		u.flashVideoPlayer.playing = function(id) {
			u.rc(document.getElementById(id), "loading");
			u.ac(document.getElementById(id), "playing");
//			alert("playing");
		}
		u.flashVideoPlayer.canplaythrough = function(id) {
			u.rc(document.getElementById(id), "loading");
//			alert("canplaythrough");
		}

	}
	// Other plugin? Create oldschool generic media player plugin
	else {

		alert("no HTML5 or flash")

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

		/*
		if(this.video.canPlayType("video/x-m4v")) {
			return src+".m4v";
		}
		else 
		*/
		if(this.flash) {
			return src+".mp4";
		}
		else
		if(this.video.canPlayType("video/mp4")) {
			return src+".mp4";
		}
		else 

		if(this.video.canPlayType("video/ogg")) {
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

		// default fallback ??






	}




	// player controls
	player.controls = u.ae(player, "div", "controls");

	// set up playback controls
	var playpause = u.ae(player.controls, "a", "playpause");
	playpause.player = player;


	player.controls.playpause = playpause;

	u.e.click(playpause);
	playpause.clicked = function(event) {
		u.bug("click")
		this.player.togglePlay();
	}

	// hide controls
	player.hideControls = function() {
		// reset timer to avoid double actions
		this.t_controls = u.t.resetTimer(this.t_controls);

		u.a.transition(this.controls, "all 0.3s ease-out");
		u.a.setOpacity(this.controls, 0);
	}
	// show controls
	player.showControls = function() {
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
	// enable controls on mousemove
	u.e.addEvent(player, "mousemove", player.showControls);


/*


	e.play = u.ae(e, "div", "play");
	e.play.e = e;
	u.e.click(e.play);
	e.play.clicked = function() {
		this.e.player.play();
	}

	e.stop = u.ae(e, "div", "stop");
	e.stop.e = e;
	u.e.click(e.stop);
	e.stop.clicked = function() {
		this.e.player.pause();
	}

	e.pause = u.ae(e, "div", "pause");
*/

	return player;

}
u.videoPlayerFallback = function(player) {

	if(Util.flashDetection(">=10")) {

		if(!player.id) {
			var id = u.randomString();
			player.id = id;
		}

		player.flash = true;

		player.load = function(src) {
//			u.bug("load:" + src);

			if(!this.ready) {
				this.setup();
			}

			if(this.ready) {
				if(this.className.match("/playing/")) {
					this.stop();
				}
				if(src) {
	//				u.bug(this.correctSource(src));

					this.audio.loadVideo(this.correctSource(src));
				}
			}
			else {
				this.queue(this.load, src);
			}
		}

		player.play = function(position) {
//			u.bug("play:" + position);
			if(this.ready) {
				this.audio.playVideo();
			}
			else {
				this.queue(this.play, position);
			}
		}

		player.loadAndPlay = function(src) {
//			u.bug("loadAndPlay:" + src);
//			if(this.ready) {
				this.load(src);
				this.play(0);
//			}
//			else {
//				this.queue(this.loadAndPlay, src, "fisk");
//			}
		}

		player.pause = function() {
//			u.bug("pause");
			if(this.ready) {
				this.audio.pauseVideo();
			}
			else {
				this.queue(this.pause);
			}
		}
		player.stop = function() {
//			u.bug("stop");
			if(this.ready) {

//				TODO: not implemented in flash
//				this.video.stopVideo();
			}
			else {
				this.queue(this.stop);
			}
		}

		player.ff = function() {
//			u.bug("ff:" + this.video.currentTime);
			if(this.ready) {
//				this.video.ffVideo();
			}
		}
		player.rw = function() {
//			u.bug("rw:" + this.video.currentTime);
			if(this.ready) {
//				this.video.rwVideo();
			}
		}

		// toggle between play and pause
		player.togglePlay = function() {
//			u.bug("togglePlay")
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

		player.setup = function() {

//			u.bug("setup")

			// reset video safety net (or old video may show before new one loads)
			if(u.qs("object", this)) {
				var video = this.removeChild(this.video);
				delete video;
			}

			this.ready = false;
//			this.video = u.flash(this, "/media/flash/videoplayer.swf?id="+this.id, false, "100%", "100%");
			this.video = u.flash(this, (u.flash_video_player ? u.flash_video_player : "/documentation/media/flash/videoplayer.swf") + "?id="+player.id, false, "100%", "100%");

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
//			u.bug("ready:" + id + ":" + check)

			var player = document.getElementById(id);
			player.ready = true;

//			u.bug(player + ":" + player.hasQueue + ":" + player.actionsQueue.length)
			if(player.hasQueue) {
				player.hasQueue = false;

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
				player.actionsQueue = null;

			}

		}

		u.flashVideoPlayer.ended = function(id) {
			u.rc(document.getElementById(id), "playing|paused");
//			alert("ended");
		}
		u.flashVideoPlayer.paused = function(id) {
			u.rc(document.getElementById(id), "playing|loading");
			u.ac(document.getElementById(id), "paused");
//			alert("paused");
		}
		u.flashVideoPlayer.loadstart = function(id) {
			u.ac(document.getElementById(id), "loading");
//			alert("loadstart" + id);
//			document.getElementById(id).pauseVideo();

		}
		u.flashVideoPlayer.playing = function(id) {
			u.rc(document.getElementById(id), "loading|paused");
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
		u.bug("no flash")
		return false;
//		alert("no HTML5 or flash")

	}

	return player;

}


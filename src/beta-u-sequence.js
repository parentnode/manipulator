
u.sequencePlayer = function(node, options) {
	
	var player;

	// work with just one player
	if(node) {
		player = u.ae(node, "div", {"class":"sequenceplayer"});
	}
	else {
		player = document.createElement("div");
		u.ac(player, "sequenceplayer");
	}


	// playback timer
	player.t_playback = false;
	// default framerate (12 fps)
	player._framerate = 12;

	// additional info passed to function as JSON object
	if(typeof(options) == "object") {
		var argument;
		for(argument in options) {

			switch(argument) {
				case "framerate"		: this._framerate			= options[argument]; break;
			}

		}
	}
	else {
		options = {};
	}



	// load sequence of images
	player.load = function(images, options) {
//		u.bug("load sequence:" + images.length)
		
		this._load_callback;
		this._autoplay = false;

		// additional info passed to function as JSON object
		if(typeof(options) == "object") {
			var argument;
			for(argument in options) {

				switch(argument) {
					case "load_callback"		: this._load_callback			= options[argument]; break;
					case "autoplay"				: this._autoplay				= options[argument]; break;
				}

			}
		}


		// setup sequence / clean sequence
		this.setup(images);
	}

	// load sequence and play when loaded
	player.loadAndPlay = function(images, options) {
		
		// set autoplay to true
		if(!options) {
			options = {};
		}
		options.autoplay = true;
		
		// save options for use when loading is done
		this._options = options;

		// load will automatically invoke play
		this.load(images, options);
	}


	// play currently loaded sequence
	player.play = function(options) {

		this._ended_callback = null;
		this._from = this.sequence._start;
		this._to = this.sequence._end;

		// additional info passed to function as JSON object
		if(typeof(options) == "object") {
			var argument;
			for(argument in options) {

				switch(argument) {
					case "ended_callback"	: this._ended_callback			= options[argument]; break;
					case "framerate"		: this._framerate				= options[argument]; break;

					case "to"				: this._to						= options[argument]; break;
					case "from"				: this._from					= options[argument]; break;
				}

			}
		}




		// playback direction
		if(this._from <= this._to) {
			this._direction = 1;
		}
		else {
			this._direction = -1;
		}

//		u.bug("play sequence:" + this._from + " -> " + this._to + "@" + this._framerate + "fps" + " (direction:"+this._direction+")")


		// playback not in initial order
//		if(1 || this._from != this.sequence._start || this._to != this.sequence._end) {
//			u.bug("reorder stack")

			// forward direction
			if(this._direction > 0) {

				// decrease z-index from 4000
				var start_z_index = 4000;

				// loop through entire sequence
				for(i = this.sequence._start; i <= this.sequence._end; i++) {

					// make first two frames visible (for better playback performance)
					if(i == this._from || i == this._from+1) {
						u.as(this._nodes[i], "display", "block", 1);
					}
					else {
						u.as(this._nodes[i], "display", "none", 1);
					}

					// apply decresed z-index
					u.as(this._nodes[i], "zIndex", start_z_index-i, 1);
				}

			}
			// backwards direction
			else {

				// increase z-index from 4000 minus sequence length
				var start_z_index = 4000 - this._nodes.length;

				// loop through entire sequence
				for(i = this.sequence._end; i <= this.sequence._start; i--) {

					// make first two frames visible (for better playback performance)
					if(i == this._from || i == this._from-1) {
						u.as(this._nodes[i], "display", "block", 1);
					}
					else {
						u.as(this._nodes[i], "display", "none", 1);
					}

					// apply increased z-index
					u.as(this._nodes[i], "zIndex", start_z_index+i, 1);
				}
			}
			// for(i = this._from, j = 0; this._direction > 0 ? i <= this._to : i >= this._to; i += this._direction, j++) {
			// }

			// for(i = this.sequence._start, j = this._from; this._direction > 0 ? i <= this._to : i >= this._to; i += this._direction, j++) {
			// 
			// 
			// // hide all but first frame
			// for(i = 0; i <= this.sequence._end; i++) {
			// 
			// 	if(i == this._from) {
			// 		u.as(this._nodes[i], "display", "block", 1);
			// 	}
			// 	else {
			// 		u.as(this._nodes[i], "display", "none", 1);
			// 	}
			// }

			// // keep first two frames visible (for better performance)
			// if(i > 1) {
			// 	u.as(this._nodes[i], "display", "none", 1);
			// }
			// else {
			// 	u.as(this._nodes[i], "display", "block", 1);
			// }


			// set z-index for new order



				// update dom
			this.offsetHeight;



			this._current_frame = this._from;

//		}
		// initial order - reset sequence
		// else {
		// 	
		// }




		this.playback(true);
	}



	// playback loop - continues until sequence is done
	player.playback = function(start) {

		// don't do anything on first loop
		if(!start) {
			// go to next frame
			this.nextFrame(this._current_frame);
			// set current frame
			this._current_frame = this._current_frame + this._direction;
		}

		// end loop and callback
		if(this._to == this._current_frame) {
//			u.bug("end reached:" + typeof(this._ended_callback) + ", " + this.ended + "," + u.nodeId(this))

			if(typeof(this._ended_callback) == "function") {
				this._ended_callback();
			}
			else if(typeof(this.ended) == "function") {
				this.ended();
			}

		}
		// continue loop
		else {
			this.t_playback = u.t.setTimer(this, this.playback, (1000/this._framerate));
		}

	}

	// hides last frame and reveals next frame below (part of playback handling)
	player.nextFrame = function(frame) {
//			u.bug("nextframe:" + frame)

		// prepare stack - after_next is not next frame, but frame after next frame (to be sure stack is always prepared two frame ahead)
		// this is done, because firefox causes blinking animation, if animation is started with delay
		var after_next = (frame + (this._direction*2));
		// make next frame visible
		if(this._nodes[after_next] && (this._direction > 0 ? after_next <= this._to : after_next >= this._to)) {
//			u.bug("show after_next:" + after_next);
			u.as(this._nodes[after_next], "display", "block");
		}

		// hide current frame
		if(this._nodes[frame]) {
//			u.bug("hide current:" + frame);
			u.as(this._nodes[frame], "display", "none");
		}
	}

	// hides last frame and reveals next frame below (part of playback handling)
	player.prevFrame = function(frame) {
//			u.bug("nextframe:" + frame)

		var after_next = (frame + this._direction);
		var prev = (frame - this._direction);

//		u.bug("prev:" + prev);
//		u.bug("after_next:" + after_next);

		// hide current frame
		if(this._nodes[prev]) {
//			u.bug("show prev:" + prev);
			u.as(this._nodes[prev], "display", "block");

				// make next frame visible
			if(this._nodes[after_next] && (this._direction > 0 ? after_next <= this._to : after_next >= this._to)) {
	//			u.bug("show after_next:" + after_next);
				u.as(this._nodes[after_next], "display", "none");
			}

		}
		// reset entire order to fit prev scenario
		else {

			for(i = this._from; i < this._to; i += this._direction) {
				if(i == this._to || i == this._to-this._direction) {
					u.as(this._nodes[i], "display", "block");
				}
				else {
					u.as(this._nodes[i], "display", "none");
				}
			}


		}

	}


	// TODO
	player.next = function(loop) {
//		u.bug("next:" + loop);

		if(!loop || this._current_frame + this._direction <= this._to) {
//			u.bug("more frames:" + this._current_frame)
			this.nextFrame(this._current_frame);
			this._current_frame = this._current_frame + this._direction;

//			u.bug("new current_frame:" + this._current_frame)
		}
		else if(loop) {
//			u.bug("no more frames:" + this._current_frame);

			this.play();
			this.pause();
			this.nextFrame(this._current_frame);
			this._current_frame = this._current_frame + this._direction;
//			u.bug("new current_frame:" + this._current_frame)
		}
	}

	// TODO
	player.prev = function(loop) {
//		u.bug("prev:" + loop);

		if(!loop || this._current_frame - this._direction >= this._from) {
//			u.bug("more frames:" + this._current_frame)

			this.prevFrame(this._current_frame);
			this._current_frame = this._current_frame - this._direction;
//			u.bug("new current_frame:" + this._current_frame)
		}
		else if(loop) {

//			u.bug("no more frames:" + this._current_frame);

			this.prevFrame(this._current_frame);
			this._current_frame = this._to;

//			u.bug("new current_frame:" + this._current_frame)
		}
	}

	player.resume = function() {
		this.t_playback = u.t.setTimer(this, this.playback, (1000/this._framerate));
	}

	// TODO
	player.pause = function() {
		u.t.resetTimer(this.t_playback);
	}
	
	// TODO
	player.stop = function() {
		u.t.resetTimer(this.t_playback);
	}


	// prepare animation for playback
	player.setup = function(images) {

//		u.bug("sequence player setup")

		if(this.sequence) {
			this.removeChild(this.sequence);
		}

		// add sequence node
		this.sequence = u.ie(this, "ul", {"class":"sequence"});
		this.sequence.player = this;


		this._images = images;
		this._nodes = new Array();

		this.sequence._start = 0;
		this.sequence._end = this._images.length-1;
		this._current_frame = 0;


		// after preloading, continue setup
		this._setup = function() {

			// stack images to make playback as light as possible
			for(i = 0; i <= this.sequence._end; i++) {

				this._nodes[i] = u.ae(this.sequence, "li", {"style":"background-image: url(" + this._images[i] + ");"});

				// keep first two frames visible (for better performance)
				u.as(this._nodes[i], "display", "none", 1);
			}

			// update dom
			this.offsetHeight;



			if(typeof(this._load_callback) == "function") {
				this._load_callback();
			}
			// or callback to default (loaded)
			else if(typeof(this.loaded) == "function") {
				this.loaded();
			}


			if(this._autoplay) {
			 	this.play(this._options);
			}

		}


		// preload image sequence
		u.preloader(this, this._images, {"callback":this._setup});

	}

	return player;
}



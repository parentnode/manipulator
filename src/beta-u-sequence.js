
u.sequencePlayer = function(node, _options) {
	
	var player;

	// work with just one player
	if(node) {
		player = u.ae(node, "div", {"class":"sequenceplayer"});
	}
	else {
		player = document.createElement("div");
		u.ac(player, "sequenceplayer");
	}

	player.node = node;

	// playback timer
	player.t_playback = false;
	// default framerate (12 fps)
	player._framerate = 12;
	player._loop = false;
	player._direction = 1;

	player._callback_loaded = "loaded";
	player._callback_ended = "ended";

	var classname = false;


	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "framerate"          : player._framerate         = _options[_argument]; break;
				case "loop"               : player._loop              = _options[_argument]; break;

				case "callback_ended"     : player._callback_ended    = _options[_argument]; break;
				case "callback_loaded"    : player._callback_loaded   = _options[_argument]; break;

				case "direction"          : player._direction         = _options[_argument]; break;

				case "class"              : classname                 = _options[_argument]; break;
			}

		}

	}
	// else {
	// 	_options = {};
	// }

	if(classname) {
		u.ac(player, classname);
	}


	// load sequence of images
	player.load = function(images, _options) {
//		u.bug("load sequence:" + images.length)
		
		this._autoplay = false;

		// // additional info passed to function as JSON object
		// if(obj(_options)) {
		// 	var _argument;
		// 	for(_argument in _options) {
		//
		// 		switch(_argument) {
		// 			case "callback_loaded"     : this._load_callback        = _options[_argument]; break;
		// 			case "autoplay"            : this._autoplay             = _options[_argument]; break;
		// 		}
		//
		// 	}
		// }


		// setup sequence / clean sequence
		this.setup(images);
	}

	// load sequence and play when loaded
	player.loadAndPlay = function(images, _options) {
		
		// // set autoplay to true
		// if(!_options) {
		// 	_options = {};
		// }
		// _options.autoplay = true;
		//
		// // save options for use when loading is done
		// this._options = options;

		this._autoplay = true;

		// load will automatically invoke play
		this.load(images, _options);
	}


	// play currently loaded sequence
	player.play = function(_options) {

		// this._ended_callback = null;
		this._from = this.sequence._start;
		this._to = this.sequence._end;
		
		var _direction = false;

		// additional info passed to function as JSON object
		if(obj(_options)) {
			var argument;
			for(argument in _options) {

				switch(argument) {
					// case "callback_ended"	: this._ended_callback			= _options[argument]; break;
					case "framerate"		: this._framerate				= _options[argument]; break;

					case "direction"		: _direction					= _options[argument]; break;
					case "to"				: this._to						= _options[argument]; break;
					case "from"				: this._from					= _options[argument]; break;
				}

			}
		}


		// playback direction
		if(_direction) {
			this._direction = _direction;
		}
		else if(this._from <= this._to) {
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
					if(i == this._from) {
					// if(i == this._from || i == this._from+1) {
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
					if(i == this._from) {
					// if(i == this._from || i == this._from-1) {
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
		// u.bug("playback", this._current_frame, this._direction, start);

		// don't do anything on first loop
		// if(start !== true) {
			// go to next frame
			this.nextFrame();
			// set current frame
			// this._current_frame = this._current_frame + this._direction;
		// }

		// end loop and callback
		if(!this._loop && this._to == this._current_frame) {
//			u.bug("end reached:" + typeof(this._ended_callback) + ", " + this.ended + "," + u.nodeId(this))

			if(fun(this[this._callback_ended])) {
				this[this._callback_ended]();
			}

		}
		// continue loop
		else {
			this.t_playback = u.t.setTimer(this, this.playback, (1000/this._framerate));
		}

	}

	// hides last frame and reveals next frame below (part of playback handling)
	player.nextFrame = function() {

		// prepare stack - after_next is not next frame, but frame after next frame (to be sure stack is always prepared two frame ahead)
		// this is done, because firefox causes blinking animation, if animation is started with delay
		// var after_next = (frame + (this._direction*2));
		var next_frame = this._current_frame + this._direction;
		if(this._direction > 0) {
			next_frame = (next_frame <= this.sequence._end ? next_frame : this.sequence._start);
		}
		else {
			next_frame = (next_frame >= 0 ? next_frame: this.sequence._end);
		}

		// u.bug("nextframe:" + next_frame);

		// make next frame visible
		// if(this._nodes[next_frame] && (this._direction > 0 ? after_next <= this._to : after_next >= this._to)) {
//			u.bug("show after_next:" + after_next);
			u.as(this._nodes[next_frame], "opacity", 1);
			// u.as(this._nodes[next_frame], "display", "block");
		// }

		// hide current frame
		if(this._nodes[this._current_frame]) {
//			u.bug("hide current:" + frame);
			// u.as(this._nodes[this._current_frame], "display", "none");
			u.as(this._nodes[this._current_frame], "opacity", 0);
		}
		
		this._current_frame = next_frame;
	}

	// TODO: hides last frame and reveals next frame below (part of playback handling)
	player.prevFrame = function(frame) {
//			u.bug("nextframe:" + frame)

		var after_next = (frame + this._direction);
		var prev = (frame - this._direction);

//		u.bug("prev:" + prev);
//		u.bug("after_next:" + after_next);

		// hide current frame
		if(this._nodes[prev]) {
//			u.bug("show prev:" + prev);
			u.as(this._nodes[prev], "opacity", 1);
			// u.as(this._nodes[prev], "display", "block");

				// make next frame visible
			if(this._nodes[after_next] && (this._direction > 0 ? after_next <= this._to : after_next >= this._to)) {
	//			u.bug("show after_next:" + after_next);
				u.as(this._nodes[after_next], "opacity", 0);
				// u.as(this._nodes[after_next], "display", "none");
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

	// step by step method
	player.first = function() {
		// u.bug("first");
//		u.bug("next:" + loop);

		// Hide current frame
		// u.as(this._nodes[this._current_frame], "display", "none");
		u.as(this._nodes[this._current_frame], "opacity", 0);


		// Set first frame as current and show
		this._current_frame = this.sequence._start;
		// u.as(this._nodes[this._current_frame], "display", "block");
		u.as(this._nodes[this._current_frame], "opacity", 1);

	}

	// step by step method
	player.frame = function(index) {
		// u.bug("first");
//		u.bug("next:" + loop);

		// Hide current frame
		// u.as(this._nodes[index], "display", "block");
		u.as(this._nodes[index], "opacity", 1);
		// u.as(this._nodes[this._current_frame], "display", "none");
		u.as(this._nodes[this._current_frame], "opacity", 0);


		// Set first frame as current and show
		this._current_frame = index;

	}

	// step by step method
	player.next = function() {
		// u.bug("next");

		// var next_frame = this._current_frame + this._direction

		if(!this._loop && 
			(
				this._direction > 0 && this._current_frame < this.sequence._end
				||
				this._direction < 0 && this._current_frame > 0
			)
		) {


//			u.bug("more frames:" + this._current_frame)
			this.nextFrame();
			// this._current_frame = this._current_frame + this._direction;

//			u.bug("new current_frame:" + this._current_frame)
		}
		else if(this._loop) {
			// u.bug("loop");
//			u.bug("no more frames:" + this._current_frame);

			// this.play();
			// this.pause();
			this.nextFrame();
			// this._current_frame = this._current_frame + this._direction;
//			u.bug("new current_frame:" + this._current_frame)
		}
	}

	// TODO – step by step method
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
		// this._current_frame = 0;
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
		this._setup = function(queue) {

			// u.bug("images loaded", queue);
			var i;

			// stack images to make playback as light as possible
			for(i = 0; i <= this.sequence._end; i++) {

				this._nodes[i] = u.ae(this.sequence, "li", {"style":"background-image: url(" + this._images[i] + ");"});

				// keep first two frames visible (for better performance)
				// u.as(this._nodes[i], "display", "none", 1);
				u.as(this._nodes[i], "opacity", 0);
			}

			// update dom
			this.offsetHeight;



			if(fun(this[this._callback_loaded])) {
				this[this._callback_loaded]();
			}

			if(this._autoplay) {
			 	// this.play(this._options);
			 	this.play();
			}

		}


		// preload image sequence
		u.preloader(this, this._images, {"loaded":"_setup"});

	}

	return player;
}

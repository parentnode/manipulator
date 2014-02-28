// swipe based slideshow

// starts by fading up first selected_node

// on drag
// next node is decided based on drag direction
// place next node correctly based on current drag coordinates
// drag selected_node and next node at the same time 
// callback to node moved


// on drop - move selected_node and next node at the same time to end state
// callback to scene update

// click
// place next node correctly
// move selected_node and next node at the same time to end state
// callback to scene update (to set )

// returns new slideshow div containing list, injected in lists place in the dom

u.slideshow = function(list, _options) {
	var i, node;



	// add next/prev links
	var slideshow = u.wrapElement(list, "div", {"class":"slideshow"});

	slideshow._selector = "";
	slideshow._layout = "horizontal";
	slideshow._navigation = true;
	slideshow._index = false;

	slideshow._transition = "ease-out";
	slideshow._duration = 0.6; // in seconds

	// default method is incremental (loading next 3 nodes)
	slideshow._loading = "incremental";

	// default callbacks
	slideshow._callback_picked = "picked";
	slideshow._callback_moved = "moved";
	slideshow._callback_dropped = "dropped";


	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var argument;
		for(argument in _options) {

			switch(argument) {
				case "selector"			: slideshow._selector			= _options[argument]; break;
				case "layout"			: slideshow._layout				= _options[argument]; break;

				case "navigation"		: slideshow._navigation			= _options[argument]; break;
				case "index"			: slideshow._index				= _options[argument]; break;

				case "transition"		: slideshow._transition			= _options[argument]; break;
				case "duration"			: slideshow._duration			= _options[argument]; break;

				case "callback_picked"	: slideshow._callback_picked	= settings[argument]; break;
				case "callback_moved"	: slideshow._callback_moved		= settings[argument]; break;
				case "callback_dropped"	: slideshow._callback_dropped	= settings[argument]; break;
			}
		}
	}


	// map list
	slideshow.list = list;
	// set hide timer
//	slideshow.t_loading = false;


//	u.bug("slideshow.size:" + slideshow.offsetWidth + ", " + slideshow.offsetHeight);
	// get calculation values to avoid dom updates
	slideshow._width = slideshow.offsetWidth;
	slideshow._height = slideshow.offsetHeight;

//	slideshow._width = slideshow.list.offsetWidth;

	// create navigation
	if(slideshow._navigation) {

		// slideshow controls
		// next button
		slideshow.bn_next = u.ae(slideshow, "div", {"class":"next"});
		slideshow.bn_next.slideshow = slideshow;
		u.e.click(slideshow.bn_next);
		slideshow.bn_next.clicked = function(event) {
			this.slideshow.selectNode(this.slideshow.selected_node._i+1);
		}

		// prev button
		slideshow.bn_prev = u.ae(slideshow, "div", {"class":"prev"});
		slideshow.bn_prev.slideshow = slideshow;
		u.e.click(slideshow.bn_prev);
		slideshow.bn_prev.clicked = function(event) {
			this.slideshow.selectNode(this.slideshow.selected_node._i-1);
		}

	}

	// TODO: create index
	if(slideshow._navigation) {}



	// add loading class after 1000ms loading time
	slideshow.showLoading = function() {
//		u.bug("loading!!!!")
		u.ac(this, "loading");
	}
	slideshow.loading = function() {
		if(!this.t_loading) {
			this.t_loading = u.t.setTimer(this, this.showLoading, 1000);
		}
	}
	// slideshow is loaded
	slideshow._loaded = function() {
//		u.bug("!!!!loaded")

		u.t.resetTimer(this.t_loading);
		u.rc(this, "loading");

		// callback to loaded
		if(typeof(this.loaded) == "function") {
			this.loaded();
		}
	}


	// set up carousel
	// TODO: make incremental/sequentiel/all load methods
	slideshow.prepare = function() {
//		u.bug("prepare slideshow:" + u.nodeId(this, true))

		// only set up swiping if more than one node in list
		if(this.nodes.length > 1) {

			if(this._layout == "vertical") {
//				u.bug("vertical")

				// set swipe with vertical lock
				u.e.swipe(this, this, {"vertical_lock":true, "callback_picked":"slideshow_picked", "callback_moved":"slideshow_moved", "callback_dropped":"slideshow_dropped"});

				// vertical swipe event callbacks

				// do nothing on sideways swiping
				this.swipedLeft = this.swipedRight = function(event) {
					this.swiped = false;
				}
				// swipedUp is next
				this.swipedUp = function(event) {
//					u.bug("swipedUp:" + this.selected_node._y);
					// only swipe to next if position and swipe-direction says the same
					if(this.selected_node._y < 0) {
						this.selectNode(this.selected_node._i+1);
					}
					else {
						this.swiped = false;
					}
				}
				// swipedDown is prev
				this.swipedDown = function(event) {
//					u.bug("swipedDown:" + this.selected_node._y);
					// only swipe to next if position and swipe-direction says the same
					if(this.selected_node._y > 0) {
						this.selectNode(this.selected_node._i-1);
					}
					else {
						this.swiped = false;
					}
				}

			}
			else {
//				u.bug("horizontal")

				// set swipe with horizontal lock
				u.e.swipe(this, this, {"horizontal_lock":true, "callback_picked":"slideshow_picked", "callback_moved":"slideshow_moved", "callback_dropped":"slideshow_dropped"});

				// horizontal swipe event callbacks

				// do nothing on up and down swipes
				this.swipedDown = this.swipedUp = function(event) {
					this.swiped = false;
				}
				// swipedLeft is next
				this.swipedLeft = function(event) {
//					u.bug("swipedLeft:" + this.selected_node._x);
					// only swipe to next if position and swipe-direction says the same
					if(this.selected_node._x < 0) {
						this.selectNode(this.selected_node._i+1);
					}
					else {
						this.swiped = false;
					}
				}
				// swipedRight is prev
				this.swipedRight = function(event) {
//					u.bug("swipedRight:" + this.selected_node._x);
					// only swipe to next if position and swipe-direction says the same
					if(this.selected_node._x > 0) {
						this.selectNode(this.selected_node._i-1);
					}
					else {
						this.swiped = false;
					}
				}
			}

			// slideshow has been picked
			// TODO: implement callbacks
			// TODO: build optional callbacks into swipe, so picked, moved 
			// and dropped callback names can be used for callback to slideshow
			this.slideshow_picked = function(event) {
//				u.bug("picked slideshow:" + u.nodeId(this, true))

				// get prev and next node
				this.prev_node = this.selected_node._i-1 < 0 ? this.nodes[this.nodes.length-1] : this.nodes[this.selected_node._i-1];
				this.next_node = this.selected_node._i+1 >= this.nodes.length ? this.nodes[0] : this.nodes[this.selected_node._i+1];

				// make new nodes available for resizing/viewing
				this._unclearNode(this.prev_node, "picked prev");
				this._unclearNode(this.next_node, "picked next");

				// this.prev_node._hidden = false;
				// this.next_node._hidden = false;
				// u.as(this.prev_node, "display", "block");
				// u.as(this.next_node, "display", "block");


				// no transitions on drag
				u.a.transition(this.prev_node, "none");
				u.a.transition(this.selected_node, "none");
				u.a.transition(this.next_node, "none");

				// position nodes for drag
				if(this._layout == "vertical") {
	//					u.bug("vertical")

					u.a.translate(this.prev_node, 0, -(this._height));
					u.a.translate(this.next_node, 0, (this._height));
				}
				else {
	//					u.bug("horizontal")

					u.a.translate(this.prev_node, -(this._width), 0);
					u.a.translate(this.next_node, (this._width), 0);
				}


				// notify of drop
				if(typeof(this[this._callback_picked]) == "function") {
					this[this._callback_picked](event);
				}
			}

			// slideshow is dragged
			this.slideshow_moved = function(event) {
	//			u.bug("moved slideshow:" + this.current_x + " x " + this.current_y + ", " + u.nodeId(this, true));

				// only drag the required nodes to maintain full visual effect with least resources
				// prev node in view

				if(this._layout == "vertical") {
	//				u.bug("drag vertical")

					// move previous node
					if(this.current_y > 0) {
	//					u.bug("move prev:")
						u.a.translate(this.prev_node, 0, (this.current_y-this._height));
					}
					// previous is out of view, but not cleared yet, clear 
					else if(this.prev_node._y > -(this._height) && this._prev_node != this._next_node) {
						u.a.translate(this.prev_node, 0, -(this._height));

						this.slideshow._clearNode(this.prev_node, "moved out prev vertical");
					}

					// move selected node
					u.a.translate(this.selected_node, 0, this.current_y);

					// move next node in view
					if(this.current_y < 0) {
						u.a.translate(this.next_node, 0, (this.current_y+this._height));
					}
					// next is out of view, but not cleared yet, clear 
					else if(this.next_node._y < (this._height) && this._prev_node != this._next_node) {
						u.a.translate(this.next_node, 0, (this._height));

						this.slideshow._clearNode(this.next_node, "moved out next vertical");
					}

				}
				else {
	//					u.bug("drag horizontal")

					// move previous node
					if(this.current_x > 0) {
//						u.bug("move prev:")
						u.a.translate(this.prev_node, (this.current_x-this._width), 0);
					}
					// previous is out of view, but not cleared yet, clear 
					else if(this.prev_node._x > -(this._width) && this._prev_node != this._next_node) {

						u.a.translate(this.prev_node, -(this._width), 0);

						this.slideshow._clearNode(this.next_node, "moved out prev horizontal");
					}

					// move selected node
					u.a.translate(this.selected_node, this.current_x, 0);

					// move next node in view
					if(this.current_x < 0) {
						u.a.translate(this.next_node, (this.current_x+this._width), 0);
					}
					// next is out of view, but not cleared yet, clear 
					else if(this.next_node._x < (this._width) && this._prev_node != this._next_node) {

						u.a.translate(this.next_node, (this._width), 0);

						this.slideshow._clearNode(this.next_node, "moved out next horizontal");
					}
				}

				// notify of drop
				if(typeof(this[this._callback_moved]) == "function") {
					this[this._callback_moved](event);
				}
			}

			// slideshow is dropped
			this.slideshow_dropped = function(event) {
//				u.bug("dropped slideshow");

				// no direction on exit (but movement - to be sure it is not just a click) - go back
				// the rest will be handled by the swipeHandlers and selectNode

				if(this._layout == "vertical") {

					if(!this.swiped && this.selected_node._y != 0) {
//						u.bug("dropped without swipe:" + this.swiped + "," + this.selected_node._x);

						// calculate remaining duration
						var duration = this._duration / (this._height / this.current_y);

						// clear prev and next node on transition
						this.selected_node.transitioned = function() {
							u.bug("no swipe cleared (vertical)")
							u.a.transition(this, "none");

							this.slideshow._clearNode(this.slideshow.prev_node, "dropped vert retured prev");
							this.slideshow._clearNode(this.slideshow.next_node, "dropped vert retured next");
						}

						u.a.transition(this.prev_node, "all " + duration + "s " + this._transition);
						u.a.transition(this.selected_node, "all " + duration + "s " + this._transition);
						u.a.transition(this.next_node, "all " + duration + "s " + this._transition);

						u.a.translate(this.prev_node, 0, -(this._height));
						u.a.translate(this.selected_node, 0, 0);
						u.a.translate(this.next_node, 0, (this._height));
					}
				}
				else {

					if(!this.swiped && this.selected_node._x != 0) {
//						u.bug("dropped without swipe:" + this.swiped + "," + this.selected_node._x);

						// clear prev and next node on transition
						this.selected_node.transitioned = function() {
							u.bug("no swipe cleared (horizontal)")
							u.a.transition(this, "none");

							this.slideshow._clearNode(this.slideshow.prev_node, "dropped hor retured prev");
							this.slideshow._clearNode(this.slideshow.next_node, "dropped hor retured next");
						}

						// calculate remaining duration
						var duration = this._duration / (this._width / this.current_x);

						u.a.transition(this.prev_node, "all " + duration + "s " + this._transition);
						u.a.transition(this.selected_node, "all " + duration + "s " + this._transition);
						u.a.transition(this.next_node, "all " + duration + "s " + this._transition);

						u.a.translate(this.prev_node, -(this._width), 0);
						u.a.translate(this.selected_node, 0, 0);
						u.a.translate(this.next_node, (this._width), 0);
					}
				}

				// notify of drop
				if(typeof(this[this._callback_dropped]) == "function") {
					this[this._callback_dropped](event);
				}
			}

		}


		// callback - slideshow is prepared
		if(typeof(this.prepared) == "function") {
			this.prepared();
		}

	}

	// preload slideshow
	// TODO: implement additional load methods
	slideshow.preload = function(start_with) {
//		u.bug("preload slideshow:" + u.nodeId(this, true))

		// start loading process
		this.loading();

		// incremental load (4 nodes - 2 prev + 2 next)

		if(!this.selected_node) {
			if(start_with) {
				start_with = start_with ? start_with : 0;
				if(this.nodes.length > start_with) {
					this._load_base = this.nodes[start_with];
				}
				else {
					this._load_base = this.nodes[0];
				}
			}
			else if(!this._load_base) {
				this._load_base = this.nodes[0];
			}

		}
		else {
			this._load_base = this.selected_node;
		}
//		u.bug("loadbase:" + this._load_base._i)


		if(!u.hc(this._load_base, "ready")) {
			this.loadNode(this._load_base);
			return;
		}

		var next_1 = this.nodes.length > this._load_base._i+1 ? this.nodes[this._load_base._i+1] : this.nodes[0];
		if(next_1 && !u.hc(next_1, "ready")) {
//			u.bug("load next 1:" + next_1._i)
			this.loadNode(next_1);
			return;
		}

		var prev_1 = this._load_base._i > 0 ? this.nodes[this._load_base._i-1] : this.nodes[this.nodes.length-1];
		if(prev_1 && !u.hc(prev_1, "ready")) {
//			u.bug("load prev 1:" + prev_1._i + "," + u.nodeId(prev_1))
			this.loadNode(prev_1);
			return;
		}

		if(next_1) {
			var next_2 = this.nodes.length > next_1._i+1 ? this.nodes[next_1._i+1] : this.nodes[0];
			if(next_2 && !u.hc(next_2, "ready")) {
//				u.bug("load next 2:" + next_2._i)
				this.loadNode(next_2);
				return;
			}
		}

		if(prev_1) {
			var prev_2 = prev_1._i > 0 ? this.nodes[prev_1._i-1] : this.nodes[this.nodes.length-1];
			if(prev_2 && !u.hc(prev_2, "ready")) {
//				u.bug("load prev 2:" + prev_2._i)
				this.loadNode(prev_2);
				return;
			}
		}

		// leave loading state
		this._loaded();

		// preloading is done
		if(typeof(this.preloaded) == "function") {
			this.preloaded();
		}

	}


	// build slideshow nodes
	slideshow.build = function() {
//		u.bug("build slideshow:" + u.nodeId(this, true))

		var i, node;
		// loop through nodes for initial setup
		for(i = 0; node = this.nodes[i]; i++) {
			node.slideshow = this;
			node._i = i;

			// move node out of sight
			u.a.transition(node, "none");
			u.a.translate(node, 0, -node.offsetHeight);

			// load node
			if(typeof(this.buildNode)) {
				// move node out of visual scope

				this.buildNode(node);
			}
			// internal buildNode if new has not been declared
			else {
				this._buildNode(node);
			}

			this._clearNode(node, "initial");
			// initial hide node
			// node._hidden = true;
			// u.as(node, "display", "none");
		}

		// callback when done
		if(typeof(this.built) == "function") {
			this.built();
		}
		// no callback - just start preloading
		else {
			this.preload();
		}
	}

	// internal buildNode function - default action is to load background image with values from item_id and variant
	// load node bg - NOT TESTED
	slideshow._buildNode = function(node) {
//		u.bug("nodeLoad:" + u.nodeId(node, 1));


		// load node background
		if(!node.initialized) {
			node.initialized = true;

			var item_id = u.cv(node, "item_id");
			var variant = u.cv(node, "variant");

			if(item_id) {
				// load bg
				node.loaded = function(queue) {
					u.as(this, "backgroundImage", "url("+queue[0]._image.src+")");

					// default hide all stories, by placing them out of sight
					// make sure they are displayed block, so calculations 
					u.a.transition(this, "none");
					u.a.translate(this, -this.offsetWidth, 0);
					u.as(this, "display", "block");


					u.ac(this, "ready");

					// callback to _ready controller (will monitor if all nodes are ready)
					this.slideshow._ready();
				}
				if(variant) {
					u.preloader(node, ["/images/"+itemd_id+"/"+variant+"/"+this._width+"x.jpg"]);
				}
				else {
					u.preloader(node, ["/images/"+itemd_id+"/"+this._width+"x.jpg"]);
				}

			}
			else {
				u.a.transition(node, "none");
				u.a.translate(node, -node.offsetWidth, 0);
				u.as(node, "display", "block");


				u.ac(node, "ready");

				// callback to _ready controller (will monitor if all nodes are ready)
				this._ready();
			}
		}
		else {
			this._ready();
		}
	}


	// internal clear node
	slideshow._clearNode = function(node, comment) {
//		u.bug("node cleared:" + comment + ", " + u.nodeId(node))
		node._hidden = true;

		// avoid too many displayed divs (will crash iOS)
		u.as(node, "display", "none");

		u.a.transition(node, "none");
	}

	slideshow._unclearNode = function(node, comment) {

//		u.bug("node uncleared:" + comment + ", " + u.nodeId(node))
		node._hidden = false;

		// avoid too many displayed divs (will crash iOS)
		u.as(node, "display", "block");

	}


	// select node
	// makes callback to nodeSelected and nodeEntered
	slideshow.selectNode = function(index, static_update) {
//		u.bug("slideshow.selectNode:" + index + "," + u.nodeId(this.list));
//		u.bug(index + "," + static_update + ", " + this.selected_node + ", " + u.nodeId(this,1));

		// if no selected_node - fresh start, prepare page for initial viewing
		if(!this.selected_node) {
//			u.bug("initial setup")

			// set selected node
			this.selected_node = this.nodes[index];

			this._unclearNode(this.selected_node, "hard start show");

			// this.selected_node._hidden = false;
			// u.as(this.selected_node, "display", "block");


			// position node correctly, ready to fade up
			u.a.transition(this.selected_node, "none");
			u.a.setOpacity(this.selected_node, 0);
			u.a.translate(this.selected_node, 0, 0);

			// CALLBACK
			// node entered
// 			this.selected_node.transitioned = function() {
// 				u.a.transition(this, "none");
// //				u.bug("selected_node entered:" + u.nodeId(this))
// 				if(typeof(this.slideshow.nodeEntered) == "function") {
// 					this.slideshow.nodeEntered(this);
// 				}
// 			}

			// show node 
			u.a.transition(this.selected_node, "none");
			u.a.setOpacity(this.selected_node, 1);
//			this.selected_node.transitioned();
			if(typeof(this.nodeEntered) == "function") {
				this.nodeEntered(this.selected_node);
			}

		}
		// we already have a node shown
		// needs to handle both swipe and click selects, so needs to be able to move correctly from current position
		else {

			// already shown node
			var org_node = this.selected_node;

			// what is exit direction - always 1 (left) or -1 (right)
			this.direction = (index - org_node._i) > 0 ? 1 : -1;

			// correct index
			if(index < 0) {
				index = this.nodes.length-1;
			}
			else if(index >= this.nodes.length) {
				index = 0;
			}

			// set new selected node
			this.selected_node = this.nodes[index];
			this._unclearNode(this.selected_node, "new selected node");

			// u.as(this.selected_node, "display", "block");
			// this.selected_node._hidden = false;

//			u.bug("replace:" + u.nodeId(org_node, true) + " with " + u.nodeId(this.selected_node, true))


			// static update - no transitions 
			// (when doing updates while hidden, IE when slideshow is in fullscreen mode and index in page below needs updating)
			if(static_update) {
				u.a.transition(org_node, "none");
				u.a.transition(this.selected_node, "none");
			}
			// if selection happened by swiping
			else if(this.swiped) {
//				u.bug("swiped")

				// calculate time based on remaining distance
				// adjust for speed, best visual correction

				var duration;

				// vertical layout - use y for calculation
				if(this._layout == "vertical") {

					// adjust for speed
					if(this.current_yps) {
						duration = ((this._height / Math.abs(this.current_yps)) * this._duration);
						duration = duration > this._duration ? this._duration : duration;
					}
					// adjust for time
					else {
						duration = this._duration / (1 - Math.abs(this.current_y / this._height));
					}
					
					
				}
				// horizontal layout - use x for calculation
				else {
					// adjust for speed
					if(this.current_xps) {
						duration = ((this._width / Math.abs(this.current_xps)) * this._duration);
						duration = duration > this._duration ? this._duration : duration;
					}
					// only adjust for time
					else {
						duration = this._duration / (1 - Math.abs(this.current_x / this._width));
					}
				}

				// adjust duration for max and min transition limits
				duration = (duration > 1.5) ? 1.5 : ((duration < 0.2) ? 0.2 : duration);
//				u.bug("duration:" + duration)

				// set calculated duration on existing and selected node
				u.a.transition(org_node, "all " + duration + "s " + this._transition);
				u.a.transition(this.selected_node, "all " + duration + "s " + this._transition);
			}
			// not swiped - button interaction
			else {
//				u.bug("clicked")
				// get selected node ready for entering

				// vertical layout - use height for calculation
				if(this._layout == "vertical") {
					u.a.transition(this.selected_node, "none");
					u.a.translate(this.selected_node, 0, this._height*this.direction);
				}
				// horizontal layout - use width for calculation
				else {
					u.a.transition(this.selected_node, "none");
					u.a.translate(this.selected_node, this._width*this.direction, 0);
				}

				// set selected_node and org_node move transition to default duration
				u.a.transition(org_node, "all " + this._duration + "s " + this._transition);
				u.a.transition(this.selected_node, "all " + this._duration + "s " + this._transition);
			}

			// CALLBACK - only if not static transition
			if(!static_update) {
				// node entered
				this.selected_node.transitioned = function() {
//					u.bug("selected entered")
					u.a.transition(this, "none");
					if(typeof(this.slideshow.nodeEntered) == "function") {
						this.slideshow.nodeEntered(this);
					}
				}
			}

			// enable clearing of org node (only if not = selected_node)
			if(org_node != this.selected_node) {
				org_node.transitioned = function() {
//					u.bug("node cleared:" + u.nodeId(this))

					// clear unused prev/next nodes
					if(this.slideshow.prev_node && this.slideshow.prev_node != this.slideshow.selected_node) {
						this.slideshow._clearNode(slideshow.prev_node, "prev node cleared on regular transistion");
					}
					if(this.slideshow.next_node && this.slideshow.next_node != this.slideshow.selected_node) {
						this.slideshow._clearNode(slideshow.next_node, "prev node cleared on regular transistion");
					}


					// internal clearing (display none, _hidden and remove transition)
					this.slideshow._clearNode(this, "org node cleared");

					if(typeof(this.slideshow.nodeCleared) == "function") {
						this.slideshow.nodeCleared(this);
					}
				}
			}


			// execute transition

			// vertical layout - use height for calculation
			if(this._layout == "vertical") {

				u.a.translate(org_node, 0, -(this._height*this.direction));
				u.a.translate(this.selected_node, 0, 0);
			}
			// horizontal layout - use width for calculation
			else {

				u.a.translate(org_node, -(this._width*this.direction), 0);
				u.a.translate(this.selected_node, 0, 0);
			}

			// make sure node clearing gets callback, but only if not = selected_node
			if(static_update && org_node != this.selected_node) {
				org_node.transitioned();
			}
		}

		// proload from new point
		this.preload();

		// CALLBACK
		// node selected
		if(typeof(this.nodeSelected) == "function") {
			this.nodeSelected(this.selected_node);
		}

	}

	// get slideshow nodes
	slideshow.nodes = u.qsa("li"+slideshow._selector, slideshow.list);
//	u.bug("slideshow.nodes:" + slideshow.nodes.length + ", " + u.nodeId(slideshow, true));


	return slideshow;
}

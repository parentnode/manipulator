u.gridMaster = function(list, _options) {

//	u.bug("new grid master")

	var gm = u.we(list, "div", {"class":"gridmaster"});
	gm.list = list;




	gm.callback_resized = "resized";
	gm.callback_built = "built";
	gm._callback_prepare = "prepareNode";

	gm.render_delay = 100;

	// controls or autoplay+loop only options at this point
	gm.video_controls = false;

	gm.selector = "li.item";

	// default grid
	gm.grid = {
		"nodes":[
			{
				"width"			: 25,
				"proportion"	: 1.6
			}
		]	
	}

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var argument;
		for(argument in _options) {

			switch(argument) {
				case "callback_resized"			: gm.callback_resized			= _options[argument]; break;
				case "callback_built"			: gm.callback_built				= _options[argument]; break;
				case "callback_prepare"			: gm._callback_prepare			= _options[argument]; break;

				case "selector"					: gm.selector					= _options[argument]; break;

				case "grid"						: gm.grid						= _options[argument]; break;

				case "render_delay"				: gm.render_delay				= _options[argument]; break;
				case "video_controls"			: gm.video_controls				= _options[argument]; break;
			}

		}
	}


	// save original html
	gm.org_html = gm.innerHTML;


	gm.prepare = function(grid) {

		// restore to original state
		this.innerHTML = this.org_html;

		// TODO: hardcoded for ul's - it does not have to be
		this.list = u.qs("ul", this)
		this.list.gridmaster = this;

		this.nodes = u.qsa(this.selector, this);

		// new grid for this preparation
		if(grid) {
			this.grid = grid;
		}

//		u.xInObject(this.grid)

		var i, j, k, node, grid_node, static_node;
//		u.bug("grid_nodes:" + this.grid.nodes.length);
//		u.bug("nodes:" + gm.nodes.length);

		// set grid index class
		for(i = 0, j = 0, k = 0; grid_node = this.grid.nodes[i]; i++, k++) {

			if(this.nodes.length > j) {

				node = false;

				// custom node
				// UPDATE: now called inject instead of custom - all nodes now have all callback options
				if(grid_node.inject) {
// 					u.bug("custom grid node")
					static_node = document.createElement(grid_node.inject);


					// insert static node in existing node structure
					// more nodes
					if(this.nodes.length > j+1) {
						node = this.nodes[j].parentNode.insertBefore(static_node, this.nodes[j]);
					}
					// append to the end
					else {
						node = this.nodes[0].parentNode.appendChild(static_node);
					}

				}
				// regular node
				else {
					node = this.nodes[j];
//					u.bug("regular node:" + i + ", " + u.nodeId(node));
					j++;

				}

				// if node exists - add additional info
				if(node) {

					node._prepare = u.eitherOr(grid_node.prepare, this._callback_prepare);

					node._resize = grid_node.resize;
					node._grid_width = grid_node.width/100;
					node._grid_height = grid_node.height/100;
					node._grid_proportion = grid_node.proportion;
//					node._i = k;

					u.ac(node, "i"+(i+1), false);
					u.ac(node, "item", false);

					// grid class
					if(grid_node.class) {
						u.ac(node, grid_node.class);
					}

					node._grid_node = grid_node;

					// // call local preparation 
					// if(typeof(this.prepareNode) == "function") {
					// 	this.prepareNode(node, grid_node);
					// }

					// does ready fuction exist
					if(typeof(this[node._prepare]) == "function") {
						node = this[node._prepare](node);
					}


				}

				// loop grid
//				u.bug(gm.nodes.length + ", " + j + "; " + gm.grid.nodes.length + ", " + i)
				if(this.nodes.length > j && i+1 >= this.grid.nodes.length) {
					i = -1;
				}

			}

		}


	}


	gm.build = function() {
//		u.bug("gridmaster build:" + u.nodeId(this));

		this.render_time = new Date().getTime();
		this.combined_delay = 0;
		this.render_count = 0;

		// update nodes collection
		this.nodes = u.qsa(".item", this);
		var i, node, j;

//		u.bug("nodes:" + this.nodes.length)
		// loop through nodes
		for(i = 0, j = 0; node = this.nodes[i]; i++) {

			// apply filter if it exists
			if(!this.scene.filterPanel || this.scene.filterPanel.filter(node)) {
//			u.bug(u.nodeId(this) + ", " + typeof(this.buildNode))


				// delayed rendering loop
				// can be overwritten by buildNode
				node.delayedRendering = function() {
					// get current time for render delay calculation
					var current_time = new Date().getTime();

					// delay rendering further
//					u.bug(u.nodeId(this) + ", " + (current_time - this.gm.render_time) + "<" +this.gm.render_delay)
					if(current_time - this.gm.render_time < this.gm.render_delay) {
						this.gm.combined_delay += (this.gm.render_delay - (current_time - this.gm.render_time))+5;
	//					u.bug("delayed rendering:" + u.nodeId(this) + ", " + this.gm.combined_delay);
	
						u.t.setTimer(this, this.delayedRendering, this.gm.combined_delay);
	//					u.t.setTimer(this, this.delayedRendering, this.gm.render_delay - (current_time - this.gm.render_time));
					}
					// show node
					else {
//						u.bug("rendering:" + u.nodeId(this))
						this.gm.render_count++;
						// update rendering timestamp
						this.gm.render_time = new Date().getTime();
						this.gm.combined_delay -= this.gm.render_delay;

						// resize node
						this.gm.resized();

						// show
						this.transitioned = function() {
							u.a.transition(this, "none");
						}
						u.a.transition(this, "opacity 0.5s ease-in-out");
				 		u.a.setOpacity(this, 1);

	//					u.bug("renderedNode:" + this.gm.renderedNode);
						if(typeof(this.gm.nodeRendered) == "function") {
							this.gm.nodeRendered(this);
						}
					}
				}
	//			u.bug("build")
				// node index - compensating for hidden nodes
				node._i = j;

				// local build manipulation
				this.buildNode(node);

				// reset grid
				this.resized();

				node.gm = this;


				// does node have video src
				if(node._video_src) {
	//				u.bug("video_src:" + node._video_src)

					node._video = u.videoPlayer();
					u.ae(node._image_mask, node._video);
					node._video.node = node;

					// add controls to video
					if(this.video_controls) {
						node._video.load(node._video_src, {"playpause":true});
					}
					else {
						// auto play and loop on ended
						node._video.ended = function() {
							this.play();
						}
						node._video.loadAndPlay(node._video_src, {"playpause":false});
					}

					node._video.canplaythrough = function() {
	//					u.bug("video canplaythrough")
						// control the rendering
						this.node.delayedRendering();
					}
				}

				// does node have image src
				if(node._image_src) {
	//				u.bug("image_src:" + node._image_src);

					// add image
					node._image = u.ae(node._image_mask, "img");

					node.loaded = function(queue) {
	//					u.bug("loaded:" + u.nodeId(this))
						//u.as(this, "backgroundImage", "url("+queue[0]._image.src+")");
						// set image source, so node is ready for rendering
						this._image.src = queue[0]._image.src;

						// control the rendering
						this.delayedRendering();
					}
					// preload image
					u.preloader(node, [node._image_src]);
				}

		
				else {
	//				u.bug("delayedRendering")
					node.delayedRendering();
				}

				j++;

//			u.bug("done building")
			}
			// node not matching filter - so hide it
			else {
//					u.bug("hide node:" + u.nodeId(node));
				node._hidden = true;
				u.as(node, "display", "none");
			}

		}

	}



	gm.resized = function() {
//		u.bug("gm resized:" + u.nodeId(this))

		var calc_width = this.offsetWidth;
		var calc_height = this.offsetHeight;

//		u.bug(calc_width + ", " + this.offsetWidth +","+ this.list.offsetWidth);
//		u.bug(calc_height + ", " + this.offsetHeight +","+ this.list.offsetHeight);

		// prevent wrapping in Safari when scaling down (for some reason this does not cause same effect when scrolling up - if at some point it does, solve it by resetting list width on each node update)
		// problem not seen in other browsers so far
		u.a.setWidth(this.list, calc_width + 5);
		u.a.setHeight(this.list, calc_height + 5);

		for(i = 0; node = this.nodes[i]; i++) {
//			u.bug("node resize:" + u.nodeId(node));

			
			if(!node._hidden && node._grid_width && node._grid_proportion) {
//	 			u.bug(node._grid_proportion + ", " + node._grid_width + ", " + calc_width);

				// custom resize
				if(node._resize && typeof(this[node._resize]) == "function") {
					this[node._resize](node, calc_width);
				}
				// regular resize
				else {
					u.as(node, "width", Math.ceil(node._grid_width * calc_width) + "px", false);
					if(node._image_mask) {
//						u.bug("set height on image:" + u.nodeId(node))
						u.as(node._image_mask, "height", (Math.floor(node._image_mask.offsetWidth / node._grid_proportion)) + "px", false);
					}
					else {
//						u.bug("set height on node:" + u.nodeId(node))
						u.as(node, "height", (Math.floor(node.offsetWidth / node._grid_proportion)) + "px", false);
					}
				}
			}
			else if(!node._hidden && node._grid_height && node._grid_proportion) {
//	 			u.bug(node._grid_proportion + ", " + node._grid_height + ", " + calc_height);

				// custom resize
				if(node._resize && typeof(this[node._resize]) == "function") {
					this[node._resize](node, calc_height);
				}
				// regular resize
				else {
//					u.bug("::" + Math.ceil(node._grid_height * calc_height))
					u.as(node, "height", Math.ceil(node._grid_height * calc_height) + "px", false);
					if(node._image_mask) {
//						u.bug("set height on image:" + u.nodeId(node))
						u.as(node._image_mask, "width", (Math.floor(node._image_mask.offsetHeight / node._grid_proportion)) + "px", false);
					}
					else {
//						u.bug("set height on node:" + u.nodeId(node))
						u.as(node, "width", (Math.floor(node.offsetHeight / node._grid_proportion)) + "px", false);
					}
				}
			}

		}

		// refresh dom
		this.offsetHeight;

	}

	// gm resize handler
	var key = u.randomString(8);
	u.ac(gm, key);
	eval('window["' + key + '"] = function() {var gm = u.qs(".'+key+'"); if(gm && gm.parentNode) {gm.resized();} else {u.e.removeEvent(document, "resize", window["' + key + '"])}}');
	u.e.addEvent(window, "resize", window[key]);
	

	return gm;
}
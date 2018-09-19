u.gridMaster = function(list, _options) {

//	u.bug("new grid master")

	var gm = u.we(list, "div", {"class":"gridmaster"});
//	gm.list = list;


	// default callbacks

	// callback to prepare node
	gm.callback_node_prepare = "prepareNode";
	// callback to build node
	gm.callback_node_build = "buildNode";
	// callback when node has been rendered
	gm.callback_node_render = "renderNode";
	// callback when node has been rendered
	gm.callback_node_rendered = "nodeRendered";
	// callback to do actual resizing
	gm.callback_node_resize = "resize";


	// callback when grid has been built
	gm.callback_built = "built";
	// callback when grid has been resized
	gm.callback_resized = "resized";


	// min delay for rendering GM nodes
	gm.render_delay = 100;

	// grid has a fixed height - no used  - checking values from grid instead
//	gm.fixed_height = false;

	// grid has a fixed height
	gm.loop_grid = true;

	// controls or autoplay+loop only options at this point
	gm.video_controls = false;

	// grid master node selector
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
	if(obj(_options)) {
		var argument;
		for(argument in _options) {

			switch(argument) {
				case "callback_prepare"			: gm.callback_node_prepare			= _options[argument]; break;
				case "callback_build"			: gm.callback_node_build			= _options[argument]; break;
				case "callback_resize"			: gm.callback_node_resize			= _options[argument]; break;
				case "callback_rendered"		: gm.callback_node_rendered			= _options[argument]; break;

				case "callback_resized"			: gm.callback_resized				= _options[argument]; break;
				case "callback_built"			: gm.callback_built					= _options[argument]; break;

				case "selector"					: gm.selector						= _options[argument]; break;

				case "grid"						: gm.grid							= _options[argument]; break;

//				case "fixed_height"				: gm.fixed_height					= _options[argument]; break;
				case "loop_grid"				: gm.loop_grid						= _options[argument]; break;

				case "render_delay"				: gm.render_delay					= _options[argument]; break;
				case "video_controls"			: gm.video_controls					= _options[argument]; break;
			}

		}
	}


	// save original html
	gm.org_html = gm.innerHTML;


	// prepare grid
	// precalculate and set up HTML
	// this function it thought as being executed at a time when nothing 
	// important is going on, to make to actual build run as fast as possible 
	// (because build is likely be run when a lot of other things are also going on)
	gm.prepare = function(grid) {
//		u.bug("gridmaster prepare:" + u.nodeId(this))

		// restore to original state
		this.innerHTML = this.org_html;

		// TODO: hardcoded for ul's - it does not have to be
		this.list = u.qs("ul", this);
		this.list.gridmaster = this;

		this.nodes = u.qsa(this.selector, this);

		// new grid for this preparation
		if(grid) {
			this.grid = grid;
			// set to null if no base is stated - will use individual node width instead
			this.grid.calc_base = this.grid.calc_base ? this.grid.calc_base/100 : null;
		}

		// is grid height or width based
		this.fixed_height = this.grid.nodes[0].height ? true : false;
//		u.bug("fixed_height:" + this.fixed_height);

//		u.xInObject(this.grid)

//		u.bug("grid_nodes:" + this.grid.nodes.length);
//		u.bug("nodes:" + this.nodes.length + ", " + this.selector);

		var i, j, k, node, grid_node, static_node;
		for(i = 0, j = 0, k = 0; i < this.grid.nodes.length; i++, k++) {
			grid_node = this.grid.nodes[i];

			if(this.nodes.length > j) {

				node = false;

				// custom node
				// UPDATE: now called inject instead of custom - all nodes now have all callback options
				if(grid_node.inject) {
// 					u.bug("custom grid node")
					static_node = document.createElement(grid_node.inject);


					// insert static node in existing node structure
					// more nodes
//					u.bug(this.nodes.length + ":" + j + ", " + grid_node.class)
					if(this.nodes.length > j) {
//						node = this.nodes[0].parentNode.insertBefore(static_node, this.gm_nodes[j]);
						node = this.list.insertBefore(static_node, this.nodes[j]);
					}
					// append to the end
					else {
//						node = this.nodes[0].parentNode.appendChild(static_node);
						node = this.list.appendChild(static_node);
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

					// prefix all gridmaster values with gm_
					node.gm_prepare = u.eitherOr(grid_node.prepare, this.callback_node_prepare);
					node.gm_build = u.eitherOr(grid_node.build, this.callback_node_build);
					node.gm_resize = u.eitherOr(grid_node.resize, this.callback_node_resize);
					node.gm_render = u.eitherOr(grid_node.render, this.callback_node_render);
					node.gm_rendered = u.eitherOr(grid_node.rendered, this.callback_node_rendered);


					node.gm_grid_width = grid_node.width ? grid_node.width/100 : null;
					node.gm_grid_height = grid_node.height ? grid_node.height/100 : null;
					node.gm_grid_proportion = grid_node.proportion;

					// does grid have a calculation base
					node.gm_calc_base = u.eitherOr(this.grid.calc_base, u.eitherOr(node.gm_grid_width, node.gm_grid_height));
					u.bug(node.gm_calc_base + ", " + this.grid.calc_base + ", " + node.gm_grid_width + ", " + node.gm_grid_height);

//					node._i = k;

					// set grid index class
					u.ac(node, "i"+(k+1), false);
//					u.ac(node, "item", false);

					// grid class
					if(grid_node["class"]) {
						u.ac(node, grid_node["class"]);
					}

					// grid can contain any kind of additional settings, so map grid_node to node
					node.gm_grid_node = grid_node;

					// individual prepare node
//					u.bug(typeof(this[node.gm_prepare]) + ", " + node.gm_prepare);

					// does prepare fuction exist
					if(fun(this[node.gm_prepare])) {
						this[node.gm_prepare](node);
					}

					// inject media wrapper, if preparation revealed video or image src
					if((node.gm_video_src || node.gm_image_src) && !node.gm_media_mask) {
						node.gm_media_mask = u.ae(node, "div", {"class":"media"});
					}

				}

				// loop grid if loop_grid is on
//				u.bug(gm.nodes.length + ", " + j + "; " + gm.grid.nodes.length + ", " + i)
				if(this.loop_grid && this.nodes.length > j && i+1 >= this.grid.nodes.length) {
					i = -1;
				}

			}

		}


	}



	// build the node
	// load image/video content and render node
	gm.build = function() {
//		u.bug("gridmaster build:" + u.nodeId(this));

		this.render_time = new Date().getTime();
		this.combined_delay = 0;
		this.render_count = 0;

		// update nodes collection
		this.nodes = u.qsa(this.selector, this.list);

//		u.bug("nodes:" + this.nodes.length)
		// loop through nodes
		var i, node, j;
		for(i = 0, j = 0; i < this.nodes.length; i++) {
			node = this.nodes[i];

//			u.bug(u.nodeId(node) + ", " + typeof(this[node.gm_build]))

			// apply filter if it exists
			// TODO: integrate filter in more elegant way
			if((!this.scene || !this.scene.filterPanel || this.scene.filterPanel.filter(node))) {
// 				u.bug(u.nodeId(this) + ", " + typeof(this[node.gm_build]))


				// default delayed rendering loop
				// can be overwritten by buildNode
				node.renderNode = function() {
					// get current time for render delay calculation
					var current_time = new Date().getTime();

					// delay rendering further
//					u.bug(u.nodeId(this) + ", " + (current_time - this.gm.render_timerender_time) + "<" +this.gm.render_delay)
					if(current_time - this.gm.render_time < this.gm.render_delay) {
						this.gm.combined_delay += (this.gm.render_delay - (current_time - this.gm.render_time))+5;
	//					u.bug("delayed rendering:" + u.nodeId(this) + ", " + this.gm.combined_delay);
	
						u.t.setTimer(this, this.renderNode, this.gm.combined_delay);
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
						if(fun(this.gm[this.gm_rendered])) {
							this.gm[this.gm_rendered](this);
						}
					}
				}

	//			u.bug("build")

				// node index - compensating for hidden nodes
				node.gm_i = j;
//				node.gm_i = j;

				// local build manipulation
				if(fun(this[node.gm_build])) {
					this[node.gm_build](node);
				}

				// reset grid
				this.resized();

				// save reference to Gridmaster on node
				node.gm = this;


				// does node have video src
				if(node.gm_video_src) {
//					u.bug("video_src:" + node.gm_video_src)


					// add video
					node.gm_video = u.videoPlayer();
					u.ae(node.gm_media_mask, node.gm_video);
					node.gm_video.node = node;

//					u.bug("gm_video:" + node.gm_video)
					// if video controls are enabled, check for poster image
					if(this.video_controls) {
//						u.bug("with controls")

						// poster image
						if(node.gm_image_src) {
//							u.bug("image_src:" + node.gm_image_src);

							// add image
							node.gm_image = u.ae(node.gm_media_mask, "img");

							node.loaded = function(queue) {
								this.loaded = null;

			//					u.bug("loaded:" + u.nodeId(this))
								//u.as(this, "backgroundImage", "url("+queue[0]._image.src+")");
								// set image source, so node is ready for rendering
								this.gm_image.src = queue[0]._image.src;

								if(fun(this[this.gm_render])) {
									this[this.gm_render]();
								}
							}
							// preload image
							u.preloader(node, [node.gm_image_src]);

						}
						// load video - but do nothing (waiting for user interaction)
						node.gm_video.load(node.gm_video_src, {"playpause":true});

					}
					// no video controls - video should autoplay and loop
					else {
//						u.bug("no video controls")

						// add video
						// node.gm_video = u.videoPlayer();
						// u.ae(node.gm_media_mask, node.gm_video);
						// node.gm_video.node = node;

						// add controls to video
						// auto play and loop on ended
						node.gm_video.ended = function() {
							this.play();
						}
						node.gm_video.loadAndPlay(node.gm_video_src, {"playpause":false});

						node.gm_video.canplaythrough = function() {
		//					u.bug("video canplaythrough")
							// control the rendering
							if(fun(this.node[this.node.gm_render])) {
								this.node[this.node.gm_render]();
							}
	//						this.node.renderNode();
						}
					}


				}

				// does node have image src
				else if(node.gm_image_src) {
//					u.bug("image_src:" + node.gm_image_src);

					// add image
					node.gm_image = u.ae(node.gm_media_mask, "img");

					node.loaded = function(queue) {
						this.loaded = null;

	//					u.bug("loaded:" + u.nodeId(this))
						// set image source, so node is ready for rendering
						this.gm_image.src = queue[0]._image.src;

						// control the rendering
//						u.bug(typeof(this[this.gm_render]));

						if(fun(this[this.gm_render])) {
							this[this.gm_render]();
						}
//						this.renderNode();
					}
					// preload image
					u.preloader(node, [node.gm_image_src]);
				}

				// no media to load
				else {
	//				u.bug("delayedRendering")
					if(fun(node[node.gm_render])) {
						node[node.gm_render]();
					}

//					node.renderNode();
				}

				// next 
				j++;

//				u.bug("done building")
			}

			// node not matching filter - so hide it
			else {
//				u.bug("hide node if filter and not valid:" + u.nodeId(node));
				node._hidden = true;
				u.as(node, "display", "none");
			}

		}

	}



	gm.resized = function() {
//		u.bug("gm resized:" + u.nodeId(this))

		// prevent wrapping in Safari when scaling down by added 10 extra px in ul width
		//  (for some reason this does not cause same effect when scaling up
		// - if at some point it does, solve it by resetting list width on each node update)

		if(this.list && this.nodes) {



			// fixed height calculation
			if(this.fixed_height) {
				var calc_height = this.offsetHeight;

				// in theory this should never be needed
	//			u.a.setHeight(this.list, calc_height + 10);
			
			}
			// allways adjust width to avoid wrapping
	//		else {

				var calc_width = this.offsetWidth;
//				u.a.setWidth(this.list, calc_width + 10);

				u.as(this.list, "width", calc_width + 10, false);
			
	//		}

	//		u.bug(calc_width + ", " + this.offsetWidth +","+ this.list.offsetWidth);
	//		u.bug(calc_height + ", " + this.offsetHeight +","+ this.list.offsetHeight);


			// resize all visible nodes
			for(i = 0; i < this.nodes.length; i++) {
				node = this.nodes[i];
	//			u.bug("node resize:" + u.nodeId(node));

				// grid is based on width
				if(!node._hidden && node.gm_grid_width && node.gm_grid_proportion) {
	//	 			u.bug(node.gm_grid_proportion + ", " + node.gm_grid_width + ", " + calc_width);

					// custom resize
					if(fun(this[node.gm_resize])) {
						this[node.gm_resize](node, calc_width);
					}

					else {
						u.as(node, "width", Math.ceil(node.gm_calc_base * calc_width) * (node.gm_grid_width/node.gm_calc_base) + "px", false);
						if(node.gm_media_mask) {
	//						u.bug("set height on image:" + u.nodeId(node) + ":" + node.gm_media_mask.offsetWidth +"/"+ node.gm_grid_proportion)
							u.as(node.gm_media_mask, "height", (Math.floor(node.gm_media_mask.offsetWidth / node.gm_grid_proportion)-1) + "px", false);
						}
						else {
	//						u.bug("set height on node:" + u.nodeId(node))
							u.as(node, "height", (Math.floor(node.offsetWidth / node.gm_grid_proportion)) + "px", false);
						}
					}

					// OLD: regular resize
	// 				else {
	// 					u.as(node, "width", Math.ceil(node.gm_grid_width * calc_width) + "px", false);
	// 					if(node.gm_media_mask) {
	// //						u.bug("set height on image:" + u.nodeId(node))
	// 						u.as(node.gm_media_mask, "height", (Math.floor(node.gm_media_mask.offsetWidth / node.gm_grid_proportion)) + "px", false);
	// 					}
	// 					else {
	// //						u.bug("set height on node:" + u.nodeId(node))
	// 						u.as(node, "height", (Math.floor(node.offsetWidth / node.gm_grid_proportion)) + "px", false);
	// 					}
	// 				}
				}
				// grid is based on heights
				else if(!node._hidden && node.gm_grid_height && node.gm_grid_proportion) {
	//	 			u.bug(node.gm_grid_proportion + ", " + node.gm_grid_height + ", " + calc_height);

					// custom resize
					if(fun(this[node.gm_resize])) {
						this[node.gm_resize](node, calc_height);
					}
					// regular resize
					else {
	//					u.bug("Math.ceil(" + node.gm_calc_base +"*"+ calc_height)
	//					u.bug("::" + (Math.ceil(node.gm_calc_base * calc_height) * (node.gm_grid_height/node.gm_calc_base)))
						u.as(node, "height", Math.ceil(node.gm_calc_base * calc_height) * (node.gm_grid_height/node.gm_calc_base) + "px", false);
						if(node.gm_media_mask) {
	//						u.bug("set height on image:" + u.nodeId(node))
							u.as(node.gm_media_mask, "width", (Math.floor(node.gm_media_mask.offsetHeight / node.gm_grid_proportion)) + "px", false);
						}
						else {
	//						u.bug("set height on node:" + u.nodeId(node))
							u.as(node, "width", (Math.floor(node.offsetHeight / node.gm_grid_proportion)) + "px", false);
						}
					}
				}

			}

		}


		// refresh dom
		this.offsetHeight;

	}

	// TODO: Create global resize handler for all gridmasters in page - like textscaler
	// gm resize handler
	var key = u.randomString(8);
	u.ac(gm, key);
	eval('window["' + key + '"] = function() {var gm = u.qs(".'+key+'"); if(gm && gm.parentNode) {gm.resized();} else {u.e.removeEvent(document, "resize", window["' + key + '"])}}');
	u.e.addEvent(window, "resize", window[key]);
	

	return gm;
}
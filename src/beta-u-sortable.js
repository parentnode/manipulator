// Sorts li-nodes within a ul

Util.Sort = u.s = new function() {

	this.sortable = function(list) {


		var i, j, node;

		// get all possible targets
		// TODO: needs to be extended to handle nested draggable list and drag between multiple lists
		// INFO: map possible targets by classname
		//       - mulitple lists would be enabled by setting sort on wrapping div
		//       - nested list would be separated by different classnames

		var target_class = u.cv(list, "targets");
		if(!target_class) {
			list.sortable_nodes = u.qsa("li", list);
		}
		else {
			list.sortable_nodes = u.qsa("."+target_class, list);
		}

		// what type of list do we have - floated indicates horizontal list
		if(list.sortable_nodes.length) {
			
			// TODO
			// if list is higher and wider than its content - mixed list ?
			// if list is higher than its content - vertical list
			// if list is wider than its content - horizontal list
			list.list_type = list.offsetWidth < list.sortable_nodes[0].offsetWidth*2 ? "vertical" : "horizontal";
		}

//		u.bug(e.list_type + ":" + u.gcs(e.nodes[0], "float"));

		// set up targets
		for(i = 0; node = list.sortable_nodes[i]; i++) {

			// remember wrapper
			node.list = list;

			// uniquely identify element as target
			node.dragme = true;


			// get relative offset coords for ul
//			node.rel_ox = u.relOffsetX(node);
//			node.rel_oy = u.relOffsetY(node);
			node.rel_ox = u.absX(node) - u.relX(node);
			node.rel_oy = u.absY(node) - u.relY(node);
//			u.bug(u.nodeId(node) + ":node.rel_ox = " + node.rel_ox + ", node.rel_oy = " + node.rel_oy)


			// check for drag handle
			node.drag = u.qs(".drag", node);
			// if no drag area, use entire node
			if(!node.drag) {
				node.drag = node;
			}


			// reference node from drag handle
			node.drag.node = node;
			// cross-reference all drag children, so every event.target knows node
			var drag_children = u.qsa("*", node.drag);
			if(drag_children) {
				for(j = 0; child = drag_children[j]; j++) {
					child.node = node;
				}
			}

			// set start drag event handler
			u.e.addStartEvent(node.drag , this._pick);
		}


		// TODO 
		// window scroller
		// based on document body event
		// list._scrollWindowY = function() {
		// 	window.scrollBy(0, this.scroll_speed);
		// 	this.t_scroller = u.t.setTimer(this, this._scrollWindowY, 150);
		// }
		
	}


	// node picked
	this._pick = function(event) {

//		u.bug("pick:" + u.nodeId(this));

		// only pick if sorting is not disabled
		if(!this._sorting_disabled) {

			u.e.kill(event);

	//		u.bug("pick:" + this.node + ":" + this.node.className)

			// don't pick unless last element was correctly dropped
			if(!this.node.list.dragged) {

				// dragging has begun
				var node = this.node.list.dragged = this.node;

				// dragged element start settings
				node.start_opacity = u.gcs(node, "opacity");
				node.start_position = u.gcs(node, "position");
				node.start_width = u.gcs(node, "opacity");
				node.start_height = u.gcs(node, "position");

				// drag target - create node based on dragged node
				if(!node.list.tN) {
					node.list.tN = document.createElement(node.nodeName);
				}
				u.sc(node.list.tN, "target " + node.className);
				u.as(node.list.tN, "height", u.actualHeight(node)+"px");
				u.as(node.list.tN, "width", u.actualWidth(node)+"px");
				u.as(node.list.tN, "opacity", node.start_opacity - 0.5);
				node.list.tN.innerHTML = node.innerHTML;


				// set fixed dragged element width and lower opacity
				u.as(node, "width", u.actualWidth(node) + "px");
				u.as(node, "opacity", node.start_opacity - 0.3);

				// set fixed list width and height to avoid shapeshifting when inserting and removing nodes
				u.as(node.list, "width", u.actualWidth(node.list) + "px");
				u.as(node.list, "height", u.actualHeight(node.list) + "px");

				// dragged element mouse offsets
				node.mouse_ox = u.eventX(event) - u.absX(node);
				node.mouse_oy = u.eventY(event) - u.absY(node);
	//			u.bug("mx:" + u.eventX(event) + "-" + u.absX(node));
	//			u.bug("my:" + u.eventY(event) + "-" + u.absY(node));


				// when everything is set up, position absolute to start dragging node
				u.as(node, "position", "absolute");


				// set drag and end events on body, to make sure events are captured even when away from list
				u.e.addMoveEvent(document.body , u.s._drag);
				u.e.addEndEvent(document.body , u.s._drop);
	//			u.e.addEvent(document.body, "mousemove", u.s._drag);
	//			u.e.addEvent(document.body, "mouseup", u.s._drop);

				// remember current drag scope
				document.body.list = node.list;


				// position dragged element
				u.as(node, "left", (u.eventX(event) - node.rel_ox) - node.mouse_ox+"px");
				u.as(node, "top", (u.eventY(event) - node.rel_oy) - node.mouse_oy+"px");
				u.ac(node, "dragged");
	//			u.bug("("+u.eventX(event) + "-" + node.rel_ox + ") -" + node.mouse_ox+"px")

				// and insert target
				node.list.insertBefore(node.list.tN, node);
			
				// notify picked
				if(typeof(node.list.picked) == "function") {
					node.list.picked(event);
				}
			}
		}

	}


	// drag element
	// event handling on document.body
	this._drag = function(event) {
//		u.bug("drag:" + u.nodeId(event.target))
		var i, node;


		u.e.kill(event);
	//	out("kill timer:" + u.t_scroller);
		// reset scroller


		// if(this.list.t_scroller) {
		// 	u.t.resetTimer(this.list.t_scroller);
		// 	this.list.scroll_speed = 0;
		// }


		// only execute drag if dragged flag is set
		if(this.list.dragged) {


			// pre-calculate vars for better performance
			var d_left = u.eventX(event) - this.list.dragged.mouse_ox;
			var d_top = u.eventY(event) - this.list.dragged.mouse_oy;
//			var d_left = (u.eventX(event) - this.list.dragged.rel_ox) - this.list.dragged.mouse_ox;
//			var d_top = (u.eventY(event) - this.list.dragged.rel_oy) - this.list.dragged.mouse_oy;
//			u.bug("d:" + d_left + "x" + d_top)


			// TODO - scrolling - some wrong offset

			// element is being dragged out of viewable area (top)
			if(u.scrollY() >= d_top && 0) {

				// is page scrollable?
				if(u.browserH() < u.htmlH()) {

					// set dragged element properties
					u.as(this.list.dragged, "position", "fixed");
					u.as(this.list.dragged, "left", d_left - this.list.dragged.rel_ox+"px");
					u.as(this.list.dragged, "top", 0);
					u.as(this.list.dragged, "bottom", "auto");

					// scroll as much as possible
					this.list.scroll_speed = Math.round((d_top - u.scrollY()));
					this.list._scrollWindowY();

				}
			}

			// element is being dragged out of viewable area (bottom)
			else if(u.browserH() + u.scrollY() < d_top + this.list.dragged.offsetHeight && 0) {

				// is page scrollable?
				if(u.browserH() < u.htmlH()) {

					// set dragged element properties
					u.as(this.list.dragged, "position", "fixed");
					u.as(this.list.dragged, "left", d_left - this.list.dragged.rel_ox+"px");
					u.as(this.list.dragged, "top", "auto");
					u.as(this.list.dragged, "bottom", 0);

					// scroll as much as possible
					this.list.scroll_speed = -(Math.round((u.browserH() + u.scrollY() - d_top - this.list.dragged.offsetHeight)));
					this.list._scrollWindowY();
				}
			}


			// regular move if everything is within scope
			else {

				// calculate center coordinate of dragged element
				var d_center_x = d_left + (this.list.dragged.offsetWidth/2);
				var d_center_y = d_top + (this.list.dragged.offsetHeight/2);
//				u.bug("d ("+u.nodeId(this.e.dragged)+") center:" + d_center_x+ "("+d_left + "+" + this.e.dragged.offsetWidth+"/2)" + "x" + d_center_y + "("+d_top + "+"+this.e.dragged.offsetHeight+"/2)")


				// set dragged element properties
				u.as(this.list.dragged, "position", "absolute");
				u.as(this.list.dragged, "left", d_left - this.list.dragged.rel_ox+"px");
				u.as(this.list.dragged, "top", d_top - this.list.dragged.rel_oy+"px");
				u.as(this.list.dragged, "bottom", "auto");


				// check for overlap
				for(i = 0; node = this.list.sortable_nodes[i]; i++) {

					// do not check current node or target node for overlap
					if(node != this.list.dragged && node != this.list.tN) {


						// vertical list
						if(this.list.list_type == "vertical") {
//							u.bug("vertical list")

							// pre-calculate vars for better performance
							var o_top = u.absY(node);
							var o_height = node.offsetHeight; // + parseInt(u.gcs(li, "margin-top")) + parseInt(u.gcs(li, "margin-bottom"));
//							u.bug("test node:" + o_top + ":" + o_height + ":" + d_center_y)

							// overlap with element
						 	if(o_top < d_center_y && (o_top + o_height) > d_center_y) {

								// top half
								if(o_top < d_center_y && o_top + (o_height/2) > d_center_y) {
									this.list.insertBefore(this.list.tN, node);
								}
								// bottom half
								else {
									// look for next element
									var next = u.ns(node);
									if(next) {
										// insert before next element
										this.list.insertBefore(this.list.tN, next);
									}
									else {
										// append to the end of the list
										this.list.appendChild(this.list.tN);
									}
								}
								// end loop on overlap
								break;
							}
						}

		// put detaction and injection in separate function as rutine is the same for vert and horizontal


						// horizontal list
						else {
//							u.bug("horizontal list")
							var o_left = u.absX(node);
							var o_top = u.absY(node);
							var o_width = node.offsetWidth;
							var o_height = node.offsetHeight;

							// overlap with element
						 	if(o_left < d_center_x && (o_left + o_width) > d_center_x && o_top < d_center_y && (o_top + o_height) > d_center_y) {
								// left half
								if(o_left < d_center_x && o_left + (o_width/2) > d_center_x) {
									this.list.insertBefore(this.list.tN, node);
								}
								// right half
								else {
									// look for next element
									var next = u.ns(node);
									if(next) {
										// insert before next element
										this.list.insertBefore(this.list.tN, next);
									}
									else {
										// append to the end of the list
										this.list.appendChild(this.list.tN);
									}
								}
								break;
							}
						}
					}
				}

			}



		}

		// notify dragged
		if(typeof(this.list.moved) == "function") {
			this.list.moved(event);
		}
		
	}

	// element is dropped
	// event handling on document.body
	this._drop = function(event) {
		u.e.kill(event);



		// remove events handlers
//		u.e.removeOnMove(document.body , this._drag);
//		u.e.removeOnEnd(document.body , this._drop);
//		u.e.removeEvent(document.body, "mousemove", u.s._drag);
//		u.e.removeEvent(document.body, "mouseup", u.s._drop);

//		u.e.removeEvent(document.body, u.e.event_pref == "touch" ? "touchmove" : "mousemove", u.s._drag);
//		u.e.removeEvent(document.body, u.e.event_pref == "touch" ? "touchend" : "mouseup", u.s._drop);

//		u.e.removeMoveEvent(document.body , this._drag);
//		u.e.removeEndEvent(document.body , this._drop);
		u.e.removeMoveEvent(document.body , u.s._drag);
		u.e.removeEndEvent(document.body , u.s._drop);


		// replace target with dragged element
		this.list.tN = this.list.replaceChild(this.list.dragged, this.list.tN);

		// reset dragged element
		u.as(this.list.dragged, "position", this.list.dragged.start_position);
		u.as(this.list.dragged, "opacity", this.list.dragged.start_opacity);
		u.as(this.list.dragged, "left", "");
		u.as(this.list.dragged, "top", "");
		u.as(this.list.dragged, "bottom", "");
		u.as(this.list.dragged, "width", "");

		// reset list
//		u.as(this.list, "width", this.list.dragged.start_width);
//		u.as(this.list, "height", this.list.dragged.start_height);
		u.as(this.list, "width", "");
		u.as(this.list, "height", "");


		// reset dragged reference
		u.rc(this.list.dragged, "dragged");
		this.list.dragged = false;

		// stop scroller
		// u.t.resetTimer(this.list.t_scroller);
		// this.list.scroll_speed = 0;

		// update nodes list
		var target_class = u.getIJ(this.list, "targets");
		if(!target_class) {
			this.list.sortable_nodes = u.qsa("li", this.list);
		}
		else {
			this.list.sortable_nodes = u.qsa("."+target_class, this.list);
		}

		// notify dropped
		if(typeof(this.list.dropped) == "function") {
			this.list.dropped(event);
		}

	}

}



// Sorts li-nodes within a ul



// ATTEMPTING TO BIULD BETTER MODEL


u.sortable = function(scope, options) {

	u.bug("u.sortable init: " + u.nodeId(scope))

	scope.callback_picked = "picked";
	scope.callback_moved = "moved";
	scope.callback_dropped = "dropped";

	scope.draggables;	// class on draggable nodes
	scope.targets;	// target nodes which can received drops

//	var sources;

	scope.layout;
	scope.allow_nesting = false;

	// additional info passed to function as JSON object
	if(typeof(options) == "object") {
		var argument;
		for(argument in options) {

			switch(argument) {
				case "picked"				: scope.callback_picked		= options[argument]; break;
				case "moved"				: scope.callback_moved		= options[argument]; break;
				case "dropped"				: scope.callback_dropped	= options[argument]; break;

				case "draggables"			: scope.draggables			= options[argument]; break;
				case "targets"				: scope.targets				= options[argument]; break;

//				case "sources"				: sources					= options[argument]; break;

				case "layout"				: scope.layout				= options[argument]; break;

				case "allow_nesting"		: scope.allow_nesting		= options[argument]; break;
			}

		}
	}





	// node picked - attached to draggable node (could be drag element inside draggable)
	scope._sortablepick = function(event) {

//		u.bug("pick:" + u.nodeId(this) + "; "+ u.nodeId(this.d_node) + ";" + u.nodeId(this.d_node.scope));

		// only pick if sorting is not disabled
		if(!this.d_node.scope._sorting_disabled) {


			u.e.kill(event);


			// don't pick unless last element was correctly dropped
			if(!this.d_node.scope._dragged) {

				// dragging has begun - redirect from drag event to actual draggable element
				// this just makes sure we get the right node regardless of which node catches the first event
				var d_node = this.d_node.scope._dragged = this.d_node;


				// dragged element start settings
				d_node.start_opacity = u.gcs(d_node, "opacity");
				d_node.start_position = u.gcs(d_node, "position");
				d_node.start_width = u.gcs(d_node, "width");
				d_node.start_height = u.gcs(d_node, "height");

				// drag target - create node based on dragged node
				if(!d_node.scope.tN) {
					d_node.scope.tN = document.createElement(d_node.nodeName);
				}

				u.sc(d_node.scope.tN, "target " + d_node.className);
				u.as(d_node.scope.tN, "height", u.actualHeight(d_node)+"px");
				u.as(d_node.scope.tN, "width", u.actualWidth(d_node)+"px");
				u.as(d_node.scope.tN, "opacity", d_node.start_opacity - 0.5);

				// replicate current content in target node
				d_node.scope.tN.innerHTML = d_node.innerHTML;

	
				// set fixed dragged element width and lower opacity
				u.as(d_node, "width", u.actualWidth(d_node) + "px");
				u.as(d_node, "opacity", d_node.start_opacity - 0.3);


				// dragged element mouse offsets
				d_node.mouse_ox = u.eventX(event) - u.absX(d_node);
				d_node.mouse_oy = u.eventY(event) - u.absY(d_node);


				// when everything is set up, position absolute to start dragging node
				u.as(d_node, "position", "absolute");
				u.as(d_node, "left", (u.eventX(event) - d_node.rel_ox) - d_node.mouse_ox+"px");
				u.as(d_node, "top", (u.eventY(event) - d_node.rel_oy) - d_node.mouse_oy+"px");
				u.ac(d_node, "dragged");


				// set drag and end events on body, to make sure events are captured even when away from list
				d_node._event_move_id = u.e.addWindowMoveEvent(d_node, d_node.scope._sortabledrag);
				d_node._event_end_id = u.e.addWindowEndEvent(d_node, d_node.scope._sortabledrop);
				// and insert target
				d_node.parentNode.insertBefore(d_node.scope.tN, d_node);


				// notify picked
				if(typeof(d_node.scope[d_node.scope.callback_picked]) == "function") {
					d_node.scope[d_node.scope.callback_picked](event);
				}
			}
		}

	}

	// drag element
	// event handling on document.body
	// this = dragged node (scope._dragged)
	scope._sortabledrag = function(event) {

//		u.bug("drag:" + u.nodeId(event.target) + ", " + u.nodeId(this))


		u.e.kill(event);

		var i, node;

		var event_x = u.eventX(event);
		var event_y = u.eventY(event);

		// if(this.list.t_scroller) {
		// 	u.t.resetTimer(this.list.t_scroller);
		// 	this.list.scroll_speed = 0;
		// }

//		u.bug(c_node + ", " + c_node.scope)

		// only execute drag if dragged flag is set
		if(this.scope._dragged == this) {


			// pre-calculate vars for better performance
			this.d_left = event_x - this.mouse_ox;
			this.d_top = event_y - this.mouse_oy;


			// TODO - scrolling - some wrong offset

			// element is being dragged out of viewable area (top)
			// if(u.scrollY() >= d_top && 0) {
			//
			// 	// is page scrollable?
			// 	if(u.browserH() < u.htmlH()) {
			//
			// 		// set dragged element properties
			// 		u.as(this.scope.dragged, "position", "fixed");
			// 		u.as(this.scope.dragged, "left", d_left - this.list.dragged.rel_ox+"px");
			// 		u.as(this.scope.dragged, "top", 0);
			// 		u.as(this.scope.dragged, "bottom", "auto");
			//
			// 		// scroll as much as possible
			// 		this.scope.scroll_speed = Math.round((d_top - u.scrollY()));
			// 		this.scope._scrollWindowY();
			//
			// 	}
			// }
			//
			// // element is being dragged out of viewable area (bottom)
			// else if(u.browserH() + u.scrollY() < d_top + this.scope.dragged.offsetHeight && 0) {
			//
			// 	// is page scrollable?
			// 	if(u.browserH() < u.htmlH()) {
			//
			// 		// set dragged element properties
			// 		u.as(this.scope.dragged, "position", "fixed");
			// 		u.as(this.scope.dragged, "left", d_left - this.scope.dragged.rel_ox+"px");
			// 		u.as(this.scope.dragged, "top", "auto");
			// 		u.as(this.scope.dragged, "bottom", 0);
			//
			// 		// scroll as much as possible
			// 		this.scope.scroll_speed = -(Math.round((u.browserH() + u.scrollY() - d_top - this.scope.dragged.offsetHeight)));
			// 		this.scope._scrollWindowY();
			// 	}
			// }
			//
			//
			// // regular move if everything is within scope
			// else {

				u.as(this, "position", "absolute");
				u.as(this, "left", this.d_left - this.rel_ox+"px");
				u.as(this, "top", this.d_top - this.rel_oy+"px");
				u.as(this, "bottom", "auto");


				this.scope.detectAndInject(event_x, event_y);

//			}



		}

		// notify dragged
		if(typeof(this.scope[this.scope.callback_moved]) == "function") {
			this.scope[this.scope.callback_moved](event);
		}
		
	}

	// element is dropped
	// event handling on document.body
	// this = dragged node (scope._dragged)
	scope._sortabledrop = function(event) {

		// u.bug("event.target: " + u.nodeId(event.target, true));
		// u.bug("event.target.d_node: " + u.nodeId(event.target.d_node));
		// u.bug("this: " + u.nodeId(this));
		// u.bug("this.d_node: " + u.nodeId(this.d_node));

		u.e.kill(event);


		// remove events handlers
		u.e.removeWindowMoveEvent(this, this._event_move_id);
		u.e.removeWindowEndEvent(this, this._event_end_id);


		// replace target with dragged element
		this.scope.tN = this.scope.tN.parentNode.replaceChild(this, this.scope.tN);

		// reset dragged element
		u.as(this, "position", this.start_position);
		u.as(this, "opacity", this.start_opacity);
		u.as(this, "left", "");
		u.as(this, "top", "");
		u.as(this, "bottom", "");
		u.as(this, "width", "");

		// reset list
		u.as(this.scope, "width", "");
		u.as(this.scope, "height", "");



		// stop scroller
		// u.t.resetTimer(this.list.t_scroller);
		// this.list.scroll_speed = 0;

		// update nodes list
		if(!this.scope.draggables) {
			this.scope.draggable_nodes = u.qsa("li", this.scope);
		}
		else {
			this.scope.draggable_nodes = u.qsa("."+this.scope.draggables, this.scope);
		}

		// notify dropped
		if(typeof(this.scope[this.scope.callback_dropped]) == "function") {
			this.scope[this.scope.callback_dropped](event);
		}


		// reset dragged reference
		// after callback to be sure _dragged reference is still available
		this.rel_ox = u.absX(this) - u.relX(this);
		this.rel_oy = u.absY(this) - u.relY(this);

		u.rc(this, "dragged");
		this.scope._dragged = false;

	}



	// detect overlap based on mouse position and inject target accordingly
	scope.detectAndInject = function(event_x, event_y) {
		
		// check for overlap
//		for(i = 0; node = this.draggable_nodes[i]; i++) {

		// loop through backwards to check children first 
		for(i = this.draggable_nodes.length-1; node = this.draggable_nodes[i]; i--) {

			// do not check current node or target node for overlap and parent UL is included in targets
			if(node != this._dragged && node != this.tN && (!this.targets || u.hc(node.parentNode, this.targets))) {


				// vertical list - use Y coords for calculation
				if(this.layout == "vertical") {

//					u.bug("vertical list")

					// pre-calculate vars for better performance
					var o_top = u.absY(node);
//					var o_height = node.offsetHeight;
					var o_height = this.draggable_node_height;
//					u.bug("o_height:" + o_height);

					// overlap with element
				 	if(event_y > o_top && event_y < o_top + o_height) {

						// Nested structure (order and indenting)
						if(this.allow_nesting) {

							var no_nesting_offset = o_height/3 > 7 ? 7 : o_height/3;

							// top third
							if(i === 0 && event_y > o_top && event_y < o_top + no_nesting_offset) {
								node.parentNode.insertBefore(this.tN, node);
							}
							// bottom third
							else
							if(event_y > o_top && event_y > (o_top + o_height) - ((no_nesting_offset)*2)) {
								// look for next element
								var next = u.ns(node);
								if(next) {
									// insert before next element
									node.parentNode.insertBefore(this.tN, next);
								}
								else {
									// append to the end of the list
									node.parentNode.appendChild(this.tN);
								}
							}
							// middle third - append as child
							else {

								var sub_nodes = u.qs("ul" + this.targets ? ("."+this.targets) : "", node);
								if(!sub_nodes) {
									sub_nodes = u.ae(node, "ul", {"class":this.targets});
								}

								sub_nodes.appendChild(this.tN);

							}
							// end loop on overlap
							break;

						}
						// Flat structure (only order)
						else {

							// top half
							if(event_y > o_top && event_y < o_top + o_height/2) {
								node.parentNode.insertBefore(this.tN, node);
							}
							// bottom half
							else {
								// look for next element
								var next = u.ns(node);
								if(next) {
									// insert before next element
									node.parentNode.insertBefore(this.tN, next);
								}
								else {
									// append to the end of the list
									node.parentNode.appendChild(this.tN);
								}
							}
							// end loop on overlap
							break;

						}

					}
				}


				// TODO: Update horizontal as vertical


				// horizontal list - use both X and Y coordinates 
				else {
//							u.bug("horizontal list")
					var o_left = u.absX(node);
					var o_top = u.absY(node);
					var o_width = node.offsetWidth;
					var o_height = node.offsetHeight;

					// overlap with element
				 	if(event_x > o_left && event_x < o_left + o_width && event_y > o_top && event_y < o_top + o_height) {

//				 	if(o_left < d_center_x && (o_left + o_width) > d_center_x && o_top < d_center_y && (o_top + o_height) > d_center_y) {
						// left half
						if(event_x > o_left && event_x < o_left + o_width/2) {
//						if(o_left < d_center_x && o_left + (o_width/2) > d_center_x) {
							node.parentNode.insertBefore(this.tN, node);
						}
						// right half
						else {
							// look for next element
							var next = u.ns(node);
							if(next) {
								// insert before next element
								node.parentNode.insertBefore(this.tN, next);
							}
							else {
								// append to the end of the list
								node.parentNode.appendChild(this.tN);
							}
						}
						break;
					}
				}
			}
		}
	}


	// get current structure
	scope.getStructure = function() {

		// update draggable nodes first
		if(!this.draggables) {
			this.draggable_nodes = u.qsa("li", this);
		}
		else {
			this.draggable_nodes = u.qsa("."+this.draggables, this);
		}


		var structure = [];
		var i, node, id, relation, position;
		for(i = 0; node = this.draggable_nodes[i]; i++) {

//			u.bug("struct:" + u.nodeId(node));

			id = u.cv(node, "node_id");
			relation = this.getRelation(node);
			position = this.getPositionInList(node);

			structure.push({"id":id, "relation":relation, "position":position});
		}

		return structure;
	}
	
	// get position of node in list
	scope.getPositionInList = function(node) {

		var pos = 1;
		var test_node = node;
		while(u.ps(test_node)) {
			test_node = u.ps(test_node);
			pos++;
		}
		return pos;

	}

	// get relation of node in list
	scope.getRelation = function(node) {

		// is this node
		if(!node.parentNode.relation_id) {
			var li_relation = u.pn(node, "li");
			if(u.inNodeList(li_relation, this.draggable_nodes)) {
				node.parentNode.relation_id = u.cv(li_relation, "id");
			}
			else {
				node.parentNode.relation_id = 0;
			}
		}

		return node.parentNode.relation_id;
	}

	// remove drag start event from node
	// if a node is no longer active in drag structure
	scope.disableNodeDrag = function(node) {
		u.bug("disableNodeDrag:" + u.nodeId(node))
		u.e.removeStartEvent(node.drag, this._sortablepick);
	}

	// base initialization of targets and draggables
	var i, j, d_node;


	// defined draggable element or just all li's
	if(!scope.draggables) {
		scope.draggable_nodes = u.qsa("li", scope);
	}
	else {
		scope.draggable_nodes = u.qsa("."+scope.draggables, scope);
	}

	// no draggable nodes found, sorting is impossible
	if(!scope.draggable_nodes.length) {
		return;
	}

	// save global node height
	scope.draggable_node_height = scope.draggable_nodes[0].offsetHeight;


	// defined targets to drop on or just all ul's
	if(!scope.targets) {
		scope.target_nodes = u.qsa("ul", scope);
		u.bug("node.target_nodes_ul:" + " ("+scope.targets+")" + scope.target_nodes.length);
	}
	else {
		scope.target_nodes = u.qsa("."+scope.targets, scope);
		u.bug("node.target_nodes_qsa:" + " ("+scope.targets+")" + scope.target_nodes.length);
	}

	u.bug("node.target_nodes_a:" + scope.target_nodes.length);

	// add scope to target_nodes if it is valid
	//if(scope.nodeName == "UL" && (!scope.targets || u.hc(scope, scope.targets))) {
	if((!scope.targets || u.hc(scope, scope.targets))) {
		if(scope.target_nodes.length) {
			var temp_scope = scope.target_nodes;
			scope.target_nodes = [scope];
			var target_node;
			for(i = 0; target_node = temp_scope[i]; i++) {
				scope.target_nodes.push(target_node);
			} 
		}
		else {
			scope.target_nodes = [scope];
		}
	}

//	u.bug("node.draggable_nodes:" + scope.draggable_nodes.length);
	u.bug("node.target_nodes_b:" + scope.target_nodes.length);



	// TODO: list type should be set for each target 
	// what type of list do we have - floated indicates horizontal list

	// if node
	if(!scope.layout && scope.draggable_nodes.length) {
		
		// TODO
		// if list is higher and wider than its content - mixed list ?
		// if list is higher than its content - vertical list
		// if list is wider than its content - horizontal list
		scope.layout = scope.offsetWidth < scope.draggable_nodes[0].offsetWidth*2 ? "vertical" : "horizontal";
	}



	// set up dragables
	for(i = 0; d_node = scope.draggable_nodes[i]; i++) {

		u.bug("d_node:" + u.nodeId(d_node));

		// remember wrapper
		d_node.scope = scope;

		// uniquely identify element as target
		d_node.dragme = true;


		// get relative offset coords for li in case some positioning is involved
		d_node.rel_ox = u.absX(d_node) - u.relX(d_node);
		d_node.rel_oy = u.absY(d_node) - u.relY(d_node);
//		u.bug(u.nodeId(node) + ":node.rel_ox = " + node.rel_ox + ", node.rel_oy = " + node.rel_oy)


		// check for drag handle
		d_node.drag = u.qs(".drag", d_node);
		// if no drag area, use entire node
		if(!d_node.drag) {
			d_node.drag = d_node;
		}


		// reference node from drag handle
		d_node.drag.d_node = d_node;
		// cross-reference all drag children, so every event.target knows node
		var drag_children = u.qsa("*", d_node.drag);
		if(drag_children) {
			for(j = 0; child = drag_children[j]; j++) {
				child.d_node = d_node;
//				u.bug("set d_node:" + u.nodeId(child) + ", " + u.nodeId(d_node))

			}
		}

		// remove existing start handler (to be able to reinitialize scope without double events)
		u.e.removeStartEvent(d_node.drag, scope._sortablepick);

		// set start drag event handler
		u.e.addStartEvent(d_node.drag, scope._sortablepick);

	}


	// TODO 
	// window scroller
	// based on document body event
	// list._scrollWindowY = function() {
	// 	window.scrollBy(0, this.scroll_speed);
	// 	this.t_scroller = u.t.setTimer(this, this._scrollWindowY, 150);
	// }

}

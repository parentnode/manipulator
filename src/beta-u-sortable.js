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
		if(typeof(this.list.dragged) == "function") {
			this.list.dragged(event);
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

	/*
	// finds draggable parent - to avoid dragging nested text/image nodes
	this.findDragParent = function(event) {
		var e = event.target;
		while(!e.dragme) {
			e = e.parentNode;
		}
		return e;
	}
	*/
}



// Sorts li-nodes within a ul



// ATTEMPTING TO BIULD BETTER MODEL
u.sortable = function(node, options) {

	var callback;
//	var scope = node;
	var draggables;	// class on dragable nodes
	var targets;	// target nodes which can received drops

	var sources;

	// additional info passed to function as JSON object
	if(typeof(options) == "object") {
		var argument;
		for(argument in options) {

			switch(argument) {
				case "callback"				: callback				= options[argument]; break;
//				case "scope"				: scope					= options[argument]; break;
				case "draggables"			: draggables			= options[argument]; break;
				case "sources"				: sources				= options[argument]; break;
			}

		}
	}





	// node picked - attached to draggable node
	node._sortablepick = function(event) {

		u.bug("pick:" + u.nodeId(this) + "; "+ u.nodeId(this.d_node) + ";" + u.nodeId(this.d_node.node));

		// only pick if sorting is not disabled
		if(!this.d_node.node._sorting_disabled) {

			u.e.kill(event);


			// don't pick unless last element was correctly dropped
			if(!this.d_node.node._dragged) {

				// dragging has begun
				var d_node = this.d_node.node._dragged = this.d_node;

				u.bug("now dragging:" + u.nodeId(d_node));

				// dragged element start settings
				d_node.start_opacity = u.gcs(d_node, "opacity");
				d_node.start_position = u.gcs(d_node, "position");
				d_node.start_width = u.gcs(d_node, "width");
				d_node.start_height = u.gcs(d_node, "height");

				// drag target - create node based on dragged node
				if(!d_node.node.tN) {
					d_node.node.tN = document.createElement(d_node.nodeName);
				}

				u.sc(d_node.node.tN, "target " + d_node.className);
				u.as(d_node.node.tN, "height", u.actualHeight(d_node)+"px");
				u.as(d_node.node.tN, "width", u.actualWidth(d_node)+"px");
				u.as(d_node.node.tN, "opacity", d_node.start_opacity - 0.5);

				d_node.node.tN.innerHTML = d_node.innerHTML;

				u.bug("now dragging:" + u.nodeId(d_node));

	
				// set fixed dragged element width and lower opacity
				u.as(d_node, "width", u.actualWidth(d_node) + "px");
				u.as(d_node, "opacity", d_node.start_opacity - 0.3);
	// 
	// 			// set fixed list width and height to avoid shapeshifting when inserting and removing nodes
	// 			u.as(d_node.list, "width", u.actualWidth(d_node.list) + "px");
	// 			u.as(d_node.list, "height", u.actualHeight(d_node.list) + "px");
	// 
	// 			// dragged element mouse offsets
	// 			d_node.mouse_ox = u.eventX(event) - u.absX(d_node);
	// 			d_node.mouse_oy = u.eventY(event) - u.absY(d_node);
	// //			u.bug("mx:" + u.eventX(event) + "-" + u.absX(node));
	// //			u.bug("my:" + u.eventY(event) + "-" + u.absY(node));
	// 
	// 
	// 			// when everything is set up, position absolute to start dragging node
	// 			u.as(d_node, "position", "absolute");
	// 
	// 
	// 			// set drag and end events on body, to make sure events are captured even when away from list
	// 			u.e.addMoveEvent(document.body , d_node.node._sortabledrag);
	// 			u.e.addEndEvent(document.body , d_node.node._sortabledrop);
	// //			u.e.addEvent(document.body, "mousemove", u.s._drag);
	// //			u.e.addEvent(document.body, "mouseup", u.s._drop);
	// 
	// 			// remember current drag scope
	// 			document.body._sortable_node = d_node.node;
	// 
	// 
	// 			// position dragged element
	// 			u.as(d_node, "left", (u.eventX(event) - d_node.rel_ox) - d_node.mouse_ox+"px");
	// 			u.as(d_node, "top", (u.eventY(event) - d_node.rel_oy) - d_node.mouse_oy+"px");
	// 			u.ac(d_node, "dragged");
	// //			u.bug("("+u.eventX(event) + "-" + node.rel_ox + ") -" + node.mouse_ox+"px")
	// 
	// 			// and insert target
	// 			d_node.list.insertBefore(d_node.list.tN, d_node);
	// 		
				// notify picked
				if(typeof(d_node.node.picked) == "function") {
					d_node.node.picked(event);
				}
			}
		}

	}


	// drag element
	// event handling on document.body
	node._sortabledrag = function(event) {
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
		if(typeof(this.list.dragged) == "function") {
			this.list.dragged(event);
		}
		
	}

	// element is dropped
	// event handling on document.body
	node._sortabledrop = function(event) {
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
		u.e.removeMoveEvent(document.body , this._sortabledrag);
		u.e.removeEndEvent(document.body , this._sortabledrop);


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




	var i, j, d_node;

	// get all possible targets
	// TODO: needs to be extended to handle nested draggable list and drag between multiple lists
	// INFO: map possible targets by classname
	//       - mulitple lists would be enabled by setting sort on wrapping div
	//       - nested list would be separated by different classnames

//		var target_class = u.cv(list, "targets");

	// defined draggable element or just all li's
	if(!draggables) {
		node.draggable_nodes = u.qsa("li", node);
	}
	else {
		node.draggable_nodes = u.qsa(draggables, node);
	}

	// defined targets to drop on or just all ul's
	if(!targets) {
		node.target_nodes = u.qsa("ul", node);
	}
	else {
		node.target_nodes = u.qsa(targets, node);
	}


//	alert(scope.draggable_nodes.length);

	// TODO: list type should be set for each target 
	// what type of list do we have - floated indicates horizontal list
	if(node.draggable_nodes.length) {
		
		// TODO
		// if list is higher and wider than its content - mixed list ?
		// if list is higher than its content - vertical list
		// if list is wider than its content - horizontal list
		node.list_type = node.offsetWidth < node.draggable_nodes[0].offsetWidth*2 ? "vertical" : "horizontal";
	}



//		u.bug(e.list_type + ":" + u.gcs(e.nodes[0], "float"));

	// set up dragables
	for(i = 0; d_node = node.draggable_nodes[i]; i++) {

		// remember wrapper
		d_node.node = node;

		// uniquely identify element as target
		d_node.dragme = true;


		// get relative offset coords for ul
//			node.rel_ox = u.relOffsetX(node);
//			node.rel_oy = u.relOffsetY(node);
		d_node.rel_ox = u.absX(d_node) - u.relX(d_node);
		d_node.rel_oy = u.absY(d_node) - u.relY(d_node);
//			u.bug(u.nodeId(node) + ":node.rel_ox = " + node.rel_ox + ", node.rel_oy = " + node.rel_oy)


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
			}
		}

		// set start drag event handler
		u.e.addStartEvent(d_node.drag , node._sortablepick);
	}


		// TODO 
		// window scroller
		// based on document body event
		// list._scrollWindowY = function() {
		// 	window.scrollBy(0, this.scroll_speed);
		// 	this.t_scroller = u.t.setTimer(this, this._scrollWindowY, 150);
		// }
		


	/*
	// finds draggable parent - to avoid dragging nested text/image nodes
	this.findDragParent = function(event) {
		var e = event.target;
		while(!e.dragme) {
			e = e.parentNode;
		}
		return e;
	}
	*/
}

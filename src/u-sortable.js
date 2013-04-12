// Sorts li-nodes within a ul

Util.Sort = u.s = new function() {

	this.sortable = function(e) {
		var i, node;

		// get all possible targets
		// TODO: needs to be extended to handle nested draggable list and drag between multiple lists
		// INFO: map possible targets by classname
		//       - mulitple lists would be enabled by setting sort on wrapping div
		//       - nested list would be separated by different classnames

		var target_class = u.getIJ(e, "targets");
		if(!target_class) {
			e.nodes = u.qsa("li", e);
		}
		else {
			e.nodes = u.qsa("."+target_class, e);
		}

		// what type of list do we have - floated indicates horisontal list
		if(e.nodes.length) {
			e.list_type = u.gcs(e.nodes[0], "float").match(/left|right/) == null ? "vertical" : "horisontal";
		}

//		u.bug(e.list_type + ":" + u.gcs(e.nodes[0], "float"));

		// set up targets
		for(i = 0; node = e.nodes[i]; i++) {

			// remember wrapper
			node.e = e;

			// uniquely identify element as target
			node.dragme = true;

			// get reletive offset coords for ul
			node.rel_ox = u.relOffsetX(node);
			node.rel_oy = u.relOffsetY(node);

			node.drag = u.qs(".drag", node);
			node.drag.node = node;
			// set start drag event handler
			u.e.onStart(node.drag , this._pick);
		}
		
		// window scroller
		// based on document body event
		e._scrollWindowY = function() {
			window.scrollBy(0, this.scroll_speed);
			this.t_scroller = u.t.setTimer(this, this._scrollWindowY, 150);
		}
		
	}


	// node picked
	this._pick = function(event) {
		u.e.kill(event);

		// don't pick unless last element was correctly dropped
		if(!this.node.e.dragged) {

			// dragging has begun
			var node = this.node.e.dragged = this.node;

			// dragged element start settings
			node.start_opacity = u.gcs(node, "opacity");
			node.start_position = u.gcs(node, "position");

			// drag target - create node based on dragged node
			if(!node.e.tN) {
				node.e.tN = document.createElement(node.nodeName);
				node.e.tN.className = "target";
			}
			u.as(node.e.tN, "height", u.actualHeight(node)+"px");
			u.as(node.e.tN, "opacity", node.start_opacity - 0.5);
			node.e.tN.innerHTML = node.innerHTML;


			// set fixed dragged element width and lower opacity
			u.as(node, "width", u.actualWidth(node) + "px");
			u.as(node, "opacity", node.start_opacity - 0.3);

			// set fixed list width and height to avoid shapeshifting when inserting and removing nodes
			u.as(node.e, "width", u.actualWidth(node.e) + "px");
			u.as(node.e, "height", u.actualHeight(node.e) + "px");

			// dragged element mouse offsets
			node.mouse_ox = u.eventX(event) - u.absX(node);
			node.mouse_oy = u.eventY(event) - u.absY(node);
//			u.bug("mx:" + u.eventX(event) + "-" + u.absX(node))


			// when everything is set up, position absolute
			u.as(node, "position", "absolute");


			// set drag and end events on body, to make sure events are captured even when away from list
			u.e.onMove(document.body , u.s._drag);
			u.e.onEnd(document.body , u.s._drop);
//			u.e.addEvent(document.body, "mousemove", u.s._drag);
//			u.e.addEvent(document.body, "mouseup", u.s._drop);

			// remember current drag scope
			document.body.e = node.e;


			// position dragged element
			u.as(node, "left", (u.eventX(event) - node.rel_ox) - node.mouse_ox+"px");
			u.as(node, "top", (u.eventY(event) - node.rel_oy) - node.mouse_oy+"px");
			u.ac(node, "dragged");
//			u.bug("("+u.eventX(event) + "-" + node.rel_ox + ") -" + node.mouse_ox+"px")

			// and insert target
			node.e.insertBefore(node.e.tN, node);
			
			// notify picked
			if(typeof(node.e.picked) == "function") {
				node.e.picked(event);
			}
		}

	}


	// drag element
	// event handling on document.body
	this._drag = function(event) {
		var i, node;

//		u.bug("drag")

		u.e.kill(event);
	//	out("kill timer:" + u.t_scroller);
		// reset scroller
		if(this.e.t_scroller) {
			u.t.resetTimer(this.e.t_scroller);
			this.e.scroll_speed = 0;
		}


		// only execute drag if dragged flag is set
		if(this.e.dragged) {


			// pre-calculate vars for better performance
			var d_left = u.eventX(event) - this.e.dragged.mouse_ox;
			var d_top = u.eventY(event) - this.e.dragged.mouse_oy;
//			var d_left = (u.eventX(event) - this.e.dragged.rel_ox) - this.e.dragged.mouse_ox;
//			var d_top = (u.eventY(event) - this.e.dragged.rel_oy) - this.e.dragged.mouse_oy;
//			u.bug("d:" + d_left + "x" + d_top)


			// TODO - scrolling - some wrong offset

			// element is being dragged out of viewable area (top)
			if(u.scrollY() >= d_top && 0) {

				// is page scrollable?
				if(u.browserH() < u.htmlH()) {

					// set dragged element properties
					u.as(this.e.dragged, "position", "fixed");
					u.as(this.e.dragged, "left", d_left - this.e.dragged.rel_ox+"px");
					u.as(this.e.dragged, "top", 0);
					u.as(this.e.dragged, "bottom", "auto");

					// scroll as much as possible
					this.e.scroll_speed = Math.round((d_top - u.scrollY()));
					this.e._scrollWindowY();

				}
			}

			// element is being dragged out of viewable area (bottom)
			else if(u.browserH() + u.scrollY() < d_top + this.e.dragged.offsetHeight && 0) {

				// is page scrollable?
				if(u.browserH() < u.htmlH()) {

					// set dragged element properties
					u.as(this.e.dragged, "position", "fixed");
					u.as(this.e.dragged, "left", d_left - this.e.dragged.rel_ox+"px");
					u.as(this.e.dragged, "top", "auto");
					u.as(this.e.dragged, "bottom", 0);

					// scroll as much as possible
					this.e.scroll_speed = -(Math.round((u.browserH() + u.scrollY() - d_top - this.e.dragged.offsetHeight)));
					this.e._scrollWindowY();
				}
			}


			// regular move if everything is within scope
			else {

				// calculate center coordinate of dragged element
				var d_center_x = d_left + (this.e.dragged.offsetWidth/2);
				var d_center_y = d_top + (this.e.dragged.offsetHeight/2);
//				u.bug("d center:" + d_center_x + "x" + d_center_y)


				// set dragged element properties
				u.as(this.e.dragged, "position", "absolute");
				u.as(this.e.dragged, "left", d_left - this.e.dragged.rel_ox+"px");
				u.as(this.e.dragged, "top", d_top - this.e.dragged.rel_oy+"px");
				u.as(this.e.dragged, "bottom", "auto");


				// check for overlap
				for(i = 0; node = this.e.nodes[i]; i++) {

					// do not check current node or target node for overlap
					if(node != this.e.dragged && node != this.e.tN) {


						// vertical list
						if(this.e.list_type == "vertical") {

							// pre-calculate vars for better performance
							var o_top = u.absY(node);
							var o_height = node.offsetHeight; // + parseInt(u.gcs(li, "margin-top")) + parseInt(u.gcs(li, "margin-bottom"));

							// overlap with element
						 	if(o_top < d_center_y && (o_top + o_height) > d_center_y) {

								// top half
								if(o_top < d_center_y && o_top + (o_height/2) > d_center_y) {
									this.e.insertBefore(this.e.tN, node);
								}
								// bottom half
								else {
									// look for next element
									var next = u.ns(node);
									if(next) {
										// insert before next element
										this.e.insertBefore(this.e.tN, next);
									}
									else {
										// append to the end of the list
										this.e.appendChild(this.e.tN);
									}
								}
								// end loop on overlap
								break;
							}
						}

		// put detaction and injection in separate function as rutine is the same for vert and horisontal


						// horisontal list
						else {
							var o_left = u.absX(node);
							var o_top = u.absY(node);
							var o_width = node.offsetWidth;
							var o_height = node.offsetHeight;

							// overlap with element
						 	if(o_left < d_center_x && (o_left + o_width) > d_center_x && o_top < d_center_y && (o_top + o_height) > d_center_y) {
								// left half
								if(o_left < d_center_x && o_left + (o_width/2) > d_center_x) {
									this.e.insertBefore(this.e.tN, node);
								}
								// right half
								else {
									// look for next element
									var next = u.ns(node);
									if(next) {
										// insert before next element
										this.e.insertBefore(this.e.tN, next);
									}
									else {
										// append to the end of the list
										this.e.appendChild(this.e.tN);
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
		if(typeof(this.e.dragged) == "function") {
			this.e.dragged(event);
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

		u.e.removeEvent(document.body, u.e.event_pref == "touch" ? "touchmove" : "mousemove", u.s._drag);
		u.e.removeEvent(document.body, u.e.event_pref == "touch" ? "touchend" : "mouseup", u.s._drop);


		// replace target with dragged element
		this.e.tN = this.e.replaceChild(this.e.dragged, this.e.tN);

		// reset dragged element
		u.as(this.e.dragged, "position", this.e.dragged.start_position);
		u.as(this.e.dragged, "opacity", this.e.dragged.start_opacity);
		u.as(this.e.dragged, "left", "");
		u.as(this.e.dragged, "top", "");
		u.as(this.e.dragged, "bottom", "");
		u.as(this.e.dragged, "width", "");

		// reset list
		u.as(this.e, "width", "");
		u.as(this.e, "height", "");


		// reset dragged reference
		u.rc(this.e.dragged, "dragged");
		this.e.dragged = false;

		// stop scroller
		u.t.resetTimer(this.e.t_scroller);
		this.e.scroll_speed = 0;

		// update nodes list
		var target_class = u.getIJ(this.e, "targets");
		if(!target_class) {
			this.e.nodes = u.qsa("li", this.e);
		}
		else {
			this.e.nodes = u.qsa("."+target_class, this.e);
		}

		// notify dropped
		if(typeof(this.e.dropped) == "function") {
			this.e.dropped(event);
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
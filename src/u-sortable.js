


// Sorts draggable nodes within a scope

u.sortable = function(scope, _options) {

//	u.bug("u.sortable init: " + u.nodeId(scope))

	scope.callback_picked = "picked";
	scope.callback_moved = "moved";
	scope.callback_dropped = "dropped";

	scope.draggables;	// class on draggable nodes
	scope.targets;	// target nodes which can received drops

//	var sources;

	scope.layout;
	scope.allow_nesting = false;

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "picked"				: scope.callback_picked		= _options[_argument]; break;
				case "moved"				: scope.callback_moved		= _options[_argument]; break;
				case "dropped"				: scope.callback_dropped	= _options[_argument]; break;

				case "draggables"			: scope.draggables			= _options[_argument]; break;
				case "targets"				: scope.targets				= _options[_argument]; break;

//				case "sources"				: sources					= _options[_argument]; break;

				case "layout"				: scope.layout				= _options[_argument]; break;

				case "allow_nesting"		: scope.allow_nesting		= _options[_argument]; break;
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
			var li_relation = u.pn(node, {"include":"li"});
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
	}
	else {
		scope.target_nodes = u.qsa("."+scope.targets, scope);
	}

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
//	u.bug("node.target_nodes_b:" + scope.target_nodes.length);



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

//		u.bug("d_node:" + u.nodeId(d_node));

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

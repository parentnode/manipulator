// Make nodes sortable within a scope

u.sortable = function(scope, _options) {
	// u.bug("u.sortable init: ", scope);

	scope._callback_picked = "picked";
	scope._callback_moved = "moved";
	scope._callback_dropped = "dropped";

	scope._draggable_selector;
	scope._target_selector;

	scope._layout;
	scope._allow_clickpick = false;
	scope._allow_nesting = false;
	scope._sorting_disabled = false;

	scope._distance_to_pick = 2;

	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "picked"				: scope._callback_picked		= _options[_argument]; break;
				case "moved"				: scope._callback_moved			= _options[_argument]; break;
				case "dropped"				: scope._callback_dropped		= _options[_argument]; break;

				case "draggables"			: scope._draggable_selector		= _options[_argument]; break;
				case "targets"				: scope._target_selector		= _options[_argument]; break;

				case "layout"				: scope._layout					= _options[_argument]; break;
				case "allow_clickpick"		: scope._allow_clickpick		= _options[_argument]; break;
				case "allow_nesting"		: scope._allow_nesting			= _options[_argument]; break;
				case "sorting_disabled"		: scope._sorting_disabled		= _options[_argument]; break;
				case "distance_to_pick"		: scope._distance_to_pick		= _options[_argument]; break;
			}

		}
	}



	// Only declare helper functions on scope if needed
	if(!fun(scope.resetSortableEvents)) {



		// EVENT RECEIVERS

		// Will be applied to draggable nodes


		// Receive first input, in order to make pick speed dependent
		scope._sortableInputStart = function(event) {
			// u.bug("_sortableInputStart:", this, event);

			// only pick if sorting is not disabled
			if(!this.draggable_node.scope._sorting_disabled) {

				// used to handle dblclick timeout event forwarding
				// get event positions relative to screen
				this.draggable_node._start_event_x = u.eventX(event);
				this.draggable_node._start_event_y = u.eventY(event);

				// reset speed
				this.draggable_node.current_xps = 0;
				this.draggable_node.current_yps = 0;

				// reset move calculation values
				this.draggable_node._move_timestamp = event.timeStamp;
				this.draggable_node._move_last_x = 0;
				this.draggable_node._move_last_y = 0;


				// Add eventhandlers for move and end events, we only pick if move is confirmed by speed
				u.e.addMoveEvent(this.draggable_node, this.draggable_node.scope._sortablePick);
				u.e.addEndEvent(this.draggable_node, this.draggable_node.scope._cancelSortablePick);



				// Take care out mouseout event, only when needed
				if(event.type.match(/mouse/)) {
		 			u.e.addOutEvent(this.draggable_node.drag, this.draggable_node.scope._sortableOut);
				}

				// Disable user-select while dragging
				// this.draggable_node.scope._org_css_user_select = u.gcs(document.body, "user-select");
				this.draggable_node.scope._org_css_user_select = document.body.style.userSelect;
				u.ass(document.body, {
					"user-select": "none"
				});

			}

		}

		// Cancel pick
		scope._cancelSortablePick = function(event) {
			// u.bug("_cancelSortablePick", this, event);

			// Allow click to pick and drop
			if(!this.scope._allow_clickpick) {

				// Reset all event handlers
				this.scope.resetSortableEvents(this);

				// Restore original user-select state
				u.ass(document.body, {
					"user-select": this.scope._org_css_user_select
				});

			}

		}

		// Handle mouseout while picking (fast moves)
		scope._sortableOut = function(event) {
			// u.bug("_sortableOut:", this.draggable_node, event);

			// Get/set event id for later removal
			var edoi = this.draggable_node._event_drop_out_id = u.randomString();

			// Remember node in global scope
			document["_DroppedOutNode" + edoi] = this.draggable_node;


			// Mouseout happened – What happens next decides the response

			// mousemove on document, means mouse has left drag-handle (fast move), forward event to pick
			eval('document["_DroppedOutMove' + edoi + '"] = function(event) {document["_DroppedOutNode' + edoi + '"].scope._sortablePick.bind(document["_DroppedOutNode' + edoi + '"])(event);}');
			u.e.addEvent(document, "mousemove", document["_DroppedOutMove" + edoi]);

			// over on draggable node, means out happended on child node, we should prepare for another mouseout
			// and remove extended mouseout events to avoid doubles
			eval('document["_DroppedOutOver' + edoi + '"] = function(event) {document["_DroppedOutNode' + edoi + '"].scope.resetSortableOutEvents(document["_DroppedOutNode' + edoi + '"]);}');
			u.e.addEvent(this.draggable_node, "mouseover", document["_DroppedOutOver" + edoi]);

			// nouse up on document, means mouse has left the drag-handle, forward to cancel pick
			eval('document["_DroppedOutEnd' + edoi + '"] = function(event) {u.bug("### up save");document["_DroppedOutNode' + edoi + '"].scope._cancelSortablePick.bind(document["_DroppedOutNode' + edoi + '"])(event);}');
			u.e.addEvent(document, "mouseup", document["_DroppedOutEnd" + edoi]);

		}

		// Detect when node picked
		scope._sortablePick = function(event) {
			// u.bug("_sortablePick:", event, this.draggable_node);

			var event_x = u.eventX(event);
			var event_y = u.eventY(event);

			this.current_x = event_x - this._start_event_x;
			this.current_y = event_y - this._start_event_y;

			// Calculate moved distance
			var init_distance_x = Math.abs(this.current_x);
			var init_distance_y = Math.abs(this.current_y);

			if((init_distance_x > this.scope._distance_to_pick || init_distance_y > this.scope._distance_to_pick)) {

				// New pick confirmed – reset all events on this node
				this.scope.resetNestedSortableEvents(this);

				// Prevent event bubbling
				u.e.kill(event);

				// dragging has begun
				this.scope._dragged_node = this;



				// dragged element mouse offsets
				this._mouse_ox = event_x - u.absX(this);
				this._mouse_oy = event_y - u.absY(this);


				// calculate speed
				// current speed per second
				this.current_xps = Math.round(((this.current_x - this._move_last_x) / (event.timeStamp - this._move_timestamp)) * 1000);
				this.current_yps = Math.round(((this.current_y - this._move_last_y) / (event.timeStamp - this._move_timestamp)) * 1000);


				// remember current move time for next event
				this._move_timestamp = event.timeStamp;
				this._move_last_x = this.current_x;
				this._move_last_y = this.current_y;



				// drag shadow node - create node based on dragged node for shadow injection in list
				this.scope._shadow_node = u.ae(this.parentNode, this.cloneNode(true));
				// Insert shadow node correctly before calculation relative offset
				this.parentNode.insertBefore(this.scope._shadow_node, this);
				u.ac(this.scope._shadow_node, "shadow");

				// get relative offset coords for li in case some positioning is involved in list structure
				this.scope._recalculateRelativeShadowOffset();

				// Get width to maintain correct width on drag (shadow element will be positioned absolute)
				var _start_width = u.gcs(this, "width");


				var _z_index;
				if(this._z_index != "auto") {
					_z_index = this._z_index + 1;
				}
				// Default z-index works with form elements (with automatic zIndexing on hovers)
				else {
					_z_index = 55;
				}


				// Get shadow node ready for takeoff
				u.ass(this.scope._shadow_node, {
					width: _start_width,
					position: "absolute",
					left: ((event_x - this.scope._shadow_node._rel_ox) - this._mouse_ox) + "px",
					top: ((event_y - this.scope._shadow_node.rel_oy) - this._mouse_oy) + "px",
					
					// Make sure it is raised above the other elements
					"z-index": _z_index,
				});


				// Mark dragged node
				u.ac(this, "dragged");


				// set drag and end events on body, to make sure events are captured even when away from list
				this._event_move_id = u.e.addWindowMoveEvent(this, this.scope._sortableDrag);
				this._event_end_id = u.e.addWindowEndEvent(this, this.scope._sortableDrop);


				// notify picked
				if(fun(this.scope[this.scope._callback_picked])) {
					this.scope[this.scope._callback_picked](this);
				}

			}

		}

		// Drag node element and inject according to overlaps
		// Event listener on window
		scope._sortableDrag = function(event) {
			// u.bug("_sortableDrag:", this, event);

			var i, node;

			var event_x = u.eventX(event);
			var event_y = u.eventY(event);

			// pre-calculate vars for better performance
			var d_left = event_x - this._mouse_ox;
			var d_top = event_y - this._mouse_oy;

			// current postiion
			this.current_x = event_x - this._start_event_x;
			this.current_y = event_y - this._start_event_y;

			// calculate speed
			// current pixel per second
			this.current_xps = Math.round(((this.current_x - this._move_last_x) / (event.timeStamp - this._move_timestamp)) * 1000);
			this.current_yps = Math.round(((this.current_y - this._move_last_y) / (event.timeStamp - this._move_timestamp)) * 1000);

			// remember current move time for next event
			this._move_timestamp = event.timeStamp;
			this._move_last_x = this.current_x;
			this._move_last_y = this.current_y;



			// if(this.list.t_scroller) {
			// 	u.t.resetTimer(this.list.t_scroller);
			// 	this.list.scroll_speed = 0;
			// }


			// TODO - scrolling - some wrong offset

			// element is being dragged out of viewable area (top)
			// if(u.scrollY() >= d_top && 0) {
			//
			// 	// is page scrollable?
			// 	if(u.browserH() < u.htmlH()) {
			//
			// 		// set dragged element properties
			// 		u.as(this.scope.dragged, "position", "fixed");
			// 		u.as(this.scope.dragged, "left", d_left - this.list.dragged._rel_ox+"px");
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
			// 		u.as(this.scope.dragged, "left", d_left - this.scope.dragged._rel_ox+"px");
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


			// Inject before positioning shadow node (because injection might change it's relative offset)
			this.scope._detectAndInject(event_x, event_y);

			// Position shadow node
			u.ass(this.scope._shadow_node, {
				"position": "absolute",
				"left": (d_left - this.scope._shadow_node._rel_ox)+"px",
				"top": (d_top - this.scope._shadow_node._rel_oy)+"px",
				"bottom": "auto"
			});


//			}


			// notify dragged
			if(fun(this.scope[this.scope._callback_moved])) {
				this.scope[this.scope._callback_moved](this);
			}

		}

		// Handle drop
		// Event listener on window
		scope._sortableDrop = function(event) {
			// u.bug("_sortableDrop", this, event);


			// Prevent event bubbling
			u.e.kill(event);


			// Reset drag event listeners
			this.scope.resetSortableEvents(this);


			// Remove shadow element
			this.scope._shadow_node.parentNode.removeChild(this.scope._shadow_node);
			delete this.scope._shadow_node;


			// Leave dragged state
			u.rc(this, "dragged");


			// reset dragged reference
			this.scope._dragged_node = false;


			// reset speed
			this.current_xps = 0;
			this.current_yps = 0;

			// reset move calculation values
			this._move_timestamp = event.timeStamp;
			this._move_last_x = 0;
			this._move_last_y = 0;


			// update nodes list
			this.scope.updateDraggables();


			// stop scroller
			// u.t.resetTimer(this.list.t_scroller);
			// this.list.scroll_speed = 0;


			// Restore original user-select value
			u.ass(document.body, {
				"user-select": this.scope._org_css_user_select
			});


			// notify dropped
			if(fun(this.scope[this.scope._callback_dropped])) {
				this.scope[this.scope._callback_dropped](this);
			}

		}



		// HELPER FUNCTIONS


		// Recalculate relative offset for shadow node - this might change when draggables are moved around
		// Separated into function to run as specific/rarely as possible (heavy on performance)
		scope._recalculateRelativeShadowOffset = function() {

			if(this._shadow_node) {
				this._shadow_node._rel_ox = u.absX(this._shadow_node) - u.relX(this._shadow_node);
				this._shadow_node._rel_oy = u.absY(this._shadow_node) - u.relY(this._shadow_node);
			}

		}

		// Detect overlap based on mouse position and inject into target accordingly
		scope._detectAndInject = function(event_x, event_y) {
			// u.bug("_detectAndInject, ex: " + event_x + ", ey: " + event_y);

			// loop through backwards to check children first
			for(i = this.draggable_nodes.length-1; i >= 0; i--) {
				node = this.draggable_nodes[i];
				// u.bug("node:", node);

				// make sure parent UL is included in target_nodes
				if(this.target_nodes.indexOf(node.parentNode) !== -1) {

					// Decide what to do

					// multiline list - use both X and Y coordinates
					if(node.parentNode._layout == "multiline") {
						// u.bug("multiline list", node);

						var o_left = u.absX(node);
						var o_top = u.absY(node);
						var o_width = node.offsetWidth;
						var o_height = node.offsetHeight;

						// overlap with element
					 	if(event_x > o_left && event_x < o_left + o_width && event_y > o_top && event_y < o_top + o_height) {

							if(node !== this._dragged_node) {

								// left half
								if(event_x < o_left + o_width/2) {
									node.parentNode.insertBefore(this._dragged_node, node);
								}
								// right half
								else {
									// look for next element
									var next = u.ns(node, {exclude: ".target,.dragged"});
									if(next) {
										// insert before next element
										node.parentNode.insertBefore(this._dragged_node, next);
									}
									else {
										// append to the end of the list
										node.parentNode.appendChild(this._dragged_node);
									}
								}

								this._recalculateRelativeShadowOffset();
								break;

							}

						}

					}

					// horizontal list
					// Only look a x-coordinates
					else if(node.parentNode._layout == "horizontal") {
						// u.bug("horizontal list", node);

						var o_left = u.absX(node);
						var o_width = node.offsetWidth;

						// overlap with element
					 	if(event_x > o_left && event_x < o_left + o_width) {

							if(node !== this._dragged_node && !u.pn(node, {include:".dragged"})) {

								// left half
								if(event_x < o_left + o_width/2) {
									node.parentNode.insertBefore(this._dragged_node, node);
								}
								// right half
								else {
									// look for next element
									var next = u.ns(node, {exclude: ".target,.dragged"});
									if(next) {
										// insert before next element
										node.parentNode.insertBefore(this._dragged_node, next);
									}
									else {
										// append to the end of the list
										node.parentNode.appendChild(this._dragged_node);
									}
								}

							}

							this._recalculateRelativeShadowOffset();
							break;
						}

					}

					// default
					// vertical list - use Y coords for calculation
					else {
						// u.bug("vertical list", node);

						// Get correct top and height values
						var o_top, o_height;
						if(this._allow_nesting) {
							o_top = u.absY(node) - node._extra_height_top;
							o_height = node._top_node_height + node._extra_height_top + node._extra_height_bottom;
						}
						else {
							o_top = u.absY(node);
							o_height = node._top_node_height;
						}


						// overlap with element
					 	if(event_y >= o_top && event_y <= o_top + o_height) {

							if(node !== this._dragged_node && !u.pn(node, {include:".dragged"})) {

								// Nested structure (order and indenting)
								if(this._allow_nesting) {

									// top third, unless there are populated sub_targets and movement is downwards
									if(event_y < o_top + (o_height / 3) && (!node.sub_target || !node.sub_target.childNodes.length || this._dragged_node.current_yps < 0)) {
										// u.bug("top third");

										node.parentNode.insertBefore(this._dragged_node, node);
									}
									// bottom third, or top movement with sub_target and downwards movement
									else if(event_y > o_top + ((o_height / 3) * 2)) {
										// u.bug("bottom third");

										// look for next element
										var next = u.ns(node, {exclude:".target,.dragged"});
										if(next) {
											// insert before next element
											node.parentNode.insertBefore(this._dragged_node, next);
										}
										else {
											// append to the end of the list
											node.parentNode.appendChild(this._dragged_node);
										}
									}
									// middle third - append as child
									else {
										// u.bug("middle third");

										if(!node.sub_target) {
											node.sub_target = u.ae(node, "ul", {"class":this._target_selector.replace(/([a-z]*.?)/, "").replace(/\./g, " ")});
											this.target_nodes.push(node.sub_target);
										}

										node.sub_target.insertBefore(this._dragged_node, node.sub_target.firstChild);
									}

								}
								// Flat structure (only order)
								else {


									// top half
									// if(event_y > o_top && event_y < o_top + o_height/2) {
									if(event_y < o_top + o_height/2) {
										node.parentNode.insertBefore(this._dragged_node, node);
									}
									// bottom half
									else {
										// look for next element
										var next = u.ns(node);
										if(next) {
											// insert before next element
											node.parentNode.insertBefore(this._dragged_node, next);
										}
										else {
											// append to the end of the list
											node.parentNode.appendChild(this._dragged_node);
										}
									}

								}

								this._recalculateRelativeShadowOffset();
								// end loop on overlap
								break;

							}

							// end loop on overlap
							else {

								break;
								
							}

						}

					}

				}
			}
		}

		// Reset all events (only _sortableInputStart remains)
		scope.resetSortableEvents = function(node) {
			// u.bug("resetSortableEvents", node);

			// remove events handlers
			u.e.removeMoveEvent(node, this._sortablePick);
			u.e.removeEndEvent(node, this._cancelSortablePick);

			u.e.removeOverEvent(node, this._sortableOver);

			if(node._event_move_id) {
				u.e.removeWindowMoveEvent(node._event_move_id);
				delete node._event_move_id;
			}
			if(node._event_end_id) {
				u.e.removeWindowEndEvent(node._event_end_id);
				delete node._event_end_id;
			}

			// Reset special mouse out event
			u.e.removeOutEvent(node.drag, this._sortableOut);

			// Reset extended mouse out events
			this.resetSortableOutEvents(node);
		}

		// Reset extended mouse out events – these are applied by mouseout event
		scope.resetSortableOutEvents = function(node) {
			// u.bug("resetSortableOutEvents", node._event_drop_out_id);

			if(node._event_drop_out_id) {
				u.e.removeEvent(document, "mousemove", document["_DroppedOutMove" + node._event_drop_out_id]);
				u.e.removeEvent(node, "mouseover", document["_DroppedOutOver" + node._event_drop_out_id]);
				u.e.removeEvent(document, "mouseup", document["_DroppedOutEnd" + node._event_drop_out_id]);

				// Also clean up placeholders
				delete document["_DroppedOutMove" + node._event_drop_out_id];
				delete document["_DroppedOutOver" + node._event_drop_out_id];
				delete document["_DroppedOutEnd" + node._event_drop_out_id];
				delete document["_DroppedOutNode" + node._event_drop_out_id];

				delete node._event_drop_out_id;
			}
		}

		// Reset nested elements to avoid picking more than one element in nested scenarios
		scope.resetNestedSortableEvents = function(node) {
			// u.bug("resetNestedSortableEvents:", node);

			while(node && node != this) {
				if(node.drag) {
					this.resetSortableEvents(node);
				}
				node = node.parentNode;
			}

		}



		// GET INFORMATION

		// Get array of ordered ids or nodes
		scope.getNodeOrder = function(_options) {

			var class_var = "item_id";

			if(obj(_options)) {
				var _argument;
				for(_argument in _options) {

					switch(_argument) {
						case "class_var"			: class_var 		= _options[_argument]; break;
					}

				}
			}


			// update draggable nodes first
			this.updateDraggables();

			var order = [];
			var i, node, id;
			for(i = 0; i < this.draggable_nodes.length; i++) {

				node = this.draggable_nodes[i];

				id = u.cv(node, class_var);

				if(id) {
					order.push(id);
				}
				else {
					order.push(node);
				}

			}

			return order;
		}

		// Get current nested relations
		scope.getNodeRelations = function(_options) {

			var class_var = "item_id";

			if(obj(_options)) {
				var _argument;
				for(_argument in _options) {

					switch(_argument) {
						case "class_var"			: class_var 		= _options[_argument]; break;
					}

				}
			}

			// update draggable nodes first
			this.updateDraggables();

			var structure = [];
			var i, node, id, relation, position;
			for(i = 0; i < this.draggable_nodes.length; i++) {

				node = this.draggable_nodes[i];

				id = u.cv(node, class_var);
				relation = this.getNodeRelation(node);
				position = this.getNodePositionInList(node);

				if(id) {
					structure.push({"id": id, "relation": relation, "position": position});
				}
				else {
					structure.push({"node": node, "relation": relation, "position": position});
				}

			}

			return structure;
		}

		// Get position of node in list
		scope.getNodePositionInList = function(node) {

			var pos = 1;
			var test_node = node;
			while(u.ps(test_node)) {
				test_node = u.ps(test_node);
				pos++;
			}
			return pos;

		}

		// Get relation of node in list
		scope.getNodeRelation = function(node) {

			var relation = 0;
			var relation_node = u.pn(node, {"include":(this._draggable_selector ? this._draggable_selector : "li")});

			if(u.inNodeList(relation_node, this.draggable_nodes)) {

				var id = u.cv(relation_node, "item_id");
				if(id) {
					relation = id;
				}
				else {
					relation = relation_node;
				}
			}

			return relation;
		}



		// INITIALISERS / UPDATERS

		// Detect layout based on draggable_nodes layout
		scope.detectSortableLayout = function() {
			// u.bug("detectSortableLayout", this);

			var i, target;
			for(i = 0; i < this.target_nodes.length; i++) {
				target = this.target_nodes[i];

				// u.bug("target", target, target._n_left);
				// if(this._layout) {
				// 	target._layout = this._layout;
				// }
				// else {

					// if node-tops or node-bottoms are all the same
					// - and more than one child (otherwise how to compare positions)
					// - or only one element with display other than block (block indicates vertical list)
					if((target._n_top || target._n_bottom) && (u.cn(target).length > 1 || target._n_display != "block")) {
						target._layout = "horizontal";
					}
					// If node-left or node-right are all the same
					else if(target._n_left || target._n_right) {
						target._layout = "vertical";
					}
					// It's all different – must be multiline
					else {
						target._layout = "multiline";
					}

				// }


				// u.bug("_layout:" + target._layout, target);
			}

		}

		// Update collection of draggable nodes and apply/remove event listeners
		// (they might have changed order, some might even have disappeared)
		scope.updateDraggables = function() {
			// u.bug("updateDraggables", this);

			var i, target, draggable_node;


			// RESET OLD DRAGGABLES

			if(this.draggable_nodes && this.draggable_nodes.length) {
				// u.bug("reset this.draggable_nodes", this.draggable_nodes);

				for(i = 0; i < this.draggable_nodes.length; i++) {
					draggable_node = this.draggable_nodes[i];

					if(draggable_node && draggable_node.drag) {

						this.resetSortableEvents(draggable_node);
						u.e.removeStartEvent(draggable_node.drag, this._sortableInputStart);
						u.e.removeOverEvent(draggable_node, this._sortableOver);

						delete draggable_node.drag;
						delete draggable_node.sub_target;
						
						delete draggable_node.draggable_node;
					}
				}
			}

			// Clean slate
			delete scope.draggable_nodes;



			// UPDATE LIST OF DRAGGABLES

			// defined selector for draggable element
			if(this._draggable_selector) {

				// Make sure draggable nodes are always returned as array
				this.draggable_nodes = Array.prototype.slice.call(u.qsa(this._draggable_selector, this));
			}
			// or just all li's (but only direct children)
			else {

				// applied directly to list – get only li-children of target
				if(this.nodeName.toLowerCase() === "ul") {
					this.draggable_nodes = u.cn(this, {include:"li"});
				}
				// Get direct li-children of each target
				else {
					this.draggable_nodes = [];

					for(i = 0; i < this.target_nodes.length; i++) {
						target = this.target_nodes[i];
						this.draggable_nodes = this.draggable_nodes.concat(u.cn(target, {include:"li"}));
					}
				}

			}

			// u.bug("this.draggable_nodes:", this.draggable_nodes);



			// INITIALIZE DRAGGABLE NODES

			// set up dragables
			for(i = 0; i < this.draggable_nodes.length; i++) {

				draggable_node = this.draggable_nodes[i];
				// u.bug("draggable_node:", draggable_node);

				// remember wrapper
				draggable_node.scope = this;

				// check for "drag handle"
				draggable_node.drag = u.qs(".drag", draggable_node);
				// if no drag area
				if(!draggable_node.drag) {
					// use entire node
					draggable_node.drag = draggable_node;

				}
				// Let "drag handle" know about draggable node
				draggable_node.drag.draggable_node = draggable_node;

				// Make sure that both "drag handle" and draggable node can use same reference
				draggable_node.draggable_node = draggable_node;



				// Get calculation values
				var _top = draggable_node.offsetTop;
				var _height = draggable_node.offsetHeight;
				var _left = draggable_node.offsetLeft;
				var _width = draggable_node.offsetWidth;
				var _display = u.gcs(draggable_node, "display");

				// u.bug("left", draggable_node, _left)

				// Get values for layout autodetection
				// Identify fixed properties – set to false if value is different from siblings
				draggable_node.parentNode._n_top = draggable_node.parentNode._n_top === undefined ? _top : (draggable_node.parentNode._n_top == _top ? draggable_node.parentNode._n_top : false);
				draggable_node.parentNode._n_left = draggable_node.parentNode._n_left === undefined ? _left : (draggable_node.parentNode._n_left == _left ? draggable_node.parentNode._n_left : false);
				draggable_node.parentNode._n_bottom = draggable_node.parentNode._n_bottom === undefined ? _top + _height : (draggable_node.parentNode._n_bottom == _top + _height ? draggable_node.parentNode._n_bottom : false);
				draggable_node.parentNode._n_right = draggable_node.parentNode._n_right === undefined ? _left + _width : (draggable_node.parentNode._n_right == _left + _width ? draggable_node.parentNode._n_right : false);
				draggable_node.parentNode._n_display = draggable_node.parentNode._n_display === undefined ? _display : (draggable_node.parentNode._n_display == _display ? draggable_node.parentNode._n_display : false);


				// Remeber current z-index
				draggable_node._z_index = u.gcs(draggable_node, "zIndex");


				// Special calculations for nested lists
				if(this._allow_nesting) {
					draggable_node.sub_target = u.qs(this._target_selector, draggable_node);

					
					if(draggable_node.sub_target) {

						var _position = u.gcs(draggable_node, "position");

						// Get node height excluding sub target
						var node_height = _height - draggable_node.sub_target.offsetHeight;

						if(_position !== "static") {
							draggable_node._top_node_height = node_height - (node_height - draggable_node.sub_target.offsetTop);
						}
						else {
							draggable_node._top_node_height = node_height - (node_height - (draggable_node.sub_target.offsetTop - _top));
						}

						// u.bug("nth:" + draggable_node._top_node_height +", pos:"+ _position +", stot:"+ draggable_node.sub_target.offsetTop + ", _top:" + _top, draggable_node);
						
					}
					// Top height equals height, when no subtarget is present
					else {

						draggable_node._top_node_height = _height;
					}


					// Pre-Calculate extra height based on margins and borders (if content-box)
					var _margin_top = parseInt(u.gcs(draggable_node, "margin-top"));
					var _margin_bottom = parseInt(u.gcs(draggable_node, "margin-bottom"));

					var _box_sizing = u.gcs(draggable_node, "box-sizing");
					if(_box_sizing == "content-box") {

						var _border_top_width = parseInt(u.gcs(draggable_node, "border-top-width"));
						var _border_bottom_width = parseInt(u.gcs(draggable_node, "border-bottom-width"));

						draggable_node._extra_height_top = _margin_top + _border_top_width;
						draggable_node._extra_height_bottom = _margin_bottom + _border_bottom_width;
					}
					else {
						draggable_node._extra_height_top = _start_margin_top;
						draggable_node._extra_height_bottom = _start_margin_bottom;
					}

					// u.bug("draggable_node._extra_height_top:" + draggable_node._extra_height_top, "draggable_node._extra_height_bottom:" + draggable_node._extra_height_bottom);

				}
				// Set top_node_height for non-nested lists
				else {

					draggable_node._top_node_height = _height;
				}


				// set start drag event handler
				u.e.addStartEvent(draggable_node.drag, this._sortableInputStart);

			}

		}

		// Update collection of targets
		scope.updateTargets = function() {
			// u.bug("updateTargets", this);

			// Get target nodes
			// defined _target_selector to drop on, current ul or just all ul's in scope
			if(this._target_selector) {

				// Make sure target_nodes are always stored as Array
				this.target_nodes = Array.prototype.slice.call(u.qsa(this._target_selector, this));
				// u.bug("this.target_nodes", this.target_nodes, this._target_selector, this);

				// include scope if it matches
				if(u.elementMatches(this, this._target_selector)) {
					this.target_nodes.unshift(this);
				}

			}
			else {

				// Scope is list – use only top level list as target
				if(this.nodeName.toLowerCase() === "ul") {
					this.target_nodes = [this];
				}
				else {
					var i, target, target_nodes, parent_ul;
					this.target_nodes = [];

					target_nodes = u.qsa("ul", this);
					for(i = 0; i < target_nodes.length; i++) {
						target = target_nodes[i];

						if(this._allow_nesting) {
							this.target_nodes.push(target);
						}
					// Only include first level list
						else {
							parent_ul = u.pn(target, {include:"ul"});
							// if list doesn't have parent list - or parent list is outside of scope
							if(!parent_ul || !u.contains(this, parent_ul)) {
								this.target_nodes.push(target);
							}
						}
					}

				}

			}

		}

	}



	// Get updated list of targets
	scope.updateTargets();

	// Get updated list of draggable nodes
	scope.updateDraggables();

	// Update layout values
	scope.detectSortableLayout();


	// Precaution
	// no draggable nodes found, sorting is impossible
	if(!scope.draggable_nodes.length || !scope.target_nodes.length) {
		// u.bug("Nothing to sort in this scope", scope, scope.draggable_nodes.length, scope.target_nodes.length);
		return;
	}


	// TODO 
	// window scroller
	// based on document body event
	// list._scrollWindowY = function() {
	// 	window.scrollBy(0, this.scroll_speed);
	// 	this.t_scroller = u.t.setTimer(this, this._scrollWindowY, 150);
	// }

}

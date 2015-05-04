
	// style
	// stroke, fill, 


	// attributes
	// x1, x2, y1, y2, r, cx, cy, d, x, y
	// stroke, stroke-width, fill, stroke-dash-array
	

	// CURRENT THINGS TO CONSIDER
	
	// if animation is running, should new function call take over or work "on top"/"side-by-side"
	// css transitions take over


	u.a.parseSVGPath = function(value) {

		// values required for each type
		var pairs = {"m":2, "l":2, "a":7, "c":6, "s":4, "q":4, "z":0};

		// add structure to string for parsability
		value = value.replace(/-/g, " -");
		value = value.replace(/,/g, " ");
		value = value.replace(/(m|l|a|c|s|q|M|L|A|C|S|Q)/g, " $1 ");
		value = value.replace(/  /g, " ");

		// check values
		sets = value.match(/(m|l|a|c|s|q|M|L|A|C|S|Q)([0-9 \-\.]+)/g);

		for(x in sets) {
			parts = sets[x].trim().split(" ");

			sets[x] = parts;

			if(parts && pairs[parts[0].toLowerCase()] == parts.length-1) {
//				u.bug("valid set:" + parts);
			}
			else {
//				u.bug("invalid set - could be 'dual' set with only one identifier")
			}


		}


		// u.bug("values:" + sets);
		// u.bug("value:" + value);
		return sets;
	
	}


	u.a.getInitialValue = function(node, attribute) {

		var value = (node.getAttribute(attribute) ? node.getAttribute(attribute) : u.gcs(node, attribute)).replace(node._unit[attribute], "")
		if(attribute.match(/^(d)$/)) {
			return value;
//			value.split("m|l|a|c|s|M|L|A|C|S");

		}
		else {
			return Number(value.replace(/auto/, 0));
		}
	}



	u.a.to = function(node, transition, attributes) {

		// get duration
		var duration = transition.match(/[0-9.]+[ms]+/g);
		if(duration) {
	//		u.bug(duration[0]);
			node.duration = duration[0].match("ms") ? parseFloat(duration[0]) : (parseFloat(duration[0]) * 1000);
		}

		var value, d;

		// TODO: get delay


		node._start = {};
		node._end = {};
		node._unit = {};

		for(attribute in attributes) {


			// path definitions are 
			if(attribute.match(/^(d)$/)) {

				node._start[attribute] = this.parseSVGPath(this.getInitialValue(node, attribute));
				node._end[attribute] = this.parseSVGPath(attributes[attribute]);

//				u.bug("start:" + node._start[attribute].join("#"))
//				u.bug("end:" + node._end[attribute])

				// d_parts = this.getInitialValue(node, attribute);
				//
				// u.bug("d_parts:" + d_parts)
				//
				//
				// node._start[attribute] = d_parts.split("m|l|a|c|s|M|L|A|C|S");
				//
				// u.bug("node._start:" + node._start[attribute])

			}
			// plain number svg shapes
			else {

				node._unit[attribute] = attributes[attribute].toString().match(/\%|px/);
				node._start[attribute] = this.getInitialValue(node, attribute);
				 //(node.getAttribute(attribute) ? node.getAttribute(attribute) : u.gcs(node, attribute)).replace(node._unit[attribute], "");
				node._end[attribute] = attributes[attribute].toString().replace(node._unit[attribute], "");

			}

//			u.bug("attributes["+attribute+"] = "+attributes[attribute] + "::"+ node._start[attribute] + " -> " + node._end[attribute]);

		}
//		u.bug("duration:" + node.duration);

		node.transitionTo = function(progress) {

			for(attribute in attributes) {

				// transform value
				if(attribute.match(/^(translate|rotate|scale)$/)) {

					if(attribute == "translate") {

						u.a.translate(this, Math.round((this._end_x - this._start_x) * progress), Math.round((this._end_y - this._start_y) * progress))
					}
					else if(attribute == "rotate") {

					}

				}

				// plain svg value
				else if(attribute.match(/^(x1|y1|x2|y2|r|cx|cy|stroke-width)$/)) {

					var new_value = (this._start[attribute] + ((this._end[attribute] - this._start[attribute]) * progress)) +  this._unit[attribute]
//					u.bug("update:" + attribute + ":" + new_value);

					this.setAttribute(attribute, new_value);

				}

				// path d attribute
				else if(attribute.match(/^(d)$/)) {
//					u.bug("path")
//					var d_parts = this._start[attribute].split("m|l|a|c|s|M|L|A|C|S");
//					u.bug("d_parts:" + d_parts)
					var new_value = "";
					for(x in this._start[attribute]) {

						for(y in this._start[attribute][x]) {
//							u.bug("pf:" + this._start[attribute][x][y] + " :: " + parseFloat(this._start[attribute][x][y]) + ", " + typeof(this._start[attribute][x][y]))

							if(parseFloat(this._start[attribute][x][y]) == this._start[attribute][x][y]) {
								new_value += (Number(this._start[attribute][x][y]) + ((Number(this._end[attribute][x][y]) - Number(this._start[attribute][x][y])) * progress)) + " ";
							}
							else {
								new_value += this._end[attribute][x][y] + " ";
							}
						}
					}
					// var new_value = (this._start[attribute] + ((this._end[attribute] - this._start[attribute]) * progress)) +  this._unit[attribute]
//
//					u.bug("set new:" + new_value);
					this.setAttribute(attribute, new_value);

				}
				// regular attribute
				else {

					//u.bug("update:" + this._end[attribute] + "-" + this._start[attribute] + " * " + progress + " " + this._unit[attribute])
					var new_value = (this._start[attribute] + ((this._end[attribute] - this._start[attribute]) * progress)) +  this._unit[attribute]


//					u.bug("update:" + attribute + ":" + new_value);

					u.as(node, attribute, new_value, false);

				}


			


			}

		}


//			u.bug(u.nodeId(this) + ":progress:" + progress + " ("+(this._end_x - this._start_x) * progress+","+(this._end_y - this._start_y) * progress+")")
		


		u.a.requestAnimationFrame(node, "transitionTo", node.duration);

	}



// this.animationFrame = function(node, callback) {
//
// 	if(!window._animationframe) {
// 		window._animationframe = window[this.vendor("requestAnimationFrame")]
//
// 	}
//
// }
//
//
// window.cancelRequestAnimFrame = ( function() {
// 	return window.cancelAnimationFrame 						||
//       window.webkitCancelRequestAnimationFrame 	||
//       window.mozCancelRequestAnimationFrame 		||
//       window.oCancelRequestAnimationFrame 			||
//       window.msCancelRequestAnimationFrame			||
//       clearTimeout
// } )();
//
// window.requestAnimFrame = (function() {
//   return  window.requestAnimationFrame     ||
//         window.webkitRequestAnimationFrame ||
//         window.mozRequestAnimationFrame    ||
//         window.oRequestAnimationFrame      ||
//         window.msRequestAnimationFrame     ||
//         function(callback, element){
//             return window.setTimeout(callback, 1000 / 60);
//         };
// })();
//
// (function() {
//     var lastTime = 0;
//     var vendors = ['ms', 'moz', 'webkit', 'o'];
//     for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
//         window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
//         window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
//                                    || window[vendors[x]+'CancelRequestAnimationFrame'];
//     }
//
//     if (!window.requestAnimationFrame)
//         window.requestAnimationFrame = function(callback, element) {
//             var currTime = new Date().getTime();
//             var timeToCall = Math.max(0, 16 - (currTime - lastTime));
//             var id = window.setTimeout(function() { callback(currTime + timeToCall); },
//               timeToCall);
//             lastTime = currTime + timeToCall;
//             return id;
//         };
//
//     if (!window.cancelAnimationFrame)
//         window.cancelAnimationFrame = function(id) {
//             clearTimeout(id);
//         };
// }());

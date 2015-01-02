
	// style
	// stroke, fill, 


	// attributes
	// x1, x2, y1, y2, r, cx, cy, d, x, y
	// stroke, stroke-width, fill, stroke-dash-array
	

	// CURRENT THINGS TO CONSIDER
	
	// if animation is running, should new function call take over or work "on top"/"side-by-side"
	// css transitions take over


	u.a.getInitialValue = function(node, attribute) {

		var value = (node.getAttribute(attribute) ? node.getAttribute(attribute) : u.gcs(node, attribute)).replace(node._unit[attribute], "")
		return Number(value.replace(/auto/, 0));
	}



	u.a.to = function(node, transition, attributes) {
		

		// get duration
		var duration = transition.match(/[0-9.]+[ms]+/g);
		if(duration) {
	//		u.bug(duration[0]);
			node.duration = duration[0].match("ms") ? parseFloat(duration[0]) : (parseFloat(duration[0]) * 1000);
		}


		// TODO: get delay


		node._start = {};
		node._end = {};
		node._unit = {};

		for(attribute in attributes) {

			node._unit[attribute] = attributes[attribute].toString().match(/\%|px/);

			node._start[attribute] = Number(this.getInitialValue(node, attribute));
			 //(node.getAttribute(attribute) ? node.getAttribute(attribute) : u.gcs(node, attribute)).replace(node._unit[attribute], "");
			node._end[attribute] = attributes[attribute].toString().replace(node._unit[attribute], "");

//			u.bug("attributes["+attribute+"] = "+attributes[attribute] + "::"+ node._start[attribute] + " -> " + node._end[attribute]);

		}
//		u.bug("duration:" + node.duration);

		node.transitionTo = function(progress) {

			for(attribute in attributes) {
				if(attribute.match(/translate|rotate|scale/)) {

					if(attribute == "translate") {
						u.a.translate(this, Math.round((this._end_x - this._start_x) * progress), Math.round((this._end_y - this._start_y) * progress))
					}
					else if(attribute == "rotate") {

					}
					
				}
				else if(attribute.match(/x1|y1|x2|y2|r|cx|cy/)) {

					var new_value = (this._start[attribute] + ((this._end[attribute] - this._start[attribute]) * progress)) +  this._unit[attribute]
//					u.bug("update:" + attribute + ":" + new_value);

					this.setAttribute(attribute, new_value);

				}
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

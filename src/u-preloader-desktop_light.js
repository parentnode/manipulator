// IE fallback - bad event loopback on image events

/**
* Load image
*
* @param e event return node
*/

if(document.all || (new Image().onerror) === undefined) {

	u.loadImage = function(node, src) {

//		u.bug("u.i.load:" + src)



		// for(x in navigator) {
		// 	u.bug("navigator["+x+"] = " + navigator[x])
		// }
		// u.xInObject(navigator.netscape);

		// create new image
		var image = new Image();
		image.node = node;

		u.addClass(node, "loading");

		// regular attachevent returns to window object without any kind of reference to image
		// this is the only way to keep it selfcontained
		image.onload = function() {
	//		u.bug("image onload event");

			var event = new Object();
			event.target = this;

			u.rc(this.node, "loading");

			// notify base
			if(fun(this.node.loaded)) {
				this.node.loaded(event);
			}
		}

		image.src = src;
	}

}
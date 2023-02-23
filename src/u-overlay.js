﻿/**
* u.overlay
*
* Create overlay dialog window. Multiple overlays are automatically stacked.
*
* @param _options JSON object with options for overlay creation
*  - headline: Overlay headline
*  - drag: Enable or disable drag (default 'true')
*  - width: Overlay width in pixels (default 400)
*  - height: Overlay height in pixels (default 400)
*  - update: Update sizing (for calculated sizing) 
*  - class: Additional classname to add to overlay 
*
* @return Node reference to overlay div
*
* EXAMPLE
* var overlay = u.overlay({
*	"headline":"I'm an overlay",
*	"width":500,
*	"height":300
* });
*/
u.overlay = function (_options) {

	var title = "Overlay";
	var drag = true;
	var width = 400;
	var height = 400;
	var content_scroll = false;
	var classname = "";


	// Apply parameters
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "title"            : title             = _options[_argument]; break;
				case "drag"             : drag              = _options[_argument]; break;

				case "class"            : classname         = _options[_argument]; break;

				case "width"            : width             = _options[_argument]; break;
				case "height"           : height            = _options[_argument]; break;
				case "content_scroll"   : content_scroll    = _options[_argument]; break;
			}
		}
	}

	// allow for different label+input sizes for small overlays
	if (width > 500) {
		classname = " large " + classname;
	}
	else {
		classname = " small " + classname;
	}
	
	// Enable overflow:scroll on overlay.div_content
	if(content_scroll) {
		classname += "content_scroll"
	}


	// Create overlay div (with tabindex -1 to make div focusable for keyevents)
	var overlay = u.ae(document.body, "div", {
		"class": "overlay" + classname, 
		"tabindex": "-1"
	});

	// Add overlay "protection" div to cover the main page
	overlay.protection = u.ae(document.body, "div", {
		"class": "overlay_protection"
	});


	// Set width and height and center on screen
	u.ass(overlay, {
		"opacity": 0,
		"width": width + "px",
		"height": height + "px",
		"left": ((u.browserW() - width) / 2) + "px",
		"top": ((u.browserH() - height) / 2) + "px",
	});


	// Add width and height
	overlay.w = width;
	overlay.h = height;


	// handle multiple overlay stacked correctly (last opened on top)
	// apply overlay stack (only relevant for succeeding overlays)
	if (window._overlay_stack_index) {
		u.ass(overlay.protection, { "z-index": window._overlay_stack_index});
		u.ass(overlay, { "z-index": window._overlay_stack_index + 1 });
	}

	// update overlay stack
	window._overlay_stack_index = Number(u.gcs(overlay, "z-index")) + 2;


	// Prevent body scroll
	u.as(document.body, "overflow", "hidden");


	// Resize handler
	overlay._resized = function (event) {
		// u.bug("overlay.resized")


		// reposition overlay on screen
		u.ass(this, {
			"left": ((u.browserW() - this.w) / 2) + "px",
			"top": ((u.browserH() - this.h) / 2) + "px",
		});


		// set height of options div
		u.ass(this.div_content, {
			"height": ((this.offsetHeight - this.div_header.offsetHeight) - this.div_footer.offsetHeight - parseInt(u.gcs(this, "border-bottom")) - parseInt(u.gcs(this, "border-top"))) + "px"
			// "height": ((this.offsetHeight - this.div_header.offsetHeight) - this.div_footer.offsetHeight) + "px"
		});


		if(fun(this.resized)) {
			this.resized(event);
		}

	}
	// add resize event listener
	u.e.addWindowEvent(overlay, "resize", overlay._resized);



	// Add main overlay elements - header, options (content) and actions (footer)
	// Add header
	overlay.div_header = u.ae(overlay, "div", {class:"header"});
	if(title) {
		overlay.div_header.h2 = u.ae(overlay.div_header, "h2", {html: title});
		overlay.div_header.overlay = overlay;
	}

	// Add content div to overlay (called options because content is reserved word)
	overlay.div_content = u.ae(overlay, "div", {class: "content"});
	overlay.div_content.overlay = overlay;

	// Add ul.actions (footer)
	overlay.div_footer = u.ae(overlay, "div", {class: "footer"});
	overlay.div_footer.overlay = overlay;


	// make overlay header draggable
	if (drag) {
		u.e.drag(overlay.div_header, overlay.div_header);
		overlay._x = 0;
		overlay._y = 0;
		overlay.div_header.moved = function (event) {
			var new_x = this.overlay._x + this.current_x;
			var new_y = this.overlay._y + this.current_y;
			u.ass(this.overlay, {
				"transform": "translate(" + new_x + "px, " + new_y + "px)",
			});
		}
		overlay.div_header.dropped = function (event) {
			this.overlay._x += this.current_x;
			this.overlay._y += this.current_y;
		}
	}



	// Close overlay and make callback to overlay.closed
	overlay.close = function (event) {


		// restore original state
		u.as(document.body, "overflow", "auto");
		document.body.removeChild(this);
		document.body.removeChild(this.protection);

		// callback to invoker to notify about closing
		if(fun(this.closed)) {
			this.closed(event);
		}

	}


	// Add cancel and close buttons (always part of overlay UI)

	// Add "x"-close button to header
	overlay.x_close = u.ae(overlay.div_header, "div", {class: "close"});
	overlay.x_close.overlay = overlay;
	u.ce(overlay.x_close);

	// enable close/cancel buttons to close overlay
	overlay.x_close.clicked = function (event) {
		this.overlay.close(event);
	}

	overlay._resized();


	// Fade up
	u.ass(overlay, {
		"transition": "opacity .4s ease-in-out .1s",
		"opacity": 1,
	});


	// return overlay
	return overlay;
}

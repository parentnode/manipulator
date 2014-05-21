// Get the actual width of an element - offsetWidth includes borders and padding
// older IE might return auto if width is not set specifically
Util.actualWidth = u.actualW = function(node) {
	var width = parseInt(u.gcs(node, "width"));
	if(isNaN(width) || u.browser("opera", "<=9")) {
		return node.offsetWidth - parseInt(u.gcs(node, "padding-left")) - parseInt(u.gcs(node, "padding-right"));
	}
	else {
		return width;
	}
}

// Get the actual height of an element - offsetHeight includes borders and padding
// older IE might return auto if height is not set specifically
Util.actualHeight = u.actualH = function(node) {
	var height = parseInt(u.gcs(node, "height"));
	if(isNaN(height) || u.browser("opera", "<=9")) {
		return node.offsetHeight - parseInt(u.gcs(node, "padding-top")) - parseInt(u.gcs(node, "padding-bottom"));
	}
	else {
		return height;
	}
}



// Get the X coordinate of an event - AKA mouse X coordinate
Util.eventX = function(event){
	if(event.targetTouches) {
		return event.targetTouches[0].pageX;
	}
	else if(event.pageX != undefined) {
		return event.pageX;
	}
	// older IE, value does not exist alone
	else if(event.clientX != undefined) {
		return event.clientX + document.documentElement.scrollLeft;
	}
	else {
		return 0;
	}
}

// Get the Y coordinate of an event - AKA mouse Y coordinate
Util.eventY = function(event){
	if(event.targetTouches) {
		return event.targetTouches[0].pageY;
	}
	else if(event.pageY != undefined) {
		return event.pageY;
	}
	// older IE, value does not exist alone
	else if(event.clientY != undefined) {
		return event.clientY + document.documentElement.scrollTop;
	}
	else {
		return 0;
	}
}


Util.pageScrollX = u.scrollX = function() {
	if(window.pageXOffset != undefined) {
		return window.pageXOffset;
	}
	else if(document.documentElement.scrollLeft != undefined) {
		return document.documentElement.scrollLeft;
	}
	else {
		return 0;
	}
}
// Get browser viewable height - inside browser including body margin, excluding scrollbars
Util.pageScrollY = u.scrollY = function() {
	if(window.pageYOffset != undefined) {
		return window.pageYOffset;
	}
	else if(document.documentElement.scrollTop != undefined) {
		return document.documentElement.scrollTop;
	}
	else {
		return 0;
	}
}



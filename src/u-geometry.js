// Get absolute left position
// calculated from left side of browser window
Util.absoluteX = u.absX = function(node) {
	if(node.offsetParent) {
		return node.offsetLeft + u.absX(node.offsetParent);
	}
	return node.offsetLeft;
}

// Get absolute top position
// calculated from top of browser window
Util.absoluteY = u.absY = function(node) {
	if(node.offsetParent) {
		return node.offsetTop + u.absY(node.offsetParent);
	}
	return node.offsetTop;
}


// Get relative left position
// calculated from first relative/absolute parentNode
Util.relativeX = u.relX = function(node) {

	// if node is not absolute and parent is not relative or absolute
	if(u.gcs(node, "position").match(/absolute/) == null && node.offsetParent && u.gcs(node.offsetParent, "position").match(/relative|absolute|fixed/) == null) {
		// continue upwards in dom
		return node.offsetLeft + u.relX(node.offsetParent);
	}
	return node.offsetLeft;
}

// Get relative top position
// calculated from first relative/absolute parentNode
Util.relativeY = u.relY = function(node) {

	// if node is not absolute and parent is not relative or absolute
	if(u.gcs(node, "position").match(/absolute/) == null && node.offsetParent && u.gcs(node.offsetParent, "position").match(/relative|absolute|fixed/) == null) {
		return node.offsetTop + u.relY(node.offsetParent);
	}
	return node.offsetTop;
}




// Get the actual width of an element - offsetWidth includes borders and padding
Util.actualWidth = u.actualW = function(node) {
	return parseInt(u.gcs(node, "width"));
}
// Get the actual height of an element - offsetHeight includes borders and padding
Util.actualHeight = u.actualH = function(node) {
	return parseInt(u.gcs(node, "height"));
}


// Get the X coordinate of an event - AKA mouse X coordinate
Util.eventX = function(event){
	return (event.targetTouches && event.targetTouches.length ? event.targetTouches[0].pageX : event.pageX);
}
// Get the Y coordinate of an event - AKA mouse Y coordinate
Util.eventY = function(event){
	return (event.targetTouches && event.targetTouches.length ? event.targetTouches[0].pageY : event.pageY);
}


// Get browser viewable width - inside browser including body margin, excluding scrollbars
Util.browserWidth = u.browserW = function() {
	return document.documentElement.clientWidth;
}
// Get browser viewable height - inside browser including body margin, excluding scrollbars
Util.browserHeight = u.browserH = function() {
	return document.documentElement.clientHeight;
}


// Get document.body width
Util.htmlWidth = u.htmlW = function() {
	return document.body.offsetWidth + parseInt(u.gcs(document.body, "margin-left")) + parseInt(u.gcs(document.body, "margin-right"));
}
// Get browser viewable height - inside browser including body margin, excluding scrollbars
Util.htmlHeight = u.htmlH = function() {
	return document.body.offsetHeight + parseInt(u.gcs(document.body, "margin-top")) + parseInt(u.gcs(document.body, "margin-bottom"));
}


// scroll offset
Util.pageScrollX = u.scrollX = function() {
	return window.pageXOffset;
}
// Get browser viewable height - inside browser including body margin, excluding scrollbars
Util.pageScrollY = u.scrollY = function() {
	return window.pageYOffset;
}


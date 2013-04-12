// Get absolute left position
// calculated from left side of browser window
Util.absoluteX = u.absX = function(e) {
	if(e.offsetParent) {
		return e.offsetLeft + u.absX(e.offsetParent);
	}
	return e.offsetLeft;
}

// Get absolute top position
// calculated from top of browser window
Util.absoluteY = u.absY = function(e) {
	if(e.offsetParent) {
		return e.offsetTop + u.absY(e.offsetParent);
	}
	return e.offsetTop;
}

// relative offset left position
// calculates the relative offset of e(lement)
// Explanation: If an element is within a relative/absolute positioned parentNode, its internal positioning 
//              must be calculated from the relative/absolute parentNode. When translating mouse-coordinates
//              the relative offset needs to be subtracted from mouse coordinate. This function returns the
//              correction value.
Util.relativeOffsetX = u.relOffsetX = function(e) {
	if(e.offsetParent && u.gcs(e.offsetParent, "position").match(/relative|absoute/) != null) {
//		return e.offsetLeft + u.relOffsetX(e.offsetParent);
		return u.absX(e.offsetParent); // - e.offsetLeft u.relOffsetX(e.offsetParent);
	}
	return 0; //u.absX(e) - e.offsetLeft;
}

// relative offset top position
// calculates the relative top offset of e(lement)
// Explanation: If an element is within a relative/absolute positioned parentNode, its internal positioning 
//              must be calculated from the relative/absolute parentNode. When translating mouse-coordinates
//              the relative offset needs to be subtracted from mouse coordinate before applying it to element.
//              This function returns the correction value.
Util.relativeOffsetY = u.relOffsetY = function(e) {
	if(e.offsetParent && u.gcs(e.offsetParent, "position").match(/relative|absoute/) != null) {
		return u.absY(e.offsetParent);
//		return e.offsetTop - u.relOffsetY(e.offsetParent);
	}
//	u.bug("return:" + u.absY(e) +"-"+ e.offsetTop)
	return 0; // u.absY(e) - e.offsetTop;
}

// Get the actual width of an element - offsetWidth includes borders and padding
Util.actualWidth = function(e) {
	return parseInt(u.gcs(e, "width"));
//	return e.offsetWidth - (parseInt(u.gcs(e, "padding-left")) + parseInt(u.gcs(e, "padding-right")) + parseInt(u.gcs(e, "border-left-width")) + parseInt(u.gcs(e, "border-right-width")));
}

// Get the actual height of an element - offsetHeight includes borders and padding
Util.actualHeight = function(e) {
	return parseInt(u.gcs(e, "height"));
//	return e.offsetHeight - (parseInt(u.gcs(e, "padding-top")) + parseInt(u.gcs(e, "padding-bottom")) + parseInt(u.gcs(e, "border-top-width")) + parseInt(u.gcs(e, "border-bottom-width")));
}

// Get the X coordinate of an event - AKA mouse X coordinate
Util.eventX = function(event){
	return (event.targetTouches ? event.targetTouches[0].pageX : event.pageX);
}
// Get the Y coordinate of an event - AKA mouse Y coordinate
Util.eventY = function(event){
	return (event.targetTouches ? event.targetTouches[0].pageY : event.pageY);
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
	return document.documentElement.offsetWidth;
}
// Get browser viewable height - inside browser including body margin, excluding scrollbars
Util.htmlHeight = u.htmlH = function() {
	return document.documentElement.offsetHeight;
}
Util.pageScrollX = u.scrollX = function() {
	return window.pageXOffset;
}
// Get browser viewable height - inside browser including body margin, excluding scrollbars
Util.pageScrollY = u.scrollY = function() {
	return window.pageYOffset;
}


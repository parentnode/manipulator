// Get absolute left position
Util.absLeft = function(e) {
	if(e.offsetParent) {
		return e.offsetLeft + Util.absLeft(e.offsetParent);
	}
	return e.offsetLeft;
} 
// Get absolute top position
Util.absTop = function(e) {
	if(e.offsetParent) {
		return e.offsetTop + Util.absTop(e.offsetParent);
	}
	return e.offsetTop;
}

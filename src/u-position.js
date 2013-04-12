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


Util.eventX = function(event){
	
	return (event.targetTouches ? event.targetTouches[0].pageX : event.pageX);
}
Util.eventY = function(event){

	return (event.targetTouches ? event.targetTouches[0].pageY : event.pageY);
}

/*
Util.relEventX = function(event){
	
	return (event.targetTouches ? event.targetTouches[0].layerX : event.layerX);
}
Util.relEventY = function(event){

	return (event.targetTouches ? event.targetTouches[0].layerY : event.layerY);
}
*/

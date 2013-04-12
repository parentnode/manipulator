// Make element unselectable
Util.unSelectify = function(e) {
	e.onmousedown = function() {return false;}
}

// Make element selectable
Util.selectify = function(e) {
	e.onmousedown = function() {return true;}
}

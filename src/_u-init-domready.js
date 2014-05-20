if(!u.o) {
	Util.Objects = u.o = new Object();
}

Util.init = function(scope) {

	var i, e, elements, ij_value;
	scope = scope && scope.nodeName ? scope : document;

	elements = u.ges("i\:([_a-zA-Z0-9])+", scope);

	for(i = 0; e = elements[i]; i++) {
		while((ij_value = u.getIJ(e, "i"))) {
//			u.bug("init:" + ij_value)
			u.removeClass(e, "i:"+ij_value);
			if(ij_value && typeof(u.o[ij_value]) == "object") {
				u.o[ij_value].init(e);
			}
		}
	}
}


if(document.addEventListener) {
	document.addEventListener("DOMContentLoaded", 
		function() {
			document.removeEventListener("DOMContentLoaded", arguments.callee, false);
			u.init();
    	}
	, false);
}
else if (document.attachEvent) {
	document.attachEvent("onreadystatechange", 
		function() {
			if(document.readyState === "complete") {
				document.detachEvent("onreadystatechange", arguments.callee);
				u.init();
			}
		}
	);
}
else {
	u.e.addEvent(window, "load", u.init);
}

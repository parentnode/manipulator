u.e.addDomReady = function(node, action) {
	
	if(document.addEventListener) {
		document.addEventListener("DOMContentLoaded", 
			function(event) {
				document.removeEventListener("DOMContentLoaded", arguments.callee, false);
				u.o.page.init(u.qs("#page"), event);
	    	}
		, false);
	}
	else if (document.attachEvent) {
		document.attachEvent("onreadystatechange", 
			function(event) {
				if(document.readyState === "complete") {
					document.detachEvent("onreadystatechange", arguments.callee);
					u.o.page.init(u.qs("#page"), event);
				}
			}
		);
	}
	else {
		u.e.addEvent(window, "load", function(event) {u.o.page.init(u.qs("#page"), event);})
	}

}

u.e.addBodyLoad = function(node, action) {

	
}
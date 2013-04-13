// no pageXOffset/pageYOffset in IE8
if(window.pageXOffset == undefined && Object.defineProperty) {
	Object.defineProperty(window, "pageXOffset",
		{get: function() {
			return document.documentElement.scrollLeft;
			}
		}
	);
}
if(window.pageYOffset == undefined && Object.defineProperty) {
	Object.defineProperty(window, "pageYOffset",
		{get: function() {
//			u.bug("get:" + document.body.scrollTop + ":" + document.documentElement.scrollTop)
			return document.documentElement.scrollTop;
			}
		}
	);
}

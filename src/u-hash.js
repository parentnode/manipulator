Util.Hash = u.h = new function() {

	this.catchEvent = function(callback, node) {
	
//		u.bug("catch hash")
	
		this.node = node;
		this.node.callback = callback;

		// invoke capture function
		hashChanged = function(event) {
//			u.bug("changed")
			u.h.node.callback();
		}


//		var s = "";
//		for(x in window) {
//			s += x + "=" + window[x]+ "<br>";
//		}
//		u.bug(s)

		// onhashchange support
//		u.bug("hash change support?" + ("onhashchange" in window) +";"+ (window.onhashchange))


		// TODO: temp fix in plane - IE7 does not work

		if("onhashchange" in window && !u.browser("explorer", "<=7")) {
//			u.bug("change")
//			u.e.addEvent(window, "hashchange", function() {alert("fisk")});
//			window.onhashchange = function() {alert("fisk")}
//			window.hashchanged = hashChanged;
			window.onhashchange = hashChanged;
		}
		else {
			u.current_hash = window.location.hash;
			window.onhashchange = hashChanged;
			setInterval(
				function() {
//					u.bug("check hash")
					if(window.location.hash !== u.current_hash) {
						u.current_hash = window.location.hash;
						window.onhashchange();
					}
				}, 200
			);
		}
	}

	// old method
	// basic hash cleaner
	this.cleanHash = function(string, levels) {
		if(!levels) {
			return string.replace(location.protocol+"//"+document.domain, "");
		}
		else {
			var i, return_string = "";
			var hash = string.replace(location.protocol+"//"+document.domain, "").split("/");
			// url always starts with / so first index is empty
			for(i = 1; i <= levels; i++) {
				return_string += "/" + hash[i];
			}
			return return_string;
		}
	}


	// HASH thoughts



	// NEW method
	// basic url cleaner
	// this function is removing domain from given url, and returning local path for use as hash value

	// this function should remove any hash value from url

	this.getCleanUrl = function(string, levels) {
//		u.bug("getCleanUrl:" + string + " = " + (string ? string.replace(location.protocol+"//"+document.domain, "").match(/[^#$]+/) : "#error#") + ", " + arguments.callee.caller);

		// remove hash and domain from string before
		string = string.replace(location.protocol+"//"+document.domain, "").match(/[^#$]+/)[0];

		if(!levels) {
			return string;
		}
		else {
			var i, return_string = "";
			var hash = string.split("/");

			// correct levels (if hash is shorter than required)
			levels = levels > hash.length-1 ? hash.length-1 : levels;

			// url always starts with / so first index is empty
			for(i = 1; i <= levels; i++) {
				return_string += "/" + hash[i];
			}
			return return_string;
		}
	}

	// basic hash cleaner
	// receives location.hash
	this.getCleanHash = function(string, levels) {
		// remove hash from string before
		string = string.replace("#", "");
		if(!levels) {
			return string;
		}
		else {
			var i, return_string = "";
			var hash = string.split("/");

			// correct levels (if hash is shorter than required)
			levels = levels > hash.length-1 ? hash.length-1 : levels;

			// url always starts with / so first index is empty
			for(i = 1; i <= levels; i++) {
				return_string += "/" + hash[i];
			}
			return return_string;
		}
	}
}

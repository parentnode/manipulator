Util.History = u.h = new function() {

	this.popstate = ("onpopstate" in window);
//	this.popstate = u.browser("firefox") ? false : true;

	this.catchEvent = function(node, _options) {


		node.callback_urlchange = "navigate";

		// additional info passed to function as JSON object
		if(typeof(_options) == "object") {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "callback"		: node.callback_urlchange		= _options[argument]; break;
				}

			}
		}


		this.node = node;


		// invoke capture function
		var hashChanged = function(event) {

			// no url or invalid path
			// update hash, triggering new _navigate request
			if(!location.hash || !location.hash.match(/^#\//)) {
				location.hash = "#/"
				return;
			}

			var url = u.h.getCleanHash(location.hash);
//			u.bug("hash changed:" + url)

			// notify of url change
			if(typeof(u.h.node[u.h.node.callback_urlchange]) == "function") {
				u.h.node[u.h.node.callback_urlchange](url);
			}
		}

		var urlChanged = function(event) {

			u.bug_force = true;
			u.bug_console_only = false;

			var url = u.h.getCleanUrl(location.href);
//			u.bug("popstate changed:" + url + ", " + event.state)
//			u.xInObject(event);

			// Broken Safari triggers popstate event on load
			// 
			// On first load on new browser window/tab (not on refresh), Chrome has no event.state for back-button
			// Safari does not have event.path - so I detect the first flawed popstate event in Safari 
			// by checking for event.state and event.path
			if(event.state || (!event.state && event.path)) {

				// notify of url change
				if(typeof(u.h.node[u.h.node.callback_urlchange]) == "function") {
					u.h.node[u.h.node.callback_urlchange](url);
				}

			}
			// replace non-state, to enable back linking in Safari
			else {
				history.replaceState({}, url, url);
			}
		}


		// popstate support
		if(this.popstate) {
			window.onpopstate = urlChanged;
		}
		// hash change support
		else if("onhashchange" in window && !u.browser("explorer", "<=7")) {
			window.onhashchange = hashChanged;
		}
		// old school timerbased
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



	// NEW method
	// basic url cleaner
	// this function is removing domain from given url, and returning local path for use as hash value

	// this function should remove any hash value from url
	// receives location.href
	this.getCleanUrl = function(string, levels) {
//		u.bug("getCleanUrl:" + string + " = " + (string ? string.replace(location.protocol+"//"+document.domain, "").match(/[^#$]+/) : "#error#"));

		// remove hash and domain from string before
		string = string.replace(location.protocol+"//"+document.domain, "").match(/[^#$]+/)[0];

		if(!levels) {
			return string;
		}
		else {
			var i, return_string = "";
			var path = string.split("/");

			// correct levels (if path is shorter than required)
			levels = levels > path.length-1 ? path.length-1 : levels;

			// url always starts with / so first index is empty
			for(i = 1; i <= levels; i++) {
				return_string += "/" + path[i];
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

	// resolve current url, check for hash value and then plain url
	this.resolveCurrentUrl = function() {

		return !location.hash ? this.getCleanUrl(location.href) : this.getCleanHash(location.hash);
//		return this.popstate && !location.hash ? this.getCleanUrl(location.href) : this.getCleanHash(location.hash);

	}
}

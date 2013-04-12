Util.Hash = u.h = new function() {

	this.catchEvent = function(callback, node) {
	
		this.node = node;
		this.node.callback = callback;

		// invoke capture function
		hashChanged = function(event) {
			u.h.node.callback();
		}

		// onhashchange support
		if("onhashchange" in window) {
			window.onhashchange = hashChanged;
		}
		else {
			u.current_hash = window.location.hash;
			window.onhashchange = hashChanged;
			setInterval(
				function() {
					if(window.location.hash !== u.current_hash) {
						u.current_hash = window.location.hash;
						window.onhashchange();
					}
				}, 200
			);
		}
	}

	// basic hash cleaner
	this.cleanHash = function(string) {
		return string.replace(location.protocol+"//"+document.domain, "");
	}
}

Util.History = u.h = new function() {

	this.popstate = ("onpopstate" in window);
//	this.popstate = false;

	this.callbacks = [];
	this.is_listening = false;


	// create central navigate function
	// update hash/url
	this.navigate = function(url, node, silent) {
		// u.bug("u.h.navigate:" + url, node);

		silent = silent || false;

		// Don't navigate external links
		if((!url.match(/^http[s]?\:\/\//) || url.match(document.domain)) && (!node || !node._a || !node._a.target)) {
			// popstate handling
			if(this.popstate) {
				history.pushState({}, url, url);
				if(!silent) {
					this.callback(url);
				}
			}
			// hash handling
			else {
				if(silent) {
					this.next_hash_is_silent = true;
				}
				location.hash = u.h.getCleanUrl(url);
			}
		}
		else {
			if(!node || !node._a || !node._a.target) {
				location.href = url;
			}
			else {
				window.open(this.url);
			}
		}

	}

	// make callbacks to registered listeners
	this.callback = function(url) {
//		u.bug("callbacks invoked:" + url + " (" + this.callbacks.length + ")")

		var i, recipient;
		for(i = 0; i < this.callbacks.length; i++) {
			recipient = this.callbacks[i];

			if(fun(recipient.node[recipient.callback])) {
				// u.bug("callback: ", recipient.node, recipient.callback);
				recipient.node[recipient.callback](url);
			}
		}
	}

	// remove listener
	this.removeEvent = function(node, _options) {

		// default callback 
		var callback_urlchange = "navigate";

		// additional info passed to function as JSON object
		if(obj(_options)) {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "callback"		: callback_urlchange		= _options[argument]; break;
				}

			}
		}

		// find matching callback and remove it
		var i, recipient;
		for(i = 0; recipient = this.callbacks[i]; i++) {
			if(recipient.node == node && recipient.callback == callback_urlchange) {
				this.callbacks.splice(i, 1);
				break;
			}
		}

	}

	// add event listener for urlchange/hashchange
	this.addEvent = function(node, _options) {

		// default callback 
		var callback_urlchange = "navigate";

		// additional info passed to function as JSON object
		if(obj(_options)) {
			var argument;
			for(argument in _options) {

				switch(argument) {
					case "callback"		: callback_urlchange		= _options[argument]; break;
				}

			}
		}


		// only start listning for events once
		if(!this.is_listening) {
			this.is_listening = true;

//			u.bug("start to listen for changes")

			// popstate support
			if(this.popstate) {

				u.e.addEvent(window, "popstate", this._urlChanged);
			}
			// hash change support
			else if("onhashchange" in window && !u.browser("explorer", "<=7")) {
				u.e.addEvent(window, "hashchange", this._hashChanged);
			}
			// old school timerbased
			else {
				u.h._current_hash = window.location.hash;
				window.onhashchange = this._hashChanged;
				setInterval(
					function() {
						if(window.location.hash !== u.h._current_hash) {
							u.h._current_hash = window.location.hash;
							window.onhashchange();
						}
					}, 200
				);
			}

		}

//		u.bug("add urlchange callback: ", node, " callback:", callback_urlchange)

		// add node and callback to callback stack
		this.callbacks.push({"node":node, "callback":callback_urlchange});


	}


	// popstate event handler
	this._urlChanged = function(event) {

		var url = u.h.getCleanUrl(location.href);
		// u.bug("popstate changed:" + url + ", " + event.state, event)

		// Broken Safari triggers popstate event on load
		// 
		// On first load on new browser window/tab (not on refresh), Chrome has no event.state for back-button
		// Safari does not have event.path - so I detect the first flawed popstate event in Safari 
		// by checking for event.state and event.path
		if(event.state || (!event.state && event.path)) {

			// invoke callbacks to stack
			u.h.callback(url);
		}
		// replace non-state, to enable back linking in Safari
		else {
			history.replaceState({}, url, url);
		}
	}


	// hashchange event handler
	this._hashChanged = function(event) {

		// no url or invalid path
		// update hash, triggering new _navigate request
		if(!location.hash || !location.hash.match(/^#\//)) {
			location.hash = "#/"
			return;
		}

		var url = u.h.getCleanHash(location.hash);
//		u.bug("hash changed:" + url)

		if(u.h.next_hash_is_silent) {
			delete u.h.next_hash_is_silent;
		}
		else {
			// invoke callbacks to stack
			u.h.callback(url);
		}
	}




	// temporary history experiment
	// TODO: implement some history storage
	this.trail = [];

	this.addToTrail = function(url, node) {
		this.trail.push({"url":url, "node":node});
	}




	// NEW method
	// basic url cleaner
	// this function is removing domain from given url, and returning local path for use as hash value

	// this function should remove any hash value from url
	// receives location.href
	this.getCleanUrl = function(string, levels) {
//		u.bug("getCleanUrl:" + string + " = " + (string ? string.replace(location.protocol+"//"+document.domain, "").match(/[^#$]+/) : "#error#"));

		// remove hash and domain from string before
		string = string.replace(location.protocol+"//"+document.domain, "") ? string.replace(location.protocol+"//"+document.domain, "").match(/[^#$]+/)[0] : "/";

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


	// Unknown purpose?
	// resolve current url, check for hash value and then plain url
	this.resolveCurrentUrl = function() {

		return !location.hash ? this.getCleanUrl(location.href) : this.getCleanHash(location.hash);
//		return this.popstate && !location.hash ? this.getCleanUrl(location.href) : this.getCleanHash(location.hash);

	}
}


// Enable ajax based navigation

// flow

// click internal link
// updates hash/History object
// hash envokes navigate
// if 1st level is changed tells #content navigation has been invoked 
// if 2nd level is changed tells .scene navigation has been invoked 

u.navigation = function(_options) {

	// define default values
	var callback_navigate = "navigate";
	var navigation_node = page;


	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var argument;
		for(argument in _options) {

			switch(argument) {
				case "callback"       : callback_navigate      = _options[argument]; break;
				case "node"           : navigation_node        = _options[argument]; break;
			}

		}
	}


	// default starting path
	navigation_node._nav_path = navigation_node._nav_path ? navigation_node._nav_path : u.h.getCleanUrl(location.href, 1);
	navigation_node._nav_history = navigation_node._nav_history ? navigation_node._nav_history : [];


	// internal hash change distribution - content or scene level
	navigation_node._navigate = function(url) {
//		u.bug("navigation_node._navigate:" + url)

		url = u.h.getCleanUrl(url);

		navigation_node._nav_history.unshift(url);

		// stats
		// TODO: this.hash_node add to stats
		u.stats.pageView(url);


		// direct navigation callback to correct level
		// first request or new base-level
		if(!this._nav_path || ((this._nav_path != u.h.getCleanHash(location.hash, 1) && !u.h.popstate) || (this._nav_path != u.h.getCleanUrl(location.href, 1) && u.h.popstate))) {

//			u.bug("base cN:" + url)

			// forward navigation event to #content
			if(this.cN && typeof(this.cN.navigate) == "function") {
				this.cN.navigate(url);
			}

		}
		else {

//			u.bug("base decide:" + url + ", " + (this.cN.scene ? u.nodeId(this.cN.scene) : this.cN.scene))

			// forward navigation event to .scene if it has navigate function
			if(this.cN.scene && this.cN.scene.parentNode && typeof(this.cN.scene.navigate) == "function") {
				this.cN.scene.navigate(url);
			}
			// else forward to content
			else if(this.cN && typeof(this.cN.navigate) == "function") {
				this.cN.navigate(url);
			}

		}

		if(!u.h.popstate) {
			// remember base-level
			this._nav_path = u.h.getCleanHash(location.hash, 1);
		}
		else {
			this._nav_path = u.h.getCleanUrl(location.href, 1);
		}
	}

	// update hash and set hash back node if any
	navigation_node.navigate = function(url, node) {
//		u.bug("navigation_node.navigate:" + url + ", " + (node ? u.nodeId(node) : "no node"))

		// remember history node (for tracking purposes)
		this.history_node = node ? node : false;

		// popstate handling
		if(u.h.popstate) {
			history.pushState({}, url, url);
			navigation_node._navigate(url);
		}
		// hash handling
		else {
			location.hash = u.h.getCleanUrl(url);
		}

	}


	// sharing via social media (linkedin) might add hashbang
	// remove invalid hash value
	if(location.hash.length && location.hash.match(/^#!/)) {
		location.hash = location.hash.replace(/!/, "");
	}

	// If HASH navigation is preferred - reading initial state from URL

	// set default hash if no hash value is present ()
	// no further navigation - initialize content
	if(!u.h.popstate) {

		if(location.hash.length < 2) {
//			u.bug("set hash + init content")

			// update hash
			navigation_node.navigate(location.href, page);
			// update internal value, so navigation doesn't mess up
			navigation_node._nav_path = u.h.getCleanUrl(location.href);
			// init content
			u.init(navigation_node.cN);
		}
		// if different hash and url, hash value starts with /
		// load content based on hash
		else if(u.h.getCleanHash(location.hash) != u.h.getCleanUrl(location.href) && location.hash.match(/^#\//)) {
//			u.bug("init navigate:" + u.h.getCleanHash(location.hash) + "!=" + u.h.getCleanUrl(location.href) + "; ")

			// update internal value, so navigation doesn't mess up
			navigation_node._nav_path = u.h.getCleanUrl(location.href);
			// manually invoke navigation to load correct page
			navigation_node._navigate(u.h.getCleanHash(location.hash), page);
		}
		// hash and url is aligned, or unusable value
		// init existing content
		else {
//			u.bug("init content")

			// just go for it
			u.init(navigation_node.cN);
		}

	}
	// History Object is preferred
	else {
//		u.bug("history")

		// if HASH exists and different from url, translate to url (could be a bookmark shared from HASH enabled browser)
		if(u.h.getCleanHash(location.hash) != u.h.getCleanUrl(location.href) && location.hash.match(/^#\//)) {

			// update internal value, so navigation doesn't mess up
			navigation_node._nav_path = u.h.getCleanHash(location.hash);

			// update hash
			navigation_node.navigate(u.h.getCleanHash(location.hash), page);

		}
		// everything is ready for go
		else {

			// just go for it
			u.init(navigation_node.cN);
		}
	}


	navigation_node._initHistory = function() {
//		u.bug("enable HASH navigation")

		u.h.catchEvent(page, {"callback":"_navigate"});
	}

	// set hash event handler with small delay to avoid redirecting when actually just trying to update HASH
	u.t.setTimer(page, navigation_node._initHistory, 100);


	// TODO: enable crossbrowser history

	navigation_node.historyBack = function() {
		if(this._nav_history.length > 1) {
			this._nav_history.shift();
			return this._nav_history.shift();
		}
		else {
			return "/";
		}
	}
}

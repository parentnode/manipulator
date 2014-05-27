
// Enable ajax based navigation

// flow

// click internal link
// updates hash/History object
// hash envokes navigate
// if 1st level is changed tells #content navigation has been invoked 
// if 2nd level is changed tells .scene navigation has been invoked 

u.navigation = function(options) {

//	u.bug("set up navigation")

	// this._nav_navigate_callback = null;
	// 
	// // additional info passed to function as JSON object
	// if(typeof(options) == "object") {
	// 	var argument;
	// 	for(argument in options) {
	// 
	// 		switch(argument) {
	// 			case "navigate_callback"	: this._nav_navigate_callback		= options[argument]; break;
	// 		}
	// 
	// 	}
	// }

	// default starting path
	page._nav_path = page._nav_path ? page._nav_path : u.h.getCleanUrl(location.href);
	page._nav_history = page._nav_history ? page._nav_history : [];


	// internal hash change distribution - content or scene level
	page._navigate = function(url) {

		url = u.h.getCleanUrl(url);

		page._nav_history.unshift(url);

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
	page.navigate = function(url, node) {
//		u.bug("url:" + url + ", " + u.nodeId(node))

		// remember history node (for tracking purposes)
		this.history_node = node ? node : false;

		// popstate handling
		if(u.h.popstate) {
			history.pushState({}, url, url);
			page._navigate(url);
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
	//		u.bug("set hash + init content")

			// update hash
			page.navigate(location.href, page);
			// update internal value, so navigation doesn't mess up
			page._nav_path = u.h.getCleanUrl(location.href);
			// init content
			u.init(page.cN);
		}
		// if different hash and url, hash value starts with /
		// load content based on hash
		else if(u.h.getCleanHash(location.hash) != u.h.getCleanUrl(location.href) && location.hash.match(/^#\//)) {
	//		u.bug("init navigate:" + u.h.getCleanHash(location.hash) + "!=" + u.h.getCleanUrl(location.href) + "; ")

			// update internal value, so navigation doesn't mess up
			page._nav_path = u.h.getCleanUrl(location.href);
			// manually invoke navigation to load correct page
			page._navigate();
		}
		// hash and url is aligned, or unusable value
		// init existing content
		else {
	//		u.bug("init content")

			// just go for it
			u.init(page.cN);
		}

	}
	// History Object is preferred
	else {

		// if HASH exists and different from url, translate to url (could be a bookmark shared from HASH enabled browser)
		if(u.h.getCleanHash(location.hash) != u.h.getCleanUrl(location.href) && location.hash.match(/^#\//)) {

			// update internal value, so navigation doesn't mess up
			page._nav_path = u.h.getCleanHash(location.hash);

			// update hash
			page.navigate(u.h.getCleanHash(location.hash), page);

		}
		// everything is ready for go
		else {

			// just go for it
			u.init(page.cN);
		}
	}


	page._initHistory = function() {
//		u.bug("enable HASH navigation")

		u.h.catchEvent(page, page._navigate);
	}

	// set hash event handler with small delay to avoid redirecting when actually just trying to update HASH
	u.t.setTimer(page, page._initHistory, 100);


	// TODO: enable crossbrowser history

	page.historyBack = function() {
		if(this._nav_history.length > 1) {
			this._nav_history.shift();
			return this._nav_history.shift();
		}
		else {
			return "/";
		}
	}
}

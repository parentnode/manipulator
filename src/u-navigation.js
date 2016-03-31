
// Enable ajax based navigation for Manipulator page model based websites

// if 1st level is changed tells #content navigation has been invoked 
// if 2nd level is changed tells .scene navigation has been invoked 

u.navigation = function(_options) {


	// define default values
	var navigation_node = page;
	var callback_navigate = "_navigate";
	var initialization_scope = page.cN;


	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var argument;
		for(argument in _options) {

			switch(argument) {
				case "callback"       : callback_navigate           = _options[argument]; break;
				case "node"           : navigation_node             = _options[argument]; break;
				case "scope"          : initialization_scope        = _options[argument]; break;
			}

		}
	}


//	u.bug("apply navigation:" + u.nodeId(navigation_node) + ", " + callback_navigate)


	// default starting path
	window._man_nav_path = window._man_nav_path ? window._man_nav_path : u.h.getCleanUrl(location.href, 1);


	// internal urlchange/hashchange distribution for navigation node
	// forwarding callback to appropriate node depending on url fragment change
	// #content or .scene level
	navigation_node._navigate = function(url) {
//		u.bug(u.nodeId(this)+"._navigate (u.navigation):" + url)

		url = u.h.getCleanUrl(url);


		// stats
		// TODO: this.hash_node add to stats (or extend tracking options in some way)
		u.stats.pageView(url);


		// direct navigation callback to correct level
		// first request or new base-level
		if(
			!window._man_nav_path || 
			(!u.h.popstate && window._man_nav_path != u.h.getCleanHash(location.hash, 1)) || 
			(u.h.popstate && window._man_nav_path != u.h.getCleanUrl(location.href, 1))
		) {

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
			window._man_nav_path = u.h.getCleanHash(location.hash, 1);
		}
		else {
			window._man_nav_path = u.h.getCleanUrl(location.href, 1);
		}
	}



	// sharing via social media (linkedin) might add hashbang
	// remove invalid hash value
	if(location.hash.length && location.hash.match(/^#!/)) {
		location.hash = location.hash.replace(/!/, "");
	}


	// perform callback after u.h initialization (because the url has been modified in legacy translation)
	var callback_after_init = false;


	// Legacy hash/url translation (for supporting shared links)
	if(!this.is_initialized) {
//		u.bug("legacy url/hash translation");

		this.is_initialized = true;


		// HASH navigation is preferred
		if(!u.h.popstate) {
//			u.bug("hashchange support")

			// set default hash if no hash value is present
			if(location.hash.length < 2) {
//				u.bug("set initial hash + init content")

				// update internal value, so navigation doesn't mess up
				window._man_nav_path = u.h.getCleanUrl(location.href);

				// update hash value to avoid triggering hashChange if clicking link with current url
				u.h.navigate(window._man_nav_path);

				// init content
				u.init(initialization_scope);
			}
			// if different hash and url and hash value starts with /
			// load content based on hash
			else if(location.hash.match(/^#\//) && u.h.getCleanHash(location.hash) != u.h.getCleanUrl(location.href)) {

//				u.bug("initial HASH value differs from url")
//				u.bug("init navigate:" + u.h.getCleanHash(location.hash) + "!=" + u.h.getCleanUrl(location.href) + "; ")


				// manually invoke navigation event to load correct page after initialization is done
				callback_after_init = u.h.getCleanHash(location.hash);

			}
			// hash and url is aligned, or unusable value
			// init existing content
			else {
//				u.bug("init content")

				// just go for it
				u.init(initialization_scope);
			}

		}
		// History Object is preferred
		else {
//			u.bug("popstate support")

//			u.h.addEvent(navigation_node, {"callback":callback_navigate});


			// if HASH exists and different from url, translate to url (could be a bookmark shared from HASH enabled browser)
			if(u.h.getCleanHash(location.hash) != u.h.getCleanUrl(location.href) && location.hash.match(/^#\//)) {
//				u.bug("existing hash detected")

				// update internal value, so navigation doesn't mess up
				window._man_nav_path = u.h.getCleanHash(location.hash);

				// update url
				u.h.navigate(window._man_nav_path);

				// manually invoke navigation event to load correct page after initialization is done
				callback_after_init = window._man_nav_path;

			}
			// everything is ready for go
			else {
//				u.bug("all good, init content");

				// just go for it
				u.init(initialization_scope);
			}
		}


		// start listening for events
		// set hash/popstate event handler with small delay to avoid redirecting when 
		// actually just trying to update initial url
		// some browsers (safari) catch hashchange though listerner is sat after update

		var random_string = u.randomString(8);

		// perform callback after initalization (url has been modified in legacy translation)
		if(callback_after_init) {
			eval('navigation_node._initNavigation_'+random_string+' = function() {u.h.addEvent(this, {"callback":"'+callback_navigate+'"});u.h.callback("'+callback_after_init+'");}');
		}
		// just add event
		else {
			eval('navigation_node._initNavigation_'+random_string+' = function() {u.h.addEvent(this, {"callback":"'+callback_navigate+'"});}');
		}
		u.t.setTimer(navigation_node, "_initNavigation_"+random_string, 100);



	}
	// just add to the callback stack, 
	// then it will be included in any callback invokation from legacy translation
	else {
//		u.bug("d add urlchange callback: " + u.nodeId(navigation_node) + ", callback:" + callback_navigate)

		u.h.callbacks.push({"node":navigation_node, "callback":callback_navigate});
	}

}

// Only handles js and css so far

var ManipulatorLoader = function (node, url) {

	var include_tag;

	if (url.replace(/\?[^$]+/, "").match(/\.js$/i)) {
		include_tag = document.head.appendChild(document.createElement("script"));
		include_tag.type = "text/javascript";
	}
	else if (url.replace(/\?[^$]+/, "").match(/\.css$/i)) {
		include_tag = document.head.appendChild(document.createElement("link"));
		include_tag.rel = "stylesheet";
	}


	include_tag.node = node;
	include_tag.onload = function (event) {
		if (typeof (this.node.loaded) == "function") {
			this.node.loaded(event);
		}
	}
	include_tag.onerror = function (event) {
		console.log("failed loading:" + this.src ? this.src : this.href);

		// contiue loading anyway
		if (typeof (this.node.loaded) == "function") {
			this.node.loaded(event);
		}

	}

	if (url.replace(/\?[^$]+/, "").match(/\.js$/i)) {
		include_tag.src = url;
	}
	else if (url.replace(/\?[^$]+/, "").match(/\.css$/i)) {
		include_tag.href = url;
	}

	return include_tag;
}

if (typeof (ManipulatorLoadQueue) == "object" && ManipulatorLoadQueue.files && ManipulatorLoadQueue.files.length && !ManipulatorLoadQueue.done && !ManipulatorLoadQueue.loading) {

	ManipulatorLoadQueue.loading = true;

	ManipulatorLoadQueue.loaded = function (event) {
		if (this.files.length) {
			ManipulatorLoader(this, this.files.shift());
		}
		else if(this.node && typeof(this.node.loaded) == "function") {
			this.node.loaded(event);
		}

	}
	ManipulatorLoader(ManipulatorLoadQueue, ManipulatorLoadQueue.files.shift());

}


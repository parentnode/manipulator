// Extracting variable from location search or optional url
Util.getVar = function(param, url) {
	var string = url ? url.split("#")[0] : location.search;

	// find param
	var regexp = new RegExp("[\&\?\b]{1}"+param+"\=([^\&\b]+)");
	var match = string.match(regexp);
	if(match && match.length > 1) {
		return match[1];
	}
	else {
		return "";
	}
}

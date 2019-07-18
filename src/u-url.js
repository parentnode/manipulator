// Extracting variable from location search or optional url
Util.getVar = function(param, url) {
	var string = url ? url.split("#")[0] : location.search;

	// find param (escape special chars in param name to make regex work)
	var regexp = new RegExp("(?:^|\b|&|\\?)"+param.replace(/[\[\]\(\)]{1}/g, "\\$&")+"\=([^\&\b]+)");

	var match = string.match(regexp);
	if(match && match.length > 1) {
		return decodeURIComponent(match[1]);
	}
	else {
		return "";
	}
}

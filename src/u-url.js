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

// DEPRECATED
// Extracting value for parameter s from location hash
// Util.getHashVar = function(s) {
// 	var h = location.hash;
// 	var values, index, list;
// 	values = h.substring(1).split("&");
// 	for(index in values) {
// 		list = values[index].split("=");
// 		if(list[0] == s) {
// 			return list[1];
// 		}
// 	}
// 	return false;
// }

// DEPRECATED
// Get unique id - can be used in ajax url's to force reload
// Util.getUniqueId = function() {
// 	return ("id" + Math.random() * Math.pow(10, 17) + Math.random());
// }


// DEPRECATED
// Extracting value for parameter n from location hash using REST syntax
// Util.getHashPath = function(n) {
// 	var h = location.hash;
// 	var values;
// 	if(h.length) {
// 		values = h.substring(2).split("/");
// 		if(n && values[n]) {
// 			return values[n];
// 		}
// 	}
// 	return values ? values : false;
// }

// Extracting value for parameter n from location hash using REST syntax
// Util.setHashPath = function(path) {
// 	location.hash = path;
// 	return Util.getHashPath();
// }

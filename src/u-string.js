// limits length of string and adds dots
Util.cutString = function(string, length) {
	var matches, match, i;
	
	if(string.length <= length) {
		return string;
	}
	else {
		length = length-3;
	}
	// find entity matches
	matches = string.match(/\&[\w\d]+\;/g);

	// calculate length compensation
	if(matches) {
		for(i = 0; match = matches[i]; i++){
			// only compensate if entity is within shown length
			if(string.indexOf(match) < length){
				length += match.length-1;
			}
		}
	}
	return string.substring(0, length) + (string.length > length ? "..." : "");
}

// prefix string to length with prefix
Util.prefix = function(string, length, prefix) {
	string = string.toString();
	prefix = prefix ? prefix : "0";
	while(string.length < length) {
		string = prefix + string;
	}
	return string;
}

Util.randomString = function(length) {
	var key = "", i;

	// default length 8
	length = length ? length : 8;
	
	var pattern = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
	for(i = 0; i < length; i++) {
		key += pattern[u.random(0,35)];
	}
	return key;
}

Util.uuid = function() {
	var chars = '0123456789abcdef'.split('');
	var uuid = [], rnd = Math.random, r, i;
	uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	// version 4
	uuid[14] = '4';
	for(i = 0; i < 36; i++) {
		if(!uuid[i]) {
			r = 0 | rnd()*16;
			uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
		}
 	}
	return uuid.join('');
}
// TODO: stringOr is DEPRECATED for eitherOr
// return string if string is valid (not null or undefined) - else return optional replacement or ""
Util.stringOr = u.eitherOr = function(value, replacement) {
	if(value !== undefined && value !== null) {
		return value;
	}
	else {
		return replacement ? replacement : "";
	}	
}
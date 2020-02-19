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
		for(i = 0; i < matches.length; i++){
			match = matches[i];

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

// get grouped matches globally
// So far used to fix IE7 issue when appending nodes with src or href beginning with "{"
// TODO: implement as standard function
Util.getMatches = function(string, regex) {
	var match, matches = [];
	while(match = regex.exec(string)) {
		matches.push(match[1]);
	}
	return matches;
}

// TODO: New additions
Util.upperCaseFirst = u.ucfirst = function(string) {
	return string.replace(/^(.){1}/, function($1) {return $1.toUpperCase()});
}
Util.lowerCaseFirst = u.lcfirst = function(string) {
	return string.replace(/^(.){1}/, function($1) {return $1.toLowerCase()});
}


// Normalizes, lowercases and replaces unknown chars with - (hyphen)
Util.normalize = function(string) {

	var table = {
		'À':'A',  'à':'a',
		'Á':'A',  'á':'a',
		'Â':'A',  'â':'a',
		'Ã':'A',  'ã':'a',
		'Ä':'A',  'ä':'a',
		'Å':'Aa', 'å':'aa',
		'Æ':'Ae', 'æ':'ae',

		'Ç':'C',  'ç':'c',
		'Č':'C',  'ć':'c',
		'Ć':'C',  'č':'c',

		'Đ':'D',  'đ':'d',  'ð':'d',

		'È':'E',  'è':'e',
		'É':'E',  'é':'e',
		'Ê':'E',  'ê':'e',
		'Ë':'E',  'ë':'e',

		'Ģ':'G',  'ģ':'g',
		'Ğ':'G',  'ğ':'g',

		'Ì':'I',  'ì':'i',
		'Í':'I',  'í':'i',
		'Î':'I',  'î':'i',
		'Ï':'I',  'ï':'i',
		'Ī':'I',  'ī':'i',

		'Ķ':'K',  'ķ':'k',
		'Ļ':'L',  'ļ':'l',

		'Ñ':'N',  'ñ':'n',
		'Ņ':'N',  'ņ':'n',

		'Ò':'O',  'ò':'o',
		'Ó':'O',  'ó':'o',
		'Ô':'O',  'ô':'o',
		'Õ':'O',  'õ':'o',
		'Ö':'O',  'ö':'o',
		'Ō':'O',  'ō':'o',
		'Ø':'Oe', 'ø':'oe',

		'Ŕ':'R',  'ŕ':'r',
		'Š':'S',  'š':'s',
		'Ş':'S',  'ş':'s',
		'Ṩ':'S',  'ṩ':'s',

		'Ù':'U',  'ù':'u',
		'Ú':'U',  'ú':'u',
		'Û':'U',  'û':'u',
		'Ü':'U',  'ü':'u',
		'Ū':'U',  'ū':'u',
		'Ų':'U',  'ų':'u',
		'Ŭ':'U',  'ŭ':'u',

		'Ý':'Y',  'ý':'y',
		'Ÿ':'Y',  'ÿ':'y',

		'Ž':'Z',  'ž':'z',

		'Þ':'B',  'þ':'b',

		'ß':'Ss',
		'@':' at ',
		'&':'and',
		'%':' percent',
		'\\$':'USD',
		'¥':'JPY',
		'€':'EUR',
		'£':'GBP',
		'™':'trademark',
		'©':'copyright',
		'§':'s',
		'\\*':'x',
		'×':'x'
	}

	var char, regex;
	for(char in table) {
		regex = new RegExp(char, "g");
		string = string.replace(regex, table[char]);
	}

	return string;
}


// Normalizes, lowercases and replaces unknown chars with - (hyphen)
Util.superNormalize = function(string) {

	string = u.normalize(string);

	// lowercase
	string = string.toLowerCase();

	// String tags
	string = u.stripTags(string);

	// replace all specialchars with hyphens
	string = string.replace(/[^a-z0-9\_]/g, '-');

	// remove double hyphens
	string = string.replace(/-+/g, '-');

	// remove leading and trailing hyphens
	string = string.replace(/^-|-$/g, '');

	return string;
}

// Strip tags from string
Util.stripTags = function(string) {
	var node = document.createElement("div");
	node.innerHTML = string;
	return u.text(node);
}

// select correct form, based on count
Util.pluralize = function(count, singular, plural) {
	if(count != 1) {
		return count + " " + plural;
	}
	return count + " " + singular;
}



// is string valid JSON
Util.isStringJSON = function(string) {

	// JSON hints
	// ( | { - json
	if(string.trim().substr(0, 1).match(/[\{\[]/i) && string.trim().substr(-1, 1).match(/[\}\]]/i)) {
//		u.bug("guessing JSON:" + string, "green");

		try {
			// test for json object()
			var test = JSON.parse(string);
			if(obj(test)) {
				test.isJSON = true;
				return test;
			}
		}
		// ignore exception
		catch(exception) {
			console.log(exception)
		}
	}

	// unknown response
	return false;
}

// is string valid HTML
Util.isStringHTML = function(string) {

	// HTML hints
	// < - HTML
	if(string.trim().substr(0, 1).match(/[\<]/i) && string.trim().substr(-1, 1).match(/[\>]/i)) {
//		u.bug("guessing HTML" + string, "green");

		// test for DOM
		try {
			var test = document.createElement("div");
			test.innerHTML = string;

			// seems to be a valid test for now
			if(test.childNodes.length) {

				// sometimes if a head/body tag is actually sent from the server, we may need some of its information
				// getting head/body info with regular expression on responseText
				var body_class = string.match(/<body class="([a-z0-9A-Z_: ]+)"/);
				test.body_class = body_class ? body_class[1] : "";
				var head_title = string.match(/<title>([^$]+)<\/title>/);
				test.head_title = head_title ? head_title[1] : "";

				test.isHTML = true;
				return test;
			}
		}
		// ignore exception
		catch(exception) {}
	}

	// unknown response
	return false;
}



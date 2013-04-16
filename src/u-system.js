Util.browser = function(model, version) {

	var current_version = false;

	if(model.match(/\bexplorer\b|\bie\b/i)) {
//		u.bug("##trying to match IE:" + document.all + ":" + window.ActiveXObject)
		if(window.ActiveXObject) {
			current_version = navigator.userAgent.match(/(MSIE )(\d+.\d)/i)[2];
		}
	}
	else if(model.match(/\bfirefox\b|\bgecko\b/i)) {
//		u.bug("##trying to match firefox")
		if(window.navigator.mozIsLocallyAvailable) {
			current_version = navigator.userAgent.match(/(Firefox\/)(\d+\.\d+)/i)[2];
		}
	}
	else if(model.match(/\bwebkit\b/i)) {
//		u.bug("##trying to match webkit")
		if(document.body.style.webkitTransform != undefined) {
			current_version = navigator.userAgent.match(/(AppleWebKit\/)(\d+.\d)/i)[2];
		}
	}
	else if(model.match(/\bchrome\b/i)) {
//		u.bug("##trying to match chrome")
		if(window.chrome && document.body.style.webkitTransform != undefined) {
			current_version = navigator.userAgent.match(/(Chrome\/)(\d+)(.\d)/i)[2];
		}
	}
	else if(model.match(/\bsafari\b/i)) {
//		u.bug("##trying to match safari")
		if(!window.chrome && document.body.style.webkitTransform != undefined) {
			current_version = navigator.userAgent.match(/(Version\/)(\d+)(.\d)/i)[2];
		}
	}
	else if(model.match(/\bopera\b/i)) {
//		u.bug("##trying to match opera:" + navigator.userAgent.match(/(Opera\/)(\d+)(.\d)/i))
		if(window.opera) {
			if(navigator.userAgent.match(/Version\//)) {
				current_version = navigator.userAgent.match(/(Version\/)(\d+)(.\d)/i)[2];
			}
			// version 9 and less has oldschool useragent
			else {
				current_version = navigator.userAgent.match(/(Opera\/)(\d+)(.\d)/i)[2];
			}
		}
	}

	// did we find a current_version?
	if(current_version) {
		
		// no version requirement
		if(!version) {
			return current_version;
		}
		else {
			// specific flash version
			if(!isNaN(version)) {
				return current_version == version;
			}
			// flash version scope
			else {
				return eval(current_version + version);
			}
		}

	}
	else {
		return false;
	}

}

// TODO - detect OS
Util.system = function(os, version) {
	
}

// check support of CSS property
Util.support = function(property) {
	if(document.documentElement) {
		property = property.replace(/(-\w)/g, function(word){return word.replace(/-/, "").toUpperCase()});
		return property in document.documentElement.style;
	}
	return false;
}



// DEPRECATED
// Browser definition utilities
// Util.explorer = function(version, scope) {
// 	if(document.all) {
// 		var undefined;
// 		var current_version = navigator.userAgent.match(/(MSIE )(\d+.\d)/i)[2];
// 		if(scope && !eval(current_version + scope + version)){
// 			return false;
// 		}
// 		else if(!scope && version && current_version != version) {
// 			return false;
// 		}
// 		else {
// 			return current_version;
// 		}
// 	}
// 	else {
// 		return false;
// 	}
// }
// // 522 -> 3+
// Util.safari = function(version, scope) {
// 	if(navigator.userAgent.indexOf("Safari") >= 0) {
// 		var undefined;
// 		var current_version = navigator.userAgent.match(/(Safari\/)(\d+)(.\d)/i)[2];
// 		if(scope && !eval(current_version + scope + version)){
// 			return false;
// 		}
// 		else if(!scope && version && current_version != version) {
// 			return false;
// 		}
// 		else {
// 			return current_version;
// 		}
// 	}
// 	else {
// 		return false;
// 	}
// }
// Util.webkit = function(version, scope) {
// 	if(navigator.userAgent.indexOf("AppleWebKit") >= 0) {
// 		var undefined;
// 		var current_version = navigator.userAgent.match(/(AppleWebKit\/)(\d+.\d)/i)[2];
// 		if(scope && !eval(current_version + scope + version)){
// 			return false;
// 		}
// 		else if(!scope && version && current_version != version) {
// 			return false;
// 		}
// 		else {
// 			return current_version;
// 		}
// 	}
// 	else {
// 		return false;
// 	}
// }
// 
// Util.firefox = function(version, scope) {
// 	var browser = navigator.userAgent.match(/(Firefox\/)(\d+\.\d+)/i);
// 	if(browser) {
// 		var current_version = browser[2];
// 		if(scope && !eval(current_version + scope + version)){
// 			return false;
// 		}
// 		else if(!scope && version && current_version != version) {
// 			return false;
// 		}
// 		else {
// 			return current_version;
// 		}
// 	}
// 	else {
// 		return false;
// 	}
// }
// 
// Util.opera = function() {
// 	return (navigator.userAgent.indexOf("Opera") >= 0) ? true : false;
// }

// OS definition utilities
Util.windows = function() {
	return (navigator.userAgent.indexOf("Windows") >= 0) ? true : false;
}
Util.osx = function() {
	return (navigator.userAgent.indexOf("OS X") >= 0) ? true : false;
}

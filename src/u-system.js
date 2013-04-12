// Browser definition utilities
Util.explorer = function(version, scope) {
	if(document.all) {
		var undefined;
		var current_version = navigator.userAgent.match(/(MSIE )(\d+.\d)/i)[2];
		if(scope && !eval(current_version + scope + version)){
			return false;
		}
		else if(version && current_version != version) {
			return false;
		}
		else {
			return current_version;
		}
	}
	else {
		return false;
	}
}
// 522 -> 3+
Util.safari = function(version, scope) {
	if(navigator.userAgent.indexOf("Safari") >= 0) {
		var undefined;
		var current_version = navigator.userAgent.match(/(Safari\/)(\d+)(.\d)/i)[2];
		if(scope && !eval(current_version + scope + version)){
			return false;
		}
		else if(!scope && version && current_version != version) {
			return false;
		}
		else {
			return current_version;
		}
	}
	else {
		return false;
	}
}
Util.webkit = function(version, scope) {
	if(navigator.userAgent.indexOf("AppleWebKit") >= 0) {
		var undefined;
		var current_version = navigator.userAgent.match(/(AppleWebKit\/)(\d+.\d)/i)[2];
		if(scope && !eval(current_version + scope + version)){
			return false;
		}
		else if(!scope && version && current_version != version) {
			return false;
		}
		else {
			return current_version;
		}
	}
	else {
		return false;
	}
}

Util.firefox = function(version, scope) {
	if(navigator.userAgent.indexOf("Firefox") >= 0) {
		var undefined;
		var current_version = navigator.userAgent.match(/(Firefox\/)(\d+\.\d+)(\.\d+)/i)[2];
		if(scope && !eval(current_version + scope + version)){
			return false;
		}
		else if(version && current_version != version) {
			return false;
		}
		else {
			return current_version;
		}
	}
	else {
		return false;
	}
}

Util.opera = function() {
	return (navigator.userAgent.indexOf("Opera") >= 0) ? true : false;
}

// OS definition utilities
Util.windows = function() {
	return (navigator.userAgent.indexOf("Windows") >= 0) ? true : false;
}
Util.osx = function() {
	return (navigator.userAgent.indexOf("OS X") >= 0) ? true : false;
}

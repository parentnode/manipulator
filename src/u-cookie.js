// Save cookie
Util.saveCookie = function(name, value) {
	document.cookie = name + "=" + value +";"
}
// Get cookie
Util.getCookie = function(name) {
	var matches;
	return (matches = document.cookie.match(name + "=([^;]+)")) ? matches[1] : false;
}
// Delete cookie
Util.delCookie = function(name) {
	document.cookie = name + "=;expires=Thu, 01-Jan-70 00:00:01 GMT";
}

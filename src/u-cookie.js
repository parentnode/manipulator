// Save cookie
Util.saveCookie = function(name, value) {
	document.cookie = name + "=" + value +";"
}
// Get cookie
Util.getCookie = function(name){
	var id, position, value, start, end;
	id = name + "=";
	position = document.cookie.indexOf(id);
	if(position != -1) {
		start = position + id.length;
		end = document.cookie.indexOf(';', start);
		end = end > 0 ? end : document.cookie.length;
		value = document.cookie.substring(start, end);
		return unescape(value);
	}
	return false;
}
// Delete cookie
Util.delCookie = function(name) {
	document.cookie = name + "=;expires=Thu, 01-Jan-70 00:00:01 GMT";
}
// Save cookie
Util.saveCookie = function(name, value) {
	document.cookie = name + "=" + value +";"
}

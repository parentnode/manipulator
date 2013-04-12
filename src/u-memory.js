Util.Mem = new Object();
Util.Mem.set = function(key, value) {
	var view_id = this.getViewId();
	var memories = eval(Util.getCookie("memories"));
	if(!memories) {
		memories = new Object();
	}
	if(!memories[view_id]) {
		memories[view_id] = new Object();
	}
	memories[view_id][key] = value ? value : "";
	document.cookie = "memories=" + memories.asSource() +";"
}
Util.Mem.get = function(key) {
	var view_id = this.getViewId();
	var memories = eval(Util.getCookie("memories"));
	if(memories && memories[view_id]) {
		return memories[view_id][key] ? memories[view_id][key] : "";
	}
	return false;
}
// get relevant part of url to use as memory key
Util.Mem.getViewId = function() {
	var url = location.href.substring(location.href.indexOf("//")+2);
	return view_id = url.substring(url.indexOf("/"), (url.indexOf(",id=") > -1 ? url.indexOf(",id=") : url.length));
}

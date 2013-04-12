// Create popup (default scrollbars enabled)
Util.popUp = function(url, name, w, h, extra) {
	var p;
	name = name ? name : "POPUP_" + new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getMilliseconds();
	w = w ? w : 330;
	h = h ? h : 150;
	p = "width=" + w + ",height=" + h;
	p += ",left=" + (screen.width-w)/2;
	p += ",top=" + ((screen.height-h)-20)/2;
	p += extra ? "," + extra : ",scrollbars";
	document[name] = window.open(url, name, p);
//	return document[name];
}

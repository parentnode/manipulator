// Flash writer
Util.flash = function(e, url, id, w, h) {
	
	w = w ? w : e.offsetWidth;
	h = h ? h : e.offsetHeight;

//	background = background ? background : "#FFFFFF";
	id = id ? id : "flash_" + new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getMilliseconds();

	var object = u.ae(e, "object");
	object.id = id;
	object.name = id;
	object.width = w;
	object.width = h;

	object.setAttribute("classid", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000");
	object.setAttribute("codebase", "http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0");

	u.ae(object, "param").setAttribute("allowScriptAccess") = "always";
	u.ae(object, "param").setAttribute("movie") = "url";
	u.ae(object, "param").setAttribute("quality") = "high";
	u.ae(object, "param").setAttribute("wmode") = "transparent";
	u.ae(object, "param").setAttribute("menu") = "false";
	u.ae(object, "param").setAttribute("scale") = "noscale";

	return object;
	
	/*
	s = '<object id="'+name+'" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="" width="'+w+'" height="'+h+'" name="'+name+'" align="middle">';
	s += '<param name="allowScriptAccess" value="always" />';
	s += '<param name="movie" value="'+url+'" />';
	s += '<param name="quality" value="high" />';
	s += '<param name="bgcolor" value="'+background+'" />';
	s += '<param name="wmode" value="transparent" />';
	s += '<param name="menu" value="false" />';
	s += '<param name="scale" value="noscale" />';
	s += '<embed id="'+name+'" src="'+url+'" menu="false" scale="noscale" quality="high" bgcolor="'+background+'" wmode="transparent" width="'+w+'" height="'+h+'" name="'+name+'" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
	s += '</object>';
	if(print) {
		document.write(s);
		return "";
	}
	return s;
	*/
}

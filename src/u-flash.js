// Flash writer
Util.flash = function(url, w, h, background, name, id, print) {
	var s;
	background = background ? background : "#FFFFFF";
	name = name ? name : "flash_" + new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getMilliseconds();
	id = id ? id : name;
	s = '<object id="'+name+'" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="'+w+'" height="'+h+'" name="'+name+'" align="middle">';
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
}

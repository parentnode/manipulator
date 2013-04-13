// Flash writer
Util.flash = function(e, url, id, w, h, background) {

//	u.bug("make flash")

	w = w ? w : e.offsetWidth;
	h = h ? h : e.offsetHeight;

	background = background ? background : "transparent";

	id = id ? id : "flash_" + new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getMilliseconds();

//	url = url + "?id=" + id;

	/*	NOT WORKING IN IE8
	cannot add params to object - because object is not HTML (or something like that) - don't know why??

	var object = u.ae(e, "OBJECT", ({"id":id, "name":id, "width":w, "height":h}));

	object.setAttribute("classid", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000");
	object.setAttribute("codebase", "http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0");

	u.ae(object, "param", ({"allowScriptAccess":"always"}));
	u.ae(object, "param", ({"movie":url}));
	u.ae(object, "param", ({"quality":"high"}));
	u.ae(object, "param", ({"wmode":"transparent"}));
	u.ae(object, "param", ({"menu":"false"}));
	u.ae(object, "param", ({"scale":"noscale"}));

	return object;
*/

	html = '<object';
	html += ' id="'+id+'"';
//	html += ' name="'+id+'"'; 
	html += ' width="'+w+'"';
	html += ' height="'+h+'"';

	if(u.explorer()) {
		html += ' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"';
//		html += ' codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0"';
	}
	else {
		html += ' type="application/x-shockwave-flash"';
		html += ' data="'+url+'"';
	}
	html += '>';

	html += '<param name="allowScriptAccess" value="always" />';
	//<param name="allowScriptAccess" value="sameDomain" />
	html += '<param name="movie" value="'+url+'" />';
	html += '<param name="quality" value="high" />';
	html += '<param name="bgcolor" value="'+background+'" />';
	html += '<param name="play" value="true" />';
	html += '<param name="wmode" value="transparent" />';
	html += '<param name="menu" value="false" />';
	html += '<param name="scale" value="showall" />';
//	html += '<embed id="'+name+'" src="'+url+'" menu="false" scale="noscale" quality="high" bgcolor="'+background+'" wmode="transparent" width="'+w+'" height="'+h+'" name="'+name+'" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
	html += '</object>';


//	u.bug(u.htmlToText(html));

//	return false;
	var temp_node = document.createElement("div");
	temp_node.innerHTML += html;
	e.insertBefore(temp_node.firstChild, e.firstChild);
	
	var obj = u.qs("#"+id, e);

//	u.bug("obj:" + obj)
	
	return obj;

}

// Flash writer
Util.flashDetection = function(version) {

	var flash_version = false;
	var flash = false;

	// default way
	if(navigator.plugins && navigator.plugins["Shockwave Flash"] && navigator.plugins["Shockwave Flash"].description && navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) {

		flash = true;

		var Pversion = navigator.plugins["Shockwave Flash"].description.match(/\b([\d]+)\b/);
		if(Pversion.length > 1 && !isNaN(Pversion[1])) {
			flash_version = Pversion[1];
		}

	}

	// ActiveX way
	else if(window.ActiveXObject) {

		try {
			var AXflash, AXversion;
			AXflash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			if(AXflash) {

				flash = true;

				AXversion = AXflash.GetVariable("$version").match(/\b([\d]+)\b/);
				if(AXversion.length > 1 && !isNaN(AXversion[1])) {
					flash_version = AXversion[1];
				}
			}
		}
		catch(exception) {}

	}

	// flash version detected, or flash and no version requirements
	if(flash_version || (flash && !version)) {

		// no version requirement
		if(!version) {
			return true;
		}
		else {
			// specific flash version
			if(!isNaN(version)) {
				return flash_version == version;
			}
			// flash version scope
			else {
				return eval(flash_version + version);
			}
		}
	}
	else {
		return false;
	}

}


Util.flash = function(node, url, _options) {

	// default values
	var width = "100%";
	var height = "100%";
	var background = "transparent";
	var id = "flash_" + new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getMilliseconds();

	var allowScriptAccess = "always";
	var menu = "false";
	var scale = "showall";
	var wmode = "transparent";


	// additional info passed to function as JSON object
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "id"					: id				= _options[_argument]; break;
				case "width"				: width				= Number(_options[_argument]); break;
				case "height"				: height			= Number(_options[_argument]); break;
				case "background"			: background		= _options[_argument]; break;

				case "allowScriptAccess"	: allowScriptAccess = _options[_argument]; break;
				case "menu"					: menu				= _options[_argument]; break;
				case "scale"				: scale				= _options[_argument]; break;
				case "wmode"				: wmode				= _options[_argument]; break;
			}

		}
	}

	// ie 8 and less needs objects and parameters injected at the same time
	html = '<object';
	html += ' id="'+id+'"';
	html += ' width="'+width+'"';
	html += ' height="'+height+'"';

	// explorer version
//	if(u.explorer()) {
	if(u.browser("explorer")) {
		html += ' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"';
//		html += ' codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0"';
	}
	// default version
	else {
		html += ' type="application/x-shockwave-flash"';
		html += ' data="'+url+'"';
	}
	html += '>';

	html += '<param name="allowScriptAccess" value="'+allowScriptAccess+'" />';
	html += '<param name="movie" value="'+url+'" />';
	html += '<param name="quality" value="high" />';
	html += '<param name="bgcolor" value="'+background+'" />';
	html += '<param name="play" value="true" />';
	html += '<param name="wmode" value="'+wmode+'" />';
	html += '<param name="menu" value="'+menu+'" />';
	html += '<param name="scale" value="'+scale+'" />';

	// really old way - disabled for now
	//	html += '<embed id="'+name+'" src="'+url+'" menu="false" scale="noscale" quality="high" bgcolor="'+background+'" wmode="transparent" width="'+w+'" height="'+h+'" name="'+name+'" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';

	html += '</object>';


//	return false;
	var temp_node = document.createElement("div");
	temp_node.innerHTML = html;
	node.insertBefore(temp_node.firstChild, node.firstChild);

	// find flash obejct
	var flash_object = u.qs("#"+id, node);

	return flash_object;
}

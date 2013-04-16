// Create popup (default scrollbars enabled)
Util.popup = function(url, settings) {

	// default values
	var width = "330";
	var height = "150";
	var name = "popup" + new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getMilliseconds();
	var extra = "";


	// additional info passed to function as JSON object
	if(typeof(settings) == "object") {
		var argument;
		for(argument in settings) {

			switch(argument) {
				case "name"		: name		= settings[argument]; break;
				case "width"	: width		= Number(settings[argument]); break;
				case "height"	: height	= Number(settings[argument]); break;
				case "extra"	: extra		= settings[argument]; break;
			}

		}
	}


	var p;
	p = "width=" + width + ",height=" + height;
	p += ",left=" + (screen.width-width)/2;
	p += ",top=" + ((screen.height-height)-20)/2;
	p += extra ? "," + extra : ",scrollbars";
	document[name] = window.open(url, name, p);

	return document[name];
}

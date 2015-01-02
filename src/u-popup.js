// Create popup (default scrollbars enabled)
Util.popup = function(url, _options) {

	// default values
	var width = "330";
	var height = "150";
	var name = "popup" + new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getMilliseconds();
	var extra = "";


	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {

			switch(_argument) {
				case "name"		: name		= _options[_argument]; break;
				case "width"	: width		= Number(_options[_argument]); break;
				case "height"	: height	= Number(_options[_argument]); break;
				case "extra"	: extra		= _options[_argument]; break;
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

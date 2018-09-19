Util.browser = function(model, version) {

	var current_version = false;

	if(model.match(/\bedge\b/i)) {

		if(navigator.userAgent.match(/Windows[^$]+Gecko[^$]+Edge\/(\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/Edge\/(\d+)/i)[1];
		}
	}

	if(model.match(/\bexplorer\b|\bie\b/i)) {
		// u.bug("##trying to match IE:" + document.all + ":" + window.ActiveXObject)
		// u.bug(navigator.userAgent.match(/Trident\/[\d+]\.\d[^$]+rv:(\d+.\d)/i))

		if(window.ActiveXObject && navigator.userAgent.match(/MSIE (\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/MSIE (\d+.\d)/i)[1];
		}
		else if(navigator.userAgent.match(/Trident\/[\d+]\.\d[^$]+rv:(\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/Trident\/[\d+]\.\d[^$]+rv:(\d+.\d)/i)[1];
		}
	}
	
	if(model.match(/\bfirefox\b|\bgecko\b/i) && !u.browser("ie,edge")) {
//		u.bug("##trying to match firefox")
		if(navigator.userAgent.match(/Firefox\/(\d+\.\d+)/i)) {
			current_version = navigator.userAgent.match(/Firefox\/(\d+\.\d+)/i)[1];
		}
	}
	
	if(model.match(/\bwebkit\b/i)) {
//		u.bug("##trying to match webkit:" + document.body.style.webkitTransform)
		if(navigator.userAgent.match(/WebKit/i) && !u.browser("ie,edge")) {
			current_version = navigator.userAgent.match(/AppleWebKit\/(\d+.\d)/i)[1];
		}
	}
	
	if(model.match(/\bchrome\b/i)) {
//		u.bug("##trying to match chrome")
		if(window.chrome && !u.browser("ie,edge")) {
			current_version = navigator.userAgent.match(/Chrome\/(\d+)(.\d)/i)[1];
		}
	}
	
	if(model.match(/\bsafari\b/i)) {
		// u.bug("##trying to match safari")
		u.bug(navigator.userAgent);
		if(!window.chrome && navigator.userAgent.match(/WebKit[^$]+Version\/(\d+)(.\d)/i) && !u.browser("ie,edge")) {
			current_version = navigator.userAgent.match(/Version\/(\d+)(.\d)/i)[1];
		}
	}
	
	if(model.match(/\bopera\b/i)) {
//		alert("##trying to match opera:" + navigator.userAgent + ", " + navigator.userAgent.match(/(Opera[\/ ]{1})(\d+)(.\d)/i))
//		alert("window.opera:" + window.opera)
		if(window.opera) {
			if(navigator.userAgent.match(/Version\//)) {
				current_version = navigator.userAgent.match(/Version\/(\d+)(.\d)/i)[1];
			}
			// version 9 and less has oldschool useragent
			else {
				current_version = navigator.userAgent.match(/Opera[\/ ]{1}(\d+)(.\d)/i)[1];
			}
		}
	}

	// did we find a current_version?
	if(current_version) {
		
		// no version requirement
		if(!version) {
			return current_version;
		}
		else {
			// specific flash version
			if(!isNaN(version)) {
				return current_version == version;
			}
			// flash version scope
			else {
				return eval(current_version + version);
			}
		}

	}
	else {
		return false;
	}

}

// get current segment
// loop through all script tags and look for /seg_
// optional parameter to match for 
// TODO: check how this matches seg_desktop_include?
Util.segment = function(segment) {

	if(!u.current_segment) {
		var scripts = document.getElementsByTagName("script");
		var script, i, src;
		for(i = 0; i < scripts.length; i++) {
			script = scripts[i];

			seg_src = script.src.match(/\/seg_([a-z_]+)/);
			if(seg_src) {
				u.current_segment = seg_src[1];
			}
		}
	}

	if(segment) {
		return segment == u.current_segment;
	}
	
	return u.current_segment;
}


// TODO - detect OS
// NEEDS Testing
Util.system = function(os, version) {

	var current_version = false;

	if(os.match(/\bwindows\b/i)) {
		// u.bug("##trying to match IE:" + document.all + ":" + window.ActiveXObject)
		// u.bug(navigator.userAgent.match(/Trident\/[\d+]\.\d[^$]+rv:(\d+.\d)/i))

//		alert("::" + navigator.userAgent.match(/(Windows NT )(\d+.\d)/i))
		if(navigator.userAgent.match(/(Windows NT )(\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/(Windows NT )(\d+.\d)/i)[2];
		}
	
	}
	else if(os.match(/\bmac\b/i)) {

		if(navigator.userAgent.match(/(Macintosh; Intel Mac OS X )(\d+[._]{1}\d)/i)) {
			current_version = navigator.userAgent.match(/(Macintosh; Intel Mac OS X )(\d+[._]{1}\d)/i)[2].replace("_", ".");
		}
	}
	else if(os.match(/\blinux\b/i)) {

		if(navigator.userAgent.match(/linux|x11/i) && !navigator.userAgent.match(/android/i)) {
			current_version = true;
		}
	}
	else if(os.match(/\bios\b/i)) {

		if(navigator.userAgent.match(/(OS )(\d+[._]{1}\d+[._\d]*)( like Mac OS X)/i)) {
			current_version = navigator.userAgent.match(/(OS )(\d+[._]{1}\d+[._\d]*)( like Mac OS X)/i)[2].replace(/_/g, ".");
		}

		// CPU OS 8_0 l
		//  iPhone OS 8_0 like Mac OS X
		//  iPhone OS 9_0_1 like Mac OS X
		// CPU OS 8_0 like Mac OS X
		// CPU iPhone OS 4_2 like Mac OS X
	}
	else if(os.match(/\bandroid\b/i)) {

		if(navigator.userAgent.match(/Android[ ._]?(\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/Android[ ._]?(\d+.\d)/i)[1];
		}
	}
	else if(os.match(/\bwinphone\b/i)) {

		if(navigator.userAgent.match(/Windows[ ._]?Phone[ ._]?(\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/Windows[ ._]?Phone[ ._]?(\d+.\d)/i)[1];
		}
	}



	// did we find a current_version?
	if(current_version) {
	
		// no version requirement
		if(!version) {
			return current_version;
		}
		else {
			// specific version
			if(!isNaN(version)) {
				return current_version == version;
			}
			// version scope
			else {
				return eval(current_version + version);
			}
		}

	}
	else {
		return false;
	}
}

// check support of CSS property
// automatically check for prefix support as well
Util.support = function(property) {
	if(document.documentElement) {

		var style_property = u.lcfirst(property.replace(/^(-(moz|webkit|ms|o)-|(Moz|webkit|Webkit|ms|O))/, "").replace(/(-\w)/g, function(word){return word.replace(/-/, "").toUpperCase()}));

		if(style_property in document.documentElement.style) {
			return true;
		}
		// look for vendor version
		else if(u.vendorPrefix() && (u.vendorPrefix()+u.ucfirst(style_property)) in document.documentElement.style) {
			return true;
		}
	}
	return false;
}


// find and save vender properties for browser
// when a property is used the first time it checks whether it is supported or if it needs prefix,
// then is stores the proper property name to avoid checking the same property twice
Util.vendor_properties = {};
Util.vendorProperty = function(property) {

	// only look for property once 
	// (but do look for each property as vendor prefixes only applies to individual properties)
	if(!Util.vendor_properties[property]) {

		// set property to avoid any repetition
		Util.vendor_properties[property] = property.replace(/(-\w)/g, function(word){return word.replace(/-/, "").toUpperCase()});

		// check if value is valid and make appropriate adjustments
		if(document.documentElement) {

			// correct css property names
			var style_property = u.lcfirst(property.replace(/^(-(moz|webkit|ms|o)-|(Moz|webkit|Webkit|ms|O))/, "").replace(/(-\w)/g, function(word){return word.replace(/-/, "").toUpperCase()}));

			// look for standard 
			if(style_property in document.documentElement.style) {
				Util.vendor_properties[property] = style_property;
			}
			// look for vendor version
			else if(u.vendorPrefix() && (u.vendorPrefix()+u.ucfirst(style_property)) in document.documentElement.style) {
				Util.vendor_properties[property] = u.vendorPrefix()+u.ucfirst(style_property);
			}

		}

	}

	return Util.vendor_properties[property];
}

// find and store vendor prefix
// looks through available document styles to find any prefix (one prefixed function is always expected to be there)
Util.vendor_prefix = false;
Util.vendorPrefix = function() {


	if(Util.vendor_prefix === false) {

		Util.vendor_prefix = "";

		// do not attempt to find vendor prefix in older browsers
		if(document.documentElement && fun(window.getComputedStyle)) {

			// get all style properties
			var styles = window.getComputedStyle(document.documentElement, "");

			// fastes way
			if(styles.length) {
				var i, style, match;

				// loop through styles to find any known prefix
				for(i = 0; i < styles.length; i++) {
					style = styles[i];

					match = style.match(/^-(moz|webkit|ms)-/);
					if(match) {
						Util.vendor_prefix = match[1];

						// correct Moz word case exception
						if(Util.vendor_prefix == "moz") {
							Util.vendor_prefix = "Moz";
						}

						break;
					}
				}
			}
			// fallback for older browsers not returning available css-properties in array
			else {
				var x, match;

				// loop through styles to find any known prefix
				for(x in styles) {
					// Opera is hard to find, because other properties start with O
					match = x.match(/^(Moz|webkit|ms|OLink)/);

					if(match) {
						Util.vendor_prefix = match[1];

						// Fix the Opera mess
						if(Util.vendor_prefix === "OLink") {
							Util.vendor_prefix = "O";
						}

						break;
					}
				}
			}
		}


	}

	return Util.vendor_prefix;
}

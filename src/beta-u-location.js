// Get geolocation from browser
Util.getLocation = function(latitude_input, longitude_input) {

	window.latitude_input = latitude_input;
	window.longitude_input = longitude_input;

	this.foundLocation = function(position) {
	  var lat = position.coords.latitude;
	  var long = position.coords.longitude;
		Util.ge(window.latitude_input).value = lat;
		Util.ge(window.longitude_input).value = long;

//	  alert('Found location: ' + lat + ', ' + long + "::" + window.latitude_input);
	}
	this.noLocation = function() {
	  alert('Could not find location');
	}

	
	navigator.geolocation.getCurrentPosition(this.foundLocation, this.noLocation);

}

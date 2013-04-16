// extended random number generator
Util.random = function(min, max) {
	return Math.round((Math.random() * (max - min)) + min);
}

// decimal to hex
Util.numToHex = function(num) {
	return num.toString(16);
}
// hex to decimal
Util.hexToNum = function(hex) {
	return parseInt(hex,16);
}

// d - Day of the month, 2 digits with leading zeros: 01 to 31
// j - Day of the month without leading zeros: 1 to 31

// m - Numeric representation of a month, with leading zeros: 01 through 12
// n - Numeric representation of a month, without leading zeros: 1 through 12
// F - full month string, given as array

// Y - A full numeric representation of a year, 4 digits

// G - 24-hour format of an hour without leading zeros: 0 through 23
// H - 24-hour format of an hour with leading zeros	00 through 23
// i - Minutes with leading zeros	00 to 59
// s - Seconds, with leading zeros	00 through 59

Util.date = function(format, timestamp, months) {

	var date = timestamp ? new Date(timestamp) : new Date();

	// not a valid date
	if(isNaN(date.getTime())) {

		// look for correct timezone
		if(!timestamp.match(/[A-Z]{3}\+[0-9]{4}/)) {

			// offset declared without timezone (twitter - IE doesn't understand)
			if(timestamp.match(/ \+[0-9]{4}/)) {

				// add timezone and try to create date again
				date = new Date(timestamp.replace(/ (\+[0-9]{4})/, " GMT$1"));
			}
		}

		// final test - if it still fails, return current time
		if(isNaN(date.getTime())) {
			date = new Date();
		}
	}


	var tokens = /d|j|m|n|F|Y|G|H|i|s/g;

	var chars = new Object();

	chars.j = date.getDate();
	chars.d = (chars.j > 9 ? "" : "0") + chars.j;

	chars.n = date.getMonth()+1;
	chars.m = (chars.n > 9 ? "" : "0") + chars.n;
	chars.F = months ? months[date.getMonth()] : "";

	chars.Y = date.getFullYear();

	chars.G = date.getHours();
	chars.H = (chars.G > 9 ? "" : "0") + chars.G;

	var i = date.getMinutes();
	chars.i = (i > 9 ? "" : "0") + i;

	var s = date.getSeconds();
	chars.s = (s > 9 ? "" : "0") + s;

	return format.replace(tokens, function (_) {
		return _ in chars ? chars[_] : _.slice(1, _.length - 1);
	});
};

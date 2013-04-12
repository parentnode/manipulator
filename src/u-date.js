
// d - Day of the month, 2 digits with leading zeros: 01 to 31
// j - Day of the month without leading zeros: 1 to 31

// m - Numeric representation of a month, with leading zeros: 01 through 12
// n - Numeric representation of a month, without leading zeros: 1 through 12

// Y - A full numeric representation of a year, 4 digits

// G - 24-hour format of an hour without leading zeros: 0 through 23
// H - 24-hour format of an hour with leading zeros	00 through 23
// i - Minutes with leading zeros	00 to 59
// s - Seconds, with leading zeros	00 through 59

Util.date = function(format, timestamp) {
	var date = isNaN(timestamp) ? new Date() : new Date(timestamp);
	var tokens = /d|j|m|n|Y|G|H|i|s/g;

	var chars = new Object();

	chars.j = date.getDate();
	chars.d = (chars.j > 9 ? "" : "0") + chars.j;

	chars.n = date.getMonth()+1;
	chars.m = (chars.n > 9 ? "" : "0") + chars.n;

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

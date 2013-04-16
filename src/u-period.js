// individual formats not included if minimal = true, ie. hour = 0, returns an empty string
// Because of odd months and time is calculated from now, when it comes to months and years

// y - Total years: 0 - infinity - NOT IMPLEMENTED

// n - Months split by years: 0 - 11 - NOT IMPLEMENTED
// o - Months split by years, with leading zeros: 00 - 11 - NOT IMPLEMENTED
// O - Total months: 0 - infinity - NOT IMPLEMENTED

// w - Weeks split by months: 0 - 4 - NOT IMPLEMENTED
// W - Total weeks: 0 - infinity - NOT IMPLEMENTED

// c - Days split by months: 0 - 30 - NOT IMPLEMENTED
// d - Days split by months, with leading zeros: 00 - 30 - NOT IMPLEMENTED
// e - Days split by weeks, with leading zeros: 0 - 6 - NOT IMPLEMENTED
// D - Total days: 0 - infinity - NOT IMPLEMENTED

// g - hours split by days: 0 - 23
// h - hours split by days, with leading zeros: 00 - 23
// H - Total hours: 0 - infinity

// l - Minutes split by hours: 0 - 59
// m - Minutes split by hours, with leading zeros: 00 - 59
// M - Total minutes: 0 - infinity

// r - Seconds split by minutes: 0 - 59
// s - Seconds split by minutes, with leading zeros: 00 - 59
// S - Total seconds: 0 - infinity

// t - Deciseconds, 1 digit: 0 - 9
// T - Centiseconds, 2 digits, with leading zeros: 00 - 99
// u - Milliseconds, 3 digits, with leading zeros: 000 - 999
// U - Total milliseconds: 0 - infinity

// additional input can be given as second parameter using JSON with these identifiers
// time-inputs each excluding the others - there can only be one
// seconcs
// milliseconds
// minutes
// hours
// days
// months - using 365/12 days
// years - of 365

Util.period = function(format, time) {

	// define default options
	var seconds = 0;

	// additional info passed to function as JSON object
	if(typeof(time) == "object") {
		var argument;
		for(argument in time) {

			switch(argument) {
				case "seconds"		: seconds = time[argument]; break;
				case "milliseconds" : seconds = Number(time[argument])/1000; break;
				case "minutes"		: seconds = Number(time[argument])*60; break;
				case "hours"		: seconds = Number(time[argument])*60*60 ; break;
				case "days"			: seconds = Number(time[argument])*60*60*24; break;
				case "months"		: seconds = Number(time[argument])*60*60*24*(365/12); break;
				case "years"		: seconds = Number(time[argument])*60*60*24*365; break;
			}

		}
	}

//	u.bug("seconds:" + seconds + "->" + format);


	var tokens = /y|n|o|O|w|W|c|d|e|D|g|h|H|l|m|M|r|s|S|t|T|u|U/g;

	var chars = new Object();

	chars.y = 0; // TODO

	chars.n = 0; // TODO 
	chars.o = (chars.n > 9 ? "" : "0") + chars.n; // TODO
	chars.O = 0; // TODO

	chars.w = 0; // TODO
	chars.W = 0; // TODO

	chars.c = 0; // TODO
	chars.d = 0; // TODO
	chars.e = 0; // TODO

	// D - Total days: 0 - infinity
	chars.D = Math.floor(((seconds/60)/60)/24);

	// g - hours split by days: 0 - 23
	chars.g = Math.floor((seconds/60)/60)%24;
	// h - hours split by days, with leading zeros: 00 - 23
	chars.h = (chars.g > 9 ? "" : "0") + chars.g;
	// H - Total hours: 0 - infinity
	chars.H = Math.floor((seconds/60)/60);

	// l - Minutes split by hours: 0 - 59
	chars.l = Math.floor(seconds/60)%60;
	// m - Minutes split by hours, with leading zeros: 00 - 59
	chars.m = (chars.l > 9 ? "" : "0") + chars.l;
	// M - Total minutes: 0 - infinity
	chars.M = Math.floor(seconds/60);

	// r - Seconds split by minutes: 0 - 59
	chars.r = Math.floor(seconds)%60;
	// s - Seconds split by minutes, with leading zeros: 00 - 59
	chars.s = (chars.r > 9 ? "" : "0") + chars.r;
	// S - Total seconds: 0 - infinity
	chars.S = Math.floor(seconds);

	// t - Deciseconds, 1 digit: 0 - 9
	chars.t = Math.round((seconds%1)*10);
	// T - Centiseconds, 2 digits, with leading zeros: 00 - 99
	chars.T = Math.round((seconds%1)*100);
	chars.T = (chars.T > 9 ? "": "0") + Math.round(chars.T);
	// u - Milliseconds, 3 digits, with leading zeros: 000 - 999
	chars.u = Math.round((seconds%1)*1000);
	chars.u = (chars.u > 9 ? chars.u > 99 ? "" : "0" : "00") + Math.round(chars.u);
	// U - Total milliseconds: 0 - infinity
	chars.U = Math.round(seconds*1000);

	return format.replace(tokens, function (_) {
		return _ in chars ? chars[_] : _.slice(1, _.length - 1);
	});
};

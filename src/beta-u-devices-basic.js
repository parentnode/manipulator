u.deviceDetection = function() {
	

	// make some code to gather extra info on strange useragents

	// also include in basic and maybe write out some options if tech allows

	// features can be used to identify versions of browsers
	var json = {"user_agent":navigator.userAgent};


	// netscape trail, supported until ?
	if(document.layers) {
//		bug("document.layers support");
		json["document.layers"] = true;
	}


	// IE trail, supported until 9 - tested until 9
	if(document.all) {
//		u.bug("document.all support");

		json["document.all"] = true;

		// if("something") {
		// 	// v 4
		// 	json["document"] = true;
		// }
		// 
		// if("something") {
		// 	// v 5
		// 	json["document"] = true;
		// }
		// 
		// if("something") {
		// 	// v 55
		// }
		// 
		// if("something") {
		// 	// v 6
		// }
		// 
		// if("something") {
		// 	// v 7
		// }
		// 
		// if("something") {
		// 	// v 8
		// }
		// 
		// if("something") {
		// 	// v 9
		// }

	}



	// Firefox trail, supported until current (16) - tested from version 2
	if(window.navigator && window.navigator.mozIsLocallyAvailable) {
//		u.bug("IS MOZ");

		json["mozIsLocallyAvailable"] = true;
		json["Firefox"] = true;
	
	}
	
	// crome trail, supported until current
	if(window.chrome || navigator.vendor.match(/Google/i)) {
//		u.bug("IS CHROME");

		json["window.chrome"] = true;
		json["Chrome"] = true;

		
	}

	// webkit trail, supported until current
	if(navigator.vendor.match(/Apple/i)) {

		json["Safari"] = true;

	}


	// ??
	if(window.WebKitAnimationEvent) {
		json["WebKitAnimationEvent"] = true;
	}
	if(window.WebKitCSSMatrix) {
		json["WebKitCSSMatrix"] = true;
	}


	if(document.body.style.webkitTransform != undefined) {
		json["webkitTransform"] = true;
	}
	if(document.body.style.MozTransform != undefined) {
		json["MozTransform"] = true;
	}
	if(document.body.style.oTransform != undefined) {
		json["oTransform"] = true;
	}
	if(document.body.style.msTransform != undefined) {
		json["msTransform"] = true;
	}


	if(document.body.style.webkitTransition != undefined) {
		json["webkitTransition"] = true;
	}
	if(document.body.style.MozTransition != undefined) {
		json["MozTransition"] = true;
	}
	if(document.body.style.oTransition != undefined) {
		json["oTransition"] = true;
	}
	if(document.body.style.msTransition != undefined) {
		json["msTransition"] = true;
	}

	if(screen) {
		json["screen.width"] = screen.width;
		json["screen.height"] = screen.height;
	}

	if(XMLHttpRequest) {
		json["XMLHttpRequest"] = true;
	}

	if(document.querySelector) {
		json["document.querySelector"] = true;
	}

	var string = "";
	string += "\n### - json - ###\n";
	for(x in json) {
		string += x + "=" + json[x] + "\n";
	}

	string += "\n### - navigator - ###\n";
	for(x in navigator) {
		string += x + "=" + navigator[x] + "\n";
	}

	string += "### - window - ###\n";
	for(x in window) {
		string += x + "=" + window[x] + "\n";
	}

	string += "\n### - document - ###\n";
	for(x in document) {
		string += x + "=" + document[x] + "\n";
	}

	if(XMLHttpRequest) {
		var request = new XMLHttpRequest();
//		request.open("POST", "http://jes.local/documentation/tests/u-devices-save");
		request.open("POST", "http://jes.wires.dk/documentation/tests/u-devices-save");
		request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		request.send("subject=" + encodeURIComponent("Device info: " + navigator.userAgent) + "&message=" + encodeURIComponent("Device info: " + navigator.userAgent) + "\n" + encodeURIComponent(string));
	}
	else {
		var img = document.createElement("img");
//		img.src = "http://jes.local/documentation/tests/u-devices-save?type=img&subject=" + encodeURIComponent("Device info: " + navigator.userAgent) + "&message=no_xmlhttprequest";
		img.src = "http://jes.wires.dk/documentation/tests/u-devices-save?type=img&subject=" + encodeURIComponent("Device info: " + navigator.userAgent) + "&message=no_xmlhttprequest";
		document.body.appendChild(img);
	}


}


if(navigator.userAgent.match(/zxing|silly\_that/i)) {
	u.deviceDetection();
}

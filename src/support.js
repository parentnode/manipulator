// testing for relevant js support

// u-animation
// - new Date().getTime()
// - match()
// - parseFloat()
// - Events
// - u.as()
// - u.gcs()


// u-cookie
// - document.cookie
// - match()


// u-date
// - isNaN()
// - 


Util.Support = u.s = new function() {


//	this.animation_test = null;

	this.details = true;

	// basic features
	this.basic_test = null;

	// complete test (basic included)
	this.jes_test = null;

	// pure javascript tests
	this.string_test = null;
	this.array_test = null;
	this.object_test = null;

	// JES tests
	this.cookie_test = null;
	this.date_test = null;
	this.dom_test = null;
	this.event_test = null;
	this.animation_test = null;


	this.Basic = function() {

		
		if(this.Strings()) {
			if(this.Arrays()) {
				if(this.Objects()) {
					
					u.bug("passed basic")

					this.basic_test = true;
					return true;
				}
			}
		}

		// test failed
		this.basic_test = false;
		return false;
	}

	this.JES = function() {
		if(this.Basic()) {
			if(this.Cookies()) {
				if(this.Dates()) {
					this.jes_test = true;
					return true;
				}
			}
		}

		// test failed
		this.jes_test = false;
		return false;
	}

	// Cookie test result
	this.Cookies = function() {
		if(this.cookie_test == null) {
			this.cookie_test = this.cookieTest();
		}
		return this.cookie_test;
	}

	// Date test result
	this.Dates = function() {
		if(this.date_test == null) {
			this.date_test = this.dateTest();
		}
		return this.date_test;
	}

	// Regexp test result
	this.Strings = function() {
		if(this.string_test == null) {
			this.string_test = this.stringTest();
		}
		return this.string_test;
	}
	// Arrays test result
	this.Arrays = function() {
		if(this.array_test == null) {
			this.array_test = this.arrayTest();
		}
		return this.array_test;
	}
	// Objects test result
	this.Objects = function() {
		if(this.object_test == null) {
			this.object_test = this.objectTest();
		}
		return this.object_test;
	}



	this.Animation = this.a = function() {


		alert("ani");
	}



	// test strings
	//
	// String
	// parseInt
	// parseFloat
	// String.toLowerCase
	// String.toUpperCase
	// String.split
	// String.substring
	// String.indexOf
	// String.replace
	// String.match
	this.stringTest = function() {

		// String
		if(typeof(String)) {

			// test string
			var string = "2.50DKK - Complicated (testing) #str-ing#: What is the response?";

			// test functions
			if(
				typeof(parseInt) != "function" ||
				typeof(parseFloat) != "function" ||
				typeof(string.toLowerCase) != "function" ||
				typeof(string.toUpperCase) != "function" ||
				typeof(string.split) != "function" ||
				typeof(string.substring) != "function" ||
				typeof(string.indexOf) != "function" ||
				typeof(string.replace) != "function" ||
				typeof(string.match) != "function"

			) {
				if(this.details) {
					alert("string types:\n"+
						typeof(parseInt) + ":function\n" +
						typeof(parseFloat) + ":function\n" +
						typeof(string.toLowerCase) + ":function\n" +
						typeof(string.toUpperCase) + ":function\n" +
						typeof(string.split) + ":function\n" +
						typeof(string.substring) + ":function\n" +
						typeof(string.indexOf) + ":function\n" +
						typeof(string.replace) + ":function\n" +
						typeof(string.match) + ":function\n"
					)
				}

				// something is missing
				return false
			}

			// toLowerCase
			if(string.toLowerCase() != "2.50dkk - complicated (testing) #str-ing#: what is the response?") {
				return false;
			}	

			// toUpperCase
			if(string.toUpperCase() != "2.50DKK - COMPLICATED (TESTING) #STR-ING#: WHAT IS THE RESPONSE?") {
				return false;
			}	

			// parseInt, parseFloat
			if(parseInt(string) != "2" && parseFloat(string) != "2.50") {
				return false
			}

			// split
			if(string.split(/#/).length != 3) {
				return false;
			}	

			// substring
			if(string.substring(4, 7) != "DKK") {
				return false;
			}	

			// indexOf
			if(string.indexOf(":") != 41) {
				return false;
			}	

			// replace
			if(string.replace(/#[\-a-z]+#/, "fisk") != "2.50DKK - Complicated (testing) fisk: What is the response?") {
				return false;
			}

			// match
			var match = string.match(/#([\-a-z]+)#: ([^\?]+)/);
			if(match[1] != "str-ing" || match[2] != "What is the response") {
				return false;
			}

			// passed test
			return true;
		}
		return false;
	}

	// String.splice


	// test arrays
	//
	// Array.push
	// Array.unshift
	// Array.pop
	// Array.shift
	// Array.join
	// Array.splice
	this.arrayTest = function() {

		// array
		if(typeof(Array)) {

			// test array
			var array = new Array("index1", "index2", "index3");

			if(
				typeof(array.pop) == "undefined" || 
				typeof(array.shift) == "undefined" || 
				typeof(array.push) == "undefined" || 
				typeof(array.unshift) == "undefined" ||
				typeof(array.join) == "undefined" ||
				typeof(array.splice) == "undefined"
			) {
				if(this.details) {
					alert("array types:\n"+
						typeof(array.pop) + ":function\n" +
						typeof(array.shift) + ":function\n" +
						typeof(array.push) + ":function\n" +
						typeof(array.unshift) + ":function\n" +
						typeof(array.join) + ":function\n" +
						typeof(array.splice) + ":function\n"
					)
				}
				return false;
			}

//			alert("fisk1" + array.unshift)
			// push
			if(array.push("index4") != 4) {
				return false;
			}
//			alert("fisk2"+ array.unshift("index5"))
			// unshift
			if(array.unshift("index5") != 5) {
				return false;
			}
			alert("fisk3")
			// pop
			if(array.pop() != "index4") {
				return false;
			}
			alert("fisk4")
			// shift
			if(array.shift() != "index5") {
				return false;
			}
			alert("fisk5")
			// join
			if(array.join("#") != "index1#index2#index3") {
				return false;
			}
			alert("fisk6")
			// splice
			if(array.splice(2,1) != "index3") {
				return false;
			}

			// passed test
			return true;
		}
		return false;
	}


	// DOM/objects test
	//
	// window
	// document
	// document.createElement
	// document.appendChild
	// document.insertBefore
	// document.childNodes
	// document.getElementsByTagName
	// document.getElementById
	// document.removeChild
	// Object
	// Math

	this.objectTest = function() {

		// window, document, object, math
		if(typeof(window) && typeof(document) && typeof(Object) && typeof(Math)) {

			if(
				typeof(window) != "object" || 
				typeof(window.open) != "function" || 
				typeof(document) != "object" || 
				typeof(document.body) != "object" || 
				typeof(document.createElement) != "function" ||
				typeof(document.appendChild) != "function" ||
				typeof(document.insertBefore) != "function" ||
				(typeof(document.childNodes) != "object" && typeof(document.childNodes) != "function") ||
				typeof(document.getElementById) != "function" ||
				typeof(document.getElementsByTagName) != "function" ||
				typeof(document.body.innerHTML) != "string" ||
				typeof(document.removeChild) != "function" ||
				typeof(Object) != "function" || 
				typeof(Math) != "object" ||
				typeof(isNaN) != "function" ||
				typeof(Math.pow) != "function" ||
				typeof(Math.random) != "function"
			) {
				if(this.details) {
					alert("object types\n"+
						typeof(window) + ":object\n" +
						typeof(window.open) + ":function\n" +
						typeof(document) + ":object\n" +
						typeof(document.body) + ":object\n" +
						typeof(document.createElement) + ":function\n" +
						typeof(document.appendChild) + ":function\n" +
						typeof(document.insertBefore) + ":function\n" +
						typeof(document.childNodes) + ":object|function\n" +
						typeof(document.getElementById) + ":function\n" +
						typeof(document.getElementsByTagName) + ":function\n" +
						typeof(document.body.innerHTML) + ":string\n" +
						typeof(document.removeChild) + ":function\n" +
						typeof(Object) + ":function\n" +
						typeof(Math) + ":object\n" +
						typeof(isNaN) + ":function\n" +
						typeof(Math.pow) + ":function\n" +
						typeof(Math.random) + ":function\n"
					)
				}
				return false;
			}

			// createElement
			var div_element = document.createElement("div");
			if(!div_element || div_element.nodeName.toLowerCase() != "div") {
				return false;
			}
			// appendChild
			var p_element = div_element.appendChild(document.createElement("p"));
			if(!p_element || p_element.nodeName.toLowerCase() != "p" || div_element.childNodes.length != 1) {
				return false;
			}
			// insertBefore + childNodes
			var a_element = div_element.insertBefore(document.createElement("a"), p_element);
			if(!a_element || div_element.childNodes[0].nodeName.toLowerCase() != "a") {
				return false;
			}
			// getElementsByTagName + innerHTML
			a_element.innerHTML = "JESobjectstest_a";
			if(div_element.getElementsByTagName("a")[0].innerHTML != "JESobjectstest_a") {
				return false;
			}
			// getElementById + innerHTML
			div_element.id = "JESobjectstest";
			document.body.appendChild(div_element);
			if(document.getElementById("JESobjectstest") != document.body.removeChild(div_element)) {
				return false;
			}
			// Math.pow
			if(Math.pow(2,2) != 4) {
				return false;
			}
			// Math.random
			if(isNaN(Math.random() + Math.random())) {
				return false;
			}


			// passed test
			return true;
		}
		return false;
	}


	// testing JES objects


	// test save, get and delete
	this.cookieTest = function() {
		u.saveCookie("JES-cookie-test", "JES-cookie-test-approved");
		if(u.getCookie("JES-cookie-test") == "JES-cookie-test-approved") {
			u.delCookie("JES-cookie-test");
			if(!u.getCookie("JES-cookie-test")) {
				return true
			}
		}
		return false;
	}


	// test date format
	this.dateTest = function() {
		if(u.date("d-m-Y H:i:s", 1313841244071) == "20-08-2011 13:54:04") {
			return true;
		}
		return false;
	}


//	this.Animation()


	// 

	// events
	this.Events = this.e = function() {
		alert("test")
	}

}
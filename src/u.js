if(!u || !Util) {
	var u, Util = u = new function() {};
	u.version = "0.9.3";

	// handle bug requests if debug module is not included
	u.bug = u.nodeId = u.exception = function() {};

	// hande stats requests if stats is not enabled
	u.stats = new function() {this.pageView = function(){};this.event = function(){};}

	// handle text request if txt module not included
	u.txt = function(index) {return index;}
}

function fun(v) {return (typeof(v) === "function")}
function obj(v) {return (typeof(v) === "object")}
function str(v) {return (typeof(v) === "string")}
if(!u || !Util) {
	var u, Util = u = new function() {};
	u.version = "0.9.2";

	// handle bug requests if debug module is not included
	u.bug = u.nodeId = u.exception = function() {};
//	u.nodeId = function() {};

	// hande stats requests if stats is not enabled
	u.stats = new function() {this.pageView = function(){};this.event = function(){};}
}

function fun(v) {return (typeof(v) === "function")}
function obj(v) {return (typeof(v) === "object")}
function str(v) {return (typeof(v) === "string")}
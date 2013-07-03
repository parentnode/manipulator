if(!u || !Util) {
	var u, Util = u = new function() {};
	u.version = 0.8;

	// handle bug requests if debug lib is not included
	u.bug = function() {};
	u.nodeId = function() {};

	// hande stats requests if stats is not enabled
	u.stats = new function() {this.pageView = function(){};this.event = function(){};this.customVar = function(){};}
}

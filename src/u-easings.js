u.easings = new function() {

	this["ease-in"] = function(progress) {
		return Math.pow((progress), 3);
	}

	this["linear"] = function(progress) {
		return progress;
	}

	this["ease-out"] = function(progress) {
		return 1 - Math.pow(1 - ((progress)), 3);
	}

	this["linear"] = function(progress) {
		return (progress);
	}

	this["ease-in-out-veryslow"] = function(progress) {
		if(progress > 0.5) {
			return 4*Math.pow((progress-1),3)+1;
		}
		return 4*Math.pow(progress,3);  
	}
	this["ease-in-out"] = function(progress) {
		if(progress > 0.5) {
			return 1 - Math.pow(1 - ((progress)), 2);
		}
		return Math.pow((progress), 2);
	}
	this["ease-out-slow"] = function(progress) {
		return 1 - Math.pow(1 - ((progress)), 2);
	}
	
	this["ease-in-slow"] = function(progress) {
		return Math.pow((progress), 2);
	}
	this["ease-in-veryslow"] = function(progress) {
		return Math.pow((progress), 1.5);
	}
	this["ease-in-fast"] = function(progress) {
		return Math.pow((progress), 4);
	}
}
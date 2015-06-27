u.easings = new function() {

	this["ease-in"] = function(progress) {
		return Math.pow((progress*this.duration) / this.duration, 3);
	}

	this["linear"] = function(progress) {
		return progress;
	}

	this["ease-out"] = function(progress) {
		return 1 - Math.pow(1 - ((progress*this.duration) / this.duration), 3);
	}

	this["linear"] = function(progress) {
		return (progress*this.duration) / this.duration;
	}

	this["ease-in-out"] = function(progress) {
		if((progress*this.duration) > (this.duration / 2)) {
			return 1 - Math.pow(1 - ((progress*this.duration) / this.duration), 3);
		}
		return Math.pow((progress*this.duration) / this.duration, 3);
	}
}
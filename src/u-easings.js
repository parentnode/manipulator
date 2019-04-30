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
	
	
	this["easeOutQuad"] = function (progress) {
		d = 1;
		b = 0;
		c = progress;
		t = progress;

		t /= d;
		return -c * t*(t-2) + b;
	};

	this["easeOutCubic"] = function (progress) {

		d = 1;
		b = 0;
		c = progress;
		t = progress;

		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	};


	this["easeOutQuint"] = function (progress) {

		d = 1;
		b = 0;
		c = progress;
		t = progress;

		t /= d;
		t--;
		return c*(t*t*t*t*t + 1) + b;
	};
	
	this["easeInOutSine"] = function (progress) {
		d = 1;
		b = 0;
		c = progress;
		t = progress;

		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	};

	
	this["easeInOutElastic"] = function (progress) {

		d = 1;
		b = 0;
		c = progress;
		t = progress;

		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	}
	
	this["easeOutBounce"] = function (progress) {

		d = 1;
		b = 0;
		c = progress;
		t = progress;

			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
	}
	this["easeInBack"] = function (progress) {
		var s = 1.70158;
		d = 1;
		b = 0;
		c = progress;
		t = progress;
		
			// if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
	}
}
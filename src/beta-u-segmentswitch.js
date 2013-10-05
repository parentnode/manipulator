u.segmentSwitch = function(page) {
	

	page.segmentSwitch = function() {

		// global mobile size detection
		if(u.browserW() < 600 && typeof(page.switchToMobile) == "function") {
					u.bug("switch")
			page.switchToMobile();
		}
		else if(u.browserW() > 600 && typeof(page.switchToMobileOutdated) == "function") {
					u.bug("outdated")
			page.switchToMobileOutdated();
		}

	}

	// switch to mobile handler
	page.switchToMobile = function() {
		this.switchToMobileSwitch = this.switchToMobile;
		this.switchToMobile = false;

		this.mobileSwitch = u.ae(document.body, "div", {"id":"mobile_switch"});
		u.ae(this.mobileSwitch, "h1", {"html":"Hello testypants!"});
		u.ae(this.mobileSwitch, "p", {"html":'Do you want to switch to the <a class="switch">mobile layout</a>, or do you want to <a class="keep">keep testing</a> how our page scales, even at absurdly low widths?'});

		this.switchToMobileOutdated = function() {
			page.switchToMobile = page.switchToMobileSwitch;

			page.switchToMobileOutdated = false;
			this.mobileSwitch.transitioned = function() {

				u.a.transition(this, "none");
				this.parentNode.removeChild(this);
			}

			u.a.transition(this.mobileSwitch, "all 0.3s ease-in-out");
			u.a.setOpacity(this.mobileSwitch, 0);
		}

		var scale = {
			"h1":{
				"unit":"rem",
				"min_size":1.2,
				"min_width":200,
				"max_size":3,
				"max_width":600
			}
		}
		u.textscaler(this.mobileSwitch, scale);

		var bn_switch = u.qs("a.switch", this.mobileSwitch);
		var bn_keep = u.qs("a.keep", this.mobileSwitch);
		bn_keep.mobileSwitch = this.mobileSwitch;

		u.e.click(bn_switch);
		bn_switch.clicked = function() {
			page.transitioned = function() {
				u.a.transition(this, "none");

				var url = u.h.getCleanHash(location.hash);
				location.href = url+"?segment=mobile_touch";
//						alert("url:" + url);

			}

			u.a.transition(page, "all 0.3s ease-in-out");
			u.a.setOpacity(page, 0);

			u.a.transition(this, "all 0.3s ease-in-out");
			u.a.setOpacity(this, 0);
		}

		u.e.click(bn_keep);
		bn_keep.clicked = function() {
			this.mobileSwitch.transitioned = function() {
				u.a.transition(this, "none");
				this.parentNode.removeChild(this);
			}

			u.a.transition(this.mobileSwitch, "all 0.3s ease-in-out");
			u.a.setOpacity(this.mobileSwitch, 0);
		}

//				alert("switch to mobile")
		
	}

}

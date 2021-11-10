
// switch between segments handler
u.smartphoneSwitch = new function() {

	// Set initial state
	this.state = 0;

	this.init = function(node) {
//			console.log("smartphoneSwitch on")
		// map callback node
		this.callback_node = node;
		// set resize handler
		this.event_id = u.e.addWindowEvent(this, "resize", this.resized);

		this.resized();
	}

	this.resized = function() {
//		console.log("u.smartphoneSwitch.resized" + u.browserW());
//		console.log(this);

		// Safari can only be minimized to 500px, so keep breakpoint above that
		if(u.browserW() < 520 && !this.state) {
//			console.log("switchOn");
			this.switchOn();
		}
		else if(u.browserW() > 520 && this.state) {
			this.switchOff();
		}
		
	}

	this.switchOn = function() {
//		console.log("this.switchOn");

		if(!this.panel) {
//			console.log("create it");

			this.state = true;
			
			this.panel = u.ae(document.body, "div", {"id":"smartphone_switch"});
			u.ass(this.panel, {
				opacity: 0
			});

			u.ae(this.panel, "h1", {html:u.stringOr(u.txt("smartphone-switch-headline"), "Hello curious")});
			if(u.txt("smartphone-switch-text").length) {
				for(i = 0; i < u.txt("smartphone-switch-text").length; i++) {
					u.ae(this.panel, "p", {html:u.txt("smartphone-switch-text")[i]});
				}
			}

			var ul_actions = u.ae(this.panel, "ul", {class:"actions"});
			var li; 
			li = u.ae(ul_actions, "li", {class:"hide"});
			var bn_hide = u.ae(li, "a", {class:"hide button", html:u.txt("smartphone-switch-bn-hide")});

			li = u.ae(ul_actions, "li", {class:"switch"});
			var bn_switch = u.ae(li, "a", {class:"switch button primary", html:u.txt("smartphone-switch-bn-switch")});



			u.e.click(bn_switch);
			bn_switch.clicked = function() {
				u.saveCookie("smartphoneSwitch", "on");
				location.href = location.href.replace(/[&]segment\=desktop|segment\=desktop[&]?/, "") + (location.href.match(/\?/) ? "&" : "?") + "segment=smartphone";
			}

			u.e.click(bn_hide);
			bn_hide.clicked = function() {
				u.e.removeWindowEvent(u.smartphoneSwitch.event_id);
				u.smartphoneSwitch.switchOff();
			}


			u.a.transition(this.panel, "all 0.5s ease-in-out");
			u.ass(this.panel, {
				opacity: 1
			});

		
			if(this.callback_node && typeof(this.callback_node.smartphoneSwitchedOn) == "function") {
				this.callback_node.smartphoneSwitchedOn();
			}
		}
	}


	this.switchOff = function() {

//		console.log("this.switchOff");

		if(this.panel) {
//			console.log("destroy it");

			this.state = false;

			this.panel.transitioned = function() {
				this.parentNode.removeChild(this);
				delete u.smartphoneSwitch.panel;
			}


			u.a.transition(this.panel, "all 0.5s ease-in-out");
			u.ass(this.panel, {
				opacity: 0
			});


			if(this.callback_node && typeof(this.callback_node.smartphoneSwitchedOff) == "function") {
				this.callback_node.smartphoneSwitchedOff();
			}

		}

	}

}
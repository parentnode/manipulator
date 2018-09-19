// example of function call


// one node, 
// one transition
// multiple attributes
u.a.to(node, "1s ease-in 0.5s", {"left":100,"top":200});

// examples
u.a.to(node, "1s ease-in", {"rotate:"20});
u.a.to(node, "1s ease-in 0.5s", {"x1":100,"x2":200});
u.a.to(node, "1s ease-in 0.5s", {"translate":[20,40]});
u.a.to(node, "1000ms cubic-bezier(.2, 0.51, .7, .71) 0.5s", {"left":100,"top":200,"width":130,"opacity":20});

// syntax alternative
// one node,
// one transition
// multiple attributes
u.a.to(node, "1000ms cubic-bezier(.2, 0.51, .7, .71) 0.5s", {
	"radius":100,
	"stroke-width":20,
	"fill":"#232323"
});
u.a.to(
	node1, 
	"1000ms cubic-bezier(.2, 0.51, .7, .71) 0.5s", 
	{
		"radius":100,
		"stroke-width":20,
		"fill":"#232323"
	}
);


// theoretic syntax alternative
// one node,
// one transition
// multiple attributes
u.a.to(node1, "1000ms cubic-bezier(.2, 0.51, .7, .71) 0.5s", {
	left:100,
	right:200,
	width:130,
	opacity:20
});



// one node, 
// multiple transitions
// multiple attributes, 
u.a.to(node1, [
	"1s cubic-bezier(.21, .5, .71, 0.7)", {"border-radius":20,"top":130},
	"1s cubic-bezier(.2, 0.51, .7, .71)", {"x1":130,"x2":120}
]);

// syntax alternative
// one node, 
// multiple transitions
// multiple incremental and drecremental attributes 
u.a.to(node1, [
	"1s ease-in", {"x1":"+30","x2":"-80"},
	"1s ease-in", {"x1":"+30","x2":"-80"}
]);



// multiple nodes, 
// multiple transitions
// multiple attributes 
// :-)
u.a.to(node1, "1s ease-in 0.5s", {"x1":100,"x2":200});
u.a.to(node2, "2s ease-in" {"x1":200,"x2":100});
u.a.to(node3, "2s ease-in" {"x1":200,"x2":100}();






/* OLD CRAP */


// u-transtions.js
// 
// transitionTo = function
// 
// 	type: (can be combined)
// 		
// 		scale
// 		scale_transition
// 		rotate
// 		translate
// 		opacity
// 		rotate_transition
// 		translate_transition
// 		opacity_transition
// 
// 
// 		slidertl
// 		slideltr
// 		slidettb
// 		slidebtt
// 
// 		atomize
// 
// 		slidertl_transition
// 		slideltr_transition
// 		slidettb_transition
// 		slidebtt_transition
// 
// 		atomize_transition






			u.transitionto = new Object();
			// transition scenes to the left
			u.transitionto.animateLeft = function() {
//				u.bug("animateLeft transition");

				var scenes = u.qsa(".scene", this.page.cN);

				u.a.transition(scenes[scenes.length-1], "none");
				u.a.translate(scenes[scenes.length-1], (this.page.offsetWidth), 0);
				u.a.setOpacity(scenes[scenes.length-1], 1);
				u.as(scenes[scenes.length-1], "display", "block");

				scenes[0].transitioned = function() {
//					u.bug("cancel animateLeft 0 - clean")
					this.transitioned = null;
					u.a.transition(this, "none");

					// clean up
					this.cN.cleanScenes();

					if(fun(this.entered)) {
						this.entered();
					}
				}
				scenes[scenes.length-1].transitioned = function() {
//					u.bug("cancel animateLeft N");

					this.transitioned = null;
					u.a.transition(this, "none");
				}

				if(scenes[0]._x != -(this.page.offsetWidth)) {
					u.a.transition(scenes[0], "all 0.3s ease-out");
					u.a.translate(scenes[0], -(this.page.offsetWidth), scenes[0]._y);
				}
				else {
					scenes[0].transitioned();
				}
				u.a.transition(scenes[scenes.length-1], "all 0.3s ease-out");
				u.a.translate(scenes[scenes.length-1], 0, 0);
			}

			// transition scenes to the right
			u.transitionto.animateRight = function() {
//				u.bug("animateRight transition:" + u.qsa(".scene", this.page.cN).length);

				var scenes = u.qsa(".scene", this.page.cN);

				u.a.transition(scenes[scenes.length-1], "none");
				u.a.translate(scenes[scenes.length-1], -(this.page.offsetWidth), 0);
				u.a.setOpacity(scenes[scenes.length-1], 1);
				u.as(scenes[scenes.length-1], "display", "block");

				scenes[0].transitioned = function() {
//					u.bug("cancel animateRight 0 - clean")
					this.transitioned = null;
					u.a.transition(this, "none");

					// clean up
					this.cN.cleanScenes();

					if(fun(this.entered)) {
						this.entered();
					}
				}
				scenes[scenes.length-1].transitioned = function() {
//					u.bug("cancel animateRight N");
					this.transitioned = null;
					u.a.transition(this, "none");

					// clean up
					this.cN.cleanScenes();
				}


				if(scenes[0]._x != (this.page.offsetWidth)) {
					u.a.transition(scenes[0], "all 0.3s ease-out");
					u.a.translate(scenes[0], (this.page.offsetWidth), scenes[0]._y);
				}
				else {
					scenes[0].transitioned();
				}

				u.a.transition(scenes[scenes.length-1], "all 0.3s ease-out");
				u.a.translate(scenes[scenes.length-1], 0, 0);
			}

			// drop in from top
			u.transitionto.pullUp = function() {
//				u.bug("pullUp transition");

				var scenes = u.qsa(".scene", this.page.cN);

				scenes[0].transitioned = function() {
//					u.bug("cancel pullUp 0 - clean")

					this.transitioned = null;
					u.a.transition(this, "none");

					// clean up
					this.cN.cleanScenes();

					if(fun(this.cN.scene.entered)) {
						this.cN.scene.entered();
					}
				}

				u.a.transition(scenes[0], "none");
				u.a.transition(scenes[scenes.length-1], "none");

				u.as(scenes[0], "zIndex", 10);
				u.as(scenes[scenes.length-1], "zIndex", 5);

				u.a.translate(scenes[scenes.length-1], 0, 0);
				u.a.setOpacity(scenes[scenes.length-1], 1);
				u.as(scenes[scenes.length-1], "display", "block");

				if(scenes[0]._x != -(scenes[0].offsetHeight)) {
					u.a.transition(scenes[0], "all 0.5s ease-out");
					u.a.translate(scenes[0], 0, -(scenes[0].offsetHeight));
				}
				else {
					scenes[0].transitioned();
				}
			}

			// drop in from top
			u.transitionto.dropDown = function() {
//				u.bug("dropDown transition")

				var scenes = u.qsa(".scene", this.page.cN);

				scenes[scenes.length-1].transitioned = function() {
//					u.bug("cancel dropDown N - clean")
					this.transitioned = null;
					u.a.transition(this, "none");

					// clean up
					this.cN.cleanScenes();

					if(fun(this.entered)) {
						this.entered();
					}
				}

				u.a.transition(scenes[0], "none");
				u.a.transition(scenes[scenes.length-1], "none");

				u.as(scenes[0], "zIndex", 5);
				u.as(scenes[scenes.length-1], "zIndex", 1);

				u.a.setOpacity(scenes[scenes.length-1], 1);
				u.as(scenes[scenes.length-1], "display", "block");
				u.a.translate(scenes[scenes.length-1], 0, -(scenes[scenes.length-1].offsetHeight));


				u.as(scenes[scenes.length-1], "zIndex", 10);

				if(scenes[scenes.length-1]._y != 0) {
					u.a.transition(scenes[scenes.length-1], "all 0.5s ease-out");
					u.a.translate(scenes[scenes.length-1], 0, 0);
				}
				else {
					scenes[scenes.length-1].transitioned();
				}
			}

			// fade in - static position
			u.transitionto.fadeIn = function() {
//				u.bug("fadeIn transition:" + u.qsa(".scene", this.page.cN).length)

				// cleanup + enter on transition
				var scene = u.qs(".scene", this.page.cN);
				scene.transitioned = function(event) {
//					u.bug("cancel dropDown 0 - clean")
					this.transitioned = null;
					u.a.transition(this, "none");

					this.cN.cleanScenes();

					// enter new scene
					var scene = u.qs(".scene", this.cN);
					scene.transitioned = function(event) {
//						u.bug("cancel fadeIn 0")
						this.transitioned = null;
						u.a.transition(this, "none");

						// clean up
						this.cN.cleanScenes();

						if(fun(this.entered)) {
							this.entered();
						}
					}

					u.a.transition(scene, "none");
					u.a.setOpacity(scene, 0);
					u.a.translate(scene, 0, 0);
					u.as(scene, "display", "block");

					u.a.transition(scene, "all 0.3s ease-out");
					u.a.setOpacity(scene, 1);
					
				}

				if(u.gcs(scene, "opacity") == 1) {
					u.a.transition(scene, "all 0.3s ease-out");
					u.a.setOpacity(scene, 0);
				}
				else {
					scene.transitioned();
				}
			}

			// no transition out - just show
			u.transitionto.hard = function() {
//				u.bug("hard transition");

				// clean up
				this.page.cN.cleanScenes();

				// enter new scene
				var scene = u.qs(".scene", this.page.cN);
				scene.transitioned = function(event) {
//					u.bug("cancel hard 0");
					this.transitioned = null;
					u.a.transition(this, "none");

					if(fun(this.entered)) {
						this.entered();
					}
				}

				u.a.transition(scene, "none");
				u.a.setOpacity(scene, 0);
				u.a.translate(scene, 0, 0);
				u.as(scene, "display", "block");

				u.a.transition(scene, "all 0.3s ease-out");
				u.a.setOpacity(scene, 1);
			}
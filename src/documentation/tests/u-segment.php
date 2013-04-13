<? $page_title = "Segment tests" ?>
<? $body_class = "tests" ?>
<? include_once("../php/header.php") ?>

	<style type="text/css">
		.scene div {margin: 0 0 5px;}
		.correct {background: green;}
		.error {background: red;}
	</style>
	<script type="text/javascript">
		Util.Objects["test"] = new function() {
			this.init = function(scene) {


				var Variants = new Object();
				Variants["Moz"] = new Object();
				Variants["Moz"]["Transform"] = "MozTransform";
				Variants["Moz"]["Transition"] = "MozTransition";
				Variants["Moz"]["TransitionEnd"] = "transitionend";

				Variants["webkit"] = new Object();
				Variants["webkit"]["Transform"] = "webkitTransform";
				Variants["webkit"]["Transition"] = "webkitTransition";
				Variants["webkit"]["TransitionEnd"] = "webkitTransitionEnd";


				function testVariant(variant) {

					var testNode = u.qs(".testNode", scene);

					// transform
					if(document.body.style[Variants[variant]["Transform"]] != undefined) {
						u.ae(scene, "div", ({"class":"correct"})).innerHTML = variant + "Transform: correct";
					}
					else {
						u.ae(scene, "div", ({"class":"error"})).innerHTML = variant + "Transform: error";
					}


					// Transition
					if(document.body.style[Variants[variant]["Transition"]] != undefined) {
						u.ae(scene, "div", ({"class":"correct"})).innerHTML = variant + "Transition: correct";
					}
					else {
						u.ae(scene, "div", ({"class":"error"})).innerHTML = variant + "Transition: error";
					}



					// translate
					testNode.style[Variants[variant]["Transform"]] = "translate(300px, 30px)";
					if(testNode.style[Variants[variant]["Transform"]] == "translate(300px, 30px)") {
						u.ae(scene, "div", ({"class":"correct"})).innerHTML = variant + "Transform translate: correct";
					}
					else {
						u.ae(scene, "div", ({"class":"error"})).innerHTML = variant + "Transform translate: error";
					}

					// translate3d
					testNode.style[Variants[variant]["Transform"]] = "translate3d(300px, 30px, 0px)";
					if(testNode.style[Variants[variant]["Transform"]] == "translate3d(300px, 30px, 0px)") {
						u.ae(scene, "div", ({"class":"correct"})).innerHTML = variant + "Transform translate3d: correct";
					}
					else {
						u.ae(scene, "div", ({"class":"error"})).innerHTML = variant + "Transform translate3d: error";
					}


					if(typeof(window.history.pushState) == "function") {
						u.ae(scene, "div", ({"class":"correct"})).innerHTML = "history.pushState: correct";
					}
					else {
						u.ae(scene, "div", ({"class":"error"})).innerHTML = "history.pushState: error";
					}

				}

				// webkit detection
				if(navigator.userAgent.match(/webkit/i)) {

					testVariant("webkit");

				}
				else if(navigator.userAgent.match(/firefox/i)) {

					testVariant("Moz");


				}
				else {
					alert("unknown browser?")
				}


			}

		}
	</script>
	<div id="content" class="events">
		<h2>Segment test</h2>
		<div class="scene i:test">
			<div class="testNode"></div>

		</div>
		<div class="request">
			<?= nl2br(print_r($_SERVER, true)) ?>
		</div>
		<div class="comments">
			
		</div>
		

	</div>

<? include_once("../php/footer.php") ?>
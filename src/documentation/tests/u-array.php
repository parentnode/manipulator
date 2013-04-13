<? $page_title = "Array tests" ?>
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

				var array = new Array("a", "b", "c", "d");

				// PUSH
				if(array.push("e") == 5 && array == "a,b,c,d,e") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "push: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "push: error";
				}

				// POP
				if(array.pop() == "e") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "pop: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "pop: error";

				}

				// REVERSE
				if(array.reverse() == "d,c,b,a") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "reverse: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "reverse: error";

				}

				// UNSHIFT
				if(array.unshift("z") == 5 && array == "z,d,c,b,a") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "unshift: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "unshift: error";
				}

				// SHIFT
				if(array.shift() == "z") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "shift: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "shift: error";
				}

				// INDEXOF
				if(array.indexOf("c") == 1 && array.indexOf("g") == -1) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "indexOf: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "indexOf: error";
				}

			}

		}
	</script>
	<div id="content" class="events">
		<h2>Array</h2>
		<div class="scene i:test">


		</div>
		<div class="comments"></div>

	</div>

<? include_once("../php/footer.php") ?>
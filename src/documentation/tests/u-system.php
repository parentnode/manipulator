<? $page_title = "SYSTEM tests" ?>
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

				var node;
				// u.explorer
				if(u.explorer() != false) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "explorer: correct "+u.explorer();
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "explorer: error";
				}

				// u.safari
				if(u.safari() != false) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "safari: correct "+u.safari();
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "safari: error";
				}

				// u.webkit
				if(u.webkit() != false) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "webkit: correct "+u.safari();
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "webkit: error";
				}

				// u.firefox
				if(u.firefox() != false) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "firefox: correct "+u.firefox();
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "firefox: error";
				}

				// u.opera
				if(u.opera() != false) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "opera: correct "+u.safari();
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "opera: error";
				}

				// u.windows
				if(u.windows() == true) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "windows: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "windows: error";
				}

				// u.osx
				if(u.osx() == true) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "osx: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "osx: error";
				}

			}

		}
	</script>
	<div id="content" class="events">
		<h2>SYSTEM</h2>
		<div class="scene i:test">

			<div id="domtest" class="pastel:lime">querySelector: #content .scene #domtest and addClass</div>
			<div class="domtest error"><span>querySelector: #content .scene .domtest span and toggleClass</span></div>

		</div>
		<div class="comments">
			
		</div>
		

	</div>

<? include_once("../php/footer.php") ?>
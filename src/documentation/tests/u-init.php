<? $page_title = "Init tests" ?>
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

				if(!scene.initialized) {
					scene.initialized = true;
					var init_div = u.qs(".init", scene)
					init_div.parentNode.removeChild(init_div);

					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "Initialized";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "Multiple initializations";
				}

			}

		}

	</script>
	<div id="content" class="events">
		<h2>Init</h2>
		<div class="scene i:test">

			<div class="init">Waiting for initialization</div>

		</div>
		<div class="comments"></div>

	</div>

<? include_once("../php/footer.php") ?>
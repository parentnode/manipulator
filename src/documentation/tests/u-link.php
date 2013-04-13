<? $page_title = "Link tests" ?>
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
				u.link(u.qs("#domtest"))
				// u.cutString
				if(u.qs("#domtest").className == "link") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "link: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "link: error";
				}
			}

		}
	</script>
	<div id="content" class="events">
		<h2>LINK</h2>
		<div class="scene i:test">

			<div id="domtest"><a href="http://testlink.dk">Testlink</a></div>

		</div>
		<div class="comments">
			
		</div>
		

	</div>

<? include_once("../php/footer.php") ?>
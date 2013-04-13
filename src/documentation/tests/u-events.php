<? $page_title = "Events tests" ?>
<? $body_class = "tests" ?>
<? include_once("../php/header.php") ?>

	<style type="text/css">
		.level1 {width: 960px; height: 600px; position: relative; background: red;}
		.level2 {width: 560px; height: 400px; position: absolute; left: 100px; top: 50px; padding: 50px 100px; background: green;}
		.level3 {width: 360px; height: 300px; padding: 50px 100px; background: blue;}
		.level4 {width: 160px; height: 200px; padding: 50px 100px; background: yellow;}
		.link {width: 100px; height: 50px; background: orange; position: absolute; right: 0; top: 0;}
		.link a {height: 50px; display: block; text-indent: -9999px;}
	</style>
	<script type="text/javascript">
		Util.Objects["test"] = new function() {
			this.init = function(scene) {

				var level1 = u.qs(".level1");
				var level2 = u.qs(".level2");
				var level3 = u.qs(".level3");
				var level4 = u.qs(".level4");

				var link = u.qs(".link");


				u.link(link);
				link.clicked = function(event) {
					u.e.kill(event);
					u.bug("link clicked")
				}


				u.e.click(level1);
				level1.clicked = function(event) {
					u.e.kill(event);
					u.bug("level1 clicked")
				}

				u.e.drag(level2, new Array(-100, -100, 10000, 10000));
				level2.picked = function(event) {
					u.bug("level 2 picked")
				}
				level2.moved = function(event) {
					u.bug("level 2 moved")
				}
				level2.dropped = function(event) {
					u.bug("level 2 dropped")
				}

				u.e.click(level2);
				level2.clicked = function(event) {
					u.e.kill(event);
					u.bug("level2 clicked")
				}

				u.e.click(level3);
				level3.clicked = function(event) {
					u.e.kill(event);
					u.bug("level3 clicked")
				}

				u.e.click(level4);
				level4.clicked = function(event) {
					u.e.kill(event);
					u.bug("level4 clicked")
				}

		//		u.bug("level1:" + level1.className);
		//		u.bug("level2:" + level2.className);
		//		u.bug("level3:" + level3.className);
		//		u.bug("level4:" + level4.className);
			}

		}
	</script>
	<div id="content" class="events">
		<h2>Events</h2>
		<div class="scene i:test">

			<div class="level1">click
				<div class="level2">drag + click
					<div class="level3">click
						<div class="level4">click</div>
					</div>
				</div>
			</div>

			<div class="link">
				<a href="#">link</a>
			</div>


		</div>
		<div class="comments"></div>

	</div>

<? include_once("../php/footer.php") ?>
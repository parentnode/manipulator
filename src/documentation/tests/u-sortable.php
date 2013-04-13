<? $page_title = "Sortable tests" ?>
<? $body_class = "tests" ?>
<? include_once("../php/header.php") ?>

	<style type="text/css">
		.sortable {list-style: none;}
		.sortable li {padding: 10px; margin: 1px; border: 1px solid red;}
	</style>
	<script type="text/javascript">
		Util.Objects["test"] = new function() {
			this.init = function(scene) {

				var list = u.qs(".sortable", scene);
				u.s.sortable(list);

				e.picked = function(event) {}
				e.moved = function(event) {}
				e.dropped = function(event) {}

			}

		}
	</script>
	<div id="content" class="events">
		<h2>Sortable</h2>
		<div class="scene i:test">

			<ul class="sortable">
				<li>test 1</li>
				<li>test 2</li>
				<li>test 3</li>
			</ul>

		</div>
		<div class="comments"></div>

	</div>

<? include_once("../php/footer.php") ?>
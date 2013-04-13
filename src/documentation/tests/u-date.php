<? $page_title = "Cookie tests" ?>
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

				// u.bug(u.date("Y-m-d"));
				// u.bug(u.date("Y-m-d", 1331809993423));
				// u.bug(u.date("Y-m-d", "Sat Mar 10 17:58:43 +0000 2012"));
				// u.bug(u.date("Y-m-d", "Thu Mar 12 2012 12:13:36 GMT+0100 (CET)"));


				if(u.date("Y-m-d", 1331809993423) == "2012-03-15") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = 'u.date("Y-m-d", 1331809993423): correct';
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = 'u.date("Y-m-d", 1331809993423): error';
				}

				if(u.date("Y-m-d", "Sat Mar 10 17:58:43 +0000 2012") == "2012-03-10") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = 'u.date("Y-m-d", "Sat Mar 10 17:58:43 +0000 2012"): correct';
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = 'u.date("Y-m-d", "Sat Mar 10 17:58:43 +0000 2012"): error';
				}

				if(u.date("Y-m-d", "Mon Mar 12 2012 12:13:36 GMT+0100 (CET)") == "2012-03-12") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = 'u.date("Y-m-d", "Mon Mar 12 2012 12:13:36 GMT+0100 (CET)"): correct';
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = 'u.date("Y-m-d", "Mon Mar 12 2012 12:13:36 GMT+0100 (CET)"): error';
				}


			}

		}
	</script>
	<div id="content" class="events">
		<h2>Date</h2>
		<div class="scene i:test">


		</div>
		<div class="comments"></div>

	</div>

<? include_once("../php/footer.php") ?>
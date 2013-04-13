<? $page_title = "Cookie tests" ?>
<? $body_class = "tests" ?>
<? include_once("../php/header.php") ?>

	<style type="text/css">

	</style>
	<script type="text/javascript">
		Util.Objects["test"] = new function() {
			this.init = function(scene) {

				
				// saveCookie
				u.bug("saveCookie:" + u.saveCookie("test", "test-value"));
				u.bug("cookie:" + document.cookie);
				u.bug("getCookie:" + u.getCookie("test"));

				// savePermCookie

				// getCookie

				// delCookie


				if(u.date("Y-m-d", 1331809993423) == "2012-03-15") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = 'u.date("Y-m-d", 1331809993423): correct';
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = 'u.date("Y-m-d", 1331809993423): error';
				}

			}

		}
	</script>
	<div id="content" class="events">
		<h2>Cookie</h2>
		<div class="scene i:test">


		</div>
		<div class="comments"></div>

	</div>

<? include_once("../php/footer.php") ?>
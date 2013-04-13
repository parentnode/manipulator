<? $page_title = "DOM tests" ?>
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

				// u.sc, u.ac, u.rc, u.tc, u.hc
				u.setClass(u.qs("h2"), "headline")
				if(u.qs("h2").className == "headline") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "setClass: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "setClass: error";
				}

				u.addClass(u.qs("h2"), "added_headline")
				if(u.qs("h2").className == "headline added_headline") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "addedClass: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "addedClass: error";
				}

				u.removeClass(u.qs("h2"), "added_headline")
				if(u.qs("h2").className == "headline") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "removeClass: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "removeClass: error";
				}

				u.toggleClass(u.qs("h2"), "headline", "new_headline")
				if(u.qs("h2").className == "new_headline") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "toggleClass: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "toggleClass: error";
				}

				if(u.hc(u.qs("h2"), "new_headline") == true) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "hasClass: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "hasClass: error";
				}

				// u.getIJ
				if(u.getIJ(u.qs("#domtest"), "pastel") == "lime") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "getIJ: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "getIJ: error";
				}
				
				// selector test 1
				node = u.qs("#domtest", scene);
				u.ac(node, "correct", "error");

				// selector test 2
				node = u.qs(".domtest span", scene);
				u.tc(node.parentNode, "correct", "error");


				// append child
				u.ae(scene, "div", ({"class":"correct"})).innerHTML = "append element: correct";


				// return matches (can we uses references for comparison)
				if(scene == u.qs("#content .scene")) {
					u.ie(scene, "div", ({"class":"correct"})).innerHTML = "insert element and element type: correct";
				}
				else {
					u.ie(scene, "div", ({"class":"error"})).innerHTML = "insert element and element type: error";
				}

				// u.qs
				if(u.qs("#content").className == "events") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "querySelector: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "querySelector: error";
				}

				// u.qsa
				if(u.qsa("#content #domtest, #content .domtest").length == 2) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "querySelectorAll: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "querySelectorAll: error";
				}
				

				// ge + ges
				if(u.ge("content").id == "content") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "getElement: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "getElement: error";
				}
				if(u.ges("span").length == 1) {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "getElements: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "getElements: error";
				}
				
				// ns + ps + gs
				if(u.ns(u.qs(".scene")).className == "bla") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "nextSibling: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "nextSibling: error";
				}				

				if(u.ps(u.qs(".bla")).className == "scene") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "previousSibling: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "previousSibling: error";
				}

				if(u.gs(u.qs(".domtest"), "prev").id == "domtest") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "getSibling: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "getSibling: error";
				}
				
				// wrap element
				u.we(u.qs(".bla"), "div", ({"class":"wrap"}))
				if(u.qs(".bla").parentNode.className == "wrap") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "wrapElement: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "wrapElement: error";
				}
				
				//as & gcs
				u.as(u.qs(".domtest"), "height", "20px")
				if(u.gcs(u.qs(".domtest"), "height") == "20px") {
					u.ae(scene, "div", ({"class":"correct"})).innerHTML = "addStyle: correct";
				}
				else {
					u.ae(scene, "div", ({"class":"error"})).innerHTML = "addStyle: error";
				}

			}

		}
	</script>
	<div id="content" class="events">
		<h2>DOM</h2>
		<div class="scene i:test">

			<div id="domtest" class="pastel:lime">querySelector: #content .scene #domtest and addClass</div>
			<div class="domtest error"><span>querySelector: #content .scene .domtest span and toggleClass</span></div>

		</div>
		<div class="bla"></div>
		<div class="comments">
			As for the computed style in u.gcs IE8- and newer browsers returns different values. For height IE8- returns just "20" and FF returns "20px".
		</div>
		

	</div>

<? include_once("../php/footer.php") ?>
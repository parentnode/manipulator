<? $page_title = "Request tests" ?>
<? $body_class = "tests" ?>
<? include_once("../php/header.php") ?>

	<style type="text/css">
		.scene div {margin: 0 0 5px;}
		.correct {background: green;}
		.error {background: red;}
	</style>
	<script type="text/javascript">
		Util.Objects["test"] = new function() {
			this.init = function(node) {

				node._span = u.qs("span", node);

				node.Response = function(response) {
					if(response.isHTML && u.qs("h1", response).innerHTML == "test") {
						u.ac(this, "correct");
						this._span.innerHTML += (u.getIJ(node, "async") ? " - async " : " - ") + u.getIJ(node, "method") + " request valid";
					}
					else if(response.isJSON && response.h1 == "test") {
						u.ac(this, "correct");
						this._span.innerHTML += (u.getIJ(node, "async") ? " - async " : " - ") + u.getIJ(node, "method") + " request valid";
					}
					else {
						u.ac(this, "error");
						this._span.innerHTML += (u.getIJ(node, "async") ? " - async " : " - ") + u.getIJ(node, "method") + " request invalid";
					}
				}
				u.Request(node, node._span.innerHTML, u.f.getParams(node), u.getIJ(node, "method"), u.getIJ(node, "async"));

			}

		}

	</script>
	<div id="content" class="events">
		<h2>Request</h2>
		<div class="scene">

			<form name="test" action="" method="">

				<div class="i:test method:post">
					<input type="hidden" name="hidden_field" value="hidden_value" />
					<span>ajax/test.json</span>
				</div>
				<div class="i:test method:post">
					<input type="hidden" name="hidden_field" value="hidden_value" />
					<span>ajax/test.html</span>
				</div>
				<div class="i:test method:post async:true">
					<input type="hidden" name="hidden_field" value="hidden_value" />
					<span>ajax/test.json</span>
				</div>
				<div class="i:test method:post async:true">
					<input type="hidden" name="hidden_field" value="hidden_value" />
					<span>ajax/test.html</span>
				</div>
				<div class="i:test method:get">
					<input type="hidden" name="hidden_field" value="hidden_value" />
					<span>ajax/test.json?test=fisk</span>
				</div>
				<div class="i:test method:get">
					<input type="hidden" name="hidden_field" value="hidden_value" />
					<span>ajax/test.html</span>
				</div>
				<div class="i:test method:get async:true">
					<input type="hidden" name="hidden_field" value="hidden_value" />
					<span>ajax/test.json</span>
				</div>
				<div class="i:test method:get async:true">
					<input type="hidden" name="hidden_field" value="hidden_value" />
					<span>ajax/test.html</span>
				</div>
				<div class="i:test method:script">
					<input type="hidden" name="hidden_field" value="hidden_value" />
					<span>ajax/test.jsonp.php</span>
				</div>

			</form>
		</div>
		<div class="comments">
			Add parameters to test!
		</div>

	</div>

<? include_once("../php/footer.php") ?>
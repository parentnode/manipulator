<? $page_title = "Animation tests" ?>
<? $body_class = "tests" ?>
<? include_once("../php/header.php") ?>

	<style type="text/css">
		.scene {position: relative; height: 400px;}
		.scene div {margin: 0 0 5px;}
		.block {position: absolute; top: 0; left: 0; width: 50px; height: 50px; background: red;}

		.linear {top: 0;}
		.easeIn {top: 55px;}
		.easeOut {top: 110px;}
		.easeInOut {top: 165px;}

		.correct {background: green;}
		.error {background: red;}
	</style>
	<script type="text/javascript">
		Util.Objects["test"] = new function() {
			function linear(time, duration){
			  return time / duration;
			}
			function easeIn(time, duration){
			  return Math.pow(time / duration, 3);
			}
			function easeOut(time, duration){
				return 1 - Math.pow(1 - (time / duration), 3);
			}
			function easeInOut(time, duration){
				if(time > (duration / 2)) {
					return easeOut(time, duration);
				}
				return easeIn(time, duration);
			}

			this.init = function(scene) {

				scene.distance = 800;
				scene.duration = 2000;

				scene.iterations = 20;
				scene.iteration = 1;

				scene.block_li = u.qs(".block.linear", scene);
				scene.block_ei = u.qs(".block.easeIn", scene);
				scene.block_eo = u.qs(".block.easeOut", scene);
				scene.block_eio = u.qs(".block.easeInOut", scene);

				scene.move = function() {
//					u.bug("easeOut:" + this.iteration + "," + this.iterations + ":" + easeOut(this.iteration, this.iterations))

					u.as(this.block_li, "left", linear(this.iteration, this.iterations) * this.distance+"px");
					u.as(this.block_ei, "left", easeIn(this.iteration, this.iterations) * this.distance+"px");
					u.as(this.block_eo, "left", easeOut(this.iteration, this.iterations) * this.distance+"px");

					u.as(this.block_eio, "left", easeInOut(this.iteration, this.iterations) * this.distance+"px");

					this.iteration++
				}

				for(var i = scene.iteration; i <= scene.iterations; i++) {
					u.t.setTimer(scene, scene.move, (scene.duration / scene.iterations) * i);
				}
//				u.bug("easeOut:" + easeOut())

			}

		}
	</script>
	<div id="content" class="events">
		<h2>Animation - module in development</h2>
		<div class="scene i:test">

			<div class="block linear"></div>
			<div class="block easeIn"></div>
			<div class="block easeOut"></div>
			<div class="block easeInOut"></div>

		</div>
		<div class="comments">
			
		</div>
		

	</div>

<? include_once("../php/footer.php") ?>
<? $page_title = "Video tests" ?>
<? $body_class = "tests" ?>
<? include_once("../php/header.php") ?>

	<style type="text/css">
		.scene {width: 960px; height: 540px;}
		.player {width: 960px; height: 540px;}
		.controls .playpause {height: 20px; background: green; position: absolute; top: 200px; left: 50%;}
		.playing .controls .playpause {height: 20px; background: red;}
		.controls .playpause:before {content: "play";}
		.playing .controls .playpause:before {content: "pause";}
	</style>
	<script type="text/javascript">
		Util.Objects["test"] = new function() {
			this.init = function(scene) {

				scene.player = u.videoPlayer();
//				scene.player.stop();
//				scene.player.pause();
//				scene.player.play(100);


			}


		}
		function play1() {
			var scene = u.qs(".scene");
			scene.appendChild(scene.player);
			scene.player.loadAndPlay("/documentation/media/video/video.mp4");
		}
		function play2() {
			u.qs(".player").loadAndPlay("/documentation/media/video/video.mp4");
		}

//		var obj = u.flash(document.createElement("div"), "/documentation/media/flash/videoplayer.swf")	
		
	</script>
	
	<div id="content" class="events">
		<h2>Video</h2>
		<div class="scene i:test">

			

		</div>
		<div class="comments">
			<a onclick="play1();">load and play 1</a><br />
			<a onclick="play2();">load and play 2</a><br />
			<a onclick="u.flashVideoPlayer.ready(u.qs('.player').id);">ready</a>
		</div>
	</div>

<? include_once("../php/footer.php") ?>
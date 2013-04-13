<? include_once("php/header.php") ?>

	<div id="content">
		<h2>STRING</h2>
		
		<div class="section files">
			<div class="header">
				<h3>Files</h3>
			</div>
			<div class="body">

				<div class="files main">
					<h4>Main file</h4>
					<ul>
						<li>u-string.js</li>
					</ul>
				</div>

				<div class="files support">
					<h4>Segment support files</h4>
					<ul>
						<li>u-string-desktop_ie.js</li>
					</ul>
				</div>

				<div class="files dependency">
					<h4>Dependency files</h4>
					<ul>
						<li>none</li>
					</ul>
				</div>

			</div>
		</div>

		<div class="section segments">
			<div class="header">
				<h3>Segment dependencies</h3>
			</div>
			<div class="body">
				<dl class="segments">
					<dt>desktop</dt>
					<dd><span class="file">u-string.js</span></dd>

					<dt>desktop_ie</dt>
					<dd><span class="file">u-string.js</span> + <span class="file">u-string-desktop_ie.js</span></dd>

					<dt>desktop_light</dt>
					<dd><span class="file">u-string.js</span> + <span class="file">u-string-desktop_ie.js</span></dd>

					<dt>tablet</dt>
					<dd><span class="file">u-string.js</span></dd>

					<dt>tv</dt>
					<dd><span class="file">u-string.js</span></dd>

					<dt>mobile_touch</dt>
					<dd><span class="file">u-string.js</span></dd>
		
					<dt>mobile</dt>
					<dd class="todo">not tested</dd>
		
					<dt>mobile_light</dt>
					<dd class="todo">not tested</dd>

					<dt>basic</dt>
					<dd>not supported</dd>
				</dl>
			</div>
		</div>

		<div class="section">
			<div class="header">
				<h3>Functions</h3>
			</div>
			<div class="body">

				<div class="function">
					<div class="header">
						<h4>Util.cutString</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.cutString</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">none</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.cutString(<span class="type">String</span> <span class="var">string</span><span class="type">Number</span> <span class="var">length</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Will cut a given string to the number of letters wanted. Will end the string with "...".
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">identifier</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> string to cut
									</div>
								</dd>
				
								<dt><span class="var">target</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Length</span> The length of the string you want returned.
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>Returns the cutted string. </p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								var cutStringText = "This function will cut the string to the number of letter you'd like";
								u.cutString(cutStringText, 10)
		
								returns <span class="type">String</span> with text: "This fu..."
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>string.match</li>
									<li>string.indexOf</li>
									<li>string.substring</li>
								</ul>
							</div>

							<div class="jes">
								<h5>JES</h5>
								<ul>
									<li>none</li>
								</ul>
							</div>

						</div>
					</div>
				</div>

				<div class="function">
					<div class="header">
						<h4>Util.random</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.random</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">none</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.random(<span class="type">Number</span> <span class="var">min</span><span class="type">Number</span> <span class="var">max</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Will return a random number in the a given range
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">min</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Number</span> The min number that could be returned
									</div>
								</dd>
				
								<dt><span class="var">max</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Number</span> The max number that could be returned
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>A random number from the given range</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.random(1,10)
		
								returns <span class="type">Number</span> between 1 and 10. Both included
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>Math.round</li>
									<li>Math.random</li>
								</ul>
							</div>

							<div class="jes">
								<h5>JES</h5>
								<ul>
									<li>none</li>
								</ul>
							</div>

						</div>
					</div>
				</div>				

				<div class="function">
					<div class="header">
						<h4>Util.randomKey</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.randomKey</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">none</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.randomKey([<span class="type">String</span> <span class="var">length</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Will return a random key consisting of letters and/or numbers. If no length is chosen, 8 is the default length.
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">length</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> Optional. The length of the random key
									</div>
								</dd>
				
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>A random key consisting of letters and/or numbers</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.randomKey(10)
		
								returns <span class="type">String</span> cc65epfpsq
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>None</li>
								</ul>
							</div>

							<div class="jes">
								<h5>JES</h5>
								<ul>
									<li>u.random</li>
								</ul>
							</div>

						</div>
					</div>
				</div>

				<div class="function">
					<div class="header">
						<h4>Util.randomString</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.randomString</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">none</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.randomString([<span class="type">String</span> <span class="var">length</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Will return a random key consisting of letters. If no length is chosen, 8 is the default length.
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">length</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> Optional. The length of the random string
									</div>
								</dd>
				
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>A random string consisting of letters</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.randomString(10)
		
								returns <span class="type">String</span> mFrHGruzzo
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>None</li>
								</ul>
							</div>

							<div class="jes">
								<h5>JES</h5>
								<ul>
									<li>u.random</li>
								</ul>
							</div>

						</div>
					</div>
				</div>







			
			</div>

				
		</div>

	</div>

<? include_once("php/footer.php") ?>
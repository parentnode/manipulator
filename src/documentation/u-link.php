<? include_once("php/header.php") ?>

	<div id="content">
		<h2>LINK</h2>
		
		<div class="section files">
			<div class="header">
				<h3>Files</h3>
			</div>
			<div class="body">

				<div class="files main">
					<h4>Main file</h4>
					<ul>
						<li>u-link.js</li>
					</ul>
				</div>

				<div class="files support">
					<h4>Segment support files</h4>
					<ul>
						<li>none</li>
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
					<dd><span class="file">u-link.js</span></dd>

					<dt>desktop_ie</dt>
					<dd><span class="file">u-link.js</span></dd>

					<dt>desktop_light</dt>
					<dd><span class="file">u-link.js</span></dd>

					<dt>tablet</dt>
					<dd><span class="file">u-link.js</span></dd>

					<dt>tv</dt>
					<dd><span class="file">u-link.js</span></dd>

					<dt>mobile_touch</dt>
					<dd><span class="file">u-link.js</span></dd>
		
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
						<h4>Util.link</h4>
					</div>
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.link</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">none</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.link(<span class="type">String</span> <span class="var">e</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Finds the first a tag in an element (e) and turns the element into a link using the a's href. It will add classname "link" to the element.
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p></p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.link(u.qs("#testlink"));
								<code>
									&lt;div id=&quot;testlink&quot;&gt;
										&lt;a href=&quot;http://testlink.dk&quot;&gt;Testlink&lt;/a&gt;
									&lt;/div&gt;
								</code>
								will return the following
								<code>
									&lt;div id=&quot;testlink&quot; class=&quot;link&quot;&gt;
										&lt;a&gt;Testlink&lt;/a&gt;
									&lt;/div&gt;
								</code>
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>elementNode.removeAttribute</li>
								</ul>
							</div>

							<div class="jes">
								<h5>JES</h5>
								<ul>
									<li>u.qs</li>
									<li>u.addClass</li>
								</ul>
							</div>

						</div>
					</div>
				</div>




			
			</div>

				
		</div>

	</div>

<? include_once("php/footer.php") ?>
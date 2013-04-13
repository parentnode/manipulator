<? include_once("php/header.php") ?>

	<div id="content">
		<h2>Request</h2>

		<div class="section files">
			<div class="header">
				<h3>Files</h3>
			</div>
			<div class="body">

				<div class="files main">
					<h4>Main file</h4>
					<ul>
						<li>u-request.js</li>
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
						<li>u-dom.js</li>
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
					<!-- specify which files are required for which segments -->
					<!-- add todo class if segment is not tested yet -->
					<dt>desktop</dt>
					<dd><span class="file">u-request.js</span></dd>

					<dt>desktop_ie</dt>
					<dd><span class="file">u-request.js</span></dd>

					<dt>desktop_light</dt>
					<dd><span class="file">u-request.js</span></dd>

					<dt>tablet</dt>
					<dd><span class="file">u-request.js</span></dd>

					<dt>tv</dt>
					<dd><span class="file">u-request.js</span></dd>

					<dt>mobile_touch</dt>
					<dd><span class="file">u-request.js</span></dd>
		
					<dt>mobile</dt>
					<dd>not tested</dd>
		
					<dt>mobile_light</dt>
					<dd>not tested</dd>

					<dt>basic</dt>
					<dd>not supported</dd>
				</dl>
			</div>
		</div>

		<div class="section functions">
			<div class="header">
				<h3>Functions</h3>
			</div>
			<div class="body">

				<div class="function">
					<div class="header">
						<h4>Util.Request</h4>
					</div>
					<div class="body">

						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.Request</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.Request</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax"><span class="type">Void</span> = u.Request(
								<span class="type">Node</span> <span class="var">node</span>
								<span class="type">String</span> <span class="var">url</span>
								[, <span class="type">string</span> <span class="var">parameters</span> ]
								[, <span class="type">String</span> <span class="var">method</span> ]
								[, <span class="type">String</span> <span class="var">async</span> ]
							);
							</dd>
						</dl>
						<div class="description">
							<h4>Description</h4>
							<p>Make a server request using XMLHttpRequest or &lt;script&gt; injection in &lt;head&gt;.</p>
							<p>
								Makes callback to node.Response(response) when response is received. Declare this function
								on node to receive callback.
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>

							<dl class="parameters">
								<dt><span class="var">node</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Node</span> node to attach request to. Response callback will be made to this node.
									</div>
								</dd>
								<dt><span class="var">url</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> url to make request to.
									</div>
								</dd>
								<dt><span class="var">parameters</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> Optional - parameter string like var=test&var2=hest.
									</div>
								</dd>
								<dt><span class="var">method</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> Optional - Request method
									</div>
									<div class="details">
										<h5>Options</h5>
										<dl class="options">
											<dt><span class="value">POST</span></dt>
											<dd>POST parameters</dd>
											<dt><span class="value">GET</span></dt>
											<dd>Append parameters to url - DEFAULT</dd>
											<dt><span class="value">SCRIPT</span></dt>
											<dd>Script injection in header (JSONP)</dd>
										</dl>
									</div>
								</dd>
								<dt><span class="var">async</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Boolean</span> Optional - set to true for asynchronous request.
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p><span class="type">Void</span></p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
	<code>
	var node = u.qs("#content");
	node.Response = function(response) {
		var name = response.name;
	}
	u.Request(node, "/json");
	</code>
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<!-- list javascript functions used by function -->
								<h5>JavaScript</h5>
								<ul>
									<li>XMLHttpRequest/ActiveXObject</li>
									<li>String.match</li>
									<li>String.trim</li>
									<li>String.substr</li>
									<li>try ... catch</li>
									<li>Number.toString</li>
								</ul>
							</div>

							<div class="jes">
								<!-- list JES functions used by function -->
								<h5>JES</h5>
								<ul>
									<li>Util.querySelector</li>
									<li>Util.appendElement</li>
								</ul>
							</div>

						</div>

					</div>
				</div>
			</div>
		</div>

	</div>

<? include_once("php/footer.php") ?>
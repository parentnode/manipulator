<? include_once("php/header.php") ?>

	<div id="content" class="i:docpage">
		<h2>Array</h2>

		<div class="section files">
			<div class="header">
				<h3>files</h3>
			</div>
			<div class="body">
				<div class="files main">
					<h4>Main file</h4>
					<ul>
						<li>none</li>
					</ul>
				</div>

				<div class="files support">
					<h4>Segment support files</h4>
					<ul>
						<li><span class="file">u-array-desktop_light.js</span></li>
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
					<dd>No include required</dd>

					<dt>desktop_ie</dt>
					<dd><span class="file">u-array-desktop_light.js</span></dd>

					<dt>desktop_light</dt>
					<dd><span class="file">u-array-desktop_light.js</span></dd>

					<dt>tablet</dt>
					<dd>No include required</dd>

					<dt>tv</dt>
					<dd>No include required</dd>

					<dt>mobile_touch</dt>
					<dd>No include required</dd>
		
					<dt>mobile</dt>
					<dd class="todo">not tested</dd>
		
					<dt>mobile_light</dt>
					<dd class="todo">not tested</dd>

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
						<h4>Array.push</h4>
					</div>
					<div class="body">

						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Array.push</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">-</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">
								<span class="type">Integer</span> = Array.push(<span class="type">String</span> <span type="var">value</span>);
							</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>Add value to end of Array.</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>

							<dl class="parameters">
								<dt><em>value</em></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> String to add to end of Array
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p><span class="type">Integer</span> new length of Array</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example"></div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>none</li>
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
						<h4>Array.pop</h4>
					</div>
					<div class="body">

						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Array.pop</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">-</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax"><span class="type">String</span> = Array.pop();</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>Pops the last element off Array.</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<p>No parameters</p>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p><span class="type">String</span> value of last index in Array</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<!-- list javascript functions used by function -->
								<h5>JavaScript</h5>
								<ul>
									<li>none</li>
								</ul>
							</div>

							<div class="jes">
								<!-- list JES functions used by function -->
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
						<h4>Array.reverse</h4>
					</div>
					<div class="body">

						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Array.reverse</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">-</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax"><span class="type">Array</span> = Array.reverse();</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>Reverses order of Array.</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<p>No parameters</p>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p><span class="type">Array</span> Array in new order</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<!-- list javascript functions used by function -->
								<h5>JavaScript</h5>
								<ul>
									<li>none</li>
								</ul>
							</div>

							<div class="jes">
								<!-- list JES functions used by function -->
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
						<h4>Array.unshift</h4>
					</div>
					<div class="body">

						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Array.unshift</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">-</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax"><span class="type">Integer</span> = Array.unshift(<span class="type">String</span> <span class="var">value</span>);</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>Add value to beginning of Array.</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>

							<dl class="parameters">
								<dt><span class="var">value</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> value to add to beginning Array
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p><span class="type">Integer</span> new length of Array</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<!-- list javascript functions used by function -->
								<h5>JavaScript</h5>
								<ul>
									<li>Array.push</li>
									<li>Array.reverse</li>
								</ul>
							</div>

							<div class="jes">
								<!-- list JES functions used by function -->
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
						<h4>Array.shift</h4>
					</div>
					<div class="body">

						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Array.shift</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">-</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax"><span class="type">String</span> = Array.shift();</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>Removes first index of Array.</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<p>No parameters</p>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p><span class="type">String</span> value of first index of Array</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<!-- list javascript functions used by function -->
								<h5>JavaScript</h5>
								<ul>
									<li>none</li>
								</ul>
							</div>

							<div class="jes">
								<!-- list JES functions used by function -->
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
						<h4>Array.indexOf</h4>
					</div>
					<div class="body">

					<div class="name">Array.indexOf</div>

						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Array.indexOf</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">-</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax"><span class="type">Integer</span> = Array.indexOf(<span class="type">String</span> <span class="var">value</span>);</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>Does Array contain value.</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>

							<dl class="parameters">
								<dt><span class="var">value</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> value to look for in Array
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p><span class="type">Integer</span> index of value or -1 if not found</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<!-- list javascript functions used by function -->
								<h5>JavaScript</h5>
								<ul>
									<li>none</li>
								</ul>
							</div>

							<div class="jes">
								<!-- list JES functions used by function -->
								<h5>JES</h5>
								<ul>
									<li>none</li>
								</ul>
							</div>
						</div>

					</div>
				</div>

			</div>
		</div>

	</div>

<? include_once("php/footer.php") ?>
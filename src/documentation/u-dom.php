<? include_once("php/header.php") ?>

	<div id="content">
		<h2>DOM</h2>
		
		<div class="section files">
			<div class="header">
				<h3>Files</h3>
			</div>
			<div class="body">

				<div class="files main">
					<h4>Main file</h4>
					<ul>
						<li>u-dom.js</li>
					</ul>
				</div>

				<div class="files support">
					<h4>Segment support files</h4>
					<ul>
						<li>u-dom-desktop_light.js</li>
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
					<dd><span class="file">u-dom.js</span></dd>

					<dt>desktop_ie</dt>
					<dd><span class="file">u-dom.js</span> + <span class="file">u-dom-desktop_light.js</span></dd>

					<dt>desktop_light</dt>
					<dd><span class="file">u-dom.js</span> + <span class="file">u-dom-desktop_light.js</span></dd>

					<dt>tablet</dt>
					<dd><span class="file">u-dom.js</span></dd>

					<dt>tv</dt>
					<dd><span class="file">u-dom.js</span></dd>

					<dt>mobile_touch</dt>
					<dd><span class="file">u-dom.js</span></dd>
		
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
						<h4>Util.getElement</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.getElement</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.ge</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.getElement(<span class="type">String</span> <span class="var">id</span> [, <span class="type">Mixed</span> <span class="var">target</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Get element (id/class/tag)<br/>
								Returns elementById if possible<br/>
								else Returns first element with (partial) matching classname from target<br/>
								If no matches, return first element with tagname from target<br/>
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">identifier</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id, node classname or node tagname
									</div>
								</dd>
				
								<dt><span class="var">target</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Node</span> Optional, any given node could be used as scope
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>Returns elementById if possible<br/>
							else Returns first element with (partial) matching classname from target</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.getElement("content");
		
								returns <span class="type">Node</span> with id/classname content
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>document.getElementById</li>
									<li>document.getElementsByTagName</li>
									<li>RegExp.test</li>
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
						<h4>Util.getElements</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.getElements</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.ges</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.getElement(<span class="type">String</span> <span class="var">identifier</span>[, <span class="type">Mixed</span> <span class="var">target</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Get elements (class/tag)<br/>
								Returns all elements with (partial) matching classname from target<br/>
								If no matches, return elements with tagname from target<br/>
							</p>
						</div>


						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">identifier</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id, node classname or node tagname
									</div>
								</dd>
				
								<dt><span class="var">target</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Node</span> Optional, any given node could be used as scope
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>
								Returns all elements with (partial) matching classname from target<br/>
								If no matches, return elements with tagname from target
							</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.getElements("content");
		
								returns <span class="type">Node(s)</span> with id/classname(s) content
							</div>
						</div>


						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>document.getElementsByTagName</li>
									<li>RegExp.test</li>
									<li>Array.push</li>
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
						<h4>Util.querySelector</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.querySelector</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.qs</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.querySelector(<span class="type">String</span> <span class="var">query</span> [, <span class="type">Mixed</span> <span class="var">target</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Returns the first element within the document (using depth-first pre-order traversal of the document's nodes) that matches the specified group of selectors.
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">query</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>
				
								<dt><span class="var">target</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Node</span> Optional, any given node could be used as scope
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>Returns elementById if possible<br/>
							else Returns first element with (partial) matching classname from target</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.querySelector("#content");
		
								returns <span class="type">Node</span> with id content
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
									<li>none</li>
								</ul>
							</div>

						</div>
					</div>
				</div>
				<div class="function">
					<div class="header">
						<h4>Util.querySelectorAll</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.querySelectorAll</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.qsa</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.querySelectorAll(<span class="type">String</span> <span class="var">query</span> [, <span class="type">Mixed</span> <span class="var">target</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Returns a list of the elements within the document (using depth-first pre-order traversal of the document's nodes) that match the specified group of selectors. The object returned is a NodeList.
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">query</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>
				
								<dt><span class="var">target</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Node</span> Optional, any given node could be used as scope
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>Returns a list of the elements within the document that match the specified group of selectors.</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.querySelectorAll("#content .domtest");
		
								returns <span class="type">Node(s)</span> with classnames domtest
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
									<li>none</li>
								</ul>
							</div>

						</div>
					</div>
				</div>
				<div class="function">
					<div class="header">
						<h4>Util.getSibling</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.getSibling</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.gs</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.getSibling(<span class="type">String</span> <span class="var">e</span>[, <span class="type">Mixed</span> <span class="var">direction</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								get sibling (get next/prev parentnode childnode of same type)
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Node</span> 
									</div>
								</dd>
				
								<dt><span class="var">direction</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> "prev" or "next" sibling
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>The previous sibling of the same type of the chosen node. By choosing "next" you can get the next sibling</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.getSibling(u.qs("#content"), "next");
		
								returns the next element of the same type as #content
							</div>
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
						<h4>Util.previousSibling</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.previousSibling</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.ps</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.previousSibling(<span class="type">String</span> <span class="var">e</span> [, <span class="type">String</span> <span class="var">exclude</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Returns previous sibling, not counting text nodes as siblings and ignoring optional exclude=className/nodeName
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>
				
								<dt><span class="var">exclude</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> Optional, node id node classname or node tagname
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>Returns previous sibling</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.previousSibling(u.qs(".footer"));
<code>						
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>							
		
								returns <span class="type">Node</span> with classname header
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>String.match</li>
									<li>String.toUpperCase</li>
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
						<h4>Util.nextSibling</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.nextSibling</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.ns</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.nextSibling(<span class="type">String</span> <span class="var">e</span> [, <span class="type">String</span> <span class="var">exclude</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Returns next sibling, not counting text nodes as siblings and ignoring optional exclude=className/nodeName
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>
				
								<dt><span class="var">exclude</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> Optional, node id node classname or node tagname
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>Returns next sibling</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.nextSibling(u.qs(".header"));
<code>								
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>
								
		
								returns <span class="type">Node</span> with classname footer
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>String.match</li>
									<li>String.toUpperCase</li>
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
						<h4>Util.appendElement</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.appendElement</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.ae</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.appendElement(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">note_type</span> [, <span class="type">String</span> <span class="var">attribute</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Appends child to element e
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>

								<dt><span class="var">node_type</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> type of node you want to add
									</div>
								</dd>
				
								<dt><span class="var">attribute</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> Optional, JSON object which adds attributes on a node like target to an a node.
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>Returns the added node</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.appendElement(u.qs(".header"), "div", ({"class":"addedElement"}));
<code>								
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>
								
		
								returns <span class="type">Node</span> type div with the className: addedElement inserted into the header div
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>document.createElement</li>
									<li>typeof()</li>
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
						<h4>Util.insertElement</h4>
					</div>
					
					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.insertElement</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.ie</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.insertElement(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">note_type</span> [, <span class="type">String</span> <span class="var">attribute</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Inserts element to element e and put it in first
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>

								<dt><span class="var">node_type</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> type of node you want to add
									</div>
								</dd>
				
								<dt><span class="var">attribute</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> Optional, an attribute on a node like target to an a node
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>Returns the inserted node</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.insertElement(u.qs(".scene"), "div", ({"class":"insertedElement"}));
<code>								
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>							
		
								returns <span class="type">Node</span> type div with the className: insertedElement inserted into the scene div before the header div
							</div>
						</div>
					
						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>document.createElement</li>
									<li>typeof()</li>
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
						<h4>Util.getIJ</h4>
					</div>

					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.getIJ</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.sc</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.getIJ(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">id</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Gets a parameter from a class
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

								<dt><span class="var">id</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the parameter identifier that gives the parameter value
									</div>
								</dd>

							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>The parameter on a class</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.getIJ(u.qs("#top"), "header");

<code>						
&lt;div class=&quot;scene&quot;&gt;
	&lt;div id=&quot;top&quot; class=&quot;header:show&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>					

								 Will return "show" which is the parameter on the class: header
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>String.match</li>
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
						<h4>Util.setClass</h4>
					</div>

					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.setClass</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.sc</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.setClass(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">classname</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Clears all classnames from an element and sets a new one
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>

								<dt><span class="var">classname</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the new classname for the element
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
								u.setClass(u.qs(".footer"), "bottom");

<code>						
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>					

								 Will change the footer div classname from footer to bottom
							</div>
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
						<h4>Util.addClass</h4>
					</div>

					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.addClass</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.ac</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.addClass(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">classname</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Checks if the classname is on an element. If not will add it.
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>

								<dt><span class="var">classname</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the new classname for the element to be added
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
								u.addClass(u.qs(".footer"), "bottom");

<code>						
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>


								 Will add classname bottom to the already div with classname footer
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>RegExp.test</li>
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
						<h4>Util.removeClass</h4>
					</div>

					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.removeClass</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.rc</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.removeClass(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">classname</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Will remove all instances of the classname on the element
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>

								<dt><span class="var">classname</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the classname to be removed from the element
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
								u.removeClass(u.qs(".footer"), "bottom");
<code>						
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer bottom&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>


								 Will remove classname bottom the "footer bottom" div
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>RegExp.test</li>
									<li>String.replace</li>
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
						<h4>Util.toggleClass</h4>
					</div>

					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.toggleClass</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.tc</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.removeClass(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">classname</span>[, <span class="type">String</span> <span class="var">second_classname</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Will toggle classname on an element. If it's there already it will be removed. If it's not the it will be added. If second_classname is given the function will toggle the two classnames.
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>

								<dt><span class="var">classname</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the classname to be added or removed from the element
									</div>
								</dd>

								<dt><span class="var">second_classname</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the classname to toogle with the first classname
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
								u.toggleClass(u.qs(".footer"), "bottom");

<code>						
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer bottom&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>					

								 Will remove classname bottom the "footer bottom" div. If run again it will add it again
							</div>
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
									<li>Util.addClass</li>
									<li>Util.removeClass</li>
								</ul>
							</div>

						</div>
					</div>
				</div>
				<div class="function">
					<div class="header">
						<h4>Util.hasClass</h4>
					</div>

					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.hasClass</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.hc</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.hasClass(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">classname</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Checks if an element has a classname
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>

								<dt><span class="var">classname</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the classname that will be checked for
									</div>
								</dd>

							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>
								True or false if the element has the classname or not
							</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.hc(u.qs(".footer"), "footer");
<code>						
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>


								 Will return true since the div footer has the classname footer
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>regexp.test</li>
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
						<h4>Util.applyStyle</h4>
					</div>

					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.applyStyle</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.as</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.applyStyle(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">style</span>, <span class="type">String</span> <span class="var">value</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Adds a style to an element
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>

								<dt><span class="var">style</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the type of style to apply
									</div>
								</dd>

								<dt><span class="var">value</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the value to the applied style
									</div>
								</dd>

							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>

							</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.as(u.qs(".footer"), "height", "20px");

								<div class="scene">
									<div class="header"></div>
									<div class="footer"></div>
								</div>


								 Will add a height of 20px to the footer div
							</div>
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
						<h4>Util.getComputedStyle</h4>
					</div>

					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.getComputedStyle</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.gcs</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.getComputedStyle(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">style</span>, <span class="type">String</span> <span class="var">attribute</span>)</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Get elements computed style value for css attribute
							</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>
							<dl class="parameters">
								<dt><span class="var">e</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> node id node classname or node tagname
									</div>
								</dd>

								<dt><span class="var">attribute</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> the attribute you want the computed style on
									</div>
								</dd>

							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>

							</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.gcs(u.qs(".footer"), "height");

<code>						
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>


								 Will return whatever the computed height of footer is
							</div>
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
						<h4>Util.wrapElement</h4>
					</div>

					<div class="body">
						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.wrapElement</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.we</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax">Util.wrapElement(<span class="type">String</span> <span class="var">e</span>, <span class="type">String</span> <span class="var">wrap</span> [, <span class="type">String</span> <span class="var">attribute</span>])</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>
								Put an element around another element
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

								<dt><span class="var">wrap</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> element that wraps the e
									</div>
								</dd>

								<dt><span class="var">attribute</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> Optional, JSON object which adds attributes on a node like target to an a node.
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p>
								The wrapping object
							</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.wrapElement(u.qs(".footer"), "div");
<code>					
&lt;div class=&quot;scene&quot;&gt;
	&lt;div class=&quot;header&quot;&gt;&lt;/div&gt;
	&lt;div class=&quot;footer&quot;&gt;&lt;/div&gt;
&lt;/div&gt;
</code>					

								 Will put a div around the footer div
							</div>
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

			</div>

		</div>

	</div>

<? include_once("php/footer.php") ?>
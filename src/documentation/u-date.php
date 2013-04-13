<? include_once("php/header.php") ?>

	<div id="content">
		<h2>Date</h2>

		<div class="section files">
			<div class="header">
				<h3>Files</h3>
			</div>
			<div class="body">

				<div class="files main">
					<h4>Main file</h4>
					<ul>
						<li><span class="file">u-date.js</span></li>
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
					<dd><span class="file">u-date.js</span></dd>

					<dt>desktop_ie</dt>
					<dd><span class="file">u-date.js</span></dd>

					<dt>desktop_light</dt>
					<dd><span class="file">u-date.js</span></dd>

					<dt>tablet</dt>
					<dd><span class="file">u-date.js</span></dd>

					<dt>tv</dt>
					<dd><span class="file">u-date.js</span></dd>

					<dt>mobile_touch</dt>
					<dd><span class="file">u-date.js</span></dd>
		
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
						<h4>Util.date</h4>
					</div>
					<div class="body">

						<dl class="definition">
							<dt class="name">Name</dt>
							<dd class="name">Util.date</dd>
							<dt class="shorthand">Shorthand</dt>
							<dd class="shorthand">u.date</dd>
							<dt class="syntax">Syntax</dt>
							<dd class="syntax"><span class="type">String</span> = Util.date(<span class="type">String</span> <span class="var">format</span> [, <span class="type">Mixed</span> <span class="var">timestamp</span> [, <span class="type">Array</span> <span class="var">months</span>]]);</dd>
						</dl>

						<div class="description">
							<h4>Description</h4>
							<p>Format UNIX timestamp or reformat datetime string.</p>
						</div>

						<div class="parameters">
							<h4>Parameters</h4>

							<dl class="parameters">
								<dt><span class="var">format</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String</span> date/time format
									</div>
									<div class="details">

										<h5>Options</h5>
										<dl class="options">
											<dt><span class="value">d</span></dt>
											<dd>Day of the month, 2 digits with leading zeros: 01 to 31</dd>

											<dt><span class="value">j</span></dt>
											<dd> - Day of the month without leading zeros: 1 to 31</dd>

											<dt><span class="value">m</span></dt>
											<dd> - Numeric representation of a month, with leading zeros: 01 through 12</dd>

											<dt><span class="value">n</span></dt>
											<dd> - Numeric representation of a month, without leading zeros: 1 through 12</dd>

											<dt><span class="value">F</span></dt>
											<dd> - full month string, given as array</dd>

											<dt><span class="value">Y</span></dt>
											<dd> - A full numeric representation of a year, 4 digits</dd>

											<dt><span class="value">G</span></dt>
											<dd> - 24-hour format of an hour without leading zeros: 0 through 23</dd>

											<dt><span class="value">H</span></dt>
											<dd> - 24-hour format of an hour with leading zeros	00 through 23</dd>

											<dt><span class="value">i</span></dt>
											<dd> - Minutes with leading zeros	00 to 59</dd>

											<dt><span class="value">s</span></dt>
											<dd>Seconds, with leading zeros	00 through 59</dd>
										</dl>
									</div>
								</dd>
				
								<dt><span class="var">timestamp</span></dt>
								<dd>
									<div class="summary">
										<span class="type">String/Number</span> Optional, unix timestamp in milliseconds since 1970 or Date string
									</div>
									<div class="details">
										<p>If <span class="var">timestamp</span> is omitted, current time is used.</p>
										<h5>Options</h5>
										<dl class="options">
											<dt>Timestamp</dt>
											<dd>1331809993423 (milliseconds since 1970)</dd>
											<dt>Date string</dt>
											<dd>Mon Mar 12 2012 12:13:36 GMT+0100 (CET)</dd>
											<dt>Date string</dt>
											<dd>Sat Mar 10 17:58:43 +0000 2012</dd>
										</dl>
									</div>
								</dd>
								<dt><span class="var">months</span></dt>
								<dd>
									<div class="summary">
										<span class="type">Array</span> Optional, Array with months
									</div>
									<div class="details">
										<p>If months is omitted, the &quot;F&quot;-character cannot be used.</p>
										<h5>Options</h5>
										<dl class="options">
											<dt>Array</dt>
											<dd>new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");</dd>
										
										</dl>
									</div>
								</dd>
							</dl>
						</div>

						<div class="return">
							<h4>Returns</h4>
							<p><span class="type">String</span> Formatted date/time string.</p>
						</div>

						<div class="examples">
							<h4>Examples</h4>

							<div class="example">
								u.date("Y-m-d");
		
								returns 2011-03-24
							</div>
						</div>

						<div class="uses">
							<h4>Uses</h4>

							<div class="javascript">
								<h5>JavaScript</h5>
								<ul>
									<li>String.match</li>
									<li>String.replace</li>
									<li>Array.slice</li>
									<li>Date</li>
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
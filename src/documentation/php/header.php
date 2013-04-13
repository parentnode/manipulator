<? include_once("includes.php") ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<!-- (c) & (p) think.dk 2011 //-->
	<!-- All material protected by copyrightlaws, as if you didnt know //-->
	<title>JES - <?= isset($page_title) ? $page_title : "Javascript ExtensionS" ?></title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="keywords" content="" />
	<meta name="description" content="" />
	<meta name="viewport" content="width=device-width; initial-scale=1.0; minimum-scale=1.0; maximum-scale=1.0;" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<link type="text/css" rel="stylesheet" media="all" href="/documentation/css/lib/seg_<?= $_SESSION["segment"] ?>_include.css" />
	<script type="text/javascript" src="/documentation/js/lib/seg_<?= $_SESSION["segment"] ?>_include.js"></script>
</head>

<body<?= isset($body_class) ? ' class="'.$body_class.'"' : '' ?>>

<div id="page" class="i:page">

	<div id="header">
		<h1>JES - Javascript ExtensionS</h1>

		<ul class="servicenavigation">
			<li><a href="/documentation">JES front</a></li>
		</ul>
	</div>


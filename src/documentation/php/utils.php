<?php

function getVersionUrl($version = false) {

	if($version) {
		return "http://" . $version . "." . $_SERVER["HTTP_HOST"];
	}
	else {
		return "http://" . preg_replace("/[^.]^+/", "", $_SERVER["HTTP_HOST"]);
	}

}

?>
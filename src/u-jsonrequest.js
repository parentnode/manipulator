
// Send request to url, calls the JSONResponse function on object on response
Util.JSONRequest = function(url, node) {

	// remember yr´úrk
	node.url = url;

	// generate callback key
	var key = u.randomString();

	// create global reference
	document[key] = node;

	// add JSON Request to HTML head
	u.ae(u.qs("head"), "script", ({"type":"text/javascript", "src":node.url+"&callback=document."+key+".JSONResponse"}));
}

// debug response
Util.JSONResponse = function(response) {
	alert("base responder:" + response)
}

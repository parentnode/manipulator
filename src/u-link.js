Util.link = function(e) {
	var a = (e.nodeName.toLowerCase() == "a" ? e : u.qs("a", e));
	u.addClass(e, "link");
	e.url = a.href;
	a.removeAttribute("href");
	u.e.click(e);
}

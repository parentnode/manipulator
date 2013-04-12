Util.link = function(e) {
	var a = u.ge("a", e);
	u.addClass(e, "link");
	e.url = a.href;
	a.removeAttribute("href");
	u.e.click(e);
}

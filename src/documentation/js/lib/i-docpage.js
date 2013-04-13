Util.Objects["docpage_"] = new function() {
	this.init = function(content) {

		var i, func;
		var header, body;

		var sections = u.qsa(".section", content);

		var functions = u.qsa(".function", content);
		
		for(i = 0; func = functions[i]; i++) {
			func._header = u.qs(".header", func);
			func._header._func = func;
			func._body = u.qs(".body", func);
			func._body._func = func;

			u.ac(func._body, "hide");
			u.as(func._body, "display", "none");

			u.e.click(func._header);
			func._header.clicked = function(event) {
				if(u.tc(this._func._body, "hide", "show") == "show") {
					u.as(this._func._body, "display", "block");
				}
				else {
					u.as(this._func._body, "display", "none");
				}

			}
		}


//		alert("fis")
		

	}
}
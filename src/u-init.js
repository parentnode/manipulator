Util.Objects = u.o = new Object();

Util.init = function() {

	var i, e, elements, ij_value;
	elements = u.ges("i\:([_a-zA-Z0-9])+");

	for(i = 0; e = elements[i]; i++) {
		while((ij_value = u.getIJ(e, "i"))) {
//			u.bug("init:" + ij_value)
			u.removeClass(e, "i:"+ij_value);
			if(ij_value && typeof(u.o[ij_value]) == "object") {
				u.o[ij_value].init(e);
			}
		}
	}

	// enable mouse tracking
	// u.tracePointer();
}

u.e.addEvent(window, "load", u.init);
//window.onload = u.init;

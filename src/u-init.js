Util.Objects = u.o = new Array();

Util.init = function() {
	var i, e, elements, ij_value;
	elements = u.ges("i\:([_a-zA-Z0-9])+");

	for(i = 0; e = elements[i]; i++) {
		while((ij_value = u.getIJ(e, "i"))) {
//			u.bug("init:" + ij_value);
			u.removeClass(e, "i:"+ij_value);
			if(ij_value && typeof(u.Objects[ij_value]) == "object") {
				u.Objects[ij_value].init(e);
			}
		}
	}

	// enable mouse tracking
	// u.tracePointer();
}
window.onload = u.init;

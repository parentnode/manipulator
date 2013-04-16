Util.Objects = u.o = new Object();

Util.init = function(scope) {

	var i, node, nodes, object;
	scope = scope && scope.nodeName ? scope : document;

	nodes = u.ges("i\:([_a-zA-Z0-9])+");

	for(i = 0; node = nodes[i]; i++) {
		while((object = u.cv(node, "i"))) {
			// u.bug("init:" + object)
			u.rc(node, "i:"+object);
			if(object && typeof(u.o[object]) == "object") {
				u.o[object].init(node);
			}
		}
	}

}

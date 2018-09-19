Util.Objects = u.o = new Object();

Util.init = function(scope) {

	var i, node, nodes, object;
	scope = scope && scope.nodeName ? scope : document;

	nodes = u.ges("i\:([_a-zA-Z0-9])+", scope);

	for(i = 0; i < nodes.length; i++) {
		node = nodes[i];

		while((object = u.cv(node, "i"))) {
			// u.bug("init:" + object)
			u.rc(node, "i:"+object);
			if(object && obj(u.o[object])) {
				u.o[object].init(node);
			}
		}
	}

}

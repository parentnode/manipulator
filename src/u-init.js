Util.Modules = u.m = new Object();

Util.init = function(scope) {

	var i, node, nodes, module;
	scope = scope && scope.nodeName ? scope : document;

	nodes = u.ges("i\:([_a-zA-Z0-9])+", scope);

	for(i = 0; i < nodes.length; i++) {
		node = nodes[i];

		while((module = u.cv(node, "i"))) {
			// u.bug("init:" + module)
			u.rc(node, "i:"+module);
			if(module && obj(u.m[module])) {
				u.m[module].init(node);
			}
		}
	}

}

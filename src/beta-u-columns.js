
u.columns = function(node, _columns, insert) {

	var current_node = node;
	insert = insert || false;

	// Create column reference if it doesn't exist
	if(!node._tree) {
		if(insert) {
			node._tree = u.ie(node, "div", {
				"class":"c"
			})
		}
		else {
			node._tree = u.ae(node, "div", {
				"class":"c"
			})
		}
		node._tree.node = node;
		current_node = node._tree;

	}

	var _column, div_column, column, i, key, value, j;

	// loop through array of column objects/selectors
	for(i = 0; i < _columns.length; i++) {

		_column = _columns[i];

		if(typeof(_column) === "object") {

			key = Object.keys(_column)[0];
			value = _column[key];

			// Create new column
			div_column = u.ae(current_node, "div", {
				"class":key
			});
			// Use yourself as column
			div_column._tree = node._tree;

			// call with value array
			u.columns(div_column, value);
		}
		// Selector string
		else {

			var target, targets = u.qsa(_column, node._tree.node);
			if(targets) {

				for(j = 0; j < targets.length; j++) {
					target = targets[j];

					// Insert 
					div_column = u.ae(current_node, target);

					div_column._tree = node._tree;
				}

			}

		}

	}

}

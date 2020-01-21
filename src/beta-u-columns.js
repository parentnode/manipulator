
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
	for(j = 0; j < _columns.length; j++) {

		_column = _columns[j];

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

			var target = u.qs(_column, node._tree.node);
			if(target) {

				// Insert 
				div_column = u.ae(current_node, target);

				div_column._tree = node._tree;

			}

		}

	}

}

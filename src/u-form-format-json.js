// custom send types
// SAP JAVA Platform
Util.Form.customDataFormat["json"] = function(params) {

	return u.f.convertNamesToJsonObject(params);

}



// Convert param names to nested JSON object structure
u.f.convertNamesToJsonObject = function(params) {
 	var indexes, root, indexes_exsists, param;
	var object = new Object();


	// loop through params
	for(param in params) {

		// check for indexes
	 	indexes_exsists = param.match(/\[[^\]]/);

		// indexes exsists
		if(indexes_exsists) {
			// get root object name
			root = param.split("[")[0];
			// get clean set of indexes
			indexes = param.replace(root, "");

			// first time using this root
			if(typeof(object[root]) == "undefined") {
				object[root] = new Object();
			}

			// start recusive action to build object
			object[root] = this.recurseName(object[root], indexes, params[param]);
		}
		// no indexes - flat var
		else {
			object[param] = params[param];
		}
	}

	return object;
}

// recurse over input name
// object - abject at current level to recurse over
// indexes - remaining indexes string
// value - end value
u.f.recurseName = function(object, indexes, value) {
	// u.bug("recurseName with (" + indexes + ")");
	// u.bug("object to add to:");
	// u.bug(JSON.stringify(object));


	// get index from string
	var index = indexes.match(/\[([a-zA-Z0-9\-\_]+)\]/);
	var current_index = index[1];

	// update indexes
	indexes = indexes.replace(index[0], "");

	// still more indexes
 	if(indexes.match(/\[/)) {
		// u.bug("current index is " + current_index + " but there are more (" + indexes + ")");

		// object already an array
		if(object.length !== undefined) {
			// u.bug("object is array - look for (" + current_index + ")")

			var i;
			var added = false;

			// check if array already has matching key
			for(i = 0; i < object.length; i++) {

				// loop through existing array
				for(exsiting_index in object[i]) {

					// found matching key
					if(exsiting_index == current_index) {

						// start recursive action
						object[i][exsiting_index] = this.recurseName(object[i][exsiting_index], indexes, value);

						// object has been added - need to remember to be able to add unidentified indexes
						added = true;

					}

				}

			}


			// if object is not added - then add as object (will be changed to array later if more occurences of same index)
			if(!added) {

				// create temp object to 
				temp = new Object();
				temp[current_index] = new Object();
				temp[current_index] = this.recurseName(temp[current_index], indexes, value);

				object.push(temp);

			}
		}

		// index found - not array yet, created as object
		else if(typeof(object[current_index]) != "undefined") {

			// continue with recursive action - if deeper levels require it object will be converted to array
			object[current_index] = this.recurseName(object[current_index], indexes, value);

		}
		// index not found - just add index:value as new object
		else {

			object[current_index] = new Object();
			object[current_index] = this.recurseName(object[current_index], indexes, value);

		}
	}
	// deepest level
	else {

		// no more indexes ... this must be a value, add object
		object[current_index] = value;

	}

	return object;
}



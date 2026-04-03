// Object.values only from Chrome 54, Safari 10. Not available in IE
// But object prototypes are applied to all Objects (and everything is object, so we really don't want that)
u.objectValues = function(obj) {
	var key, values = [];
	for(key in obj) {
		if(obj.hasOwnProperty(key)) {
			values.push(obj[key]);
		}
	}
	return values;
}

// Objects in array finder
// Find index in array that has an object with specific value for key
// Implementation of Janitor PHP variant
u.arrayKeyValue = function(array, key, value) {
	// u.bug("arrayKeyValue", array, key, value);

	var i, object;
	if(array && array.length) {

		for(i = 0; i < array.length; i++) {
			object = array[i];
			if(obj(object) && object[key] === value) {
				return i
			}
		}
	}
	return false;

}
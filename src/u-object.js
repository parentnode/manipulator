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
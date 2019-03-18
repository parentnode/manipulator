// Dynamic text module
// Currently state all texts/translations via u.txt array

// Flexible dual use of u.txt (as array or function with extended functionality)

u.txt = function(index) {
	if(!u.translations) {

		// Enable loading of translations file
		u.bug("Should load translations for:", document.documentElement.lang);
	}

	if(u.txt[index]) {
		return u.txt[index];
	}

	u.bug("MISSING TEXT: "+index);
	return "";
}
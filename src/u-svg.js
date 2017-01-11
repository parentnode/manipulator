/**
* svg_object syntax:
*	{
* 		"node":scene,
* 		"width":300,
*		"height":300,
*		"shapes":[
*			{
*				"type": "circle",
*				"class": "circleclass",
*				"cx": 110,
*				"cy": 110,
*				"r": 100,
*				"fill": "#00ff00",
*				"filter":"f1"
*			},
*			{
*				"type": "path",
*				"d": "M50,50 100,100"
*			}
*		],
*		"filters": [
*			"name":"f1",
*			"type": "feGaussianBlur",
*	  		"stdDeviation": 2
*		] 
*	}
*/


Util.svg = function(svg_object) {
//	u.bug("create svg");

	var svg, shape, svg_shape;

	// when SVG's are used for icons or repeated graphics in website,
	// it is faster to clone than to recreate

	// if svg object has ID, store it in "cache", to be cloned if used again in same page


	// Look for svg in cache
	if(svg_object.name && u._svg_cache && u._svg_cache[svg_object.name]) {
		svg = u._svg_cache[svg_object.name].cloneNode(true);
	}

	// svg was not found in cache
	if(!svg) {
		svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");


		// TODO: implement filters
//		if(svg_object.filters[shape]) {}



		// loop through shapes in svg object
		for(shape in svg_object.shapes) {

			Util.svgShape(svg, svg_object.shapes[shape]);

		}


		// store svg in cache if it has an id
		if(svg_object.name) {
			if(!u._svg_cache) {
				u._svg_cache = {};
			}
			u._svg_cache[svg_object.name] = svg.cloneNode(true);
		}
	}

	// update metadata
	// width and height settings
	if(svg_object.title) {
		svg.setAttributeNS(null, "title", svg_object.title);
	}
	// Error in WKHTMLTO / Webkit 533, when using svg_object.class - but svg_object["class"] works
	if(svg_object["class"]) {
		svg.setAttributeNS(null, "class", svg_object["class"]);
	}

	if(svg_object.width) {
		svg.setAttributeNS(null, "width", svg_object.width);
	}
	if(svg_object.height) {
		svg.setAttributeNS(null, "height", svg_object.height);
	}
	if(svg_object.id) {
		svg.setAttributeNS(null, "id", svg_object.id);
	}
	if(svg_object.node) {
		svg.node = svg_object.node;
	}


	// if node is specified, append svg to node
	if(svg_object.node) {
		svg_object.node.appendChild(svg);
	}


	// return svg
	return svg;
	
	
}

/**
*	{
*		"type": "circle",
*		"class": "circleclass",
*		"cx": 110,
*		"cy": 110,
*		"r": 100,
*		"fill": "#00ff00",
*		"filter":"f1"
*	},
*/
Util.svgShape = function(svg, svg_object) {

	// create svg shape
	svg_shape = document.createElementNS("http://www.w3.org/2000/svg", svg_object["type"]);
	svg_object["type"] = null;
	delete svg_object["type"];

	// loop through the remaining details of shapes
	for(detail in svg_object) {

		svg_shape.setAttributeNS(null, detail, svg_object[detail]);
	}

	return svg.appendChild(svg_shape);

}

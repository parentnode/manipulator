Util.SVG = u.s = new function() {

	// cache
	this.objects = [];


	// pass svg as JSON object 
	this.create = function(object) {

		// return from cache
		if(object.id && this.objects[object.id]) {
			return this.objects[object.id].cloneNode(true);
		}


		var svg, shape, svg_shape;
		svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		var paths, i;


		for(shape in object.shapes) {

//			u.bug("shape:" + shape);
//		for(i = 0; shape = object.shapes[i]; i++) {

			svg_shape = document.createElementNS("http://www.w3.org/2000/svg", shape);
			for(detail in object.shapes[shape]) {
				svg_shape.setAttributeNS(null, detail, object.shapes[shape][detail]);
//				u.bug("detail:" + detail + ", " + object.shapes[shape][detail]);
			}

			// add shape to svg
			svg.appendChild(svg_shape);
			
		}

		// store svg in cache if it has an id
		if(object.id) {
			this.objects[object.id] = svg;
		}


		return svg.cloneNode(true);
		// create svg if not already existing (to avoid creating the same svg twice)
		

		// return new instance of svg

	}




	// pass animation sequence as JSON object
	this.animate = function(animation) {
		
	}


}
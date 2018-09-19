// Define an data value object storage (_t ??)

// Define minimum and maximum _t? object



// more meaningful name (for styles or properties)

u.newas = function(node, _options) {


	// _options proposal
	// {
	//	property:value,
	//	[prop:val x N]
	// }


	// Parse property to identify transforms


	// Transforms - defined by property
	// passed on as matrix
	// translateX
	// translateY
	// translateZ
	//
	// rotate
	// rotateX
	// rotateY
	// rotateZ
	//
	// skew
	// skewX
	// skewY
	//
	// scale
	// scaleX
	// scaleY
	// scaleZ


	// Identify Node type (HTML NODE, SVG, CANVAS OBJECT)

	// Parse values to check for UNIT - if clean number default to PX


	// HTML node
	if(!node._t) {
		u.create_t(node);
	}

	var _option;
	for(_option in _options) {
		if(_option.property.match(/translate|rotate|skew|scale/)) {
			u.addToMatrix(node, _option);
		}
		else {
			node._t.setProperty(_option.property, _option.value);
		}

	}
	if(node._t.matrixUpdated) {
		node._t.setProperty("matrix", node._t.matrix);
		node._t.matrixUpdated = false;
	}

}




u.tween = function(node, _options) {

	if(!node._t) {
		u.create_t(node);
	}

	if(!node._t.start) {
		// Extend _t object with tween
		node._t.start = {}
		node._t.end = {}
		node._t.current = {}
		
	}

	if(node._t.type == "HTML") {
		console.log("HTML")
		var current_styles = window.getComputedStyle(node, null);

		console.log(current_styles);

		var i, style;
		for(i = 0; i < _options.vars.length; i++) {
			style = _options.vars[i];

			// for now just getting first entry in object
			property = Object.keys(style)[0];


			real_property = (u.vendorProperty(property).replace(/([A-Z]{1})/g, "-$1")).toLowerCase().replace(/^(webkit|ms)/, "-$1");


			node._t.start[property] = current_styles[real_property];
			node._t.end[property] = style[property];
		}
		
	}

	// _options proposal:
	// {duration: value, delay: value, vars: [
	// 		{parameter1: value, ease: easeFunc, modifier: function},
	// 		{parameter2: value, ease: easeFunc, modifier: function}
	// 	], onStart: function, ease: globalEase}


	
	// Parse values to identify UNITS (px, %, em, etc)
	// Parse values to identify (HEX, RGBAm, HLS)

	// extract initial values
	// save end values
	
	// run animationframe loop
	
}




u.addToMatrix = function(node, _option) {
	node._t.matrixUpdated = true;

	var types = ["translateX", "translateY", "translateZ", "scaleX", "scaleY", ""];

	node._t.matrix[types.indexOf(_option.property)] = _option.value;

}



// Define minimum _t? object

u.create_t = function(node) {

	node._t = {};

	if(node instanceof HTMLElement) {
		node._t.type = "HTML";
		node._t.setProperty = function() {
			this.style[u.vendorProperty(property)] = value;
		}
	}
	else if(node instanceof SVGElement) {
		node._t.type = "SVG";
		node._t.setProperty = function() {
			this.setAttribute(property, value);
		}
	}
	else if(node instanceof Object) {
		node._t.type = "Object";
		node._t.setProperty = function() {
			this.property = value;
		}
	}

}




/*

TWEEN FUNCTION


Definition with property ease:
	u.tween(node, {duration: value, delay: value, vars: [
		{parameter1: value, ease: easeFunc, modifier: function},
		{parameter2: value, ease: easeFunc, modifier: function}
	], onStart: function, ease: globalEase});

Definition without property ease:
	u.tween(node, {duration: value, delay: value, vars: 
		{parameter1: value, parameter2: value},
	], onStart: function, ease: easeFunc});


Parameters:
	node: 		Object to tween can be empty. A possible extension could be a Array. 
	duration: 	Tween duration in seconds.
	delay: 		Tween delay in seconds.
	ease: (global)	Global ease functions if no property ease is defined. Linear is default. 
	vars:		Transition to apply to node
	vars ease:	Specific ease for property. Defaults to global if not set.
	vars modifier:	Before the value gets sent to the ticker you have the possibility to "modify" the value.


Properties:
In order to make tweeting intuitive the functions u.as and u.ass are extended with special code for deciphering css-related properties and handling them in unique ways, like recognising colours, transforms, etc. It also figures out if translate3d or matrix should be used based on your values. A possible extension could be SVG properties.


Methods: (the scope of each function is the node)
	onStart:	Callback when animation starts. 
	onUpdate:	Callback on every frame when the tween is in progress. Gets parameter progress 0-1
	onEnd:		Callback when animation ends.
	

Tween object
	node.tween.a		Tween base object
	node.tween.id		Unique tween id
	node.tween.from:	Object containing initial start values
	node.tween.to: 		Object containing tween end values
	node.tween.progress:	Object where the current state of the tween is stored

*/
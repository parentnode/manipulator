
/**
 * createView
 * 
 * @param {Object} _options - Object litteral of parameters
 * @param {string} _options.template - HTML reference of template
 * @param {string} _options.template_path - The path from which templates for template_url are located
 * @param {Object} _options.template_url - Object of templates to load from template_path
 * @param {string} _options.template_url.url - Template url to load from template_path
 * @param {string} _options.template_url.method - Request method
 * @param {Object} _options.template_url.data - Data to send with request
 * @param {{}} _options.data - Object where key->value represents {placeholder} template variables to be merged with
 * @param {string} _options.data_url - External source of data
 * @param _options.target - Element to append view onto
 * @param _options.initializer - Attach an initializer to rendered template
 * @param _options.callback_rendered - Callback initial render
 * @param _options.callback_state_changed - Callback on each stateChange
 * 
 * @returns node - view
*/
u.createView = function(_options) {

	// u.bug("u.createView", _options);

	
	var template = false;
	var template_url = false;

	var template_path = "/templates/";
	var type = "html";

	var data = false;
	var data_url = false;

	var target = false;

	var initializer = false;


	var callback_rendered = "templateRendered";
	var callback_state_changed = "templateStateChanged";


	// apply parameters
	if(obj(_options)) {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {

				case "template"               : template = _options[_argument]; break;
				case "template_path"          : template_path = _options[_argument]; break;
				case "template_url"           : template_url = _options[_argument]; break;

				case "type"                   : type = _options[_argument]; break;

				case "data"                   : data = _options[_argument]; break;
				case "data_url"               : data_url = _options[_argument]; break;

				case "target"                 : target = _options[_argument]; break;

				case "initializer"            : initializer = _options[_argument]; break;

				case "callback_rendered"      : callback_rendered = _options[_argument]; break;
				case "callback_state_changed" : callback_state_changed = _options[_argument]; break;

			}
		}
	}


	var view;

	if(target) {

		view = u.ae(target, "div", {class: "view loading"});

	}
	else {

		view = document.createElement("div");
		u.ac(view, "view loading");

	}


	// Map base properties
	view._rv_template_path = template_path;
	view._rv_type = type;

	view._rv_template_url = template_url;
	view._rv_data_url = data_url;

	view._rv_initializer = initializer;

	view.update = function(_options) {
		// u.bug("update", _options, this._rv_data, this._rv_template);

		// Clean up template
		this.innerHTML = "";


		var data = this._rv_data;
		var template = this._rv_template;

		this._rv_data = false;
		this._rv_template = false;

		// apply parameters
		if(obj(_options)) {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {

					case "template"      : template           = _options[_argument]; break;
					case "data"          : data               = _options[_argument]; break;

				}
			}
		}


		if(template) {
			// u.bug("template")

			this._rv_template = template;
			this._stateChanged();

		}
		else if(this._rv_template_url) {

			this.loadTemplate();

		}


		if(data) {

			this._rv_data = data;
			this._stateChanged();

		}
		else if(data_url) {
			// u.bug("data_url")

			this.loadData();

		}

	}


	view.loadTemplate = function() {
		// u.bug("loadTemplate", this._rv_template_path + this._rv_template_url.url);

		this._rv_template = false;

		// Once template has been received (response = template)
		this._templateLoaded = function(response) {
			// u.bug("response", response)

			this._rv_template = response.children[0];

			this._stateChanged();
		}

		// Get template
		u.request(this, this._rv_template_path + this._rv_template_url.url, {
			"method": (this._rv_template_url.method ? this._rv_template_url.method : "GET"),
			"data": (this._rv_template_url.data ? this._rv_template_url.data : ""),
			"callback": "_templateLoaded"
		});

	}


	view.loadData = function(_options) {
		// u.bug("loadData", this._rv_data_url);

		this._rv_data = false;

		this._dataLoaded = function(response) {
			this._rv_data = response;

			this._stateChanged();
		}

		u.request(this, this._rv_data_url.url, {
			"method": (this._rv_template_url.method ? this._rv_template_url.method : "GET"),
			"data": (this._rv_template_url.data ? this._rv_template_url.data : ""),
			"callback": "_dataLoaded"
		});

	}


	view._stateChanged = function() {
		// u.bug("_stateChanged", this._rv_template, this._rv_data);

		if(this._rv_template && this._rv_data) {

			// Merge data with template and append the resulting "rendered template" to the view
			var template = u.template(this._rv_template, this._rv_data, {append: this});

			// console.log("template: ", template)

			// Reference to rendered template on view
			this.template = template[0];

			// Reference to view on rendered template
			this.template.view = this;

			// Init the initializer on template
			// if (this._rv_initializer) {
			// 	// Util.Modules[this._rv_initializer].init(this.template);
			// }

			// Only load initializer once
			if(!this._initialized && this._rv_initializer) {
				// console.log("View init: ", this);
				this._initialized = true;

				if(obj(Util.Modules[this._rv_initializer])) {
					Util.Modules[this._rv_initializer].init(this);
				}

				if(fun(this[callback_rendered])) {
					this[callback_rendered]();
				}
			}
			else {
				if(fun(this[callback_rendered])) {
					this[callback_rendered]();
				}
			}


			// Init any i:{init} present in view
			u.init(this);


			if(fun(this[callback_state_changed])) {
				this[callback_state_changed]();
			}


			// u.rc(this, "loading");
		}
	}


	view.update(_options);


	return view;
}
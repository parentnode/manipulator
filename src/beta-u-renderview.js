u.renderView = function(_options) {

	u.bug("u.renderView", _options);


	var template = false;
	var template_url = false;

	var template_path = "/templates/";
	var type = "html";

	var data = false;
	var data_url = false;

	var target = false;

	var initializer = false;


	var callback_rendered = "templateRendered";


	// apply parameters
	if (obj(_options)) {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {

				case "template_path"     : template_path       = _options[_argument]; break;
				case "type"              : type                = _options[_argument]; break;

				case "template"          : template            = _options[_argument]; break;
				case "template_url"      : template_url        = _options[_argument]; break;

				case "data"              : data                = _options[_argument]; break;
				case "data_url"          : data_url            = _options[_argument]; break;

				case "target"            : target              = _options[_argument]; break;

				case "initializer"       : initializer         = _options[_argument]; break;

				case "callback_rendered" : callback_rendered   = _options[_argument]; break;

			}
		}
	}


	var container;

	if(target) {

		container = u.ae(target, "div", {class:"loading"});

	}
	else {

		container = document.createElement("div");
		u.ac(container, "loading");

	}


	// Map base properties
	container._rv_template_path = template_path;
	container._rv_type = type;

	container._rv_template_url = template_url;
	container._rv_data_url = data_url;

	container._rv_initializer = initializer;



	container.update = function(_options) {
		u.bug("update", _options, this._rv_data, this._rv_template);

		// Clean up template
		this.innerHTML = "";


		var data = this._rv_data;
		var template = this._rv_template;

		this._rv_data = false;
		this._rv_template = false;

		// apply parameters
		if (obj(_options)) {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {

					case "template"          : template            = _options[_argument]; break;
					case "data"              : data                = _options[_argument]; break;

				}
			}
		}


		if(template) {

			this._rv_template = template;
			this._stateChanged();

		}
		else if(this._rv_template_url) {

			this.loadTemplate();

		}


		if(data) {
			u.bug("data", data);

			this._rv_data = data;
			this._stateChanged();

		}
		else if(data_url) {

			this.loadData();

		}

	}


	container.loadTemplate = function() {
		u.bug("loadTemplate", this._rv_template_path + this._rv_template_url.url)

		this._rv_template = false;

		// Once template has been received (response = template)
		this._templateLoaded = function(response) {
			u.bug("response", response)

			this._rv_template = response.children[0];

			this._stateChanged();
		}

		// Get template
		u.request(this, this._rv_template_path + this._rv_template_url.url, {
			"method":(this._rv_template_url.method ? this._rv_template_url.method : "GET"),
			"data":(this._rv_template_url.data ? this._rv_template_url.data : ""),


			"callback":"_templateLoaded"
		});

	}


	container.loadData = function(_options) {
	
		this._rv_data = false;

		this._dataLoaded = function(response) {
			this._rv_data = response;

			this._stateChanged();
		}

		u.request(this, this._rv_data_url.url, {
			"method":(this._rv_template_url.method ? this._rv_template_url.method : "GET"),
			"data":(this._rv_template_url.data ? this._rv_template_url.data : ""),

			callback: "_dataLoaded"
		});

	}


	container._stateChanged = function() {
		u.bug("_stateChanged", this._rv_template, this._rv_data);

		if(this._rv_template && this._rv_data) {

			var template = u.template(this._rv_template, this._rv_data, {append: this});

			// Init the initializer on template
			if (this._rv_initializer) {
				Util.Objects[this._rv_initializer].init(this.firstChild);
			}


			if(this["templateRendered"]) {
				this["templateRendered"]();
			}


			u.rc(this, "loading");

		}

	}


	container.update(_options);


	return container;
}
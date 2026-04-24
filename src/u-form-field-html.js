// HTML custom field
// initializer and validator

// initializer
Util.Form.customInit["html"] = function(field) {
	// u.bug("html field", field);

	// Register field type
	field.type = "html";


	// Get primary input
	field.input = u.qs("textarea", field);
	// form is a reserved property, so we use _form
	field.input._form = field._form;
	// Get associated label
	field.input.label = u.qs("label[for='"+field.input.id+"']", field);
	// Let it know it's field
	field.input.field = field;

	// field.input.val = u.f._value;
	// get/set value function
	field._html_value = function(value) {

		// Set value? (value could be false or 0)
		if(value !== undefined) {
			this.value = value;

			// if actual value, remove default state
			if(value !== this.default_value) {
				u.rc(this, "default");
			}

			// validate after setting value
			u.f.validate(this);
		}

		// enable testing for empty HTML
		var value_tester = document.createElement("div");
		value_tester.innerHTML = this.value;

		// Return value
		return (this.value != this.default_value && u.text(value_tester)) ? this.value : "";
	}
	field.input.val = field._html_value;


	// create textEditor interface
	u.f.textEditor(field);

}

// validator
Util.Form.customValidate["html"] = function(iN) {
	// u.bug("validate", iN, iN.val(), u.text(iN.field.viewer));

	// min and max length
	min = Number(u.cv(iN.field, "min"));
	max = Number(u.cv(iN.field, "max"));
	min = min ? min : 1;
	max = max ? max : 10000000;
	pattern = iN.getAttribute("pattern");

	if(
		u.text(iN.field.viewer) &&
		u.text(iN.field.viewer).length >= min && 
		u.text(iN.field.viewer).length <= max && 
		(!pattern || iN.val().match("^"+pattern+"$"))
	) {
		u.f.inputIsCorrect(iN);
	}
	else {
		u.f.inputHasError(iN);
	}

}


Util.Form.customHintPosition["html"] = function(field) {
	// u.bug("customHintPosition html", field);

	// Default positioning
	var input_middle = field.editor.offsetTop + (field.editor.offsetHeight / 2);
	var help_top = input_middle - field.help.offsetHeight / 2;

	u.ass(field.help, {
		"top": help_top + "px"
	});

}


// inject HTML editor
u.f.textEditor = function(field) {
	// u.bug("init custom editor");


	// Editor support specs
	field.text_support = "h1,h2,h3,h4,h5,h6,p";
	field.code_support = "code";
	field.list_support = "ul,ol";
	field.media_support = "png,jpg,mp4";
	field.ext_video_support = "youtube,vimeo";
	field.file_support = "download"; // means any file type (file will be uploaded, zipped and made available for download)

	field.button_support = "button";


	// Allowed tags are listed in element classname
	field.allowed_tags = u.cv(field, "tags");
	if(!field.allowed_tags) {
		u.bug("allowed_tags not specified")
		return;
	}
	// u.bug("field.allowed_tags:" + field.allowed_tags);


	// filter allowed tags before building editor
	field.filterAllowedTags = function(type) {

		// split allowed tags 
		tags = this.allowed_tags.split(",");

		// create array for type
		this[type+"_allowed"] = new Array();

		// loop through tags
		var tag, i;
		for(i = 0; i < tags.length; i++) {
			tag = tags[i];

//			u.bug("type:" + type + " - " + tag + " match:" + tag.match("^("+this[type+"_support"].split(",").join("|")+")$") + "-" + tag.match(re) + "-" + tag.match(/^(h1|h2|h3)$/gi) + " - " + "/^("+this[type+"_support"].split(",").join("|")+")$/");
			// it tag is supported for type, add it to type_allowed array
			if(tag.match("^("+this[type+"_support"].split(",").join("|")+")$")) {

				this[type+"_allowed"].push(tag);
			}
		}
	}
	field.filterAllowedTags("text");
	field.filterAllowedTags("list");
	field.filterAllowedTags("media");
	field.filterAllowedTags("ext_video");
	field.filterAllowedTags("file");
	field.filterAllowedTags("code");
	field.filterAllowedTags("button");



	// extended functionality urls
	field.file_add_action = field.getAttribute("data-file-add");
	field.file_delete_action = field.getAttribute("data-file-delete");
	field.file_update_metadata_action = field.getAttribute("data-file-update-metadata");
	field.file_media_info_action = field.getAttribute("data-file-media-info");


	// find item id
	// could be in form action (last fragment of url)
	// TODO: should be extended to look in other places
	field._item_id = field._form._item_id;
	// var item_id_match = field._form.action.match(/\/([0-9]+)(\/|$)/);
	// if(item_id_match) {
	// 	field.item_id = item_id_match[1];
	// }



	// BUILD EDITOR EXTERNAL INTERFACE

	// Viewer is a div containing the actual HTML output of the editor
	// at this point purely used for inspecting the generated HTML for debugging
	// could be used as a preview pane at a later point
	field.viewer = u.ae(field, "div", {"class":"viewer"});
	field.insertBefore(field.viewer, field.help)
	field.viewer.field = field;

	// The actual HTML editor interface
	field.editor = u.ae(field, "div", {"class":"editor"});
	field.insertBefore(field.editor, field.help)
	field.editor.field = field;

	// Keep track of selection and inline options panels
	field.selection_options = {};
	field.inline_options = {};


	// Unless fixFieldHTML is declared, move indicator to editor view
	if(!fun(u.f.fixFieldHTML)) {
		u.ae(field.editor, field.indicator);
	}

	// callback after sorting list
	field.editor.picked = function() {
		u.ac(this, "reordering");
	}

	// callback after sorting list
	field.editor.dropped = function(node) {
		//u.bug("sorted")

		u.rc(this, "reordering");

		this.field.update();

		this.field.returnFocus(node);
	}

	// Create VIEW RAW HTML
	field.addViewHTMLButton = function() {

		// allow to toggle raw HTML view
		this.bn_show_raw = u.ae(this.input.label, "span", {"html": "View HTML", "class": "help"});
		this.bn_show_raw.field = this;
		u.ce(this.bn_show_raw);
		this.bn_show_raw.clicked = function() {
			if(u.hc(this.field.input, "show")) {
				this.field.input.removeAttribute("readonly");
				u.rc(this.field.input, "show");
				this.innerHTML = "View HTML";
			}
			else {
				this.field.input.setAttribute("readonly", 1);
				u.ac(this.field.input, "show");

				this.innerHTML = "Hide HTML";
			}
		}

	}

	// Create HELP button
	field.addHelpButton = function() {

		// allow to toggle raw HTML view
		this.bn_help = u.ae(this.input.label, "span", {"html": "?", "class": "help"});
		this.bn_help.field = this;
		u.ce(this.bn_help);
		this.bn_help.clicked = function() {
			alert("implement help");
		}

	}




	// UPDATERS

	// Update viewer and Textarea
	field.update = function() {
		// u.bug("update");

		// this.updateViewer();
		this.updateContent();


		// callback to field updated
		if(fun(this.updated)) {
			this.updated(this.input);
		}

		// callback to field changed
		if(fun(this.changed)) {
			this.changed(this.input);
		}

		// callback to form updated
		if(this.input._form && fun(this.input._form.updated)) {
			this.input._form.updated(this.input);
		}

		// callback to form changed
		if(this.input._form && fun(this.input._form.changed)) {
			this.input._form.changed(this.input);
		}
	}

	// update HTML viewer div
	// field.updateViewer = function() {
	// 	u.bug("updateViewer");
	//
	// 	// get all tags
	// 	var tags = u.qsa("div.tag", this);
	//
	// 	var i, tag, j, list, li, lis, div, p, a;
	//
	// 	// reset html viewer
	// 	this.viewer.innerHTML = "";
	//
	// 	// loop through tags
	// 	for(i = 0; i < tags.length; i++) {
	// 		tag = tags[i];
	//
	// 		// u.bug(tag);
	//
	// 		// is tag a text
	// 		if(u.hc(tag, this.text_allowed.join("|"))) {
	//
	// 			// add text node
	// 			u.ae(this.viewer, tag.type_selector.val(), {"html":tag.virtual_input.val()});
	// 		}
	//
	// 		// is tag list
	// 		else if(u.hc(tag, this.list_allowed.join("|"))) {
	//
	// 			// add list
	// 			list = u.ae(this.viewer, tag.type_selector.val());
	//
	// 			// add list items
	// 			lis = u.qsa("div.li", tag);
	// 			for(j = 0; j < lis.length; j++) {
	// 				li = lis[j];
	// 				li = u.ae(list, tag.type_selector.val(), {"html":li.virtual_input.val()});
	// 			}
	// 		}
	//
	// 		// is tag external video
	// 		else if(u.hc(tag, this.ext_video_allowed.join("|")) && tag._video_id) {
	//
	// 			// add div with video id
	// 			div = u.ae(this.viewer, "div", {"class":tag.type_selector.val()+" video_id:"+tag._video_id});
	// 		}
	//
	// 		// is tag code
	// 		else if(u.hc(tag, "code")) {
	//
	// 			div = u.ae(this.viewer, "code", {"html":tag.virtual_input.val()});
	// 		}
	//
	// 		// is tag file
	// 		else if(u.hc(tag, "file") && tag._variant) {
	//
	// 			// add div with <p> and <a>
	// 			div = u.ae(this.viewer, "div", {"class":"file item_id:"+tag._item_id+" variant:"+tag._variant+" name:"+encodeURIComponent(tag._name)+" filesize:"+tag._filesize});
	// 			p = u.ae(div, "p");
	// 			a = u.ae(p, "a", {"href":"/download/"+tag._item_id+"/"+tag._variant+"/"+tag._name, "html":tag.virtual_input.val()});
	// 		}
	//
	// 		// is tag media
	// 		else if(u.hc(tag, "media") && tag._variant) {
	//
	// 			// add div with <p> and <a>
	// 			div = u.ae(this.viewer, "div", {"class":"media item_id:"+tag._item_id+" variant:"+tag._variant+" name:"+encodeURIComponent(tag._name)+" filesize:"+tag._filesize + " format:"+tag._format});
	// 			p = u.ae(div, "p");
	// 			a = u.ae(p, "a", {"href":"/images/"+tag._item_id+"/"+tag._variant+"/480x."+tag._format, "html":tag.virtual_input.val()});
	// 		}
	//
	// 	}
	//
	// }
	//


	// updates actual Textarea 
	field.updateContent = function() {
		// u.bug("updateContent");

		// get all tags
		var tags = u.qsa("div.tag", this);

		// update actual textarea to be saved
		this.input.val("");

		var i, node, tag, type, value, j, html = "";
		var list_started = false;
		var button_list_started = false;


		for(i = 0; i < tags.length; i++) {
			tag = tags[i];
			// u.bug(tag);


			// text node
			if(tag.type === "text") {

				// get tag type and value
				type = tag.type_selector.val();
				value = tag.virtual_input.val();
				// u.bug("value / type", value, type);

				html += '<'+type + (tag._classname ? (' class="'+tag._classname+'"') : '')+'>'+value+'</'+type+'>'+"\n";

			}

			// list node
			else if(tag.type === "li") {

				// get tag type
				type = tag.type_selector.val();
				value = tag.virtual_input.val();
				// u.bug("value / type", value, type);


				// Start list tag, if not already done
				if(!list_started) {
					html += "<"+type+">\n";
					list_started = type;
				}

				html += "\t<li"+(tag._classname ? (' class="'+tag._classname+'"') : '')+">"+value+"</li>\n";

				// More to come or last element in list
				if(i === tags.length-1 || tags[i+1].type !== "li" || tags[i+1].type_selector.val() !== list_started) {
					html += "</"+type+">\n";
					list_started = false;
				}

			}

			// external video node
			else if(tag.type === "ext_video") {

				// get tag type and value
				type = tag.type_selector.val();
				value = tag.virtual_input.val();
				// u.bug("value / type", value, type);

				// Version 2
				html += '<div class="'+type+" ext_video"+(tag._classname ? " "+tag._classname : "")+'">\n';
				if(value.video_url) {
					html += '\t<ul class="metadata" data-variant="'+(value.variant ? value.variant : "")+'" data-poster-format="'+(value.poster_format ? value.poster_format : "")+'" itemprop="video" itemscope itemtype="http://schema.org/VideoObject">\n';
					html += '\t\t<li itemprop="contentUrl">'+value.video_url+'</li>\n';

					if(value.variant && value.poster_format) {
						html += '\t\t<li itemprop="thumbnailUrl">/images/'+this._item_id+'/'+value.variant+'/1200x.'+value.poster_format+'</li>\n';
					}
					if(value.poster_width && value.poster_format) {
						html += '\t\t<li itemprop="width">'+value.poster_width+'</li>\n';
					}
					if(value.poster_height && value.poster_format) {
						html += '\t\t<li itemprop="height">'+value.poster_height+'</li>\n';
					}
					if(value.file_name) {
						html += '\t\t<li itemprop="name">'+value.file_name+'</li>\n';
					}
					if(value.file_description) {
						html += '\t\t<li itemprop="description">'+value.file_description+'</li>\n';
					}
					html += '\t\t<li itemprop="uploadDate">'+value.created_at+'</li>\n';

					html += '\t</ul>\n';
				}
				html += '</div>\n';


				// Version 1
				// html += '<div class="'+tag._type.val()+' video_id:'+tag._video_id+'"></div>\n';

			}

			// code node
			else if(tag.type === "code") {

				// get tag type and value
				type = tag.type_selector.val();
				value = tag.virtual_input.val();
				// u.bug("value / type", value, type);

				html += '<code'+(tag._classname ? (' class="'+tag._classname+'"') : '')+'>'+value+'</code>'+"\n";

			}

			// media node
			else if(tag.type === "media") {

				// get tag type and value
				type = tag.type_selector.val();
				value = tag.virtual_input.val();
				// u.bug("value / type", value, type);

				var media_type = "";
				if(value.variant && value.format) {
					media_type = value.format.match(/^(mov|mp4|ogv|3gp)$/i) ? "video" : "image";
				}


				// Version 2
				html += '<div class="'+type+(tag._classname ? " "+tag._classname : "")+(media_type ? " "+media_type : "")+'">\n';
				if(media_type) {

					html += '\t<ul class="metadata" data-variant="'+value.variant+'" data-format="'+value.format+'" data-poster="'+(value.poster ? value.poster : "")+'" itemprop="'+media_type+'" itemscope itemtype="http://schema.org/'+media_type.replace(/^([a-z])/, function(a){return a.toUpperCase()})+'Object">\n';
					html += '\t\t<li itemprop="contentUrl">/'+media_type+"s/"+this._item_id+"/"+value.variant+'/1200x.'+value.format+'</li>\n';

					if(value.poster && media_type === "video") {
						html += '\t\t<li itemprop="thumbnailUrl">/images/'+this._item_id+'/'+value.variant+'/1200x.'+value.poster+'</li>\n';
					}
					else if(media_type === "image") {
						html += '\t\t<li itemprop="thumbnailUrl">/images/'+this._item_id+'/'+value.variant+'/1200x.'+value.format+'</li>\n';
					}

					if(value.width) {
						html += '\t\t<li itemprop="width">'+value.width+'</li>\n';
					}
					if(value.height) {
						html += '\t\t<li itemprop="height">'+value.height+'</li>\n';
					}
					if(value.file_name) {
						html += '\t\t<li itemprop="name">'+value.file_name+'</li>\n';
					}
					if(value.file_description) {
						html += '\t\t<li itemprop="description">'+value.file_description+'</li>\n';
					}
					html += '\t\t<li itemprop="uploadDate">'+value.created_at+'</li>\n';

					html += '\t</ul>\n';
				}
				html += '</div>\n';


				// Version 1
				// html += '<div class="media item_id:'+tag._item_id+' variant:'+tag._variant+' name:'+encodeURIComponent(tag._name)+' filesize:'+tag._filesize+' format:'+tag._format+' width:'+tag._width+' height:'+tag._height+'">'+"\n";
				// html += '\t<p><a href="/images/'+tag._item_id+'/'+tag._variant+'/480x.'+tag._format+'">'+tag.virtual_input.val()+"</a></p>";
				// html += "</div>\n";
			}

			// file node
			else if(tag.type === "file") {

				// get tag type and value
				type = tag.type_selector.val();
				value = tag.virtual_input.val();
				// u.bug("value / type", value, type);

				// Version 2
				html += '<div class="'+type+(tag._classname ? " "+tag._classname : "")+'">\n';
				if(value.url && value.url && value.file_name) {
					html += '\t<p><a href="'+value.url+'">'+value.file_name+'</a></p>\n';
					
					html += '\t<ul class="metadata" data-variant="'+value.variant+'" data-format="'+value.format+'" itemprop="associatedMedia" itemscope itemtype="http://schema.org/MediaObject">\n';
					html += '\t\t<li itemprop="contentUrl">'+value.url+'</li>\n';

					if(value.file_name) {
						html += '\t\t<li itemprop="name">'+value.file_name+'</li>\n';
					}
					if(value.file_description) {
						html += '\t\t<li itemprop="description">'+value.file_description+'</li>\n';
					}
					if(value.filesize) {
						html += '\t\t<li itemprop="contentSize">'+value.filesize+'</li>\n';
					}

					html += '\t\t<li itemprop="uploadDate">'+value.created_at+'</li>\n';

					html += '\t</ul>\n';
				}
				html += '</div>\n';

				// Version 1
				// html += '<div class="file item_id:'+tag._item_id+' variant:'+tag._variant+' name:'+encodeURIComponent(tag._name)+' filesize:'+tag._filesize+'">'+"\n";
				// html += '\t<p><a href="/download/'+tag._item_id+'/'+tag._variant+'/'+tag._name+'">'+tag._input.val()+"</a></p>";
				// html += "</div>\n";

			}

			// button node
			else if(tag.type === "button") {

				// get tag type
				type = tag.type_selector.val();
				value = tag.virtual_input.val();
				// u.bug("value / type", value, type);


				// Start list tag, if not already done
				if(!button_list_started) {
					html += '<ul class="actions">\n';
					button_list_started = type;
				}

				html += '\t<li'+(tag._classname ? (' class="'+tag._classname+'"') : '')+'><a href="'+value.link+'">'+value.text+'</a></li>\n';

				// More to come or last element in list
				if(i === tags.length-1 || tags[i+1].type !== "button" || tags[i+1].type_selector.val() !== button_list_started) {
					html += "</ul>\n";
					button_list_started = false;
				}

			}

		}


		// save HTML in textarea
		this.input.val(html);

	}




	// EDITOR FUNCTIONALity

	// Create empty tag (with drag, type selector and remove-tag elements)
	field.createTag = function(allowed_tags, type) {

		// create tag node
		var tag = u.ae(this.editor, "div", {"class":"tag"});
		tag.field = this;


		// add drag handle
		tag._drag = u.ae(tag, "div", {"class":"drag"});
		tag._drag.field = this;
		tag._drag.tag = tag;

		// add type selector
		this.createTagSelector(tag, allowed_tags);

		// select current type
		tag.type_selector.val(type);


		// add additional tag option
		this.addTagOptions(tag);

		return tag;
	}

	// delete tag (when clicking on remove button)
	field.deleteTag = function(tag) {

		// make sure it is not last node
		if(u.qsa("div.tag", this).length > 1) {


			// TODO: only remove automatically on non-file inputs
			// on file inputs (media/file), the file deletion may fail and thus the tag should not be removed
			// but perhaps tag should be removed either way for smoother editing


			// if node is file - delete file from server
			if(tag.type.match(/^(file|media|ext_video)$/)) {
				this.deleteFile(tag);

				// Remove edit key shortcut
				u.k.removeKey(tag, "e");
			}

			else if(u.hc(tag, "media")) {
				this.deleteMedia(tag);
			}


			// Firn previous tag for next focus (if any)
			var prev = this.findPreviousTag(tag);

			// remove node
			tag.parentNode.removeChild(tag);

			// enable dragging of html-tags
			this.editor.updateTargets();
			this.editor.updateDraggables();


			// global update
			this.update();

			// save after upload is complete
			this._form.submit();
			

			// set focus on prev element (if any)
			if(prev && prev.virtual_input) {
				prev.virtual_input.focus();
			}

		}

	}

	// add classname input to tag (when clicking on classname button)
	field.classnameTag = function(tag) {

		if(!u.hc(tag.bn_classname, "open")) {

			var form = u.f.addForm(tag.bn_classname, {"class":"labelstyle:inject"});
			form.tag = tag;
			var fieldset = u.f.addFieldset(form);
			u.f.addField(fieldset, {"label":"classname", "name":"classname", "error_message":"", "value":tag._classname});
			u.f.addAction(form, {"name":"save", "value":"Save"});

			u.ac(tag.bn_classname, "open");
			u.ac(tag, "classname_open");


			u.f.init(form);
			
			form.submitted = function() {
				var classname = this.inputs["classname"].val();
				this.parentNode.removeChild(this);

				u.rc(this.tag.bn_classname, "open");
				u.rc(this.tag, "classname_open");

				if(classname && classname != "") {
					u.ac(this.tag.bn_classname, "modified");
					this.tag.updateClassName(classname);
				}
				else {
					u.rc(this.tag.bn_classname, "modified");
					this.tag.updateClassName();
				}

				// Update HTML
				this.tag.field.update();
			}

			form.inputs["classname"].blurred = function(event) {
				this._form.submit();
			}

			form.inputs["classname"].focus();

		}

	}

	// create tag selector helper function
	field.createTagSelector = function(tag, allowed_tags) {
		// u.bug("createTagSelector", tag, allowed_tags);

		var i, allowed_tag;

		// insert node in tag
		tag.type_selector = u.ae(tag, "ul", {"class":"type"});
		tag.type_selector.field = this;
		tag.type_selector.tag = tag;

		// create selector for text-based tags
		for(i = 0; i < allowed_tags.length; i++) {
			allowed_tag = allowed_tags[i];

			u.ae(tag.type_selector, "li", {"html":allowed_tag, "class":allowed_tag});

			// If more that one allowed tag, then enable keyboard shortcut for switching
			if(allowed_tags.length > 1) {
				var key = (isNaN(allowed_tag[allowed_tag.length -1]) ? allowed_tag[0] : allowed_tag[allowed_tag.length -1]);
				// u.bug("shortcut", key);

				u.k.addKey(tag, key, {
					"callback": "switchTag",
					"focused": true,
					"value": allowed_tag,
				});
			}

		}

		// Handle keyboard tag switch
		tag.switchTag = function(event, value) {
			this.type_selector.val(value);
		}

		// type get/set function
		tag.type_selector.val = function(value) {

			// set value
			if(value !== undefined) {
				var i, option;

				// try to find option with matching value
				for(i = 0; i < this.childNodes.length; i++) {
					option = this.childNodes[i];

					// u.bug("aoption:" + option)
					if(u.text(option) == value) {

						// u.bug("new option:" + option + ", " + u.text(option))
						// u.bug("this.selected_option:" + this.selected_option)

						// already have selected options
						if(this.selected_option) {
							u.rc(this.selected_option, "selected");

							// update div tag class
							u.rc(this.tag, u.text(this.selected_option));
						}

						// set selected state on new option
						// u.bug("option:" + option)
						u.ac(option, "selected");
						this.selected_option = option;

						// update div tag class
						// u.bug("this.tag:" + this.tag)
						u.ac(this.tag, value);

						return option;
					}
				}

				// didn't find anything
				// set selected state on first option
				u.ac(this.childNodes[0], "selected");
				this.selected_option = this.childNodes[0];
				// update div tag class
				u.ac(this.tag, u.text(this.childNodes[0]));

				return this.childNodes[0];
			}

			// get value
			else {
				return u.text(this.selected_option);
			}
		}

		// enable tag switching, only if more than one type available
		if(allowed_tags.length > 1) {

			u.ce(tag.type_selector);
			// avoid taking focus from current field
			tag.type_selector.inputStarted = function(event) {
				var selection = window.getSelection();
				if(selection && selection.type && u.contains(this.tag, selection.anchorNode)) {
					u.e.kill(event);
				}
			}
			tag.type_selector.clicked = function(event) {
				// u.bug("select clicked", this, this.field.inlineformatting);

				// Do not allow tag changing when inlineformatting is active
				if(!this.field.inlineformatting) {

					// reset auto hide (just in case)
					u.t.resetTimer(this.t_autohide);

					// already show - close selector
					if(u.hc(this, "open")) {
						u.rc(this, "open");
						u.rc(this.tag, "focus");

						u.ass(this.field, {
							"zIndex": this.field._base_z_index
						});

						u.as(this, "top", 0);

						// was a new type selected?
						if(event.target) {
							this.val(u.text(event.target));
						}

						// remove auto close on mouse out
						u.e.removeEvent(this, "mouseout", this.autohide);
						u.e.removeEvent(this, "mouseover", this.delayautohide);


						// return add focus to input
						this.field.returnFocus(this.tag);

						// update content
						this.field.update();
					}
					// already closed - open selector
					else {
						u.ac(this, "open");
						u.ac(this.tag, "focus");
						u.ass(this.field, {
							"zIndex": this.field._form._focus_z_index,
						});

						u.as(this, "top", -(this.selected_option.offsetTop) + "px");

						// add auto hide
						u.e.addEvent(this, "mouseout", this.autohide);
						u.e.addEvent(this, "mouseover", this.delayautohide);
					}

				}

			}

			// auto hide type selector
			tag.type_selector.hide = function() {
				u.rc(this, "open");
				if(!this.field.is_focused) {

					u.rc(this.tag, "focus");

					u.ass(this.field, {
						"zIndex": this.field._base_z_index
					});

					// return add focus to input
					this.field.returnFocus(this.tag	);
				}

				u.as(this, "top", 0);

				// remove auto hide
				u.e.removeEvent(this, "mouseout", this.autohide);
				u.e.removeEvent(this, "mouseover", this.delayautohide);
				u.t.resetTimer(this.t_autohide);

			}

			// auto hide functions
			tag.type_selector.autohide = function(event) {
				u.t.resetTimer(this.t_autohide);
				this.t_autohide = u.t.setTimer(this, this.hide, 800);
			}
			tag.type_selector.delayautohide = function(event) {
				u.t.resetTimer(this.t_autohide);
			}

		}

	}

	// add css, delete and new tag options to tag
	field.addTagOptions = function(tag) {

		// add option selector
		tag.ul_tag_options = u.ae(tag, "ul", {"class":"tag_options"});


		// "Add" button
		tag.bn_add = u.ae(tag.ul_tag_options, "li", {"class":"add", "html":"+"});
		tag.bn_add.field = field;
		tag.bn_add.tag = tag;
		u.ce(tag.bn_add);
		tag.bn_add.clicked = function(event) {


			this.cleanupOptions = function(event) {
				// u.bug("cleanupOptions", this.field.ul_new_tag_options);


				// Remove shortcuts
				u.k.removeKey(this, "ESC");


				if(this.field.ul_new_tag_options) {

					// Remove shortcuts
					u.k.removeKey(this.field.ul_new_tag_options, "UP");
					u.k.removeKey(this.field.ul_new_tag_options, "DOWN");
					u.k.removeKey(this.field.ul_new_tag_options, "ENTER");

					this.field.ul_new_tag_options.parentNode.removeChild(this.field.ul_new_tag_options);
					delete this.field.ul_new_tag_options;

					if(this.start_event_id) {
						u.e.removeWindowStartEvent(this.start_event_id);
						delete this.start_event_id;
					}

				}


			}


			// Remove existing options list if any
			if(this.field.ul_new_tag_options) {
				this.cleanupOptions();
			}


			// Enable ESC to close
			u.k.addKey(this, "ESC", {
				"callback": "cleanupOptions"
			});


			this.start_event_id = u.e.addWindowStartEvent(this, this.cleanupOptions);


			// Add list for actions
			this.field.ul_new_tag_options = u.ae(this.field.editor, "ul", {"class":"new_tag_options"});
			u.ia(this.field.ul_new_tag_options, this.tag);


			// this.tag.bn_add.innerHTML = "cancel";
			// u.ac(this.tag.bn_add, "close");

			// Handle option focus via keyboard selection or mouseover
			this.field.ul_new_tag_options.optionFocus = function(event) {
				// u.bug("optionFocus", event, this)
				var option = event.target;

				if(this.selected_option) {
					u.rc(this.selected_option, "focus");
				}

				this.selected_option = option;
				u.ac(this.selected_option, "focus");
			}


			// Add text tag option (if allowed)
			if(this.field.text_allowed.length) {

				this.bn_add_text = u.ae(this.field.ul_new_tag_options, "li", {"class":"text", "html":"Text ("+this.field.text_allowed.join(", ")+")"});
				this.bn_add_text.field = this.field;
				this.bn_add_text.tag = this.tag;


				// Enable crossfunctional mouseover (also working with keyboard selection)
				u.e.addOverEvent(this.bn_add_text, this.field.ul_new_tag_options.optionFocus.bind(this.field.ul_new_tag_options));


				u.ce(this.bn_add_text);
				this.bn_add_text.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_text.clicked = function(event) {
					var tag = this.field.addTextTag(this.field.text_allowed[0]);
					u.ia(tag, this.tag);

					// If new tag was added by keyboard shortcut via new tag options
					if(event.type === "keydown") {

						// set focus only after ENTER keyup
						// to prevent it from creating yet another tag when keyup happens in newly focused tag
						this.field.ul_new_tag_options.handleEnterKeyUp(tag);

					}
					else {
						this.field.returnFocus(tag);
					}

					// Remove new tag options
					this.tag.bn_add.cleanupOptions();

				}
			}


			// Add list tag option (if allowed)
			if(this.field.list_allowed.length) {

				this.bn_add_list = u.ae(this.field.ul_new_tag_options, "li", {"class":"list", "html":"List ("+this.field.list_allowed.join(", ")+")"});
				this.bn_add_list.field = this.field;
				this.bn_add_list.tag = this.tag;


				// Enable crossfunctional mouseover (also working with keyboard selection)
				u.e.addOverEvent(this.bn_add_list, this.field.ul_new_tag_options.optionFocus.bind(this.field.ul_new_tag_options));


				u.ce(this.bn_add_list);
				this.bn_add_list.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_list.clicked = function(event) {
					var tag = this.field.addListTag(this.field.list_allowed[0]);
					u.ia(tag, this.tag);

					// If new tag was added by keyboard shortcut via new tag options
					if(event.type === "keydown") {

						// set focus only after ENTER keyup
						// to prevent it from creating yet another tag when keyup happens in newly focused tag
						this.field.ul_new_tag_options.handleEnterKeyUp(tag);

					}
					else {
						this.field.returnFocus(tag);
					}

					// Remove new tag options
					this.tag.bn_add.cleanupOptions();

				}
			}


			// Add media tag option (if allowed)
			if(this.field.media_allowed.length && this.field._item_id && this.field.file_add_action && this.field.file_delete_action && !u.browser("IE", "<=9")) {

				this.bn_add_media = u.ae(this.field.ul_new_tag_options, "li", {"class":"list", "html":"Media ("+this.field.media_allowed.join(", ")+")"});
				this.bn_add_media.field = this.field;
				this.bn_add_media.tag = this.tag;


				// Enable crossfunctional mouseover (also working with keyboard selection)
				u.e.addOverEvent(this.bn_add_media, this.field.ul_new_tag_options.optionFocus.bind(this.field.ul_new_tag_options));


				u.ce(this.bn_add_media);
				this.bn_add_media.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_media.clicked = function(event) {
					var tag = this.field.addMediaTag();
					u.ia(tag, this.tag);

					// If new tag was added by keyboard shortcut via new tag options
					if(event.type === "keydown") {

						// set focus only after ENTER keyup
						// to prevent it from creating yet another tag when keyup happens in newly focused tag
						this.field.ul_new_tag_options.handleEnterKeyUp(tag);

					}
					else {
						this.field.returnFocus(tag);
					}

					// Remove new tag options
					this.tag.bn_add.cleanupOptions();

				}
			}
			else if(this.field.media_allowed.length) {
				u.bug("some information is missing to support media upload:\nitem_id="+this.field._item_id+"\nmedia_add_action="+this.field.media_add_action+"\nmedia_delete_action="+this.field.media_delete_action);
			}


			// Add list tag option (if allowed)
			if(this.field.button_allowed.length) {

				this.bn_add_button = u.ae(this.field.ul_new_tag_options, "li", {"class":"button", "html":"Button"});
				this.bn_add_button.field = this.field;
				this.bn_add_button.tag = this.tag;


				// Enable crossfunctional mouseover (also working with keyboard selection)
				u.e.addOverEvent(this.bn_add_button, this.field.ul_new_tag_options.optionFocus.bind(this.field.ul_new_tag_options));


				u.ce(this.bn_add_button);
				this.bn_add_button.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_button.clicked = function(event) {
					var tag = this.field.addButtonTag(this.field.button_allowed[0]);
					u.ia(tag, this.tag);

					// If new tag was added by keyboard shortcut via new tag options
					if(event.type === "keydown") {

						// set focus only after ENTER keyup
						// to prevent it from creating yet another tag when keyup happens in newly focused tag
						this.field.ul_new_tag_options.handleEnterKeyUp(tag);

					}
					else {
						this.field.returnFocus(tag);
					}

					// Remove new tag options
					this.tag.bn_add.cleanupOptions();

				}
			}


			// Add code tag option (if allowed)
			if(this.field.code_allowed.length) {

				this.bn_add_code = u.ae(this.field.ul_new_tag_options, "li", {"class":"code", "html":"Code"});
				this.bn_add_code.field = this.field;
				this.bn_add_code.tag = this.tag;


				// Enable crossfunctional mouseover (also working with keyboard selection)
				u.e.addOverEvent(this.bn_add_code, this.field.ul_new_tag_options.optionFocus.bind(this.field.ul_new_tag_options));


				u.ce(this.bn_add_code);
				this.bn_add_code.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_code.clicked = function(event) {
					var tag = this.field.addCodeTag(this.field.code_allowed[0]);
					u.ia(tag, this.tag);

					// If new tag was added by keyboard shortcut via new tag options
					if(event.type === "keydown") {

						// set focus only after ENTER keyup
						// to prevent it from creating yet another tag when keyup happens in newly focused tag
						this.field.ul_new_tag_options.handleEnterKeyUp(tag);

					}
					else {
						this.field.returnFocus(tag);
					}

					// Remove new tag options
					this.tag.bn_add.cleanupOptions();

				}
			}


			// Add external video tag option (if allowed)
			if(this.field.ext_video_allowed.length) {

				this.bn_add_ext_video = u.ae(this.field.ul_new_tag_options, "li", {"class":"video", "html":"External video ("+this.field.ext_video_allowed.join(", ")+")"});
				this.bn_add_ext_video.field = this.field;
				this.bn_add_ext_video.tag = this.tag;


				// Enable crossfunctional mouseover (also working with keyboard selection)
				u.e.addOverEvent(this.bn_add_ext_video, this.field.ul_new_tag_options.optionFocus.bind(this.field.ul_new_tag_options));


				u.ce(this.bn_add_ext_video);
				this.bn_add_ext_video.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_ext_video.clicked = function(event) {
					var tag = this.field.addExternalVideoTag(this.field.ext_video_allowed[0]);
					u.ia(tag, this.tag);

					// If new tag was added by keyboard shortcut via new tag options
					if(event.type === "keydown") {

						// set focus only after ENTER keyup
						// to prevent it from creating yet another tag when keyup happens in newly focused tag
						this.field.ul_new_tag_options.handleEnterKeyUp(tag);

					}
					else {
						this.field.returnFocus(tag);
					}

					// Remove new tag options
					this.tag.bn_add.cleanupOptions();

				}
			}


			// Add file tag option (if allowed)
			if(this.field.file_allowed.length && this.field._item_id && this.field.file_add_action && this.field.file_delete_action && !u.browser("IE", "<=9")) {

				this.bn_add_file = u.ae(this.field.ul_new_tag_options, "li", {"class":"file", "html":"Downloadable file"});
				this.bn_add_file.field = this.field;
				this.bn_add_file.tag = this.tag;


				// Enable crossfunctional mouseover (also working with keyboard selection)
				u.e.addOverEvent(this.bn_add_file, this.field.ul_new_tag_options.optionFocus.bind(this.field.ul_new_tag_options));


				u.ce(this.bn_add_file);
				this.bn_add_file.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_file.clicked = function(event) {
					var tag = this.field.addFileTag(this.field.file_allowed[0]);
					u.ia(tag, this.tag);

					// If new tag was added by keyboard shortcut via new tag options
					if(event.type === "keydown") {

						// set focus only after ENTER keyup
						// to prevent it from creating yet another tag when keyup happens in newly focused tag
						this.field.ul_new_tag_options.handleEnterKeyUp(tag);

					}
					else {
						this.field.returnFocus(tag);
					}

					// Remove new tag options
					this.tag.bn_add.cleanupOptions();

				}
			}
			else if(this.field.file_allowed.length) {
				u.bug("some information is missing to support file upload:\nitem_id="+this.field._item_id+"\nfile_add_action="+this.field.file_add_action+"\nfile_delete_action="+this.field.file_delete_action);
			}

		}

		// Handle add new tag keyboard shortcut activation
		tag.addTagShortcut = function(event) {


			// Open new tag options
			this.bn_add.clicked(event);


			// Enable focus
			this.field.ul_new_tag_options.setAttribute("tabindex", -1);
			this.field.ul_new_tag_options.focus();


			// Close options when focus leaves
			u.e.addEvent(this.field.ul_new_tag_options, "blur", this.bn_add.cleanupOptions.bind(this.bn_add));


			// Set focus on first option
			this.field.ul_new_tag_options.optionFocus({"target": this.field.ul_new_tag_options.firstChild});

			// move to next option
			this.field.ul_new_tag_options.nextTagOption = function(event) {
				var next = u.ns(this.selected_option) || this.firstChild;
				this.optionFocus({"target": next});
			}
			// move to previous option
			this.field.ul_new_tag_options.prevTagOption = function(event) {
				var next = u.ps(this.selected_option) || this.lastChild;
				this.optionFocus({"target": next});
			}
			// Select marked tag option
			this.field.ul_new_tag_options.selectTagOption = function(event) {
				this.selected_option.clicked(event);
			}
			// ENTER to select new tag option will fire a keyup event in newly created tag
			// This must be handled to avoid creating yet another tag
			// In this case focus is omitted on tag-creation and set after keyup has happed.
			this.field.ul_new_tag_options.handleEnterKeyUp = function(tag) {

				// set focus only after ENTER keyup
				// to prevent it from creating yet another tag when keyup happens in newly focused tag
				window.temp_enter_event_tag = tag;
				window.temp_enter_event_handler = function(event) {
					u.e.removeEvent(document, "keyup", window.temp_enter_event_handler);
					window.temp_enter_event_tag.virtual_input.focus();
					delete window.temp_enter_event_handler;
					delete window.temp_enter_event_tag;
				}
				u.e.addEvent(document, "keyup", window.temp_enter_event_handler)

			}


			// Add keys for keyboard navigation
			u.k.addKey(this.field.ul_new_tag_options, "UP", {
				"focused": true,
				"metakey": false,
				"callback": "prevTagOption"
			});
			u.k.addKey(this.field.ul_new_tag_options, "DOWN", {
				"focused": true,
				"metakey": false,
				"callback": "nextTagOption"
			});
			u.k.addKey(this.field.ul_new_tag_options, "ENTER", {
				"focused": true,
				"metakey": false,
				"callback": "selectTagOption"
			});

		}

		// Add new tag shortcut
		u.k.addKey(tag, "+", {
			"focused": true,
			"callback": "addTagShortcut"
		});


		// add remove button
		tag.bn_remove = u.ae(tag.ul_tag_options, "li", {"class":"remove"});
		tag.bn_remove.field = this;
		tag.bn_remove.tag = tag;
		u.ce(tag.bn_remove);
		tag.bn_remove.clicked = function() {
			this.field.deleteTag(this.tag);
		}


		// add CSS button
		tag.bn_classname = u.ae(tag.ul_tag_options, "li", {"class":"classname"});
		tag.bn_classname.default_test = "CSS classname";
		tag.bn_classname.span = u.ae(tag.bn_classname, "span", {"html": tag.bn_classname.default_test});
		tag.updateClassName = function(classname) {
			if(classname) {
				this._classname = classname;
				this.bn_classname.span.innerHTML = classname;
			}
			else {
				this._classname = "";
				this.bn_classname.span.innerHTML = this.bn_classname.default_test
			}
		}
		tag.bn_classname.field = this;
		tag.bn_classname.tag = tag;
		u.ce(tag.bn_classname);
		tag.bn_classname.clicked = function(event) {
			this.field.classnameTag(this.tag);
		}

	}



	// Open tag data input overlay
	// For media, file and external video meta data
	field.tagMetadataOverlay = function(tag, title, _options) {

		var width = 600;
		var height = 500;

		if(obj(_options)) {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {

					case "width"               : width                = _options[_argument]; break;
					case "height"              : height               = _options[_argument]; break;

				}
			}
		}

		var overlay = u.overlay({
			"title": title,
			"width": width,
			"height": height,
			"esc": true
		});

		overlay.tag = tag;

		overlay.closed = function(event) {
			this.tag.field.returnFocus(this.tag);

			// Update generated HTML
			this.tag.field.update();
		}

		return overlay;
	}

	// Add button to tag for exiting metadata
	field.addEditMetadataButton = function(tag) {

		u.ac(tag, "edit_overlay");
		// Inject specific edit button
		tag.bn_edit = u.ae(tag.virtual_input, "span", {"class":"edit"});
		tag.bn_edit.tag = tag;
		u.ce(tag.bn_edit);

		tag.bn_edit.clicked = function(event) {
			this.tag.editMetadata(this.tag);
		}

		u.k.addKey(tag, "e", {
			"callback": tag.bn_edit.clicked.bind(tag.bn_edit),
			"focused": true,
		});

		// Also make virtual input clickable for ext_video (where virtual input does not contain file upload)
		if(tag.virtual_input && tag.type.match(/ext_video|button/)) {
			u.ce(tag.virtual_input);
			tag.virtual_input.clicked = function(event) {
				this.tag.editMetadata(this.tag);
			}
		}

	}

	// Delete file on server, when file based tag is deleted from editor
	field.deleteFile = function(tag) {

		var existing_values = tag.virtual_input.val();
		// u.bug("existing_values", existing_values);

		if(existing_values && existing_values.variant) {

			// create form data to submit delete request
			var form_data = new FormData();

			// append relevant data
			form_data.append("item_id", this._item_id);
			form_data.append("file_variant", existing_values.variant);
	
			form_data.append("csrf-token", this._form.inputs["csrf-token"].val());

			// request response handler
			tag.response = function(response) {

				// notify interface
				page.notify(response);

				// if every thing is good udate and save
				if(response.cms_status && response.cms_status == "success") {

					// all good

					// update viewer
					// deleteTag updates
					// this.field.update();
				}
			}
			u.request(tag, this.file_delete_action, {
				"method":"post", 
				"data":form_data
			});

		}

	}



	// EXTERNAL VIDEO TAG

	// Add tag
	field.addExternalVideoTag = function(type, node) {
		// u.bug("addExternalVideoTag", type, node);

		// create new tag
		var tag = this.createTag(this.ext_video_allowed, type);
		tag.type = "ext_video";
		u.ac(tag, tag.type);


		tag.default_label = "Click to add button properties";


		tag.virtual_input = u.ae(tag, "div", {"class":"text", "tabindex": 0});
		tag.virtual_input.span_value = u.ae(tag.virtual_input, "span", {"class":"value", "html": tag.default_label});
		tag.virtual_input.tag = tag;
		tag.virtual_input.field = this;
		tag.virtual_input._form = this._form;


		tag.virtual_input.input_list = [
			"video_url", 
			"poster_format", 
			"variant", 
			"poster_width", 
			"poster_height", 
			"file_name", 
			"file_description", 
			"created_at"
		];

		// define values object for storing meta data
		tag.virtual_input.values = {};


		// Enable meta data editing via overlay
		tag.editMetadata = this.externalVideoMetadata.bind(this);
		this.addEditMetadataButton(tag);


		// Update virtual input on data update
		tag.virtual_input.updateView = function() {
			// u.bug("updateView", this.values);

			// Show video_url
			if(this.values.video_url) {
				this.span_value.innerHTML = this.values.video_url;
				u.ac(this.tag, "done");
			}
			else {
				this.span_value.innerHTML = this.tag.default_label;
				u.rc(this.tag, "done");
			}


			// Show poster
			if(this.values.poster_format && this.values.variant) {

				u.ac(this.tag, "previewing");
				var image_src = "/images/"+this.field._item_id+"/"+this.values.variant+"/"+this.tag.virtual_input.offsetWidth+"x."+this.values.poster_format;

				// Adjust preview height
				// Due to borders, height must be set on tag node
				u.ass(this.tag, {
					"height": ((this.tag.virtual_input.offsetWidth / this.values.poster_width) * this.values.poster_height) + "px",
				});
				u.ass(this.tag.virtual_input, {
					"backgroundImage": "url("+image_src+"?"+u.randomString(4)+")"
				});

			}
			else {
				u.rc(this.tag, "previewing");
				u.ass(this.tag, {
					"height": "unset",
				});
				u.ass(this.tag.virtual_input, {
					"backgroundImage": "unset"
				});

			}

		}


		// Complex data value getter/setter
		tag.virtual_input.val = function(value_object) {
			// u.bug("value_object", value_object);

			// Complex value passed as object
			if(value_object !== undefined && obj(value_object)) {

				// Value object can contain a single or multiple values
				for(input in value_object) {
					if(this.input_list.includes(input)) {
						this.values[input] = value_object[input];
					}
				}

				this.updateView();
			}

			return {
				"video_url": this.values.video_url, 
				"poster_format": this.values.poster_format,
				"variant": this.values.variant,
				"poster_width": this.values.poster_width,
				"poster_height": this.values.poster_height,
				"file_name": this.values.file_name,
				"file_description": this.values.file_description,
				"created_at": this.values.created_at,
			};
		}


		// if we have a video tag node with data
		if(node) {


			// Extract data
			var meta_list = u.qs("ul.metadata", node);
			if(meta_list) {

				// Sanitize before looking for custom classnames
				u.rc(node, "ext_video");

				// set classname if present
				if(node.className !== type) {
					var classname = node.className.replace(type, "").trim();
					tag.updateClassName(classname);
				}


				var meta_video = u.qs("li[itemprop=contentUrl]", meta_list);
				var meta_name = u.qs("li[itemprop=name]", meta_list);
				var meta_description = u.qs("li[itemprop=description]", meta_list);
				var meta_created_at = u.qs("li[itemprop=uploadDate]", meta_list);
				var meta_poster = u.qs("li[itemprop=thumbnailUrl]", meta_list);
				var meta_width = u.qs("li[itemprop=width]", meta_list);
				var meta_height = u.qs("li[itemprop=height]", meta_list);

				// get file info from node
				var video_url = meta_video ? meta_video.innerHTML.trim() : "";
				var file_name = meta_name ? meta_name.innerHTML.trim() : "";
				var file_description = meta_description ? meta_description.innerHTML.trim() : "";
				var created_at = meta_created_at ? meta_created_at.innerHTML.trim() : u.date("Y-m-d H:i:s");
				var poster_width = meta_width ? meta_width.innerHTML.trim() : "";
				var poster_height = meta_height ? meta_height.innerHTML.trim() : "";

				var variant = meta_list ? (meta_list.getAttribute("data-variant") || "") : "";
				var poster_format = meta_list ? (meta_list.getAttribute("data-poster-format") || "") : "";

				tag.virtual_input.val({
					"video_url": video_url,
					"poster_format": poster_format,
					"variant": variant,
					"poster_width": poster_width,
					"poster_height": poster_height,
					"file_name": file_name,
					"file_description": file_description,
					"created_at": created_at,
				});
			}
			// Attempt to parse values from old file syntax
			else {

				// Version 1 syntax
				// <div class="youtube video_id:dQw4w9WgXcQ"></div>
				// <div class="vimeo video_id:76979871"></div>

				// Get video id and type and put valid url together
				var video_url;
				var video_id = u.cv(node, "video_id");
				if(video_id) {

					// Manually create url, by using standard embed url
					if(u.hc(node, "youtube")) {
						video_url = "https://www.youtube.com/watch?v="+video_id;
					}
					else if(u.hc(node, "vimeo")) {
						video_url = "https://vimeo.com/"+video_id;
					}

				}


				// Update value
				if(video_url) {
					tag.virtual_input.val({
						"video_url": video_url,
						"created_at": u.date("Y-m-d H:i:s")
					});
				}

			}

		}

		
		// monitor keyboard interaction
		// Observe ENTER and backwards tabbing to set cursor correctly
		u.e.addEvent(tag.virtual_input, "keydown", this._changing_content);

		// Observe ENTER, SPACE and DELETE
		u.e.addEvent(tag.virtual_input, "keyup", this._ext_video_changed);


		// add focus and blur handlers
		u.e.addEvent(tag.virtual_input, "focus", tag.field._focused_content);
		u.e.addEvent(tag.virtual_input, "blur", tag.field._blurred_content);


		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(tag.virtual_input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(tag.virtual_input, "mouseleave", u.f._mouseleave);
		}


		// Update HTML
		this.update();


		// enable dragging of html-tags
		this.editor.updateTargets();
		this.editor.updateDraggables();

		return tag;
	}

	// Overlay for external video meta data
	field.externalVideoMetadata = function(tag) {

		tag.overlay = this.tagMetadataOverlay(tag, "External video");

		// Get existing values
		var values = tag.virtual_input.val();
		// u.bug("externalVideoMetadata", tag, values);

		var form = u.f.addForm(tag.overlay.div_content);
		form.tag = tag;

		// Transfer item_id, for file inputs
		form.setAttribute("data-item_id", tag.field._item_id);

		// Add csrf-token
		u.f.addField(form, {
			"name": "csrf-token",
			"type": "hidden",
			"value": tag.field._form.inputs["csrf-token"].val(),
		});



		var fieldset = u.f.addFieldset(form);

		// Create inputs
		u.f.addField(fieldset, {
			"name": "video_url",
			"type": "string",
			"required": true,
			"pattern": "http[s]?\:\/\/[a-zA-Z0-9]+[^$]+",
			"label": "Video URL",
			"value": values.video_url,
			"hint_message": "Enter the full link to the video",
			"error_message": "External Video URL must start with https:// or http:// and be a valid link to the video",
		});

		var poster_object = values.poster_format ? [{
			"name": "Poster", 
			"variant": values.variant,
			"format": values.poster_format,
			"width": values.poster_width,
			"height": values.poster_height,
		}] : false;
		u.f.addField(fieldset, {
			"name": "file_poster[0]",
			"type": "files",
			"allowed_formats": "jpg,png",
			"label": "Poster image in same dimensions as the external video",
			"value": poster_object,
			"max": 1,
			"file_delete": this.getAttribute("data-file-delete"),
			"is_poster": true,
		});

		u.f.addField(fieldset, {
			"name": "file_name",
			"type": "string",
			"label": "Video name / title",
			"required": true,
			"value": values.file_name,
			"hint_message": "Enter the name or title of the video. This will be provided to search engines for better indexing",
		});
		u.f.addField(fieldset, {
			"name": "created_at",
			"type": "datetime",
			"label": "Created date and time",
			"value": (values.created_at || u.date("Y-m-d H:i:s")),
			"hint_message": "When was the video created. This will be provided to search engines for better indexing",
		});
		u.f.addField(fieldset, {
			"name": "file_description",
			"type": "text",
			"label": "Description",
			"value": values.file_description,
			"hint_message": "Enter a meaningful description for the video. This will be provided to search engines for better indexing",
		});

		u.f.addAction(form, {
			"name": "update",
			"value": "Update",
			"class": "button primary",
		});
		
		u.f.init(form);

		form.inputs["file_poster[0]"].fileDeleted = function(file) {
			u.bug("file was delete", file);
			this._form.tag.virtual_input.val({
				"poster_format": "",
			});

		}

		u.k.addKey(form, "s", {
			"callback":"submit",
			"focused":true
		});

		form.inputs["video_url"].focus();

		form.submitted = function(iN) {

			var submitted_values = this.getData({"format":"object"});
			var existing_values = this.tag.virtual_input.val();

			u.ac(this, "submitting");

			// u.bug("submitted", submitted_values, existing_values);


			// Update tag values
			// Will update poster values (if any) after upload
			this.tag.virtual_input.val(submitted_values);



			var form_data = this.getData();

			// append item_id and variant
			form_data.append("item_id", this.tag.field._item_id);

			// Updating existing poster
			if(existing_values.variant) {
				form_data.append("file_variant", existing_values.variant);
			}
			// Adding first poster
			else {
				form_data.append("new_variant", "HTMLEDITOR-"+this.tag.field.input.name+"-"+this.tag.type+"-"+u.randomString(8));
			}

			// Let backend know this is a speciel case
			form_data.append("type", this.tag.type);


			// response handler
			this.response = function(response) {
				// u.bug("response", response);

				page.notify(response);
				u.rc(this, "submitting");

				if(response.cms_status && response.cms_status == "success") {

					this.tag.virtual_input.val({
						"variant": response.cms_object.variant,
						"poster_format": (response.cms_object.poster ? response.cms_object.poster : ""),
						"poster_width": response.cms_object.width,
						"poster_height": response.cms_object.height,
						"created_at": response.cms_object.created_at,
					});

					// update viewer
					this.tag.field.update();

					// save after upload is complete
					this.tag.field._form.submit();
				}

				// Close overlay
				this.tag.overlay.close();

			}
			u.request(this, this.tag.field.file_update_metadata_action, {
				"method":"post",
				"data":form_data
			});

		}

	}

	// attached to tag.virtual_input node for overlay editable tags
	field._ext_video_changed = function(event) {
		// u.bug("_ext_video_changed:", this, "val:" + this.val(), event, event.shiftKey, event.ctrlKey, event.metaKey);


		// [ENTER] or [SPACE]
		if(event.keyCode == 13 || event.keyCode == 32) {
			u.e.kill(event);

			// Open overlay
			this.clicked();

		}

		// [DELETE] - 2 x DELETE deletes tag
		else if(event.keyCode == 8) {

			// node in deletable state?
			if(this.is_deletable) {
				// u.bug("go ahead delete me");

				u.e.kill(event);

				this.field.deleteTag(this.tag);

			}

			// no value, enter deletable state
			else {
				this.is_deletable = true;
			}

		}

		// any other key, remove deletable state 
		else {
			this.is_deletable = false;
		}


		// global update
		this.field.update();

	}



	// MEDIA TAG

	// Add tag
	field.addMediaTag = function(type, node) {

		// create new tag
		var tag = this.createTag(["media"], "media");
		tag.type = "media";

		tag.default_label = "Drop file here";

		tag.virtual_input = u.ae(tag, "div", {"class":"text"});
		tag.virtual_input.span_value = u.ae(tag.virtual_input, "span", {"class":"value", "html": tag.default_label});
		tag.virtual_input.tag = tag;
		tag.virtual_input.field = this;
		tag.virtual_input._form = this._form;


		// Add upload input
		tag.file_input = u.ae(tag.virtual_input, "input", {"type":"file", "name":"htmleditor_media"});
		tag.file_input.tag = tag;
		tag.file_input.field = this;

		tag.virtual_input.input_list = [
			"file_name", 
			"file_description", 
			"filesize", 
			"created_at",

			"width",
			"height",

			"variant",
			"format",

			"poster"
		];


		// define values object for storing meta data
		tag.virtual_input.values = {};


		// Enable meta data editing via overlay
		tag.editMetadata = this.mediaMetadata.bind(this);
		this.addEditMetadataButton(tag);


		// Update virtual input on data update
		tag.virtual_input.updateView = function() {
			// u.bug("media updateView", this.values);

			// Show video_url
			if(this.values.file_name) {
				this.span_value.innerHTML = this.values.file_name;
				u.ac(this.tag, "done");
			}
			else {
				this.span_value.innerHTML = this.tag.default_label;
				u.rc(this.tag, "done");
			}

			// Remove previous preview
			u.rc(this, "preview_(image|video)");
			if(this.player) {
				this.player.parentNode.removeChild(this.player);
				delete this.player;
			}
			if(this.ul_controls) {
				this.ul_controls.parentNode.removeChild(this.ul_controls);
				delete this.ul_controls;
			}
			u.ass(this.tag, {
				"height": "auto",
			});
			u.ass(this.tag.virtual_input, {
				"backgroundImage": "unset",
			});


			if(this.values.format && this.values.variant && this.values.width && this.values.height) {

				if(this.values.format.match(/^(mov|mp4|ogv|3gp)$/i)) {

					u.ac(this.tag, "previewing");
					u.ac(this, "preview_video");

					// enable playback
					var video_src = "/videos/"+this.field._item_id+"/"+this.values.variant+"/1000x."+this.values.format;
					this.player = u.videoPlayer({"muted":true, "loop":true, "preload":"metadata"});
					this.player.media.setAttribute("tabindex", -1);
					this.player.preview = this;
					u.ae(this, this.player);


					// Wait for preview to be generated
					u.ac(this, "loading-preview");
					this.player.loadedmetadata = function(event) {
						u.rc(this.preview, "loading-preview");
					}

					// Load url to show first frame
					this.player.load(video_src+"?"+u.randomString(4));


					// Add poster
					if(this.values.poster) {
						var poster_src = "/images/"+this.field._item_id+"/"+this.values.variant+"/1000x."+this.values.poster;
						this.player.media.poster = poster_src;
					}

					this.controls_parent = this;
					// Add media preview controls (play / mute)
					u.f.addMediaPlayerControls(this.player);


					// Adjust preview height
					// Due to borders, height must be set on tag node
					u.ass(this.tag, {
						"height": ((this.tag.virtual_input.offsetWidth / this.values.width) * this.values.height) + "px",
					});

				}
				else if(this.values.format.match(/^(jpg|png|gif)$/i)) {
					// u.bug("image preview");

					u.ac(this.tag, "previewing");
					u.ac(this, "preview_image");

					var image_src = "/images/"+this.field._item_id+"/"+this.values.variant+"/1000x."+this.values.format;

					// Adjust preview height
					// Due to borders, height must be set on tag node
					u.ass(this.tag, {
						"height": ((this.tag.virtual_input.offsetWidth / this.values.width) * this.values.height) + "px",
					});
					u.ass(this.tag.virtual_input, {
						"backgroundImage": "url("+image_src+"?"+u.randomString(4)+")"
					});

				}

			}

		}

		// Complex data value getter/setter
		tag.virtual_input.val = function(value_object) {
			// u.bug("value_object", value_object);

			// Complex value passed as object
			if(value_object !== undefined && obj(value_object)) {

				// Value object can contain a single or multiple values
				for(input in value_object) {
					if(this.input_list.includes(input)) {
						this.values[input] = value_object[input];
					}
				}

				this.updateView();
			}

			return {
				"file_name": this.values.file_name, 
				"file_description": this.values.file_description,
				"created_at": this.values.created_at,

				"width": this.values.width,
				"height": this.values.height,

				"variant": this.values.variant,
				"format": this.values.format,

				"poster": this.values.poster,
			};
		}


		// if we have media info
		if(node) {

			// Extract data
			var meta_list = u.qs("ul.metadata", node);
			if(meta_list) {

				// Get media type from node
				var media_type = u.hc(node, "image") ? "image" : "video";
				// Sanitize before looking for custom classnames
				u.rc(node, media_type);

				// set classname if present
				if(node.className !== type) {
					var classname = node.className.replace(type, "").trim();
					tag.updateClassName(classname);
				}


				var meta_name = u.qs("li[itemprop=name]", meta_list);
				var meta_description = u.qs("li[itemprop=description]", meta_list);
				var meta_width = u.qs("li[itemprop=width]", meta_list);
				var meta_height = u.qs("li[itemprop=height]", meta_list);
				var meta_created_at = u.qs("li[itemprop=uploadDate]", meta_list);

				// get file info from node
				var file_name = meta_name ? meta_name.innerHTML.trim() : "";
				var file_description = meta_description ? meta_description.innerHTML.trim() : "";
				var width = meta_width ? meta_width.innerHTML.trim() : "";
				var height = meta_height ? meta_height.innerHTML.trim() : "";

				var created_at = meta_created_at ? meta_created_at.innerHTML.trim() : u.date("Y-m-d H:i:s");

				var variant = meta_list ? (meta_list.getAttribute("data-variant") || "") : "";
				var format = meta_list ? (meta_list.getAttribute("data-format") || "") : "";
				var poster = meta_list ? (meta_list.getAttribute("data-poster") || "") : "";

				tag.virtual_input.val({
					"file_name": file_name,
					"file_description": file_description,
					"width": width,
					"height": height,
					"created_at": created_at,

					"variant": variant,
					"format": format,
					"poster": poster,
				});

			}
			// Attempt to parse values from old file syntax
			else {

				// old syntax

				// Version 1
				// <div class="media item_id:39561 variant:HTMLEDITOR-v_html-media-ACtocCon name:whatever filesize:123 format:png width:1566 height:572">
				// 	<p><a href="/images/39561/variant:HTMLEDITOR-v_html-media-ACtocCon/480x.png">Whatever</a></p>
				// </div>


				var variant = u.cv(node, "variant");
				if(variant) {

					// Not all values are available for new syntax
					// Get missing info from server
					var data = new FormData();
					data.append("item_id", this._item_id);
					data.append("file_variant", variant);
					data.append("csrf-token", this._form.inputs["csrf-token"].val());

					tag.response = function(response) {
						// u.bug("response", response);

						if(response && response.cms_object) {

							tag.virtual_input.val({
								"url": "/download/"+response.cms_object.item_id+"/"+response.cms_object.variant+"/"+response.cms_object.name,
								"file_name": response.cms_object.name,
								"file_description": response.cms_object.description,
								"width": response.cms_object.width,
								"height": response.cms_object.height,
								"created_at": response.cms_object.created_at,

								"variant": response.cms_object.variant,
								"format": response.cms_object.format,
								"poster": response.cms_object.poster,
							});

						}
						// File was not found
						else {
							tag.virtual_input.val({
								"url": false,
								"file_name": false,
								"file_description": false,
								"width": false,
								"height": false,
								"created_at": false,

								"variant": false,
								"format": false,
								"poster": false,
							});
						}

					}
					u.request(tag, this.file_media_info_action, {
						"method": "post",
						"data": data,
					});

				}

			}

		}


		// wait for upload
		u.e.addEvent(tag.file_input, "change", this._media_changed);


		// 	// add focus and blur handlers
		u.e.addEvent(tag.file_input, "focus", tag.field._focused_content);
		u.e.addEvent(tag.file_input, "blur", tag.field._blurred_content);

		if(u.e.event_support != "touch") {
			u.e.addEvent(tag.file_input, "dragenter", tag.field._focused_content);
			u.e.addEvent(tag.file_input, "dragleave", tag.field._blurred_content);
			u.e.addEvent(tag.file_input, "drop", tag.field._blurred_content);
		}


		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(tag.virtual_input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(tag.virtual_input, "mouseleave", u.f._mouseleave);
		}


		// Update HTML
		this.update();


		// enable dragging of html-tags
		this.editor.updateTargets();
		this.editor.updateDraggables();

		return tag;
	}

	// Overlay for external video meta data
	field.mediaMetadata = function(tag) {

		tag.overlay = this.tagMetadataOverlay(tag, "Media");

		// Get existing values
		var values = tag.virtual_input.val();
		u.bug("mediaMetadata", tag, values);

		var form = u.f.addForm(tag.overlay.div_content);
		form.tag = tag;

		// Transfer item_id, for file inputs
		form.setAttribute("data-item_id", tag.field._item_id);

		// Add csrf-token
		u.f.addField(form, {
			"name": "csrf-token",
			"type": "hidden",
			"value": tag.field._form.inputs["csrf-token"].val(),
		});

		var media_type = "image";
		if(values.format.match(/^(mov|mp4|ogv|3gp)$/i)) {
			media_type = "video";
		}


		var fieldset = u.f.addFieldset(form);

		// Only add poster option for video media
		if(media_type === "video") {
			var poster_object = values.poster ? [{
				"name": "Poster", 
				"variant": values.variant,
				"format": values.poster,
				"width": values.width,
				"height": values.height,
			}] : false;
			u.f.addField(fieldset, {
				"name": "file_poster[0]",
				"type": "files",
				"allowed_formats": "jpg,png",
				"label": "Poster image in same dimensions as video",
				"value": poster_object,
				"max": 1,
				"file_delete": this.getAttribute("data-file-delete"),
				"is_poster": true,
			});
		}

		u.f.addField(fieldset, {
			"name": "file_name",
			"type": "string",
			"label": "Video name / title",
			"required": true,
			"value": values.file_name,
			"hint_message": "Enter the name or title of the media. This will be provided to search engines for better indexing",
		});
		u.f.addField(fieldset, {
			"name": "created_at",
			"type": "datetime",
			"label": "Created date and time",
			"value": (values.created_at || u.date("Y-m-d H:i:s")),
			"hint_message": "When was the media created. This will be provided to search engines for better indexing",
		});
		u.f.addField(fieldset, {
			"name": "file_description",
			"type": "text",
			"label": "Description",
			"value": values.file_description,
			"hint_message": "Enter a meaningful description for the media. This will be provided to search engines for better indexing",
		});

		u.f.addAction(form, {
			"name": "update",
			"value": "Update",
			"class": "button primary",
		});
		
		u.f.init(form);

		u.k.addKey(form, "s", {
			"callback":"submit",
			"focused":true
		});


		if(media_type === "video") {

			form.inputs["file_poster[0]"].fileDeleted = function(file) {
				u.bug("file was delete", file);
				this._form.tag.virtual_input.val({
					"poster_format": "",
				});

			}

			form.inputs["file_poster[0]"].focus();
		}
		else {
			form.inputs["file_name"].focus();
		}


		form.submitted = function(iN) {

			var submitted_values = this.getData({"format":"object"});
			var existing_values = this.tag.virtual_input.val();

			u.ac(this, "submitting");

			// u.bug("submitted", submitted_values, existing_values);


			// Update tag values
			// Will update poster values (if any) after upload
			this.tag.virtual_input.val(submitted_values);



			var form_data = this.getData();

			// append item_id and variant
			form_data.append("item_id", this.tag.field._item_id);
			form_data.append("file_variant", existing_values.variant);

			// Let backend know this is a media update
			form_data.append("type", this.tag.type);


			// response handler
			this.response = function(response) {
				// u.bug("response", response);

				page.notify(response);
				u.rc(this, "submitting");

				if(response.cms_status && response.cms_status == "success") {

					this.tag.virtual_input.val({
						"poster": (response.cms_object.poster ? response.cms_object.poster : ""),
					});

					// update viewer
					this.tag.field.update();

					// save after upload is complete
					this.tag.field._form.submit();
				}

				// Close overlay
				this.tag.overlay.close();

			}
			u.request(this, this.tag.field.file_update_metadata_action, {
				"method":"post",
				"data":form_data
			});

		}

	}

	// attached to tag.virtual_input node for file-tags
	field._media_changed = function(event) {
		// u.bug("_file_changed", this);

		// create data form object to upload file
		var form_data = new FormData();

		// append relevant data
		form_data.append(this.name+"[0]", this.files[0], this.value);
		form_data.append("csrf-token", this.field._form.inputs["csrf-token"].val());
		form_data.append("item_id", this.field._item_id);
		form_data.append("type", this.tag.type);

		// Tell backend about field relation, to be able to add input name to media variant
		form_data.append("input_name", this.name);
		// form_data.append("field_name", this.field.input.name);

		form_data.append("new_variant", "HTMLEDITOR-"+this.field.input.name+"-"+this.tag.type+"-"+u.randomString(8));

		// response handler
		this.response = function(response) {

			page.notify(response);

			if(response.cms_status && response.cms_status == "success" && response.cms_object.length === 1) {

				// If upload was successful and file existed before uploading new file,
				// then delete the existing file (if any)
				this.field.deleteFile(this.tag);


				// Update tag with new values
				this.tag.virtual_input.val({
					"url": "/download/"+response.cms_object[0].item_id+"/"+response.cms_object[0].variant+"/"+response.cms_object[0].name,
					"file_name": response.cms_object[0].name,
					"file_description": response.cms_object[0].description,
					"filesize": response.cms_object[0].filesize,
					"width": response.cms_object[0].width,
					"height": response.cms_object[0].height,

					"created_at": response.cms_object[0].created_at,

					"variant": response.cms_object[0].variant,
					"format": response.cms_object[0].format,
				});


				// update viewer
				this.tag.field.update();

				// save after upload is complete
				this.tag.field._form.submit();

				// Return focus
				this.tag.file_input.focus();

			}

		}
		u.request(this, this.field.file_add_action, {
			"method":"post", 
			"data":form_data
		});

	}



	// FILE TAG

	// add file tags
	field.addFileTag = function(type, node) {
		// u.bug("addFileTag", type, node);

		// create new tag
		var tag = this.createTag(["file"], "file");
		tag.type = "file";


		tag.default_label = "Drop file here";

		tag.virtual_input = u.ae(tag, "div", {"class":"text"});
		tag.virtual_input.span_value = u.ae(tag.virtual_input, "span", {"class":"value", "html": tag.default_label});
		tag.virtual_input.tag = tag;
		tag.virtual_input.field = this;
		tag.virtual_input._form = this._form;

		// Add upload input
		tag.file_input = u.ae(tag.virtual_input, "input", {"type":"file", "name":"htmleditor_file"});
		tag.file_input.tag = tag;
		tag.file_input.field = this;

		tag.virtual_input.input_list = [
			"url", 
			"file_name", 
			"file_description", 
			"filesize", 
			"created_at",
			"variant",
			"format"
		];

		// define values object for storing meta data
		tag.virtual_input.values = {};


		// Enable meta data editing via overlay
		tag.editMetadata = this.fileMetadata.bind(this);
		this.addEditMetadataButton(tag);


		// Update virtual input on data update
		tag.virtual_input.updateView = function() {

			// Show file name
			if(this.values.file_name) {
				this.span_value.innerHTML = this.values.file_name;
				u.ac(this.tag, "done");
			}
			else {
				this.span_value.innerHTML = this.tag.default_label;
				u.rc(this.tag, "done");
			}

		}

		// Complex data value getter/setter
		tag.virtual_input.val = function(value_object) {
			// u.bug("value_object", value_object);

			// Complex value passed as object
			if(value_object !== undefined && obj(value_object)) {

				// Value object can contain a single or multiple values
				for(input in value_object) {
					if(this.input_list.includes(input)) {
						this.values[input] = value_object[input];
					}
				}

				this.updateView();
			}

			return {
				"url": this.values.url,
				"file_name": this.values.file_name, 
				"file_description": this.values.file_description,
				"filesize": this.values.filesize,
				"created_at": this.values.created_at,

				"variant": this.values.variant,
				"format": this.values.format,
			};
		}


		// Do we have a content node
		if(node) {

			// set classname if present
			if(node.className !== type) {
				var classname = node.className.replace(type, "").trim();
				tag.updateClassName(classname);
			}

			// Extract data
			var meta_list = u.qs("ul.metadata", node);
			if(meta_list) {

				var meta_url = u.qs("li[itemprop=contentUrl]", meta_list);
				var meta_name = u.qs("li[itemprop=name]", meta_list);
				var meta_description = u.qs("li[itemprop=description]", meta_list);
				var meta_created_at = u.qs("li[itemprop=uploadDate]", meta_list);
				var meta_filesize = u.qs("li[itemprop=contentSize]", meta_list);

				// get file info from node
				var url = meta_url ? meta_url.innerHTML.trim() : "";
				var file_name = meta_name ? meta_name.innerHTML.trim() : "";
				var file_description = meta_description ? meta_description.innerHTML.trim() : "";
				var created_at = meta_created_at ? meta_created_at.innerHTML.trim() : u.date("Y-m-d H:i:s");
				var filesize = meta_filesize ? meta_filesize.innerHTML.trim() : "";

				var variant = meta_list ? (meta_list.getAttribute("data-variant") || "") : "";
				var format = meta_list ? (meta_list.getAttribute("data-format") || "") : "";

				tag.virtual_input.val({
					"url": url,
					"file_name": file_name,
					"file_description": file_description,
					"filesize": filesize,
					"created_at": created_at,

					"variant": variant,
					"format": format,
				});

			}
			// Attempt to parse values from old file syntax
			else {


				// Version 1
				// <div class="file item_id:39561 variant:HTMLEDITOR-v_html-file-gyCqbCHj name:Whatever filesize:123">
				// 	<p><a href="/download/39561/HTMLEDITOR-v_html-file-gyCqbCHj/whatever.zip">Whatever</a></p>
				// </div>



				// Not all values are available for new syntax
				var variant = u.cv(node, "variant");
				// If variant is available
				// Get missing info from server
				if(variant) {

					var data = new FormData();
					data.append("item_id", this._item_id);
					data.append("file_variant", variant);
					data.append("csrf-token", this._form.inputs["csrf-token"].val());

					tag.response = function(response) {
						// u.bug("response", response);

						if(response && response.cms_object) {

							tag.virtual_input.val({
								"url": "/download/"+response.cms_object.item_id+"/"+response.cms_object.variant+"/"+response.cms_object.name,
								"file_name": response.cms_object.name,
								"file_description": response.cms_object.description,
								"filesize": response.cms_object.filesize,
								"created_at": response.cms_object.created_at,

								"variant": response.cms_object.variant,
								"format": response.cms_object.format,
							});

						}
						// File was not found
						else {
							tag.virtual_input.val({
								"url": false,
								"file_name": false,
								"file_description": false,
								"filesize": false,
								"created_at": false,

								"variant": false,
								"format": false,
							});
						}

					}
					u.request(tag, this.file_media_info_action, {
						"method": "post",
						"data": data,
					});

				}

			}

		}


		// Currently no key interactions on file tag
		// 	// monitor changes and selections
		// 	// kills ENTER event
		// 	u.e.addEvent(tag.virtual_input, "keydown", tag.field._changing_content);
		//
		// 	// content has been modified or selected (can happen with mouse or keys)
		// 	u.e.addEvent(tag.virtual_input, "keyup", this._changed_file_content);
		// 	u.e.addEndEvent(tag.virtual_input, this._changed_file_content);


		// wait for upload
		u.e.addEvent(tag.file_input, "change", this._file_changed);


		// 	// add focus and blur handlers
		u.e.addEvent(tag.file_input, "focus", tag.field._focused_content);
		u.e.addEvent(tag.file_input, "blur", tag.field._blurred_content);

		if(u.e.event_support != "touch") {
			u.e.addEvent(tag.file_input, "dragenter", tag.field._focused_content);
			u.e.addEvent(tag.file_input, "dragleave", tag.field._blurred_content);
			u.e.addEvent(tag.file_input, "drop", tag.field._blurred_content);
		}

		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(tag.virtual_input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(tag.virtual_input, "mouseleave", u.f._mouseleave);
		}


		// Update HTML
		this.update();


		// enable dragging of html-tags
		this.editor.updateTargets();
		this.editor.updateDraggables();

		return tag;
	}

	// Metadata form for file tag
	field.fileMetadata = function(tag) {
		// u.bug("fileMetadata", this, tag);

		tag.overlay = this.tagMetadataOverlay(tag, "File");

		// Get existing values
		var values = tag.virtual_input.val();


		var form = u.f.addForm(tag.overlay.div_content);
		form.tag = tag;

		// Transfer item_id, for file inputs
		form.setAttribute("data-item_id", tag.field._item_id);

		// Add csrf-token
		u.f.addField(form, {
			"name": "csrf-token",
			"type": "hidden",
			"value": tag.field._form.inputs["csrf-token"].val(),
		});

		var fieldset = u.f.addFieldset(form);

		// Create inputs
		u.f.addField(fieldset, {
			"name": "file_name",
			"type": "string",
			"required": true,
			"label": "File name",
			"value": values.file_name,
			"hint_message": "This will be the name of the file when downloaded.",
			"error_message": "The file must have a name.",
		});
		u.f.addField(fieldset, {
			"name": "file_description",
			"type": "text",
			"label": "Description",
			"value": values.file_description,
			"hint_message": "Enter a meaningful description for the file. This will be provided to search engines for better indexing.",
		});
		u.f.addField(fieldset, {
			"name": "created_at",
			"type": "datetime",
			"label": "Created date and time",
			"value": (values.created_at || u.date("Y-m-d H:i:s")),
			"hint_message": "When was the file uploaded. This will be provided to search engines for better indexing.",
		});

		u.f.addAction(form, {
			"name": "update",
			"value": "Update",
			"class": "button primary",
		});

		u.f.init(form);

		u.k.addKey(form, "s", {
			"callback":"submit",
			"focused":true
		});

		form.inputs["file_name"].focus();

		form.submitted = function(iN) {

			var submitted_values = this.getData({"format":"object"});
			var existing_values = this.tag.virtual_input.val();

			u.ac(this, "submitting");


			// Update tag values
			this.tag.virtual_input.val(submitted_values);


			var form_data = this.getData();

			// append item_id and variant
			form_data.append("item_id", this.tag.field._item_id);
			form_data.append("file_variant", existing_values.variant);

			form_data.append("type", this.tag.type);

			// response handler
			this.response = function(response) {
				// u.bug("response", response);

				page.notify(response);
				u.rc(this, "submitting");

				if(response.cms_status && response.cms_status == "success") {


					// Expecting no new values returned


					// update viewer
					this.tag.field.update();

					// save after upload is complete
					this.tag.field._form.submit();
				}

				// Close overlay
				this.tag.overlay.close();

			}

			u.request(this, this.tag.field.file_update_metadata_action, {
				"method":"post", 
				"data":form_data
			});

		}

	}

	// attached to tag.virtual_input node for file-tags
	field._file_changed = function(event) {
		// u.bug("_file_changed", this);

		// create data form object to upload file
		var form_data = new FormData();

		// append relevant data
		form_data.append(this.name+"[0]", this.files[0], this.value);
		form_data.append("csrf-token", this.field._form.inputs["csrf-token"].val());
		form_data.append("item_id", this.field._item_id);
		form_data.append("type", this.tag.type);

		// Tell backend about field relation, to be able to add input name to media variant
		form_data.append("input_name", this.name);
		// form_data.append("field_name", this.field.input.name);

		form_data.append("new_variant", "HTMLEDITOR-"+this.field.input.name+"-"+this.tag.type+"-"+u.randomString(8));

		// response handler
		this.response = function(response) {

			page.notify(response);

			if(response.cms_status && response.cms_status == "success" && response.cms_object.length === 1) {

				// If upload was successful and file existed before uploading new file,
				// then delete the existing file (if any)
				this.field.deleteFile(this.tag);


				// Update tag with new values
				this.tag.virtual_input.val({
					"url": "/download/"+response.cms_object[0].item_id+"/"+response.cms_object[0].variant+"/"+response.cms_object[0].name,
					"file_name": response.cms_object[0].name,
					"file_description": response.cms_object[0].description,
					"filesize": response.cms_object[0].filesize,
					"created_at": response.cms_object[0].created_at,

					"variant": response.cms_object[0].variant,
					"format": response.cms_object[0].format,
				});


				// update viewer
				this.tag.field.update();

				// save after upload is complete
				this.tag.field._form.submit();

				// Return focus
				this.tag.file_input.focus();

			}

		}
		u.request(this, this.field.file_add_action, {
			"method":"post", 
			"data":form_data
		});

	}



	// CODE TAG

	// add new code node
	field.addCodeTag = function(type, node) {

		var tag = this.createTag(this.code_allowed, type);
		tag.type = "code";

		// text input
		tag.virtual_input = u.ae(tag, "div", {"class":"text", "contentEditable":true});
		tag.virtual_input.tag = tag;
		tag.virtual_input.field = this;
		tag.virtual_input._form = this._form;

		// declare get/set value funtion
		tag.virtual_input.val = function(value) {
			if(value !== undefined) {
				this.innerHTML = value;
			}
			return this.innerHTML.replace(/<br>/, "");
			// return this.innerHTML;
		}


		// Do we have a content node
		if(node) {

			// set classname if present
			if(node.className !== type) {
				var classname = node.className.replace(type, "").trim();
				tag.updateClassName(classname);
			}

			// Extract value
			value = node.innerHTML;

			// set value if any is sent
			if(value) {
				tag.virtual_input.val(value);

				this.activateInlineFormatting(tag.virtual_input, tag);
			}

		}


		// monitor changes and selections
		// kills ENTER event
		u.e.addEvent(tag.virtual_input, "keydown", this._changing_code);

		// content has been modified or selected (can happen with mouse or keys)
		u.e.addEvent(tag.virtual_input, "keyup", this._code_changed);
		u.e.addStartEvent(tag.virtual_input, this._code_selection_started);

		// add focus and blur handlers
		u.e.addEvent(tag.virtual_input, "focus", this._focused_content);
		u.e.addEvent(tag.virtual_input, "blur", this._blurred_content);

		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(tag.virtual_input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(tag.virtual_input, "mouseleave", u.f._mouseleave);
		}

		// Also update inlineformatting options state on blur
		u.e.addEvent(tag.virtual_input, "blur", this._code_changed);

		// add paste event handler
		u.e.addEvent(tag.virtual_input, "paste", this._pasted_content);


		// callback for "add new", Shift ENTER event
		// creates a new P rather that a code tag
		tag.addNew = function() {

			var new_tag = this.field.addTextTag(this.field.text_allowed[0]);
			u.insertAfter(new_tag, this);
			new_tag.virtual_input.focus();

		}


		// Update HTML
		this.update();


		// enable dragging of html-tags
		this.editor.updateTargets();
		this.editor.updateDraggables();

		return tag;
	}

	// mousedown/touchstart event occured - wait for the counterpart (mouseup/touchend)
	// this is done to prevent having window events listening all the time
	field._code_selection_started = function(event) {
		this._selection_event_id = u.e.addWindowEndEvent(this, this.field._code_changed);
	}

	// attached to div.virtual_input node onkey down
	// overriding default [ENTER] and [TAB] action 
	field._changing_code = function(event) {
		// u.bug("_changing_code:", this, "val:" + this.val() + ", key:" + event.keyCode);
	
		// [ENTER] is valid as code content, handle manually
		if(event.keyCode == 13) {
			u.e.kill(event);
		}

		// Keep track of tab origin
		this.tab_started_in_tag = false;

		// register backwards tabbing for setting cursor position in end of text
		if(event.keyCode == 9 && event.shiftKey) {
			this.field.backwards_tab = true;
		}
		// TAB is valid as code content
		else if(event.keyCode == 9) {
			u.e.kill(event);
			this.tab_started_in_tag = true;
		}

	}

	// attached to tag.virtual_input node for text-tags and list-tags
	field._code_changed = function(event) {
		// u.bug("_code_updated:", this, "val:" + this.val() + ", key: " + event.keyCode);

		// do we have a valid window event listener
		if(this._selection_event_id) {
			u.e.removeWindowEndEvent(this._selection_event_id);
			delete this._selection_event_id;
		}


		// get selection, to use for deletion
		var selection = window.getSelection(); 

		// [ENTER]
		if(event.keyCode == 13) {
			u.e.kill(event);

			// Clean [ENTER] - add new field
			if(event.shiftKey) {

				this.tag.addNew();

			}
			else if(selection && selection.isCollapsed) {

				var newline = document.createTextNode("\n");
				range = selection.getRangeAt(0);
				range.insertNode(newline);

				selection.addRange(range);
				selection.collapseToEnd();


				// Check if all is good break wise
				// Clean up excessive empty textnodes in end of element
				if(selection.anchorNode === this) {

					while(this.lastChild.nodeType === 3 && !this.lastChild.textContent && this.lastChild.previousSibling && this.lastChild.previousSibling.nodeType === 3 && !this.lastChild.previousSibling.textContent) {
						this.removeChild(this.lastChild);
					}

				}

				// Add extra break to expand editable div area
				// If cursor is at end and last child is not already BR
				if(selection.anchorNode === this && selection.anchorOffset === this.childNodes.length-1 && this.lastChild.nodeName !== "BR") {
					br = document.createElement("br");
					this.appendChild(br);
				}

			}
		}

		// [TAB]
		else if(event.keyCode == 9) {

			// Only process tab if keydown occured in tag (not when tabbing to tag from other tag)
			if(this.tab_started_in_tag) {

				u.e.kill(event);

				if(selection && selection.isCollapsed) {
					var tab = document.createTextNode("\t");
					range = selection.getRangeAt(0);
					range.insertNode(tab);

					selection.addRange(range);
					selection.collapseToEnd();
				}

			}

		}

		// [DELETE]
		// Separate if/else to ensure removal of deletable state
		if(event.keyCode == 8) {

			// node in deletable state?
			if(this.is_deletable) {
				// u.bug("go ahead delete me")

				u.e.kill(event);
				this.field.deleteTag(this.tag);

			}

			// no value, enter deletable state
			else if(!this.val() || !this.val().replace(/<br>/, "")) {
				this.is_deletable = true;
			}

			// make sure to delete empty formatting nodes
			else if(selection.anchorNode != this && (selection.anchorNode.nodeType === 1 && selection.anchorNode.innerHTML == "")) {
				selection.anchorNode.parentNode.removeChild(selection.anchorNode);
			}

		}
		// any other key, remove deletable state 
		else {
			this.is_deletable = false;
		}


		// new selection
		if(selection && !selection.isCollapsed && u.containsOrIs(this, selection.anchorNode)) {
			this.field.showSelectionOptions(this.tag);
		}
		// hide existing options
		// hideSelectionOptions will evaluate edgecase reasons to keep options available
		else {
			this.field.hideSelectionOptions(this.tag);
		}


		// global update
		this.field.update();

	}



	// BUTTON TAG

	// add new list node
	field.addButtonTag = function(type, node) {

		var tag = this.createTag(this.button_allowed, type);
		tag.type = "button";


		tag.default_label = "Click to add button properties";


		tag.field = this;


		// text input
		tag.virtual_input = u.ae(tag, "div", {"class":"text", "tabindex": 0});
		tag.virtual_input.span_value = u.ae(tag.virtual_input, "span", {"class":"value", "html": tag.default_label});

		tag.virtual_input.tag = tag;
		tag.virtual_input.field = this;
		tag.virtual_input._form = this._form;



		tag.virtual_input.input_list = [
			"text", 
			"link", 
		];

		// define values object for storing meta data
		tag.virtual_input.values = {};


		// Enable meta data editing via overlay
		tag.editMetadata = this.buttonMetadata.bind(this);
		this.addEditMetadataButton(tag);


		// Update virtual input on data update
		tag.virtual_input.updateView = function() {

			// Show text
			if(this.values.text) {
				this.span_value.innerHTML = this.values.text;
			}
			else {
				this.span_value.innerHTML = this.tag.default_label;
			}

			if(this.values.link) {
				this.span_value.title = this.values.link;
			}
			else {
				this.span_value.title = "";
			}

			if(this.values.text && this.values.link) {
				u.ac(this.tag, "done");
			}
			else {
				u.rc(this.tag, "done");
			}
		}

		// Complex data value getter/setter
		tag.virtual_input.val = function(value_object) {
			// u.bug("value_object", value_object);

			// Complex value passed as object
			if(value_object !== undefined && obj(value_object)) {

				// Value object can contain a single or multiple values
				for(input in value_object) {
					if(this.input_list.includes(input)) {
						this.values[input] = value_object[input];
					}
				}

				this.updateView();
			}

			return {
				"text": this.values.text ? this.values.text : "",
				"link": this.values.link ? this.values.link : "", 
				"target": this.values.target ? this.values.target : "", 
			};
		}


		// Do we have a content node
		if(node) {

			// set classname if present
			if(node.className !== type) {
				var classname = node.className.replace(type, "").trim();
				tag.updateClassName(classname);
			}

			// Extract data
			var a = u.qs("a", node);
			if(a) {

				var link = a.getAttribute("href");
				var target = a.target;
				var text = a.innerHTML;
				// u.bug("link", a, a.href, link, )

				tag.virtual_input.val({
					"text": text,
					"target": target,
					"link": link,
				});

			}

		}


		// monitor keyboard interaction
		// Observe ENTER and backwards tabbing to set cursor correctly
		u.e.addEvent(tag.virtual_input, "keydown", this._changing_content);

		// Observe ENTER, SPACE and DELETE
		u.e.addEvent(tag.virtual_input, "keyup", this._button_changed);


		// add focus and blur handlers
		u.e.addEvent(tag.virtual_input, "focus", tag.field._focused_content);
		u.e.addEvent(tag.virtual_input, "blur", tag.field._blurred_content);


		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(tag.virtual_input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(tag.virtual_input, "mouseleave", u.f._mouseleave);
		}


		this.update();


		// enable dragging of html-tags
		this.editor.updateTargets();
		this.editor.updateDraggables();

		return tag;
	}

	// Overlay for external video meta data
	field.buttonMetadata = function(tag) {

		tag.overlay = this.tagMetadataOverlay(tag, "Button", {
			"height": 410,
		});

		// Get existing values
		var values = tag.virtual_input.val();
		// u.bug("externalVideoMetadata", tag, values);

		var form = u.f.addForm(tag.overlay.div_content);
		form.tag = tag;



		var fieldset = u.f.addFieldset(form);

		// Create inputs

		u.f.addField(fieldset, {
			"name": "text",
			"type": "string",
			"label": "Button text",
			"required": true,
			"value": values.text,
			"hint_message": "Enter the text of the button",
		});

		u.f.addField(fieldset, {
			"name": "link",
			"type": "string",
			"required": true,
			"pattern": "^((http[s]?:\/\/|mailto:|tel:)[^$]+|(\/|#)[^$]*)",
			"label": "Button link",
			"value": values.link,
			"hint_message": "Enter the link of the button",
			"error_message": "A button link must start with https://, http://, mailto:, tel:, / or # and be a valid link",
		});

		u.f.addField(fieldset, {
			"name": "target",
			"type": "checkbox",
			"label": "Open in new window?",
			"value": values.target,
			"hint_message": "Should this link open a new window/tab?",
		});

		u.f.addAction(form, {
			"name": "update",
			"value": "Update",
			"class": "button primary",
		});
		
		u.f.init(form);
		
		u.k.addKey(form, "s", {
			"callback":"submit",
			"focused":true
		});

		form.inputs["text"].focus();

		form.submitted = function(iN) {

			var submitted_values = this.getData({"format":"object"});
			var existing_values = this.tag.virtual_input.val();

			u.ac(this, "submitting");

			u.bug("submitted", submitted_values, existing_values);


			// Update tag values
			// Will update poster values (if any) after upload
			this.tag.virtual_input.val(submitted_values);


			// update viewer
			this.tag.field.update();

			// save after upload is complete
			this.tag.field._form.submit();

			// Close overlay
			this.tag.overlay.close();

		}

	}

	// attached to tag.virtual_input node for overlay editable tags
	field._button_changed = function(event) {
		// u.bug("_button_changed:", this, "val:" + this.val(), event, event.shiftKey, event.ctrlKey, event.metaKey);


		// [ENTER] or [SPACE]
		if(event.keyCode == 13 || event.keyCode == 32) {
			u.e.kill(event);

			// Open overlay
			this.clicked();

		}

		// [DELETE] - 2 x DELETE deletes tag
		else if(event.keyCode == 8) {

			// node in deletable state?
			if(this.is_deletable) {
				// u.bug("go ahead delete me");

				u.e.kill(event);

				this.field.deleteTag(this.tag);

			}

			// no value, enter deletable state
			else {
				this.is_deletable = true;
			}

		}

		// any other key, remove deletable state 
		else {
			this.is_deletable = false;
		}


		// global update
		this.field.update();

	}



	// LIST TAG

	// add new list node
	field.addListTag = function(type, node) {

		var tag = this.createTag(this.list_allowed, type);
		tag.type = "li";

		tag.field = this;


		// Inject li symbol
		u.ae(tag, "div", {"class":"li", "html": "li"});


		// text input
		tag.virtual_input = u.ae(tag, "div", {"class":"text", "contentEditable":true});
		tag.virtual_input.tag = tag;
		tag.virtual_input.field = this;
		tag.virtual_input._form = this._form;


		// declare get/set value funtion
		tag.virtual_input.val = function(value) {
			if(value !== undefined) {
				this.innerHTML = value;
			}
			return this.innerHTML;
		}


		if(node) {

			// set classname if present
			if(node.className !== type) {
				var classname = node.className.replace(type, "").trim();
				tag.updateClassName(classname);
			}

			value = node.innerHTML.trim().replace(/(<br>|<br \/>)$/, "").replace(/\n\r|\n|\r/g, "<br>");

			// set value if any is sent
			if(value) {
				tag.virtual_input.val(value);

				this.activateInlineFormatting(tag.virtual_input, tag);
			}

		}


		// monitor changes and selections
		// kills ENTER event
		u.e.addEvent(tag.virtual_input, "keydown", this._changing_content);

		// content has been modified or selected (can happen with mouse or keys)
		u.e.addEvent(tag.virtual_input, "keyup", this._changed_content);
		// tagsten for mouse/touch selections - this attaches window end event tagstener
		u.e.addStartEvent(tag.virtual_input, this._selection_started);

		// add focus and blur handlers
		u.e.addEvent(tag.virtual_input, "focus", this._focused_content);
		u.e.addEvent(tag.virtual_input, "blur", this._blurred_content);

		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(tag.virtual_input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(tag.virtual_input, "mouseleave", u.f._mouseleave);
		}

		// add paste event handler
		u.e.addEvent(tag.virtual_input, "paste", this._pasted_content);


		// callback for "add new" ([ENTER] event)
		tag.addNew = function() {

			var new_tag = this.field.addListTag(this.field.text_allowed[0]);
			u.insertAfter(new_tag, this);
			new_tag.virtual_input.focus();

		}


		this.update();


		// enable dragging of html-tags
		this.editor.updateTargets();
		this.editor.updateDraggables();

		return tag;
	}



	// TEXT TAG

	// add new text node
	field.addTextTag = function(type, node) {

		var tag = this.createTag(this.text_allowed, type);
		tag.type = "text";

		tag.field = this;


		// text input
		tag.virtual_input = u.ae(tag, "div", {"class":"text", "contentEditable":true});
		tag.virtual_input.tag = tag;
		tag.virtual_input.field = this;
		tag.virtual_input._form = this._form;

		// declare get/set value funtion
		tag.virtual_input.val = function(value) {
			if(value !== undefined) {
				this.innerHTML = value;
			}
			return this.innerHTML;
		}


		// Do we have a content node
		if(node) {

			// set classname if present
			if(node.className !== type) {
				var classname = node.className.replace(type, "").trim();
				tag.updateClassName(classname);
			}

			// Extract value
			value = node.innerHTML.trim().replace(/(<br>|<br \/>)$/, "").replace(/\n\r|\n|\r/g, "<br>");

			// set value if any is sent
			if(value) {
				tag.virtual_input.val(value);

				this.activateInlineFormatting(tag.virtual_input, tag);
			}

		}


		// monitor changes and selections
		// kills ENTER event for custom br handling
		// Observe backwards tabbing to set cursor correctly
		u.e.addEvent(tag.virtual_input, "keydown", this._changing_content);

		// content has been modified or selected (can happen with mouse or keys)
		u.e.addEvent(tag.virtual_input, "keyup", this._changed_content);

		// listen for mouse/touch selections - this attaches window end event listener
		u.e.addStartEvent(tag.virtual_input, this._selection_started);

		// add focus and blur handlers
		u.e.addEvent(tag.virtual_input, "focus", this._focused_content);
		u.e.addEvent(tag.virtual_input, "blur", this._blurred_content);

		// Also update inlineformatting options state on blur
		u.e.addEvent(tag.virtual_input, "blur", this._changed_content);

		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(tag.virtual_input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(tag.virtual_input, "mouseleave", u.f._mouseleave);
		}

		// add paste event handler
		u.e.addEvent(tag.virtual_input, "paste", this._pasted_content);


		// callback for "add new" ([ENTER] event)
		tag.addNew = function() {

			var new_tag = this.field.addTextTag(this.field.text_allowed[0]);
			u.insertAfter(new_tag, this);
			new_tag.virtual_input.focus();

		}


		// Update HTML
		this.update();


		// enable dragging of html-tags
		this.editor.updateTargets();
		this.editor.updateDraggables();

		return tag;
	}

	// mousedown/touchstart event occured - wait for the counterpart (mouseup/touchend)
	// this is done to prevent having window events listening all the time
	field._selection_started = function(event) {
		// u.bug("field._selection_started", this);
		this._selection_event_id = u.e.addWindowEndEvent(this, this.field._changed_content);
	}

	// attached to div.virtual_input node onkey down
	// overriding default enter action 
	// (browser will insert <br> on [ENTER] - we want to create new paragraph)
	field._changing_content = function(event) {
		// u.bug("_changing_content:", this, "val:" + this.val() + ", key:" + event.keyCode);

		// [ENTER]
		if(event.keyCode == 13) {
			u.e.kill(event);
		}

		// register backwards tabbing for setting cursor position in end of text when prev tag receives focus
		else if(event.keyCode == 9 && event.shiftKey) {
			this.field.backwards_tab = true;
		}

	}

	// attached to tag.virtual_input node for text-tags and list-tags
	field._changed_content = function(event) {
		// u.bug("_changed_content:", this, "val:" + this.val(), event, event.shiftKey, event.ctrlKey, event.metaKey);

		// do we have a valid window event listener
		if(this._selection_event_id) {
			u.e.removeWindowEndEvent(this._selection_event_id);
			delete this._selection_event_id;
		}


		// get selection, to use for deletion
		var selection = window.getSelection();
		// u.bug("selection", selection);

		// [ENTER]
		if(event.keyCode == 13) {
			u.e.kill(event);

			// Clean [ENTER] - add new field
			if(!event.shiftKey) {

				this.tag.addNew();

			}

			// [SHIFT]+[ENTER]
			// Forced linebreak
			// CMD+CTRL keys are mapped to other functions / does not work well for forced linebreaks
			// Lots of weirdness with <br>'s in end of text and browser adding and removing
			// breaks to fill out empty contenteditable divs.
			// Added very custom handling to create uniform effect given different circumstances
			else {

				// Cursor focus point exists
				if(selection && selection.isCollapsed) {

					var range, br;
					range = selection.getRangeAt(0);

					// Standard action
					br = document.createElement("br");
					range.insertNode(br);

					selection.addRange(range);
					selection.collapseToEnd();


					// Check if all is good break wise

					// u.bug("check break situation", selection.anchorNode, selection.anchorOffset, this.childNodes.length, this.lastChild);

					// Add extra break
					// If cursor is at end and last child is not BR
					if(selection.anchorNode === this && selection.anchorOffset === this.childNodes.length-1 && this.lastChild.nodeName !== "BR") {
						br = document.createElement("br");
						this.appendChild(br);
					}
					// If cursor is in pseudo text node after last child and only one BR precedes it
					else if(selection.anchorNode === this && selection.anchorOffset == this.childNodes.length && this.lastChild.nodeName === "BR" && this.lastChild.previousSibling.nodeName !== "BR") {
						br = document.createElement("br");
						this.appendChild(br);
					}

				}
			}
		}

		// [DELETE]
		// Separate if/else to ensure removal of deletable state
		if(event.keyCode == 8) {

			// node in deletable state?
			if(this.is_deletable) {
				// u.bug("go ahead delete me");

				u.e.kill(event);
				this.field.deleteTag(this.tag);

			}

			// no value, enter deletable state
			else if(!this.val() || !this.val().replace(/<br>/, "")) {
				this.is_deletable = true;
			}

			// make sure to delete empty formatting nodes
			else if(selection.anchorNode != this && (selection.anchorNode.nodeType === 1 && selection.anchorNode.innerHTML == "")) {
				selection.anchorNode.parentNode.removeChild(selection.anchorNode);
			}

		}
		// any other key, remove deletable state 
		else {
			this.is_deletable = false;
		}


		// Text has been selected
		if(selection && !selection.isCollapsed && u.containsOrIs(this, selection.anchorNode)) {
			this.field.showSelectionOptions(this.tag);
		}
		// hide existing options
		// hideSelectionOptions will evaluate edgecase reasons to keep options available
		else {
			this.field.hideSelectionOptions(this.tag);
		}


		// global update
		this.field.update();

	}



	// EVENT HANDLERS 


	// gained focus on individual tag.virtual_input
	// TODO: Tabbing detection flawed
	field._focused_content = function(event) {
		// u.bug("_focused_content:", this, "val:" + this.val());

		// add focus state
		this.field.is_focused = true;
		u.ac(this.tag, "focus");
		u.ac(this.field, "focus");

		// make sure field goes all the way in front - hint/error must be seen
		u.as(this.field, "zIndex", this.field._form._focus_z_index);

		// position hint in case there is an error
		u.f.positionHint(this.field);

		// if tabbing to gain focus after backwards_tab, move cursor to end
		if(this.field.backwards_tab) {
			this.field.backwards_tab = false;

			var range = document.createRange();
			range.selectNodeContents(this);
			range.collapse(false);

			var selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		}

	}
	// lost focus on individual tag.virtual_input
	field._blurred_content = function() {
		// u.bug("_blurred_content:", this, "val:" + this.val());

		// remove focus state
		this.field.is_focused = false;
		u.rc(this.tag, "focus");
		u.rc(this.field, "focus");

		// put back in correct place
		u.as(this.field, "zIndex", this.field._base_z_index);

		// position hint in case there is an error
		u.f.positionHint(this.field);

		// hide options (will not be hidden if they are needed)
		// this.field.hideSelectionOptions();
	}



	// PASTE FILTERING

	// clean pasted content
	field._pasted_content = function(event) {
		// u.bug("pasted content", event, this);

		u.e.kill(event);

		var i, node, text, range, new_tag, current_tag, selection, paste_parts, text_parts, text_nodes;

		var paste_content = event.clipboardData.getData("text/plain");
		// u.bug("paste_content", paste_content);

		// only do anything if paste content is not empty
		if(paste_content !== "") {

			// remove current selection if it exists
			// because pasting on top of selection should replace selection
			selection = window.getSelection();
			if(!selection.isCollapsed) {
				selection.deleteFromDocument();
			}

			if(u.hc(this.tag, "ul|ol")) {
				// DO DIFFERENT ON LI INPUT – AND NO NEW TAGS SHOULD BE CREATED
				u.bug("must be handled – paste in list input");
			}


			// Code input paste handling – no new tags should be created
			if(u.hc(this.tag, "code")) {

				paste_parts = [paste_content];

			}
			// Default paste handling
			else {

				// add additional tags for double-newlines
				// split string by double newlines
				paste_parts = paste_content.trim().split(/\n\r\n\r|\n\n|\r\r/g);

			}

			text_tags = [];

			for(i = 0; i < paste_parts.length; i++) {

				text_block = paste_parts[i].trim();
				if(text_block) {
					nodes = [];

					text_parts = text_block.split(/\n\r|\n|\r/g);

					for(j = 0; j < text_parts.length; j++) {
						text = text_parts[j];
						nodes.push(document.createTextNode(text));

						if(j < text_parts.length - 1) {
							nodes.push(document.createElement("br"));
						}
					}

					text_tags.push(nodes);
				}

			}

			// u.bug(text_tags);

			current_tag = this.tag;

			for(i = 0; i < text_tags.length; i++) {
				nodes = text_tags[i];
				for(j = 0; j < nodes.length; j++) {

					node = nodes[j];


					selection = window.getSelection();

					// get current range
					range = selection.getRangeAt(0);
					// insert new node
					range.insertNode(node);

					// add range to to selection
					selection.addRange(range);

					// now collapse selection to end, to have cursor after selection
					selection.collapseToEnd();

				}

				if(i < text_tags.length - 1) {
					new_tag = this.field.addTextTag(this.field.text_allowed[0]);
					u.ia(new_tag, current_tag);

					current_tag = new_tag;

					// Use focus and selection for insertion to have cursor follow along to the end
					current_tag.virtual_input.focus();
				}
			}

		}

	}



	// HELPER FUNCTIONS


	// on delete, find the previous input to send focus to
	field.findPreviousTag = function(tag) {

		var prev = false;

		// list element
		// TODO: To be updated with list update
		if(u.hc(tag, this.list_allowed.join("|"))) {

			// look for previous li
			prev = u.ps(tag, {"exclude":".drag,.remove,.type"});

		}

		// no prev li, find prev tag
		if(!prev) {
			prev = u.ps(tag);

			// TODO: to be updated 
			// prev tag is list
			if(prev && u.hc(prev, this.list_allowed.join("|"))) {

				// get last li of list
				var items = u.qsa("div.li", prev);
				prev = items[items.length-1];
			}
			// prev tag is file
			else if(prev && u.hc(prev, "file")) {

				// file has not been uploaded - ignore field
				if(!prev._variant) {
					prev = this.findPreviousTag(prev);
					// if(prev_iN) {
					// 	prev = prev_iN.tag;
					// }
					// else {
					// 	prev = false;
					// }
				}
			}
		}

		// no previous tags, first tag is best option
		// TODO: use next tag before first tag
		// TODO: update tag
		if(!prev) {
			prev = u.qs("div.tag", this);

			// prev tag is list
			if(u.hc(prev, this.list_allowed.join("|"))) {

				// get first li of list
				prev = u.qs("div.li", prev);
			}
			// prev tag is file
			else if(prev && u.hc(prev, "file")) {

				// file has not been uploaded - ignore field
				if(!prev._variant) {
					prev = this.findPreviousTag(prev);
				}
			}

		}

		// return input or false
		return prev && prev != tag ? prev : false;
	}

	// return focus to correct field input
	field.returnFocus = function(tag) {
		u.bug("returnFocus", tag);

		// text, code, ext_video node
		if(tag.type.match(/^(text|code|ext_video|li|button)$/)) {
			// Blur first to ensure new focus event is triggered
			tag.virtual_input.blur();
			tag.virtual_input.focus();
		}

		// file, media node
		else if(tag.type.match(/^(file|media)$/)) {
			// Blur first to ensure new focus event is triggered
			tag.file_input.blur();
			tag.file_input.focus();
		}

	}



	// SELECTION AND INLINE OPTIONS PANELS

	field.updateInlineFormattingState = function() {
		// u.bug("updateInlineFormattingState", this.selection_options, this.inline_options);

		// All inline formatting removed, exit inlineformatting state to allow other editing options
		if(!Object.keys(this.selection_options).length && !Object.keys(this.inline_options).length) {
			// u.bug("exit inline editing state");
			u.rc(this, "inlineformatting");
			this.inlineformatting = false;
		}
		else {
			// u.bug("enter inline editing state");
			u.ac(this, "inlineformatting");
			this.inlineformatting = true;
		}

	}

	// show options for selection
	field.showSelectionOptions = function(tag) {
		// u.bug("showSelectionOptions", tag);

		// Hide any open options panel
		// this.hideSelectionOptions();
		// hide existing inlineformatting options (only shown on mouseover, 
		// but showing selection options shifts the inlinetag downwards)
		this.hideDeleteOrEditOptions();


		// remove any open inline options panels
		this.hideInlineOptions();


		// create options div, if not already created
		if(!this.selection_options[tag]) {


			this.selection_options[tag] = u.ae(this.editor, "div", {"class":"selection_options"});
			this.editor.insertBefore(this.selection_options[tag], tag);


			// Update field inline formatting state
			this.updateInlineFormattingState();


			var ul = u.ae(this.selection_options[tag], "ul", {"class":"options"});

			// link option
			var link = u.ae(ul, "li", {"class":"link", "html":"Link"});
			link.tag = tag;
			u.ce(link);
			link.inputStarted = function(event) {
				u.e.kill(event);
			}
			link.clicked = function(event) {
				u.e.kill(event);
				this.tag.field.addAnchorTag(this.tag);
			}


			// EM option
			var em = u.ae(ul, "li", {"class":"em", "html":"Italic"});
			em.tag = tag;
			u.ce(em);
			em.inputStarted = function(event) {
				u.e.kill(event);
			}
			em.clicked = function(event) {
				u.e.kill(event);
				this.tag.field.addEmTag(this.tag);
			}
			// Map reference to enable shortcut removal when options are removed
			this.selection_options[tag].em = em;
			u.k.addKey(em, "i");


			// STRONG option
			var strong = u.ae(ul, "li", {"class":"strong", "html":"Bold"});
			strong.tag = tag;
			u.ce(strong);
			strong.inputStarted = function(event) {
				u.e.kill(event);
			}
			strong.clicked = function(event) {
				u.e.kill(event);
				this.tag.field.addStrongTag(this.tag);
			}
			// Map reference to enable shortcut removal when options are removed
			this.selection_options[tag].strong = strong;
			u.k.addKey(strong, "b");


			// SUP option
			var sup = u.ae(ul, "li", {"class":"sup", "html":"Superscript"});
			sup.tag = tag;
			u.ce(sup);
			sup.inputStarted = function(event) {
				u.e.kill(event);
			}
			sup.clicked = function(event) {
				u.e.kill(event);
				this.tag.field.addSupTag(this.tag);
			}


			// SPAN option
			var span = u.ae(ul, "li", {"class":"span", "html":"CSS class"});
			span.tag = tag;
			u.ce(span);
			span.inputStarted = function(event) {
				u.e.kill(event);
			}
			span.clicked = function(event) {
				u.e.kill(event);
				this.tag.field.addSpanTag(this.tag);
			}

		}

	}

	// hide the selection options pane and update content 
	field.hideSelectionOptions = function(tag) {
		// u.bug("hideSelectionOptions", this.selection_options[tag]);

		// only attempt removed if exists
		if(this.selection_options[tag]) {
			this.selection_options[tag].parentNode.removeChild(this.selection_options[tag]);

			// Remove shortcuts for bold and italic
			u.k.removeKey(this.selection_options[tag].strong, "b");
			u.k.removeKey(this.selection_options[tag].em, "i");

			delete this.selection_options[tag];
		}


		// All inline formatting removed, exit inlineformatting state to allow other editing options
		this.updateInlineFormattingState();

		// Update HTML
		this.update();
	}

	// hide the inline options pane (settings for span and link) and update content
	// inline options should not be removed on blur or unselection. 
	// The panel relates to a specific selection and must be interacted with to be closed.
	//
	// However adding a new selection will open the selection options which will effectively 
	// close the inline options to avoid multiple open panels
	field.hideInlineOptions = function(tag = false) {
		// u.bug("hideInlineOptions", this.inline_options);

		// Hide inline options for specific tag
		if(tag) {

			if(this.inline_options[tag]) {
				// u.bug("hide inline options for tag", tag);

				this.inline_options[tag].parentNode.removeChild(this.inline_options[tag]);

				if(this.inline_options[tag].inline_tag.temp_class) {
					this.removeEditingHighlight(this.inline_options[tag].inline_tag);
				}

				delete this.inline_options[tag];
			}

		}
		// Hide all inline options
		else {
			// u.bug("hide all inline options", this.inline_options);

			for(tag in this.inline_options) {
				this.hideInlineOptions(tag);
			}

		}

	}



	// Make sure all inline formatting overlays are removed
	// Except if inline_tag is passed to allow hiding all other edit or delete tags
	field.hideDeleteOrEditOptions = function(except_inline_tag = false) {

		var options = u.qsa(".delete_inline_tag, .edit_inline_tag");
		var i, option;
		for(i = 0; i < options.length; i++) {
			option = options[i];

			if(!except_inline_tag || option.inline_tag !== except_inline_tag) {
				option.inline_tag.out();
			}
		}

	}

	// Add mouseover delete and edit option to inline formatting
	//
	// Inline formatting options are added to body rather than to the inline tag in question 
	// to avoid adding UI HTML to the saved content
	field.deleteOrEditOption = function(inline_tag) {

		inline_tag.over = function(event) {
			// u.e.kill(event);
			// u.bug("inline_tag over");


			// Remove all other edit or delete tags
			this.field.hideDeleteOrEditOptions(this);


			// Maintain this order of buttons for styling to work
			// Buttons must be shown in beginning of tag because with multiline tags end of tag is not clear
			// Add edit option where relevant
			if(!this.is_editing && (this.nodeName.toLowerCase() == "a" || this.nodeName.toLowerCase() == "span")) {

				// Create if not already exists
				if(!this.bn_edit) {

					this.bn_edit = u.ae(document.body, "span", {"class":"edit_inline_tag", "html":"?"});
					this.bn_edit.inline_tag = this;

					this.bn_edit.over = function(event) {
						u.t.resetTimer(this.inline_tag.t_out);
					}
					u.e.addEvent(this.bn_edit, "mouseover", this.bn_edit.over);

					u.ce(this.bn_edit);
					this.bn_edit.clicked = function() {
						u.e.kill(event);

						this.inline_tag.field.hideInlineOptions();


						if(this.inline_tag.nodeName.toLowerCase() == "span") {
							this.inline_tag.field.spanOptions(this.inline_tag);
						}
						else if(this.inline_tag.nodeName.toLowerCase() == "a") {
							this.inline_tag.field.anchorOptions(this.inline_tag);
						}

						// remove delete option
						this.inline_tag.out();

					}

				}

				// Reposition
				u.ass(this.bn_edit, {
					"top": (u.absY(this)-7)+"px",
					"left": (u.absX(this)-23)+"px",
				});

			}


			// Add delete option
			if(!this.bn_delete) {

				this.bn_delete = u.ae(document.body, "span", {"class":"delete_inline_tag", "html":"X"});
				this.bn_delete.inline_tag = this;

				this.bn_delete.over = function(event) {
					u.t.resetTimer(this.inline_tag.t_out);
				}
				u.e.addEvent(this.bn_delete, "mouseover", this.bn_delete.over);

				u.ce(this.bn_delete);
				this.bn_delete.clicked = function() {
					u.e.kill(event);

					this.inline_tag.field.hideInlineOptions();

					var fragment = document.createTextNode(this.inline_tag.innerHTML);
					this.inline_tag.parentNode.replaceChild(fragment, this.inline_tag);

					// remove delete option
					this.inline_tag.out();

					this.inline_tag.field.update();

				}

			}

			// Reposition
			u.ass(this.bn_delete, {
				"top": (u.absY(this)-7)+"px",
				"left": (u.absX(this)-7)+"px",
			});

		}


		// remove delete and edit tags on mouseout
		inline_tag.out = function(event) {
			// u.bug("inline_tag out");

			// Remove edit button
			if(this.bn_edit) {
				document.body.removeChild(this.bn_edit);
				delete this.bn_edit;
			}

			// Remove delete button
			if(this.bn_delete) {
				document.body.removeChild(this.bn_delete);
				delete this.bn_delete;
			}

		}

		// Activate inline tag
		u.e.hover(inline_tag, {"delay":500});
	}


	// activate existing inline formatting
	// Find span, a, em, strong and sup tags and add edit and/or delete option
	field.activateInlineFormatting = function(input, tag) {

		var i, inline_tag;
		var inline_tags = u.qsa("a,strong,em,span,sup", input);

		for(i = 0; i < inline_tags.length; i++) {
			inline_tag = inline_tags[i];

			inline_tag.field = input.field;
			inline_tag.tag = tag;

			// Remove empty inline_tags – keep HTML clean
			if(!u.text(inline_tag)) {
				inline_tag.parentNode.removeChild(inline_tag);
			}
			// Add editing options
			else {
				this.deleteOrEditOption(inline_tag);
			}
		}
	}





	// INLINE FORMATTING HELPERS FOR TEXT NODES


	// add anchor tag
	field.addAnchorTag = function(tag) {

		var selection = window.getSelection();
		if(u.containsOrIs(tag, selection.anchorNode)) {

			var a = document.createElement("a");
			a.field = this;
			a.tag = tag;

			range = selection.getRangeAt(0);
			try {
				range.surroundContents(a);

				// Put cursor at end of selection (and remove selection)
				selection.collapseToEnd();


				// Add inline formatting options
				this.deleteOrEditOption(a);
				// Remove selection options
				this.hideSelectionOptions(tag);


				this.anchorOptions(a);

				// Update HTML
				this.update();

			}
			catch(exception) {
				selection.removeAllRanges();
				this.hideSelectionOptions(tag);

				u.bug("exception", exception)
				alert("You cannot cross the boundaries of another selection. Yet.");
			}

		}

	}

	// extend options pane with Anchor options
	field.anchorOptions = function(a) {

		// set inline formatting class
		u.ac(this, "inlineformatting");
		this.inlineformatting = false;


		this.inline_options[a.tag] = u.ae(a.tag.field.editor, "div", {"class":"inline_options a"});
		a.tag.field.editor.insertBefore(this.inline_options[a.tag], a.tag);


		// Save reference to active inline tag and set editing state
		this.inline_options[a.tag].inline_tag = a;
		this.addEditingHighlight(a);

		var form = u.f.addForm(this.inline_options[a.tag], {"class":"labelstyle:inject"});
		form.a = a;

		var fieldset = u.f.addFieldset(form);
		var input_url = u.f.addField(fieldset, {
			"label":"url", 
			"name":"url",
			"required": true,
			// "value":a.href.replace(location.protocol + "//" + document.domain, ""),
			"value":a.getAttribute("href"), 
			"pattern":"^((http[s]?:\/\/|mailto:|tel:)[^$]+|(\/|#)[^$]*)",
			"error_message":"Must start with /, http:// or https://, mailto:, tel: or #"
		});


		var input_target = u.f.addField(fieldset, {
			"type":"checkbox", 
			"label":"Open in new window?", 
			"checked":(a.target ? "checked" : false), 
			"name":"target", 
			"error_message":""
		});
		var input_rel = u.f.addField(fieldset, {
			"type":"checkbox",
			"label":"No follow link?", 
			"checked": (a.rel ? "checked" : false),
			"name":"rel", 
			"error_message":""
		});

		var bn_save = u.f.addAction(form, {
			"value":"Save link", 
			"class":"button"
		});
		u.f.init(form);

		form.inputs["url"].focus();


		form.submitted = function() {

			if(this.inputs["url"].val()) {
				this.a.href = this.inputs["url"].val();
			}
			else {
				this.a.removeAttribute("href");
			}

			if(this.inputs["rel"].val()) {
				this.a.setAttribute("rel", this.inputs["rel"].val());
			}
			else {
				this.a.removeAttribute("rel");
			}

			if(this.inputs["target"].val()) {
				this.a.target = "_blank";
			}
			else {
				this.a.removeAttribute("target");
			}

			this.a.tag.field.hideInlineOptions(this.a.tag);

			// Update HTML
			this.a.tag.field.update();

		}

	}


	// add strong tag
	field.addStrongTag = function(tag) {
		// u.bug("addStrongTag", tag);

		var selection = window.getSelection();
		if(u.containsOrIs(tag, selection.anchorNode)) {

			var strong = document.createElement("strong");
			strong.field = this;
			strong.tag = tag;

			var range = selection.getRangeAt(0);
			try {
				range.surroundContents(strong);

				// Put cursor at end of selection (and remove selection)
				selection.collapseToEnd();


				// Add inline formatting options
				this.deleteOrEditOption(strong);
				// Remove selection options
				this.hideSelectionOptions(tag);

				// Update HTML
				this.update();

			}
			catch(exception) {
				selection.removeAllRanges();
				this.hideSelectionOptions(tag);

				// u.bug(exception);
				alert("You cannot cross the boundaries of another selection. Yet.");
			}

		}

	}

	// add em tag
	field.addEmTag = function(tag) {

		var selection = window.getSelection();
		if(u.containsOrIs(tag, selection.anchorNode)) {

			var em = document.createElement("em");
			em.field = this;
			em.tag = tag;

			var range = selection.getRangeAt(0);
			try {
				range.surroundContents(em);

				// Put cursor at end of selection (and remove selection)
				selection.collapseToEnd();


				// Add inline formatting options
				this.deleteOrEditOption(em);
				// Remove selection options
				this.hideSelectionOptions(tag);

				// Update HTML
				this.update();

			}
			catch(exception) {
				selection.removeAllRanges();
				this.hideSelectionOptions(tag);

				// u.bug(exception);
				alert("You cannot cross the boundaries of another selection. Yet.");
			}

		}

	}

	// add sup tag
	field.addSupTag = function(tag) {

		var selection = window.getSelection();
		if(u.containsOrIs(tag, selection.anchorNode)) {

			var sup = document.createElement("sup");
			sup.field = this;
			sup.tag = tag;

			var range = selection.getRangeAt(0);
			try {
				range.surroundContents(sup);

				// Put cursor at end of selection (and remove selection)
				selection.collapseToEnd();


				// Add inline formatting options
				this.deleteOrEditOption(sup);
				// Remove selection options
				this.hideSelectionOptions(tag);

				// Update HTML
				this.update();

			}
			catch(exception) {
				selection.removeAllRanges();
				this.hideSelectionOptions(tag);

				// u.bug(exception);
				alert("You cannot cross the boundaries of another selection. Yet.");
			}

		}

	}



	// add span tag
	field.addSpanTag = function(tag) {
		// u.bug("addSpanTag", tag);

		var selection = window.getSelection();
		if(u.containsOrIs(tag, selection.anchorNode)) {

			var span = document.createElement("span");
			span.field = this;
			span.tag = tag;

			var range = selection.getRangeAt(0);
			try {
				range.surroundContents(span);

				// Put cursor at end of selection (and remove selection)
				selection.collapseToEnd();


				// Add inline formatting options
				this.deleteOrEditOption(span);
				// Remove selection options
				this.hideSelectionOptions(tag);


				// Show span options
				this.spanOptions(span);

				// Update HTML
				this.update();

			}
			catch(exception) {
				selection.removeAllRanges();
				this.hideSelectionOptions(tag);

				// u.bug(exception);
				alert("You cannot cross the boundaries of another selection. Yet.");
			}

		}

	}

	// add span options
	field.spanOptions = function(span) {

		// set inline formatting class
		u.ac(this, "inlineformatting");
		this.inlineformatting = false;


		this.inline_options[span.tag] = u.ae(span.tag.field.editor, "div", {"class":"inline_options span"});
		span.tag.field.editor.insertBefore(this.inline_options[span.tag], span.tag);


		// Save reference to active inline tag and set editing state
		this.inline_options[span.tag].inline_tag = span;
		this.addEditingHighlight(span);


		var form = u.f.addForm(this.inline_options[span.tag], {"class":"labelstyle:inject"});
		form.span = span;

		var fieldset = u.f.addFieldset(form);
		var input_classname = u.f.addField(fieldset, {"label":"CSS class", "name":"classname", "value":span.className.replace(span.temp_class, "").replace(/  /, " ").trim(), "error_message":""});

		var bn_save = u.f.addAction(form, {"value":"Save class", "class":"button"});
		u.f.init(form);

		// input_classname.input.focus();
		form.inputs["classname"].focus();


		form.submitted = function() {

			if(this.inputs["classname"].val()) {
				this.span.className = this.inputs["classname"].val();
			}
			else {
				this.span.removeAttribute("class");
			}

			this.span.tag.field.hideInlineOptions(this.span.tag);

			// Update HTML
			this.span.tag.field.update();

		}
	}

	// Add temporary class to inline tag in order to change background color when editing
	// Adding a specific class will polute HTML (or prevent usage of that specific class)
	field.addEditingHighlight = function(inline_tag) {
		inline_tag.temp_class = u.randomString(4);
		inline_tag.is_editing = true;

		if(!this.style_tag) {
			this.style_tag = document.createElement("style");
			this.style_tag.setAttribute("media", "all")
			this.style_tag.setAttribute("type", "text/css")
			u.ae(document.head, this.style_tag);
		}

		// TODO: suposedly fix for webkit problem - check if real
		// style_tag.appendChild(document.createTextNode(""))

		this.style_tag.sheet.insertRule("."+inline_tag.temp_class+"{}", 0);
		this.style_tag.rule = this.style_tag.sheet.cssRules[0]
		this.style_tag.rule.style.setProperty("background-color", "#5c5c5c" , "important");
		this.style_tag.rule.style.setProperty("color", "#ffffff" , "important");

		u.ac(inline_tag, inline_tag.temp_class);

	}
	field.removeEditingHighlight = function(inline_tag) {
		this.style_tag.sheet.deleteRule(0);

		inline_tag.is_editing = false;
		u.rc(inline_tag, inline_tag.temp_class);
		if(!inline_tag.className) {
			inline_tag.removeAttribute("class");
		}
		delete inline_tag.temp_class;
	}



	// INDEX EXISTING CONTENT 

	// inject value into viewer div, to be able to inspect for DOM content on initialization
	field.viewer.innerHTML = field.input.value;

	// enable dragging of html-tags
	// u.sortable(field.editor, {"draggables":"div.tag,div.li", "targets":"div.editor,div.list", "layout": "vertical"});
	u.sortable(field.editor, {"draggables":"div.tag", "targets":"div.editor"});


	// TODO: Consider 
	// if value of textarea is not HTML formatted
	// change double linebreak to </p><p> (or fitting) once you are sure text is wrapped in node


	var value, node, i, tag, j, p, lis, li;

	// Start initial indexing phase
	field.initial_indexing = true;

	// check for valid nodes, excluding <br>
	var nodes = u.cn(field.viewer, {"exclude":"br"});
	if(nodes.length) {


		// loop through childNodes
		for(i = 0; i < field.viewer.childNodes.length; i++) {
			node = field.viewer.childNodes[i];
			// u.bug("node", node);


			// lost fragment of unspecified text
			// wrap in p tag if content is more than whitespace or newline
			if(node.nodeName == "#text") {

//				u.bug("found fragment node")

				if(node.nodeValue.trim()) {

					// locate double linebreaks and split into several paragraphs 
					var fragments = node.nodeValue.trim().split(/\n\r\n\r|\n\n|\r\r/g);
					if(fragments) {
						for(index in fragments) {
							value = fragments[index].replace(/\n\r|\n|\r/g, "<br>");

							p = document.createElement("p");
							p.innerHTML = value;
							field.addTextTag("p", p);

						}
					}
					// wrap textnode in one paragraph
					else {
						value = node.nodeValue; //.replace(/\n\r|\n|\r/g, "<br>");

						p = document.createElement("p");
						p.innerHTML = value;
						field.addTextTag("p", p);

					}

				}

			}

			// valid text node (h1-h6, p)
			else if(field.text_allowed && node.nodeName.toLowerCase().match(field.text_allowed.join("|"))) {

				field.addTextTag(node.nodeName.toLowerCase(), node);

			}

			// valid text node (code)
			else if(node.nodeName.toLowerCase() == "code") {

				// u.bug("found file node", node);
				field.addCodeTag(node.nodeName.toLowerCase(), node);

			}

			// valid button list (ul, ol)
			else if(field.button_allowed.length && node.nodeName.toLowerCase() === "ul" && node.className === "actions") {

				// u.bug("found list node:", node);
				// handle list nodes
				var lis = u.qsa("li", node);
				for(j = 0; j < lis.length; j++) {
					li = lis[j];
					field.addButtonTag(node.nodeName.toLowerCase(), li);
				}

			}

			// valid list node (ul, ol)
			else if(field.list_allowed.length && node.nodeName.toLowerCase().match(field.list_allowed.join("|"))) {

				// u.bug("found list node:", node);
				// handle list nodes
				var lis = u.qsa("li", node);
				for(j = 0; j < lis.length; j++) {
					li = lis[j];
					field.addListTag(node.nodeName.toLowerCase(), li);
				}

			}

			// divs containing file info (media, vimeo, youtube, file)

			// External video - youtube and vimeo
			// else if(u.hc(node, "youtube|vimeo")) {
			else if(field.ext_video_allowed && u.hc(node, field.ext_video_allowed.join("|"))) {

				// u.bug("found external video node", node);
				field.addExternalVideoTag(node.className.match(field.ext_video_allowed.join("|"))[0], node);

			}

			// FILE
			else if(u.hc(node, "file")) {

				// u.bug("found file node", node);
 				field.addFileTag("file", node);

			}
			// media
			else if(u.hc(node, "media")) {

				// u.bug("found media node", node);
				field.addMediaTag("media", node);

			}



			// Catch unsupported nodes and translate to available node

			// dl, ul or ol (could be unsupported in given implementation)
			else if(node.nodeName.toLowerCase().match(/dl|ul|ol/)) {

				u.bug("found denied list node", node);
				var children = u.cn(node);
				for(j = 0; j < children.length; j++) {
					child = children[j];

					value = child.innerHTML.replace(/\n\r|\n|\r/g, "");

					p = document.createElement("p");
					p.innerHTML = value;
					field.addTextTag("p", p);

					u.bug("convert content to p", p);

				}
			}

			// regular nodes (could be unsupported in given implementation)
			else if(node.nodeName.toLowerCase().match(/h1|h2|h3|h4|h5|code/)) {

				// u.bug("found denied text node", node);
				value = node.innerHTML.replace(/\n\r|\n|\r/g, "");

				p = document.createElement("p");
				p.innerHTML = value;
				field.addTextTag("p", p);

				u.bug("convert content to p", p);

			}
			else {
				alert("HTML contains unautorized node:" + node.nodeName + "\nIt has been altered to conform with SEO and design.");
			}

		}
	}

	// single unformatted textnode
	// wrap in <p> and replace newline with <br>
	else {

		u.bug("single unformatted textnode", field.viewer.innerHTML);

		var p = document.createElement("p");
		p.innerHTML = field.viewer.innerHTML.replace(/\<br[\/]?\>/g, "\n");
		field.addTextTag(field.text_allowed[0], p);

	}


	// TODO: put a note here about why I don't update the textarea right away - because I don't remember
	// I think it was because update would also update viewer, which contained the existing HTML still being parsed
	// This has since been disabled, and updating should not problematic anymore


	field.editor.updateTargets();
	field.editor.updateDraggables();
	field.editor.detectSortableLayout();



	// update viewer after indexing
	// field.updateViewer();
	field.updateContent();

	// add extra editor actions
	field.addViewHTMLButton();
	field.addHelpButton();

}


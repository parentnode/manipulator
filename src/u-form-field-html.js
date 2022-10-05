// HTML custom field
// initializer and validator

// initializer
Util.Form.customInit["html"] = function(field) {
	u.bug("html field", field);
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

	// get/set value function
	field.input.val = u.f._value;

	// create textEditor interface
	u.f.textEditor(field);

}

// validator
Util.Form.customValidate["html"] = function(iN) {

	// min and max length
	min = Number(u.cv(iN.field, "min"));
	max = Number(u.cv(iN.field, "max"));
	min = min ? min : 1;
	max = max ? max : 10000000;
	pattern = iN.getAttribute("pattern");

	if(
		u.text(iN.field._viewer) &&
		u.text(iN.field._viewer).length >= min && 
		u.text(iN.field._viewer).length <= max && 
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
	var input_middle = field._editor.offsetTop + (field._editor.offsetHeight / 2);
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


	// Allowed tags are listed in element classname
	field.allowed_tags = u.cv(field, "tags");
	if(!field.allowed_tags) {
		u.bug("allowed_tags not specified")
		return;
	}
//	u.bug("field.allowed_tags:" + field.allowed_tags);


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



	// extended functionality urls
	field.file_add_action = field.getAttribute("data-file-add");
	field.file_delete_action = field.getAttribute("data-file-delete");
	field.media_add_action = field.getAttribute("data-media-add");
	field.media_delete_action = field.getAttribute("data-media-delete");


	// find item id
	// could be in form action (last fragment of url)
	// TODO: should be extended to look in other places
	field.item_id;
	var item_id_match = field._form.action.match(/\/([0-9]+)(\/|$)/);
	if(item_id_match) {
		field.item_id = item_id_match[1];
	}



	// BUILD EDITOR EXTERNAL INTERFACE

	// Viewer is a div containing the actual HTML output of the editor
	// at this point purely used for inspecting the generated HTML for debugging
	// could be used as a preview pane at a later point
	field._viewer = u.ae(field, "div", {"class":"viewer"});
	field.insertBefore(field._viewer, field.help)
	field._viewer.field = field;

	// The actual HTML editor interface
	field._editor = u.ae(field, "div", {"class":"editor"});
	field.insertBefore(field._editor, field.help)
	field._editor.field = field;


	if(!fun(u.f.fixFieldHTML)) {
		// Unless fixFieldHTML is declared, move indicator to editor view
		u.ae(field._editor, field.indicator);
	}

	// callback after sorting list
	field._editor.dropped = function() {
		this.field.update();
		//u.bug("sorted")
	}

	// Create add options panel
	field.addRawHTMLButton = function() {

		// allow to toggle raw HTML view
		this.bn_show_raw = u.ae(this.input.label, "span", {"html":"(RAW HTML)"});
		this.bn_show_raw.field = this;
		u.ce(this.bn_show_raw);
		this.bn_show_raw.clicked = function() {
			if(u.hc(this.field.input, "show")) {
				u.rc(this.field.input, "show");
			}
			else {
				u.ac(this.field.input, "show");
			}
		}

	}




	// UPDATERS

	// Update viewer and Textarea
	field.update = function() {

		this.updateViewer();
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
	field.updateViewer = function() {
//		u.bug("updateViewer");

		// get all tags
		var tags = u.qsa("div.tag", this);

		var i, tag, j, list, li, lis, div, p, a;

		// reset html viewer
		this._viewer.innerHTML = "";

		// loop through tags
		for(i = 0; i < tags.length; i++) {
			tag = tags[i];

//			console.log(tag)

			// is tag a text
			if(u.hc(tag, this.text_allowed.join("|"))) {

				// add text node
				u.ae(this._viewer, tag._type.val(), {"html":tag._input.val()});
			}

			// is tag list
			else if(u.hc(tag, this.list_allowed.join("|"))) {

				// add list
				list = u.ae(this._viewer, tag._type.val());

				// add list items
				lis = u.qsa("div.li", tag);
				for(j = 0; j < lis.length; j++) {
					li = lis[j];
					li = u.ae(list, tag._type.val(), {"html":li._input.val()});
				}
			}

			// is tag external video
			else if(u.hc(tag, this.ext_video_allowed.join("|")) && tag._video_id) {

				// add div with video id
				div = u.ae(this._viewer, "div", {"class":tag._type.val()+" video_id:"+tag._video_id});
			}

			// is tag code
			else if(u.hc(tag, "code")) {

				div = u.ae(this._viewer, "code", {"html":tag._input.val()});
			}

			// is tag file
			else if(u.hc(tag, "file") && tag._variant) {

				// add div with <p> and <a>
				div = u.ae(this._viewer, "div", {"class":"file item_id:"+tag._item_id+" variant:"+tag._variant+" name:"+encodeURIComponent(tag._name)+" filesize:"+tag._filesize});
				p = u.ae(div, "p");
				a = u.ae(p, "a", {"href":"/download/"+tag._item_id+"/"+tag._variant+"/"+tag._name, "html":tag._input.val()});
			}

			// is tag media
			else if(u.hc(tag, "media") && tag._variant) {

				// add div with <p> and <a>
				div = u.ae(this._viewer, "div", {"class":"media item_id:"+tag._item_id+" variant:"+tag._variant+" name:"+encodeURIComponent(tag._name)+" filesize:"+tag._filesize + " format:"+tag._format});
				p = u.ae(div, "p");
				a = u.ae(p, "a", {"href":"/images/"+tag._item_id+"/"+tag._variant+"/480x."+tag._format, "html":tag._input.val()});
			}

		}
		
	}

	// updates actual Textarea 
	field.updateContent = function() {
		// u.bug("updateContent");

		// get all tags
		var tags = u.qsa("div.tag", this);

		// update actual textarea to be saved
		this.input.val("");

		var i, node, tag, type, value, j, html = "";

		for(i = 0; i < tags.length; i++) {
			tag = tags[i];
//			u.bug(tag);

			// text node
			if(u.hc(tag, this.text_allowed.join("|"))) {

				// get tag type
				type = tag._type.val();
				html += '<'+type + (tag._classname ? (' class="'+tag._classname+'"') : '')+'>'+tag._input.val()+'</'+type+'>'+"\n";
			}

			// list node
			else if(u.hc(tag, this.list_allowed.join("|"))) {

				// get tag type
				type = tag._type.val();
				html += "<"+type+(tag._classname ? (' class="'+tag._classname+'"') : '')+">\n";

				// get list tiems
				lis = u.qsa("div.li", tag);
				for(j = 0; j < lis.length; j++) {
					li = lis[j];

					html += "\t<li>"+li._input.val()+"</li>\n";
				}

				html += "</"+type+">\n";
			}

			// external video node
			else if(u.hc(tag, this.ext_video_allowed.join("|")) && tag._video_id) {

				html += '<div class="'+tag._type.val()+' video_id:'+tag._video_id+'"></div>\n';
			}

			// code node
			else if(u.hc(tag, "code")) {

				html += '<code'+(tag._classname ? (' class="'+tag._classname+'"') : '')+'>'+tag._input.val()+'</code>'+"\n";
			}

			// media node
			else if(u.hc(tag, "media") && tag._variant) {

				html += '<div class="media item_id:'+tag._item_id+' variant:'+tag._variant+' name:'+encodeURIComponent(tag._name)+' filesize:'+tag._filesize+' format:'+tag._format+' width:'+tag._width+' height:'+tag._height+'">'+"\n";
				html += '\t<p><a href="/images/'+tag._item_id+'/'+tag._variant+'/480x.'+tag._format+'">'+tag._input.val()+"</a></p>";
				html += "</div>\n";
			}

			// file node
			else if(u.hc(tag, "file") && tag._variant) {

				html += '<div class="file item_id:'+tag._item_id+' variant:'+tag._variant+' name:'+encodeURIComponent(tag._name)+' filesize:'+tag._filesize+'">'+"\n";
				html += '\t<p><a href="/download/'+tag._item_id+'/'+tag._variant+'/'+tag._name+'">'+tag._input.val()+"</a></p>";
				html += "</div>\n";
			}

		}

		// save HTML in textarea
		this.input.val(html);

	}




	// EDITOR FUNCTIONALity

	// Create empty tag (with drag, type selector and remove-tag elements)
	field.createTag = function(allowed_tags, type, className) {

		// create tag node
		var tag = u.ae(this._editor, "div", {"class":"tag"});
		tag.field = this;


		// add drag handle
		tag._drag = u.ae(tag, "div", {"class":"drag"});
		tag._drag.field = this;
		tag._drag.tag = tag;

		// add type selector
		this.createTagSelector(tag, allowed_tags);

		// select current type
		tag._type.val(type);

		// remember classname if present
		if(className) {
			tag._classname = className;
		}

		// add additional tag option
		this.addTagOptions(tag);

		return tag;
	}

	// delete tag (when clicking on remove button)
	field.deleteTag = function(tag) {

		// make sure it is not last node
		if(u.qsa("div.tag", this).length > 1) {

			// if node is file - delete file from server
			if(u.hc(tag, "file")) {
				this.deleteFile(tag);
			}
			else if(u.hc(tag, "media")) {
				this.deleteMedia(tag);
			}

			// TODO: only remove automatically on non-file inputs
			// on file inputs (media/file), the file deletion may fail and thus the tag should not be removed

			// remove node
			tag.parentNode.removeChild(tag);

			// enable dragging of html-tags
			// u.sortable(this._editor, {"draggables":".tag", "targets":".editor"});
			this._editor.updateTargets();
			this._editor.updateDraggables();


			// global update
			this.update();

			// save - new state (delete is permanent)
			// Don't save, not always meaningful
			// this._form.submit();

		}

	}

	// add classname input to tag (when clicking on classname button)
	field.classnameTag = function(tag) {

		if(!u.hc(tag.bn_classname, "open")) {
			var form = u.f.addForm(tag.bn_classname, {"class":"labelstyle:inject"});
			var fieldset = u.f.addFieldset(form);
			var input_classname = u.f.addField(fieldset, {"label":"classname", "name":"classname", "error_message":"", "value":tag._classname});
			input_classname.tag = tag;
			u.ac(tag.bn_classname, "open");
			u.ac(tag, "classname_open");

			u.f.init(form);
			input_classname.input.focus();

			input_classname.input.blurred = function() {
				this.field.tag._classname = this.val();
				this.field.tag.bn_classname.removeChild(this._form);
				u.rc(this.field.tag.bn_classname, "open");
				u.rc(this.field.tag, "classname_open");

				if(!this.field.tag.mirror) {
					this.field.tag.mirror = u.ae(this.field.tag, "span", {"class":"classname"});
				}

				if(this.field.tag._classname && this.field.tag._classname != "") {
					this.field.tag.mirror.innerHTML = this.field.tag._classname;
				}
				else {
					this.field.tag.mirror.parentNode.removeChild(this.field.tag.mirror);
					delete this.field.tag.mirror;
				}

				// Update HTML
				this.field.tag.field.update();
			}
		}

	}

	// create tag selector helper function
	field.createTagSelector = function(tag, allowed_tags) {
		
		var i, allowed_tag;

		// insert node in tag
		tag._type = u.ae(tag, "ul", {"class":"type"});
		tag._type.field = this;
		tag._type.tag = tag;

		// create selector for text-based tags
		for(i = 0; allowed_tag = allowed_tags[i]; i++) {
			u.ae(tag._type, "li", {"html":allowed_tag, "class":allowed_tag});
		}


		// type get/set function
		tag._type.val = function(value) {

			// set value
			if(value !== undefined) {
				var i, option;

				// try to find option with matching value
				for(i = 0; i < this.childNodes.length; i++) {
					option = this.childNodes[i];

//					u.bug("aoption:" + option)
					if(u.text(option) == value) {

//						u.bug("new option:" + option + ", " + u.text(option))
//						u.bug("this.selected_option:" + this.selected_option)

						// already have selected options
						if(this.selected_option) {
							u.rc(this.selected_option, "selected");

							// update div tag class
							u.rc(this.tag, u.text(this.selected_option));
						}

						// set selected state on new option
//						u.bug("option:" + option)
						u.ac(option, "selected");
						this.selected_option = option;

						// update div tag class
//						u.bug("this.tag:" + this.tag)
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


			u.ce(tag._type);
			// avoid taking focus from current field
			tag._type.inputStarted = function(event) {
				var selection = window.getSelection();
				if(selection && selection.type && u.contains(this.tag, selection.anchorNode)) {
					u.e.kill(event);
				}
			}
			tag._type.clicked = function(event) {
				// u.bug("select clicked", this, this.tag, this.field);

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

			// auto hide type selector
			tag._type.hide = function() {
				u.rc(this, "open");
				if(!this.field.is_focused) {

					u.rc(this.tag, "focus");

					u.ass(this.field, {
						"zIndex": this.field._base_z_index
					});

					// return add focus to input
					this.field.returnFocus(this);
				}

				u.as(this, "top", 0);

				// remove auto hide
				u.e.removeEvent(this, "mouseout", this.autohide);
				u.e.removeEvent(this, "mouseover", this.delayautohide);
				u.t.resetTimer(this.t_autohide);

			}

			// auto hide functions
			tag._type.autohide = function(event) {
				u.t.resetTimer(this.t_autohide);
				this.t_autohide = u.t.setTimer(this, this.hide, 800);
			}
			tag._type.delayautohide = function(event) {
				u.t.resetTimer(this.t_autohide);
			}

		}

	}

	// add css, delete and new tag options to tag
	field.addTagOptions = function(tag) {
		
		// add remove button
		tag.ul_tag_options = u.ae(tag, "ul", {"class":"tag_options"});


		// add option selector
		// don't do this anyway as that would require an extra click to delete, which will be annoying
		// tag.bn_show_option = u.ae(tag.ul_tag_options, "li", {"class":"show"});
		// u.ae(tag.bn_show_option, "span", {"class":"dot1"});
		// u.ae(tag.bn_show_option, "span", {"class":"dot2"});
		// u.ae(tag.bn_show_option, "span", {"class":"dot3"});


		// "Add" button
		tag.bn_add = u.ae(tag.ul_tag_options, "li", {"class":"add", "html":"+"});
		tag.bn_add.field = field;
		tag.bn_add.tag = tag;
		u.ce(tag.bn_add);

		u.ce(tag.ul_tag_options);
		tag.ul_tag_options.inputStarted = function(event) {
			u.e.kill(event);
		}
		tag.bn_add.clicked = function(event) {

			this.cleanupOptions = function(event) {
				if(this.field.ul_new_tag_options) {
					u.bug("remove options");

					this.field.ul_new_tag_options.parentNode.removeChild(this.field.ul_new_tag_options);
					delete this.field.ul_new_tag_options;

					if(this.start_event_id) {
						u.e.removeWindowStartEvent(this.start_event_id);
						delete this.start_event_id;
					}

				}
			}
			// if(u.hc(this.field.options, "show")) {
			// 	u.rc(this.field.options, "show");
			// 	u.rc(this.field, "optionsshown");
			//
			// 	if(this.start_event_id) {
			// 		u.e.removeWindowStartEvent(this, this.start_event_id);
			// 		delete this.start_event_id;
			// 	}
			// }
			// else {
			// 	u.ac(this.field.options, "show");
			// 	u.ac(this.field, "optionsshown");
			//
				this.start_event_id = u.e.addWindowStartEvent(this, this.cleanupOptions);
			// }

			// Add list for actions
			this.field.ul_new_tag_options = u.ae(this.field._editor, "ul", {"class":"new_tag_options"});
			u.ia(this.field.ul_new_tag_options, this.tag);


			// Add text tag option (if allowed)
			if(this.field.text_allowed.length) {

				this.bn_add_text = u.ae(this.field.ul_new_tag_options, "li", {"class":"text", "html":"Text ("+this.field.text_allowed.join(", ")+")"});
				this.bn_add_text.field = this.field;
				this.bn_add_text.tag = this.tag;
				u.ce(this.bn_add_text);
				this.bn_add_text.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_text.clicked = function(event) {
					var tag = this.field.addTextTag(this.field.text_allowed[0]);
					u.ia(tag, this.tag);
					this.tag.bn_add.cleanupOptions();
					tag._input.focus();
				}
			}


			// Add list tag option (if allowed)
			if(this.field.list_allowed.length) {

				this.bn_add_list = u.ae(this.field.ul_new_tag_options, "li", {"class":"list", "html":"List ("+this.field.list_allowed.join(", ")+")"});
				this.bn_add_list.field = this.field;
				this.bn_add_list.tag = this.tag;
				u.ce(this.bn_add_list);
				this.bn_add_list.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_list.clicked = function(event) {
					var tag = this.field.addListTag(this.field.list_allowed[0]);
					u.ia(tag, this.tag);
					this.tag.bn_add.cleanupOptions();
					tag._input.focus();
				}
			}


			// Add code tag option (if allowed)
			if(this.field.code_allowed.length) {

				this.bn_add_code = u.ae(this.field.ul_new_tag_options, "li", {"class":"code", "html":"Code"});
				this.bn_add_code.field = this.field;
				this.bn_add_code.tag = this.tag;
				u.ce(this.bn_add_code);
				this.bn_add_code.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_code.clicked = function(event) {
					var tag = this.field.addCodeTag(this.field.code_allowed[0]);
					u.ia(tag, this.tag);
					this.tag.bn_add.cleanupOptions();
					tag._input.focus();
				}
			}


			// Add media tag option (if allowed)
			if(this.field.media_allowed.length && this.field.item_id && this.field.media_add_action && this.field.media_delete_action && !u.browser("IE", "<=9")) {

				this.bn_add_media = u.ae(this.field.ul_new_tag_options, "li", {"class":"list", "html":"Media ("+this.field.media_allowed.join(", ")+")"});
				this.bn_add_media.field = this.field;
				this.bn_add_media.tag = this.tag;
				u.ce(this.bn_add_media);
				this.bn_add_media.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_media.clicked = function(event) {
					var tag = this.field.addMediaTag();
					u.ia(tag, this.tag);
					this.tag.bn_add.cleanupOptions();
					tag._input.focus();
				}
			}
			else if(this.field.media_allowed.length) {
				u.bug("some information is missing to support media upload:\nitem_id="+this.field.item_id+"\nmedia_add_action="+this.field.media_add_action+"\nmedia_delete_action="+this.field.media_delete_action);
			}


			// Add external video tag option (if allowed)
			if(this.field.ext_video_allowed.length) {

				this.bn_add_ext_video = u.ae(this.field.ul_new_tag_options, "li", {"class":"video", "html":"External video ("+this.field.ext_video_allowed.join(", ")+")"});
				this.bn_add_ext_video.field = this.field;
				this.bn_add_ext_video.tag = this.tag;
				u.ce(this.bn_add_ext_video);
				this.bn_add_ext_video.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_ext_video.clicked = function(event) {
					var tag = this.field.addExternalVideoTag(this.field.ext_video_allowed[0]);
					u.ia(tag, this.tag);
					this.tag.bn_add.cleanupOptions();
					tag._input.focus();
				}
			}


			// Add file tag option (if allowed)
			if(this.field.file_allowed.length && this.field.item_id && this.field.file_add_action && this.field.file_delete_action && !u.browser("IE", "<=9")) {

				this.bn_add_file = u.ae(this.field.ul_new_tag_options, "li", {"class":"file", "html":"Downloadable file"});
				this.bn_add_file.field = this.field;
				this.bn_add_file.tag = this.tag;
				u.ce(this.bn_add_file);
				this.bn_add_file.inputStarted = function(event) {
					u.e.kill(event);
				}
				this.bn_add_file.clicked = function(event) {
					var tag = this.field.addFileTag();
					u.ia(tag, this.tag);
					this.tag.bn_add.cleanupOptions();
					tag._input.focus();
				}
			}

			else if(this.field.file_allowed.length) {
				u.bug("some information is missing to support file upload:\nitem_id="+this.field.item_id+"\nfile_add_action="+this.field.file_add_action+"\nfile_delete_action="+this.field.file_delete_action);
			}


		}



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
		u.ae(tag.bn_classname, "span", {"html":"CSS"});
		tag.bn_classname.field = this;
		tag.bn_classname.tag = tag;
		u.ce(tag.bn_classname);
		tag.bn_classname.clicked = function() {
			this.field.classnameTag(this.tag);
		}

		// Add classname mirror
		if(tag._classname) {
			if(!tag.mirror) {
				tag.mirror = u.ae(tag, "span", {"class":"classname", "html":tag._classname});
			}
		}

	}



	// EXTERNAL VIDEO TAG

	// Add tag
	field.addExternalVideoTag = function(type, node) {
//		u.bug("addExternalVideoTag:" + node + ", type:" + type)
		// create new tag
		var tag = this.createTag(this.ext_video_allowed, type);


		tag._input = u.ae(tag, "div", {"class":"text", "contentEditable":true});
		tag._input.tag = tag;
		tag._input.field = this;


		// if we have video info
		if(node) {

			// get file info from node
			tag._video_id = u.cv(node, "video_id");
			tag._input.innerHTML = tag._video_id;

		}

		tag._input.val = function(value) {
			if(value !== undefined) {
				this.innerHTML = value;
			}
			return this.innerHTML;
		}

		// monitor changes and selections
		// kills ENTER event
		u.e.addEvent(tag._input, "keydown", tag.field._changing_content);

		// content has been modified or selected (can happen with mouse or keys)
		u.e.addEvent(tag._input, "keyup", this._changed_ext_video_content);
		u.e.addEndEvent(tag._input, this._changed_ext_video_content);

		// add focus and blur handlers
		u.e.addEvent(tag._input, "focus", tag.field._focused_content);
		u.e.addEvent(tag._input, "blur", tag.field._blurred_content);

		// enable dragging of html-tags
		// u.sortable(this._editor, {"draggables":".tag", "targets":".editor"});
		this._editor.updateTargets();
		this._editor.updateDraggables();

		return tag;
		
	}

	// attached to tag._input node for media-tags
	field._changed_ext_video_content = function(event) {
		
		// browser injects <br> tag on delete - we remove it again
		if(this.val() && !this.val().replace(/<br>/, "")) {
			this.val("");
		}

		this.tag._video_id = this.val();

		this.tag.field.update();

	}




	// MEDIA TAG

	// Add tag
	field.addMediaTag = function(node) {

		// create new tag
		var tag = this.createTag(["media"], "media");


		tag._input = u.ae(tag, "div", {"class":"text"});
		tag._input.tag = tag;
		tag._input.field = this;
		tag._input._form = this._form;


		// if we have media info
		if(node) {

			// get file info from node
			tag._name = u.cv(node, "name");
			tag._item_id = u.cv(node, "item_id");
			tag._filesize = u.cv(node, "filesize");
			tag._format = u.cv(node, "format");
			tag._variant = u.cv(node, "variant");
			tag._width = u.cv(node, "width");
			tag._height = u.cv(node, "height");

			tag._input.contentEditable = true;
			tag._input.innerHTML = u.qs("a", node).innerHTML;

			tag._image = u.ie(tag, "img");
			tag._image.src = "/images/"+tag._item_id+"/"+tag._variant+"/400x."+tag._format;


			tag._input.val = function(value) {
				if(value !== undefined) {
					this.innerHTML = value;
				}
				return this.innerHTML;
			}

			// monitor changes and selections
			// kills ENTER event
			u.e.addEvent(tag._input, "keydown", tag.field._changing_content);

			// content has been modified or selected (can happen with mouse or keys)
			u.e.addEvent(tag._input, "keyup", this._changed_media_content);
			u.e.addEndEvent(tag._input, this._changed_media_content);

			// add focus and blur handlers
			u.e.addEvent(tag._input, "focus", tag.field._focused_content);
			u.e.addEvent(tag._input, "blur", tag.field._blurred_content);

			u.ac(tag, "done");

		}

		// new file upload tag
		else {

			// move text wrapper for file upload or file info
			tag._text = tag._input;
			tag._text.tag = tag;
			tag._text.field = this;


			// create upload input
			tag._label = u.ae(tag._text, "label", {"html":"Drag media here"});
			tag._input = u.ae(tag._text, "input", {"type":"file", "name":"htmleditor_media[]"});
			tag._input.tag = tag;
			tag._input.field = this;
			tag._input._form = this._form;

			// declare get/set value funtion
			tag._input.val = function(value) {return false;}

			// wait for upload
			u.e.addEvent(tag._input, "change", this._media_updated);

			// add focus and blur handlers
			u.e.addEvent(tag._input, "focus", this._focused_content);
			u.e.addEvent(tag._input, "blur", this._blurred_content);

			// Show hint on mouseover
			if(u.e.event_pref == "mouse") {
				u.e.addEvent(tag._input, "mouseenter", u.f._mouseenter);
				u.e.addEvent(tag._input, "mouseleave", u.f._mouseleave);
			}
		}

		// enable dragging of html-tags
		// u.sortable(this._editor, {"draggables":".tag", "targets":".editor"});
		this._editor.updateTargets();
		this._editor.updateDraggables();

		return tag;
		
	}

	// Delete file on server, when file is deleted from editor
	field.deleteMedia = function(tag) {

		// create form data to submit delete request
		var form_data = new FormData();

		// append relevant data
		form_data.append("csrf-token", this._form.inputs["csrf-token"].val());

		// request response handler
		tag.response = function(response) {

			// notify interface
			page.notify(response);

			// if every thing is good udate and save
			if(response.cms_status && response.cms_status == "success") {

				// all good

				// update viewer
				this.field.update();
			}
		}
		u.request(tag, this.file_delete_action+"/"+tag._item_id+"/"+tag._variant, {"method":"post", "data":form_data});

	}

	// attached to tag._input node for media-tags
	field._media_updated = function(event) {

		// create data form object to upload file
		var form_data = new FormData();

		// append relevant data
		form_data.append(this.name, this.files[0], this.value);
		form_data.append("csrf-token", this._form.inputs["csrf-token"].val());

		// Tell backend about field relation, to be able to add input name to media variant
		form_data.append("input-name", this.tag.field.input.name);

		// response handler
		this.response = function(response) {

			page.notify(response);

			if(response.cms_status && response.cms_status == "success") {

				// remove file input and update information for viewer and content
				this.parentNode.removeChild(this.tag._label);
				this.parentNode.removeChild(this);

				this.tag._input = this.tag._text;

				this.tag._variant = response.cms_object["variant"];
				this.tag._filesize = response.cms_object["filesize"]
				this.tag._format = response.cms_object["format"]
				this.tag._width = response.cms_object["width"]
				this.tag._height = response.cms_object["height"]
				this.tag._name = response.cms_object["name"]
				this.tag._item_id = response.cms_object["item_id"]


				this.tag._input.contentEditable = true;
				this.tag._image = u.ie(this.tag, "img");
				this.tag._image.src = "/images/"+this.tag._item_id+"/"+this.tag._variant+"/400x."+this.tag._format;

				this.tag._input.innerHTML = this.tag._name + " ("+ u.round((this.tag._filesize/1000), 2) +"Kb)";


				this.tag._input.val = function(value) {
					if(value !== undefined) {
						this.innerHTML = value;
					}
					return this.innerHTML;
				}

				// monitor changes and selections
				// kills ENTER event
				u.e.addEvent(this.tag._input, "keydown", this.tag.field._changing_content);

				// content has been modified or selected (can happen with mouse or keys)
				u.e.addEvent(this.tag._input, "keyup", this.tag.field._changed_media_content);
				u.e.addEndEvent(this.tag._input, this.tag.field._changed_media_content);

				// add focus and blur handlers
				u.e.addEvent(this.tag._input, "focus", this.tag.field._focused_content);
				u.e.addEvent(this.tag._input, "blur", this.tag.field._blurred_content);


				u.ac(this.tag, "done");

				// update viewer
				this.tag.field.update();

				// save after upload is complete
				this.tag.field._form.submit();
			}
		}
		u.request(this, this.field.media_add_action+"/"+this.field.item_id, {"method":"post", "data":form_data});

	}

	// simple content change handler (for inputs without selection)
	field._changed_media_content = function(event) {

		// browser injects <br> tag on delete - we remove it again
		if(this.val() && !this.val().replace(/<br>/, "")) {
			this.val("");
		}

		// global update
		this.field.update();

	}




	// FILE TAG

	// File tags
	field.addFileTag = function(node) {

		// create new tag
		var tag = this.createTag(["file"], "file");


		tag._input = u.ae(tag, "div", {"class":"text"});
		tag._input.tag = tag;
		tag._input.field = this;
		tag._input._form = this._form;


		// if we have file info
		if(node) {

			tag._input.contentEditable = true;

			// get file info from node
			tag._variant = u.cv(node, "variant");
			tag._name = u.cv(node, "name");
			tag._item_id = u.cv(node, "item_id");
			tag._filesize = u.cv(node, "filesize");
			tag._input.innerHTML = u.qs("a", node).innerHTML;

			tag._input.val = function(value) {
				if(value !== undefined) {
					this.innerHTML = value;
				}
				return this.innerHTML;
			}

			// monitor changes and selections
			// kills ENTER event
			u.e.addEvent(tag._input, "keydown", tag.field._changing_content);

			// content has been modified or selected (can happen with mouse or keys)
			u.e.addEvent(tag._input, "keyup", this._changed_file_content);
			u.e.addEndEvent(tag._input, this._changed_file_content);

			// add focus and blur handlers
			u.e.addEvent(tag._input, "focus", tag.field._focused_content);
			u.e.addEvent(tag._input, "blur", tag.field._blurred_content);

			u.ac(tag, "done");

		}

		// new file upload tag
		else {

			// move text wrapper for file upload or file info
			tag._text = tag._input;
			tag._text.tag = tag;
			tag._text.field = this;

			// create upload input
			tag._label = u.ae(tag._text, "label", {"html":"Drag file here"});
			tag._input = u.ae(tag._text, "input", {"type":"file", "name":"htmleditor_file[]"});
			tag._input.tag = tag;
			tag._input.field = this;
			tag._input._form = this._form;

			// declare get/set value funtion
			tag._input.val = function(value) {return false;}

			// wait for upload
			u.e.addEvent(tag._input, "change", this._file_updated);

			// add focus and blur handlers
			u.e.addEvent(tag._input, "focus", this._focused_content);
			u.e.addEvent(tag._input, "blur", this._blurred_content);

			// Show hint on mouseover
			if(u.e.event_pref == "mouse") {
				u.e.addEvent(tag._input, "mouseenter", u.f._mouseenter);
				u.e.addEvent(tag._input, "mouseleave", u.f._mouseleave);
			}
		}

		// enable dragging of html-tags
		// u.sortable(this._editor, {"draggables":".tag", "targets":".editor"});
		this._editor.updateTargets();
		this._editor.updateDraggables();

		return tag;
	}

	// Delete file on server, when file is deleted from editor
	field.deleteFile = function(tag) {

		// create form data to submit delete request
		var form_data = new FormData();

		// append relevant data
		form_data.append("csrf-token", this._form.inputs["csrf-token"].val());

		// request response handler
		tag.response = function(response) {

			// notify interface
			page.notify(response);

			// if every thing is good udate and save
			if(response.cms_status && response.cms_status == "success") {

				// all good

				// update viewer
				this.field.update();
			}
		}
		u.request(tag, this.file_delete_action+"/"+tag._item_id+"/"+tag._variant, {"method":"post", "data":form_data});

	}

	// attached to tag._input node for file-tags
	field._file_updated = function(event) {
		// u.bug("file:", this);

		// create data form object to upload file
		var form_data = new FormData();

		// append relevant data
		form_data.append(this.name, this.files[0], this.value);
		form_data.append("csrf-token", this._form.inputs["csrf-token"].val());

		// Tell backend about field relation, to be able to add input name to media variant
		form_data.append("input-name", this.tag.field.input.name);

		// response handler
		this.response = function(response) {

			page.notify(response);

			if(response.cms_status && response.cms_status == "success") {

				// remove file input and update information for viewer and content
				this.parentNode.removeChild(this.tag._label);
				this.parentNode.removeChild(this);


				this.tag._variant = response.cms_object["variant"];
				this.tag._filesize = response.cms_object["filesize"]
				this.tag._name = response.cms_object["name"]
				this.tag._item_id = response.cms_object["item_id"]

				this.tag._text.contentEditable = true;
				this.tag._text.innerHTML = this.tag._name + " ("+ u.round((this.tag._filesize/1000), 2) +"Kb)";

				this.tag._input = this.tag._text;

				this.tag._input.val = function(value) {
					if(value !== undefined) {
						this.innerHTML = value;
					}
					return this.innerHTML;
				}

				// monitor changes and selections
				// kills ENTER event
				u.e.addEvent(this.tag._input, "keydown", this.tag.field._changing_content);

				// content has been modified or selected (can happen with mouse or keys)
				u.e.addEvent(this.tag._input, "keyup", this.tag.field._changed_file_content);
				u.e.addEvent(this.tag._input, "mouseup", this.tag.field._changed_file_content);

				// add focus and blur handlers
				u.e.addEvent(this.tag._input, "focus", this.tag.field._focused_content);
				u.e.addEvent(this.tag._input, "blur", this.tag.field._blurred_content);

				u.ac(this.tag, "done");

				// update viewer
				this.tag.field.update();

				// save after upload is complete
				this.tag.field._form.submit();
			}
		}
		u.request(this, this.field.file_add_action+"/"+this.field.item_id, {"method":"post", "data":form_data});

	}

	// simple content change handler (for inputs without selection)
	field._changed_file_content = function(event) {

		// browser injects <br> tag on delete - we remove it again
		if(this.val() && !this.val().replace(/<br>/, "")) {
			this.val("");
		}

		// global update
		this.field.update();

	}




	// CODE TAG

	// add new code node
	field.addCodeTag = function(type, value, className) {

		var tag = this.createTag(this.code_allowed, type, className);

		// text input
		tag._input = u.ae(tag, "div", {"class":"text", "contentEditable":true});
		tag._input.tag = tag;
		tag._input.field = this;
		tag._input._form = this._form;

		// declare get/set value funtion
		tag._input.val = function(value) {
			if(value !== undefined) {
				this.innerHTML = value;
			}
			return this.innerHTML;
		}
		// set value if any is sent
		tag._input.val(u.stringOr(value));


		// monitor changes and selections
		// kills ENTER event
		u.e.addEvent(tag._input, "keydown", this._changing_code_content);

		// content has been modified or selected (can happen with mouse or keys)
		u.e.addEvent(tag._input, "keyup", this._code_updated);
		u.e.addStartEvent(tag._input, this._code_selection_started);

		// add focus and blur handlers
		u.e.addEvent(tag._input, "focus", this._focused_content);
		u.e.addEvent(tag._input, "blur", this._blurred_content);

		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(tag._input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(tag._input, "mouseleave", u.f._mouseleave);
		}

		// add paste event handler
		u.e.addEvent(tag._input, "paste", this._pasted_content);


		// callback for "add new"
		tag.addNew = function() {
			this.field.addTextItem(this.field.text_allowed[0]);
		}

		// enable dragging of html-tags
		// u.sortable(this._editor, {"draggables":".tag", "targets":".editor"});
		this._editor.updateTargets();
		this._editor.updateDraggables();

		return tag;
	}

	// mousedown/touchstart event occured - wait for the counterpart (mouseup/touchend)
	// this is done to prevent having window events listening all the time
	field._code_selection_started = function(event) {
		this._selection_event_id = u.e.addWindowEndEvent(this, this.field._code_updated);
	}

	field._changing_code_content = function(event) {
		// u.bug("_changing_code_content:", this, "val:" + this.val() + ", key:" + event.keyCode);
	
		// [ENTER]
		if(event.keyCode == 13 || event.keyCode == 9) {
			u.e.kill(event);
		}

		// register backwards tabbing for setting cursor position in end of text
		if(event.keyCode == 9 && event.shiftKey) {
			this.field.backwards_tab = true;
		}

	}

	// attached to tag._input node for text-tags and list-tags
	field._code_updated = function(event) {
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

			if(selection && selection.isCollapsed) {
				var br = document.createTextNode("\n");
				range = selection.getRangeAt(0);
				range.insertNode(br);
				range.collapse(false);

				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}

		// [TAB]
		if(event.keyCode == 9) {

			u.e.kill(event);

			if(selection && selection.isCollapsed) {
				var br = document.createTextNode("\t");
				range = selection.getRangeAt(0);
				range.insertNode(br);
				range.collapse(false);

				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}


		// [DELETE]
		else if(event.keyCode == 8) {

			// node in deletable state?
			if(this.is_deletable) {
//					u.bug("go ahead delete me")

				u.e.kill(event);

				var all_tags = u.qsa("div.tag", this.field);

				// check for previous element before removing anything
				var prev = this.field.findPreviousInput(this);




				// never delete last tag
				if(prev) {
				//if(all_tags.length > 1) {
					this.tag.parentNode.removeChild(this.tag);

					prev.focus();
				}


				// enable dragging of html-tags
				// u.sortable(this.field._editor, {"draggables":".tag", "targets":".editor"});
				this.field._editor.updateTargets();
				this.field._editor.updateDraggables();


			}

			// no value, enter deletable state
			else if(!this.val() || !this.val().replace(/<br>/, "")) {
				this.is_deletable = true;
			}

			// make sure to delete empty formatting nodes
			else if(selection.anchorNode != this && selection.anchorNode.innerHTML == "") {
				selection.anchorNode.parentNode.removeChild(selection.anchorNode);
			}

		}

		// any other key, remove deletable state 
		else {
			this.is_deletable = false;
		}


		// hide existing options
		this.field.hideSelectionOptions();


		// new selection
		if(selection && !selection.isCollapsed) {

			// check if
			var node = selection.anchorNode;

			// test u.nodeWithin for this purpose

			while(node != this) {
				if(node.nodeName == "HTML" || !node.parentNode) {
					break;
				}
				node = node.parentNode;
			}

			// Text has been selected, show selection options
			if(node == this) {
				this.field.showSelectionOptions(this, selection);
			}

		}

		// no selection
		// check if cursor is inside injected node and show options if it is a link
		// TODO: too many side-effects at this point
		// else if(selection && selection.isCollapsed) {
		//
		// 	// check if
		// 	var a = selection.anchorNode.parentNode;
		// 	u.bug("empty selection:" + a);
		// 	if(a.nodeName == "A") {
		// 		a.field.showSelectionOptions(this, selection);
		// 		a.field.anchorOptions(a.field, a);
		// 	}
		// }

		// global update
		this.field.update();
	}





	// LIST TAG


	// add new list node
	field.addListTag = function(type, value, className) {

		var tag = this.createTag(this.list_allowed, type, className);
		// tag.list = u.ae(tag, "div", {"class":"list"});

		this.addListItem(tag, value);


		// enable dragging of html-tags
		// u.sortable(this._editor, {"draggables":".tag", "targets":".editor"});
		this._editor.updateTargets();
		this._editor.updateDraggables();

		return tag;
	}

	// add new li to list node
	field.addListItem = function(tag, value) {

		var li = u.ae(tag, "div", {"class":"li"});
		// var li = u.ae(tag.list, "div", {"class":"li"});
		li.tag = tag;
		li.field = this;
		// li.list = tag.list;

		// add drag handle
		// li._drag = u.ae(tag, "div", {"class":"drag"});
		// li._drag.field = this;
		// li._drag.tag = li;


		// text input
		li._input = u.ae(li, "div", {"class":"text", "contentEditable":true});
		li._input.li = li;
		li._input.tag = tag;
		li._input.field = this;
		li._input._form = this._form;
		tag._input = li._input;

		// declare get/set value funtion
		li._input.val = function(value) {
			if(value !== undefined) {
				this.innerHTML = value;
			}
			return this.innerHTML;
		}
		// set value if any is sent
		li._input.val(u.stringOr(value));


		// monitor changes and selections
		// kills ENTER event
		u.e.addEvent(li._input, "keydown", this._changing_content);

		// content has been modified or selected (can happen with mouse or keys)
		u.e.addEvent(li._input, "keyup", this._changed_content);
		// listen for mouse/touch selections - this attaches window end event listener
		u.e.addStartEvent(li._input, this._selection_started);

		// add focus and blur handlers
		u.e.addEvent(li._input, "focus", this._focused_content);
		u.e.addEvent(li._input, "blur", this._blurred_content);

		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(li._input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(li._input, "mouseleave", u.f._mouseleave);
		}

		// add paste event handler
		u.e.addEvent(li._input, "paste", this._pasted_content);

		// enable dragging of html-tags
		// u.sortable(li, {"draggables":".li", "targets":".editor,div.list"});
		this._editor.updateTargets();
		this._editor.updateDraggables();

		return li;
	}





	// TEXT TAG


	// add new text node
	field.addTextTag = function(type, value, className) {

		var tag = this.createTag(this.text_allowed, type, className);

		// text input
		tag._input = u.ae(tag, "div", {"class":"text", "contentEditable":true});
		tag._input.tag = tag;
		tag._input.field = this;
		tag._input._form = this._form;

		// declare get/set value funtion
		tag._input.val = function(value) {
			if(value !== undefined) {
				this.innerHTML = value;
			}
			return this.innerHTML;
		}
		// set value if any is sent
		tag._input.val(u.stringOr(value));


		// monitor changes and selections
		// kills ENTER event
		u.e.addEvent(tag._input, "keydown", this._changing_content);

		// content has been modified or selected (can happen with mouse or keys)
		u.e.addEvent(tag._input, "keyup", this._changed_content);
		// listen for mouse/touch selections - this attaches window end event listener
		u.e.addStartEvent(tag._input, this._selection_started);

		// add focus and blur handlers
		u.e.addEvent(tag._input, "focus", this._focused_content);
		u.e.addEvent(tag._input, "blur", this._blurred_content);

		// Show hint on mouseover
		if(u.e.event_pref == "mouse") {
			u.e.addEvent(tag._input, "mouseenter", u.f._mouseenter);
			u.e.addEvent(tag._input, "mouseleave", u.f._mouseleave);
		}

		// add paste event handler
		u.e.addEvent(tag._input, "paste", this._pasted_content);


		// callback for "add new"
		tag.addNew = function() {
			this.field.addTextItem(this.field.text_allowed[0]);
		}

		// enable dragging of html-tags
		// u.sortable(this._editor, {"draggables":".tag", "targets":".editor"});
		this._editor.updateTargets();
		this._editor.updateDraggables();

		return tag;
	}



	// attached to div._input node onkey down
	// overriding default enter action 
	// (browser will insert <br> on [ENTER] - we want to create new paragraph)
	field._changing_content = function(event) {
		// u.bug("_changing_content:", this, "val:" + this.val() + ", key:" + event.keyCode);

		// [ENTER]
		if(event.keyCode == 13) {
			u.e.kill(event);
		}

		// register backwards tabbing for setting cursor position in end of text
		if(event.keyCode == 9 && event.shiftKey) {
			this.field.backwards_tab = true;
		}

	}

	// mousedown/touchstart event occured - wait for the counterpart (mouseup/touchend)
	// this is done to prevent having window events listening all the time
	field._selection_started = function(event) {
		this._selection_event_id = u.e.addWindowEndEvent(this, this.field._changed_content);
	}

	// attached to tag._input node for text-tags and list-tags
	field._changed_content = function(event) {
		// u.bug("_changed_content:", this, "val:" + this.val() + ", key: " + event.keyCode, event);

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
			if(!event.ctrlKey && !event.metaKey) {

				// list element - create new li
				if(u.hc(this.tag, this.field.list_allowed.join("|"))) {

					var new_li = this.field.addListItem(this.tag);
					var next_li = u.ns(this.li);
					if(next_li) {
						this.tag.insertBefore(new_li, next_li);
					}
					else {
						this.tag.appendChild(new_li);
					}

					new_li._input.focus();
				}

				// text element, create new text node
				else {

					var new_tag = this.field.addTextTag(this.field.text_allowed[0]);
					var next_tag = u.ns(this.tag);
					if(next_tag) {
						this.tag.parentNode.insertBefore(new_tag, next_tag);
					}
					else {
						this.tag.parentNode.appendChild(new_tag);
					}

					new_tag._input.focus();
				}

			}

			// CTRL or CMD
			// TODO: Looks like CMD key does not work on contentEditable fields
			// TODO: Some weirdness with <br>'s in end of text.
			// check if we should inject <br> tag
			else {

				if(selection && selection.isCollapsed) {
					var br = document.createElement("br");
					range = selection.getRangeAt(0);
					range.insertNode(br);
					range.collapse(false);

					var selection = window.getSelection();
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}
		}

		// [DELETE]
		else if(event.keyCode == 8) {

			// node in deletable state?
			if(this.is_deletable) {
				// u.bug("go ahead delete me");

				u.e.kill(event);

				var all_tags = u.qsa("div.tag", this.field);

				// check for previous element before removing anything
				var prev = this.field.findPreviousInput(this);
				// u.bug("prev input:", prev);

				// list element
				if(u.hc(this.tag, this.field.list_allowed.join("|"))) {


					var all_lis = u.qsa("div.li", this.tag);

					// never delete last tag - only delete li if there are more li's or tags
					if(prev || all_tags.length > 1) {
//					if(all_tags.length > 1 || all_lis.length > 1) {

						// remove li
						this.li._input.blur();
						this.tag.removeChild(this.li);


						// if we just removed last li in list, now remove list
						if(!u.qsa("div.li", this.tag).length) {

							// remove list
							this.tag.parentNode.removeChild(this.tag);
						}
					}
				}

				// text element
				else {

					// never delete last tag
					if(prev || all_tags.length > 1) {
					//if(all_tags.length > 1) {
						this.tag.parentNode.removeChild(this.tag);

					}
				}


				// enable dragging of html-tags
				// u.sortable(this.field._editor, {"draggables":".tag", "targets":".editor"});
				this.field._editor.updateTargets();
				this.field._editor.updateDraggables();

				// set focus on prev element
				if(prev) {
					prev.focus();
				}
				else {
					if(u.hc(this.tag, this.field.list_allowed.join("|"))) {
						var all_lis = u.qsa("div.li", this.tag);
						all_lis[0]._input.focus();
					}
					else {
						var all_tags = u.qsa("div.tag", this.field);
						all_tags[0]._input.focus();
					}
				}

			}

			// no value, enter deletable state
			else if(!this.val() || !this.val().replace(/<br>/, "")) {
				this.is_deletable = true;
			}

			// make sure to delete empty formatting nodes
			else if(selection.anchorNode != this && selection.anchorNode.innerHTML == "") {
				selection.anchorNode.parentNode.removeChild(selection.anchorNode);
			}

		}

		// any other key, remove deletable state 
		else {
			this.is_deletable = false;
		}


		// hide existing options
		this.field.hideSelectionOptions();

		
		// new selection
		if(selection && !selection.isCollapsed) {

			// check if
			var node = selection.anchorNode;
		
			// test u.nodeWithin for this purpose

			while(node != this) {
				if(node.nodeName == "HTML" || !node.parentNode) {
					break;
				}
				node = node.parentNode;

				// u.bug("node:", node);
			
			}

			// Text has been selected, show selection options
			if(node == this) {
				this.field.showSelectionOptions(this, selection);
			}

		}
		else {
			this.field.hideSelectionOptions();
		
		}



		// no selection
		// check if cursor is inside injected node and show options if it is a link
		// TODO: too many side-effects at this point
		// else if(selection && selection.isCollapsed) {
		//
		// 	// check if
		// 	var a = selection.anchorNode.parentNode;
		// 	u.bug("empty selection:" + a);
		// 	if(a.nodeName == "A") {
		// 		a.field.showSelectionOptions(this, selection);
		// 		a.field.anchorOptions(a.field, a);
		// 	}
		// }

		// global update
		this.field.update();
	}





	// EVENT HANDLERS 


	// gained focus on individual tag._input
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
	// lost focus on individual tag._input
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

	// clean pasted content - first version
	field._pasted_content = function(event) {
		// u.bug("pasted content", event);

		u.e.kill(event);

		var i, node;

		var paste_content = event.clipboardData.getData("text/plain");
		// u.bug("paste_content", paste_content);

		// u.bug("paste_content:", paste_content, "yes");
		// only do anything if paste content is not empty
		if(paste_content !== "") {

			// remove current selection if it exists
			// because pasting on top of selection should replace selection
			var selection = window.getSelection();
			if(!selection.isCollapsed) {
				selection.deleteFromDocument();
			}


			// u.bug("pasted:", paste_content, "#:", paste_content.trim(), "#");

			// add break tags for newlines
			// split string by newlines
			var paste_parts = paste_content.trim().split(/\n\r|\n|\r/g);
			// if(paste_parts.length > 1) {
			//
			// 	console.log("formatting");
			//
			// }
			// else {
			//
			// 	console.log("no formatting");

				var text_nodes = [];
				for(i = 0; i < paste_parts.length; i++) {
					text = paste_parts[i];
					u.bug("text part", text);
					text_nodes.push(document.createTextNode(text));

					// only insert br-tag if there is more than one paste-part and not after the last one
					if(paste_parts.length && i < paste_parts.length-1) {
						text_nodes.push(document.createElement("br"));
					}
				}

				// loop through nodes in opposite order
				// webkit collapses space after selection if I don't 
				for(i = text_nodes.length-1; i >= 0; i--) {
					node = text_nodes[i];

					// get current range
					var range = selection.getRangeAt(0);
					// insert new node
					range.insertNode(node);

					// add range to to selection
					selection.addRange(range);

				}

				// now collapse selection to end, to have cursor after selection
				selection.collapseToEnd();

			// }
//			alert(paste_parts.join(","))

		}
	}




	// HELPER FUNCTIONS


	// on delete, find the previous input to send focus to
	field.findPreviousInput = function(iN) {

		var prev = false;

		// list element
		if(u.hc(iN.tag, this.list_allowed.join("|"))) {

			// look for previous li
			prev = u.ps(iN.li, {"exclude":".drag,.remove,.type"});
		}

		// no prev li, find prev tag
		if(!prev) {
			prev = u.ps(iN.tag);

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
					var prev_iN = this.findPreviousInput(prev._input);
					if(prev_iN) {
						prev = prev_iN.tag;
					}
					else {
						prev = false;
					}
				}
			}
		}

		// no previous tags, first tag is best option
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
					var prev_iN = this.findPreviousInput(prev._input);
					if(prev_iN) {
						prev = prev_iN.tag;
					}
					else {
						prev = false;
					}
				}
			}

		}

		// return input or false
		return prev && prev._input != iN ? prev._input : false;
	}

	// return focus to correct field input
	field.returnFocus = function(tag) {

		// text node
		if(u.hc(tag, this.text_allowed.join("|"))) {
			tag._input.focus();
		}

		// code node
		else if(u.hc(tag, "code")) {
			tag._input.focus();
		}

		// list node
		else if(u.hc(tag, this.list_allowed.join("|"))) {

			// get first li of list
			var li = u.qs("div.li", tag);
			li._input.focus();
		}

	}



	// SELECTION OPTIONS PANE

	// hide the options pane and update content 
	field.hideSelectionOptions = function() {

		// only hide if not in interaction mode
		if(this.selection_options && !this.selection_options.is_active) {
			this.selection_options.parentNode.removeChild(this.selection_options);
			this.selection_options = null;
		}

		this.update();
	}

	// show options for selection
	field.showSelectionOptions = function(node, selection) {
		// u.bug("showSelectionOptions", node, node.field);

		// Hide any open options panel
		this.hideSelectionOptions();
		this.hideDeleteOrEditOptions();

		// position of node
		// var x = u.absX(node);
		// var y = u.absY(node);

		// create options div
		// this.selection_options = u.ae(document.body, "div", {"id":"selection_options"});
		this.selection_options = u.ae(node.field._editor, "div", {"class":"selection_options"});
		node.field._editor.insertBefore(this.selection_options, node.tag);

		// position options pane according to field
		// u.as(this.selection_options, "top", y+"px");
		// u.as(this.selection_options, "left", (x + node.offsetWidth) +"px");

		var ul = u.ae(this.selection_options, "ul", {"class":"options"});

		// link option
		this.selection_options._link = u.ae(ul, "li", {"class":"link", "html":"Link"});
		this.selection_options._link.field = this;
		this.selection_options._link.tag = node.tag;
		this.selection_options._link.selection = selection;
		u.ce(this.selection_options._link);
		this.selection_options._link.inputStarted = function(event) {
			u.e.kill(event);
			// this.field.selection_options.is_active = true;
		}
		this.selection_options._link.clicked = function(event) {
			u.e.kill(event);
			this.field.addAnchorTag(this.selection, this.tag);
			// this.field.editAnchorTag(this.selection, this.tag);
		}

		// EM option
		this.selection_options._em = u.ae(ul, "li", {"class":"em", "html":"Italic"});
		this.selection_options._em.field = this;
		this.selection_options._em.tag = node.tag;
		this.selection_options._em.selection = selection;
		u.ce(this.selection_options._em);
		this.selection_options._em.inputStarted = function(event) {
			u.e.kill(event);
		}
		this.selection_options._em.clicked = function(event) {
			u.e.kill(event);
			this.field.addEmTag(this.selection, this.tag);
		}

		// STRONG option
		this.selection_options._strong = u.ae(ul, "li", {"class":"strong", "html":"Bold"});
		this.selection_options._strong.field = this;
		this.selection_options._strong.tag = node.tag;
		this.selection_options._strong.selection = selection;
		u.ce(this.selection_options._strong);
		this.selection_options._strong.inputStarted = function(event) {
			u.e.kill(event);
		}
		this.selection_options._strong.clicked = function(event) {
			u.e.kill(event);
			this.field.addStrongTag(this.selection, this.tag);
		}

		// SUP option
		this.selection_options._sup = u.ae(ul, "li", {"class":"sup", "html":"Superscript"});
		this.selection_options._sup.field = this;
		this.selection_options._sup.tag = node.tag;
		this.selection_options._sup.selection = selection;
		u.ce(this.selection_options._sup);
		this.selection_options._sup.inputStarted = function(event) {
			u.e.kill(event);
		}
		this.selection_options._sup.clicked = function(event) {
			u.e.kill(event);
			this.field.addSupTag(this.selection, this.tag);
		}

		// SPAN option
		this.selection_options._span = u.ae(ul, "li", {"class":"span", "html":"CSS class"});
		this.selection_options._span.field = this;
		this.selection_options._span.tag = node.tag;
		this.selection_options._span.selection = selection;
		u.ce(this.selection_options._span);
		this.selection_options._span.inputStarted = function(event) {
			u.e.kill(event);
			// this.field.selection_options.is_active = true;
		}
		this.selection_options._span.clicked = function(event) {
			u.e.kill(event);
			this.field.addSpanTag(this.selection, this.tag);
		}

	}

	field.hideDeleteOrEditOptions = function(node) {
		
		var options = u.qsa(".delete_selection, .edit_selection");
		var i, option;
		for(i = 0; i < options.length; i++) {
			option = options[i];
			
			if(!node || option.node !== node) {
				option.node.out();
			}
		}
	}

	// add mouseover delete option to injected tags
	field.deleteOrEditOption = function(node) {

		node.over = function(event) {

			// Remove over
			this.field.hideDeleteOrEditOptions(this);

			if(!this.bn_delete) {

				this.bn_delete = u.ae(document.body, "span", {"class":"delete_selection", "html":"X"});
				this.bn_delete.node = this;

				this.bn_delete.over = function(event) {
					u.t.resetTimer(this.node.t_out);
				}
				u.e.addEvent(this.bn_delete, "mouseover", this.bn_delete.over);

				u.ce(this.bn_delete);
				this.bn_delete.clicked = function() {
					u.e.kill(event);

					if(this.node.field.selection_options) {
						this.node.field.selection_options.is_active = false;
						this.node.field.hideSelectionOptions();
					}

					var fragment = document.createTextNode(this.node.innerHTML);
					this.node.parentNode.replaceChild(fragment, this.node);

					// remove delete option
					this.node.out();

					this.node.field.update();

				}

				u.as(this.bn_delete, "top", (u.absY(this)-5)+"px");
//				u.as(this.bn_delete, "left", (u.absX(this)+this.offsetWidth-5)+"px");
				u.as(this.bn_delete, "left", (u.absX(this)-5)+"px");
			}

			if(this.nodeName.toLowerCase() == "a" || this.nodeName.toLowerCase() == "span" && !this.bn_edit) {

				this.bn_edit = u.ae(document.body, "span", {"class":"edit_selection", "html":"?"});
				this.bn_edit.node = this;

				this.bn_edit.over = function(event) {
					u.t.resetTimer(this.node.t_out);
				}
				u.e.addEvent(this.bn_edit, "mouseover", this.bn_edit.over);

				u.ce(this.bn_edit);
				this.bn_edit.clicked = function() {
					u.e.kill(event);

					if(this.node.nodeName.toLowerCase() == "span") {
						this.node.field.editSpanTag(this.node);
					}
					else if(this.node.nodeName.toLowerCase() == "a") {
						this.node.field.editAnchorTag(this.node);
					}

				}

				u.as(this.bn_edit, "top", (u.absY(this)-5)+"px");
//				u.as(this.bn_delete, "left", (u.absX(this)+this.offsetWidth-5)+"px");
				u.as(this.bn_edit, "left", (u.absX(this)-23)+"px");
			}

		}

		node.out = function(event) {
			if(this.bn_delete) {
				document.body.removeChild(this.bn_delete);
				delete this.bn_delete;
			}
			if(this.bn_edit) {
				document.body.removeChild(this.bn_edit);
				delete this.bn_edit;
			}
		}

		u.e.hover(node, {"delay":500});
	}


	// activate existing inline formatting
	field.activateInlineFormatting = function(input, tag) {

		var i, node;
		var inline_tags = u.qsa("a,strong,em,span", input);

		for(i = 0; i < inline_tags.length; i++) {
			node = inline_tags[i];

			node.field = input.field;
			node.tag = tag;

			// Remove empty nodes – keep HTML clean
			if(!u.text(node)) {
				node.parentNode.removeChild(node);
			}
			// Add editing options
			else {
				this.deleteOrEditOption(node);
			}
		}
	}





	// INLINE FORMATTING HELPERS FOR TEXT NODES




	// add anchor tag
	field.addAnchorTag = function(selection, tag) {
		var range, a, url, target;

		var a = document.createElement("a");
		a.field = this;
		a.tag = tag;

		range = selection.getRangeAt(0);
		try {
			range.surroundContents(a);
			selection.removeAllRanges();

			// this.anchorOptions(a);
			this.editAnchorTag(a);
			this.deleteOrEditOption(a);
		}
		catch(exception) {
			u.bug("exception", exception)
			selection.removeAllRanges();
			this.hideSelectionOptions();

			alert("You cannot cross the boundaries of another selection. Yet.");
		}
	}

	// extend options pane with Anchor options
	field.anchorOptions = function(a) {

		var form = u.f.addForm(this.selection_options, {"class":"labelstyle:inject"});
		// u.ae(form, "h3", {"html":"Link options"});
		var fieldset = u.f.addFieldset(form);
		var input_url = u.f.addField(fieldset, {
			"label":"url", 
			"name":"url", 
			"value":a.href.replace(location.protocol + "//" + document.domain, ""), 
			"pattern":"(http[s]?:\\/\\/|mailto:|tel:)[^$]+|\/[^$]*",
			"error_message":"Must start with /, http:// or https://, mailto: or tel:"
		});

		var input_target = u.f.addField(fieldset, {
			"type":"checkbox", 
			"label":"Open in new window?", 
			"checked":(a.target ? "checked" : false), 
			"name":"target", 
			"error_message":""
		});
		var bn_save = u.f.addAction(form, {
			"value":"Save link", 
			"class":"button"
		});
		u.f.init(form);


		form.a = a;
		form.field = this;

		form.submitted = function() {

			if(this.inputs["url"].val()) {
				this.a.href = this.inputs["url"].val();
			}
			else {
				this.a.removeAttribute("href");
			}

			if(this.inputs["target"].val()) {
				this.a.target = "_blank";
			}
			else {
				this.a.removeAttribute("target");
			}

			this.field.selection_options.is_active = false;
			this.field.hideSelectionOptions();
		}
	}
	// edit span tag
	field.editAnchorTag = function(a) {

		// this.selection_options.is_active = false;
		this.hideSelectionOptions();
		this.hideDeleteOrEditOptions();

		// position of node
		// var x = u.absX(a.tag);
		// var y = u.absY(a.tag);

		// create options div
		// u.bug(a, a.field, a.tag);
		// this.selection_options = u.ae(document.body, "div", {"id":"selection_options"});
		this.selection_options = u.ae(a.field._editor, "div", {"class":"selection_options"});
		a.field._editor.insertBefore(this.selection_options, a.tag);

		// return;
		// position options pane according to field
		// u.as(this.selection_options, "top", y+"px");
		// u.as(this.selection_options, "left", (x + a.tag.offsetWidth) +"px");

		this.selection_options.is_active = false;

		this.anchorOptions(a);
	}


	// add string tag
	field.addStrongTag = function(selection, tag) {

		var range, a, url, target;
		var strong = document.createElement("strong");
		strong.field = this;
		strong.tag = tag;

		range = selection.getRangeAt(0);
		try {
			range.surroundContents(strong);
			selection.removeAllRanges();

			this.deleteOrEditOption(strong);
			this.hideSelectionOptions();
		}
		catch(exception) {
			selection.removeAllRanges();
			this.hideSelectionOptions();

			alert("You cannot cross the boundaries of another selection. Yet.");
		}
	}

	// add em tag
	field.addEmTag = function(selection, tag) {

		var range, a, url, target;
		var em = document.createElement("em");
		em.field = this;
		em.tag = tag;

		range = selection.getRangeAt(0);
		try {
			range.surroundContents(em);
			selection.removeAllRanges();

			this.deleteOrEditOption(em);
			this.hideSelectionOptions();
		}
		catch(exception) {
			selection.removeAllRanges();
			this.hideSelectionOptions();

			alert("You cannot cross the boundaries of another selection. Yet.");
		}
	}

	// add sup tag
	field.addSupTag = function(selection, tag) {

		var range, a, url, target;
		var sup = document.createElement("sup");
		sup.field = this;
		sup.tag = tag;

		range = selection.getRangeAt(0);
		try {
			range.surroundContents(sup);
			selection.removeAllRanges();

			this.deleteOrEditOption(sup);
			this.hideSelectionOptions();
		}
		catch(exception) {
			selection.removeAllRanges();
			this.hideSelectionOptions();

			alert("You cannot cross the boundaries of another selection. Yet.");
		}
	}



	// add span tag
	field.addSpanTag = function(selection, tag) {

		var span = document.createElement("span");
		span.field = this;
		span.tag = tag;

		var range = selection.getRangeAt(0);
		try {
			range.surroundContents(span);
			selection.removeAllRanges();

			// this.spanOptions(span);
			this.editSpanTag(span);
			this.deleteOrEditOption(span);
		}
		catch(exception) {
			selection.removeAllRanges();
			this.hideSelectionOptions();

			alert("You cannot cross the boundaries of another selection. Yet.");
		}
	}

	// edit span tag
	field.editSpanTag = function(span) {

		this.hideSelectionOptions();
		this.hideDeleteOrEditOptions();

		// position of node
		// var x = u.absX(span.tag);
		// var y = u.absY(span.tag);

		// create options div
		// this.selection_options = u.ae(document.body, "div", {"id":"selection_options"});

		this.selection_options = u.ae(span.field._editor, "div", {"class":"selection_options"});
		span.field._editor.insertBefore(this.selection_options, span.tag);


		// position options pane according to field
		// u.as(this.selection_options, "top", y+"px");
		// u.as(this.selection_options, "left", (x + span.tag.offsetWidth) +"px");

		// this.selection_options.is_active = false;

		this.spanOptions(span);
	}

	// add span options
	field.spanOptions = function(span) {

		var form = u.f.addForm(this.selection_options, {"class":"labelstyle:inject"});
		// u.ae(form, "h3", {"html":"CSS class"});
		var fieldset = u.f.addFieldset(form);
		var input_classname = u.f.addField(fieldset, {"label":"CSS class", "name":"classname", "value":span.className, "error_message":""});

		var bn_save = u.f.addAction(form, {"value":"Save class", "class":"button"});
		u.f.init(form);


		form.span = span;
		form.field = this;

		form.submitted = function() {

			if(this.inputs["classname"].val()) {
				this.span.className = this.inputs["classname"].val();
			}
			else {
				this.span.removeAttribute("class");
			}

			this.field.selection_options.is_active = false;
			this.field.hideSelectionOptions();

		}
	}




	// INDEX EXISTING CONTENT 

	// inject value into viewer div, to be able to inspect for DOM content on initialization
	field._viewer.innerHTML = field.input.val();


	// enable dragging of html-tags
	// u.sortable(field._editor, {"draggables":"div.tag,div.li", "targets":"div.editor,div.list", "layout": "vertical"});
	u.sortable(field._editor, {"draggables":"div.tag", "targets":"div.editor"});


	// TODO: Consider 
	// if value of textarea is not HTML formatted
	// change double linebreak to </p><p> (or fitting) once you are sure text is wrapped in node


	var value, node, i, tag, j, lis, li;

	// check for valid nodes, excluding <br>
	var nodes = u.cn(field._viewer, {"exclude":"br"});
	if(nodes.length) {


		// loop through childNodes
		for(i = 0; i < field._viewer.childNodes.length; i++) {
			node = field._viewer.childNodes[i];
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
							tag = field.addTextTag("p", fragments[index]);
							field.activateInlineFormatting(tag._input, tag);
						}
					}
					// wrap textnode in one paragraph
					else {
						value = node.nodeValue; //.replace(/\n\r|\n|\r/g, "<br>");
						tag = field.addTextTag("p", value);
						field.activateInlineFormatting(tag._input, tag);
					}

				}
			}

			// valid text node (h1-h6, p)
			else if(field.text_allowed && node.nodeName.toLowerCase().match(field.text_allowed.join("|"))) {


//				u.bug("found text node:" + node.innerHTML + ":" + node.innerHTML.trim() + ":" + node.innerHTML.trim().replace(/(<br>|<br \/>)$/, "") + ":" + node.innerHTML.trim().replace(/(<br>|<br \/>)$/, "").replace(/\n\r|\n|\r/g, "<br>"))

				// handle plain text node
				value = node.innerHTML.trim().replace(/(<br>|<br \/>)$/, "").replace(/\n\r|\n|\r/g, "<br>"); // .replace(/\<br[\/]?\>/g, "\n");

				// add new text node to editor
				tag = field.addTextTag(node.nodeName.toLowerCase(), value, node.className);
				// u.bug("node.className", node.className, tag);
				// if(node.className) {
				// 	tag._classname = node.className;
				// }
				
				field.activateInlineFormatting(tag._input, tag);

			}
			// valid text node (code)
			else if(node.nodeName.toLowerCase() == "code") {

				//				u.bug("found code node:", node, field.code_allowed.join("|"));

				// // add new text node to editor
				tag = field.addCodeTag(node.nodeName.toLowerCase(), node.innerHTML, node.className);
				// if(node.className) {
				// 	tag._classname = node.className;
				// }

				field.activateInlineFormatting(tag._input, tag);

			}

			// valid list node (ul, ol)
			else if(field.list_allowed.length && node.nodeName.toLowerCase().match(field.list_allowed.join("|"))) {

				//				u.bug("found list node:", node, field.list_allowed.join("|"));

				// handle list node
				var lis = u.qsa("li", node);
//				value = lis[0].innerHTML.replace(/\n\r|\n|\r/g, "<br>");
				value = lis[0].innerHTML.trim().replace(/(<br>|<br \/>)$/, "").replace(/\n\r|\n|\r/g, "<br>");

				// add new list node, and first li to editor
				tag = field.addListTag(node.nodeName.toLowerCase(), value, node.className);
				// if(node.className) {
				// 	tag._classname = node.className;
				// }

				// activate Inline
				var li = u.qs("div.li", tag);
				field.activateInlineFormatting(li._input, li);


				// loop through remaining li-element and add them, one by one
				if(lis.length > 1) {
					for(j = 1; j < lis.length; j++) {
						li = lis[j];
//						value = li.innerHTML.replace(/\n\r|\n|\r/g, "<br>");
						value = li.innerHTML.trim().replace(/(<br>|<br \/>)$/, "").replace(/\n\r|\n|\r/g, "<br>");
						li = field.addListItem(tag, value);
						field.activateInlineFormatting(li._input, li);
					}
				}
			}


			// divs containing file info (media, vimeo, youtube, file)

			// External video - youtube and vimeo
			else if(u.hc(node, "youtube|vimeo")) {

//				u.bug("found external video node")

				field.addExternalVideoTag(node.className.match(field.ext_video_allowed.join("|")[0]), node);
			}

			// FILE
			else if(u.hc(node, "file")) {

//				u.bug("found file node")

				field.addFileTag(node);
			}
			// media
			else if(u.hc(node, "media")) {

//				u.bug("found media node")

				field.addMediaTag(node);
			}



			// Catch unsupported nodes and translate to available node

			// dl, ul or ol (could be unsupported in given implementation)
			else if(node.nodeName.toLowerCase().match(/dl|ul|ol/)) {

//				u.bug("found denied list node")

				var children = u.cn(node);
				for(j = 0; j < children.length; j++) {
					child = children[j];

					value = child.innerHTML.replace(/\n\r|\n|\r/g, "");
					tag = field.addTextTag(field.text_allowed[0], value);
					field.activateInlineFormatting(tag._input, tag);
				}
			}

			// regular nodes (could be unsupported in given implementation)
			else if(node.nodeName.toLowerCase().match(/h1|h2|h3|h4|h5|code/)) {

//				u.bug("found denied text node")

				value = node.innerHTML.replace(/\n\r|\n|\r/g, "");
				tag = field.addTextTag(field.text_allowed[0], value);
				field.activateInlineFormatting(tag._input, tag);

			}
			else {
				alert("HTML contains unautorized node:" + node.nodeName + "\nIt has been altered to conform with SEO and design.");
			}

		}
	}

	// single unformatted textnode
	// wrap in <p> and replace newline with <br>
	else {

		value = field._viewer.innerHTML.replace(/\<br[\/]?\>/g, "\n");
		//.replace(/\n\r|\n|\r/g, "<br>");
		//
		tag = field.addTextTag(field.text_allowed[0], value);
		field.activateInlineFormatting(tag._input, tag);

	}


	// TODO: put a note here about why I don't update the textarea right away - because I don't remember

	field._editor.updateTargets();
	field._editor.updateDraggables();
	field._editor.detectSortableLayout();



	// update viewer after indexing
	field.updateViewer();
	field.updateContent();

	// add extra editor actions
	field.addRawHTMLButton();

}


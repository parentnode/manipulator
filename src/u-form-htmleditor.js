// Location custom field
// initializer and validator
// Location is a multi input field


// initializer
Util.Form.customInit["html"] = function(_form, field) {

	field._input = u.qs("textarea", field);
	field._input._form = _form;
	field._input.field = field;

	// add input to fields array
	_form.fields[field._input.name] = field._input;

	// get input label
	field._input._label = u.qs("label[for='"+field._input.id+"']", field);

	// get/set value function
	field._input.val = u.f._value;

	// create textEditor interface
	u.f.textEditor(field);

	// validate field now
	u.f.validate(field._input);

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
		u.f.fieldCorrect(iN);
	}
	else {
		u.f.fieldError(iN);
	}

}


// inject HTML editor
u.f.textEditor = function(field) {

//	u.bug("init custom editor")

	// show help?
	var hint_has_been_shown = u.getCookie("html-editor-hint-v1", {"path":"/"});
	if(!hint_has_been_shown) {

		// editor help info
		var editor_hint = u.ie(field, "div", {"class":"html_editor_hint"});

		var editor_hint_open = u.ae(editor_hint, "div", {"class":"open", "html":"I'd like to know more about the Editor"});
		var editor_hint_content = u.ae(editor_hint, "div", {"class":"html_editor_hint_content"});

		editor_hint_open.editor_hint_content = editor_hint_content;
		u.ce(editor_hint_open);
		editor_hint_open.clicked = function() {
			if(this.editor_hint_content.is_shown) {
				this.innerHTML = "I'd like to know more about the Editor";
				u.as(editor_hint_content, "display", "none");
				this.editor_hint_content.is_shown = false;
			}
			else {
				this.innerHTML = "Hide help for now";
				u.as(editor_hint_content, "display", "block");
				this.editor_hint_content.is_shown = true;
			}
		}


		u.ae(editor_hint_content, "p", {"html":"If you are new to using the Janitor HTML editor here are a few tips to working better with the editor."});
		u.ae(editor_hint_content, "p", {"html":"This HTML editor has been developed to maintain a strict control of the design - therefore it looks different from other HTML editors. The features available are aligned with the design of the specific page, and the Editor might not have the same features available in every context."});

		u.ae(editor_hint_content, "h4", {"html":"General use:"});
		u.ae(editor_hint_content, "p", {"html":"All HTML nodes can be deleted using the Trashcan in the Right side. The Editor always requires one node to exist and you cannot delete the last remaining node."});
		u.ae(editor_hint_content, "p", {"html":"HTML nodes can be re-ordered by dragging the bubble in the Left side."});
		u.ae(editor_hint_content, "p", {"html":"You can add new nodes by clicking on the + below the editor. The options availble are the ones allowed for the current content type."});

		u.ae(editor_hint_content, "h4", {"html":"Text nodes:"});
		u.ae(editor_hint_content, "p", {"html":"&lt;H1&gt;,&lt;H2&gt;,&lt;H3&gt;,&lt;H4&gt;,&lt;H5&gt;,&lt;H6&gt;,&lt;P&gt;,&lt;CODE&gt;"});
		u.ae(editor_hint_content, "p", {"html":"Text nodes are for headlines and paragraphs - regular text."});
		u.ae(editor_hint_content, "p", {"html":"You can activate the inline formatting tool by selecting text in your Text node."});
		u.ae(editor_hint_content, "p", {"html":"If you press ENTER inside a Text node, a new Text node will be created below the current one."});
		u.ae(editor_hint_content, "p", {"html":"If you press BACKSPACE twice inside an empty Text node it will be deleted"});

		u.ae(editor_hint_content, "h4", {"html":"List nodes:"});
		u.ae(editor_hint_content, "p", {"html":"&lt;UL&gt;,&lt;OL&gt;"});
		u.ae(editor_hint_content, "p", {"html":"There are two types of list nodes: Unordered lists (UL w/ bullets) and Ordered lists (OL w/ numbers). Each of them can have one or many List items."});
		u.ae(editor_hint_content, "p", {"html":"You can activate the inline formatting tool by selecting text in your List item."});
		u.ae(editor_hint_content, "p", {"html":"If you press ENTER inside a List item, a new List item will be created below the current one."});
		u.ae(editor_hint_content, "p", {"html":"If you press BACKSPACE twice inside an empty List item it will be deleted. If it is the last List item in the List node, the List node will be deleted as well."});

		u.ae(editor_hint_content, "h4", {"html":"File nodes:"});
		u.ae(editor_hint_content, "p", {"html":"Drag you file to the node or click the node to select your file."});
		u.ae(editor_hint_content, "p", {"html":"If you add other file-types than PDF's, the file will be zipped on the server and made availble for download as ZIP file."});

		var editor_hint_close = u.ae(editor_hint_content, "div", {"class":"close", "html":"I got it, don't tell me again"});

		u.ce(editor_hint_close);
		editor_hint_close.editor_hint = editor_hint;
		editor_hint_close.clicked = function() {
			u.saveCookie("html-editor-hint-v1", 1, {"path":"/"});
			this.editor_hint.parentNode.removeChild(this.editor_hint);
		}

	}


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
		for(i = 0; tag = tags[i]; i++) {

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
	var item_id_match = field._input._form.action.match(/\/([0-9]+)(\/|$)/);
	if(item_id_match) {
		field.item_id = item_id_match[1];
	}



	// BUILD EDITOR EXTERNAL INTERFACE

	// Viewer is a div containing the actual HTML output of the editor
	// at this point purely used for inspecting the generated HTML for debugging
	// could be used as a preview pane at a later point
	field._viewer = u.ae(field, "div", {"class":"viewer"});

	// The actual HTML editor interface
	field._editor = u.ae(field, "div", {"class":"editor"});
	field._editor.field = field;

	// callback after sorting list
	field._editor.dropped = function() {
		this.field.update();
		//u.bug("sorted")
	}

	// Create add options panel
	field.addOptions = function() {


		// allow to toggle raw HTML view
		this.bn_show_raw = u.ae(this._input._label, "span", {"html":"(RAW HTML)"});
		this.bn_show_raw.field = this;
		u.ce(this.bn_show_raw);
		this.bn_show_raw.clicked = function() {
			if(u.hc(this.field._input, "show")) {
				u.rc(this.field._input, "show");
			}
			else {
				u.ac(this.field._input, "show");
			}
		}


		// Add list for actions
		this.options = u.ae(this, "ul", {"class":"options"});


		// "Add" button
		this.bn_add = u.ae(this.options, "li", {"class":"add", "html":"+"});
		this.bn_add.field = field;
		u.ce(this.bn_add);
		this.bn_add.clicked = function(event) {
			if(u.hc(this.field.options, "show")) {
				u.rc(this.field.options, "show");
				u.rc(this.field, "optionsshown");
			}
			else {
				u.ac(this.field.options, "show");
				u.ac(this.field, "optionsshown");
			}
		}


		// Add text tag option (if allowed)
		if(this.text_allowed.length) {

			this.bn_add_text = u.ae(this.options, "li", {"class":"text", "html":"Text ("+this.text_allowed.join(", ")+")"});
			this.bn_add_text.field = field;
			u.ce(this.bn_add_text);
			this.bn_add_text.clicked = function(event) {
				this.field.addTextTag(this.field.text_allowed[0]);
				u.rc(this.field.options, "show");
			}
		}


		// Add list tag option (if allowed)
		if(this.list_allowed.length) {

			this.bn_add_list = u.ae(this.options, "li", {"class":"list", "html":"List ("+this.list_allowed.join(", ")+")"});
			this.bn_add_list.field = field;
			u.ce(this.bn_add_list);
			this.bn_add_list.clicked = function(event) {
				this.field.addListTag(this.field.list_allowed[0]);
				u.rc(this.field.options, "show");
			}
		}


		// Add code tag option (if allowed)
		if(this.code_allowed.length) {

			this.bn_add_code = u.ae(this.options, "li", {"class":"code", "html":"Code"});
			this.bn_add_code.field = field;
			u.ce(this.bn_add_code);
			this.bn_add_code.clicked = function(event) {
				this.field.addCodeTag(this.field.code_allowed[0]);
				u.rc(this.field.options, "show");
			}
		}


		// Add media tag option (if allowed)
		if(this.media_allowed.length && this.item_id && this.media_add_action && this.media_delete_action && !u.browser("IE", "<=9")) {

			this.bn_add_media = u.ae(this.options, "li", {"class":"list", "html":"Media ("+this.media_allowed.join(", ")+")"});
			this.bn_add_media.field = field;
			u.ce(this.bn_add_media);
			this.bn_add_media.clicked = function(event) {
				this.field.addMediaTag();
				u.rc(this.field.options, "show");
			}
		}
		else if(this.media_allowed.length) {
			u.bug("some information is missing to support media upload:\nitem_id="+this.item_id+"\nmedia_add_action="+this.media_add_action+"\nmedia_delete_action="+this.media_delete_action);
		}


		// Add external video tag option (if allowed)
		if(this.ext_video_allowed.length) {

			this.bn_add_ext_video = u.ae(this.options, "li", {"class":"video", "html":"External video ("+this.ext_video_allowed.join(", ")+")"});
			this.bn_add_ext_video.field = field;
			u.ce(this.bn_add_ext_video);
			this.bn_add_ext_video.clicked = function(event) {
				this.field.addExternalVideoTag(this.field.ext_video_allowed[0]);
				u.rc(this.field.options, "show");
			}
		}


		// Add file tag option (if allowed)
		if(this.file_allowed.length && this.item_id && this.file_add_action && this.file_delete_action && !u.browser("IE", "<=9")) {

			this.bn_add_file = u.ae(this.options, "li", {"class":"file", "html":"Downloadable file"});
			this.bn_add_file.field = field;
			u.ce(this.bn_add_file);
			this.bn_add_file.clicked = function(event) {
				this.field.addFileTag();
				u.rc(this.field.options, "show");
			}
		}

		else if(this.file_allowed.length) {
			u.bug("some information is missing to support file upload:\nitem_id="+this.item_id+"\nfile_add_action="+this.file_add_action+"\nfile_delete_action="+this.file_delete_action);
		}

	}




	// UPDATERS

	// Update viewer and Textarea
	field.update = function() {

		this.updateViewer();
		this.updateContent();


		// callback to field updated
		if(typeof(this.updated) == "function") {
			this.updated(this._input);
		}

		// callback to field changed
		if(typeof(this.changed) == "function") {
			this.changed(this._input);
		}

		// callback to form updated
		if(this._input._form && typeof(this._input._form.updated) == "function") {
			this._input._form.updated(this._input);
		}

		// callback to form changed
		if(this._input._form && typeof(this._input._form.changed) == "function") {
			this._input._form.changed(this._input);
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
		for(i = 0; tag = tags[i]; i++) {
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
				for(j = 0; li = lis[j]; j++) {
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
				div = u.ae(this._viewer, "div", {"class":"file item_id:"+tag._item_id+" variant:"+tag._variant+" name:"+tag._name + " filesize:"+tag._filesize});
				p = u.ae(div, "p");
				a = u.ae(p, "a", {"href":"/download/"+tag._item_id+"/"+tag._variant+"/"+tag._name, "html":tag._input.val()});
			}

			// is tag media
			else if(u.hc(tag, "media") && tag._variant) {

				// add div with <p> and <a>
				div = u.ae(this._viewer, "div", {"class":"media item_id:"+tag._item_id+" variant:"+tag._variant+" name:"+tag._name + " filesize:"+tag._filesize + " format:"+tag._format});
				p = u.ae(div, "p");
				a = u.ae(p, "a", {"href":"/images/"+tag._item_id+"/"+tag._variant+"/480x."+tag._format, "html":tag._input.val()});
			}

		}
		
	}

	// updates actual Textarea 
	field.updateContent = function() {
//			u.bug("updateContent");

		// get all tags
		var tags = u.qsa("div.tag", this);

		// update actual textarea to be saved
		this._input.val("");

		var i, node, tag, type, value, j, html = "";

		for(i = 0; tag = tags[i]; i++) {
//			u.bug(u.nodeId(tag));

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
				for(j = 0; li = lis[j]; j++) {
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

				html += '<div class="media item_id:'+tag._item_id+' variant:'+tag._variant+' name:'+tag._name+' filesize:'+tag._filesize+' format:'+tag._format+'">'+"\n";
				html += '\t<p><a href="/images/'+tag._item_id+'/'+tag._variant+'/480x.'+tag._format+'">'+tag._input.val()+"</a></p>";
				html += "</div>\n";
			}

			// file node
			else if(u.hc(tag, "file") && tag._variant) {

				html += '<div class="file item_id:'+tag._item_id+' variant:'+tag._variant+' name:'+tag._name+' filesize:'+tag._filesize+'">'+"\n";
				html += '\t<p><a href="/download/'+tag._item_id+'/'+tag._variant+'/'+tag._name+'">'+tag._input.val()+"</a></p>";
				html += "</div>\n";
			}

		}

		// save HTML in textarea
		this._input.val(html);

	}




	// EDITOR FUNCTIONALity

	// Create empty tag (with drag, type selector and remove-tag elements)
	field.createTag = function(allowed_tags, type) {

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


		// add remove button
		tag.bn_remove = u.ae(tag, "div", {"class":"remove"});
		tag.bn_remove.field = this;
		tag.bn_remove.tag = tag;
		u.ce(tag.bn_remove);
		tag.bn_remove.clicked = function() {
			this.field.deleteTag(this.tag);
		}

		if(u.hc(tag, this.list_allowed.join("|")) || u.hc(tag, this.text_allowed.join("|")) || u.hc(tag, this.code_allowed.join("|"))) {

			// add remove button
			tag.bn_classname = u.ae(tag, "div", {"class":"classname"});
			u.ae(tag.bn_classname, "span", {"html":"CSS"});
			tag.bn_classname.field = this;
			tag.bn_classname.tag = tag;
			u.ce(tag.bn_classname);
			tag.bn_classname.clicked = function() {
				this.field.classnameTag(this.tag);
			}
		}

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

			// remove node
			tag.parentNode.removeChild(tag);

			// enable dragging of html-tags
			u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

			// global update
			this.update();

			// save - new state (delete is permanent)
			this._input._form.submit();

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
			u.f.init(form);
			input_classname._input.focus();

			input_classname._input.blurred = function() {
				this.field.tag._classname = this.val();
				this.field.tag.bn_classname.removeChild(this._form);
				u.rc(this.field.tag.bn_classname, "open");
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
				for(i = 0; option = this.childNodes[i]; i++) {
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
			tag._type.clicked = function(event) {
//					u.bug("select clicked");

				// reset auto hide (just in case)
				u.t.resetTimer(this.t_autohide);

				// already show - close selector
				if(u.hc(this, "open")) {
					u.rc(this, "open");
					u.rc(this.tag, "focus");

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

					u.as(this, "top", -(this.selected_option.offsetTop) + "px");

					// add auto hide
					u.e.addEvent(this, "mouseout", this.autohide);
					u.e.addEvent(this, "mouseover", this.delayautohide);
				}
			}

			// auto hide type selector
			tag._type.hide = function() {
				u.rc(this, "open");
				u.rc(this.tag, "focus");

				u.as(this, "top", 0);

				// remove auto hide
				u.e.removeEvent(this, "mouseout", this.autohide);
				u.e.removeEvent(this, "mouseover", this.delayautohide);
				u.t.resetTimer(this.t_autohide);


				// return add focus to input
				this.field.returnFocus(this);
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
		u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

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
		tag._input._form = this._input._form;


		// if we have media info
		if(node) {

			// get file info from node
			tag._name = u.cv(node, "name");
			tag._item_id = u.cv(node, "item_id");
			tag._filesize = u.cv(node, "filesize");
			tag._format = u.cv(node, "format");
			tag._variant = u.cv(node, "variant");

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
			tag._input._form = this._input._form;

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
		u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

		return tag;
		
	}

	// Delete file on server, when file is deleted from editor
	field.deleteMedia = function(tag) {

		// create form data to submit delete request
		var form_data = new FormData();

		// append relevant data
		form_data.append("csrf-token", this._input._form.fields["csrf-token"].val());

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
		u.request(tag, this.file_delete_action+"/"+tag._item_id+"/"+tag._variant, {"method":"post", "params":form_data});

	}

	// attached to tag._input node for media-tags
	field._media_updated = function(event) {

		// create data form object to upload file
		var form_data = new FormData();

		// append relevant data
		form_data.append(this.name, this.files[0], this.value);
		form_data.append("csrf-token", this._form.fields["csrf-token"].val());

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
				this.tag.field._input._form.submit();
			}
		}
		u.request(this, this.field.media_add_action+"/"+this.field.item_id, {"method":"post", "params":form_data});

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
		tag._input._form = this._input._form;


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
			tag._input = u.ae(tag._text, "input", {"type":"file", "name":"htmleditor_file"});
			tag._input.tag = tag;
			tag._input.field = this;
			tag._input._form = this._input._form;

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
		u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

		return tag;
	}

	// Delete file on server, when file is deleted from editor
	field.deleteFile = function(tag) {

		// create form data to submit delete request
		var form_data = new FormData();

		// append relevant data
		form_data.append("csrf-token", this._input._form.fields["csrf-token"].val());

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
		u.request(tag, this.file_delete_action+"/"+tag._item_id+"/"+tag._variant, {"method":"post", "params":form_data});

	}

	// attached to tag._input node for file-tags
	field._file_updated = function(event) {

		u.bug("file:" + u.nodeId(this))

		// create data form object to upload file
		var form_data = new FormData();

		// append relevant data
		form_data.append(this.name, this.files[0], this.value);
		form_data.append("csrf-token", this._form.fields["csrf-token"].val());

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
				this.tag.field._input._form.submit();
			}
		}
		u.request(this, this.field.file_add_action+"/"+this.field.item_id, {"method":"post", "params":form_data});

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
	field.addCodeTag = function(type, value) {

		var tag = this.createTag(this.code_allowed, type);

		// text input
		tag._input = u.ae(tag, "div", {"class":"text", "contentEditable":true});
		tag._input.tag = tag;
		tag._input.field = this;
		tag._input._form = this._input._form;

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
		u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

		return tag;
	}

	// mousedown/touchstart event occured - wait for the counterpart (mouseup/touchend)
	// this is done to prevent having window events listening all the time
	field._code_selection_started = function(event) {
		this._selection_event_id = u.e.addWindowEndEvent(this, this.field._code_updated);
	}

	field._changing_code_content = function(event) {
//		u.bug("_changing_code_content:" + u.nodeId(this) + ", val:" + this.val() + ", " + event.keyCode);

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

//		u.bug("_code_updated:" + u.nodeId(this) + ", key:" + event.keyCode + ", val:" + this.val());

		// do we have a valid window event listener
		if(this._selection_event_id) {
			u.e.removeWindowEndEvent(this, this._selection_event_id);
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
				u.sortable(this.field._editor, {"draggables":"tag", "targets":"editor"});


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
	field.addListTag = function(type, value) {

		var tag = this.createTag(this.list_allowed, type);

		this.addListItem(tag, value);


		// enable dragging of html-tags
		u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

		return tag;
	}

	// add new li to list node
	field.addListItem = function(tag, value) {

		var li = u.ae(tag, "div", {"class":"li"});
		li.tag = tag;
		li.field = this;

		// text input
		li._input = u.ae(li, "div", {"class":"text", "contentEditable":true});
		li._input.li = li;
		li._input.tag = tag;
		li._input.field = this;
		li._input._form = this._input._form;

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

		return li;
	}





	// TEXT TAG


	// add new text node
	field.addTextTag = function(type, value) {

		var tag = this.createTag(this.text_allowed, type);

		// text input
		tag._input = u.ae(tag, "div", {"class":"text", "contentEditable":true});
		tag._input.tag = tag;
		tag._input.field = this;
		tag._input._form = this._input._form;

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
		u.sortable(this._editor, {"draggables":"tag", "targets":"editor"});

		return tag;
	}



	// attached to div._input node onkey down
	// overriding default enter action 
	// (browser will insert <br> on [ENTER] - we want to create new paragraph)
	field._changing_content = function(event) {
//		u.bug("_changing_content:" + u.nodeId(this) + ", val:" + this.val() + ", " + event.keyCode);

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

		// u.bug("changed value:" + u.nodeId(this) + ", key:" + event.keyCode + ", val:" + this.val());

		// do we have a valid window event listener
		if(this._selection_event_id) {
			u.e.removeWindowEndEvent(this, this._selection_event_id);
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
//				u.bug("go ahead delete me")

				u.e.kill(event);

				var all_tags = u.qsa("div.tag", this.field);

				// check for previous element before removing anything
				var prev = this.field.findPreviousInput(this);
//				u.bug("prev input:" + u.nodeId(prev))

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
				u.sortable(this.field._editor, {"draggables":"tag", "targets":"editor"});

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

			u.bug("selection:" + u.nodeId(this))
			// check if
			var node = selection.anchorNode;

			u.bug("node:" + u.nodeId(node))
			
			// test u.nodeWithin for this purpose

			while(node != this) {
				if(node.nodeName == "HTML" || !node.parentNode) {
					break;
				}
				node = node.parentNode;

				u.bug("node:" + u.nodeId(node))
				
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





	// EVENT HANDLERS 


	// gained focus on individual tag._input
	// TODO: Tabbing detection flawed
	field._focused_content = function(event) {
//		u.bug("field._focused_content:" + u.nodeId(this) + ", val:" + this.val());

		// add focus state
		this.field.is_focused = true;
		u.ac(this.tag, "focus");
		u.ac(this.field, "focus");

		// make sure field goes all the way in front - hint/error must be seen
		u.as(this.field, "zIndex", this.field._input._form._focus_z_index);

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
//		u.bug("_blurred_content:" + u.nodeId(this) + ", val:" + this.val());

		// remove focus state
		this.field.is_focused = false;
		u.rc(this.tag, "focus");
		u.rc(this.field, "focus");

		// put back in correct place
		u.as(this.field, "zIndex", this.field._base_z_index);

		// position hint in case there is an error
		u.f.positionHint(this.field);

		// hide options (will not be hidden if they are needed)
		this.field.hideSelectionOptions();
	}




	// PASTE FILTERING

	// clean pasted content - first version
	field._pasted_content = function(event) {
		u.e.kill(event);

		var i, node;
		var paste_content = event.clipboardData.getData("text/plain");

		// only do anything if paste content is not empty
		if(paste_content !== "") {

			// remove current selection if it exists
			// because pasting on top of selection should replace selection
			var selection = window.getSelection();
			if(!selection.isCollapsed) {
				selection.deleteFromDocument();
			}


//			alert("pasted:" + paste_content + "#:" + paste_content.trim() + "#")

			// add break tags for newlines
			// split string by newlines
			var paste_parts = paste_content.trim().split(/\n\r|\n|\r/g);
//			alert(paste_parts.join(","))
			var text_nodes = [];
			for(i = 0; text = paste_parts[i]; i++) {
				text_nodes.push(document.createTextNode(text));

				// only insert br-tag if there is more than one paste-part and not after the last one
				if(paste_parts.length && i < paste_parts.length-1) {
					text_nodes.push(document.createElement("br"));
				}
			}

			// loop through nodes in opposite order
			// webkit collapses space after selection if I don't 
			for(i = text_nodes.length-1; node = text_nodes[i]; i--) {

				// get current range
				var range = selection.getRangeAt(0);
				// insert new node
				range.insertNode(node);

				// add range to to selection
				selection.addRange(range);

			}

			// now collapse selection to end, to have cursor after selection
			selection.collapseToEnd();

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

		// position of node
		var x = u.absX(node);
		var y = u.absY(node);

		// create options div
		this.selection_options = u.ae(document.body, "div", {"id":"selection_options"});

		// position options pane according to field
		u.as(this.selection_options, "top", y+"px");
		u.as(this.selection_options, "left", (x + node.offsetWidth) +"px");

		var ul = u.ae(this.selection_options, "ul", {"class":"options"});

		// link option
		this.selection_options._link = u.ae(ul, "li", {"class":"link", "html":"Link"});
		this.selection_options._link.field = this;
		this.selection_options._link.tag = node;
		this.selection_options._link.selection = selection;
		u.ce(this.selection_options._link);
		this.selection_options._link.inputStarted = function(event) {
			u.e.kill(event);
			this.field.selection_options.is_active = true;
		}
		this.selection_options._link.clicked = function(event) {
			u.e.kill(event);
			this.field.addAnchorTag(this.selection, this.tag);
		}

		// EM option
		this.selection_options._em = u.ae(ul, "li", {"class":"em", "html":"Itallic"});
		this.selection_options._em.field = this;
		this.selection_options._em.tag = node;
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
		this.selection_options._strong.tag = node;
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
		this.selection_options._sup.tag = node;
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
		this.selection_options._span.tag = node;
		this.selection_options._span.selection = selection;
		u.ce(this.selection_options._span);
		this.selection_options._span.inputStarted = function(event) {
			u.e.kill(event);
			this.field.selection_options.is_active = true;
		}
		this.selection_options._span.clicked = function(event) {
			u.e.kill(event);
			this.field.addSpanTag(this.selection, this.tag);
		}

	}


	// add mouseover delete option to injected tags
	field.deleteOrEditOption = function(node) {

		node.over = function(event) {

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

		u.e.hover(node, {"delay":1000});
	}


	// activate existing inline formatting
	field.activateInlineFormatting = function(input, tag) {

		var i, node;
		var inline_tags = u.qsa("a,strong,em,span", input);

		for(i = 0; node = inline_tags[i]; i++) {
			node.field = input.field;
			node.tag = tag;
			this.deleteOrEditOption(node);
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

			this.anchorOptions(a);
			this.deleteOrEditOption(a);
		}
		catch(exception) {
			selection.removeAllRanges();
			this.hideSelectionOptions();

			alert("You cannot cross the boundaries of another selection. Yet.");
		}
	}

	// extend options pane with Anchor options
	field.anchorOptions = function(a) {

		var form = u.f.addForm(this.selection_options, {"class":"labelstyle:inject"});
		u.ae(form, "h3", {"html":"Link options"});
		var fieldset = u.f.addFieldset(form);
		var input_url = u.f.addField(fieldset, {"label":"url", "name":"url", "value":a.href.replace(location.protocol + "//" + document.domain, ""), "error_message":""});

		var input_target = u.f.addField(fieldset, {"type":"checkbox", "label":"Open in new window?", "checked":(a.target ? "checked" : false), "name":"target", "error_message":""});
		var bn_save = u.f.addAction(form, {"value":"Save link", "class":"button"});
		u.f.init(form);


		form.a = a;
		form.field = this;

		form.submitted = function() {

			if(this.fields["url"].val()) {
				this.a.href = this.fields["url"].val();
			}
			else {
				this.a.removeAttribute("href");
			}

			if(this.fields["target"].val()) {
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

		this.hideSelectionOptions();

		// position of node
		var x = u.absX(a.tag);
		var y = u.absY(a.tag);

		// create options div
		this.selection_options = u.ae(document.body, "div", {"id":"selection_options"});

		// position options pane according to field
		u.as(this.selection_options, "top", y+"px");
		u.as(this.selection_options, "left", (x + a.tag.offsetWidth) +"px");

		this.selection_options.is_active = false;

		this.anchorOptions(a);
	}


	// add string tag
	field.addStrongTag = function(selection, tag) {

		var range, a, url, target;
		var strong = document.createElement("strong");
		strong.field = this;
		strong.tag = tag;
//			u.bug("field:" + u.nodeId(this));

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

			this.spanOptions(span);
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

		// position of node
		var x = u.absX(span.tag);
		var y = u.absY(span.tag);

		// create options div
		this.selection_options = u.ae(document.body, "div", {"id":"selection_options"});

		// position options pane according to field
		u.as(this.selection_options, "top", y+"px");
		u.as(this.selection_options, "left", (x + span.tag.offsetWidth) +"px");

		this.selection_options.is_active = false;

		this.spanOptions(span);
	}

	// add span options
	field.spanOptions = function(span) {

		var form = u.f.addForm(this.selection_options, {"class":"labelstyle:inject"});
		u.ae(form, "h3", {"html":"CSS class"});
		var fieldset = u.f.addFieldset(form);
		var input_classname = u.f.addField(fieldset, {"label":"classname", "name":"classname", "value":span.className, "error_message":""});

		var bn_save = u.f.addAction(form, {"value":"Save class", "class":"button"});
		u.f.init(form);


		form.span = span;
		form.field = this;

		form.submitted = function() {

			if(this.fields["classname"].val()) {
				this.span.className = this.fields["classname"].val();
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
	field._viewer.innerHTML = field._input.val();


	// TODO: Consider 
	// if value of textarea is not HTML formatted
	// change double linebreak to </p><p> (or fitting) once you are sure text is wrapped in node


	var value, node, i, tag, j, lis, li;

	// check for valid nodes, excluding <br>
	var nodes = u.cn(field._viewer, {"exclude":"br"});
	if(nodes.length) {


		// loop through childNodes
		for(i = 0; node = field._viewer.childNodes[i]; i++) {

//			u.bug("node" + u.nodeId(node) + ", " + node.nodeName + ", " + typeof(node.nodeName));


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
				tag = field.addTextTag(node.nodeName.toLowerCase(), value);
				if(node.className) {
					tag._classname = node.className;
				}
				
				field.activateInlineFormatting(tag._input, tag);

			}
			// valid text node (code)
			else if(node.nodeName.toLowerCase() == "code") {

//				u.bug("found code node:" + u.nodeId(node) + ", " + field.code_allowed.join("|"))

				// // add new text node to editor
				tag = field.addCodeTag(node.nodeName.toLowerCase(), node.innerHTML);
				if(node.className) {
					tag._classname = node.className;
				}

				field.activateInlineFormatting(tag._input, tag);

			}

			// valid list node (ul, ol)
			else if(field.list_allowed.length && node.nodeName.toLowerCase().match(field.list_allowed.join("|"))) {

//				u.bug("found list node:" + u.nodeId(node) + "," + field.list_allowed.join("|"))

				// handle list node
				var lis = u.qsa("li", node);
//				value = lis[0].innerHTML.replace(/\n\r|\n|\r/g, "<br>");
				value = lis[0].innerHTML.trim().replace(/(<br>|<br \/>)$/, "").replace(/\n\r|\n|\r/g, "<br>");

				// add new list node, and first li to editor
				tag = field.addListTag(node.nodeName.toLowerCase(), value);
				if(node.className) {
					tag._classname = node.className;
				}

				// activate Inline
				var li = u.qs("div.li", tag);
				field.activateInlineFormatting(li._input, li);


				// loop through remaining li-element and add them, one by one
				if(lis.length > 1) {
					for(j = 1; li = lis[j]; j++) {
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

				field.addExternalVideoTag(node.className.match(field.ext_video_allowed.join("|")), node);
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
				for(j = 0; child = children[j]; j++) {
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
				alert("HTML contains unautorized node:" + node.nodeName + "("+u.nodeId(node)+")" + "\nIt has been altered to conform with SEO and design.");
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


	// enable dragging of html-tags
	u.sortable(field._editor, {"draggables":"tag", "targets":"editor"});

	// update viewer after indexing
	field.updateViewer();

	// add extra editor actions
	field.addOptions();

}


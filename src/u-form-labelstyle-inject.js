
Util.Form.customLabelStyle["inject"] = function(iN) {
	// u.bug("customLabelStyle:inject", iN, iN.type);

	// some inputs cannot have labels injected
	// textarea has no type
	if(!iN.type || !iN.type.match(/file|radio|checkbox/)) {

		// store default value
		iN.default_value = u.text(iN.label);

		// add default handlers to focus and blur events
		u.e.addEvent(iN, "focus", u.f._changed_state);
		u.e.addEvent(iN, "blur", u.f._changed_state);
		u.e.addEvent(iN, "change", u.f._changed_state);


		// Create psydo label for inputs that can't easily show label value
		// Did experiments with with field replacement, but required too much work
		// replacing event and references (this seems to provide sufficient backup)
		if(iN.type.match(/number|integer|password|datetime|date/)) {

			iN.pseudolabel = u.ae(iN.parentNode, "span", {"class":"pseudolabel", "html":iN.default_value});
			iN.pseudolabel.iN = iN;

			// position on top of input
			u.as(iN.pseudolabel, "top", iN.offsetTop+"px");
			u.as(iN.pseudolabel, "left", iN.offsetLeft+"px");
			// create event to remove pseudolabel
			u.ce(iN.pseudolabel)
			iN.pseudolabel.inputStarted = function(event) {
				u.e.kill(event);
				this.iN.focus();
			}

		}

		u.f.updateDefaultState(iN);

	}

}


// internal focus/blur handler for default value controller - attatched to inputs
u.f._changed_state = function() {
	// u.bug("this._default_value_focus:", this);

	u.f.updateDefaultState(this);
}


// update default state on input
u.f.updateDefaultState = function(iN) {
	// u.bug("updateDefaultState for:", iN, iN.is_focused);

	// is input focused
	if(iN.is_focused || iN.val() !== "") {

		// leave default state
		u.rc(iN, "default");
		if(iN.field.virtual_input) {
			u.rc(iN.field.virtual_input, "default");
		}

		// remove default value if field does not have value
		if(iN.val() === "") {
			iN.val("");
		}

	}
	// input does not have focus - consider dafault value
	else {

		// only set default value if input is empty
		if(iN.val() === "") {

			// add class to indicate default value
			u.ac(iN, "default");
			if(obj(iN.field.virtual_input)) {
				u.ac(iN.field.virtual_input, "default");
			}
			iN.val(iN.default_value);

		}
	}
}

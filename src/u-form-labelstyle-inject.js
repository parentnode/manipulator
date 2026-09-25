
Util.Form.customLabelStyle["inject"] = function(iN) {
	// u.bug("customLabelStyle:inject", iN, iN.type);

	// some inputs cannot have labels injected
	// textarea has no type
	if(!iN.type || !iN.type.match(/file|radio|checkbox/)) {



		// update default state on input
		iN.updateDefaultState = function() {
			// u.bug("updateDefaultState for:", iN, iN.is_focused);

			// is input focused
			if(this.is_focused || this.val() !== "") {

				// leave default state
				u.rc(this, "default");
				if(this.field.virtual_input) {
					u.rc(this.field.virtual_input, "default");
				}

				// remove default value if field does not have value
				// Date/datetime can be partially filled and still return empty value, do not reset value
				if(this.val() === "" && !this.type.match(/date|datetime|select/)) {
					this.val("");
				}

			}
			// input does not have focus - consider dafault value
			else {

				// only set default value if input is empty
				if(this.val() === "") {

					// add class to indicate default value
					u.ac(this, "default");
					if(obj(this.field.virtual_input)) {
						u.ac(this.field.virtual_input, "default");
					}

					// Date/datetime can be partially filled, do not reset value
					if(!this.type.match(/date|datetime|select/)) {
						this.val(this.default_value);
					}

				}
			}
		}


		// store default value
		iN.default_value = u.text(iN.label);

		// add default handlers to focus and blur events
		u.e.addEvent(iN, "focus", iN.updateDefaultState);
		u.e.addEvent(iN, "blur", iN.updateDefaultState);
		u.e.addEvent(iN, "change", iN.updateDefaultState);


		// Create psydo label for inputs that can't easily show label value
		// Did experiments with with field replacement, but required too much work
		// replacing event and references (this seems to provide sufficient backup)
		// Date/datetime should use it's own label for now
		// if(iN.type.match(/number|integer|password|datetime|date/)) {
		if(iN.type.match(/number|integer|password/)) {

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

		iN.updateDefaultState(iN);

	}


}


// // internal focus/blur handler for default value controller - attatched to inputs
// u.f._changed_state = function() {
// 	// u.bug("this._default_value_focus:", this);
//
// 	u.f.updateDefaultState(this);
// }



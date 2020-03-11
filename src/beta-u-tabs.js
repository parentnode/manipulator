Util.Modules["tabs"] = new function() {
	this.init = function(tabset) {
		var i, tab, pane;

		// get tabs in tabset
		tabset.tabs = u.qsa("li.tab", tabset);

		// set selected tab
		tabset.selectTab = function(id) {
			var i, tab, pane;

			for(i = 0; i < this.tabs.length; i++) {
				tab = this.tabs[i];

				if(tab.tab_id != id) {
					u.rc(tab, "selected");
				}
				else {
					u.ac(tab, "selected");
				}
			}

			for(i = 0; i < this.panes.length; i++) {
				pane = this.panes[i];
				
				if(pane.tab_id != id) {
					u.rc(pane, "selected");
				}
				else {
					u.ac(pane, "selected");
				}
			}


		}

		// create tab pane wrapper
		var panes = u.ae(tabset, "li", "tab_panes");
		var selected_tab = false;

		for(i = 0; i < tabset.tabs.length; i++) {
			tab = tabset.tabs[i];

			tab.tab_id  = tab.className.replace(/tab |tab|selected |selected/, "");
			if(tab.tab_id) {
				tab.tabset = tabset;

				// add tab pane to pane wrapper
				pane  = panes.appendChild(u.qs(".body", tab));
				pane.tab_id = tab.tab_id;
				u.ac(pane, tab.tab_id);

				u.e.click(tab);
				tab.clicked = function() {
					this.tabset.selectTab(this.tab_id);
				}
			}
			else {
				alert("No tab identifier class for:" + u.qs(".header", tab).innerHTML);
			}
		}

		tabset.panes = u.qsa(".body", panes);

		// preselected tab?
		var selected_tab = u.qs("li.tab.selected", tabset);
		if(selected_tab) {
			tabset.selectTab(selected_tab.tab_id);
		}
		else {
			tabset.selectTab(tabset.tabs[0].tab_id);
		}

	}
}
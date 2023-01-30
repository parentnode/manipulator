u.includeGoogleAnalytics = function() {
	if(typeof(gtag) !== "function") {
		// u.bug("includeGoogleAnalytics");

		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', u.ga_account);


		var script = document.createElement("script");
		script.src = "https://www.googletagmanager.com/gtag/js?id="+u.ga_account;
		script.async = true;
		document.head.appendChild(script);


		u.stats = new function() {

			// track regular page view
			// GA4 does this automatically, based on popstate event change
			this.pageView = function(url) {
				// u.bug("pageView", url);
			}


			// track event
			this.event = function(node, _options) {

				// default values
				var event = false;
				var eventCategory = "Uncategorized";
				var eventAction = null;
				var eventLabel = null;
				var eventValue = null;
				var nonInteraction = false;
				var hitCallback = null;


				if(obj(_options)) {
					var _argument;
					for(_argument in _options) {

						switch(_argument) {
							case "event"				: event					= _options[_argument]; break;

							case "eventCategory"		: eventCategory			= _options[_argument]; break;
							case "eventAction"			: eventAction			= _options[_argument]; break;
							case "eventLabel"			: eventLabel			= _options[_argument]; break;
							case "eventValue"			: eventValue			= _options[_argument]; break;
							case "nonInteraction"		: nonInteraction		= _options[_argument]; break;
							case "hitCallback"			: hitCallback			= _options[_argument]; break;
						}
					}
				}


				// Set missing eventAction (if possible)
				if(!eventAction && event && event.type) {
					eventAction = event.type;
				}
				else if(!eventAction && event) {
					eventAction = event;
				}
 				else if(!eventAction) {
					eventAction = "Unknown";
				}

				// Set missing eventLabel (if possible)
				if(!eventLabel && event && event.currentTarget && event.currentTarget.url) {
					eventLabel = event.currentTarget.url;
				}
				else if(!eventLabel) {
					eventLabel = this.nodeSnippet(node);
				}


				gtag({
					"event": eventAction, 
					"eventCategory": eventCategory, 
					"eventAction": eventAction,
					"eventLabel": eventLabel,
					"eventValue": eventValue,
				});

			}


			// Simple label generator
			this.nodeSnippet = function(node) {
				if(node.id) {
					return node.id;
				}
				else if(node._a && node._a.id) {
					return node._a.id;
				}
				else if(u.text(node)) {
					return u.cutString(u.text(node).trim(), 20);
				}
				else if(event && event.currentTarget && event.currentTarget.url) {
					return event.currentTarget.url;
				}
				else {
					return node.nodeName + (node.className ? "."+node.className : "");
				}
				
				// return u.cutString(u.text(node).trim(), 20) + (node.id ? node.id : node._a.id ? node._a.id : "(<"+node.nodeName+">)");
			}

		}

	}

}

if(u.ga_account && !u.cookies_disallowed) {
	// u.bug("includeGoogleAnalytics allowed");
	u.includeGoogleAnalytics();
}

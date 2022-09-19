u.includeGoogleTagManager = function() {
	if(typeof(gtag) !== "function") {

		window.dataLayer = window.dataLayer || [];
		dataLayer.push({'gtm.start': new Date().getTime()});
		dataLayer.push({'event': 'gtm.js'});

		u.ae(document.head, "script", {src: "https://www.googletagmanager.com/gtm.js?id="+u.gtm_account, async: true})

		// u.bug("includeGoogleTagManager");

		u.stats = new function() {

			// track regurlar page view
			this.pageView = function(url) {
				window.dataLayer.push({
					'event': 'pageview'
				});
			}


			// track event
			this.event = function(node, _options) {
				// u.bug("options", node, _options);

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
				// if(!eventLabel && event && event.currentTarget && event.currentTarget.url) {
				// 	eventLabel = event.currentTarget.url;
				// }
				// else
				if(!eventLabel) {
					eventLabel = this.nodeSnippet(node);
				}

				if(!event) {
					event = eventLabel + " " + eventAction;
				}


				//ga('send', 'event', [eventCategory], [eventAction], [eventLabel], [eventValue], [fieldsObject]);
				window.dataLayer.push({
					"event": event,
					"eventCategory": eventCategory, 
					"eventAction": eventAction,
					"eventLabel": eventLabel,
					"eventValue": eventValue,
					"nonInteraction": nonInteraction,
					"hitCallback": hitCallback
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

if(u.gtm_account && !u.cookies_disallowed) {
	// u.bug("includeGoogleTagManager allowed");
	u.includeGoogleTagManager();
}

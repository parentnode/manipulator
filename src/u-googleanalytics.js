
if(u.ga_account) {

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.defer=true;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	// track page view for initial load
    ga('create', u.ga_account, u.ga_domain);
    ga('send', 'pageview');


	// when analytics is loaded
	// ga(function() {
	// 	u.bug("ga loaded")
	//
	// })


	u.stats = new function() {

		// track regurlar page view
		this.pageView = function(url) {
			ga('send', 'pageview', url);
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


			if(typeof(_options) == "object") {
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

			//ga('send', 'event', [eventCategory], [eventAction], [eventLabel], [eventValue], [fieldsObject]);
			ga('send', 'event', {
				"eventCategory": eventCategory, 
				"eventAction": eventAction,
				"eventLabel": eventLabel,
				"eventValue": eventValue,
				"nonInteraction": nonInteraction,
				"hitCallback": hitCallback
			});

		}

		// LEGACY
		// this.customVar = function(slot, name, value, scope) {
		//
		//
		// 	// _gaq.push(['_setCustomVar',
		// 	//       slot,		// This custom var is set to slot #1.  Required parameter.
		// 	//       name,		// The name of the custom variable.  Required parameter.
		// 	//       value,	// The value of the custom variable.  Required parameter.
		// 	//       scope		// Sets the scope to visitor-level.  Optional parameter.
		// 	//  ]);
		//
		// }

		// Simple label generator
		this.nodeSnippet = function(node) {
			return u.cutString(u.text(node).trim(), 20) + "(<"+node.nodeName+">)";
		}
	}

}

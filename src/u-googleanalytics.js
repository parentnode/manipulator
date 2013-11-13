
if(u.ga_account) {

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', u.ga_account, u.ga_domain);
    ga('send', 'pageview');



// 	var _gaq = _gaq || [];
// 	_gaq.push(['_setAccount', u.ga_account]);
// 	_gaq.push(['_trackPageview']);
// 
// 	(function() {
// 		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
// 		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
// 		
// //		text += "#google<br>";
// 		
// 		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
// 	})();


	u.stats = new function() {

		this.pageView = function(url) {
//			_gaq.push(['_trackPageview', url]);
			ga('send', 'pageview', url);
		}

		this.event = function(node, action, label) {
//			_gaq.push(['_trackEvent', location.href.replace(document.location.protocol + "//" + document.domain, ""), action, (label ? label : this.nodeSnippet(node))]);
			ga('_trackEvent', location.href.replace(document.location.protocol + "//" + document.domain, ""), action, (label ? label : this.nodeSnippet(node)));
		}
		
		this.customVar = function(slot, name, value, scope) {


			// _gaq.push(['_setCustomVar',
			//       slot,		// This custom var is set to slot #1.  Required parameter.
			//       name,		// The name of the custom variable.  Required parameter.
			//       value,	// The value of the custom variable.  Required parameter.
			//       scope		// Sets the scope to visitor-level.  Optional parameter.
			//  ]);
			
		}

		this.nodeSnippet = function(e) {
			
			if(e.textContent != undefined) {
				return u.cutString(e.textContent.trim(), 20) + "(<"+e.nodeName+">)";
			}
			else {
				return u.cutString(e.innerText.trim(), 20) + "(<"+e.nodeName+">)";
			}
		}
	}

}

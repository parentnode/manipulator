u.twitter = function(node) {

	// default month declarations, if not already set
	if(!node._months) {
		node._months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	}


	node.loadTweets = function(twitter_id, count) {
		u.bug("loadTweets:" + twitter_id);

		this.response = function(response) {
			var tweets = u.qsa(".stream-item", response);

			var ul = document.createElement("ul");

			var stream_item, i, node, tweet, username, fullname, avatar, time, base_div;
			for(i = 0; stream_item = tweets[i]; i++) {

				base_div = u.qs("div.tweet", stream_item);
				
				node = u.ae(ul, "li", {"class":"id:"+base_div.getAttribute("data-item-id")});

				u.ae(node, "div", {"class":"tweet", "html":u.qs("p.js-tweet-text", stream_item).innerHTML});
				u.ae(node, "div", {"class":"username", "html":base_div.getAttribute("data-screen-name")});
				u.ae(node, "div", {"class":"fullname", "html":base_div.getAttribute("data-name")});
				u.ae(node, "div", {"class":"time", "html":u.qs("span._timestamp", stream_item).getAttribute("data-time")});
				u.ae(node, "img", {"class":"avatar", "src":u.qs("img.avatar", stream_item).getAttribute("src").replace("https", "http")});

				u.bug("tweet:" + node.innerHTML);

			}

			if(typeof(this.tweetsLoaded) == "function") {
				this.tweetsLoaded(ul);
			}
		}
		u.request(this, "/tweets");

	}
}
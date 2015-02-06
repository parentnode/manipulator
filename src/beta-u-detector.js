alert("fisk:" + window)
window.includeSegment = function(segment) {
// //
// //
// //	alert("segment:"+segment)
// //
// // 	// document.write('<script type="text/javascript" src="/js/seg_'+segment+'.js"></script>');
// // 	// document.write('<script type="text/javascript" src="/css/seg_'+segment+'.css"></script>');
// //
// //
}


(function() {
	var ua = navigator.userAgent;



	// do detection
	if(ua.match(/android|iphone|ipod|touch|mobile|nokia/)) {
		segment = "mobile";
	}
	else {
		segment = "desktop";
	}
	
	alert(segment)
	
	
	if(typeof(window.includeSegment) == "function") {

		alert(segment)
//		window.includeSegment(segment);

	}
	else {

		document.write('<script type="text/javascript" src="/js/seg_'+segment+'.js"></script>');
		document.write('<script type="text/javascript" src="/css/seg_'+segment+'.css"></script>');
		alert("direct inclusion");

	}

})();



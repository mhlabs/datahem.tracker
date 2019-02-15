function(){
    //downgrade gracefully if user agent doesn't support sendbeacon even if it say support
    //always send first hit as xmlhttp POST to enable CORS in some browsers
  	var userAgent = window.navigator.userAgent.toLowerCase(),
    downgrade = /samsungbrowser|crios|edge|gsa|instagram|fban|fbios/.test( userAgent );
	return(navigator.sendBeacon && sessionStorage.getItem('beaconPreflight') && !downgrade);
}
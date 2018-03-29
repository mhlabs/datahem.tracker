function() {
  	// Add your collector endpoint here
  	var endpoint = 'https://mathem-data.appspot.com/collect/';
	
	return function(model) {
	    var vendor = 'measurementprotocol';
	    var version = '1';
	    var path = ((endpoint.substr(-1) !== '/') ? endpoint + '/' : endpoint) + vendor + '/v' + version + '/';
	    
	    var globalSendTaskName = '_' + model.get('trackingId') + '_sendHitTask';
	    
	    var originalSendHitTask = window[globalSendTaskName] = window[globalSendTaskName] || model.get('sendHitTask');
	    
	    model.set('sendHitTask', function(sendModel) {
	    	var payload = sendModel.get('hitPayload');
	      	originalSendHitTask(sendModel);
	      	if (navigator.sendBeacon) {
	      		navigator.sendBeacon(path, payload);
	  	  	}
	  	  	else if (typeof new XMLHttpRequest().responseType === 'string') {
	      		var request = new XMLHttpRequest();
	        	request.open('POST', path, true);
	        	request.setRequestHeader('Content-type', 'text/plain; charset=UTF-8');
	        	request.send(payload);
	  		} 
	  		else {
	    		var beacon = document.createElement("img");
	     		if( beacon.onerror ){
	     			beacon.onerror = function(){}; 
	     		}
	        	if( beacon.onload ){
	        		beacon.onload  = function(){}; 
	        	}
	     		beacon.src = path + '.gif?' + payload;
	    	}     
		});
	};
}
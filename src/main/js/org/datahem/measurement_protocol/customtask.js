function() {
	return function(model) {

	    var globalSendTaskName = '_' + model.get('trackingId') + '_sendHitTask';
	    
	    var originalSendHitTask = window[globalSendTaskName] = window[globalSendTaskName] || model.get('sendHitTask');
	    
	    model.set('sendHitTask', function(sendModel) {
	    	var payload = sendModel.get('hitPayload');
	      	originalSendHitTask(sendModel);  

			var endpoints = {{datahem collector endpoints}};
	      	var i, len, endpointsArr = endpoints.split(",");
			for (len = endpointsArr.length, i=0; i<len; ++i) {
	      		var endpoint = endpointsArr[i];
	      		//add trackingId to collector path -> https://myprojectid/collect/ua123456789/
	      		var path = ((endpoint.substr(-1) !== '/') ? endpoint + '/' : endpoint) + model.get('trackingId').replace(/\W/g, '').toLowerCase() + '/';
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
			}

		});
	};
}
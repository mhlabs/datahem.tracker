//Custom task to copy GA payload and send to DataHem endpoints
// Use comma separated {{dh collector endpoints}} variable, like https://europe-west1-project1.cloudfunctions.net/webhook?topic=,https://europe-west1-project2.cloudfunctions.net/webhook?topic=
function() {
	return function(model) {

	    var globalSendTaskName = '_' + model.get('trackingId') + '_sendHitTask';
	    
	    var originalSendHitTask = window[globalSendTaskName] = window[globalSendTaskName] || model.get('sendHitTask');
	    
	    model.set('sendHitTask', function(sendModel) {
	    	var payload = sendModel.get('hitPayload');
          	var body = {};
          	body['payload'] = payload;
          try{
	      	originalSendHitTask(sendModel);
          }catch(e){
          	console.log("error on payload");
            console.log(e);
          }
          
          function sendGet(path_, topic_, payload_){
          	var beacon = document.createElement("img");
		    beacon.onerror = function(){}; 
		    beacon.onload  = function(){}; 
		    beacon.src = path_.split('/')[2] + topic_ + '&' + payload_;
          }
          
          function sendPost(path_, topic_){
          	var request = new XMLHttpRequest();
		    request.open('POST', path_ + topic_, true);
		    request.setRequestHeader('Content-type', 'text/plain; charset=UTF-8');
            request.onerror = function(){
            };
            request.onload = function(){
            	if(request.readyState === 4 && request.status >= 200 && request.status < 300){
                    sessionStorage.setItem('beaconPreflight', true);
				}
            };
		    request.send(JSON.stringify(body));
          }

			var endpoints = {{dh collector endpoints}};
            var sendMethod = ({{dh tracker method}} !== undefined) ? {{dh tracker method}} : 'beacon';
	      	var i, len, endpointsArr = endpoints.split(",");
			for (len = endpointsArr.length, i=0; i<len; ++i) {
	      		//var endpoint = endpointsArr[i];
                var path = endpointsArr[i];
	      		//var path = ((endpoint.substr(-1) !== '/') ? endpoint + '/' : endpoint)
                var topic = model.get('trackingId').replace(/\W/g, '').toLowerCase();
		      	if ({{dh tracker beacon support}} && sendMethod === 'beacon') {
	      			if(!navigator.sendBeacon(path + topic, JSON.stringify(body))){
                   		sendGet(path, topic, payload);
                   	}
		  	  	}
		  	  	else if (typeof new XMLHttpRequest().responseType === 'string' && (sendMethod === 'beacon' || sendMethod === 'post')) {
                   sendPost(path, topic);
		  		} 
		  		else {
		    		sendGet(path, topic, payload);
		    	}
			}
		});
	};
}
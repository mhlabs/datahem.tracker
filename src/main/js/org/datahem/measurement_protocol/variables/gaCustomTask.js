/*
 * Copyright (C) 2018 - 2019 Robert Sahlin
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/*
* Builds on code shared by Simo Ahava and Google Analytics official documentation.
*/

/*
* Check if browser supports sendbeacon and send first hit as xmlhttp POST to enable CORS in some browsers.
*/

function() {
//Custom task to copy GA payload and send to DataHem endpoints
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
          
          function sendGet(path_, cstream_, payload_){
          	var beacon = document.createElement("img");
		    beacon.onerror = function(){}; 
		    beacon.onload  = function(){}; 
		    beacon.src = path_.split('/')[2] + '/gif/?cstream=' + cstream + '&' + payload_;
          }
          
          function sendPost(path_, cstream_, payload_){
          	var request = new XMLHttpRequest();
		    request.open('POST', path_ + cstream + '/', true);
		    request.setRequestHeader('Content-type', 'text/plain; charset=UTF-8');
            request.onerror = function(){
            	//sendGet(path_, cstream_, payload_);
            };
            request.onload = function(){
            	if(request.readyState === 4 && request.status >= 200 && request.status < 300){
                	//sendGet(path_, cstream_, payload_);
                    sessionStorage.setItem('beaconPreflight', true);
				}
            };
		    request.send(JSON.stringify(body));
          }

			var endpoints = {{dh collector endpoints}};
            var sendMethod = ({{dh tracker method}} !== undefined) ? {{dh tracker method}} : 'beacon';
	      	var i, len, endpointsArr = endpoints.split(",");
			for (len = endpointsArr.length, i=0; i<len; ++i) {
	      		var endpoint = endpointsArr[i];
	      		var path = ((endpoint.substr(-1) !== '/') ? endpoint + '/' : endpoint)
                var cstream = model.get('trackingId').replace(/\W/g, '').toLowerCase();
		      	if ({{dh tracker beacon support}} && sendMethod === 'beacon') {
	      			if(!navigator.sendBeacon(path + cstream + '/', JSON.stringify(body))){
                   		sendGet(path, cstream, payload);
                   	} 
		  	  	}
		  	  	else if (typeof new XMLHttpRequest().responseType === 'string' && (sendMethod === 'beacon' || sendMethod === 'post')) {
                   sendPost(path, cstream, payload);
		  		} 
		  		else {
		    		sendGet(path, cstream, payload);
		    	}
			}

		});
	};
}
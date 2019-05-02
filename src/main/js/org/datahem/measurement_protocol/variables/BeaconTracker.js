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
* Sends hit with Navigator.sendBeacon if supported. Else downgrading to AJAX Post and Image pixel tracking.
* Set endpoints variable (comma separated if more than one). Example: 'https://<PROJECT_ID>.appspot.com/,https://<PROJECT_ID>.appspot.com/'
* 
*/

//Custom task to copy GA payload and send to DataHem endpoints
function() {
	return function(model) {
	    var endpoints = '<REPLACE WITH YOUR ENDPINTS>';
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
          
            function trackerBeaconSupport(){
                var userAgent = window.navigator.userAgent.toLowerCase(),
                downgrade = /samsungbrowser|crios|edge|gsa|instagram|fban|fbios/.test( userAgent );
                return(navigator.sendBeacon && sessionStorage.getItem('beaconPreflight') && !downgrade);
            }
          
            var cstream = model.get('trackingId').replace(/\W/g, '').toLowerCase();
            var i, len, endpointsArr = endpoints.split(",");

            for (len = endpointsArr.length, i=0; i<len; ++i) {
                var endpoint = endpointsArr[i];
                var path = ((endpoint.substr(-1) !== '/') ? endpoint + '/' : endpoint) + '_ah/api/collect/v1/open/';
                if (trackerBeaconSupport()) {
                    if(!navigator.sendBeacon(path + cstream + '/', JSON.stringify(body))){
                        // Send as image request if sendBeacon fails to queue the data for transfer.
                        var beacon = document.createElement("img");
                        beacon.onerror = function(){}; 
                        beacon.onload  = function(){}; 
                        beacon.src = path + 'gif/?cstream=' + cstream + '&' + payload;
                    } 
                }
                // Send as AJAX Post if sendBeacon isn't supported
                else if (typeof new XMLHttpRequest().responseType === 'string') {
                    var request = new XMLHttpRequest();
                    request.open('POST', path + cstream + '/', true);
                    request.setRequestHeader('Content-type', 'text/plain; charset=UTF-8');
                    request.onerror = function(){};
                    request.onload = function(){
                        if(request.readyState === 4 && request.status >= 200 && request.status < 300){
                            sessionStorage.setItem('beaconPreflight', true);
                        }
                    };
                    request.send(JSON.stringify(body));
                } 
                // Send as image request if AJAX Post isn't supported
                else {
                    var beacon = document.createElement("img");
                    beacon.onerror = function(){}; 
                    beacon.onload  = function(){}; 
                    beacon.src = path + 'gif/?cstream=' + cstream + '&' + payload;
                }
            }
        });
	};
}
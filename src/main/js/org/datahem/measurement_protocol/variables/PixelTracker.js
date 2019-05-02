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
* Sends hit with image request (pixel tracking).
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
            try{
	      	    originalSendHitTask(sendModel);
            }catch(e){console.log(e);}

            var payload = sendModel.get('hitPayload');
            var cstream = model.get('trackingId').replace(/\W/g, '').toLowerCase();
            var i, len, endpointsArr = endpoints.split(",");

            for (len = endpointsArr.length, i=0; i<len; ++i) {
                var endpoint = endpointsArr[i];
                var path = ((endpoint.substr(-1) !== '/') ? endpoint + '/' : endpoint)
                var beacon = document.createElement("img");
                beacon.onerror = function(){}; 
                beacon.onload  = function(){}; 
                beacon.src = path + 'gif/?cstream=' + cstream + '&' + payload;
            }
		});
	};
}
# datahem.tracker

Piggy-back on your Google Analytics implementation and send data to your own endpoint (datahem.collector)

## Version
## 0.7.3 (2019-02-15): Fix to send data to datahem endpoint with navigator.sendBeacon()
Added conditions to downgrade gracefully if user agent doesn't support sendbeacon even if it says support it supports sendBeacon.
Also when beacon chosen as tracker method, always send first hit as xmlhttp POST to enable CORS in some browsers

## 0.7.2 (2019-01-15): Fix to send data to datahem endpoint even if GA max payload is exceeded
Wrapped GA sendHitTask in try-catch to allow sending hits to datahem collector even if GA limits are exceeded.

## 0.7.1 (2018-12-14): Fix of measurement protocol img get request path
Added a filename (collect.gif) to img get request path

## 0.7.0 (2018-06-14): Measurement protocol javascript tracker
This release use the cloud endpoint collector as the receiving endpoint of tracker requests. 
The payload is encapsulated as an json object with the key payload if sent as navigator.beacon or ajax POST.
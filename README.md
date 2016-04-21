# ipproxy
Proxy to zero the last octet of the ip-address from Google Analytics client requests to /collect and then 
pass them along to Analytics using the Google Analytics Measurement Protocol.

Mainly useful if you prefer to do ip-address anonymization yourself (e.g. to conform with local legal 
requirements).

## Testing/developing with ipproxy and receiverSim 

Default inital setup is for ipproxy to send data to receiverSim to see that everything is working.

With this setup, nothing is sent to Google.

### Step 1: run ipproxy

```bash
# Shell 1: ipproxy
# in cloned repository root
npm install
node server.js 
```

Console should end with a line similar to:

```bash
2015-03-04T13:03:22.630Z - ipproxy app listening at http://0.0.0.0:8080
```

Follow ipproxy.log and ipproxyAccess.log to see that things are working.

To access ipproxy (on localhost):
http://localhost:8080

### Step 2: run receiverSim (in place of Google)

```bash
# Shell 2: receiverSim
# in cloned repository root
cd test/receiverSim/
npm install
node server.js 
```

Console should end with a line similar to:

```bash
receiverSim app listening at http://0.0.0.0:9080
```

Follow receiverSim.log and receiverSimAccess.log to see that things are working.

To access receiverSim:
http://localhost:9080

### Step 3: Set up tracker to hit ipproxy instead of Google

Set up your Universal Analytics tracker to hit ipproxy instead of Google (e.g. http://localhost:8080/collect 
instead of http://www.google-analytics.com/collect ).

This can be done by replacing sendHitTask (based on documentation in 
https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks).

Note that localhost as hostname will only work on with a browser on the same computer as where ipproxy 
is running.

```javascript
ga('create', 'UA-XXXXX-Y', 'auto');

ga(function(tracker) {

  // Modifies sendHitTask to hit ipproxy instead of http://www.google-analytics.com directly
  tracker.set('sendHitTask', function(model) {
    payload = model.get('hitPayload');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:8080/collect' +'?' + payload, true);
    xhr.send();
  });

ga('send', 'pageview');
```

## Using ipproxy with Google Analytics

### Step 1: run ipproxy with config set to pass data to Google

```bash
# Shell 1: ipproxy
# in cloned repository root
npm install
node server.js --configPath=config-8080-to-google.json
```

Note that you need to be running ipproxy on a public hostname:port so that users browsers can access it.

### Step 2: Set up tracker to hit ipproxy instead of Google

#### Set up one tracker (default) and send pageview

Set up your Universal Analytics tracker to hit ipproxy instead of Google 
(e.g. http://ipproxy-hostname.yourdomain.somewhere:8080/collect instead of
 http://www.google-analytics.com/collect ).

This can be done by replacing sendHitTask (based on documentation in 
https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks).

Note that there is a separate sendHitTask for each tracker, so this code only works for the default tracker. 

```javascript
ga('create', 'UA-XXXXX-Y', 'auto');

ga(function(tracker) {

  // Modifies sendHitTask to hit ipproxy instead of http://www.google-analytics.com directly
  tracker.set('sendHitTask', function(model) {
    payload = model.get('hitPayload');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://ipproxy-hostname.yourdomain.somewhere:8080/collect' +'?' + payload, true);
    xhr.send();
  });

  ga('send', 'pageview');
});

```
#### Set up multiple trackers and send pageview to all of them

There is a separate sendHitTask for each tracker.

```javascript
ga('create', 'UA-XXXXX-Y', 'auto',  {'name': 'testTracker1'});
ga('create', 'UA-XXXXX-Z', 'auto',  {'name': 'testTracker2'});

// Only execute when everything is set up (Asynchronous Synchronization)
ga(function () {
  var i;
  var trackers = ga.getAll();

  // Modify sendHitTask for all trackers
  for (i = 0; i < trackers.length; i++) {
    var tracker = trackers[i];

    // Set anonymizeIp as a fallback
    tracker.set('anonymizeIp', true); // with this, should get aip=1 for hits

    // Modifies sendHitTask for tracker to send the request to a local ipproxy server, which passes it on to
    // www.google-analytics.com/collect after ip anonymization
    tracker.set('sendHitTask', function (model) {
      var payload = model.get('hitPayload');
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://ipproxy-hostname.yourdomain.somewhere:8080/collect' + '?' + payload, true);
      xhr.send();
    });
  }

  // Send asynchronous 'pageview' for all trackers
  for (i=0; i < trackers.length; ++i) {
    tracker = trackers[i];
    ga(tracker.get('name') + '.send', 'pageview');
  }

});
```






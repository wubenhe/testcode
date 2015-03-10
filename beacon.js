(function (window) {

  var url = 'http://104.154.33.188:8000/beacon/',
    signals = {},
    requestSended = false,
    timer = null,
    options = {timeout:60000};

  var setClientData = function () {
    var context = window.similityContext || null;
    if(context) {
      signals.sessionId = context.similitySessionId;
      signals.clientId = context.similityClientId;
      signals.onlyLiteSignals = false;
      if (context.similityLite !== null) {
        signals.onlyLiteSignals = context.similityLite;
      }
      var  clientMetadata = {};
      try {
        clientMetadata = JSON.parse(context.similityMetadata);
      } catch (e) {
        clientMetadata = {};
      }
      var key = '',
        fieldName = '';
      for (key in clientMetadata) {
        if (clientMetadata.hasOwnProperty(key)) {
          fieldName = "metadata" + key[0].toUpperCase() + key.substring(1);
          signals[fieldName] = clientMetadata[key];
        }
      }
    }
  };

  var setStaticData = function () {
    var context = window.similityContext,
      nav = window.navigator;

    signals.appCodeName = nav.appCodeName;
    signals.appName = nav.appName;
    signals.appVersion = nav.appVersion;
    signals.cookieEnabled = nav.cookieEnabled;
    signals.dartEnabled = nav.dartEnabled;
    signals.doNotTrack = nav.doNotTrack;
    signals.hardwareConcurrency = nav.hardwareConcurrency;
    signals.language = nav.language;
    signals.languages = nav.languages;
    signals.maxTouchPoints = nav.maxTouchPoints;
    signals.onLine = nav.onLine;
    signals.platform = nav.platform;
    signals.product = nav.product;
    signals.productSub = nav.productSub;
    signals.userAgent = nav.userAgent;
    signals.vendor = nav.vendor;
    signals.vendorSub = nav.vendorSub;
    //signals.numPlugins = context.navigator.plugins.length;
  };

  var setLocationData = function(skipGeoData) {
    // set the geo location timeout at 60 seconds
    var options = options,
      nav = window.navigator;
    signals.lattitude = null;
    signals.longitude = null;
    signals.accuracy = null;
    signals.altitude = null;
    signals.altitudeAccuracy = null;
    signals.heading = null;
    signals.speed = null;

    if (!skipGeoData && nav.geolocation) {

      nav.geolocation.getCurrentPosition(function (position) {
        var coords = position.coords;
        signals.lattitude = coords.latitude;
        signals.longitude = coords.longitude;
        signals.accuracy = coords.accuracy;
        signals.altitude = coords.altitude;
        signals.altitudeAccuracy = coords.altitudeAccuracy;
        signals.heading = coords.heading;
        signals.speed = coords.speed;
        console.log('geo success');
        sendFinalHttpRequest();
      }, function(){
        console.log('geo fail');
        sendFinalHttpRequest();
      }, options);
    } else {
      console.log('geo not found');
      sendFinalHttpRequest();
    }
  };

  var sendImageRequest = function() {
    if(!requestSended) {
      console.log('image send');
      clearTimeout(timer);
      requestSended = true;
      var n = new Image(1, 1);
      n.src = url+'?'+serializeString(signals);
    }
  };

  var serializeString = function(obj) {
    var str = [],
      p = '';
    for(p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    }
    return str.join("&");
  };

  setClientData();
  setStaticData();
  setLocationData(signals.onlyLiteSignals);
  timer = setTimeout(sendImageRequest, options.timeout);

})(window);

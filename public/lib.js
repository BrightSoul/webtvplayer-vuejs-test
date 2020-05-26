(function() {
  var instances = [];
  var webTvPlayer = function WebTvPlayer(container, videoIdOrJwt, options) {
      webTvPlayer.apiKey = "c1b73933-618f-43bc-88f3-29f449fe3dcd";
      //#region Initialization
      validateContainer(container);
      validateOptions(options);
      options = mergeOptions(options, webTvPlayer.defaultOptions);
      exposePublicApi(this);
      initializePrivateMembers(this);
      invoke(initialize, [videoIdOrJwt]);
      invoke(registerInstance, []);
      dispatchDomEvent(this, container);
      //#endregion
  
  
      //#region public api
      function exposePublicApi(instance) {
          Object.defineProperty(instance, 'options', {
              get: function() { return cloneObject(options, ['overrides', 'skinOptions']); },
              configurable: false
          });
          
          Object.defineProperty(instance, 'id', {
              get: function() { return currentId; },
              configurable: false
          });
  
          Object.defineProperty(instance, 'container', {
              get: function() { return container; },
              configurable: false
          });
  
          Object.defineProperty(instance, 'status', {
              get: function() { return status; },
              configurable: false
          });
  
          Object.defineProperty(instance, 'segments', {
              get: function() {
                  if (!this.options.segment || this.options.segment <= 0 || !this.duration) {
                      return null;
                  }
                  return Math.ceil(this.duration / this.options.segment);
               },
              configurable: false
          });
  
          Object.defineProperty(instance, 'duration', {
              get: function()
              {
                  if (!player || !player.getDuration || !player.getDuration()) {
                      return null;
                  }
                  return Math.min(player.getDuration(), options.to || Number.POSITIVE_INFINITY) - Math.max(0, options.from || 0);
              },
              configurable: false
          });
  
          Object.defineProperty(instance, 'position', {
              get: function() {
                  if (!player || !player.getPosition || !player.getDuration || isNaN(player.getPosition()) || !player.getDuration()) {
                      return null;
                  };
                  var position = player.getPosition();
                  return Math.min(this.duration, Math.max(0, position - (options.from || 0)));
              },
              set: function(value) {
                  if (!player || !player.seek || !player.getDuration || !player.getDuration()) {
                      return;
                  }
                  value += Math.max(0, options.from || 0);
                  value = Math.min(value, player.getDuration());
                  player.seek(value);
              },
              configurable: false
          });
  
          Object.defineProperty(instance, 'resolution', {
              get: function() { 
                  if (!player || !player.getVisualQuality) {
                      return null;
                  }
                  var quality = player.getVisualQuality();
                  if (!quality || !quality.level) {
                      return null;
                  }
                  return { width: quality.level.width, height: quality.level.height };
              },
              configurable: false
          });
  
          Object.defineProperty(instance, 'mute', {
              get: function() { return (player && player.getMute) ? player.getMute() : null; },
              set: function(value) { if (player && player.setMute) player.setMute(value); },
              configurable: false
          });
  
          Object.defineProperty(instance, 'fullscreen', {
              get: function() { return invoke(isFullscreen); },
              set: function(value) { invoke(toggleFullscreen, [value]); },
              configurable: false
          });
  
          Object.defineProperty(instance, 'qualities', {
              get: function() { return (player && player.getQualityLevels) ? player.getQualityLevels() : null; },
              configurable: false
          });
  
          Object.defineProperty(instance, 'metadata', {
              get: function() { 
                  return metadata ? cloneObject(metadata, webTvPlayer.supportedMetadata) : null; },
              configurable: false
          });
  
          Object.defineProperty(instance, 'volume', {
              get: function() { return (player && player.getVolume) ? player.getVolume()/100 : null; },
              set: function(value) { if (player && player.setVolume) player.setVolume(Math.max(0, Math.min(100, value * 100))); },
              configurable: false
          });
  
          Object.defineProperty(instance, 'speed', {
              get: function() { return (player && player.getPlaybackRate) ? player.getPlaybackRate() : null; },
              set: function(value) { if (player && player.pause && player.setPlaybackRate) {
                  if (value < 0.25) {
                      player.pause();
                  } else {
                      player.setPlaybackRate(value);
                  }
              } },
              configurable: false
          });
  
          Object.defineProperty(instance, 'quality', {
              get: function() { return (player && player.getCurrentQuality) ? player.getCurrentQuality() : null; },
              set: function(value) { if (player && player.setCurrentQuality) player.setCurrentQuality(value); },
              configurable: false
          });
  
          exposePublicFunctions(instance, [
              on,
              off,
              play,
              stop,
              pause,
              update,
              destroy,
              load
          ]);
      
          function exposePublicFunctions(instance, functions) {
              for (var i = 0; i < functions.length; i++) {
                  var getter = (function(f){
                      return function() {
                          return function() {
                              var args = [];
                              for (var j = 0; j < arguments.length; j++) {
                                  args.push(arguments[j]);
                              }
                              invoke(f, args);
                          };
                      };
                  })(functions[i]);
                  Object.defineProperty(instance, getFunctionName(functions[i]), {
                      get: getter,
                      configurable: false
                  });
              }
          }
      }
      //#endregion
  
      //#region Event Handlers
      function wireEvents() {
          invoke(off, ['initialize', null, sdkCallbackContainer]);
          invoke(off, ['loading', null, sdkCallbackContainer]);
          invoke(off, ['ready', null, sdkCallbackContainer]);
          invoke(off, ['resolve', null, sdkCallbackContainer]);
  
          //Wire events
          invoke(on, ['initialize', onInitialize, sdkCallbackContainer]);
          invoke(on, ['loading', onLoading, sdkCallbackContainer]);
          invoke(on, ['ready', onReady, sdkCallbackContainer]);
          invoke(on, ['resolve', onResolve, sdkCallbackContainer]);
      }
      
      //All dependencies have been loaded, now we render the player and the skin
      function onInitialize(id) {
          if (!skin) {
              skin = invoke(createSkin, [skinBaseUrl]);
          }
          invoke(subscribeFullscreenEvents);
          //invoke(renderPlayer);
          invoke(renderSkin);
          //Let the sdk notify all subscriptors first, and then we move on
          setTimeout(function() {
              invoke(raise, ['ready', id]);
          }.bind(this), 0);
      }
  
      function onReady(id) {
          if (id) {
              invoke(load, [id, options.from, options.to]);
          }
      }
  
      function onLoading(id) {
          invoke(resolve, [id]);
      }
  
      function onResolve(video, id) {
          var sources = [];
          if (!video || !video.sources || !video.sources.length) {
              throw "Couldn't play video: no sources were found";
          }
          for (var i = 0; i < video.sources.length; i++) {
              sources.push({ file: video.sources[i] });
          }
          player.setup({
              sources: sources,
              image: video.poster,
              controls: false,
              //withCredentials: isJwt(id),
              withCredentials: webTvPlayer.withCredentials,
              width: '100%',
              aspectratio: '16:9',
              debug: false
          });
          player.once('meta', function() { //'ready' would be too early. Position has not been determined yet
              invoke(raise, ['load']);
          });
          player.on('play', function() {
              invoke(raise, ['buffer', false, player.getBuffer()]);
              invoke(raise, ['play']);
          });
          player.on('pause', function() {
              if (player.getPosition() == Math.max(0, options.from || 0)) {
                  invoke(raise, ['stop']);
              } else {
                  invoke(raise, ['pause']);
              }
              
          });
          //Not working??
          //player.on('complete', function() {
              //invoke(raise, ['end']);
          //});
          player.on('idle', function() {
              invoke(raise, ['buffer', false, player.getBuffer()]);
              invoke(updateStatus, ['stop']);
          });
          player.on('mute', function(state) {
              invoke(raise, ['mute', state.mute]);
          });
          player.on('volume', function(state) {
              invoke(raise, ['volume', state.volume / 100]);
          });
          player.on('levelsChanged', function(state) {
              invoke(raise, ['quality', state.currentQuality]);
          });
          player.on('levels', function(state) {
              invoke(raise, ['qualities', state.levels, state.currentQuality]);
          });
          player.on('playbackRateChanged', function(state) {
              invoke(raise, ['speed', state.playbackRate]);
          });
          player.on('buffer', function(state) {
              invoke(raise, ['buffer', state.newstate == 'buffering', player.getBuffer()]);
          });
          player.on('bufferChange', function(state) {
              invoke(raise, ['buffer', player.getState() == 'buffering', state.bufferPercent]);
          });
          player.on('time', function(state) {
              invoke(handlePosition, []);
              invoke(handleProgress, [state.position, state.duration, secondsWatched]);
          });
  
          //Load metadata
          var metadataList = invoke(listMetadata, [this.options.metadata, id]);
          invoke(loadMetadata, [metadataList]);
      }
  
      function isJwt(value) {
          if ((!value) || typeof(value) != 'string') {
              return false;
          }
          return value.split('.').length == 3;
      }
      //#endregion
  
  
      //#region protected methods
      function initialize(id) {
          //Remove any previous event handler
          invoke(wireEvents);
  
          //Perform initialization
          var dependencies = invoke(listDependencies);
          invoke(loadDependencies, [dependencies, id]);
      }
  
      function listDependencies() {
          var dependencies = {
              js: [
                  { 
                      test: function() { return ('jwplayer' in window) && (window.jwplayer.version.substr(0, webTvPlayer.jwplayerVersion.length) == webTvPlayer.jwplayerVersion); },
                      src: webTvPlayer.apiUrl + 'embed/jwplayer/v' + webTvPlayer.jwplayerVersion + '/jwplayer.js'
                  }
              ]
          };
          if ((skin == null) && (typeof(options.skin) == 'string')) {
              skinBaseUrl = webTvPlayer.apiUrl + 'embed/skins/' + options.skin + '/';
              dependencies.js.push({
                  test: function() { return options.skin in window; },
                  src: skinBaseUrl + 'skin.js'
              });
          }
          return dependencies;
      }
  
      function loadDependencies(dependencies, id) {
          var dependenciesLoaded = 0;
          
          for (var i = 0; i < dependencies.js.length; i++) {
              if (dependencies.js[i].test()) {
                  dependenciesLoaded++;
                  continue;
              }
  
              var script = document.createElement("script");
              script.onload = function() {
                  dependenciesLoaded++;
                  raiseInitializeIfNeeded(id);
              };
              script.src = dependencies.js[i].src;
              document.body.appendChild(script);
          }
          raiseInitializeIfNeeded(id);
  
          function raiseInitializeIfNeeded(id) {
              if (dependenciesLoaded == dependencies.js.length) {
                  invoke(raise, ['initialize', id]);
                  dependenciesLoaded = NaN;
              }
          }
      }
  
      function listMetadata(requestedMetadata, id) {
          var metadataList = [];
          requestedMetadata = requestedMetadata || [];
  
          if (requestedMetadata.indexOf('speakers') > -1) {
              metadataList.push({
                  urls: [webTvPlayer.apiUrl + 'videos/' + id + '/speakers'],
                  successCallback: function onSpeakersSuccess(speakers) {
                      metadata.speakers = speakers.results;
                      invoke(raise, ['metadata', 'speakers',  this.metadata.speakers]);
                      invoke(raise, ['metadata.speakers', this.metadata.speakers]);
                  },
                  failureCallback: function onSpeakersFailure(error) {
                      metadata.speakers = null;
                      throw "Couldn't fetch 'speakers' metadata: " + error;
                  }
              });
          }
  
          if (requestedMetadata.indexOf('markers') > -1) {
              metadataList.push({
                  urls: [
                      webTvPlayer.apiUrl + 'videos/' + id + '/event-markers',
                      webTvPlayer.apiUrl + 'videos/' + id + '/speech-markers'
                  ],
                  successCallback: function onMarkersSuccess(eventMarkers, speechMarkers) {
                      var mergedMarkers = [];
                      mergedMarkers = mergedMarkers.concat(speechMarkers.results.map(function(marker) {
                          return {
                              id: marker.id,
                              type: 'intervento',
                              offset: marker.offset / 1000,
                              enabled: marker.enabled,
                              description: marker.description,
                              speakerId: marker.speakerId,
                              parentEventMarkerId: marker.parentEventMarkerId                            
                          }
                      }));
                      mergedMarkers = mergedMarkers.concat(eventMarkers.results.map(function(marker) {
                          return {
                              id: marker.id,
                              type: marker.type,
                              offset: marker.offset / 1000,
                              enabled: marker.enabled,
                              description: marker.description
                          }
                      }));
  
                      mergedMarkers.sort(function(a,b) {
                          if (a.offset != b.offset) {
                              return a.offset-b.offset;
                          }
                          return a.id - b.id;
                      });
                      metadata.markers = mergedMarkers;
                      invoke(raise, ['metadata', 'markers',  this.metadata.markers]);
                      invoke(raise, ['metadata.markers', this.metadata.markers]);
                  },
                  failureCallback: function onMarkersFailure(error) {
                      metadata.markers = null;
                      throw "Couldn't fetch 'markers' metadata: " + error;
                  }
              });
          }
  
          if (requestedMetadata.indexOf('transcription') > -1) {
              metadataList.push({
                  urls: [webTvPlayer.apiUrl + 'videos/' + id + '/transcription'],
                  successCallback: function onTranscriptionSuccess(transcription) {
                      metadata.transcription = transcription.results;
                      invoke(raise, ['metadata', 'transcription',  this.metadata.transcription]);
                      invoke(raise, ['metadata.transcription', this.metadata.transcription]);
                  },
                  failureCallback: function onTranscriptionFailure(error) {
                      metadata.transcription = null;
                      throw "Couldn't fetch 'transcription' metadata: " + error;
                  }
              });
          }
  
         return metadataList;
      }
  
      function loadMetadata(metadataList) {
          for(var i = 0; i < metadataList.length; i++) {
              invoke(loadMetadataItem , [metadataList[i]]);
          }
      }
  
      function loadMetadataItem(metadataItem) {
          var urls = metadataItem.urls.slice(0);
          var results = [];
  
          performMetadataLoad(urls, results, metadataItem.successCallback, metadataItem.failureCallback);
  
          function performMetadataLoad(urls, results, successCallback, failureCallback) {
              if (!urls || !urls.length) {
                  invoke(successCallback, results);
                  return;
              }
              var url = urls.shift();
  
              function successCallbackProxy(result) {
                  results.push(result);
                  performMetadataLoad(urls, results, successCallback, failureCallback);
              };
  
              // request('GET', url, null, successCallbackProxy, failureCallback);
              successCallbackProxy({"id":1,"sources":["https:\/\/58e61d1eb5afb.streamlock.net\/vod-edge\/_definst_\/mp4:archive\/demo\/BigBuckBunny.mp4\/playlist.m3u8"],"poster":"https:\/\/tv.civicam.it\/lib\/ente_10\/live_1\/live_1_poster.jpg"})
          }
      }
  
      function on(eventName, callback, callbackContainer) {
          if (!eventName || !callback) {
              throw "You must provide an event name and a callback when subscribing an event";
          }
          callbackContainer = callbackContainer || publicCallbackContainer;
          if (!(eventName in callbackContainer)) {
              callbackContainer[eventName] = [];
          }
          if (callbackContainers.indexOf(callbackContainer) < 0) {
              callbackContainers.push(callbackContainer);
          }
          callbackContainer[eventName].push(callback);
          if (eventName == 'ready' && isReady) {
              callback.apply(this, []);
          }
      }
  
      function off(eventName, callback, callbackContainer) {
          callbackContainer = callbackContainer || publicCallbackContainer;
          if (!(eventName in callbackContainer)) {
              return;
          }
          if (!callback) {
              delete callbackContainer[eventName];
              return;
          }
          var callbacks = callbackContainer[eventName];
          var callbackIndex;
          while ((callbackIndex = callbacks.indexOf(callback)) > -1) {
              callbacks.splice(callbackIndex, 1);
          }
      }
  
      function raise(eventName) {
          //Statuses initializing, ready, loading, seeking, playing, stopped, paused or error
          var args = [];
          for (var i = 1; i < arguments.length; i++) {
              args[i-1] = arguments[i];
          }
  
          invoke(updateStatus, [eventName].concat(args));
          for (var i = 0; i < callbackContainers.length; i++) {
              var callbacks = callbackContainers[i];
              if (eventName in callbacks)
              {
                  for (var j = 0; j < callbacks[eventName].length; j++) {
                      callbacks[eventName][j].apply(this, args);
                  }
              }
          }
      }
  
      function updateStatus(eventName) {
          switch (eventName) {
              case 'initialize':
                  status = 'initializing';
                  break;
              case 'ready':
                  status = 'ready';
                  break;
              case 'loading':
                  status = 'loading';
                  break;
              case 'error':
                  status = 'error';
                  break;
              case 'end':
              case 'stop':
              case 'load':
                  status = 'stopped';
                  break;
              case 'pause':
                  status = 'paused';
                  break;
              case 'play':
                  //TODO: is this necessary?
                  //status = 'buffering';
                  status = 'playing';
                  break;
              case 'buffer':
                  if (arguments[1])
                  {
                      status = 'buffering';
                  } else if (player.getState() == 'playing')
                  {
                      status = 'playing';
                  }
                  break;
          }
      }
  
      function toggleFullscreen(state) {
          if (state === invoke(isFullscreen)) {
              return;
          }
          var elem = this.container;
          var document = this.container.ownerDocument;
  
          if (state) {
              var isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;
              if (isIOS) {
                  var videoElement = null;
                  if (elem.querySelector) {
                      videoElement = elem.querySelector('video');
                  }
                  if (videoElement && videoElement.webkitRequestFullscreen) {
                      videoElement.webkitRequestFullscreen();
                  } else if (videoElement && videoElement.webkitEnterFullscreen) {
                      videoElement.webkitEnterFullscreen();
                  }
              } else {
                  if (elem.requestFullscreen) {
                      elem.requestFullscreen();
                  } else if (elem.msRequestFullscreen) {
                      elem.msRequestFullscreen();
                  } else if (elem.mozRequestFullScreen) {
                      elem.mozRequestFullScreen();
                  } else if (elem.webkitRequestFullscreen) {
                      elem.webkitRequestFullscreen();
                  }
              }
          } else {
              if (document.exitFullscreen) {
                  document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                  document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                  document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                  document.webkitExitFullscreen();
                }
          }
      }
  
      function isFullscreen() {
          var document = this.container.ownerDocument;
          return this.container == (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      }
      
      function getFunctionName(func) {
          if (func.name) {
              return func.name;
          }
          return func.toString().match(/^function\s*([^\s(]+)/)[1];
      }

      function handlePosition() {
          var percentage = this.duration > 0 ? (this.position / this.duration * 100) : 0;
          invoke(raise, ['position', this.position, percentage]);
      }
  
      function handleProgress(position, duration, secondsWatched) {
          var start = options.from || 0;
          var end = options.to || duration;
          duration = end - start;
          var atEnd = false;
  
          if (position >= end) {
              position = end;
              atEnd = true;
          } else if (position < start) {
              position = start;
              player.seek(start);
          }
  
          var currentSecond = Math.floor(position - start);
          var currentDuration = Math.max(1, Math.floor(duration));
  
          if (previousSecond != currentSecond) {
              previousSecond = currentSecond;
              var percentage = invoke(getPercentageFromFragmentsWatched, [currentSecond, currentDuration, secondsWatched]);
              invoke(raisePercentage, [percentage]);
              invoke(raiseProgress, [currentSecond, currentDuration, percentage, secondsWatched]);
          }
  
          if (atEnd) {
              invoke(stopPlayer);
              invoke(raise, ['end']);
          }
      }
  
      function raisePercentage(percentage) {
          percentage = Math.floor(percentage);
          while (previousPercentage < percentage) {
              previousPercentage++;
              invoke(raise, ['percentage', previousPercentage]);
          }
      }
  
      function raiseProgress(position, duration, percentage, secondsWatched) {
          if (!options.segment) {
              return;
          }
          var currentIndex = Math.floor(position / options.segment);
          
          var startOffset = currentIndex * options.segment;
          var endOffset = Math.min(startOffset + options.segment - 1, duration);
  
          if ((position == endOffset) && ((previousOffset == startOffset) || (startOffset == endOffset))) {
              if (invoke(hasWatchedAllSeconds, [startOffset, endOffset, secondsWatched])) {
  
                  currentIndex = Math.min(currentIndex, Math.ceil(duration / options.segment));
                  invoke(raise, ['progress', currentIndex, startOffset, endOffset, percentage ]);
              }
          }
  
          if (position == startOffset) {
              previousOffset = startOffset;
          }
          
      }
  
      function hasWatchedAllSeconds(start, end, ranges) {
          for (var i = 0; i < ranges.length; i++) {
              if ((ranges[i].start <= start) && (ranges[i].end >= end)) {
                  return true;
              }
          }
          return false;
      }
  
      function getPercentageFromFragmentsWatched(position, duration, ranges) {
          if (duration <= 0) {
              return 0;
          }
          var totalWatched = 0;
          var rangeStart = Number.POSITIVE_INFINITY;
          var rangeEnd = Number.NEGATIVE_INFINITY;
  
          var mergeIndexes = [];
          for (var i = 0; i < ranges.length; i++) {
              if (((ranges[i].start-1) <= position) && ((ranges[i].end+1) >= position)) {
                  if (mergeIndexes.length == 0) {
                      ranges[i].start = Math.min(ranges[i].start, position);
                      ranges[i].end = Math.max(ranges[i].end, position);
                  }
                  rangeStart = Math.min(rangeStart, ranges[i].start);
                  rangeEnd = Math.max(rangeEnd, ranges[i].end);
                  mergeIndexes.push(i);
              }
          }
          if (mergeIndexes.length == 0) {
              ranges.push({start: position, end: position});
          }
          if (mergeIndexes.length >= 2) {
              //Merge!
              ranges[mergeIndexes[0]].start = rangeStart;
              ranges[mergeIndexes[0]].end = rangeEnd;
              for (var i = mergeIndexes.length-1; i > 0; i--) {
                  ranges.splice(mergeIndexes[i], 1);
              }
          }
          for (var i = 0; i < ranges.length; i++) {
              totalWatched += ranges[i].end - ranges[i].start + 1;
          }
          var actualPercentage = (totalWatched / duration) * 100;
          return Math.max(0, Math.min(100, actualPercentage));
      }
  
      function getCurrentId(id) {
          if (id == null || id == undefined) {
              return null;
          } else if (!isJwt(id)) {
              return id.toString();
          }
          try {
              var payload = id.split('.')[1];
              return JSON.parse(atob(payload)).sub;
          } catch (e) {
              return null;
          }
      }
  
      function renderSkin() {
          if (!skin) {
              throw "No skin was selected for the WebTvPlayer, please report this error";
          }
          if (!('render' in skin)) {
              throw "The skin selected for the WebTvPlayer must expose a public 'render' method.";
          }
          var components = invoke(skin.render);
          var playerContainer;
          if (components && ('player' in components)) {
              playerContainer = components['player'];
          } else {
              playerContainer = invoke(createPlayerContainer);
          }
          invoke(styleContainer);
          invoke(renderPlayer, [playerContainer]);
          invoke(renderResizeElement);
      }
  
      function renderPlayer(playerContainer) {
          jwplayer.key = 'X08liIMlreV3m6o6tRG31M3oJJApmyUoo0saI+cuexo=';
          player = jwplayer(playerContainer);
      }
  
      function createPlayerContainer() {
          var playerContainer = document.createElement('div');
          this.container.appendChild(playerContainer);
          return playerContainer;
      }
  
      function styleContainer() {
          switch (this.container.style.position) {
              case 'relative':
              case 'absolute':
              case 'fixed':
              break;
              default:
              this.container.style.position = 'relative';
              break;
          }
          if(!this.container.style.backgroundColor && !this.container.style.backgroundImage) {
              this.container.style.backgroundColor = 'black';
          }
      }
  
      function renderResizeElement() {
          var resizeElement = document.createElement('object');
          resizeElement.setAttribute('style', 'pointer-events: none; background-color: transparent; display: block; position: absolute; overflow: hidden; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%;');
          resizeElement.setAttribute('class', 'webtvplayer-resize')
          resizeElement.onload = function() {
              if (this && this.contentDocument && this.contentDocument.defaultView) {
                  this.contentDocument.defaultView.addEventListener('resize', function() {
                      invoke(raiseResizeEvent, [{width: this.innerWidth, height: this.innerHeight}]);
                  }, false);
                  invoke(raiseResizeEvent, [{width: this.contentDocument.defaultView.innerWidth, height: this.contentDocument.defaultView.innerHeight}]);
              }
          };
          resizeElement.type = 'text/html';
          resizeElement.data = 'about:blank';
          this.container.appendChild(resizeElement);
      }
  
      var previousSize;
      function raiseResizeEvent(size) {
          if (!size || !size.width || !size.height) {
              return;
          }
          if (previousSize && previousSize.width == size.width && previousSize.height == size.height) {
              return;
          }
          previousSize = size;
          invoke(raise, ['resize', size]);
      }
  
      function load(id, from, to) {
          currentId = getCurrentId(id);
          //if (this.status == 'loading') {
              invoke(unload);
          //}
          options.from = from;
          options.to = to;
  
          setTimeout(function() {
              invoke(raise, ['loading', id]);
          }.bind(this), 0);
      }
  
      function unload() {
          //TODO: cancella le richieste pendenti in maniera sincrona
          invoke(stop, []);
      }
  
      function resolve(id) {
          id = (id || '').toString().replace('+', '-').replace('=', '_').replace('/', '~');
          secondsWatched = [];
          previousPercentage = 0;
          previousSecond = -1;
          previousOffset = -1;
          var requestUrl = webTvPlayer.apiUrl + 'videos/' + id + '/sources';
  
          invoke(request, ['GET', requestUrl, null, onResolveSuccess, onResolveFailure]);
  
          function onResolveSuccess(data) {
              var sources = null;
              if (data.sources && data.sources.length > 0) {
                  sources = data;
              }
              invoke(raise, ['resolve', sources, id]);
          };
          function onResolveFailure(error) {
              invoke(raise, ['error', 'Couldn\'t resolve dependencies: ' + error]);
          };
      }
  
      function request(method, url, payload, successCallback, failureCallback)
      {
          var xhr = new XMLHttpRequest();
          xhr.open(method, url, true);
          xhr.withCredentials = true;
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader("Authorization", "ApiKey " + webTvPlayer.apiKey);
          xhr.onreadystatechange = function() { // Call a function when the state changes.
              if (this.readyState === XMLHttpRequest.DONE) {
                  if (this.status >= 200 && this.status < 300) {
                      if (successCallback) {
                          var data = JSON.parse(this.responseText);
                          invoke(successCallback, [data]);
                      }
                  } else if (failureCallback) {
                      invoke(failureCallback, [this.responseText]);
                  }
              }
          };
          if (payload) {
              xhr.setRequestHeader("Content-Type", "application/json");
              if (typeof(payload) != 'string') {
                  payload = JSON.stringify(payload);
              }
          }
          xhr.send(payload);
      }
  
      function play() {
          if (!player) {
              throwEventError(play, 'ready');
          }
  
          if (options.from) {
              var duration = player.getDuration();
              
              if (duration) {
                  if (options.from < duration) {
                      player.seek(options.from);
                  }
                  player.play();
              } else {
                  if (playInterval) {
                      clearInterval(playInterval);
                      playInterval = null;
                  }
                  playInterval = setInterval(function() {
                      var duration = player.getDuration();
                      if (duration) {
                          if (options.from < duration) {
                              player.seek(options.from);
                          }
                          player.play();
                          clearInterval(playInterval);
                          playInterval = null;
                      }
                  }, 200);
              }
          } else {
              //just play
              player.play();
          }
      }
  
      function stop() {
          if (!player) {
              throwEventError(stop, 'ready');
          }
          clearInterval(playInterval);
          playInterval = null;
          invoke(stopPlayer);
      }
  
      function pause() {
          if (!player) {
              throwEventError(pause, 'ready');
          }
          player.pause();
      }
  
      function update() {
          if (skin && skin.update) {
              invoke(skin.update);
          }
      }
  
      function stopPlayer() {
          if (!player) {
              return;
          }
          player.seek(Math.max(0, options.from || 0));
          player.pause();
      }
  
      function subscribeFullscreenEvents() {
          for (var i = 0; i < fullscreenEvents.length; i++) {
              this.container.ownerDocument.addEventListener(fullscreenEvents[i], handleFullscreen, false);
          };
      }
  
      function unsubscribeFullscreenEvents() {
          for (var i = 0; i < fullscreenEvents.length; i++) {
              this.container.ownerDocument.removeEventListener(fullscreenEvents[i], handleFullscreen, false);
          };
      }
  
      function handleFullscreen() {
          setTimeout(function() {
              var state = invoke(isFullscreen);
              invoke(raise, ['fullscreen', state]);
          }, 0);
      }
  
      function destroy() {
          invoke(raise, ['destroy']);
          invoke(unsubscribeFullscreenEvents);
  
          if (player && player.remove) {
              player.remove();
          }
          if (skin && skin.destroy) {
              skin.destroy();
          }
          isReady = false;
          skinBaseUrl = null;
          
          var callbackContainer;
          while (callbackContainers.length > 0) {
              callbackContainer = callbackContainers.pop();
              for (var prop in callbackContainer) {
                  delete callbackContainer[prop];
              }
          }
          this.container.innerHTML = '';
          metadata = {};
      }
  
      function throwEventError(f, eventName) {
          throw "Please wait for the '" + eventName + "' event before invoking the method '" + f.name + "'";
      }
  
      //#endregion
  
      //#region private fields
      var sdkCallbackContainer;
      var publicCallbackContainer;
      var callbackContainers;
      var skin;
      var skinBaseUrl;
      var self;
      var player;
      var isReady;
      var metadata;
      var status;
      var fullscreenEvents;
      var playInterval;
      var currentId;
      var secondsWatched;
      var previousPercentage;
      var previousSecond;
      var previousOffset;
      //#endregion
      
      //#region private methods
      function initializePrivateMembers(instance) {
          playInterval = null;
          isReady = false;
          metadata = {};
          sdkCallbackContainer = {};
          publicCallbackContainer = {};
          callbackContainers = [];
          previousPercentage = [];
          self = instance;
          skin = null;
          skinBaseUrl = null;
          previousPercentage = 0;
          previousSecond = -1;
          previousOffset = -1;
          fullscreenEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'];
          status = 'initializing';
          if (!webTvPlayer.apiKey || !webTvPlayer.apiUrl) {
              throw "The WebTvPlayer was not embedded correctly. Did you miss the apiKey, perhaps?";
          }
      }
  
      function dispatchDomEvent(instance, container) {
          try {
              var evt = document.createEvent('CustomEvent');
              var canBubble = true;
              var cancelable = true;
              var detail = instance;
              evt.initCustomEvent('webtvplayer.create', canBubble, cancelable, detail);
              container.dispatchEvent(evt);
          } catch (e) {
              console.error("Couldn't dispatch WebTvPlayer creation event in the DOM");
          }
      }
      
      function registerInstance() {
          invoke(on, ['destroy', deregisterInstance, sdkCallbackContainer]);
          instances.push(this);
      }
  
      function deregisterInstance() {
          var instanceIndex = null;
          for (var i = 0; i < instances.length; i++) {
              if (instances[i] == this) {
                  instanceIndex = i;
                  break;
              }
          }
          if (instanceIndex !== null) {
              instances.splice(instanceIndex, 1);
          }
      }
  
      function validateContainer(container) {
          if (!container || !('tagName' in container)) {
              throw "The container is not an HTMLElement";
          }
      }
      function validateOptions(options) {
          if (!options) {
              return;
          }
          if ('from' in options) {
              if (isNaN(options.from) || options.from < 0) {
                  throw "The 'from' option has a value of '" + options.from + "' which is not valid.";
              }
          }
          if ('to' in options) {
              if (isNaN(options.to) || options.to < 0) {
                  throw "The 'to' option has a value of '" + options.to + "' which is not valid.";
              }
          }
          if (('from' in options) && ('to' in options)) {
              var to = options.to || Number.MAX_VALUE;
              var from = options.from || 0;
              if (to <= from) {
                  throw "The 'to' option has a value of '" + options.to + "' and it cannot be less or equal to the 'from' option, which has a value of '" + options.from + "'";
              }
          }
  
          if ('segment' in options) {
              if (options.segment !== null) {
                  if (isNaN(options.segment)) {
                      throw "The 'segment' option has a value of '" + options.segment + "' which is not a valid number.";
                  } else if (options.segment < 1) {
                      throw "The 'segment' option has a value of '" + options.segment + "' which is below the minimum allowed value of 1.";
                  } else if (options.segment != Math.floor(options.segment)) {
                      throw "The 'segment' option has a value of '" + options.segment + "' which is not a whole number.";
                  }
              }
          }
  
          if ('metadata' in options) {
              if (options.metadata) {
                  if (!Array.isArray(options.metadata)) {
                      throw "The 'metadata' option must be an array";
                  }
                  var unknownMetadata = options.metadata.filter(function(m) { return webTvPlayer.supportedMetadata.indexOf(m) < 0; });
                  if (unknownMetadata.length > 0) {
                      throw "The 'metadata' option contains unsupported values: '" + unknownMetadata.join(', ') + "'";
                  }
              }
          }
      }
  
      function invoke(f, args) {
          if (!f || typeof(f) != 'function') {
              throw "Cannot invoke: you didn't provide a function but a " + typeof(f) + ".";
          }
          var funcName = getFunctionName(f);
          if (args && !Array.isArray(args)) {
              throw "You must invoke function '" + funcName + "' with an array of parameters, not '" + args.toString() + "'";
          }
          args = args || [];
          if (funcName && (funcName in options.overrides)) {
              args = [f.bind(self)].concat(args);
              return options.overrides[funcName].apply(self, args);
          } else {
              return f.apply(self, args);
          }
      }
  
      function createSkin(skinBaseUrl) {
          var skin = !this.options.skin ? WebTvPlayerChromelessSkin : this.options.skin;
          switch (typeof(skin)) {
  
              case 'function':
                  return invoke(createSkinInstance, [skin, skinBaseUrl]);
  
              case 'string':
                  try {
                      skin = eval(skin);
                      if (typeof(skin) == 'function') {
                          return invoke(createSkinInstance, [skin, skinBaseUrl]);
                      }
                  } catch (e) {
                  }
                  break;
          }
          return null;
  
          function createSkinInstance(skin, skinBaseUrl) {
              //get its options as well
              if (skin && skin.defaultOptions) {
                  var skinOptions = mergeOptions(this.options.skinOptions, skin.defaultOptions);
                  options.skinOptions = skinOptions;
              }
              return new skin(this, skinBaseUrl, invoke);
          }
      }
  
      function mergeOptions(options, defaultOptions) {
          options = options || {};
          var mergedOptions = {};
          for (var option in defaultOptions) {
              mergedOptions[option] = defaultOptions[option];
          }
          for (var option in options) {
              if (option in defaultOptions) {
                  if (Array.isArray(options[option])) {
                      mergedOptions[option] = options[option].slice(0);
                  } else {
                      mergedOptions[option] = options[option];
                  }
              }
          }
          return mergedOptions;
      }
  
      function cloneObject(obj, recurseOn) {
          if (!obj) {
              return null;
          }
          recurseOn = recurseOn || [];
          var cloned = {};
          for (var prop in obj) {
              if (obj[prop] instanceof Array) {
                  var ar = obj[prop].slice(0);
                  if (recurseOn.indexOf(prop) > -1) {
                      for (var i = 0; i < ar.length; i++) {
                          ar[i] = cloneObject(ar[i]);
                      }
                  }
                  cloned[prop] = Object.freeze(ar);
              } else if (obj[prop] instanceof Date) {
                  cloned[prop] = Object.freeze(new Date(obj[prop].getTime()));
              } else if (recurseOn.indexOf(prop) > -1) {
                  cloned[prop] = cloneObject(obj[prop]);
              } else if (typeof(obj[prop]) == 'object') {
                  //Skip any other complex object that we didn't want to recurse on
              } else {
                  cloned[prop] = obj[prop];
              }
          }
          return Object.freeze(cloned);
      }
  
      function WebTvPlayerChromelessSkin() {
          function render () {
              return {
                  'player': invoke(createPlayerContainer)
              }
              function createPlayerContainer() {
                  var playerContainer = this.container.ownerDocument.createElement('div');
                  playerContainer.style.paddingTop = '56.25%';
                  this.container.appendChild(playerContainer);
                  return playerContainer;
              }
          }
  
          Object.defineProperty(this, 'render', {
              get: function() { return render; },
              configurable: false
          });
      }
      //#endregion
  }
  
  Object.defineProperty(webTvPlayer, 'version', {
      get: function() { return "1"; },
      configurable: false
  });
  Object.defineProperty(webTvPlayer, 'instances', {
      get: function() { return instances.slice(0); },
      configurable: false
  });
  Object.defineProperty(webTvPlayer, 'script', {
      get: function() { return "embed/webtvplayer.js"; },
      configurable: false
  });
  Object.defineProperty(webTvPlayer, 'jwplayerVersion', {
      get: function() { return "8.10.1"; },
      configurable: false
  });
  Object.defineProperty(webTvPlayer, 'defaultOptions', {
      get: function() { return {
          segment: 5.0,
          skin: 'WebTvPlayerDefaultSkin',
          from: null,
          to: null,
          skinOptions: null,
          metadata: null,
          overrides: {}
      }; },
      configurable: false
  });
  Object.defineProperty(webTvPlayer, 'supportedMetadata', {
      get: function() { return ['markers', 'transcription', 'speakers']; },
      configurable: false
  });
  webTvPlayer.apiKey = "c1b73933-618f-43bc-88f3-29f449fe3dcd";
  webTvPlayer.apiUrl = null;
  webTvPlayer.withCredentials = false;
  
  registerWebTvPlayerForJquery();
  //if (!exportForRequireJs()) {
  detectWebTvPlayerInfo();
  exportToGlobalNamespace();
  //}
  
  function registerWebTvPlayerForJquery() {
      if (typeof jQuery !== 'undefined') {
          jQuery.fn.webTvPlayer = function() {
              if (!this || !(this.length)) {
                  throw 'The jQuery selector \'' + (this || {}).selector + '\' did not match any HTML element';
              }
              return new webTvPlayer(this[0], arguments[0], arguments[1]);
          };
      }
  }
  
  /*function exportForRequireJs() {
      if (typeof define !== 'undefined') {
          define([], function() {
              return webTvPlayer;
          });
          return true;
      }
      return false;
  }*/
  
  function exportToGlobalNamespace() {
      WebTvPlayer = webTvPlayer;
  }
  
  function detectWebTvPlayerInfo() {
      var scripts = document.getElementsByTagName("script");
      for(i = 0; i < scripts.length; i++)
      {
          var script = scripts.item(i);
          var position = script.src ? script.src.indexOf(webTvPlayer.script) : -1;
          if(position > -1) {
              var urlInfo = parseUrlInfo(script.src, position);
              webTvPlayer.apiUrl = urlInfo.apiUrl;
              webTvPlayer.apiKey = urlInfo.apiKey;
              return;
          }
      }
      function parseUrlInfo(url, position) {
          var regex = new RegExp("apiKey=(.+?)(&|$)");
          var match = regex.exec(url);
          if (!match) {
              return null;
          }
          var apiKey = match[1];
          url = url.split("?")[0];
          url = url.substr(0, position);
          return {
              apiKey: apiKey,
              apiUrl: url
          };
      }
  }
  
  
  })();
var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-step-6-3';
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/styles/inline.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png'
];


self.addEventListener('install', function(e){
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache){
    console.log('[Service Worker] Caching app shell');
    return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e){
  console.log('[Service Worker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList){
      return Promise.all(keyList.map(function(key){
        if( key !== cacheName && key != dataCacheName){
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Corner case
  return self.clients.claim();
});

self.addEventListener('fetch', function(e){
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:

     */
  if(e.request.url.indexOf(dataUrl) > -1){
    e.respondWith(caches.open(dataCacheName).then(function(cache){
      return fetch(e.request).then(function(response){
        cache.put(e.request.url, response.clone());
        return response;
      });

    })

  );
  }
  else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     */
    e.respondWith(
      caches.match(e.request).then(function(response){
        return response || fetch(e.request);
      })
    );
  }

});

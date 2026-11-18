/*
 * Service worker: страница всегда берётся из сети (расписание свежее),
 * а если интернета нет — из кэша, чтобы сайт открывался офлайн.
 * При изменении файлов сайта увеличьте номер версии в CACHE.
 */
var CACHE = 'pgtu-schedule-v6';

var ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './css/styles.css',
  './js/app.js',
  './js/ads.js',
  './js/data.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

var ORIGIN = self.location.origin;

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url;
  try {
    url = new URL(event.request.url);
  } catch (error) {
    return;
  }

  /*
   * Кэшируем только свою статику. Реклама и прочие сторонние запросы
   * идут напрямую в сеть — поэтому в офлайне их просто нет.
   */
  if (url.origin !== ORIGIN) return;
  if (/\/ads\.txt$/.test(url.pathname)) return;

  event.respondWith(
    fetch(event.request).then(function (response) {
      if (response && response.status === 200 && response.type === 'basic') {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(event.request, copy);
        }).catch(function () {});
      }
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});

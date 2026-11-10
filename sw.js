// 앱 화면 파일만 저장한다(오프라인에서도 화면이 열리게). 가계부 데이터(Sheets API·Google 로그인 응답)는 절대 저장하지 않는다.
var CACHE = 'gagebu-viewer-v128-1794319258064';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// 같은 출처의 화면 파일만 다룬다: 먼저 네트워크(새 버전), 안 되면 저장본.
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(function (res) {
    if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); }); }
    return res;
  }).catch(function () { return caches.match(event.request).then(function (hit) { return hit || caches.match('index.html'); }); }));
});

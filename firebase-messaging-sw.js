// firebase-messaging-sw.js — Single unified service worker
// Handles BOTH offline cache AND Firebase push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ── Offline cache ──
const CACHE = 'eid-skin-v9';
const ASSETS = ['/index.html','/manifest.json','/icon.svg','/icon-192.png','/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isHTML = url.pathname === '/' || url.pathname.endsWith('.html');
  e.respondWith(
    isHTML
      ? fetch(e.request).then(r => { if (r && r.status === 200) { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); } return r; }).catch(() => caches.match(e.request))
      : caches.match(e.request).then(c => c || fetch(e.request).then(r => { if (r && r.status === 200) { const cl = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, cl)); } return r; }).catch(() => null))
  );
});

// ── Firebase Messaging ──
firebase.initializeApp({
  apiKey:            "AIzaSyAOfaaDUtJAeA56GuUMqF9JJfrhh7W3PwU",
  authDomain:        "studio-3197135393-11508.firebaseapp.com",
  databaseURL:       "https://studio-3197135393-11508-default-rtdb.firebaseio.com",
  projectId:         "studio-3197135393-11508",
  storageBucket:     "studio-3197135393-11508.firebasestorage.app",
  messagingSenderId: "701895207293",
  appId:             "1:701895207293:web:c7b98b78854dfd71aa8414"
});

const messaging = firebase.messaging();

// Handle background/closed notifications
messaging.onBackgroundMessage(payload => {
  // Read from data field (data-only message) or notification field
  const title = (payload.data && payload.data.title) || (payload.notification && payload.notification.title) || '🌙 Eid Skin Plan';
  const body  = (payload.data && payload.data.body)  || (payload.notification && payload.notification.body)  || 'Time for your skin routine!';
  return self.registration.showNotification(title, {
    body:    body,
    icon:    '/icon-192.png',
    badge:   '/icon-192.png',
    tag:     'eid-reminder',
    vibrate: [200, 100, 200],
    requireInteraction: false
  });
});

// Open app on notification tap
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      for (const c of cs) { if ('focus' in c) return c.focus(); }
      return clients.openWindow('/index.html');
    })
  );
});

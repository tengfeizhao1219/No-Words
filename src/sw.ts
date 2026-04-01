// Service Worker - 简化版（用于 PWA 离线支持）
const CACHE_NAME = 'no-words-cache-v1';

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
      ])
    })
  )
  (self as any).skipWaiting()
})

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  return (self as any).clients.claim()
})

self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

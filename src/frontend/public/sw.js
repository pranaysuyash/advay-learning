const SW_VERSION = "v1";
const STATIC_CACHE = `advay-static-${SW_VERSION}`;
const RUNTIME_CACHE = `advay-runtime-${SW_VERSION}`;
const MODEL_CACHE = `advay-models-${SW_VERSION}`;
const FONT_CACHE = `advay-fonts-${SW_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              ![STATIC_CACHE, RUNTIME_CACHE, MODEL_CACHE, FONT_CACHE].includes(
                key,
              ),
          )
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

function isModelRequest(url) {
  return url.pathname.startsWith("/models/");
}

function isGoogleFontRequest(url) {
  return (
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com"
  );
}

function isStaticAssetRequest(request, url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;
  return (
    ["script", "style", "worker", "font", "image"].includes(
      request.destination,
    ) || url.pathname.startsWith("/assets/")
  );
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw new Error("Network unavailable and no cached fallback found");
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE, "/index.html"));
    return;
  }

  if (isModelRequest(url)) {
    event.respondWith(cacheFirst(request, MODEL_CACHE));
    return;
  }

  if (isGoogleFontRequest(url)) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  if (isStaticAssetRequest(request, url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
  }
});

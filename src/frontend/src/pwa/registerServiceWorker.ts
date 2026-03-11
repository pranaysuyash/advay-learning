export async function registerServiceWorker(): Promise<void> {
  if (import.meta.env.DEV) return;
  if (!("serviceWorker" in navigator)) return;
  if (!window.isSecureContext) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (
          worker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          console.info("[PWA] New app version available; reload to update.");
        }
      });
    });
  } catch (error) {
    console.error("[PWA] Service worker registration failed:", error);
  }
}

(function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.info("Service worker registered", registration.scope);
      })
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });
  });
})();

(function handleInstallPrompt() {
  let deferredPrompt;
  const hint = document.getElementById("start-hint");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (hint && hint.textContent && hint.textContent.includes("arrow")) {
      hint.textContent = "Press any arrow key to start or install from browser menu";
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (hint && hint.textContent && hint.textContent.includes("arrow")) {
      hint.textContent = "Press any arrow key to start";
    }
  });
})();

/* Google Tag Manager bootstrap kept external so the site's CSP can remain strict. */
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  var started = false;
  function start() {
    if (started) return;
    started = true;
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0];
    var j = d.createElement(s);
    var dl = l !== "dataLayer" ? "&l=" + l : "";

    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
  }
  function afterPageLoad() {
    // Keep enquiry/call intent events queued while content finishes loading.
    // Yield a frame before advertising scripts compete for the main thread.
    w.requestAnimationFrame(function () {
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(start, { timeout: 1500 });
      } else {
        w.setTimeout(start, 0);
      }
    });
  }
  if (d.readyState === "complete") afterPageLoad();
  else w.addEventListener("load", afterPageLoad, { once: true });
})(window, document, "script", "dataLayer", "GTM-W59N8ZMC");

(function () {
  "use strict";

  // Keep application details in the POST body and reuse the ID on an unchanged retry.
  document.querySelectorAll("[data-interview-request]").forEach((form) => {
    const phone = form.elements.namedItem("SingleLine1");
    const requestId = form.elements.namedItem("request_id");
    const date = form.elements.namedItem("preferred_date");
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector("[data-interview-status]");
    const isHindi = form.dataset.formLanguage === "hi";
    let submitting = false;
    let lastPayload;

    const refreshDate = () => {
      date.min = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
      }).format(new Date());
    };
    const reset = () => {
      submitting = false;
      button.disabled = false;
      status.textContent = "";
      refreshDate();
    };
    phone.addEventListener("input", () => phone.setCustomValidity(""));
    window.addEventListener("pageshow", reset);
    reset();

    form.addEventListener("submit", (event) => {
      refreshDate();
      if (submitting) {
        event.preventDefault();
        return;
      }
      const compact = phone.value.trim().replace(/[\s()-]/g, "");
      const match = compact.match(/^(?:\+91|0091|91|0)?(\d{10})$/);
      phone.setCustomValidity(match ? "" : (isHindi
        ? "कृपया 10 अंकों का भारतीय मोबाइल नंबर भरें."
        : "Enter a 10-digit Indian mobile number, optionally with +91."));
      for (const name of ["SingleLine", "SingleLine2", "permanent_address"]) {
        form.elements.namedItem(name).value = form.elements.namedItem(name).value.trim();
      }
      if (!form.reportValidity()) {
        event.preventDefault();
        return;
      }
      phone.value = `+91${match[1]}`;
      const data = new URLSearchParams(new FormData(form));
      data.delete("request_id");
      const payload = data.toString();
      if (!requestId.value || payload !== lastPayload) {
        if (!crypto.randomUUID) {
          event.preventDefault();
          status.textContent = isHindi
            ? "कृपया फॉर्म को सुरक्षित वेबसाइट पर किसी नए ब्राउज़र में खोलें."
            : "Please open the form on the secure website in an up-to-date browser.";
          return;
        }
        requestId.value = crypto.randomUUID();
        lastPayload = payload;
      }
      submitting = true;
      button.disabled = true;
      status.textContent = isHindi
        ? "अनुरोध भेजा जा रहा है. अगले पेज पर पुष्टि का इंतजार करें."
        : "Submitting your request. Wait for confirmation on the next page.";
      // The receiver confirms success only after saving the row.
      // Re-enable after a blocked navigation so the candidate can try again.
      window.setTimeout(() => { submitting = false; button.disabled = false; }, 15000);
    });
  });
})();

(function () {
  "use strict";

  // A native POST sends answers to Zoho, without API credentials or personal data in URLs.
  document.querySelectorAll("[data-interview-request]").forEach((form) => {
    const phone = form.elements.namedItem("SingleLine1");
    const details = form.elements.namedItem("MultiLine");
    const date = form.elements.namedItem("preferred_date");
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector("[data-interview-status]");
    const isHindi = form.dataset.formLanguage === "hi";
    let submitting = false;

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
      for (const name of ["SingleLine", "SingleLine2"]) {
        form.elements.namedItem(name).value = form.elements.namedItem(name).value.trim();
      }
      if (!form.reportValidity()) {
        event.preventDefault();
        return;
      }
      phone.value = `+91${match[1]}`;
      const data = new FormData(form);
      details.value = [
        "Entry point: Website interview page (Meta application not required)",
        "Status: Interview requested - awaiting recruiter confirmation",
        `Role: ${data.get("role")}`,
        `Preferred duty area: ${data.get("duty_area")}`,
        `Preferred date: ${data.get("preferred_date")}`,
        `Preferred time (India): ${data.get("preferred_time")}`,
        `Form language: ${isHindi ? "Hindi" : "English"}`,
        "Consent: Candidate agreed to recruitment-related calls/WhatsApp.",
        "Consent version: interview-2026-09-27",
        `Submitted at (browser clock): ${new Date().toISOString()}`,
        "This is a request, not a confirmed appointment."
      ].join("\n");
      submitting = true;
      button.disabled = true;
      status.textContent = isHindi
        ? "अनुरोध भेजा जा रहा है. अगले पेज पर पुष्टि का इंतजार करें."
        : "Submitting your request. Wait for confirmation on the next page.";
      // Do not report success locally: Zoho displays the actual accepted/error response.
      // Re-enable after a blocked navigation so the candidate can try again.
      window.setTimeout(() => { submitting = false; button.disabled = false; }, 15000);
    });
  });
})();

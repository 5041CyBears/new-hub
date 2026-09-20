(() => {
  "use strict";
  const config = window.ROAR_APP_CONFIG || {};
  const form = document.getElementById("roarReportForm");
  const submitButton = document.getElementById("submitRoar");
  const status = document.getElementById("roarStatus");
  const description = document.getElementById("description");
  let submitting = false;
  let widgetId = null;
  let turnstileToken = "";
  let receiptId = null;

  function configured() {
    return /^https:\/\/[^/]+$/.test(config.API_URL || "") &&
      !config.API_URL.includes("YOUR_") &&
      Boolean(config.TURNSTILE_SITE_KEY && !config.TURNSTILE_SITE_KEY.includes("REPLACE_"));
  }

  function setStatus(message, kind = "") {
    status.textContent = message;
    status.className = "roar-status" + (kind ? " " + kind : "");
  }

  function pad(value) { return String(value).padStart(2, "0"); }
  function setReportTime() {
    const now = new Date();
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    document.getElementById("reportDate").value = date;
    document.getElementById("reportTime").value = time;
    document.getElementById("reportDateTimeDisplay").textContent = now.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function updateConditionalFields() {
    document.getElementById("harassmentTypes").hidden = !document.getElementById("harassmentCheck").checked;
    document.getElementById("otherTypeWrap").hidden = !document.getElementById("otherCheck").checked;
  }

  function resetTurnstile() {
    turnstileToken = "";
    if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
  }

  window.onRoarTurnstileLoaded = () => {
    if (!configured()) return;
    widgetId = window.turnstile.render("#roarTurnstile", {
      sitekey: config.TURNSTILE_SITE_KEY,
      action: "roar_report",
      callback(token) { turnstileToken = token; },
      "expired-callback"() { turnstileToken = ""; },
      "error-callback"() { turnstileToken = ""; }
    });
  };

  function formPayload() {
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    payload.receiptId = receiptId;
    payload.turnstileToken = turnstileToken;
    return payload;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submitting) return;
    if (!configured()) return setStatus("The reporting service is not configured. Please tell a trusted adult directly.", "error");
    const categories = ["bullying", "harassment", "sexualHarassment", "misconduct", "retaliation", "discrimination", "safetyConcern", "other"];
    if (!categories.some(name => form.elements[name]?.checked)) {
      setStatus("Select at least one concern type, including Other / unsure if you are uncertain.", "error");
      return;
    }
    if (!form.reportValidity()) return setStatus("Complete the required fields.", "error");
    if (!turnstileToken) return setStatus("Complete the verification check before submitting.", "error");
    if (form.elements.website.value) return setStatus("Unable to submit this report.", "error");
    setReportTime();
    if (!receiptId) receiptId = crypto.randomUUID();
    submitting = true;
    submitButton.disabled = true;
    setStatus("Sending your report…");
    try {
      const response = await fetch(config.API_URL + "/api/reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        mode: "cors", credentials: "omit", body: JSON.stringify(formPayload())
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "The report was not confirmed.");
      receiptId = null;
      form.reset();
      setStatus("Your report was received and stored. If someone may be in danger, contact an adult directly now.", "success");
    } catch (error) {
      setStatus((error.message || "Could not confirm submission.") + " If the problem continues, tell a trusted adult directly. If you retry, the same report will not be added twice.", "error");
    } finally {
      submitting = false;
      submitButton.disabled = !configured();
      resetTurnstile();
    }
  });

  form.addEventListener("input", event => {
    // Editing a report after an uncertain submission makes it a new report.
    if (event.target.name !== "cf-turnstile-response") receiptId = null;
  });
  form.addEventListener("reset", () => {
    receiptId = null;
    setTimeout(() => { setReportTime(); updateConditionalFields(); document.getElementById("descriptionCount").textContent = "0"; }, 0);
  });
  document.getElementById("harassmentCheck").addEventListener("change", updateConditionalFields);
  document.getElementById("otherCheck").addEventListener("change", updateConditionalFields);
  description.addEventListener("input", () => { document.getElementById("descriptionCount").textContent = description.value.length; });
  document.getElementById("resetRoar").addEventListener("click", () => { resetTurnstile(); setStatus("Form cleared."); });

  setReportTime(); updateConditionalFields();
  form.inert = !configured();
  submitButton.disabled = !configured();
  document.getElementById("roarConfigWarning").hidden = configured();
  const adminLink = document.getElementById("roarAdminLink");
  if (configured() && adminLink) {
    adminLink.href = config.API_URL + "/admin";
    adminLink.hidden = false;
  }
})();

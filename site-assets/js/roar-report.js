(function () {
  "use strict";

  const config = window.ROAR_APP_CONFIG || {};
  const form = document.getElementById("roarReportForm");
  const submitButton = document.getElementById("submitRoar");
  const resetButton = document.getElementById("resetRoar");
  const status = document.getElementById("roarStatus");
  const configWarning = document.getElementById("roarConfigWarning");
  const harassmentCheck = document.getElementById("harassmentCheck");
  const harassmentTypes = document.getElementById("harassmentTypes");
  const otherCheck = document.getElementById("otherCheck");
  const otherTypeWrap = document.getElementById("otherTypeWrap");
  const description = document.getElementById("description");
  const descriptionCount = document.getElementById("descriptionCount");
  const sheetLink = document.getElementById("roarSheetLink");
  const reportDate = document.getElementById("reportDate");
  const reportTime = document.getElementById("reportTime");
  const reportTitle = document.getElementById("reportTitle");
  const dateTimeDisplay = document.getElementById("reportDateTimeDisplay");

  let submitting = false;
  let lastHealthOkAt = 0;
  const HEALTH_CACHE_MS = 5 * 60 * 1000;

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function setReportTime() {
    const now = new Date();
    const dateValue = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeValue = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    if (reportDate) reportDate.value = dateValue;
    if (reportTime) reportTime.value = timeValue;
    if (reportTitle) reportTitle.value = `ROAR Report - ${dateValue} ${timeValue}`;
    if (dateTimeDisplay) {
      dateTimeDisplay.textContent = now.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
      });
    }
  }

  function updateConditionalFields() {
    if (harassmentTypes) harassmentTypes.hidden = !(harassmentCheck && harassmentCheck.checked);
    if (otherTypeWrap) otherTypeWrap.hidden = !(otherCheck && otherCheck.checked);
  }

  function updateDescriptionCount() {
    if (description && descriptionCount) {
      descriptionCount.textContent = String(description.value.length);
    }
  }

  function hasReportType() {
    return Boolean(
      form &&
      form.querySelector(
        'input[name="bullying"]:checked, input[name="harassment"]:checked, input[name="sexualHarassment"]:checked, input[name="misconduct"]:checked, input[name="retaliation"]:checked, input[name="discrimination"]:checked, input[name="safetyConcern"]:checked, input[name="other"]:checked'
      )
    );
  }

  function backendConfigured() {
    return typeof config.SCRIPT_URL === "string" && /^https:\/\/script\.google\.com\//.test(config.SCRIPT_URL.trim());
  }

  function updateBackendState() {
    const configured = backendConfigured();
    if (configWarning) configWarning.hidden = configured;
    if (submitButton) submitButton.disabled = !configured;
    if (sheetLink && config.SHEET_URL) sheetLink.href = config.SHEET_URL;
  }

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = "roar-status" + (type ? ` ${type}` : "");
  }

  function setSubmitting(value) {
    submitting = value;
    if (!submitButton) return;
    submitButton.disabled = value || !backendConfigured();
    submitButton.textContent = value ? "Submitting…" : "Submit ROAR Report";
  }

  function createReceiptId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `roar-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }

  function jsonp(action, extraParams, timeoutMs) {
    return new Promise((resolve, reject) => {
      if (!backendConfigured()) {
        reject(new Error("The reporting backend is not configured."));
        return;
      }

      const callbackName = `roarJsonp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const script = document.createElement("script");
      const params = new URLSearchParams({ action, callback: callbackName, ...(extraParams || {}) });
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error("The reporting server did not answer the connection check."));
      }, timeoutMs || 10000);

      function cleanup() {
        window.clearTimeout(timer);
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
        script.remove();
      }

      window[callbackName] = (payload) => {
        cleanup();
        resolve(payload || {});
      };

      script.onerror = () => {
        cleanup();
        reject(new Error("The reporting server could not be reached. Check the Apps Script deployment access settings."));
      };

      script.src = `${config.SCRIPT_URL.trim()}?${params.toString()}`;
      document.body.appendChild(script);
    });
  }

  async function healthCheck(showSuccess) {
    try {
      const result = await jsonp("health", {}, 12000);
      if (!result.ok) {
        throw new Error(result.error || "The reporting server cannot access the ROAR spreadsheet.");
      }
      lastHealthOkAt = Date.now();
      if (showSuccess) setStatus("Reporting server connected and ready.", "success");
      return true;
    } catch (error) {
      lastHealthOkAt = 0;
      setStatus(
        `${error.message} The Apps Script web app should be deployed as “Execute as: Me” and “Who has access: Anyone.”`,
        "error"
      );
      return false;
    }
  }

  function recentHealthCheckIsGood() {
    return lastHealthOkAt > 0 && (Date.now() - lastHealthOkAt) < HEALTH_CACHE_MS;
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function waitForReceipt(receiptId) {
    const deadline = Date.now() + 30000;
    let lastError = null;
    let attempt = 0;

    // Most writes finish quickly. Start checking much sooner than the previous
    // 1.2-second interval, then back off slightly if Apps Script is cold.
    await sleep(250);

    while (Date.now() < deadline) {
      try {
        const result = await jsonp("receiptStatus", { receiptId }, 8000);
        if (result.ok && result.received) return result;
        if (result.error) throw new Error(result.error);
      } catch (error) {
        lastError = error;
      }

      attempt += 1;
      await sleep(attempt < 4 ? 350 : attempt < 8 ? 600 : 900);
    }

    if (lastError) throw lastError;
    throw new Error("The reporting server did not confirm that the report was stored.");
  }

  async function submitReport() {
    setReportTime();
    const receiptId = createReceiptId();
    const data = new FormData(form);
    data.set("action", "submitRoarReport");
    data.set("receiptId", receiptId);

    const body = new URLSearchParams();
    for (const [key, value] of data.entries()) body.append(key, String(value));

    // no-cors is intentional. Apps Script does not provide normal CORS headers for
    // this static-site POST. We confirm the write separately with a non-sensitive
    // receipt ID through JSONP, so the report details never need to be placed in a URL.
    await fetch(config.SCRIPT_URL.trim(), {
      method: "POST",
      mode: "no-cors",
      credentials: "omit",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString()
    });

    return waitForReceipt(receiptId);
  }

  if (harassmentCheck) harassmentCheck.addEventListener("change", updateConditionalFields);
  if (otherCheck) otherCheck.addEventListener("change", updateConditionalFields);
  if (description) description.addEventListener("input", updateDescriptionCount);

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitting) return;

      if (!backendConfigured()) {
        setStatus("The reporting backend has not been configured yet. Please report directly to an adult or ask the site administrator to finish Apps Script setup.", "error");
        return;
      }

      if (!hasReportType()) {
        setStatus("Select at least one type of concern, including Other / unsure if you are uncertain.", "error");
        form.querySelector(".roar-check-grid")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (!form.reportValidity()) {
        setStatus("Please complete the required fields before submitting.", "error");
        return;
      }

      if (document.getElementById("roarHoneypot")?.value) {
        setStatus("Unable to submit this report.", "error");
        return;
      }

      setSubmitting(true);

      // The page already performs a background health check when it loads.
      // Reuse that result for five minutes instead of adding a full extra
      // Apps Script round-trip before every submission.
      if (!recentHealthCheckIsGood()) {
        setStatus("Checking the reporting server…", "");
        const healthy = await healthCheck(false);
        if (!healthy) {
          setSubmitting(false);
          return;
        }
      }

      try {
        setStatus("Sending your report…", "");
        const result = await submitReport();
        setStatus(
          result.message || "Your ROAR report was received and stored. If there is an immediate safety concern, make sure an adult has also been contacted directly.",
          "success"
        );
        form.reset();
      } catch (error) {
        setStatus(
          `${error.message} Please report directly to a trusted adult so the concern is not lost, and notify the site administrator if the web form continues to fail.`,
          "error"
        );
      } finally {
        setSubmitting(false);
      }
    });

    form.addEventListener("reset", () => {
      setTimeout(() => {
        updateConditionalFields();
        updateDescriptionCount();
        setReportTime();
      }, 0);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      setSubmitting(false);
      setStatus("Form cleared.", "");
    });
  }

  setReportTime();
  updateConditionalFields();
  updateDescriptionCount();
  updateBackendState();

  if (backendConfigured()) {
    healthCheck(false);
  }
})();

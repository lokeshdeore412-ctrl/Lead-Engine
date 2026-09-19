/**
 * Lead Engine v1.0
 * High-reliability client-side SDK for capturing B2B lead signals and dispatching them to a configured endpoint.
 */
(function () {
  const config = window.LeadEngineConfig;
  if (!config) {
    console.error("[LeadEngine] Execution stopped: Configuration block is missing.");
    return;
  }

  // ADAPTIVE PATH FINDER: Dynamically resolves either config key
  const TARGET_URL = config.proxy_url || config.webhook_url;
  const STORAGE_KEY = config.storageKey || "lead_identity_v1";
  let lastDispatchedSignal = { name: "", time: 0 };

  if (!TARGET_URL) {
    console.error("[LeadEngine] Execution stopped: Neither 'proxy_url' nor 'webhook_url' was provided.");
    return;
  }

  // Aggressively prunes invisible character noise safely without breaking regex ranges
  function cleanString(val) {
    if (!val) return "";
    return String(val).trim().toLowerCase().replace(/[^\w.@\s\/:\-+]/g, "");
  }

  function extractEmailFromElement(element) {
    if (!element || !("value" in element)) return null;
    const value = cleanString(element.value);
    return (value.includes("@") && !value.includes(" ") && value.length > 4) ? value : null;
  }

  // Safely attempts to extract an actual first name from DOM if available
  function extractFirstNameFromDOM() {
    const firstNameEl = document.querySelector('input[name*="first_name"], input[name*="firstname"], input[autocomplete="given-name"]');
    if (firstNameEl && firstNameEl.value) {
      return cleanString(firstNameEl.value);
    }
    return null;
  }

  function saveIdentity(email) {
    if (email) localStorage.setItem(STORAGE_KEY, email);
  }

  function getIdentity() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function sendSignal(signalName) {
    const email = getIdentity();
    if (!email) return;

    // DEBOUNCER: Prevent double-firing same signal within 2000ms (e.g. click + submit events)
    const now = Date.now();
    if (lastDispatchedSignal.name === signalName && (now - lastDispatchedSignal.time) < 2000) {
      console.warn(`[LeadEngine] Signal [${signalName}] suppressed (duplicate debounce).`);
      return;
    }

    const honeypotField = document.querySelector('input[name="honeypot_bypass"], input[name="honeypot"]');
    const honeypotValue = honeypotField ? String(honeypotField.value).trim() : "";

    // Immediate local check: block known spam form manipulations
    if (honeypotValue.length > 0) {
      console.warn("[LeadEngine] Execution halted: Bot signature flagged.");
      return;
    }

    const domFirstName = extractFirstNameFromDOM();
    const fallbackFirstName = cleanString(email.split("@")[0]);

    const payload = {
      first_name: domFirstName || fallbackFirstName,
      email: cleanString(email),
      intent_signal: cleanString(signalName),
      honeypot_bypass: honeypotValue,
      page_url: window.location.href
    };

    lastDispatchedSignal = { name: signalName, time: now };
    console.log(`[LeadEngine] Dispatching Validated B2B Signal [${signalName}] to ${TARGET_URL}`);

    fetch(TARGET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true 
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server edge rejected transaction frame: Status ${response.status}`);
      }
      console.log(`[LeadEngine] Signal [${signalName}] processed successfully.`);
    })
    .catch((err) => {
      console.error(`❌ [LeadEngine] Primary Pipeline Blocked:`, err.message);

      if (navigator.sendBeacon) {
        console.log("[LeadEngine] Redirecting payload to emergency beacon channel...");
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon(TARGET_URL, blob);
      }
    });
  }

  // --- AUTOMATED MONITORING MATRIX ---
  document.addEventListener("blur", (event) => {
    if (event.target instanceof Element && config.identity?.emailSelector && event.target.matches(config.identity.emailSelector)) {
      const email = extractEmailFromElement(event.target);
      if (email) saveIdentity(email);
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (event.target instanceof Element && config.identity?.emailSelector && event.target.matches(config.identity.emailSelector)) {
      const email = extractEmailFromElement(event.target);
      if (email) saveIdentity(email);
    }
  }, true);

  document.addEventListener("submit", (event) => {
    if (!(event.target instanceof Element)) return;
    const emailSelector = config.identity?.emailSelector || 'input[type="email"]';
    const emailInput = event.target.querySelector(emailSelector);
    const email = extractEmailFromElement(emailInput);
    if (email) {
      saveIdentity(email);
      sendSignal("form_submit");
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const signals = config.signals || {};
    for (const [signalName, selectors] of Object.entries(signals)) {
      const isMatch = selectors.some((selector) => target.closest(selector));
      if (isMatch) {
        sendSignal(signalName);
        break;
      }
    }
  });
}());
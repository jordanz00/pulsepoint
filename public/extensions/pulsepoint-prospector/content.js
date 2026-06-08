/** Content script — extracts visible email for Prospector popup (optional page hints). */
(function () {
  const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const text = document.body?.innerText?.slice(0, 20000) || "";
  const match = text.match(emailRe);
  if (match) {
    document.documentElement.dataset.pulsepointProspectorEmail = match[0];
  }
})();

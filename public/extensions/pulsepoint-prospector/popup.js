const $ = (id) => document.getElementById(id);

chrome.storage.local.get(["baseUrl", "orgId", "token", "orgSlug"], (data) => {
  if (data.baseUrl) $("baseUrl").value = data.baseUrl;
  if (data.orgId) $("orgId").value = data.orgId;
  if (data.token) $("token").value = data.token;
  if (data.orgSlug) $("orgSlug").value = data.orgSlug;
});

$("save").addEventListener("click", () => {
  chrome.storage.local.set({
    baseUrl: $("baseUrl").value.replace(/\/$/, ""),
    orgId: $("orgId").value.trim(),
    token: $("token").value.trim(),
    orgSlug: $("orgSlug").value.trim(),
  });
  $("status").textContent = "Saved.";
});

$("panel").addEventListener("click", () => {
  chrome.storage.local.get(["baseUrl", "orgSlug"], (data) => {
    const base = data.baseUrl || "http://localhost:3000";
    const slug = data.orgSlug || "demo-healthcare";
    chrome.tabs.create({ url: `${base}/${slug}/crm/prospector/panel` });
  });
});

$("enrich").addEventListener("click", async () => {
  $("status").textContent = "Enriching…";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const stored = await chrome.storage.local.get(["baseUrl", "orgId", "token", "orgSlug"]);
  const base = stored.baseUrl || "http://localhost:3000";
  const orgId = stored.orgId;
  const token = stored.token;
  if (!orgId || !token) {
    $("status").textContent = "Set org ID and capture token first.";
    return;
  }

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const text = document.body?.innerText?.slice(0, 50000) || "";
      const match = text.match(emailRe);
      return {
        email: match ? match[0] : "",
        pageUrl: location.href,
        title: document.title,
      };
    },
  });

  const res = await fetch(`${base}/api/crm/prospect/enrich`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PulsePoint-Org-Id": orgId,
      "X-PulsePoint-Capture-Token": token,
    },
    body: JSON.stringify({
      email: result.email,
      pageUrl: result.pageUrl,
      company: result.title,
    }),
  });
  const json = await res.json();
  if (!json.ok) {
    $("status").textContent = json.message || "Enrich failed";
    return;
  }

  const f = json.firmographics;
  $("status").textContent = `${f.companyName} · ${f.industry} · ICP ${f.icpMatch}`;

  if (result.email) {
    const lookup = await fetch(
      `${base}/api/crm/prospect/lookup?email=${encodeURIComponent(result.email)}`,
      {
        headers: {
          "X-PulsePoint-Org-Id": orgId,
          "X-PulsePoint-Capture-Token": token,
        },
      },
    );
    const lu = await lookup.json();
    if (lu.ok && lu.member) {
      const profile = $("profile");
      profile.href = `${base}${lu.member.profileUrl}`;
      profile.hidden = false;
      profile.textContent = "Open " + lu.member.firstName + " " + lu.member.lastName;
    }
  }
});

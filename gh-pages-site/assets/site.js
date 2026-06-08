/**
 * GitHub Pages static demo — base path + session (no server).
 * Repo project site: https://jordanz00.github.io/pulsepoint/
 */
(function () {
  const meta = document.querySelector('meta[name="pp-base"]');
  const BASE = (meta && meta.getAttribute("content")) || "/pulsepoint/";

  function normalizeBase(b) {
    return b.endsWith("/") ? b : b + "/";
  }

  const base = normalizeBase(BASE);

  window.PulsePointSite = {
    base,
    path(segment) {
      const s = (segment || "").replace(/^\//, "");
      return base + s;
    },
    asset(file) {
      return base + "assets/" + file.replace(/^\//, "");
    },
    isDemoActive() {
      try {
        return sessionStorage.getItem("pp_demo") === "1";
      } catch {
        return false;
      }
    },
    enterDemo(mode) {
      try {
        sessionStorage.setItem("pp_demo", "1");
        if (mode) sessionStorage.setItem("pp_demo_mode", mode);
      } catch (_) {}
      var m = mode;
      try {
        if (!m) m = sessionStorage.getItem("pp_demo_mode");
      } catch (_) {}
      if (m === "walkthrough") {
        location.href = this.path("demo-healthcare/walkthrough/");
        return;
      }
      if (m === "suite") {
        location.href = this.path("demo-healthcare/suite/");
        return;
      }
      location.href = this.path("demo-healthcare/");
    },
    exitDemo() {
      try {
        sessionStorage.removeItem("pp_demo");
      } catch (_) {}
      location.href = this.path("demo/");
    },
    requireDemo() {
      if (!this.isDemoActive()) {
        location.href = this.path("demo/");
        return false;
      }
      return true;
    },
    wireExitLinks() {
      document.querySelectorAll("[data-pp-exit-demo]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          this.exitDemo();
        });
      });
    },
    wireEnterDemo() {
      document.querySelectorAll("[data-pp-enter-demo]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          var mode = el.getAttribute("data-pp-enter-demo");
          this.enterDemo(mode && mode !== "" ? mode : undefined);
        });
      });
    },
    fixLinks() {
      document.querySelectorAll("[data-pp-href]").forEach((el) => {
        const seg = el.getAttribute("data-pp-href");
        if (seg) el.setAttribute("href", this.path(seg));
      });
      document.querySelectorAll("[data-pp-src]").forEach((el) => {
        const f = el.getAttribute("data-pp-src");
        if (f) el.setAttribute("src", this.asset(f));
      });
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.PulsePointSite.fixLinks();
    window.PulsePointSite.wireEnterDemo();
    window.PulsePointSite.wireExitDemo();
  });
})();

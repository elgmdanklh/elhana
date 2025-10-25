(function linkModule() {
  "use strict";

  const STAGGER_INTERVAL = 90;
  const SAFE_PROTOCOLS = ["https:", "http:", "tel:", "mailto:", "wa:", "whatsapp:"];
  const linkItems = Array.from(document.querySelectorAll(".link-item"));

  function sanitizeAnchor(anchor) {
    if (!anchor || !anchor.href) return;

    try {
      const url = new URL(anchor.href);
      if (!SAFE_PROTOCOLS.includes(url.protocol)) {
        console.warn(`[linkDeck] ?? ????? ???? ??? ???: ${anchor.href}`);
        anchor.removeAttribute("href");
        anchor.classList.add("link-card--disabled");
      }
    } catch (error) {
      console.warn(`[linkDeck] ????? ??? ???? ?? ??????: ${anchor.getAttribute("href")}`);
      anchor.removeAttribute("href");
      anchor.classList.add("link-card--disabled");
    }
  }

  function applyInitialState() {
    linkItems.forEach((item, index) => {
      const anchor = item.querySelector("a.link-card");
      const isVisible = item.dataset.visible !== "false";

      if (!isVisible) {
        item.classList.add("is-hidden");
      } else {
        const delay = index * STAGGER_INTERVAL;
        if (anchor) anchor.style.setProperty("--delay", `${delay}ms`);
      }

      sanitizeAnchor(anchor);
    });
  }

  const linkDeck = Object.freeze({
    toggle(platform, shouldShow = true) {
      const target = document.querySelector(`.link-item[data-platform="${platform}"]`);
      if (!target) return false;

      target.dataset.visible = shouldShow ? "true" : "false";
      target.classList.toggle("is-hidden", !shouldShow);
      return true;
    },

    updateLink({ platform, href, label, handle }) {
      const target = document.querySelector(`.link-item[data-platform="${platform}"] a.link-card`);
      if (!target) return false;

      if (href) {
        target.setAttribute("href", href);
        sanitizeAnchor(target);
      }

      if (label) {
        const labelNode = target.querySelector(".link-card__label strong");
        if (labelNode) labelNode.textContent = label;
      }

      if (handle) {
        const handleNode = target.querySelector(".link-card__handle");
        if (handleNode) handleNode.textContent = handle;
      }

      return true;
    },
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "href" &&
        mutation.target instanceof HTMLAnchorElement
      ) {
        sanitizeAnchor(mutation.target);
      }
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    applyInitialState();

    linkItems.forEach((item) => {
      const anchor = item.querySelector("a.link-card");
      if (anchor) {
        observer.observe(anchor, { attributes: true, attributeFilter: ["href"] });
      }
    });
  });

  Object.defineProperty(window, "linkDeck", {
    value: linkDeck,
    writable: false,
    configurable: false,
  });
})();

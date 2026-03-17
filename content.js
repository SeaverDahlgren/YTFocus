(function initYTFocus() {
  const config = self.YTFocusConfig;

  if (!config) {
    return;
  }

  const BLOCKED_PANEL_ID = config.BLOCKED_PANEL_ID;
  const HOME_REDIRECT_URL = config.HOME_REDIRECT_URL;
  const classifyUrl = config.classifyUrl;

  const BLOCKED_ATTR = "data-ytfocus-blocked";
  const PAGE_ATTR = "data-ytfocus-page";
  const PANEL_LINKS = [
    { href: "/feed/subscriptions", label: "Subscriptions" },
    { href: "/results?search_query=", label: "Search" },
    { href: "https://accounts.google.com/ServiceLogin?service=youtube", label: "Sign in" }
  ];
  const SIGN_IN_SELECTORS = [
    'a[href*="ServiceLogin"]',
    'ytd-guide-signin-promo-renderer',
    'tp-yt-paper-button[aria-label*="Sign in"]',
    'yt-button-view-model a[href*="ServiceLogin"]'
  ];

  let lastHref = location.href;
  let refreshQueued = false;

  function scheduleRefresh() {
    if (refreshQueued) {
      return;
    }

    refreshQueued = true;
    requestAnimationFrame(function flushRefresh() {
      refreshQueued = false;
      applyFocusMode();
    });
  }

  function applyFocusMode() {
    const route = classifyUrl(location.href);

    document.documentElement.setAttribute(PAGE_ATTR, route.pageType);

    if (route.redirectToSubscriptions && location.href !== HOME_REDIRECT_URL) {
      location.replace(HOME_REDIRECT_URL);
      return;
    }

    if (route.pageType === "home") {
      showBlockedPanel(
        "Home feed blocked",
        "YTFocus redirects home to subscriptions and never falls back to the default feed."
      );
    } else if (route.pageType === "subscriptions" && isSubscriptionsUnavailable()) {
      showBlockedPanel(
        "Subscriptions unavailable",
        "Sign in to YouTube to use subscriptions or open a direct video, playlist, channel, or search."
      );
    } else if (route.pageType === "discovery") {
      showBlockedPanel(
        "Discovery blocked",
        "Shorts, Explore, Trending, and similar browse surfaces are hidden in focus mode."
      );
    } else {
      hideBlockedPanel();
    }

    lastHref = location.href;
  }

  function isSubscriptionsUnavailable() {
    return SIGN_IN_SELECTORS.some(function hasSigninPrompt(selector) {
      return Boolean(document.querySelector(selector));
    });
  }

  function showBlockedPanel(title, body) {
    const panel = ensureBlockedPanel();

    panel.querySelector("[data-role='title']").textContent = title;
    panel.querySelector("[data-role='body']").textContent = body;
    document.documentElement.setAttribute(BLOCKED_ATTR, "true");
  }

  function hideBlockedPanel() {
    const panel = document.getElementById(BLOCKED_PANEL_ID);

    document.documentElement.removeAttribute(BLOCKED_ATTR);

    if (panel) {
      panel.hidden = true;
    }
  }

  function ensureBlockedPanel() {
    let panel = document.getElementById(BLOCKED_PANEL_ID);

    if (panel) {
      panel.hidden = false;
      return panel;
    }

    panel = document.createElement("div");
    panel.id = BLOCKED_PANEL_ID;
    panel.innerHTML = [
      '<section class="ytfocus-panel" role="dialog" aria-modal="true" aria-labelledby="ytfocus-title">',
      '<p class="ytfocus-kicker">YTFocus</p>',
      '<h1 id="ytfocus-title" data-role="title"></h1>',
      '<p class="ytfocus-copy" data-role="body"></p>',
      '<nav class="ytfocus-actions" aria-label="Focus actions"></nav>',
      "</section>"
    ].join("");

    const actions = panel.querySelector(".ytfocus-actions");

    PANEL_LINKS.forEach(function appendLink(linkConfig) {
      const link = document.createElement("a");
      link.className = "ytfocus-link";
      link.href = linkConfig.href;
      link.textContent = linkConfig.label;
      actions.appendChild(link);
    });

    (document.body || document.documentElement).appendChild(panel);
    return panel;
  }

  function installNavigationHooks() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function patchedPushState() {
      const result = originalPushState.apply(this, arguments);
      queueMicrotask(scheduleRefresh);
      return result;
    };

    history.replaceState = function patchedReplaceState() {
      const result = originalReplaceState.apply(this, arguments);
      queueMicrotask(scheduleRefresh);
      return result;
    };

    window.addEventListener("popstate", scheduleRefresh, true);
    window.addEventListener("yt-navigate-finish", scheduleRefresh, true);
    window.addEventListener("yt-page-data-updated", scheduleRefresh, true);

    setInterval(function checkUrl() {
      if (location.href !== lastHref) {
        scheduleRefresh();
      }
    }, 500);
  }

  function installDomObserver() {
    const observer = new MutationObserver(function onMutation() {
      scheduleRefresh();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  installNavigationHooks();
  installDomObserver();
  applyFocusMode();
})();

(function initInstagramFocus() {
  const config = self.YTFocusConfig;
  const utils = self.YTFocusContentUtils;
  const site = config.SITES.instagram;

  const BLOCKED_ATTR = "data-ytfocus-instagram-blocked";
  const PAGE_ATTR = "data-ytfocus-instagram-page";
  const PANEL_ID = "ytfocus-instagram-panel";
  const LOGIN_SELECTORS = [
    'input[name="username"]',
    'input[name="password"]',
    'a[href="/accounts/login/"]'
  ];
  const OWN_PROFILE_TEXT = [
    "Edit profile",
    "Share profile",
    "View archive"
  ];
  const SUGGESTION_PHRASES = [
    "suggested for you",
    "suggested reels",
    "suggested accounts",
    "because you viewed",
    "accounts for you",
    "follow accounts"
  ];

  let enabled = config.DEFAULT_SETTINGS.instagramEnabled;
  let currentUsername = null;

  function extractHandle(pathValue) {
    if (!pathValue) {
      return null;
    }

    const segments = pathValue.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

    if (segments.length !== 1) {
      return null;
    }

    const candidate = segments[0];

    if (site.reservedSegments.has(candidate.toLowerCase())) {
      return null;
    }

    return candidate;
  }

  function resolveCurrentUsername(route) {
    if (currentUsername) {
      return currentUsername;
    }

    const profileAnchors = Array.from(document.querySelectorAll(
      'a[href][aria-label*="Profile"], a[href][title="Profile"]'
    ));
    const navAnchors = Array.from(document.querySelectorAll("nav a[href], header a[href]"));

    for (let index = 0; index < profileAnchors.length; index += 1) {
      const anchor = profileAnchors[index];
      const handle = extractHandle(anchor.getAttribute("href") || "");

      if (!handle) {
        continue;
      }

      const label = [
        anchor.getAttribute("aria-label") || "",
        anchor.getAttribute("title") || "",
        anchor.textContent || ""
      ].join(" ").toLowerCase();

      if (label.indexOf("profile") >= 0 || anchor.querySelector("svg[aria-label='Profile'], img, canvas")) {
        currentUsername = handle;
        return currentUsername;
      }
    }

    for (let index = 0; index < navAnchors.length; index += 1) {
      const anchor = navAnchors[index];
      const handle = extractHandle(anchor.getAttribute("href") || "");

      if (!handle) {
        continue;
      }

      if (anchor.querySelector("svg[aria-label='Profile'], img, canvas")) {
        currentUsername = handle;
        return currentUsername;
      }
    }

    if (route.pageType === "profile" && utils.hasVisibleExactText(OWN_PROFILE_TEXT)) {
      currentUsername = route.profileHandle;
    }

    return currentUsername;
  }

  function buildPanelActions() {
    return [
      { href: site.followingUrl, label: "Following home" },
      { href: "/explore/search/", label: "Search" },
      { href: "/direct/inbox/", label: "DMs" },
      { href: "/accounts/activity/", label: "Recent activity" },
      { href: "/create/select/", label: "Create" },
      { href: currentUsername ? "/" + currentUsername + "/" : site.followingUrl, label: "My profile" },
      { href: "/accounts/login/", label: "Sign in" }
    ];
  }

  function findContainer(node) {
    return node.closest("article, section, li, div[role='presentation'], main > div > div");
  }

  function hideSuggestionUi() {
    const candidates = document.querySelectorAll(
      "main span, main h1, main h2, main h3, main h4, main div[dir='auto'], main div[role='button']"
    );

    candidates.forEach(function checkNode(node) {
      const text = (node.textContent || "").trim().toLowerCase();

      if (!text || text.length > 120) {
        return;
      }

      if (!SUGGESTION_PHRASES.some(function matches(phrase) {
        return text === phrase || text.indexOf(phrase) === 0;
      })) {
        return;
      }

      const container = findContainer(node);

      if (container) {
        utils.hideElement(container);
      }
    });
  }

  function isFollowingUnavailable() {
    if (LOGIN_SELECTORS.some(function isLogin(selector) {
      return Boolean(document.querySelector(selector));
    })) {
      return true;
    }

    if (document.querySelectorAll("main article").length > 0) {
      return false;
    }

    const pageText = (document.body ? document.body.innerText : "").toLowerCase();

    return pageText.indexOf("get fresh updates here when you follow accounts") >= 0 ||
      pageText.indexOf("suggested for you") >= 0 ||
      pageText.indexOf("follow accounts to see their photos and videos here") >= 0;
  }

  function getBlockedState(route) {
    if (route.pageType === "followingHome" && isFollowingUnavailable()) {
      return {
        body: "Instagram did not expose a usable following feed. The default suggested home feed remains blocked.",
        title: "Following feed unavailable"
      };
    }

    if (route.pageType === "reels") {
      return {
        body: "Reels routes and entrypoints stay blocked in Instagram focus mode.",
        title: "Reels blocked"
      };
    }

    if (
      route.pageType === "search" ||
      route.pageType === "direct" ||
      route.pageType === "activity" ||
      route.pageType === "create" ||
      route.pageType === "login" ||
      route.pageType === "profile"
    ) {
      return null;
    }

    if (route.pageType === "followingHome") {
      return null;
    }

    return {
      body: "Only following home, search, DMs, recent activity, create, login, and profile pages are allowed.",
      title: "Route blocked"
    };
  }

  function cleanup() {
    document.documentElement.removeAttribute(PAGE_ATTR);
    utils.hidePanel(PANEL_ID, BLOCKED_ATTR);
    utils.unhideAll();
  }

  function applyFocusMode() {
    if (!enabled) {
      cleanup();
      return;
    }

    const route = site.classifyUrl(location.href);

    document.documentElement.setAttribute(PAGE_ATTR, route.pageType);
    resolveCurrentUsername(route);
    utils.unhideAll();

    if (route.redirectTarget && location.href !== route.redirectTarget) {
      location.replace(route.redirectTarget);
      return;
    }

    hideSuggestionUi();

    const blockedState = getBlockedState(route);

    if (blockedState) {
      utils.showPanel({
        actions: buildPanelActions(),
        blockedAttr: BLOCKED_ATTR,
        body: blockedState.body,
        kicker: site.kicker,
        panelId: PANEL_ID,
        title: blockedState.title
      });
      return;
    }

    utils.hidePanel(PANEL_ID, BLOCKED_ATTR);
  }

  const scheduleRefresh = utils.createScheduler(applyFocusMode);

  utils.installNavigationHooks(scheduleRefresh);
  utils.observeDom(scheduleRefresh);
  utils.watchSettings(function onSettingsChange(changes) {
    if (!changes.instagramEnabled) {
      return;
    }

    enabled = changes.instagramEnabled.newValue;
    scheduleRefresh();
  });
  utils.getSettings(function onSettings(settings) {
    enabled = settings.instagramEnabled;
    scheduleRefresh();
  });
})();

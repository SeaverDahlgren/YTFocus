(function initYouTubeFocus() {
  const config = self.YTFocusConfig;
  const utils = self.YTFocusContentUtils;
  const site = config.SITES.youtube;

  const BLOCKED_ATTR = "data-ytfocus-youtube-blocked";
  const PAGE_ATTR = "data-ytfocus-youtube-page";
  const PANEL_ID = "ytfocus-youtube-panel";
  const SIGN_IN_SELECTORS = [
    'a[href*="ServiceLogin"]',
    'ytd-guide-signin-promo-renderer',
    'tp-yt-paper-button[aria-label*="Sign in"]',
    'yt-button-view-model a[href*="ServiceLogin"]'
  ];
  const PANEL_ACTIONS = [
    { href: site.subscriptionsUrl, label: "Subscriptions" },
    { href: "/results?search_query=", label: "Search" },
    { href: "https://accounts.google.com/ServiceLogin?service=youtube", label: "Sign in" }
  ];

  let enabled = config.DEFAULT_SETTINGS.youtubeEnabled;

  function isSubscriptionsUnavailable() {
    return SIGN_IN_SELECTORS.some(function hasPrompt(selector) {
      return Boolean(document.querySelector(selector));
    });
  }

  function cleanup() {
    document.documentElement.removeAttribute(PAGE_ATTR);
    utils.hidePanel(PANEL_ID, BLOCKED_ATTR);
  }

  function applyFocusMode() {
    if (!enabled) {
      cleanup();
      return;
    }

    const route = site.classifyUrl(location.href);

    document.documentElement.setAttribute(PAGE_ATTR, route.pageType);

    if (route.redirectTarget && location.href !== route.redirectTarget) {
      location.replace(route.redirectTarget);
      return;
    }

    if (route.pageType === "subscriptions" && isSubscriptionsUnavailable()) {
      utils.showPanel({
        actions: PANEL_ACTIONS,
        blockedAttr: BLOCKED_ATTR,
        body: "Sign in to YouTube to use subscriptions or open a direct video, playlist, channel, or search.",
        kicker: site.kicker,
        panelId: PANEL_ID,
        title: "Subscriptions unavailable"
      });
      return;
    }

    if (route.pageType === "discovery") {
      utils.showPanel({
        actions: PANEL_ACTIONS,
        blockedAttr: BLOCKED_ATTR,
        body: "Shorts, Explore, Trending, and similar browse surfaces stay blocked in focus mode.",
        kicker: site.kicker,
        panelId: PANEL_ID,
        title: "Discovery blocked"
      });
      return;
    }

    utils.hidePanel(PANEL_ID, BLOCKED_ATTR);
  }

  const scheduleRefresh = utils.createScheduler(applyFocusMode);

  utils.installNavigationHooks(scheduleRefresh, [
    "yt-navigate-finish",
    "yt-page-data-updated"
  ]);
  utils.observeDom(scheduleRefresh);
  utils.watchSettings(function onSettingsChange(changes) {
    if (!changes.youtubeEnabled) {
      return;
    }

    enabled = changes.youtubeEnabled.newValue;
    scheduleRefresh();
  });
  utils.getSettings(function onSettings(settings) {
    enabled = settings.youtubeEnabled;
    scheduleRefresh();
  });
})();

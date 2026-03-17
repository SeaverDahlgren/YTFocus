(function attachYTFocusConfig(global) {
  const ORIGIN = "https://www.youtube.com";
  const SUBSCRIPTIONS_PATH = "/feed/subscriptions";
  const HOME_REDIRECT_URL = ORIGIN + SUBSCRIPTIONS_PATH;

  const HOME_PATHS = new Set(["/", "/feed/recommended"]);
  const DISCOVERY_PREFIXES = [
    "/shorts",
    "/feed/explore",
    "/feed/trending",
    "/gaming",
    "/news",
    "/podcasts",
    "/fashion",
    "/learning",
    "/live"
  ];
  const INTENTIONAL_PREFIXES = [
    SUBSCRIPTIONS_PATH,
    "/watch",
    "/results",
    "/playlist",
    "/channel",
    "/@",
    "/c/",
    "/user/",
    "/feed/history",
    "/feed/library",
    "/feed/you",
    "/feed/playlists",
    "/feed/channels",
    "/feed/notifications",
    "/account"
  ];

  function normalizePath(pathname) {
    if (!pathname) {
      return "/";
    }

    if (pathname.length > 1 && pathname.endsWith("/")) {
      return pathname.replace(/\/+$/, "");
    }

    return pathname;
  }

  function pathMatchesPrefix(path, prefix) {
    if (prefix.endsWith("/")) {
      return path.startsWith(prefix);
    }

    return path === prefix || path.startsWith(prefix + "/");
  }

  function classifyUrl(input) {
    let url;

    try {
      url = new URL(input, ORIGIN);
    } catch (error) {
      return { pageType: "other", redirectToSubscriptions: false, path: "" };
    }

    if (url.origin !== ORIGIN) {
      return { pageType: "other", redirectToSubscriptions: false, path: url.pathname };
    }

    const path = normalizePath(url.pathname);

    if (HOME_PATHS.has(path)) {
      return { pageType: "home", redirectToSubscriptions: true, path: path };
    }

    if (path === SUBSCRIPTIONS_PATH) {
      return { pageType: "subscriptions", redirectToSubscriptions: false, path: path };
    }

    if (path === "/watch") {
      return { pageType: "watch", redirectToSubscriptions: false, path: path };
    }

    if (DISCOVERY_PREFIXES.some(function matches(prefix) {
      return pathMatchesPrefix(path, prefix);
    })) {
      return { pageType: "discovery", redirectToSubscriptions: false, path: path };
    }

    if (path === "/results") {
      return { pageType: "search", redirectToSubscriptions: false, path: path };
    }

    if (INTENTIONAL_PREFIXES.some(function matches(prefix) {
      return pathMatchesPrefix(path, prefix);
    })) {
      return { pageType: "intentional", redirectToSubscriptions: false, path: path };
    }

    return { pageType: "other", redirectToSubscriptions: false, path: path };
  }

  global.YTFocusConfig = {
    BLOCKED_PANEL_ID: "ytfocus-blocked-panel",
    HOME_REDIRECT_URL: HOME_REDIRECT_URL,
    ORIGIN: ORIGIN,
    SUBSCRIPTIONS_PATH: SUBSCRIPTIONS_PATH,
    classifyUrl: classifyUrl
  };
})(self);

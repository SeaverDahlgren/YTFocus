(function attachYTFocusConfig(global) {
  const DEFAULT_SETTINGS = {
    youtubeEnabled: true,
    instagramEnabled: true
  };

  const YOUTUBE_ORIGIN = "https://www.youtube.com";
  const YOUTUBE_SUBSCRIPTIONS_PATH = "/feed/subscriptions";
  const YOUTUBE_HOME_PATHS = new Set(["/", "/feed/recommended"]);
  const YOUTUBE_DISCOVERY_PREFIXES = [
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
  const YOUTUBE_ALLOWED_PREFIXES = [
    YOUTUBE_SUBSCRIPTIONS_PATH,
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

  const INSTAGRAM_ORIGINS = new Set([
    "https://www.instagram.com",
    "https://instagram.com"
  ]);
  const INSTAGRAM_FOLLOWING_URL = "https://www.instagram.com/?variant=following";
  const INSTAGRAM_RESERVED_SEGMENTS = new Set([
    "about",
    "accounts",
    "api",
    "challenge",
    "create",
    "developer",
    "direct",
    "emails",
    "explore",
    "graphql",
    "legal",
    "press",
    "privacy",
    "reel",
    "reels",
    "stories",
    "web"
  ]);

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

  function toUrl(input, fallbackOrigin) {
    try {
      return new URL(input, fallbackOrigin);
    } catch (error) {
      return null;
    }
  }

  function classifyYoutubeUrl(input) {
    const url = toUrl(input, YOUTUBE_ORIGIN);

    if (!url || url.origin !== YOUTUBE_ORIGIN) {
      return { pageType: "other", path: "", redirectTarget: null };
    }

    const path = normalizePath(url.pathname);

    if (YOUTUBE_HOME_PATHS.has(path)) {
      return {
        pageType: "home",
        path: path,
        redirectTarget: YOUTUBE_ORIGIN + YOUTUBE_SUBSCRIPTIONS_PATH
      };
    }

    if (path === YOUTUBE_SUBSCRIPTIONS_PATH) {
      return { pageType: "subscriptions", path: path, redirectTarget: null };
    }

    if (path === "/watch") {
      return { pageType: "watch", path: path, redirectTarget: null };
    }

    if (YOUTUBE_DISCOVERY_PREFIXES.some(function matches(prefix) {
      return pathMatchesPrefix(path, prefix);
    })) {
      return { pageType: "discovery", path: path, redirectTarget: null };
    }

    if (path === "/results") {
      return { pageType: "search", path: path, redirectTarget: null };
    }

    if (YOUTUBE_ALLOWED_PREFIXES.some(function matches(prefix) {
      return pathMatchesPrefix(path, prefix);
    })) {
      return { pageType: "intentional", path: path, redirectTarget: null };
    }

    return { pageType: "other", path: path, redirectTarget: null };
  }

  function classifyInstagramUrl(input) {
    const url = toUrl(input, "https://www.instagram.com");

    if (!url || !INSTAGRAM_ORIGINS.has(url.origin)) {
      return {
        pageType: "other",
        path: "",
        profileHandle: null,
        redirectTarget: null
      };
    }

    const path = normalizePath(url.pathname);
    const variant = (url.searchParams.get("variant") || "").toLowerCase();

    if (path === "/" && variant === "following") {
      return {
        pageType: "followingHome",
        path: path,
        profileHandle: null,
        redirectTarget: null
      };
    }

    if (path === "/") {
      return {
        pageType: "home",
        path: path,
        profileHandle: null,
        redirectTarget: INSTAGRAM_FOLLOWING_URL
      };
    }

    if (path === "/explore" || path === "/explore/search") {
      return {
        pageType: "search",
        path: path,
        profileHandle: null,
        redirectTarget: null
      };
    }

    if (path === "/accounts/activity") {
      return {
        pageType: "activity",
        path: path,
        profileHandle: null,
        redirectTarget: null
      };
    }

    if (path === "/accounts/login") {
      return {
        pageType: "login",
        path: path,
        profileHandle: null,
        redirectTarget: null
      };
    }

    if (path === "/direct/inbox" || pathMatchesPrefix(path, "/direct")) {
      return {
        pageType: "direct",
        path: path,
        profileHandle: null,
        redirectTarget: null
      };
    }

    if (path === "/create" || pathMatchesPrefix(path, "/create")) {
      return {
        pageType: "create",
        path: path,
        profileHandle: null,
        redirectTarget: null
      };
    }

    if (path === "/reels" || pathMatchesPrefix(path, "/reels") || pathMatchesPrefix(path, "/reel")) {
      return {
        pageType: "reels",
        path: path,
        profileHandle: null,
        redirectTarget: null
      };
    }

    if (path === "/p" || pathMatchesPrefix(path, "/stories")) {
      return {
        pageType: "other",
        path: path,
        profileHandle: null,
        redirectTarget: null
      };
    }

    const segments = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

    if (segments.length > 0) {
      const firstSegment = segments[0].toLowerCase();

      if (INSTAGRAM_RESERVED_SEGMENTS.has(firstSegment)) {
        return {
          pageType: firstSegment === "explore" ? "discovery" : "other",
          path: path,
          profileHandle: null,
          redirectTarget: null
        };
      }

      if (segments.length === 1 || segments[1] === "tagged") {
        return {
          pageType: "profile",
          path: path,
          profileHandle: segments[0],
          redirectTarget: null
        };
      }
    }

    return {
      pageType: "other",
      path: path,
      profileHandle: null,
      redirectTarget: null
    };
  }

  const SITES = {
    youtube: {
      hostnames: ["www.youtube.com"],
      id: "youtube",
      kicker: "YTFocus",
      origin: YOUTUBE_ORIGIN,
      settingKey: "youtubeEnabled",
      subscriptionsUrl: YOUTUBE_ORIGIN + YOUTUBE_SUBSCRIPTIONS_PATH,
      classifyUrl: classifyYoutubeUrl
    },
    instagram: {
      hostnames: ["www.instagram.com", "instagram.com"],
      id: "instagram",
      kicker: "IGFocus",
      followingUrl: INSTAGRAM_FOLLOWING_URL,
      origin: "https://www.instagram.com",
      reservedSegments: INSTAGRAM_RESERVED_SEGMENTS,
      settingKey: "instagramEnabled",
      classifyUrl: classifyInstagramUrl
    }
  };

  function getSiteByHostname(hostname) {
    return Object.keys(SITES).map(function mapSite(siteId) {
      return SITES[siteId];
    }).find(function findSite(site) {
      return site.hostnames.indexOf(hostname) >= 0;
    }) || null;
  }

  function getSiteForUrl(input) {
    const url = toUrl(input, "https://www.youtube.com");

    if (!url) {
      return null;
    }

    return getSiteByHostname(url.hostname);
  }

  global.YTFocusConfig = {
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    SITES: SITES,
    getSiteByHostname: getSiteByHostname,
    getSiteForUrl: getSiteForUrl
  };
})(self);

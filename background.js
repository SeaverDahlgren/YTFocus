importScripts("shared-config.js");

const DEFAULT_SETTINGS = self.YTFocusConfig.DEFAULT_SETTINGS;
const SITES = self.YTFocusConfig.SITES;
const getSiteForUrl = self.YTFocusConfig.getSiteForUrl;

const NAVIGATION_FILTER = {
  url: [
    { hostEquals: "www.youtube.com", schemes: ["https"] },
    { hostEquals: "www.instagram.com", schemes: ["https"] },
    { hostEquals: "instagram.com", schemes: ["https"] }
  ]
};

function seedDefaultSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, function onRead(items) {
    chrome.storage.sync.set(Object.assign({}, DEFAULT_SETTINGS, items));
  });
}

function maybeRedirect(details) {
  if (details.frameId !== 0 || details.tabId < 0) {
    return;
  }

  const site = getSiteForUrl(details.url);

  if (!site) {
    return;
  }

  chrome.storage.sync.get(DEFAULT_SETTINGS, function onRead(settings) {
    if (!settings[site.settingKey]) {
      return;
    }

    const route = site.classifyUrl(details.url);

    if (!route.redirectTarget) {
      return;
    }

    chrome.tabs.update(details.tabId, { url: route.redirectTarget });
  });
}

chrome.runtime.onInstalled.addListener(seedDefaultSettings);
chrome.webNavigation.onCommitted.addListener(maybeRedirect, NAVIGATION_FILTER);
chrome.webNavigation.onHistoryStateUpdated.addListener(maybeRedirect, NAVIGATION_FILTER);

importScripts("shared-config.js");

const classifyUrl = self.YTFocusConfig.classifyUrl;
const HOME_REDIRECT_URL = self.YTFocusConfig.HOME_REDIRECT_URL;

const YOUTUBE_FILTER = {
  url: [
    {
      hostEquals: "www.youtube.com",
      schemes: ["https"]
    }
  ]
};

function maybeRedirect(details) {
  if (details.frameId !== 0 || details.tabId < 0) {
    return;
  }

  const route = classifyUrl(details.url);

  if (!route.redirectToSubscriptions) {
    return;
  }

  chrome.tabs.update(details.tabId, { url: HOME_REDIRECT_URL });
}

chrome.webNavigation.onCommitted.addListener(maybeRedirect, YOUTUBE_FILTER);
chrome.webNavigation.onHistoryStateUpdated.addListener(maybeRedirect, YOUTUBE_FILTER);

(function initPopup() {
  const DEFAULT_SETTINGS = self.YTFocusConfig.DEFAULT_SETTINGS;
  const SETTING_IDS = ["youtubeEnabled", "instagramEnabled"];

  function applySettings(settings) {
    SETTING_IDS.forEach(function updateToggle(id) {
      const input = document.getElementById(id);

      if (input) {
        input.checked = Boolean(settings[id]);
      }
    });
  }

  function readSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function onRead(items) {
      applySettings(Object.assign({}, DEFAULT_SETTINGS, items));
    });
  }

  function bindToggle(id) {
    const input = document.getElementById(id);

    if (!input) {
      return;
    }

    input.addEventListener("change", function onToggle() {
      const payload = {};
      payload[id] = input.checked;
      chrome.storage.sync.set(payload);
    });
  }

  document.addEventListener("DOMContentLoaded", function onReady() {
    SETTING_IDS.forEach(bindToggle);
    readSettings();
  });
})();

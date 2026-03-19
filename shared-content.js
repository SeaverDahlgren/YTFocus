(function attachYTFocusContentUtils(global) {
  const DEFAULT_SETTINGS = global.YTFocusConfig.DEFAULT_SETTINGS;

  function getSettings(callback) {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function onRead(items) {
      callback(Object.assign({}, DEFAULT_SETTINGS, items));
    });
  }

  function watchSettings(onChange) {
    function handleChanges(changes, areaName) {
      if (areaName === "sync") {
        onChange(changes);
      }
    }

    chrome.storage.onChanged.addListener(handleChanges);
    return function unwatch() {
      chrome.storage.onChanged.removeListener(handleChanges);
    };
  }

  function createScheduler(fn) {
    let queued = false;

    return function schedule() {
      if (queued) {
        return;
      }

      queued = true;
      requestAnimationFrame(function flush() {
        queued = false;
        fn();
      });
    };
  }

  function installNavigationHooks(scheduleRefresh, extraEvents) {
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
    (extraEvents || []).forEach(function attach(eventName) {
      window.addEventListener(eventName, scheduleRefresh, true);
    });

    setInterval(scheduleRefresh, 750);
  }

  function observeDom(scheduleRefresh) {
    const observer = new MutationObserver(function onMutation() {
      scheduleRefresh();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  function ensurePanel(panelId, kicker) {
    let panel = document.getElementById(panelId);

    if (panel) {
      panel.hidden = false;
      return panel;
    }

    panel = document.createElement("div");
    panel.id = panelId;
    panel.className = "ytfocus-panel-host";
    panel.innerHTML = [
      '<section class="ytfocus-panel" role="dialog" aria-modal="true" aria-labelledby="' + panelId + '-title">',
      '<p class="ytfocus-kicker">' + kicker + "</p>",
      '<h1 id="' + panelId + '-title" data-role="title"></h1>',
      '<p class="ytfocus-copy" data-role="body"></p>',
      '<nav class="ytfocus-actions" data-role="actions" aria-label="Focus actions"></nav>',
      "</section>"
    ].join("");

    (document.body || document.documentElement).appendChild(panel);
    return panel;
  }

  function showPanel(options) {
    const panel = ensurePanel(options.panelId, options.kicker);
    const actionsNode = panel.querySelector("[data-role='actions']");
    const signature = JSON.stringify({
      actions: options.actions || [],
      body: options.body,
      title: options.title
    });

    if (panel.getAttribute("data-ytfocus-signature") !== signature) {
      panel.querySelector("[data-role='title']").textContent = options.title;
      panel.querySelector("[data-role='body']").textContent = options.body;
      actionsNode.textContent = "";

      (options.actions || []).forEach(function appendAction(actionConfig) {
        const link = document.createElement("a");
        link.className = "ytfocus-link";
        link.href = actionConfig.href;
        link.textContent = actionConfig.label;
        link.addEventListener("click", function onClick(event) {
          event.preventDefault();
          event.stopPropagation();
          location.assign(link.href);
        });
        actionsNode.appendChild(link);
      });

      panel.setAttribute("data-ytfocus-signature", signature);
    }

    document.documentElement.setAttribute(options.blockedAttr, "true");
    panel.hidden = false;
  }

  function hidePanel(panelId, blockedAttr) {
    const panel = document.getElementById(panelId);

    document.documentElement.removeAttribute(blockedAttr);

    if (panel) {
      panel.hidden = true;
    }
  }

  function hideElement(node) {
    if (!node || node.hasAttribute("data-ytfocus-hidden")) {
      return;
    }

    node.setAttribute("data-ytfocus-hidden", "true");
    node.style.setProperty("display", "none", "important");
  }

  function unhideAll() {
    document.querySelectorAll("[data-ytfocus-hidden='true']").forEach(function restore(node) {
      node.removeAttribute("data-ytfocus-hidden");
      node.style.removeProperty("display");
    });
  }

  function hasVisibleExactText(values) {
    const normalized = values.map(function mapValue(value) {
      return value.toLowerCase();
    });

    return Array.from(document.querySelectorAll("button, a, span, div, h1, h2, h3")).some(function match(node) {
      if (!node.offsetParent) {
        return false;
      }

      const text = (node.textContent || "").trim().toLowerCase();
      return normalized.indexOf(text) >= 0;
    });
  }

  global.YTFocusContentUtils = {
    createScheduler: createScheduler,
    getSettings: getSettings,
    hasVisibleExactText: hasVisibleExactText,
    hideElement: hideElement,
    hidePanel: hidePanel,
    installNavigationHooks: installNavigationHooks,
    observeDom: observeDom,
    showPanel: showPanel,
    unhideAll: unhideAll,
    watchSettings: watchSettings
  };
})(self);

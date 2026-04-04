function initWavezTools() {
  const api = window.WavezFM;

  if (!api || api.version !== "1") {
    console.warn("[Wavez Tools] bridge WavezFM indisponivel.");
    return;
  }

  const initialRoom = api.room.getState();
  if (!initialRoom) {
    console.warn("[Wavez Tools] abra uma sala antes de executar o script.");
    return;
  }

  cleanupPreviousArtifacts();
  ensureTablerIcons();
  const styleEl = ensureStyles();

  const saved = loadSavedState();
  const state = {
    open: false,
    autoVote:
      saved.autoVote === "woot" ||
      saved.autoVote === "meh" ||
      saved.autoVote === "off"
        ? saved.autoVote
        : saved.autowoot
          ? "woot"
          : "off",
    autoJoin: Boolean(saved.autoJoin),
    lastPlaybackKey:
      typeof saved.lastPlaybackKey === "string" ? saved.lastPlaybackKey : null,
    live: initialRoom,
    lastEvent: "ready",
    lastMessage: "Pronto.",
    activeTrigger: null,
    anchors: new Map(),
  };

  const { popover, refs } = createPopover();
  const unsubscribers = [];
  let rafId = 0;
  let refreshTimer = 0;

  const notify = (message, tone = "default") => {
    state.lastMessage = message;

    if (tone === "error") {
      console.warn(`[Wavez Tools] ${message}`);
      return;
    }

    console.log(`[Wavez Tools] ${message}`);
  };

  const setEvent = (name) => {
    state.lastEvent = name;
  };

  const refreshState = () => {
    const next = api.room.getState();
    if (next) {
      state.live = next;
    }
  };

  const scheduleRefresh = (delay = 180) => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = 0;
      refreshState();
      renderAll();
    }, delay);
  };

  const getVisibleAnchorEntry = () => {
    for (const entry of state.anchors.values()) {
      if (isVisible(entry.button)) {
        return entry;
      }
    }

    return null;
  };

  const getCurrentTrigger = () => {
    if (
      state.activeTrigger &&
      state.activeTrigger.isConnected &&
      isVisible(state.activeTrigger)
    ) {
      return state.activeTrigger;
    }

    const fallback = getVisibleAnchorEntry()?.button || null;
    state.activeTrigger = fallback;
    return fallback;
  };

  function closePopover() {
    state.open = false;
    popover.classList.remove("is-open");
    renderTriggers();
  }

  const renderTriggers = () => {
    const currentTrigger = getCurrentTrigger();

    for (const entry of state.anchors.values()) {
      const isCurrent = state.open && currentTrigger === entry.button;
      entry.button.classList.toggle("is-open", isCurrent);
      entry.button.classList.toggle(
        "is-enabled",
        state.autoVote !== "off" || state.autoJoin
      );
      entry.button.setAttribute("aria-expanded", isCurrent ? "true" : "false");
    }
  };

  const positionPopover = () => {
    const trigger = getCurrentTrigger();
    if (!trigger) {
      closePopover();
      return;
    }

    const margin = 12;
    const triggerRect = trigger.getBoundingClientRect();
    const width = Math.min(400, window.innerWidth - margin * 2);

    popover.style.width = `${width}px`;

    const popRect = popover.getBoundingClientRect();
    const height = popRect.height || 420;

    let left = triggerRect.right - width;
    left = clamp(left, margin, window.innerWidth - width - margin);

    let top = triggerRect.bottom + 10;
    if (top + height > window.innerHeight - margin) {
      const above = triggerRect.top - height - 10;
      top =
        above >= margin
          ? above
          : Math.max(margin, window.innerHeight - height - margin);
    }

    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  };

  const renderAutoVote = () => {
    refs.autoVoteButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.wfVoteMode === state.autoVote);
    });
  };

  const renderLive = () => {
    const live = state.live || {};
    const room = live.room || {};
    const playback = live.playback || null;
    const votes = live.votes || {};
    const queue = live.queue || {};
    const users = Array.isArray(live.users) ? live.users : [];
    const currentUser = live.currentUser || null;

    refs.roomText.textContent = room.name || "Sem sala";
    refs.roomMeta.textContent = [
      currentUser?.displayUsername || "Visitante",
      room.viewerRole || "viewer",
      room.isVerified ? "verified" : null,
    ]
      .filter(Boolean)
      .join(" · ");

    refs.trackText.textContent = playback
      ? `${playback.artist} - ${playback.title}`
      : "Sem playback";

    refs.trackMeta.textContent = playback
      ? [
          String(playback.source || "").toUpperCase(),
          `DJ ${playback.djUsername || "-"}`,
          playback.isLive ? "live" : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "Aguardando faixa";

    refs.votesText.textContent = `${votes.woots ?? 0} woot · ${votes.mehs ?? 0} meh`;
    refs.votesMeta.textContent = `${votes.grabs ?? 0} grabs · voto: ${votes.clientVote || "none"}`;

    refs.queueText.textContent = `${queue.count ?? 0} na fila`;
    refs.queueMeta.textContent = [
      queue.isJoined ? "voce na fila" : "fora da fila",
      queue.isCurrentDj ? "voce e o DJ" : null,
      queue.isLocked ? "travada" : "aberta",
      queue.isFull ? "cheia" : null,
    ]
      .filter(Boolean)
      .join(" · ");

    refs.usersText.textContent = `${room.activeUsersCount ?? users.length ?? 0} online`;
    refs.usersMeta.textContent =
      users.slice(0, 3).map((user) => user.username).join(", ") ||
      "Sem usuarios carregados";
  };

  const renderAll = () => {
    refs.autoJoin.checked = state.autoJoin;
    renderAutoVote();
    renderLive();
    renderTriggers();

    if (state.open) {
      window.requestAnimationFrame(positionPopover);
    }
  };

  const executeAction = (label, fn, successMessage) => {
    try {
      const result = fn();

      if (result && typeof result.ok === "boolean") {
        if (result.ok) {
          notify(successMessage || `${label} executado.`, "success");
        } else {
          notify(`${label}: ${result.code}`, "error");
        }
      } else {
        notify(successMessage || `${label} executado.`, "success");
      }

      scheduleRefresh();
      return result;
    } catch (error) {
      notify(`${label}: ${error?.message || "erro"}`, "error");
      return null;
    }
  };

  const applyAutoVote = (force = false) => {
    if (state.autoVote === "off") {
      return;
    }

    refreshState();
    const live = state.live;
    const playback = live?.playback;

    if (!playback) {
      return;
    }

    if (!force && playback.playbackKey === state.lastPlaybackKey) {
      return;
    }

    state.lastPlaybackKey = playback.playbackKey;
    persistState(state);

    if (!live.votes?.canVote) {
      return;
    }

    if (live.votes?.clientVote === state.autoVote) {
      return;
    }

    executeAction(
      `Auto ${state.autoVote}`,
      () => api.actions.vote(state.autoVote),
      `Auto ${state.autoVote} enviado.`
    );
  };

  const applyAutoJoin = () => {
    if (!state.autoJoin) {
      return;
    }

    refreshState();
    const live = state.live;

    if (!live?.permissions?.joinQueue) {
      return;
    }

    if (live.queue?.isJoined || live.queue?.isCurrentDj) {
      return;
    }

    if (live.queue?.isLocked || live.queue?.isFull) {
      return;
    }

    executeAction(
      "Auto join queue",
      () => api.actions.joinQueue(),
      "Tentativa de entrar na fila enviada."
    );
  };

  const openPopover = (trigger) => {
    state.activeTrigger = trigger;
    state.open = true;
    popover.classList.add("is-open");
    renderAll();
  };

  const togglePopover = (trigger) => {
    if (state.open && state.activeTrigger === trigger) {
      closePopover();
      return;
    }

    openPopover(trigger);
  };

  const createAnchor = (host) => {
    const wrap = document.createElement("div");
    wrap.className = "wavez-tools-anchor";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "wf-trigger";
    button.setAttribute("aria-label", "Tools");
    button.title = "Tools";
    button.innerHTML = `
      <i class="ti ti-tool"></i>
      <span class="wf-trigger__label">Tools</span>
    `;

    const onClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      togglePopover(button);
    };

    button.addEventListener("click", onClick);
    wrap.appendChild(button);

    const entry = { wrap, button, onClick };
    state.anchors.set(host, entry);
    return entry;
  };

  const syncButtons = () => {
    const toolsButtons = Array.from(document.querySelectorAll(TOOL_BUTTON_SELECTOR));
    const seenHosts = new Set();

    toolsButtons.forEach((toolsButton) => {
      const host = toolsButton.closest("div.inline-flex") || toolsButton.parentElement;
      const container = host?.parentElement;

      if (!host || !container) {
        return;
      }

      seenHosts.add(host);

      let entry = state.anchors.get(host);
      if (!entry) {
        entry = createAnchor(host);
      }

      if (entry.wrap.parentElement !== container || entry.wrap.previousElementSibling !== host) {
        host.insertAdjacentElement("afterend", entry.wrap);
      }
    });

    for (const [host, entry] of state.anchors.entries()) {
      if (!seenHosts.has(host) || !document.contains(host)) {
        entry.button.removeEventListener("click", entry.onClick);
        entry.wrap.remove();
        state.anchors.delete(host);
      }
    }

    renderTriggers();

    if (state.open) {
      positionPopover();
    }
  };

  const queueSync = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      syncButtons();
    });
  };

  refs.autoVoteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.autoVote = button.dataset.wfVoteMode;
      state.lastPlaybackKey = null;
      persistState(state);
      renderAll();

      if (state.autoVote !== "off") {
        applyAutoVote(true);
      } else {
        notify("Auto vote desligado.");
      }
    });
  });

  refs.autoJoin.addEventListener("change", () => {
    state.autoJoin = refs.autoJoin.checked;
    persistState(state);
    renderAll();

    if (state.autoJoin) {
      notify("Auto join ligado.", "success");
      applyAutoJoin();
    } else {
      notify("Auto join desligado.");
    }
  });

  refs.close.addEventListener("click", closePopover);
  popover.addEventListener("click", (event) => event.stopPropagation());

  const onDocumentClick = (event) => {
    if (!state.open) {
      return;
    }

    if (popover.contains(event.target)) {
      return;
    }

    for (const entry of state.anchors.values()) {
      if (entry.wrap.contains(event.target)) {
        return;
      }
    }

    closePopover();
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      closePopover();
    }
  };

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("scroll", queueSync, true);
  window.addEventListener("resize", queueSync);

  const observer = new MutationObserver(queueSync);
  observer.observe(document.body, { childList: true, subtree: true });

  const subscribe = (eventName, handler) => {
    unsubscribers.push(
      api.room.subscribe(eventName, (payload) => {
        setEvent(eventName);
        refreshState();
        handler?.(payload);
        renderAll();
      })
    );
  };

  ROOM_EVENTS.forEach((eventName) => {
    if (eventName === "room_changed") {
      subscribe(eventName, () => {
        applyAutoVote();
        applyAutoJoin();
      });
      return;
    }

    if (eventName === "playback_changed") {
      subscribe(eventName, () => {
        applyAutoVote();
      });
      return;
    }

    if (eventName === "queue_changed") {
      subscribe(eventName, () => {
        applyAutoJoin();
      });
      return;
    }

    subscribe(eventName);
  });

  setEvent("ready");
  renderAll();
  syncButtons();

  if (state.autoVote !== "off") {
    applyAutoVote(true);
  }

  if (state.autoJoin) {
    applyAutoJoin();
  }

  window[INSTANCE_KEY] = {
    cleanup() {
      unsubscribers.forEach((unsubscribe) => {
        try {
          unsubscribe();
        } catch {}
      });

      observer.disconnect();
      window.clearTimeout(refreshTimer);

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", queueSync, true);
      window.removeEventListener("resize", queueSync);

      for (const [host, entry] of state.anchors.entries()) {
        entry.button.removeEventListener("click", entry.onClick);
        entry.wrap.remove();
        state.anchors.delete(host);
      }

      popover.remove();
      styleEl.remove();

      delete window[INSTANCE_KEY];
    },
  };

  console.log("[Wavez Tools] carregado.");
}

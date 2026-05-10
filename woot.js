(() => {
  const APP_ID = "woot-js-extension";
  const VERSION = "0.1.0";
  const STORAGE_KEY = "WootJS:settings:v1";

  const existing = window.__WootJS;
  if (existing?.togglePanel) {
    existing.togglePanel();
    return;
  }

  const defaultSettings = {
    autoWoot: true,
    autoJoin: false,
    targetVolume: 25,
    applyVolume: false,
  };

  const state = {
    panelOpen: true,
    lastPlaybackKey: null,
    status: "Inicializando",
    settings: loadSettings(),
    unsubscribers: [],
  };

  function loadSettings() {
    try {
      return {
        ...defaultSettings,
        ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"),
      };
    } catch {
      return { ...defaultSettings };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
  }

  function getApi() {
    const api = window.WavezFM;
    return api?.version === "1" ? api : null;
  }

  function getRoomState() {
    return getApi()?.room.getState() || null;
  }

  function runAutoWoot(reason = "manual") {
    const api = getApi();
    const room = api?.room.getState();
    const playback = room?.playback;

    if (!api || !room) {
      setStatus("Abra uma sala WavezFM");
      return;
    }

    if (!playback) {
      setStatus("Sem faixa tocando");
      return;
    }

    if (!state.settings.autoWoot && reason !== "manual") {
      return;
    }

    if (playback.playbackKey === state.lastPlaybackKey && reason !== "manual") {
      return;
    }

    state.lastPlaybackKey = playback.playbackKey;

    if (!room.votes.canVote) {
      setStatus("Voto indisponivel");
      render();
      return;
    }

    const result = api.actions.vote("woot");
    setStatus(result.ok ? "Woot enviado" : `Woot: ${result.code}`);
    render();
  }

  function runAutoJoin() {
    const api = getApi();
    const room = api?.room.getState();

    if (!api || !room || !state.settings.autoJoin) {
      return;
    }

    if (room.queue.isJoined || room.queue.isCurrentDj || room.queue.isLocked || room.queue.isFull) {
      render();
      return;
    }

    const result = api.actions.joinQueue();
    setStatus(result.ok ? "Fila entrou" : `Fila: ${result.code}`);
    render();
  }

  function applyVolume() {
    const api = getApi();
    if (!api || !state.settings.applyVolume) return;
    const result = api.actions.setVolume(state.settings.targetVolume);
    setStatus(result.ok ? `Volume ${result.value ?? state.settings.targetVolume}%` : `Volume: ${result.code}`);
    render();
  }

  function setStatus(nextStatus) {
    state.status = nextStatus;
  }

  function subscribe() {
    const api = getApi();
    cleanupSubscriptions();

    if (!api) {
      setStatus("Bridge indisponivel");
      return;
    }

    state.unsubscribers = [
      api.room.subscribe("playback_changed", () => {
        runAutoWoot("playback");
        runAutoJoin();
      }),
      api.room.subscribe("votes_changed", render),
      api.room.subscribe("queue_changed", () => {
        runAutoJoin();
        render();
      }),
      api.room.subscribe("room_changed", render),
    ];

    runAutoWoot("playback");
    runAutoJoin();
    applyVolume();
    render();
  }

  function cleanupSubscriptions() {
    state.unsubscribers.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch {}
    });
    state.unsubscribers = [];
  }

  function injectStyle() {
    const style = document.createElement("style");
    style.id = `${APP_ID}-style`;
    style.textContent = `
      #${APP_ID}-button,
      #${APP_ID}-panel,
      #${APP_ID}-panel * {
        box-sizing: border-box;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      #${APP_ID}-button {
        position: fixed;
        top: 86px;
        left: 18px;
        z-index: 2147483646;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 14px;
        color: #f8fafc;
        background: rgba(10, 10, 12, 0.82);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.34);
        backdrop-filter: blur(18px);
        cursor: pointer;
        transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
      }

      #${APP_ID}-button:hover {
        transform: translateY(-1px);
        border-color: rgba(255, 255, 255, 0.28);
        background: rgba(18, 18, 22, 0.92);
      }

      #${APP_ID}-panel {
        position: fixed;
        top: 74px;
        left: 72px;
        z-index: 2147483646;
        width: min(340px, calc(100vw - 96px));
        max-height: calc(100vh - 96px);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        color: #f8fafc;
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.12), transparent 36%),
          rgba(9, 9, 11, 0.9);
        box-shadow: 0 24px 90px rgba(0, 0, 0, 0.48);
        backdrop-filter: blur(24px);
      }

      #${APP_ID}-panel[data-open="false"] {
        display: none;
      }

      .woot-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.09);
      }

      .woot-brand {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .woot-title {
        margin: 0;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 0;
      }

      .woot-subtitle {
        margin: 0;
        color: rgba(248, 250, 252, 0.58);
        font-size: 12px;
      }

      .woot-chip {
        display: inline-flex;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        padding: 4px 8px;
        color: rgba(248, 250, 252, 0.7);
        background: rgba(255, 255, 255, 0.06);
        font-size: 11px;
        font-weight: 700;
      }

      .woot-panel-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 14px;
      }

      .woot-card {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.055);
        padding: 12px;
      }

      .woot-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .woot-label {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .woot-label strong {
        font-size: 13px;
      }

      .woot-label span,
      .woot-meta {
        color: rgba(248, 250, 252, 0.55);
        font-size: 11px;
      }

      .woot-switch {
        position: relative;
        flex: 0 0 auto;
        width: 42px;
        height: 24px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        cursor: pointer;
        transition: background 160ms ease;
      }

      .woot-switch::after {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: #fff;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.32);
        content: "";
        transition: transform 160ms ease;
      }

      .woot-switch[data-on="true"] {
        background: #f8fafc;
      }

      .woot-switch[data-on="true"]::after {
        transform: translateX(18px);
        background: #050507;
      }

      .woot-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .woot-action {
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        color: #f8fafc;
        background: rgba(255, 255, 255, 0.07);
        padding: 10px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        transition: background 160ms ease, transform 160ms ease;
      }

      .woot-action:hover {
        transform: translateY(-1px);
        background: rgba(255, 255, 255, 0.12);
      }

      .woot-range {
        width: 100%;
        accent-color: #f8fafc;
      }

      .woot-status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.09);
        color: rgba(248, 250, 252, 0.58);
        font-size: 11px;
      }

      .woot-track {
        overflow: hidden;
        color: rgba(248, 250, 252, 0.82);
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @media (max-width: 720px) {
        #${APP_ID}-button {
          top: 78px;
          left: 12px;
        }

        #${APP_ID}-panel {
          top: 132px;
          left: 12px;
          width: calc(100vw - 24px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createRoot() {
    injectStyle();

    const button = document.createElement("button");
    button.id = `${APP_ID}-button`;
    button.type = "button";
    button.title = "Abrir Woot.js";
    button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 16.5 10.5 7l3 10 3-10L20 16.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    button.addEventListener("click", togglePanel);

    const panel = document.createElement("aside");
    panel.id = `${APP_ID}-panel`;
    panel.setAttribute("data-open", "true");

    document.body.append(button, panel);
    render();
  }

  function togglePanel() {
    state.panelOpen = !state.panelOpen;
    const panel = document.getElementById(`${APP_ID}-panel`);
    panel?.setAttribute("data-open", String(state.panelOpen));
  }

  function setSetting(key, value) {
    state.settings[key] = value;
    saveSettings();
    if (key === "autoWoot" && value) runAutoWoot("manual");
    if (key === "autoJoin" && value) runAutoJoin();
    if (key === "applyVolume") applyVolume();
    render();
  }

  function render() {
    const panel = document.getElementById(`${APP_ID}-panel`);
    if (!panel) return;

    const room = getRoomState();
    const playback = room?.playback;
    const queue = room?.queue;
    const votes = room?.votes;
    const bridgeOk = Boolean(getApi());

    panel.innerHTML = `
      <div class="woot-panel-head">
        <div class="woot-brand">
          <h2 class="woot-title">Woot.js</h2>
          <p class="woot-subtitle">${escapeHtml(room?.room.name || "Wavez extension")}</p>
        </div>
        <span class="woot-chip">v${VERSION}</span>
      </div>
      <div class="woot-panel-body">
        <div class="woot-card">
          <div class="woot-track">${escapeHtml(playback ? `${playback.title} - ${playback.djUsername}` : "Nenhuma faixa ativa")}</div>
          <div class="woot-meta">${bridgeOk ? "Bridge conectado" : "Bridge indisponivel"} · ${escapeHtml(state.status)}</div>
        </div>
        ${toggleRow("autoWoot", "Auto-Woot", "Vota woot em cada faixa nova.")}
        ${toggleRow("autoJoin", "Auto-Join", queue?.isJoined ? "Voce esta na fila." : "Entra na fila quando possivel.")}
        ${toggleRow("applyVolume", "Volume fixo", `Define volume em ${state.settings.targetVolume}%.`)}
        <div class="woot-card">
          <div class="woot-row">
            <div class="woot-label">
              <strong>Volume</strong>
              <span>${state.settings.targetVolume}%</span>
            </div>
          </div>
          <input class="woot-range" data-volume type="range" min="0" max="100" value="${state.settings.targetVolume}" />
        </div>
        <div class="woot-actions">
          <button class="woot-action" data-action="woot">Woot agora</button>
          <button class="woot-action" data-action="join">${queue?.isJoined ? "Sair fila" : "Entrar fila"}</button>
        </div>
        <div class="woot-card">
          <div class="woot-row">
            <span class="woot-meta">Woots ${votes?.woots ?? 0}</span>
            <span class="woot-meta">Mehs ${votes?.mehs ?? 0}</span>
            <span class="woot-meta">Grabs ${votes?.grabs ?? 0}</span>
          </div>
        </div>
      </div>
      <div class="woot-status">
        <span>${room?.currentUser ? `@${escapeHtml(room.currentUser.username)}` : "Sem usuario"}</span>
        <span>${queue?.count ?? 0} na fila</span>
      </div>
    `;

    panel.querySelectorAll("[data-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.getAttribute("data-toggle");
        setSetting(key, !state.settings[key]);
      });
    });

    panel.querySelector("[data-volume]")?.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      state.settings.targetVolume = value;
      saveSettings();
      applyVolume();
      render();
    });

    panel.querySelector('[data-action="woot"]')?.addEventListener("click", () => runAutoWoot("manual"));
    panel.querySelector('[data-action="join"]')?.addEventListener("click", () => {
      const api = getApi();
      const current = getRoomState();
      if (!api || !current) {
        setStatus("Sala indisponivel");
        render();
        return;
      }
      const result = current.queue.isJoined ? api.actions.leaveQueue() : api.actions.joinQueue();
      setStatus(result.ok ? "Fila atualizada" : `Fila: ${result.code}`);
      render();
    });
  }

  function toggleRow(key, title, description) {
    return `
      <div class="woot-card">
        <div class="woot-row">
          <div class="woot-label">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(description)}</span>
          </div>
          <button class="woot-switch" data-toggle="${key}" data-on="${state.settings[key]}" type="button" aria-label="${escapeHtml(title)}"></button>
        </div>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.__WootJS = {
    togglePanel,
    destroy() {
      cleanupSubscriptions();
      document.getElementById(`${APP_ID}-button`)?.remove();
      document.getElementById(`${APP_ID}-panel`)?.remove();
      document.getElementById(`${APP_ID}-style`)?.remove();
      delete window.__WootJS;
    },
  };

  createRoot();
  subscribe();
})();

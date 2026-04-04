function cleanupPreviousArtifacts() {
  INSTANCE_KEYS.forEach((key) => {
    try {
      window[key]?.cleanup?.();
    } catch {}
  });

  DOM_IDS.forEach((id) => {
    document.getElementById(id)?.remove();
  });

  document.querySelectorAll(ROOT_SELECTOR).forEach((node) => node.remove());
}

function ensureTablerIcons() {
  if (document.getElementById(TABLER_ID)) {
    return;
  }

  const link = document.createElement("link");
  link.id = TABLER_ID;
  link.rel = "stylesheet";
  link.href = TABLER_CDN_URL;
  document.head.appendChild(link);
}

function ensureStyles() {
  document.getElementById(STYLE_ID)?.remove();

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .wavez-tools-anchor {
      display: inline-flex;
      flex: 0 0 auto;
    }

    .wf-trigger {
      height: 36px;
      min-width: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 12px;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 10px;
      background: rgba(255,255,255,0.04);
      color: rgb(250,250,250);
      font: 600 13px/1 ui-sans-serif, system-ui, sans-serif;
      white-space: nowrap;
      cursor: pointer;
      transition: border-color .15s ease, background .15s ease, color .15s ease;
    }

    .wf-trigger:hover {
      border-color: rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.08);
    }

    .wf-trigger.is-enabled {
      border-color: rgba(255,255,255,0.20);
      background: rgba(255,255,255,0.10);
    }

    .wf-trigger.is-open {
      border-color: rgba(255,255,255,0.24);
      background: rgb(39,39,42);
    }

    .wf-trigger i {
      font-size: 16px;
      line-height: 1;
    }

    .wf-trigger__label {
      display: inline;
    }

    #wavez-tools-popover {
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: min(400px, calc(100vw - 24px));
      max-height: min(80vh, 640px);
      overflow: auto;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      background: rgba(24,24,27,0.98);
      color: rgb(250,250,250);
      box-shadow: 0 24px 80px rgba(0,0,0,0.45);
      backdrop-filter: blur(14px);
      z-index: 2147483646;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(-8px) scale(.98);
      transition: opacity .16s ease, transform .16s ease, visibility 0s linear .16s;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }

    #wavez-tools-popover.is-open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(0) scale(1);
      transition: opacity .16s ease, transform .16s ease, visibility 0s linear 0s;
    }

    .wf-shell {
      padding: 16px;
      display: grid;
      gap: 12px;
    }

    .wf-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .wf-kicker {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: rgb(161,161,170);
    }

    .wf-title {
      margin: 6px 0 0;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.1;
      color: rgb(250,250,250);
    }

    .wf-subtitle {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.5;
      color: rgb(161,161,170);
    }

    .wf-close {
      width: 34px;
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      background: transparent;
      color: rgb(212,212,216);
      cursor: pointer;
    }

    .wf-close:hover {
      background: rgba(255,255,255,0.06);
    }

    .wf-card {
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      background: rgba(39,39,42,0.62);
      padding: 14px;
      display: grid;
      gap: 12px;
    }

    .wf-card__head {
      display: grid;
      gap: 4px;
    }

    .wf-card__title {
      font-size: 14px;
      font-weight: 600;
      color: rgb(250,250,250);
    }

    .wf-card__desc {
      font-size: 12px;
      line-height: 1.45;
      color: rgb(161,161,170);
    }

    .wf-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .wf-field__copy {
      min-width: 0;
      display: grid;
      gap: 4px;
    }

    .wf-field__label {
      font-size: 13px;
      font-weight: 600;
      color: rgb(250,250,250);
    }

    .wf-field__hint {
      font-size: 12px;
      line-height: 1.45;
      color: rgb(161,161,170);
    }

    .wf-segment {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      background: rgba(9,9,11,0.72);
      flex: 0 0 auto;
    }

    .wf-segment button {
      height: 30px;
      padding: 0 10px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: rgb(161,161,170);
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .wf-segment button.is-active {
      background: rgb(250,250,250);
      color: rgb(24,24,27);
    }

    .wf-switch {
      position: relative;
      width: 44px;
      height: 24px;
      flex: 0 0 auto;
    }

    .wf-switch input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }

    .wf-switch__track {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: rgba(113,113,122,0.55);
      transition: background .15s ease;
    }

    .wf-switch__thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 999px;
      background: white;
      transition: transform .15s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,.25);
    }

    .wf-switch input:checked + .wf-switch__track {
      background: rgb(244,244,245);
    }

    .wf-switch input:checked + .wf-switch__track + .wf-switch__thumb {
      transform: translateX(20px);
      background: rgb(24,24,27);
    }

    .wf-stat-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .wf-stat {
      min-width: 0;
      padding: 10px;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      background: rgba(9,9,11,0.55);
      display: grid;
      gap: 4px;
    }

    .wf-stat span {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .04em;
      text-transform: uppercase;
      color: rgb(113,113,122);
    }

    .wf-stat strong {
      font-size: 13px;
      color: rgb(250,250,250);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wf-stat small {
      font-size: 12px;
      color: rgb(161,161,170);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 1420px) {
      .wf-trigger__label {
        display: none;
      }

      .wf-trigger {
        padding: 0 10px;
      }
    }

    @media (max-width: 520px) {
      .wf-stat-grid {
        grid-template-columns: 1fr;
      }

      .wf-field {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `;

  document.head.appendChild(style);
  return style;
}

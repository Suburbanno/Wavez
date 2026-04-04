function createPopover() {
  const popover = document.createElement("div");
  popover.id = POPOVER_ID;
  popover.innerHTML = `
    <div class="wf-shell">
      <div class="wf-header">
        <div>
          <h3 class="wf-title">Tools</h3>
        </div>

        <button type="button" class="wf-close" aria-label="Fechar">
          <i class="ti ti-x"></i>
        </button>
      </div>

      <section class="wf-card">
        <div class="wf-card__head">
          <div class="wf-card__title">Automations</div>
        </div>

        <div class="wf-field">
          <div class="wf-field__copy">
            <div class="wf-field__label">Auto vote</div>
            <div class="wf-field__hint">Vota automaticamente em toda musica nova.</div>
          </div>

          <div class="wf-segment">
            <button type="button" data-wf-vote-mode="off">Off</button>
            <button type="button" data-wf-vote-mode="woot">Woot</button>
            <button type="button" data-wf-vote-mode="meh">Meh</button>
          </div>
        </div>

        <div class="wf-field">
          <div class="wf-field__copy">
            <div class="wf-field__label">Auto join queue</div>
            <div class="wf-field__hint">Tenta entrar quando a fila estiver disponivel.</div>
          </div>

          <label class="wf-switch">
            <input id="wf-auto-join" type="checkbox">
            <span class="wf-switch__track"></span>
            <span class="wf-switch__thumb"></span>
          </label>
        </div>
      </section>

      <section class="wf-card">
        <div class="wf-card__head">
          <div class="wf-card__title">Live state</div>
        </div>

        <div class="wf-stat-grid">
          <div class="wf-stat">
            <span>Sala</span>
            <strong id="wf-room-text"></strong>
            <small id="wf-room-meta"></small>
          </div>

          <div class="wf-stat">
            <span>Playback</span>
            <strong id="wf-track-text"></strong>
            <small id="wf-track-meta"></small>
          </div>

          <div class="wf-stat">
            <span>Votes</span>
            <strong id="wf-votes-text"></strong>
            <small id="wf-votes-meta"></small>
          </div>

          <div class="wf-stat">
            <span>Queue</span>
            <strong id="wf-queue-text"></strong>
            <small id="wf-queue-meta"></small>
          </div>

          <div class="wf-stat">
            <span>Users</span>
            <strong id="wf-users-text"></strong>
            <small id="wf-users-meta"></small>
          </div>
        </div>
      </section>
    </div>
  `;

  document.body.appendChild(popover);

  return {
    popover,
    refs: {
      close: popover.querySelector(".wf-close"),
      autoJoin: popover.querySelector("#wf-auto-join"),
      autoVoteButtons: Array.from(popover.querySelectorAll("[data-wf-vote-mode]")),
      roomText: popover.querySelector("#wf-room-text"),
      roomMeta: popover.querySelector("#wf-room-meta"),
      trackText: popover.querySelector("#wf-track-text"),
      trackMeta: popover.querySelector("#wf-track-meta"),
      votesText: popover.querySelector("#wf-votes-text"),
      votesMeta: popover.querySelector("#wf-votes-meta"),
      queueText: popover.querySelector("#wf-queue-text"),
      queueMeta: popover.querySelector("#wf-queue-meta"),
      usersText: popover.querySelector("#wf-users-text"),
      usersMeta: popover.querySelector("#wf-users-meta"),
    },
  };
}

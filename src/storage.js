function loadSavedState() {
  const raw =
    localStorage.getItem(STORAGE_KEY) ||
    LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) ||
    "{}";

  return parseJson(raw);
}

function persistState(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        autoVote: state.autoVote,
        autoJoin: state.autoJoin,
        lastPlaybackKey: state.lastPlaybackKey,
      })
    );
  } catch {}
}

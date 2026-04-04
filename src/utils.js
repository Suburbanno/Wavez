function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseJson(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function isVisible(element) {
  if (!element || !element.isConnected || element.getClientRects().length === 0) {
    return false;
  }

  const styles = window.getComputedStyle(element);
  return styles.display !== "none" && styles.visibility !== "hidden";
}

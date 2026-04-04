const INSTANCE_KEY = "__wavezToolsNeutral";
const INSTANCE_KEYS = [
  "__wavezAiControls",
  "__wavezToolsDropdown",
  "__wavezToolsPopover",
  "__wavezToolsShadcn",
  "__wavezToolsNeutral",
];

const STORAGE_KEY = "wavez-tools-neutral-v6";
const LEGACY_STORAGE_KEYS = [
  "wavez-tools-neutral-v5",
  "wavez-tools-shadcn-v4",
  "wavez-tools-popover-v3",
  "wavez-tools-dropdown-v2",
  "wavez-ai-controls-v1",
];

const DOM_IDS = [
  "wavez-ai-style",
  "wavez-ai-modal",
  "wavez-ai-button-wrap",
  "wavez-tools-style",
  "wavez-tools-panel",
  "wavez-tools-popover",
];

const ROOT_SELECTOR = ".wavez-tools-anchor";
const TOOL_BUTTON_SELECTOR =
  'button[aria-label="Ferramentas da sala"], button[aria-label="Room tools"]';
const ROOM_EVENTS = [
  "room_changed",
  "playback_changed",
  "votes_changed",
  "queue_changed",
  "users_changed",
  "chat_message",
];

const TABLER_ID = "wavez-tools-tabler-icons";
const STYLE_ID = "wavez-tools-style";
const POPOVER_ID = "wavez-tools-popover";
const TABLER_CDN_URL =
  "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css";

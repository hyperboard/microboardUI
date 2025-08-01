import { cleanupListeners, initListeners } from "./controlsHandlers";

type ClickHandler = (
  this: GlobalEventHandlers,
  ev: MouseEvent,
) => void | Promise<void>;

const isSnapshotInIframe =
  window.parent &&
  window.parent !== window &&
  window.parent.location.href.includes("/snapshots/");

type ButtonTypes = "editButton" | "shareButton";
interface ButtonEntry {
  button: HTMLButtonElement;
  text: HTMLElement;
  defaultText: string;
  icon?: SVGElement;
}
type Buttons = Record<ButtonTypes, ButtonEntry>;

// style constants
const TITLE_PANEL_STYLES: Record<string, string> = {
  boxShadow: "0px 10px 16px -3px rgba(20, 21, 26, 0.08)",
  position: "fixed",
  left: "12px",
  top: "12px",
  borderRadius: "12px",
  backgroundColor: "#fff",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "0 12px",
  height: "48px",
};
const BUTTON_STYLES: Record<string, string> = {
  backgroundColor: "rgba(20, 21, 26, 1)",
  cursor: "pointer",
  boxShadow: "0px 1px 2px 0px rgba(20, 21, 26, 0.05)",
  color: "#fff",
  fontSize: "14px",
  lineHeight: "20px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px",
  borderRadius: "10px",
};
const TEXT_DEAFULT: Record<ButtonTypes, string> = {
  editButton: isSnapshotInIframe ? "Edit copy" : "Edit file",
  shareButton: "Share with friends",
};

let buttons: Buttons;

function applyStyles(
  el: HTMLElement | SVGElement,
  styles: Record<string, string>,
): void {
  Object.entries(styles).forEach(([key, value]) => {
    el.style[key] = value;
  });
}

function createSvgIcon(
  pathData: string,
  width = 16,
  height = 16,
  viewBox = "0 0 16 16",
  fill = "#FFFFFF",
): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("fill", "none");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.setAttribute("fill", fill);
  svg.appendChild(path);
  return svg;
}

function onClickWrapper(
  handler: ClickHandler,
  button: ButtonEntry,
): EventListener {
  return async function (this: GlobalEventHandlers, ev: Event) {
    const mouseEvent = ev as MouseEvent;
    setLoadingState(true, button);
    try {
      await handler.call(this, mouseEvent);
    } finally {
      setLoadingState(false, button);
    }
  };
}

function setLoadingState(
  loading: boolean,
  { button, text, defaultText }: ButtonEntry,
): void {
  const loadingText = "Loading…";
  button.disabled = loading;
  text.textContent = loading ? loadingText : defaultText;
}

async function handleEdit(this: GlobalEventHandlers, ev: MouseEvent) {
  ev.preventDefault();

  const module = await import(
    "https://www.unpkg.com/microboard-ui-temp/dist/index.js"
  );
  module.initInter();

  const app = module.createApp();
  window.app = app;

  const content = await app.openAndEditFile();
  if (content) {
    cleanupListeners();
    await app.openBoardFromFile();
    app.getBoard().deserializeHTML(content);
    app.localRender("items");
    await injectStyles();
    await injectSprite();
  }
}

async function handleShare(this: GlobalEventHandlers, ev: MouseEvent) {
  ev.preventDefault();
  const html = document.documentElement.innerHTML;
  const name = getBoardName();

  const { boardsApi, api } = await import(
    "https://www.unpkg.com/microboard-ui-temp/dist/index.js"
  );
  api.updateURL("https://dev-app.microboard.io/api/v1");

  const res = await boardsApi.createBoard({
    title: name,
    isPublic: true,
  });
  await boardsApi.publishSnapshot(html, res.data.id, res.data.id);
  window.location.href = `https://dev-app.microboard.io/boards/${res.data.id}`;
}

async function injectStyles() {
  const resp = await fetch(
    "https://www.unpkg.com/microboard-ui-temp/dist/index.css",
  );
  const css = await resp.text();
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}

async function injectSprite() {
  const resp = await fetch(
    "https://www.unpkg.com/microboard-ui-temp/dist/sprite.svg",
  );
  const svgText = await resp.text();
  const div = document.createElement("div");
  div.style.display = "none";
  div.id = "sprite";
  div.innerHTML = svgText;
  document.body.appendChild(div);
}

function getBoardName(): string {
  return document.title.trim() || "Shared Board";
}

function createTitlePanel(): HTMLDivElement {
  const panel = document.createElement("div");
  applyStyles(panel, TITLE_PANEL_STYLES);

  // board info
  const fileIconD =
    "M10.5 2.33341H2.16667V15.6667H13.8333V5.66675H10.5V2.33341ZM0.5 1.49341C0.5 1.03675 0.8725 0.666748 1.3325 0.666748H11.3333L15.5 4.83342V16.4942C15.5008 16.6037 15.48 16.7122 15.4388 16.8136C15.3976 16.915 15.3369 17.0073 15.2601 17.0852C15.1832 17.1631 15.0918 17.2252 14.991 17.2678C14.8902 17.3103 14.7819 17.3327 14.6725 17.3334H1.3275C1.10865 17.3319 0.899181 17.2443 0.744348 17.0897C0.589515 16.935 0.501746 16.7256 0.5 16.5067V1.49341ZM7.16667 8.16675V5.66675H8.83333V8.16675H11.3333V9.83342H8.83333V12.3334H7.16667V9.83342H4.66667V8.16675H7.16667Z";
  const fileIcon = createSvgIcon(
    fileIconD,
    16,
    18,
    "0 0 16 18",
    "rgba(105,107,118,1)",
  );
  const title = document.createElement("p");
  title.textContent = getBoardName();
  title.style.fontSize = "16px";
  title.style.lineHeight = "24px";
  const nameWrapper = document.createElement("div");
  applyStyles(nameWrapper, {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  });
  nameWrapper.append(fileIcon, title);

  panel.append(nameWrapper);

  // separator
  const sep = document.createElement("div");
  sep.style.borderRight = "1px solid rgba(222,224,227,1)";
  sep.style.height = "100%";
  panel.append(sep);

  const editSvg = createSvgIcon(
    "M7.838 0.999902V2.33324H1.33333V11.6666H10.6667V5.1619H12V12.3332C12 12.51 11.9298 12.6796 11.8047 12.8046C11.6797 12.9297 11.5101 12.9999 11.3333 12.9999H0.666667C0.489856 12.9999 0.320286 12.9297 0.195262 12.8046C0.0702379 12.6796 0 12.51 0 12.3332V1.66657C0 1.48976 0.0702379 1.32019 0.195262 1.19516C0.320286 1.07014 0.489856 0.999902 0.666667 0.999902H7.838ZM11.1847 0.872018C11.4453 0.611315 11.868 0.611355 12.1285 0.872108C12.3889 1.1327 12.3889 1.55503 12.1284 1.81553L6.472 7.4719L5.53067 7.4739L5.52933 6.52924L11.1847 0.872018Z",
    13,
    13,
    "0 0 13 13",
  );

  const editButton = createButton("editButton", handleEdit, editSvg);
  const shareButton = createButton("shareButton", handleShare);
  buttons = { editButton, shareButton };
  panel.append(editButton.button, shareButton.button);
  return panel;
}

function createButton(
  buttonType: ButtonTypes,
  handler: ClickHandler,
  icon?: SVGSVGElement,
): ButtonEntry {
  const button = document.createElement("button");
  applyStyles(button, BUTTON_STYLES);
  if (icon) {
    button.appendChild(icon);
  }
  const defaultText = TEXT_DEAFULT[buttonType];
  const text = document.createElement("p");
  text.textContent = defaultText;
  button.append(text);
  const buttonWrapper = { button, text, defaultText, icon };

  button.addEventListener("click", onClickWrapper(handler, buttonWrapper));
  return buttonWrapper;
}

function initUI(): void {
  const panel = createTitlePanel();
  document.body.append(panel);
}

document.addEventListener("DOMContentLoaded", initListeners);
document.addEventListener("DOMContentLoaded", initUI);

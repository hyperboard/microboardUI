import React from "react";
import { getOverlayIconAsset } from "microboard-temp/overlay-icon-manifest";
import type { OverlayIcon } from "microboard-temp";
import { Icon } from "shared/ui-lib/Icon";
import styles from "./OverlayUi.module.css";

function decodeSvgDataUrl(dataUrl: string): string | null {
  if (!dataUrl.startsWith("data:image/svg+xml")) {
    return null;
  }

  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return null;
  }

  const metadata = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);

  try {
    if (metadata.includes(";base64")) {
      return atob(payload);
    }

    return decodeURIComponent(payload);
  } catch {
    return null;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasLocalSymbol(symbolId: string | undefined): boolean {
  if (!symbolId || typeof document === "undefined") {
    return false;
  }

  return Boolean(document.getElementById(symbolId));
}

function getOverlayAssetDataUrl(icon: OverlayIcon | undefined): string | null {
  if (!icon) {
    return null;
  }

  if (icon.kind === "asset") {
    return getOverlayIconAsset(icon.path) ?? null;
  }

  if (!icon.sourcePath) {
    return null;
  }

  return getOverlayIconAsset(icon.sourcePath) ?? null;
}

function getOverlaySymbolSvg(icon: OverlayIcon | undefined): string | null {
  if (!icon || icon.kind !== "symbol" || !icon.sourcePath) {
    return null;
  }

  const spriteDataUrl = getOverlayIconAsset(icon.sourcePath);
  if (!spriteDataUrl) {
    return null;
  }

  const spriteSvg = decodeSvgDataUrl(spriteDataUrl);
  if (!spriteSvg) {
    return null;
  }

  const symbolMatch = spriteSvg.match(
    new RegExp(
      `<symbol\\b([^>]*)\\bid=(["'])${escapeRegExp(icon.key)}\\2([^>]*)>([\\s\\S]*?)<\\/symbol>`,
      "i",
    ),
  );
  if (!symbolMatch) {
    return null;
  }

  const attributes = `${symbolMatch[1]} ${symbolMatch[3]}`;
  const body = symbolMatch[4];
  const viewBoxMatch = attributes.match(/viewBox=(["'])(.*?)\1/i);
  const fillMatch = attributes.match(/fill=(["'])(.*?)\1/i);

  const svgAttributes = [
    'xmlns="http://www.w3.org/2000/svg"',
    viewBoxMatch ? `viewBox="${viewBoxMatch[2]}"` : "",
    fillMatch ? `fill="${fillMatch[2]}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<svg ${svgAttributes}>${body}</svg>`;
}

export function OverlayMetadataIcon({
  icon,
  label,
  size = 24,
}: {
  icon?: OverlayIcon;
  label?: string;
  size?: number;
}): React.ReactElement {
  const assetDataUrl = getOverlayAssetDataUrl(icon);
  const symbolSvg = getOverlaySymbolSvg(icon);
  const localSymbolId = icon?.kind === "symbol" ? icon.key : undefined;

  if (icon?.kind === "asset" && assetDataUrl) {
    return (
      <img
        className={styles.assetImage}
        style={{ width: size, height: size }}
        src={assetDataUrl}
        alt=""
        aria-hidden
      />
    );
  }

  if (symbolSvg) {
    return (
      <span
        className={styles.assetIcon}
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: symbolSvg }}
      />
    );
  }

  if (icon?.kind === "symbol" && hasLocalSymbol(localSymbolId)) {
    return (
      <svg width={size} height={size} fill="none">
        <use href={`#${localSymbolId}`} />
      </svg>
    );
  }

  if (label) {
    return (
      <span
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(10, Math.floor(size / 2.4)),
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {label.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return <Icon iconName="Gear" width={size} height={size} />;
}

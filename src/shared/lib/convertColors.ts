export const convertHexToRGBA = (hex: string, rgba = true, alpha = 0.5) => {
  const tempHex = hex.replace("#", "");
  const r = parseInt(tempHex.substring(0, 2), 16);
  const g = parseInt(tempHex.substring(2, 4), 16);
  const b = parseInt(tempHex.substring(4, 6), 16);

  return rgba ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
};

export function rgbToRgba(rgbColor: string, alpha = 0.5, defaultColor: string) {
  const rgb = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!rgb) {
    return defaultColor;
  }
  const [r, g, b] = rgb.slice(1);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rgbaToRgb(rgbaColor: string, defaultColor: string) {
  try {
    const rgba = rgbaColor.match(
      /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(?:\.\d+)?)\)$/,
    );
    if (!rgba) {
      return defaultColor;
    }
    const [r, g, b, a] = rgba.slice(1);
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return defaultColor;
  }
}

export function rgbToHex(rgb: string) {
  let r, g, b;

  const rgbArr = rgb.match(/\d+/g);
  if (!rgbArr) {
    return "#000000";
  }
  [r, g, b] = rgbArr.map(Number);

  const clamp = (value: number) => Math.min(255, Math.max(0, value));

  const toHex = (n: number) => {
    const hex = clamp(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
}

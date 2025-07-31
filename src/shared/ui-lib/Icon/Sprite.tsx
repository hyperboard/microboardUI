import React from "react";
import sprite from "./sprite.svg";

export function Sprite() {
  return (
    <div
      id="sprite"
      aria-hidden
      style={{ display: "none" }}
      dangerouslySetInnerHTML={{ __html: sprite }}
    />
  );
}

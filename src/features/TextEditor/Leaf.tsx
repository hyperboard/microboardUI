import React from "react";
import { RenderLeafProps } from "slate-react";
import type { TextNode } from "microboard-temp";

interface LeafProps extends RenderLeafProps {
  fontSize?: number;
  isAutoSize?: boolean;
}

export function Leaf(props: LeafProps): React.ReactElement {
  const { attributes } = props;
  const leaf = props.leaf as RenderLeafProps["leaf"] & Partial<TextNode>;
  const text = props.text as RenderLeafProps["text"] & Partial<TextNode>;
  let { children } = props;
  const styles = new Set<string>();
  if (leaf.bold) {
    styles.add("bold");
  }
  if (leaf.italic) {
    styles.add("italic");
  }
  if (leaf.underline || !!text.link) {
    styles.add("underline");
  }
  if (leaf["line-through"]) {
    styles.add("line-through");
  }
  if (leaf.subscript) {
    styles.add("sub");
  }
  if (leaf.superscript) {
    styles.add("super");
  }
  for (const style of styles) {
    switch (style) {
      case "bold":
        children = <strong>{children}</strong>;
        break;
      case "italic":
        children = <em>{children}</em>;
        break;
      case "underline":
        children = <u>{children}</u>;
        break;
      case "line-through":
        children = <s>{children}</s>;
        break;
      case "sub":
        children = <sub>{children}</sub>;
        break;
      case "super":
        children = <sup>{children}</sup>;
        break;
    }
  }

  return (
    <span
      {...attributes}
      style={{
        color: text.fontColor,
        backgroundColor: text.fontHighlight,
        fontSize: text.fontSize,
        /* lineHeight: lineHeight + 'px', */
        fontFamily: text.fontFamily,
      }}
    >
      {children}
    </span>
  );
}

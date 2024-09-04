import React from "react";
import { RenderLeafProps } from "slate-react";

export function Leaf(props: RenderLeafProps): React.ReactElement {
	const { attributes, leaf } = props;
	let { children } = props;
	const styles = new Set<string>();
	if (leaf.bold) {
		styles.add("bold");
	}
	if (leaf.italic) {
		styles.add("italic");
	}
	if (leaf.underline) {
		styles.add("underline");
	}
	if (leaf["line-through"]) {
		styles.add("line-through");
	}
	if (leaf.sub) {
		styles.add("sub");
	}
	if (leaf.super) {
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
	const fontSize = props.text.fontSize;

	return (
		<span
			{...attributes}
			style={{
				color: props.text.fontColor,
				backgroundColor: props.text.fontHighlight,
				fontSize,
				/* lineHeight: lineHeight + 'px', */
				fontFamily: props.text.fontFamily,
			}}
		>
			{children}
		</span>
	);
}

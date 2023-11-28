import React from "react";
import { RenderElementProps } from "slate-react";

export function Element(props: RenderElementProps): React.ReactElement {
	const { attributes, element, children } = props;
	switch (element.type) {
		case "paragraph":
			return (
				<p
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
						margin: 0,
					}}
				>
					{children}
				</p>
			);
		case "bulleted-list":
			return (
				<ul
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
					}}
				>
					{children}{" "}
				</ul>
			);
		case "numbered-list":
			return (
				<ol
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
					}}
				>
					{children}
				</ol>
			);
		case "block-quote":
			return (
				<blockquote
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
					}}
				>
					{children}
				</blockquote>
			);
		case "heading":
			return (
				<h1
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
					}}
				>
					{children}
				</h1>
			);
		case "list-item":
			return <li {...attributes}>{children}</li>;
	}
}

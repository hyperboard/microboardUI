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
						paddingTop: "0.25em",
					}}
				>
					{children}
				</p>
			);
		case "ul_list":
			return (
				<ul
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
						margin: 0,
						paddingLeft: "16px",
						whiteSpace: "nowrap",
					}}
				>
					{children}
				</ul>
			);
		case "ol_list":
			return (
				<ol
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
						margin: 0,
						paddingLeft: "16px",
						whiteSpace: "nowrap",
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
		case "heading_one":
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
		case "heading_two":
			return (
				<h2
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
					}}
				>
					{children}
				</h2>
			);
		case "heading_three":
			return (
				<h3
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
					}}
				>
					{children}
				</h3>
			);
		case "heading_four":
			return (
				<h4
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
					}}
				>
					{children}
				</h4>
			);
		case "heading_five":
			return (
				<h5
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
					}}
				>
					{children}
				</h5>
			);
		case "code_block":
			return (
				<code
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
						margin: 0,
					}}
				>
					{children}
				</code>
			);
		case "list_item":
			return (
				<li
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
						margin: 0,
						paddingLeft: "24px",
						paddingTop: "0.25em",
						whiteSpace: "pre-wrap",
					}}
				>
					{children}
				</li>
			);
		case "hyper-link":
			return (
				<a href={element.url} {...attributes}>
					{children}
				</a>
			);
		default:
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
	}
}

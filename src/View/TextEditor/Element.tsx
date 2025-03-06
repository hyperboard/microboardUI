import React from "react";
import { RenderElementProps } from "slate-react";
import styles from "./TextEditor.module.css";

export function Element(props: RenderElementProps): React.ReactElement {
	const { attributes, element, children } = props;
	switch (element.type) {
		case "paragraph":
			return (
				<p
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
						paddingTop: `${element.paddingTop ?? 0}em`,
						paddingBottom: `${element.paddingBottom ?? 0}em`,
						margin: 0,
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
						paddingTop: `${element.paddingTop ?? 0}em`,
						paddingBottom: `${element.paddingBottom ?? 0}em`,
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
						paddingTop: `${element.paddingTop ?? 0}em`,
						paddingBottom: `${element.paddingBottom ?? 0}em`,
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
						paddingTop: `${element.paddingTop ?? 0}em`,
						paddingBottom: `${element.paddingBottom ?? 0}em`,
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
						paddingTop: `${element.paddingTop ?? 0}em`,
						paddingBottom: `${element.paddingBottom ?? 0}em`,
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
						paddingTop: `${element.paddingTop ?? 0}em`,
						paddingBottom: `${element.paddingBottom ?? 0}em`,
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
						paddingTop: `${element.paddingTop ?? 0}em`,
						paddingBottom: `${element.paddingBottom ?? 0}em`,
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
						paddingTop: `${element.paddingTop ?? 0}em`,
						paddingBottom: `${element.paddingBottom ?? 0}em`,
					}}
				>
					{children}
				</code>
			);
		case "list_item":
			return (
				<li
					{...attributes}
					className={styles.listItem}
					style={{
						textAlign: props.element.horisontalAlignment,
						margin: 0,
						paddingTop: `${element.paddingTop ?? 0}em`,
						paddingBottom: `${element.paddingBottom ?? 0}em`,
						whiteSpace: "pre-wrap",
						fontSize: "14px",
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
				<span
					{...attributes}
					style={{
						textAlign: props.element.horisontalAlignment,
						margin: 0,
					}}
				>
					{children}
				</span>
			);
	}
}

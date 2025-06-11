import React from "react";
import { RenderElementProps } from "slate-react";
import styles from "./TextEditor.module.css";
import { TextNode, BlockNode } from "microboard-temp";

export function Element(props: RenderElementProps): React.ReactElement {
	const { attributes, element, children } = props;
	function getFontSize(node: BlockNode | TextNode): number {
		if ("fontSize" in node) {
			return node.fontSize === "auto" ? 14 : (node.fontSize ?? 14);
		}
		if ("children" in node && node.children[0]) {
			return getFontSize(node.children[0]);
		}

		return 14;
	}
	const fontSize = getFontSize(element);
	function getListMarkType(depth: number) {
		const cycle = (depth - 1) % 3;

		switch (cycle) {
			case 0:
				return styles.listLevel1;
			case 1:
				return styles.listLevel2;
			case 2:
				return styles.listLevel3;
			default:
				return styles.listLevel1;
		}
	}
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
						paddingLeft: `${(fontSize / 14) * 16}px`,
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
						paddingLeft: `${(fontSize / 14) * 16}px`,
						whiteSpace: "nowrap",
					}}
					className={getListMarkType(element.listLevel || 1)}
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
						fontSize: `${fontSize}px`,
						listStyle:
							element.children[0].type === "ul_list" ||
							element.children[0].type === "ol_list"
								? "none"
								: "inherit",
					}}
				>
					{children}
				</li>
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

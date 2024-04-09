import { TextStyle } from "Board/Items/RichText";
import * as React from "react";
import { Button } from "View/ContextPanel/Button";
import { BoldIcon } from "View/Icon/TextStyle/BoldIcon";
import { ItalicsIcon } from "View/Icon/TextStyle/ItalicsIcon";
import { StrikethroughIcon } from "View/Icon/TextStyle/StrikethroughIcon";
import { UnderlineIcon } from "View/Icon/TextStyle/UnderlineIcon";

interface Props {
	onPick: (style: TextStyle) => void;
}

export function FontStylePicker(props: Props): React.ReactElement {
	return (
		<>
			<Button
				id="ChangeFontBold"
				key="ChangeFontBold"
				title="Bold"
				hotkey="Ctrl + B"
				onClick={() => {
					props.onPick("bold");
				}}
				margin={0}
			>
				<BoldIcon isOn={true} width={24} height={24} />
			</Button>
			<Button
				id="ChangeFontItalics"
				key="ChangeFontItalics"
				title="Italics"
				hotkey="Ctrl + I"
				onClick={() => {
					props.onPick("italic");
				}}
				margin={0}
			>
				<ItalicsIcon width={24} height={24} />
			</Button>
			<Button
				id="ChangeFontUnderline"
				key="ChangeFontUnderline"
				title="Underline"
				hotkey="Ctrl + U"
				onClick={() => {
					props.onPick("underline");
				}}
				margin={0}
				tipWidth={140}
			>
				<UnderlineIcon width={24} height={24} />
			</Button>
			<Button
				id="ChangeFontStrikethrough"
				key="ChangeFontStrikethrough"
				title="Strikethrough"
				hotkey="Ctrl + S"
				onClick={() => {
					props.onPick("line-through");
				}}
				margin={0}
				tipWidth={155}
			>
				<StrikethroughIcon width={24} height={24} />
			</Button>
		</>
	);
}

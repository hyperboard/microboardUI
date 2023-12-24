import * as React from "react";
import {ColorPicker} from "./ColorPicker";

export const stickerColors = {
    "blue": "rgb(174, 212, 250)",
    "yellow": "rgb(252, 245, 174)",
    "green": "rgba(175, 214, 167, 1)",
    "purple": "rgba(233, 191, 233, 1)",
    "cyan": "rgba(171, 221, 221, 1)",
    "red": "rgba(246, 168, 168, 1)",
    "gray": "rgba(230, 230, 230, 1)",
} as {[color: string]: string};

export function StickerColorPicker({
                                onPick
                            }: {
    onPick: (color: string) => void;
}): React.ReactElement {
    return <ColorPicker allowNone={false} onPick={onPick} list={stickerColors}></ColorPicker>;
}
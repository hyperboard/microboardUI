import React, { useEffect, useRef, useState } from "react";
import { Connector, Item } from "../../../Board/Items";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppContext } from "features/AppContext";
import { Icon } from "../../../shared/ui-lib/Icon";
import styles from "./LinkToButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { createPortal } from "react-dom";

async function getFavicon(url: string): Promise<string | undefined> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return undefined;
		}
		const text = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, "text/html");

		const iconLink = doc.querySelector(
			'link[rel="icon"], link[rel="shortcut icon"]',
		);

		if (iconLink && iconLink.getAttribute("href")) {
			return new URL(iconLink.getAttribute("href")!, url).href;
		} else {
			return undefined;
		}
	} catch {
		return undefined;
	}
}

interface Props {
	item: Item;
	handleClick: (item: Item) => void;
}

export const LinkToButton = ({ item, handleClick }: Props): JSX.Element => {
	const linkToButtonRef = useRef<HTMLButtonElement | null>(null);
	const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const { app, board } = useAppContext();
	const closeTooltipTimeoutId = useRef<number | undefined>();

	const mbr = useDomMbr({
		app,
		board,
		ref: linkToButtonRef,
		targetMbr:
			item instanceof Connector
				? item.endPointer.path.getMbr()
				: item.getMbr(),
		subjects: ["camera", "selection"],
		fit: "linkToBtn",
	});

	useEffect(() => {
		let url: string | undefined = undefined;
		try {
			url = `${new URL(item.getLinkTo()!).origin}/favicon.ico`;
		} catch {}

		if (url !== iconUrl) {
			setIconUrl(url);
		}
	}, [item.getLinkTo()]);

	const setIcon = async (): Promise<void> => {
		if (!item.getLinkTo() || !iconUrl) {
			return;
		}
		const favicon = await getFavicon(new URL(item.getLinkTo()!).origin);

		if (favicon && favicon !== iconUrl) {
			setIconUrl(favicon);
		} else {
			setIconUrl(undefined);
		}
	};

	const closeTooltip = () => {
		closeTooltipTimeoutId.current = setTimeout(
			() => setIsTooltipOpen(false),
			50,
		);
	};

	const openTooltip = () => {
		if (closeTooltipTimeoutId.current) {
			clearTimeout(closeTooltipTimeoutId.current);
			closeTooltipTimeoutId.current = undefined;
		}
		setIsTooltipOpen(true);
	};

	return (
		<div onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
			<UiButton
				style={{
					position: "absolute",
					left: mbr.left,
					top: mbr.top,
					zIndex: board.getZIndex(item),
				}}
				className={styles.btn}
				ref={linkToButtonRef}
				onClick={() => handleClick(item)}
				variant="secondary"
				rounded="none"
			>
				<LinkTooltip
					link={item.getLinkTo()}
					isOpen={isTooltipOpen}
					onClick={() => handleClick(item)}
					left={mbr.left}
					top={mbr.top + 24}
					openTooltip={openTooltip}
					closeTooltip={closeTooltip}
				/>
				{iconUrl ? (
					<img
						ref={imgRef}
						className={styles.icon}
						src={iconUrl}
						alt="#"
						onError={setIcon}
					/>
				) : (
					<Icon iconName="linkTo" width={16} height={16} />
				)}
			</UiButton>
		</div>
	);
};

interface LinkTooltipProps {
	top: number;
	left: number;
	link?: string;
	onClick: () => void;
	isOpen: boolean;
	openTooltip: () => void;
	closeTooltip: () => void;
}

const LinkTooltip = ({
	top,
	left,
	link,
	onClick,
	isOpen,
	openTooltip,
	closeTooltip,
}: LinkTooltipProps) => {
	if (!link || !isOpen) {
		return null;
	}
	return createPortal(
		<div
			onMouseEnter={openTooltip}
			onMouseLeave={closeTooltip}
			onClick={onClick}
			className={styles.tooltip}
			style={{
				top,
				left,
			}}
		>
			{link}
		</div>,
		document.body,
	);
};

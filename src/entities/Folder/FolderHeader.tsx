import React, {
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";
import { DraggingWrapper } from "./DraggingWrapper";
import { useSortable } from "@dnd-kit/sortable";
import { DraggingItem } from "./DraggingItem";
import { Icon } from "shared/ui-lib/Icon";
import styles from "./Folder.module.css";
import clsx from "clsx";

type Props = {
	toggle: () => void;
	isOpen: boolean;
	id: number;
	title: string;
	icon: ReactNode;
};

export function FolderHeader({ toggle, isOpen, id, title, icon }: Props) {
	const itemRef = useRef<HTMLDivElement | null>(null);
	const {
		attributes,
		listeners,
		setNodeRef: setNodeRefHeader,
		transform,
		isDragging,
	} = useSortable({ id });
	const [originalPosition, setOriginalPosition] = useState<
		Record<"left" | "top" | "width" | "height", number>
	>({ left: 0, top: 0, width: 0, height: 0 });
	const currentFolderRef = useRef<HTMLButtonElement>(null);

	const style: CSSProperties | undefined = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				zIndex: 10000,
			}
		: undefined;

	const calcOriginalPosition = () => {
		if (isDragging && itemRef.current) {
			const rect = itemRef.current.getBoundingClientRect();
			setOriginalPosition({
				top: rect.y,
				left: rect.x,
				width: rect.width,
				height: rect.height,
			});
		}
	};
	useEffect(() => {
		calcOriginalPosition();
		document.addEventListener("scroll", calcOriginalPosition, true);

		return () => {
			document.removeEventListener("scroll", calcOriginalPosition, true);
		};
	}, [isDragging]);
	return (
		<DraggingWrapper
			isDragging={isDragging}
			style={{ ...style, ...originalPosition }}
			draggableItem={
				<DraggingItem
					style={{
						width: originalPosition.width,
						height: originalPosition.height,
					}}
					name={title}
					icon={
						<span className={styles.icon}>
							{/* <Icon
								width={20}
								height={20}
								iconName={folderIcons[folder.type]}
							/> */}
							{icon}
						</span>
					}
				/>
			}
		>
			<div
				className={styles.wrapper}
				{...listeners}
				{...attributes}
				ref={node => {
					setNodeRefHeader(node);
					itemRef.current = node;
				}}
			>
				<button
					className={styles.contextMenuBtn}
					onClick={handleContextMenuOpen}
					onMouseDown={stopPropagation}
					onMouseUp={stopPropagation}
				>
					<Icon width={16} height={16} iconName="ThreeDots" />
				</button>
				<button
					ref={currentFolderRef}
					className={clsx(styles.header, isOver && styles.over)}
					onClick={handleClick(toggle)}
					onContextMenu={handleContextMenuOpen}
				>
					<span className={styles.icon}>
						<Icon
							width={20}
							height={20}
							iconName={isOpen ? "ArrowUp" : "ArrowDown"}
						/>
						{icon}
					</span>
					{isRenaming ? <RenameInput /> : <span>{folder.title}</span>}
				</button>
			</div>
		</DraggingWrapper>
	);
}

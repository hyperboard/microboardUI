import React, { useEffect, useRef, useState } from "react";
import ReactJson from "react-json-view";
import { BoardEvent } from "Board/Events/Events";
import PrettifiedEvent from "./PrettifiedEvent";

interface EventProps {
	event: BoardEvent;
}

const EventComponent: React.FC<EventProps> = ({ event }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [firstSpan, setFirstSpan] = useState<null | HTMLSpanElement>(null);
	const [spanStyle, setSpanStyle] = useState<React.CSSProperties>({});

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}
		setFirstSpan(containerRef.current.querySelector("span"));
	}, []);

	useEffect(() => {
		if (firstSpan) {
			const rect = firstSpan.getBoundingClientRect();
			setSpanStyle({
				position: "absolute",
				top: `-1px`,
				left: `${rect.width + 50}px`,
				overflow: "visible",
				width: "auto",
				whiteSpace: "nowrap",
			});
		}
	}, [firstSpan]);

	return (
		<div
			ref={containerRef}
			style={{
				position: "relative",
				display: "flex",
				width: "100%",
				alignItems: "flex-start",
			}}
		>
			<ReactJson
				src={event}
				collapsed={true}
				name={false}
				displayDataTypes={false}
				displayObjectSize={false}
				quotesOnKeys={false}
				enableClipboard={false}
			/>
			<PrettifiedEvent event={event} style={spanStyle} />
		</div>
	);
};

export default EventComponent;

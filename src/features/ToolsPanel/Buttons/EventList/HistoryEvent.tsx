import React, { useRef } from "react";
import { BoardEvent } from "microboard-temp";
import PrettifiedEvent from "./PrettifiedEvent";

interface EventProps {
	event: BoardEvent;
}

const EventComponent: React.FC<EventProps> = ({ event }) => {
	const containerRef = useRef<HTMLDivElement>(null);

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
			{/* TODO add json visualizer */}
			<PrettifiedEvent event={event} />
		</div>
	);
};

export default EventComponent;

import React, { useRef } from "react";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useAppContext } from "../../features/AppContext";
import { VideoPlayer } from "features/VideoPlayer/VideoPlayer";
import { VideoItem } from "Board/Items/Video/Video";
import { VideoCanvasControls } from "features/VideoPlayer/VideoCanvasControls";

export const VideosProvider = (): JSX.Element => {
	const { board } = useAppContext();
	const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
	const forceUpdate = useForceUpdate();

	useAppSubscription({
		subjects: ["items", "camera", "tools", "selectionItems", "selection"],
		observer: () => {
			forceUpdate();
		},
	});

	const playingVideos = board.items
		.listAll()
		.filter(
			item => item.itemType === "Video" && item.getIsPlaying(),
		) as VideoItem[];

	return (
		<>
			{playingVideos.map(video => (
				<VideoPlayer key={video.getId()} videoItem={video} />
			))}
			<VideoCanvasControls />
		</>
	);
};

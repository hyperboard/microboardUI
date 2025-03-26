import React, { useEffect, useRef } from "react";
import { useAppContext } from "features/AppContext";
import { AudioItem } from "Board/Items/Audio/Audio";

interface Props {
	audioItem: AudioItem;
}

export const AudioPlayer = ({ audioItem }: Props) => {
	const { board, app } = useAppContext();

	const audioRef = useRef<HTMLAudioElement>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	// const stopTimeoutRef = useRef<number | null>(null);
	// const timeoutDuration = videoId ? 300 : 10;

	useEffect(() => {
		containerRef.current?.addEventListener(
			"wheel",
			app.controller.onWheel,
			{
				capture: true,
				passive: false,
			},
		);

		return () => {
			containerRef.current?.removeEventListener(
				"wheel",
				app.controller.onWheel,
			);
		};
	}, []);

	// const stopVideo = () => {
	//     if (!stopTimeoutRef.current) {
	//         const timeoutId = setTimeout(() => {
	//             if (videoRef.current) {
	//                 videoItem.setCurrentTime(
	//                     videoRef.current.currentTime || 0.1
	//                 );
	//                 const currentFrame = captureFrame(
	//                     videoItem.getCurrentTime(),
	//                     videoRef.current
	//                 );
	//                 if (currentFrame) {
	//                     videoItem.setPreviewImage(currentFrame);
	//                 }
	//             }
	//             videoItem.transformationRenderBlock = false;
	//             videoItem.setIsPlaying(false);
	//         }, timeoutDuration);
	//         stopTimeoutRef.current = timeoutId;
	//     }
	// };
	//
	// const clearStopTimeout = () => {
	//     if (stopTimeoutRef.current) {
	//         clearTimeout(stopTimeoutRef.current);
	//         stopTimeoutRef.current = null;
	//     }
	// };

	const onEnded = () => {
		// clearStopTimeout();
		audioItem.setCurrentTime(0);
		audioItem.setIsPlaying(false);
	};

	const onPlay = () => {
		audioItem.setIsPlaying(true);
	};

	const mbr = audioItem.getMbr().getTransformed(board.camera.getMatrix());

	return (
		<div
			className={styles.container}
			style={{
				left: mbr.left,
				top: mbr.top,
			}}
			ref={containerRef}
		>
			<audio
				ref={audioRef}
				controls
				src={audioItem.getUrl()}
				style={{
					width: mbr.getWidth(),
					height: mbr.getHeight(),
				}}
				onPlay={onPlay}
				onEnded={onEnded}
			></audio>
			{/*<video*/}
			{/*    ref={videoRef}*/}
			{/*    controls*/}
			{/*    width={mbr.getWidth()}*/}
			{/*    height={mbr.getHeight()}*/}
			{/*    onPause={stopVideo}*/}
			{/*    onSeeking={clearStopTimeout}*/}
			{/*    onSeeked={clearStopTimeout}*/}
			{/*    onEnded={onEnded}*/}
			{/*    onPlay={onPlay}*/}
			{/*>*/}
			{/*    <source src={videoItem.getUrl()} type="video/mp4" />*/}
			{/*</video>*/}
		</div>
	);
};

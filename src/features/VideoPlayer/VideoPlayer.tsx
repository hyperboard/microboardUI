import React, { useEffect, useRef } from "react";
import { useAppContext } from "features/AppContext";
import styles from "./VideoPlayer.module.css";
import { conf, captureFrame, VideoItem } from "microboard-temp";
import YouTube from "react-youtube";

interface Props {
	item: VideoItem;
}

export const VideoPlayer = ({ item }: Props) => {
	const { board, app } = useAppContext();

	const videoId = conf.getYouTubeId(item.getUrl());

	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const stopTimeoutRef = useRef<number | null>(null);
	const timeoutDuration = videoId ? 300 : 10;

	useEffect(() => {
		containerRef.current?.addEventListener(
			"wheel",
			app.controller.onWheel,
			{
				capture: true,
				passive: false,
			},
		);

		const video = videoRef.current;
		if (!video) {
			return;
		}

		const handleLoadedMetadata = () => {
			if (item.getIsStorageUrl()) {
				video.currentTime = item.getCurrentTime();
				video.play();
			}
		};

		video.addEventListener("loadedmetadata", handleLoadedMetadata);

		return () => {
			if (videoRef.current) {
				videoRef.current.removeEventListener(
					"loadedmetadata",
					handleLoadedMetadata,
				);
			}
			containerRef.current?.removeEventListener(
				"wheel",
				app.controller.onWheel,
			);
		};
	}, []);

	const stopVideo = () => {
		if (!stopTimeoutRef.current) {
			const timeoutId = setTimeout(() => {
				if (videoRef.current) {
					item.setCurrentTime(videoRef.current.currentTime || 0.1);
					const currentFrame = captureFrame(
						item.getCurrentTime(),
						videoRef.current,
					);
					if (currentFrame) {
						item.setPreviewImage(currentFrame);
					}
				}
				item.setIsPlaying(false);
			}, timeoutDuration);
			stopTimeoutRef.current = timeoutId;
		}
	};

	const stopYoutubeVideo = event => {
		if (!stopTimeoutRef.current) {
			const timeoutId = setTimeout(() => {
				const currentTime = event.target.getCurrentTime();
				item.setCurrentTime(currentTime);
				item.setIsPlaying(false);
			}, timeoutDuration);
			stopTimeoutRef.current = timeoutId;
		}
	};

	const clearStopTimeout = () => {
		if (stopTimeoutRef.current) {
			clearTimeout(stopTimeoutRef.current);
			stopTimeoutRef.current = null;
		}
	};

	const onStateChange = event => {
		if (event.data === 3) {
			clearStopTimeout();
		}
	};

	const onEnded = () => {
		clearStopTimeout();
		item.setCurrentTime(0);
		item.setIsPlaying(false);
	};

	const mbr = item.getMbr().getTransformed(board.camera.getMatrix());

	const opts = {
		width: (mbr.getWidth() > 48 ? mbr.getWidth() : 48).toString(),
		height: (mbr.getHeight() > 32 ? mbr.getHeight() : 32).toString(),
		playerVars: {
			autoplay: 0,
			controls: 1,
			modestbranding: 1,
		},
	};

	return (
		<div
			className={styles.container}
			style={{
				left: mbr.left,
				top: mbr.top,
				zIndex: board.getZIndex(item),
			}}
			ref={containerRef}
		>
			{videoId ? (
				<YouTube
					videoId={videoId}
					opts={opts}
					onReady={event => {
						event.target.seekTo(item.getCurrentTime());
						event.target.playVideo();
					}}
					onStateChange={onStateChange}
					onPause={stopYoutubeVideo}
					onEnd={onEnded}
				/>
			) : (
				<video
					ref={videoRef}
					controls
					width={mbr.getWidth()}
					height={mbr.getHeight()}
					onPause={stopVideo}
					onSeeking={clearStopTimeout}
					onSeeked={clearStopTimeout}
					onEnded={onEnded}
				>
					<source src={item.getUrl()} type="video/mp4" />
				</video>
			)}
		</div>
	);
};

import React, { useEffect, useRef } from "react";
import { VideoItem } from "Board/Items/Video/Video";
import { useAppContext } from "features/AppContext";
import styles from "./VideoPlayer.module.css";
import { SETTINGS } from "Board/Settings";
import { captureFrame } from "Board/Items/Video/VideoHelpers";
import YouTube from "react-youtube";

interface Props {
	videoItem: VideoItem;
}

export const VideoPlayer = ({ videoItem }: Props) => {
	const { board, app } = useAppContext();

	const videoId = SETTINGS.getYouTubeId(videoItem.getUrl());

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
			if (videoItem.getIsStorageUrl()) {
				video.currentTime = videoItem.getCurrentTime();
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
					videoItem.setCurrentTime(
						videoRef.current.currentTime || 0.1,
					);
					const currentFrame = captureFrame(
						videoItem.getCurrentTime(),
						videoRef.current,
					);
					if (currentFrame) {
						videoItem.setPreviewImage(currentFrame);
					}
				}
				videoItem.transformationRenderBlock = false;
				videoItem.setIsPlaying(false);
			}, timeoutDuration);
			stopTimeoutRef.current = timeoutId;
		}
	};

	const stopYoutubeVideo = event => {
		if (!stopTimeoutRef.current) {
			const timeoutId = setTimeout(() => {
				const currentTime = event.target.getCurrentTime();
				videoItem.setCurrentTime(currentTime);
				videoItem.transformationRenderBlock = false;
				videoItem.setIsPlaying(false);
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
		videoItem.setCurrentTime(0);
		videoItem.transformationRenderBlock = false;
		videoItem.setIsPlaying(false);
	};

	const onPlay = () => {
		videoItem.transformationRenderBlock = true;
	};

	const mbr = videoItem.getMbr().getTransformed(board.camera.getMatrix());

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
			}}
			ref={containerRef}
		>
			{videoId ? (
				<YouTube
					videoId={videoId}
					opts={opts}
					onReady={event => {
						event.target.seekTo(videoItem.getCurrentTime());
						event.target.playVideo();
					}}
					onPlay={onPlay}
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
					onPlay={onPlay}
				>
					<source src={videoItem.getUrl()} type="video/mp4" />
				</video>
			)}
		</div>
	);
};

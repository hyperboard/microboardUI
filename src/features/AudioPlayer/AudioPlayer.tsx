import React, { useEffect, useRef } from "react";
import { useAppContext } from "features/AppContext";
import { AudioItem } from "Board/Items/Audio/Audio";
import styles from "./AudioPlayer.module.css";
import { Mbr } from "Board/Items/Mbr/Mbr";

interface Props {
	audioItem: AudioItem;
}

export const AudioPlayer = ({ audioItem }: Props) => {
	const { board, app } = useAppContext();

	const audioRef = useRef<HTMLAudioElement>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		containerRef.current?.addEventListener(
			"wheel",
			app.controller.onWheel,
			{
				capture: true,
				passive: false,
			},
		);

		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const handleLoadedMetadata = () => {
			audio.currentTime = audioItem.getCurrentTime();
		};

		audio.addEventListener("loadedmetadata", handleLoadedMetadata);

		return () => {
			if (audioRef.current) {
				audioRef.current.removeEventListener(
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

	const onPause = () => {
		audioItem.setIsPlaying(false);
		if (audioRef.current) {
			audioItem.setCurrentTime(audioRef.current.currentTime);
		}
	};

	const onEnded = () => {
		audioItem.setCurrentTime(0);
		audioItem.setIsPlaying(false);
	};

	const onPlay = () => {
		audioItem.setIsPlaying(true);
	};

	const audioMbr = audioItem.getMbr();
	const mbr = new Mbr(
		audioMbr.left,
		audioMbr.top + 20 * audioItem.transformation.matrix.scaleY,
		audioMbr.right,
		audioMbr.bottom,
	).getTransformed(board.camera.getMatrix());

	return (
		<div
			style={{
				position: "absolute",
				left: mbr.left,
				top: mbr.top,
				visibility: mbr.getHeight() <= 22 ? "hidden" : "visible",
				backgroundColor: "#ffffff",
			}}
			ref={containerRef}
		>
			<audio
				className={styles.audio}
				ref={audioRef}
				controls
				src={audioItem.getUrl()}
				onPause={onPause}
				style={{
					width: mbr.getWidth(),
					height: mbr.getHeight() - 5,
				}}
				onPlay={onPlay}
				onEnded={onEnded}
			></audio>
		</div>
	);
};

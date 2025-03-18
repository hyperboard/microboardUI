import React, { ForwardedRef, forwardRef, useEffect } from "react";
import { VideoItem } from "Board/Items/Video/Video";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon/Icon";
import styles from "./VideoPlayer.module.css";
import YouTube from "react-youtube";
import { SETTINGS } from "Board/Settings";

interface Props {
	videoItem: VideoItem;
	startVideo: (id: string) => void;
}

export const VideoPlayer = forwardRef(
	({ videoItem, startVideo }: Props, ref: ForwardedRef<HTMLVideoElement>) => {
		const { board, app } = useAppContext();

		const videoId = SETTINGS.getYouTubeId(videoItem.getUrl());

		useEffect(() => {
			if (videoItem.getIsStorageUrl()) {
				startVideo(videoItem.getId());
			}
		}, []);

		const onCloseBtnClick = () => {
			videoItem.setIsPlaying(false);
		};

		const mbr = videoItem.getMbr().getTransformed(board.camera.getMatrix());

		const opts = {
			width: mbr.getWidth().toString(),
			height: mbr.getHeight().toString(),
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
				onWheel={app.controller.onWheel}
			>
				{videoId ? (
					<YouTube
						videoId={videoId}
						opts={opts}
						onReady={event => {
							event.target.playVideo();
						}}
					/>
				) : (
					<video
						ref={ref}
						controls
						width={mbr.getWidth()}
						height={mbr.getHeight()}
					>
						<source src={videoItem.getUrl()} type="video/mp4" />
					</video>
				)}
				<button onClick={onCloseBtnClick} className={styles.closeBtn}>
					<Icon iconName="Close" width={18} height={18} />
				</button>
			</div>
		);
	},
);

import React from "react";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useAppContext } from "../../features/AppContext";
import { AudioItem } from "Board/Items/Audio/Audio";
import { Mbr } from "Board/Items/Mbr/Mbr";
import { AudioPlayer } from "features/AudioPlayer/AudioPlayer";

export const AudioProvider = (): JSX.Element => {
	const { board } = useAppContext();
	const forceUpdate = useForceUpdate();

	useAppSubscription({
		subjects: ["items", "camera"],
		observer: () => {
			forceUpdate();
		},
	});

	const offset = 100;
	const { left, top, right, bottom } = board.camera.getMbr();

	const audioItems = board.items.listAll().filter(item => {
		if (item.itemType !== "Audio") {
			return false;
		}
		if (item.getIsPlaying()) {
			return true;
		}
		return item.isEnclosedOrCrossedBy(
			new Mbr(
				left - offset,
				top - offset,
				right + offset,
				bottom + offset,
			),
		);
	}) as AudioItem[];

	return (
		<>
			{audioItems.map(audio => (
				<AudioPlayer key={audio.getId()} audioItem={audio} />
			))}
		</>
	);
};

import React, {
	DragEventHandler,
	memo,
	PointerEventHandler,
	RefCallback,
	useCallback,
	useState,
} from "react";
import style from "./UiSegmentedSlider.module.css";

type Props<T> = {
	values: T[];
	onChange: (val: T) => void;
};

type Segment<T> = {
	left: number;
	value: T;
	index: number;
};

export const UiSegmentedSlider = memo(function UiSegmentedSlider<T>({
	onChange,
	values,
}: Props<T>) {
	const [segments, setSegments] = useState<Segment<T>[]>([]);
	const [thumbLeft, setThumbLeft] = useState(0);
	const [isDragging, setIsDragging] = useState(false);

	const handleRef: RefCallback<HTMLDivElement> = useCallback(
		node => {
			const width = node?.getBoundingClientRect().width;
			if (!width) {
				return;
			}

			const segments: Segment<T>[] = values.map((value, index) => ({
				left: (width / (values.length - 1)) * index,
				value,
				index,
			}));

			setSegments(segments);
		},
		[values],
	);

	const handleDragStart: PointerEventHandler<HTMLDivElement> = e => {
		setIsDragging(true);
	};

	const handleDrag: PointerEventHandler<HTMLDivElement> = e => {
		if (!isDragging) {
			return;
		}

		const clientX = e.clientX;

		const distances = segments.map(segment =>
			Math.abs(clientX - segment.left),
		);

		const closestSegmentIndex = distances.indexOf(Math.min(...distances));

		setThumbLeft(segments[closestSegmentIndex].left);
		onChange(segments[closestSegmentIndex].value);
	};

	const handleDragEnd: PointerEventHandler<HTMLDivElement> = () => {
		setIsDragging(false);
	};

	return (
		<div className={style.container}>
			<div className={style.line} ref={handleRef} />
			<div
				style={{ left: thumbLeft }}
				className={style.thumb}
				onPointerDown={handleDragStart}
				onPointerMove={handleDrag}
				onPointerUp={handleDragEnd}
			/>
			{segments.map(({ index, left }) => (
				<div className={style.segment} style={{ left }} key={index} />
			))}
		</div>
	);
});

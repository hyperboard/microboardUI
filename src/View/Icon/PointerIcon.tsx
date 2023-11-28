import * as React from "react";

export function AngleIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 93.332706,49.493741 -88.3336089,0.0062"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 64.582261,34.552786 30,15 -30,15"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function ArrowBroadIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 69.864919,49.462333 4.9990971,49.499922"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "currentColor",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 65,35 95,50 65,65 c 6.398861,-9.776546 6.930095,-19.757995 0,-30 z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function ArrowThinIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 69.864919,49.462333 4.9990971,49.499922"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "currentColor",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 65.093254,39.274964 95.111462,49.618321 65.302406,59.70664 c 6.398861,-9.776546 6.720943,-10.189671 -0.209152,-20.431676 z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function CircleFilledIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 64.162851,49.69399 5,49.5"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "currentColor",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 64.5,50.5 c 0,20 30,20 30,0 0,-20 -30,-20 -30,0 z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function DiamondEmptyIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 65.000081,49.409785 4.9990971,49.499922"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 65,49.292893 15,-15 15,15 -15,15 z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function DiamondFilledIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 65.000081,49.409785 4.9990971,49.499922"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "currentColor",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 65,49.292893 15,-15 15,15 -15,15 z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function ManyIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 64.823205,49.627875 5,49.5"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 65.029404,49.5 30.02901,0.0079"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 94.776393,34.552786 -30,15 30,15"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function ManyMandatoryIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 62.729305,49.586788 5,49.5"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 62.826011,49.561769 95.029141,49.5079"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 94.776393,34.552786 -30,15 30,15"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 63.158359,35 V 65"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function ManyOptionalIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 34.5,49.5 c 0,20 30,20 30,0 0,-20 -30,-20 -30,0 z"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 35,49.5 H 5"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 64.97099,49.992127 95,50"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 95,35 65,50 95,65"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function OneIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 79.5,35 V 65"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 95,49.5 79.187694,49.422779"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 79.149344,49.423618 5,49.5"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function OneMandatoryIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 79.5,35 V 65"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 95,49.5 H 65"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 64.5,35 V 65"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 64.450855,49.576255 5,49.5"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function OneOptionalIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 79.5,35 V 65"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 34.5,49.5 c 0,20 30,20 30,0 0,-20 -30,-20 -30,0 z"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 95,50 H 65"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 35,49.5 H 5"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function TriangleEmptyIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 65.000081,49.409785 4.9990971,49.499922"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 65,35 95,50 65,65 Z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function TriangleFilledIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 65.000081,49.409785 4.9990971,49.499922"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "currentColor",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 65,35 95,50 65,65 Z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function ZeroIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 64.5,50.5 c 0,20 30,20 30,0 0,-20 -30,-20 -30,0 z"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "currentColor",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 64.366983,49.37144 5,49.5"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

export function NoneIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 5, 50 H 95"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}

const icons: Record<
	string,
	(props: { width: number; height: number }) => React.ReactElement
> = {
	Angle: AngleIcon,
	ArrowBroad: ArrowBroadIcon,
	ArrowThin: ArrowThinIcon,
	CircleFilled: CircleFilledIcon,
	DiamondEmpty: DiamondEmptyIcon,
	DiamondFilled: DiamondFilledIcon,
	Many: ManyIcon,
	ManyMandatory: ManyMandatoryIcon,
	ManyOptional: ManyOptionalIcon,
	One: OneIcon,
	OneMandatory: OneMandatoryIcon,
	OneOptional: OneOptionalIcon,
	TriangleEmpty: TriangleEmptyIcon,
	TriangleFilled: TriangleFilledIcon,
	Zero: ZeroIcon,
	None: NoneIcon,
};

export function PointerIcon({
	type,
	width,
	height,
}: {
	width: number;
	height: number;
	type: string;
}): React.ReactElement {
	const Icon = icons[type];
	if (!Icon) {
		return <NoneIcon width={width} height={height} />;
	}
	return <Icon width={width} height={height} />;
}

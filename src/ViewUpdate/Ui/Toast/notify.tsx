import clsx from "clsx";
import React, { ReactNode } from "react";
import toast from "react-hot-toast";
import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "../UiButton";
import style from "./Toast.module.css";

type Props = {
	header?: ReactNode;
	body?: ReactNode;
	footer?: ReactNode;
	duration?: number;
	variant?: "success" | "error" | "info" | "warning";
};

export function notify({
	header,
	body,
	footer,
	duration = 4000,
	variant = "info",
}: Props) {
	return toast.custom(
		t => (
			<div
				className={clsx(style.container, style[variant])}
				style={{
					opacity: t.visible ? 1 : 0,
					animation: `${
						t.visible ? style.fadeIn : style.fadeOut
					} 0.3s ease`,
				}}
			>
				<Icon
					className={style.icon}
					iconName="Notification"
					width={20}
					height={20}
				/>
				<div className={style.content}>
					{header && typeof header === "string" ? (
						<h3 className={style.title}>{header}</h3>
					) : (
						header
					)}
					{body && typeof body === "string" ? (
						<p className={style.description}>{body}</p>
					) : (
						body
					)}
					{footer}
				</div>
				<UiButton
					size="sm"
					rounded="none"
					className={style.closeButton}
					onClick={() => toast.dismiss(t.id)}
					variant="secondary"
				>
					<Icon iconName="Close" width={20} height={20} />
				</UiButton>
			</div>
		),
		{ duration, position: "top-right" },
	);
}

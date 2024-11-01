import clsx from "clsx";
import React, { ReactNode } from "react";
import toast, { ToastPosition } from "react-hot-toast";
import { Icon } from "View/Icon";
import { UiButton } from "../UiButton";
import style from "View/Ui/Toast/Toast.module.css";

type Props = {
	header?: ReactNode;
	body?: ReactNode;
	footer?: ReactNode;
	duration?: number;
	variant?: "success" | "error" | "info" | "warning" | "black";
	position?: ToastPosition;
	unclosable?: boolean;
};

/** Triggers toast notification and returns notification id */
export function notify({
	header,
	body,
	footer,
	duration = 4000,
	variant = "info",
	unclosable = false,
	position = "top-right",
}: Props): string {
	return toast.custom(
		toastMsg => (
			<div
				className={clsx(style.container, style[variant])}
				style={{
					opacity: toastMsg.visible ? 1 : 0,
					animation: `${
						toastMsg.visible ? style.fadeIn : style.fadeOut
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
				{!unclosable && (
					<UiButton
						size="sm"
						rounded="none"
						className={style.closeButton}
						onClick={() => toast.dismiss(toastMsg.id)}
						variant="secondary"
					>
						<Icon iconName="Close" width={20} height={20} />
					</UiButton>
				)}
			</div>
		),
		{ duration, position },
	);
}

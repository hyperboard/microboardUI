import { ToastBar, Toaster } from "react-hot-toast";
import React from "react";
import style from "./Toast.module.css";
import { Icon } from "ViewTalkIntegration/Icon";

export const ToastProvider = () => {
	return (
		<Toaster
			toastOptions={{
				position: "bottom-left",
				error: {
					className: style.error,
					icon: <Icon iconName="ErrorIcon" width={20} height={20} />,
				},
			}}
		>
			{t => (
				<ToastBar
					toast={t}
					style={{
						...t.style,
						opacity: t.visible ? 1 : 0,
						animation: t.visible
							? `${style.fadeIn} 0.3s ease`
							: `${style.fadeOut} 0.3s ease`,
					}}
				/>
			)}
		</Toaster>
	);
};

import { Toaster } from "react-hot-toast";
import React from "react";

export function ToastProvider() {
	return <Toaster containerStyle={{ top: 70, right: 12 }} />;
}

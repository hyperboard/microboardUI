import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { PropsWithChildren, ErrorInfo } from "react";
import { ViewSettings } from "shared/ViewSettings";
import { Config, WagmiProvider } from "wagmi";

class CryptoErrorBoundary extends React.Component<
	PropsWithChildren<{
		fallback?: React.ReactNode;
		onError?: (error: Error, errorInfo: ErrorInfo) => void;
	}>,
	{ hasError: boolean }
> {
	constructor(props: PropsWithChildren<{}>) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(_error: Error): { hasError: boolean } {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// You can log the error to an error reporting service
		console.error("Crypto Provider Error:", error, errorInfo);

		// Optional custom error handler
		this.props.onError?.(error, errorInfo);
	}

	render(): React.ReactNode {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				this.props.fallback || (
					<div>Something went wrong with crypto providers</div>
				)
			);
		}

		return this.props.children;
	}
}

export const createWagmiConfig = (): Config => {
	try {
		return getDefaultConfig(ViewSettings.WagmiConfig);
	} catch (error) {
		console.error("Failed to create Wagmi config:", error);
		throw error;
	}
};

const queryClient = new QueryClient();

export function CryptoWrapper({
	children,
}: PropsWithChildren<{}>): JSX.Element {
	return (
		<CryptoErrorBoundary
			fallback={<div>Crypto Provider Initialization Failed</div>}
			onError={(error, errorInfo) => {
				// Additional error handling logic if needed
				console.error(
					"Detailed Crypto Wrapper Error:",
					error,
					errorInfo,
				);
			}}
		>
			<WagmiProvider config={createWagmiConfig()}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider>{children}</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</CryptoErrorBoundary>
	);
}

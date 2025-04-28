import { mainnet, polygon, arbitrum } from "viem/chains";

export const ViewSettings = {
	WagmiConfig: {
		appName: "board_test",
		projectId: "b1c6e6a21e23505e28fe385a0da4135f",
		chains: [mainnet, polygon, arbitrum],
	} as const,
};

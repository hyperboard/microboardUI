export const requestMap = {
	createChat: {
		method: "POST",
		url: "/ai/chats",
	},
	generateChart: {
		method: "POST",
		url: "/ai/generate",
	},
	getChats: {
		method: "GET",
		url: "/ai/chats",
	},
	getChatDetails: {
		method: "GET",
		url: (chatId: number) => `/ai/chats/${chatId}`,
	},
	deleteChat: {
		method: "DELETE",
		url: (chatId: number) => `/ai/chats/${chatId}`,
	},
};

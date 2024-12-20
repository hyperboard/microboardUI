import { useEffect } from "react";
import { Message } from "Board/Items/Comment/Comment";

interface Args {
	refs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
	unreadMessages?: Message[] | null;
	deps?: unknown[];
}

export const useScrollToUnreadMessage = ({
	unreadMessages,
	refs,
	deps = [],
}: Args): void => {
	useEffect(() => {
		if (unreadMessages && unreadMessages.length) {
			const unreadMessageElement = refs.current[unreadMessages[0].id];
			if (!unreadMessageElement) {
				return;
			}
			unreadMessageElement.scrollIntoView(false);
		}
	}, [unreadMessages && unreadMessages.length > 0, ...deps]);
};

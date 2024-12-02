import { useEffect } from "react";
import { Comment } from "Board/Items/Comment/Comment";

interface Args {
	comment: Comment;
	refs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
	username?: string;
	deps?: unknown[];
	disabled?: boolean;
}

export const useIntersectionObserver = ({
	comment,
	refs,
	username,
	deps = [],
	disabled = false,
}: Args) => {
	useEffect(() => {
		const unreadMessages = comment.getUnreadMessages(username);

		const observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (entry.isIntersecting && !disabled) {
						const messageId = Object.keys(refs.current).find(
							key => refs.current[key] === entry.target,
						);
						if (
							messageId &&
							unreadMessages &&
							unreadMessages.some(mes => mes.id === messageId)
						) {
							comment.markMessagesAsRead([messageId], username);
						}
					}
				}
			},
			{
				threshold: 1.0,
			},
		);

		Object.values(refs.current).forEach(value => {
			if (value instanceof HTMLDivElement) {
				observer.observe(value);
			}
		});

		return () => {
			Object.values(refs.current).forEach(value => {
				if (value instanceof HTMLDivElement) {
					observer.unobserve(value);
				}
			});
		};
	}, [username, ...deps]);
};

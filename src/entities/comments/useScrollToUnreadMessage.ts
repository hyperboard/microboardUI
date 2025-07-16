import { useEffect } from "react";
import { CommentMessage } from "microboard-temp";

interface Args {
  refs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  unreadMessages?: CommentMessage[] | null;
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

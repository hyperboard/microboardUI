import { App } from "App";
import { useAccount } from "App/useAccount";
import {
  Presence,
  PRESENCE_CLEANUP_IDLE_TIMER,
  PresenceUser,
} from "microboard-temp";
import clsx from "clsx";
import { useCommentsPanelContext } from "entities/comments/CommentsPanel/CommentsPanelContext";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { UserPic } from "features/UserPanel/UserPic/UserPic";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getEmailPrefix } from "shared/lib/getEmailPrefix";
import { useClickOutside } from "shared/lib/useClickOutside";
import { EyeIcon } from "./EyeIcon";
import { PresenceUserAvatar } from "./PresenceUserAvatar";
import styles from "./PresenceUsers.module.css";

export interface User {
  id: string;
  hardId: string | null;
  name: string;
  displayName: string;
  color: string;
  avatar: string | null;
  idle: boolean;
}

interface Props {
  app: App;
}

function areUsersEqual(prevUsers: User[], nextUsers: User[]): boolean {
  return (
    prevUsers.length === nextUsers.length &&
    prevUsers.every((user, index) => {
      const nextUser = nextUsers[index];
      return (
        user.id === nextUser.id &&
        user.hardId === nextUser.hardId &&
        user.name === nextUser.name &&
        user.displayName === nextUser.displayName &&
        user.color === nextUser.color &&
        user.avatar === nextUser.avatar &&
        user.idle === nextUser.idle
      );
    })
  );
}

function areFollowersEqual(
  prevFollowers: PresenceUser[],
  nextFollowers: PresenceUser[],
): boolean {
  return (
    prevFollowers.length === nextFollowers.length &&
    prevFollowers.every(
      (follower, index) =>
        follower.userId === nextFollowers[index].userId &&
        follower.nickname === nextFollowers[index].nickname &&
        follower.color === nextFollowers[index].color,
    )
  );
}

function isSameTrackedUser(
  prevTrackedUser: PresenceUser | null,
  nextTrackedUser: PresenceUser | null,
): boolean {
  if (prevTrackedUser === nextTrackedUser) {
    return true;
  }

  if (!prevTrackedUser || !nextTrackedUser) {
    return false;
  }

  return (
    prevTrackedUser.userId === nextTrackedUser.userId &&
    prevTrackedUser.nickname === nextTrackedUser.nickname &&
    prevTrackedUser.color === nextTrackedUser.color &&
    prevTrackedUser.avatar === nextTrackedUser.avatar
  );
}

export const FollowingUsersCount: React.FC<{
  followers: PresenceUser[];
}> = ({ followers }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const account = useAccount();
  const tooltipRef = useClickOutside(() => {
    setIsOpen(false);
  });
  if (!followers.length) {
    return null;
  }

  const followerNames = getSessionDisplayNames(
    followers.map((follower) => ({
      id: follower.userId,
      hardId: follower.hardId ?? null,
      name: follower.nickname,
    })),
  );

  return (
    <div className={styles.followingCounter}>
      <div
        className={styles.followingCounterIcon}
        onMouseDown={(ev) => {
          ev.stopPropagation();
        }}
        onClick={() => {
          if (isOpen) {
            return;
          }
          setIsOpen(!isOpen);
        }}
      >
        <EyeIcon fill={"white"} />
        <span>{followers.length}</span>
      </div>
      <div
        ref={tooltipRef}
        className={clsx(
          styles.followersTooltip,
          isOpen && styles.followersVisible,
        )}
      >
        <p className={styles.followersMe}>
          {account.info?.email} {t("presence.(you)")}
        </p>
        <span className={styles.followersBoard}>{t("presence.yourBoard")}</span>
        <div className={styles.followersHr} />
        <div className={styles.followersList}>
          {followers.map((follower, index) => (
            <span key={follower.userId} className={styles.followersItem}>
              {followerNames[index]} {t("presence.following")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const USERS_IN_ROW = 3;

function getSessionDisplayNames<
  T extends { id: string; hardId: string | null; name: string },
>(users: T[]): string[] {
  const sessionsByHardId = new Map<string, T[]>();

  for (const user of users) {
    if (!user.hardId) {
      continue;
    }

    const existingUsers = sessionsByHardId.get(user.hardId) || [];
    existingUsers.push(user);
    sessionsByHardId.set(user.hardId, existingUsers);
  }

  const indexedSessionNames = new Map<string, string>();
  for (const groupedUsers of sessionsByHardId.values()) {
    if (groupedUsers.length < 2) {
      continue;
    }

    const sortedUsers = [...groupedUsers].sort((first, second) =>
      first.id.localeCompare(second.id),
    );
    sortedUsers.forEach((user, index) => {
      indexedSessionNames.set(user.id, `${user.name} (${index + 1})`);
    });
  }

  return users.map((user) => indexedSessionNames.get(user.id) || user.name);
}

export const PresenceUsers: React.FC<Props> = () => {
  const { board } = useAppContext();
  const boardRef = useRef(board);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<User[]>([]);
  const [followers, setFollowers] = useState<PresenceUser[]>([]);
  const [trackedUser, setTrackedUser] = useState<PresenceUser | null>(null);
  const [displayUsers, setDisplayUsers] = useState(users);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const account = useAccount();
  const { setIsPanelOpen } = useCommentsPanelContext();

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const needsCollapse = users.length >= 3;
  useEffect(() => {
    const sortedUsers = [...users]
      .sort((first, second) =>
        selectedUsers.has(first.id) === selectedUsers.has(second.id)
          ? 0
          : selectedUsers.has(first.id)
            ? -1
            : 1,
      )
      .sort((first, second) =>
        first.idle === second.idle ? 0 : first.idle ? 1 : -1,
      );

    setDisplayUsers(sortedUsers.slice(0, USERS_IN_ROW));
  }, [users, selectedUsers]);

  const selectUser = (userId: string): void => {
    if (board.presence.trackedUser?.userId === userId) {
      board.presence.disableTracking();
      setSelectedUsers(new Set([]));
      return;
    }
    board.presence.enableTracking(userId);
    setSelectedUsers(new Set([userId]));
  };

  const updateUsers = (presence: Presence): void => {
    const now = Date.now();
    const currentBoard = boardRef.current;
    const rawUsers = presence
      .getUsers(currentBoard.getBoardId(), true)
      .map((user) => ({
        id: user.userId,
        hardId: user.hardId ?? null,
        name: user.nickname,
        color: user.color,
        avatar: user.avatar,
        idle: user.lastActivity < now - PRESENCE_CLEANUP_IDLE_TIMER,
      }));
    const displayNames = getSessionDisplayNames(rawUsers);
    const pUsers = rawUsers.map((user, index) => ({
      ...user,
      displayName: displayNames[index],
    }));

    setUsers((prevUsers) =>
      areUsersEqual(prevUsers, pUsers) ? prevUsers : pUsers,
    );

    const nextFollowers = currentBoard.presence.getFollowers();
    setFollowers((prevFollowers) =>
      areFollowersEqual(prevFollowers, nextFollowers)
        ? prevFollowers
        : nextFollowers,
    );
  };

  useEffect(() => {
    const observer = (presence: Presence): void => {
      updateUsers(presence);
      const nextTrackedUser = presence.trackedUser || null;
      setTrackedUser((prevTrackedUser) =>
        isSameTrackedUser(prevTrackedUser, nextTrackedUser)
          ? prevTrackedUser
          : nextTrackedUser,
      );
    };

    const subject = board.presence.subject;
    observer(board.presence);
    subject.subscribe(observer);

    return () => {
      subject.unsubscribe(observer);
    };
  }, [board.presence, board.presence.subject]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.userList}>
          {displayUsers.map((user, index) => (
            <PresenceUserAvatar
              key={user.id}
              user={user}
              trackedUser={trackedUser}
              index={index}
              onClick={() => selectUser(user.id)}
            />
          ))}

          <UserPic
            className={styles.userWrapper}
            style={{ zIndex: 1000 }}
            followers={followers}
            presenceUsers={users}
            email={
              account.info?.name ??
              getEmailPrefix(account.info?.email ?? "", "Anonymous")
            }
            setIsDropdownOpen={setIsUserDropdownOpen}
            isDropdownOpen={isUserDropdownOpen}
          />
          {needsCollapse && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                if (!isUserDropdownOpen) {
                  setIsUserDropdownOpen(true);
                  setIsPanelOpen(false);
                } else {
                  setIsUserDropdownOpen(false);
                  setIsPanelOpen(false);
                }
              }}
              style={
                {
                  "--index": displayUsers.length,
                } as React.CSSProperties
              }
              className={styles.usersOverflowWrapper}
            >
              <div className={styles.usersOverflowGap} />
              <div className={styles.usersOverflowCounter}>
                <span>{users.length}</span>
                <Icon iconName="StrokeChevronDown" width={11} height={6} />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

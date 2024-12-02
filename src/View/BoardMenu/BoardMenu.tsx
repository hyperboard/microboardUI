import React, {useEffect, useRef, useState} from "react";
import {UiPanel} from "../Ui/UiPanel";
import {useDomMbr} from "../../Board/Items/Mbr/useDomMbr";
import {useAppContext} from "../AppContext";
import {Mbr} from "../../Board/Items";
import {Button} from "../../shared/ui-lib/Button";
import {useForceUpdate} from "../../lib/useForceUpdate";
import {useAppSubscription} from "../../Board/useBoardSubscription";
import styles from "./BoardMenu.module.css";
import {useCommentsContext} from "../CommentsProvider";
import {useTranslation} from "react-i18next";

export const BoardMenu = () => {
    const menuRef = useRef<HTMLDivElement>(null);
    const {board, app} = useAppContext();
    const cursorPosition = board.pointer.point;
    const [isOpen, setIsOpen] = useState(false);
    const {setShowResolved, showResolved} = useCommentsContext();
    const {t} = useTranslation();
    const isOwner = app.account.permissions.checkPermissions(
        "owns",
        "boards",
        board.getBoardId(),
    );

    const forceUpdate = useForceUpdate();

    useAppSubscription(app, {
        subjects: [
            "items",
            "tools",
            "selection",
            "selectionItem",
            "selectionItems",
            "syncLog",
        ],
        observer: () => {
            forceUpdate();
        },
    });

    const mbr = useDomMbr({
        app,
        board,
        ref: menuRef,
        targetMbr: new Mbr(
            cursorPosition.x,
            cursorPosition.y,
            cursorPosition.x,
            cursorPosition.y,
        ),
        subjects: ["camera"],
        fit: "boardMenu",
    });

    useEffect(() => {
        setIsOpen(board.isBoardMenuOpen);
    }, [board.isBoardMenuOpen]);

    const toggleShowResolved = () => {
        setShowResolved(!showResolved);
        board.isBoardMenuOpen = false;
    };

    const resolveAllComments = () => {
        const username = app.account.info?.email
        if (!username) {
            return
        }
        board.items.getComments().forEach(comment => {
            if (!comment.getResolved()) {
                comment.setResolved(true)
            }
        })
    }

    return isOpen && isOwner ? (
        <UiPanel
            vertical={true}
            ref={menuRef}
            style={{
                position: "absolute",
                left: mbr.left,
                top: mbr.top,
            }}
            zIndex={5}
        >
            <Button
                onClick={toggleShowResolved}
                className={styles.btn}
                pattern="tertiary"
            >
                {showResolved
                    ? t("boardMenu.hideResolved")
                    : t("boardMenu.showResolved")}
            </Button>
            <Button
                onClick={resolveAllComments}
                className={styles.btn}
                pattern="tertiary"
            >
                {t("boardMenu.resolveAll")}
            </Button>
        </UiPanel>
    ) : (
        <></>
    );
};

import React, { useRef } from "react";
import { createPortal } from 'react-dom';
import styles from "./Modal.module.css";
import { useClickOutside } from '../../lib/useClickOutside'

type TModal = {
    boardLink: string;
    closeModal: () => void;
}

const ModalView = ({ boardLink, closeModal }: TModal): React.ReactElement => {
    const textToCopyRef = useRef(null);

    function copyText() {
        const span = textToCopyRef.current;
        const range = document.createRange();
        range.selectNode(span);

        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        console.log(range)
        document.execCommand('copy');

        window.getSelection().removeAllRanges();
    }

    const modalRef = useClickOutside(closeModal);

    return <div className={styles.modalBg}>
        <div ref={modalRef} className={styles.wrapper}>
            <div className={styles.linkContainer}>
                <span ref={textToCopyRef}>{boardLink}</span>
                <select name="" id="">
                    <option value="1">Can edit</option>
                    <option value="2">Can comment</option>
                    <option value="3">Can view</option>
                    <option value="4">No access</option>
                </select>
                <button onClick={copyText}>Copy link</button>
            </div>
        </div>
    </div>
};

export const Modal = (props: any) => {
    return createPortal(
        <ModalView
            {...props}
        />,
        window.root
    )
}
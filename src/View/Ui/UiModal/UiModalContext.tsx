import { useForceUpdate } from "lib/useForceUpdate";
import { useLayoutEffect } from "react";
import { Subject } from "Subject";

export type ModalId = string | symbol | null;

class UiModalState {
	openedModalId: ModalId = null;
	subject = new Subject<void>();

	openModal = (modalId: ModalId) => {
		this.openedModalId = modalId;
		console.log(modalId, this.openedModalId);
		this.subject.publish();
	};

	closeModal = () => {
		this.openedModalId = null;
		this.subject.publish();
	};
}

const UiModalStateInstance = new UiModalState();

export const useUiModalContext = () => {
	const forceUpdate = useForceUpdate();
	useLayoutEffect(() => {
		UiModalStateInstance.subject.subscribe(forceUpdate);

		return () => {
			UiModalStateInstance.subject.unsubscribe(forceUpdate);
		};
	}, [forceUpdate]);

	return UiModalStateInstance;
};

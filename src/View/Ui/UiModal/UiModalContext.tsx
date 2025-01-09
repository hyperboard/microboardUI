import { useForceUpdate } from "lib/useForceUpdate";
import { useLayoutEffect } from "react";
import { Subject } from "Subject";

export type ModalId = string | symbol | null;

class UiModalState {
	openedModalId: ModalId = null;
	isTransition = false;
	transitionFrom: ModalId = null;
	transitionTo: ModalId = null;
	subject = new Subject<void>();

	openModal = (modalId: ModalId): void => {
		if (this.openedModalId && modalId) {
			this.isTransition = true;
			this.transitionFrom = this.openedModalId;
			this.transitionTo = modalId;
		}
		this.openedModalId = modalId;
		this.subject.publish();
	};

	closeModal = (): void => {
		this.openedModalId = null;
		this.isTransition = false;
		this.transitionFrom = null;
		this.transitionTo = null;
		this.subject.publish();
	};
}

export const UiModalStateInstance = new UiModalState();

export const useUiModalContext = (): UiModalState => {
	const forceUpdate = useForceUpdate();
	useLayoutEffect(() => {
		UiModalStateInstance.subject.subscribe(forceUpdate);

		return () => {
			UiModalStateInstance.subject.unsubscribe(forceUpdate);
		};
	}, [forceUpdate]);

	return UiModalStateInstance;
};

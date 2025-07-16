import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useLayoutEffect } from "react";
import { Subject } from "shared/Subject";
import { conf } from "microboard-temp";

export type ModalId = string | symbol | null;

class UiModalState {
  openedModalId: ModalId = null;
  isTransition = false;
  transitionFrom: ModalId = null;
  transitionTo: ModalId = null;
  data: unknown | null;
  subject = new Subject<void>();
  private renderAsPageIds: ModalId[] = [];

  setModalData = (data: unknown): void => {
    this.data = data;
    this.subject.publish();
  };

  isModalOpen = (modalId: ModalId): boolean => {
    return this.openedModalId === modalId;
  };

  openModal = (modalId: ModalId): void => {
    if (this.openedModalId && modalId) {
      this.isTransition = true;
      this.transitionFrom = this.openedModalId;
      this.transitionTo = modalId;
    }
    this.openedModalId = modalId;
    this.subject.publish();
  };

  addRenderAsPage = (id: ModalId) => {
    this.renderAsPageIds = [...this.renderAsPageIds, id];
    this.subject.publish();
  };

  removeRenderAsPage = (id: ModalId) => {
    this.renderAsPageIds = this.renderAsPageIds.filter((item) => item !== id);
    this.subject.publish();
  };

  isRenderedAsPage = (id: ModalId) => {
    return this.renderAsPageIds.includes(id);
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

export const openModal = (modalId: ModalId): void => {
  UiModalStateInstance.openModal(modalId);
};

conf.openModal = openModal;

export const closeModal = (): void => {
  UiModalStateInstance.closeModal();
};

export const isModalOpen = (modalId: ModalId): boolean => {
  return UiModalStateInstance.isModalOpen(modalId);
};

export const setModalData = (data: unknown): void => {
  UiModalStateInstance.setModalData(data);
};

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

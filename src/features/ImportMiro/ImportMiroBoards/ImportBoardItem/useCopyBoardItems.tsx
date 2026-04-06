import {
  IMiroBoardItem,
  IMiroBoardItemConnector,
  IMiroBoardItemFrame,
  IMiroBoardItemImage,
  IMiroBoardItemPaint,
  IMiroBoardItemShape,
  IMiroBoardItemSticker,
  IMiroBoardItemStyle,
  IMiroBoardItemText,
  IMiroGeometry,
  IMiroParent,
  IMiroPosition,
  MiroBoardItemTypes,
  MiroItemsTypes,
  MiroRelativeTo,
  MiroUnsupportedItem,
} from "../MiroModels";
import Cookies from "js-cookie";
import { Descendant } from "slate";
import type { HorisontalAlignment } from "microboard-temp";
import {
  Board,
  Sticker,
  ImageItem,
  Connector,
  Frame,
  Item,
  RichText,
  Shape,
  Drawing,
  Placeholder,
  MiroItemConverter,
} from "microboard-temp";
import { prepareImage } from "shared/api/media/imageHelpers";
import {
  closeModal,
  isModalOpen,
  openModal,
  setModalData,
} from "shared/ui-lib/UiModal/UiModalContext";
import { resolveColorForUI } from "shared/lib/resolveColorValue";
import { MIRO_IMG_AUTH_CLIPBOARD } from "features/ImportMiro/ImgAuthClipboardModal/ImgAuthClipboardModal";
import { ERROR_NOTIFICATION } from "../Notifications/ErrorNotification";
import { LOADING_NOTIFICATION } from "../Notifications/LoadingNotification";
import { SUCCESS_NOTIFICATION } from "../Notifications/SuccessNotification";
import { WARN_CLIPBOARD_NOTIFICATION } from "../Notifications/WarnClipboardNotification";
import { getApiUrl } from "Config";

interface MiroImage {
  type: string;
  url: string;
}

export const useCopyBoardItems = (
  board: Board,
  miroItems?: IMiroBoardItem[],
  withoutImgs?: boolean,
): void => {
  const boardMiroId: { [key: string]: string } = {};

  const setBoardMiroId = (id: string): void => {
    boardMiroId[id] =
      board.items.listAll()[board.items.listAll().length - 1]?.getId() || "";
  };

  const getMiroToken = (): void => {
    openModal(MIRO_IMG_AUTH_CLIPBOARD);
  };

  const getMiroBoardItems = (): IMiroBoardItem[] => {
    const storageMiroItems = localStorage.getItem("miroItems");
    if (miroItems && !storageMiroItems) {
      localStorage.setItem("miroItems", JSON.stringify(miroItems));
    }

    const storageItemsParsed =
      storageMiroItems && storageMiroItems !== "undefined"
        ? JSON.parse(storageMiroItems)
        : null;

    return miroItems || storageItemsParsed || [];
  };

  const parseTextData = (text: string): Element[] => {
    const parser = new DOMParser();
    const parsedText = parser.parseFromString(text, "text/html");
    const elementsWithText: HTMLElement[] = [];
    const relevantTags = new Set(["strong", "em", "s", "u", "span", "br"]);

    function traverse(node: Node): void {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        let hasText = false;
        let hasRelevantTag = false;

        element.childNodes.forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const childElement = child as HTMLElement;
            const tagName = childElement.tagName.toLowerCase();

            if (relevantTags.has(tagName)) {
              hasRelevantTag = true;
              return;
            }
          }

          if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            hasText = true;
          }

          traverse(child);
        });

        if (hasRelevantTag || hasText) {
          elementsWithText.push(element);
        }
      }
    }

    traverse(parsedText.body);

    return elementsWithText;
  };

  const setItemText = (
    item: Shape | Sticker | RichText | Connector,
    text: string,
    style: IMiroBoardItemStyle,
  ): void => {
    const textEls = parseTextData(text);

    if (!textEls) {
      return;
    }

    const { textAlign } = style;
    const targetText =
      item.itemType === "RichText" ? (item as RichText) : (item as any).text;
    const editor = targetText.editor.editor;

    textEls.forEach((element, index) => {
      const textChildren = getTextNodes(element as HTMLElement, style, item);

      const node = {
        type: "paragraph",
        children: textChildren,
        horisontalAlignment: textAlign as HorisontalAlignment,
      } as Descendant;

      editor.children = index === 0 ? [node] : [...editor.children, node];
    });
  };

  const getTextNodes = (
    element: HTMLElement,
    style?: IMiroBoardItemStyle,
    item?: Shape | Sticker | RichText | Connector,
  ): any[] => {
    return Array.from(element.childNodes).map((child) => {
      const childElement = child as HTMLElement;
      const stringText = child.textContent ?? "";
      const fontStyles = getFontStyles(childElement);
      const spanText =
        childElement.children && childElement.getElementsByTagName("span")[0];
      const textStyles = spanText ? spanText.style : childElement.style;
      const stickerColor =
        item &&
        item.itemType === "Sticker" &&
        resolveColorForUI((item as any).getBackgroundColor()) ===
          window.MICROBOARD_CONFIG.STICKER_COLORS[7] &&
        "white";
      const textColor =
        textStyles?.color || style?.color || stickerColor || "black";

      return {
        text: stringText,
        type: "text",
        bold: fontStyles.includes("bold"),
        italic: fontStyles.includes("italic"),
        underline: fontStyles.includes("underline"),
        overline: false,
        "line-through": fontStyles.includes("line-through"),
        subscript: false,
        superscript: false,
        fontColor: textColor,
        fontSize: style?.fontSize ? +style.fontSize : 14,
        fontHighlight: textStyles?.backgroundColor,
      };
    });
  };

  const getFontStyles = (element: HTMLElement): string[] => {
    const fontStyles: string[] = [];
    const tagName = element?.tagName?.toLowerCase();

    if (tagName === "strong") {
      fontStyles.push("bold");
    }
    if (tagName === "em") {
      fontStyles.push("italic");
    }
    if (tagName === "u") {
      fontStyles.push("underline");
    }
    if (tagName === "s") {
      fontStyles.push("line-through");
    }

    Array.from(element.childNodes).forEach((child) => {
      if (child instanceof HTMLElement) {
        fontStyles.push(...getFontStyles(child));
      }
    });

    return fontStyles;
  };

  const getMiroItemById = (id: string): IMiroBoardItem | undefined => {
    const miroBoardItems = getMiroBoardItems();
    return miroBoardItems.find((item: IMiroBoardItem) => item.id === id);
  };

  const getItemPosition = (
    position: IMiroPosition,
    geometry: IMiroGeometry,
    parent?: IMiroParent,
    scale?: number,
    itemType?: MiroItemsTypes,
  ): { x: number; y: number } | null => {
    const { x, y, relativeTo } = position;
    const { height, width } = geometry;
    if (relativeTo === MiroRelativeTo.board) {
      return {
        x: x - width / 2,
        y: y - height / 2,
      };
    }

    if (!parent) {
      console.error("Parent is undefined");
      return null;
    }

    const parentItem = getMiroItemById(parent?.id);
    if (!parentItem) {
      return null;
    }

    const parentScale =
      parentItem.type === MiroBoardItemTypes.IMAGE ? parentItem.data?.scale : 1;

    const transformedGeometry = {
      width: parentItem.geometry.width * parentScale,
      height: parentItem.geometry.height * parentScale,
    };

    const parentItemPosition = getItemPosition(
      parentItem.position,
      transformedGeometry,
    );
    if (!parentItemPosition) {
      console.error("Unable to find frame position");
      return null;
    }

    if (scale && itemType === MiroBoardItemTypes.UNSUPPORTED) {
      return {
        x: x - (width * scale) / 2 + parentItemPosition.x,
        y: y - (height * scale) / 2 + parentItemPosition.y,
      };
    }

    if (scale && itemType === MiroBoardItemTypes.PAINT) {
      return {
        x: x / scale - width / 2 + parentItemPosition.x,
        y: y / scale - height / 2 + parentItemPosition.y,
      };
    }

    return {
      x: x - width / 2 + parentItemPosition.x,
      y: y - height / 2 + parentItemPosition.y,
    };
  };

  const getItemGeometry = (
    geometry: IMiroGeometry,
    itemType: string,
    scale?: number,
  ): { width: number; height: number } => {
    const { width, height } = geometry;

    if (itemType === "unsupported") {
      itemType = "shape";
    }

    if (scale) {
      return {
        width: width * scale,
        height: height * scale,
      };
    }

    return {
      width: width,
      height: height,
    };
  };

  const setTransformation = (
    item: Item,
    miroItem: IMiroBoardItem,
    scale?: number,
  ): void => {
    const { geometry, position, parent } = miroItem;
    const itemGeometry = getItemGeometry(geometry, miroItem.type, scale);

    if (item.itemType === "RichText") {
      applyRichTextTransformation(
        item as RichText,
        position,
        itemGeometry,
        parent,
        scale,
      );
    } else {
      applyStandardTransformation(
        item,
        itemGeometry,
        miroItem,
        position,
        parent,
      );
    }
  };

  const applyRichTextTransformation = (
    item: RichText,
    position: IMiroPosition,
    itemGeometry: IMiroGeometry,
    parent?: IMiroParent,
    scale?: number,
  ): void => {
    if (scale) {
      item.apply({
        class: "Transformation",
        method: "scaleBy",
        item: [item.id],
        scaleX: scale,
        scaleY: scale,
      } as any);
    }

    const { height } = getItemDimensions(item);
    const itemPosition = getItemPosition(
      position,
      { width: itemGeometry.width, height },
      parent,
    );

    if (itemPosition) {
      item.apply({
        class: "Transformation",
        method: "translateTo",
        item: [item.id],
        x: itemPosition.x,
        y: itemPosition.y,
      } as any);
    }
  };

  const applyStandardTransformation = (
    item: Item,
    itemGeometry: IMiroGeometry,
    miroItem: IMiroBoardItem,
    position: IMiroPosition,
    parent?: IMiroParent,
  ): void => {
    const updatedGeometry = updateStickerGeometry(item, itemGeometry);
    const itemPosition = getItemPosition(
      position,
      miroItem.geometry,
      parent,
      miroItem.type === MiroBoardItemTypes.PAINT ||
        miroItem.type === MiroBoardItemTypes.UNSUPPORTED
        ? miroItem.relativeScale
        : undefined,
      miroItem.type,
    );

    if (itemPosition) {
      item.apply({
        class: "Transformation",
        method: "translateTo",
        item: [item.id],
        x: itemPosition.x,
        y: itemPosition.y,
      } as any);
    }

    item.apply({
      class: "Transformation",
      method: "scaleTo",
      item: [item.id],
      width: updatedGeometry.width,
      height: updatedGeometry.height,
    } as any);
  };

  const getItemDimensions = (item: Item): { width: number; height: number } => {
    const mbr = item.getPath().getMbr();
    return {
      width: mbr.getWidth(),
      height: mbr.getHeight(),
    };
  };

  const updateStickerGeometry = (
    item: Item,
    geometry: { width: number; height: number },
  ): { width: number; height: number } => {
    if (item.itemType !== "Sticker") {
      return geometry;
    }

    if (geometry.height >= geometry.width) {
      return {
        width: geometry.height,
        height: geometry.height,
      };
    }

    return {
      width: geometry.width,
      height: geometry.height,
    };
  };

  const copyShape = (item: IMiroBoardItemShape): void => {
    const { id } = item;

    const shapeData = MiroItemConverter.convert(item);
    const shape = board.createItemAndAdd<Shape>("Shape", shapeData);

    setTransformation(shape, item);
    setBoardMiroId(id);
  };

  const copySticker = (item: IMiroBoardItemSticker): void => {
    const { id, data } = item;

    const stickerData = MiroItemConverter.convert(item);
    const sticker = board.createItemAndAdd<Sticker>("Sticker", stickerData);

    setTransformation(sticker, item);
    data?.content && setItemText(sticker, data.content, item.style);
    setBoardMiroId(id);
  };

  const getImage = async (imageUrl: string): Promise<MiroImage | null> => {
    const token = Cookies.get("miro_accessToken");
    try {
      const response = await fetch(imageUrl, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      const img = await response.json();

      if (img.status === 401) {
        getMiroToken();
        Cookies.remove("miro_accessToken");
      }

      return img;
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const imageUrlToBase64 = async (url: string): Promise<string | undefined> => {
    try {
      const data = await fetch(url);
      const blob = await data.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result?.toString();
          resolve(base64data);
        };
        reader.onerror = reject;
      });
    } catch (error) {
      return undefined;
    }
  };

  const copyImage = async (item: IMiroBoardItemImage): Promise<void> => {
    const { id, position, data, geometry, parent, linkTo } = item;
    const prepareImgUrl =
      data.imageUrl.split("?")[0] + "?format=original&redirect=false";
    const img = await getImage(prepareImgUrl);
    const imgUrl = img?.url ?? "";
    const imgBase64: string = await imageUrlToBase64(imgUrl ?? "").then(
      (base64Data) => base64Data ?? "",
    );

    if (!imgBase64) {
      return;
    }

    await prepareImage(imgBase64, board.getBoardId(), getApiUrl())
      .then((imageData) => {
        // remove placeholder
        const placeholder = board.items.getById(boardMiroId[id]);
        if (placeholder) {
          board.remove(placeholder);
        }

        const imgItem = board.createItemAndAdd<ImageItem>("Image", imageData);
        imgItem.setId(id);

        const imgPosition = getItemPosition(
          position,
          {
            width: geometry.width * data.scale,
            height: geometry.height * data.scale,
          },
          parent,
        );

        const transformedGeometry = {
          width: (geometry.width / imageData.imageDimension.width) * data.scale,
          height:
            (geometry.height / imageData.imageDimension.height) * data.scale,
        };

        if (imgPosition) {
          imgItem.apply({
            class: "Transformation",
            method: "translateTo",
            item: [imgItem.id],
            x: imgPosition.x,
            y: imgPosition.y,
          } as any);
        }

        imgItem.apply({
          class: "Transformation",
          method: "scaleBy",
          item: [imgItem.id],
          scaleX: transformedGeometry.width,
          scaleY: transformedGeometry.height,
        } as any);

        if (linkTo) {
          imgItem.apply({
            class: "BaseItem",
            method: "setLinkTo",
            item: [imgItem.id],
            linkTo,
          } as any);
        }

        setBoardMiroId(id);
      })
      .catch(() => {
        closeModal();
        openModal(ERROR_NOTIFICATION);
        setModalData("clipboard");
      });
  };

  const addImagePlaceholder = (item: IMiroBoardItemImage): void => {
    const { id } = item;

    const placeholderData = MiroItemConverter.convert(item as any);
    const placeholder = board.createItemAndAdd<Placeholder>(
      "Placeholder",
      placeholderData,
    );

    setTransformation(placeholder, item);
    setBoardMiroId(id);
  };

  const copyConnector = (item: IMiroBoardItemConnector): void => {
    const { id, style, captions } = item;

    const connectorData = MiroItemConverter.convert(item);
    const connector = board.createItemAndAdd<Connector>(
      "Connector",
      connectorData,
    );

    captions &&
      setItemText(connector, (captions || [])[0]?.content || "", style);
    setBoardMiroId(id);
  };

  const copyText = (item: IMiroBoardItemText): void => {
    const { id, style, data, scale, linkTo } = item;

    const textData = MiroItemConverter.convert(item);
    const richtext = board.createItemAndAdd<RichText>("RichText", textData);

    setItemText(richtext, data.content, style);
    setTransformation(richtext, item, scale);
    if (linkTo) {
      richtext.apply({
        class: "BaseItem",
        method: "setLinkTo",
        item: [richtext.id],
        linkTo,
      } as any);
    }
    setBoardMiroId(id);
  };

  const copyFrame = async (item: IMiroBoardItemFrame): Promise<void> => {
    const { id } = item;

    const frameData = MiroItemConverter.convert(item);
    const frame = board.createItemAndAdd<Frame>("Frame", frameData);

    setTransformation(frame, item);
    setBoardMiroId(id);
  };

  const copyPaint = (item: IMiroBoardItemPaint): void => {
    const { id } = item;

    const paintData = MiroItemConverter.convert(item);
    const drawing = board.createItemAndAdd<Drawing>("Drawing", paintData);

    setTransformation(drawing, item, item.data.scale);
    setBoardMiroId(id);
  };

  const copyPlaceholder = (item: MiroUnsupportedItem): void => {
    const { id } = item;

    const placeholderData = MiroItemConverter.convert(item as any);
    const placeholder = board.createItemAndAdd<Placeholder>(
      "Placeholder",
      placeholderData,
    );

    setTransformation(placeholder, item, (item as any).scale);
    setBoardMiroId(id);
  };

  const copyUnsupportedItem = (item: any): void => {
    copyPlaceholder(item);
  };

  const itemsTypes: {
    [key in MiroItemsTypes]: (item: any) => Promise<void> | void;
  } = {
    shape: copyShape,
    sticky_note: copySticker,
    image: copyImage,
    text: copyText,
    frame: copyFrame,
    connector: copyConnector,
    card: copyUnsupportedItem,
    document: copyUnsupportedItem,
    mindmap_node: copyUnsupportedItem,
    paint: copyPaint,
    unsupported: copyUnsupportedItem,
  };

  const copyBoardItems = async (): Promise<void> => {
    const miroBoardItems = getMiroBoardItems();
    const token = Cookies.get("miro_accessToken");

    if (
      (!token || token === "undefined") &&
      miroBoardItems.some((item) => item.type === "image") &&
      !withoutImgs
    ) {
      getMiroToken();
      return;
    }

    openModal(LOADING_NOTIFICATION);

    miroBoardItems
      .filter((item) => item.type === MiroBoardItemTypes.IMAGE)
      .forEach((item) => addImagePlaceholder(item));

    for (const [index, item] of miroBoardItems.entries()) {
      const type = item.type as MiroItemsTypes;
      setModalData(Math.floor((index / miroBoardItems.length) * 100));

      if (!!isModalOpen(ERROR_NOTIFICATION)) {
        setModalData("clipboard");
        return;
      }

      if (withoutImgs && type === MiroBoardItemTypes.IMAGE) {
        continue;
      }

      if (item.type !== MiroBoardItemTypes.CONNECTOR && itemsTypes[type]) {
        await itemsTypes[type](item);
      }
    }

    if (!!isModalOpen(ERROR_NOTIFICATION)) {
      return;
    }

    miroBoardItems
      .filter((item) => item.type === MiroBoardItemTypes.CONNECTOR)
      .forEach(copyConnector);

    const hasUnsupportedItems = miroBoardItems.some(
      (item) => item.type === MiroBoardItemTypes.UNSUPPORTED,
    );

    closeModal();
    openModal(
      hasUnsupportedItems ? WARN_CLIPBOARD_NOTIFICATION : SUCCESS_NOTIFICATION,
    );

    localStorage.removeItem("miroItems");
    const url = new URL(window.location.href);
    if (url.searchParams.has("clipboard")) {
      url.searchParams.delete("clipboard");
      window.history.replaceState({}, document.title, url);
    }
  };

  copyBoardItems();
};

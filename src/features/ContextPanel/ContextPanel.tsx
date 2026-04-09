import { useDomMbr } from "App/useDomMbr";
import { useAppSubscription } from "App/useBoardSubscription";
import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "features/AppContext";
import { OverlayContextActions } from "features/OverlayUI/overlayUi";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { Delete } from "./Buttons/Delete";
import { DrawFillStyle } from "./Buttons/DrawFillStyle";
import { DrawStrokeWidth } from "./Buttons/DrawStrokeWidth/DrawStrokeWidth";
import { Duplicate } from "./Buttons/Duplicate";
import { Edit } from "./Buttons/Edit";
import { FontSize } from "./Buttons/FontSize";
import { FontStyle } from "./Buttons/FontStyle";
import { FrameFill } from "./Buttons/FrameFill";
import { FrameRatio } from "./Buttons/FrameRatio";
import { RestOptionsMenu } from "./Buttons/RestOptionsMenu";
import {
  BringToFront,
  ExportFrame,
  ForceGraphToggle,
  SendToBack,
} from "./Buttons/RestOptionsMenu/Items";
import { StickerFillStyle } from "./Buttons/StickerFillStyle";
import { StrokeStyle } from "./Buttons/StrokeStyle";
import { TextAlignment } from "./Buttons/TextAlignment/TextAlignment";
import { TextColor } from "./Buttons/TextColor";
import { TextHighlight } from "./Buttons/TextHighlight";
import { ToggleFrameRatio } from "./Buttons/ToggleFrameRatio";
import { PanelContext } from "./PanelContext";
import { Lock } from "./Buttons/Lock";
import { ConnectorFontStyle } from "./Buttons/ConnectorFontStyle";
import { ConnectorFontSize } from "./Buttons/FontSize";
import { ConnectorTextColor } from "./Buttons/ConnectorTextColor";
import { ConnectorTextHighlight } from "./Buttons/ConnectorTextHighlight";
import { CopyItemLink } from "./Buttons/RestOptionsMenu/Items/CopyItemLink";
import { SetLinkTo } from "./Buttons/RestOptionsMenu/Items/SetLinkTo";
import { AIGeneration } from "features/ContextPanel/Buttons/AIGeneration";
import { getIdeaFromSelection } from "entities/AIInput";
import { FrameNavNext } from "./Buttons/FrameNavNext";
import { FrameNavPrev } from "./Buttons/FrameNavPrev";
import { HyperLinkBtn } from "features/ContextPanel/Buttons/HyperLinkBtn";
import { AIModel } from "features/ContextPanel/Buttons/AIModel/AIModel";
import { UiSeparator } from "shared/ui-lib/UiSeparator";
import { SaveImg } from "./Buttons/RestOptionsMenu/Items/SaveImg";
import { SaveVideoOrAudio } from "features/ContextPanel/Buttons/RestOptionsMenu/Items/SaveVideoOrAudio";
import { AddList } from "features/ContextPanel/Buttons/AddList/AddList";
import { ToggleIsShining } from "features/ContextPanel/Buttons/ToggleIsShining";
import { RotateItem } from "features/ContextPanel/Buttons/RotateItem";
import { LockResize } from "features/ContextPanel/Buttons/LockResize";
import { intersectOverlayActions } from "microboard-temp";
import { GetRandomItem } from "features/ContextPanel/Buttons/CardGame/Screeen/GetRandomItem";
import { GroupItems } from "./Buttons/GroupItems";
import { DetachFromGroup } from "./Buttons/DetachFromGroup";
import { SelectParent } from "./Buttons/SelectParent";
import { HierarchyBreadcrumbs } from "./HierarchyBreadcrumbs";
import { selectHierarchyAncestor } from "features/HierarchyNavigation/hierarchyUi";
import { useForceUpdate } from "shared/lib/useForceUpdate";

export function ContextPanel(): React.ReactElement | null {
  const { app, board } = useAppContext();
  const [openedMenu, setOpenedMenu] = useState("None");
  const forceUpdate = useForceUpdate();
  const panelRef = useRef<HTMLDivElement>(null);
  const mbr = useDomMbr({
    app,
    board,
    ref: panelRef,
  });
  const selectionSignature = `${board.selection.getContext()}::${board.selection.items
    .ids()
    .join(",")}`;

  useAppSubscription({
    subjects: ["selectionItems", "selectionItem"],
    observer: forceUpdate,
  });

  useEffect(() => {
    setOpenedMenu("None");
  }, [selectionSignature]);

  const toggleMenu = (menu: string): void =>
    setOpenedMenu((prev) => (prev === menu ? "None" : menu));

  const windowHeight = board.camera.window.height;
  const windowWidth = board.camera.window.width;

  const isInvisible =
    board.selection.getContext() === "None" ||
    board.selection.transformationRenderBlock;

  if (isInvisible) {
    return null;
  }

  const isLocked = board.selection.items
    .list()
    .filter((item) => item.transformation.isLocked).length;

  const isSelectUnderPointer =
    board.selection.getContext() === "SelectUnderPointer";

  const isHoverUnderPointer =
    board.selection.getContext() === "HoverUnderPointer";

  const ideaFromSelection = getIdeaFromSelection(board.selection.items.list());

  const selectionHierarchyPaths = board.selection.getSelectionHierarchyPaths();
  const isText = board.selection.items.isAllItemsType("RichText");
  const isSticker = board.selection.items.isAllItemsType("Sticker");
  const isShape = board.selection.items.isAllItemsType("Shape");
  const isConnector = board.selection.items.isAllItemsType("Connector");
  const isPen = board.selection.items.isAllItemsType("Drawing");
  const isImage = board.selection.items.isAllItemsType("Image");
  const isFrame = board.selection.items.isAllItemsType("Frame");
  const isPlaceholder = board.selection.items.isAllItemsType("Placeholder");
  const isAINode = board.selection.items.isAllItemsType("AINode");
  const isVideo = board.selection.items.isAllItemsType("Video");
  const isAudio = board.selection.items.isAllItemsType("Audio");
  const isStar = board.selection.items.isAllItemsType("Star");
  const isDeck = board.selection.items.isAllItemsType("Deck");
  const isCard = board.selection.items.isAllItemsType("Card");
  const isCardOrDeck = board.selection.items.isItemTypes(["Card", "Deck"]);
  const isDice = board.selection.items.isAllItemsType("Dice");
  const isScreen = board.selection.items.isAllItemsType("Screen");
  const isDifferentItems =
    !isText &&
    !isSticker &&
    !isShape &&
    !isConnector &&
    !isPen &&
    !isImage &&
    !isFrame &&
    !isPlaceholder &&
    !isAINode &&
    !isVideo &&
    !isAudio &&
    !isStar &&
    !isDeck &&
    !isCard &&
    !isCardOrDeck &&
    !isDice &&
    !isScreen;
  const overlayActionsCount = intersectOverlayActions(
    board.selection.items.list(),
  ).length;

  return (
    <PanelContext.Provider
      value={{
        openedMenu,
        panelMbr: mbr,
        toggleMenu,
        windowHeight,
        windowWidth,
      }}
    >
      <HierarchyBreadcrumbs
        path={selectionHierarchyPaths}
        left={mbr.left}
        top={mbr.top}
        onSelect={(ancestorId) => {
          selectHierarchyAncestor(board, ancestorId);
        }}
      />
      <UiPanel
        style={{
          position: "absolute",
          left: mbr.left,
          top: mbr.top,
        }}
        zIndex={3}
        ref={panelRef}
        padding={0}
        id="ContextPanel"
      >
        {isSelectUnderPointer && !isLocked && (
          <>
            <Edit />
            <RestOptionsMenu rounded="right">
              <BringToFront />
              <SendToBack />
            </RestOptionsMenu>
          </>
        )}
        {isPlaceholder && !isSelectUnderPointer && !isLocked && (
          <>
            <Lock rounded="left" />
            <UiSeparator vertical />
            <SelectParent />
            <Delete />
            <RestOptionsMenu rounded="right">
              <BringToFront />
              <SendToBack />
            </RestOptionsMenu>
          </>
        )}
        {isText && !isSelectUnderPointer && !isLocked && (
          <>
            <FontSize />
            <UiSeparator vertical />
            <FontStyle />
            <TextAlignment />
            <AddList />
            <HyperLinkBtn />
            <UiSeparator vertical />
            <TextColor />
            <TextHighlight />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            {window.enableAI && (
              <>
                <AIModel />
                <AIGeneration />
                <UiSeparator vertical />
              </>
            )}
            <RestOptionsMenu>
              <CopyItemLink />
              <SetLinkTo />
              <ForceGraphToggle />
            </RestOptionsMenu>
          </>
        )}
        {isSticker && !isSelectUnderPointer && !isLocked && (
          <>
            <FontSize />
            <UiSeparator vertical />
            <FontStyle />
            <TextAlignment />
            <AddList />
            <HyperLinkBtn />
            <UiSeparator vertical />
            <TextColor />
            <TextHighlight />
            <UiSeparator vertical />
            <StickerFillStyle />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            {window.enableAI && (
              <>
                <AIModel />
                <AIGeneration />
                <UiSeparator vertical />
              </>
            )}
            <RestOptionsMenu>
              <CopyItemLink />
              <SetLinkTo />
              <ForceGraphToggle />
            </RestOptionsMenu>
          </>
        )}
        {isShape && !isSelectUnderPointer && !isLocked && (
          <>
            {board.selection.items
              .getItemsByItemTypes(["Shape"])[0]
              .getIsShapeWithText() && (
              <>
                <FontSize />
                <UiSeparator vertical />
                <FontStyle />
                <TextAlignment />
                <AddList />
                <HyperLinkBtn />
                <UiSeparator vertical />
                <TextColor />
                <TextHighlight />
                <UiSeparator vertical />
              </>
            )}
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            {window.enableAI && (
              <>
                <AIModel />
                <AIGeneration />
                <UiSeparator vertical />
              </>
            )}
            <RestOptionsMenu>
              <CopyItemLink />
              <SetLinkTo />
              <ForceGraphToggle />
            </RestOptionsMenu>
          </>
        )}
        {isConnector && !isSelectUnderPointer && !isLocked && (
          <>
            <ConnectorFontSize />
            <ConnectorFontStyle />
            <UiSeparator vertical />
            <ConnectorTextColor />
            <ConnectorTextHighlight />
            <UiSeparator vertical />
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <CopyItemLink />
              <SetLinkTo />
            </RestOptionsMenu>
          </>
        )}
        {isPen && !isSelectUnderPointer && !isLocked && (
          <>
            <DrawStrokeWidth />
            <UiSeparator vertical />
            <DrawFillStyle />
            <UiSeparator vertical />
            <Lock />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <Delete />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <BringToFront />
              <SendToBack />
              <CopyItemLink />
              <SetLinkTo />
              <Duplicate />
            </RestOptionsMenu>
          </>
        )}
        {isImage && !isSelectUnderPointer && !isLocked && (
          <>
            <OverlayContextActions includeSelectionActions={false} />
            <RotateItem clockwise={false} />
            <RotateItem clockwise={true} />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <CopyItemLink />
              <SetLinkTo />
              <SaveImg />
            </RestOptionsMenu>
          </>
        )}
        {isVideo && !isSelectUnderPointer && !isLocked && (
          <>
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <CopyItemLink />
              {/* <SetLinkTo />*/}
              {/* <Duplicate />*/}
              <SaveVideoOrAudio itemType="Video" />
            </RestOptionsMenu>
          </>
        )}
        {isAudio && !isSelectUnderPointer && !isLocked && (
          <>
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <CopyItemLink />
              <SaveVideoOrAudio itemType="Audio" />
            </RestOptionsMenu>
          </>
        )}
        {isFrame && !isSelectUnderPointer && !isLocked && (
          <>
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <FrameRatio />
            <ToggleFrameRatio />
            <UiSeparator vertical />
            <FrameFill />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <FrameNavNext />
              <FrameNavPrev />
              <CopyItemLink />
              <SetLinkTo />
              <ExportFrame />
            </RestOptionsMenu>
          </>
        )}
        {isAINode && !isSelectUnderPointer && !isLocked && (
          <>
            <FontSize />
            <UiSeparator vertical />
            <FontStyle />
            <TextAlignment />
            <AddList />
            <HyperLinkBtn />
            <UiSeparator vertical />
            <TextColor />
            <TextHighlight />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            {window.enableAI && (
              <>
                <AIModel />
                <AIGeneration />
                <UiSeparator vertical />
              </>
            )}
            <RestOptionsMenu>
              <CopyItemLink />
              <SetLinkTo />
              <ForceGraphToggle />
            </RestOptionsMenu>
          </>
        )}
        {isStar && !isSelectUnderPointer && !isLocked && (
          <>
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <ToggleIsShining />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <CopyItemLink />
              <SetLinkTo />
            </RestOptionsMenu>
          </>
        )}
        {isDeck && !isSelectUnderPointer && !isLocked && (
          <>
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <CopyItemLink />
            </RestOptionsMenu>
          </>
        )}
        {isCard && !isSelectUnderPointer && !isLocked && (
          <>
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <LockResize />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <CopyItemLink />
            </RestOptionsMenu>
          </>
        )}
        {isCardOrDeck &&
          !isDeck &&
          !isCard &&
          !isSelectUnderPointer &&
          !isLocked && (
            <>
              <OverlayContextActions includeSelectionActions={false} />
              <UiSeparator vertical />
              <Delete rounded="right" />
            </>
          )}
        {isDice && !isSelectUnderPointer && !isLocked && (
          <>
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <StrokeStyle />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <CopyItemLink />
            </RestOptionsMenu>
          </>
        )}
        {isScreen && !isSelectUnderPointer && !isLocked && (
          <>
            <OverlayContextActions includeSelectionActions={false} />
            <UiSeparator vertical />
            <GetRandomItem />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <CopyItemLink />
            </RestOptionsMenu>
          </>
        )}
        {!isDifferentItems && !!isLocked && (
          <>
            <Lock rounded="left" />
            <UiSeparator vertical />
            <SelectParent />
            {isLocked <= 1 ? (
              <RestOptionsMenu rounded="right">
                <CopyItemLink />
                <ExportFrame />
                <Duplicate />
              </RestOptionsMenu>
            ) : null}
          </>
        )}
        {isDifferentItems && !isSelectUnderPointer && !isHoverUnderPointer && (
          <>
            {overlayActionsCount > 0 ? (
              <>
                <OverlayContextActions includeSelectionActions={false} />
                <UiSeparator vertical />
              </>
            ) : null}
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            {window.enableAI && ideaFromSelection && <AIGeneration />}
          </>
        )}
      </UiPanel>
    </PanelContext.Provider>
  );
}

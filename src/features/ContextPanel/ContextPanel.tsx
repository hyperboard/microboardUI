import { useDomMbr } from "App/useDomMbr";
import { useAppSubscription } from "App/useBoardSubscription";
import React, { useRef, useState } from "react";
import { useAppContext } from "features/AppContext";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { ConnectorAddText } from "./Buttons/ConnectorAddText";
import { ConnectorType } from "./Buttons/ConnectorType";
import { Delete } from "./Buttons/Delete";
import { DrawFillStyle } from "./Buttons/DrawFillStyle";
import { DrawStrokeWidth } from "./Buttons/DrawStrokeWidth/DrawStrokeWidth";
import { Duplicate } from "./Buttons/Duplicate";
import { Edit } from "./Buttons/Edit";
import { EndPointer } from "./Buttons/EndPointer";
import { FillStyle } from "./Buttons/FillStyle";
import { FontSize } from "./Buttons/FontSize";
import { FontStyle } from "./Buttons/FontStyle";
import { FrameFill } from "./Buttons/FrameFill";
import { FrameRatio } from "./Buttons/FrameRatio";
import { ItemType } from "./Buttons/ItemType/ItemType";
import { RestOptionsMenu } from "./Buttons/RestOptionsMenu";
import {
  BringToFront,
  ExportFrame,
  ForceGraphToggle,
  SendToBack,
} from "./Buttons/RestOptionsMenu/Items";
import { StartPointer } from "./Buttons/StartPointer/StartPointer";
import { StickerFillStyle } from "./Buttons/StickerFillStyle";
import { StrokeStyle } from "./Buttons/StrokeStyle";
import { SwitchPointers } from "./Buttons/SwitchPointers";
import { TextAlignment } from "./Buttons/TextAlignment/TextAlignment";
import { TextColor } from "./Buttons/TextColor";
import { TextHighlight } from "./Buttons/TextHighlight";
import { ToggleFrameRatio } from "./Buttons/ToggleFrameRatio";
import { PanelContext } from "./PanelContext";
import { Lock } from "./Buttons/Lock";
import { ConnectorLineColor } from "./Buttons/ConnectorLineColor";
import { ConnectorSmartJump } from "./Buttons/ConnectorSmartJump";
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
import { ShuffleDeck } from "features/ContextPanel/Buttons/CardGame/Deck/ShuffleDeck";
import { GetCard } from "features/ContextPanel/Buttons/CardGame/Deck/GetCard";
import { CreateDeck } from "features/ContextPanel/Buttons/CardGame/Card/CreateDeck";
import { FlipCard } from "features/ContextPanel/Buttons/CardGame/Card/FlipCard";
import { ThrowDice } from "features/ContextPanel/Buttons/CardGame/Dice/ThrowDice";
import { ChangeRange } from "features/ContextPanel/Buttons/CardGame/Dice/ChangeRange/ChangeRange";
import { FlipDeck } from "features/ContextPanel/Buttons/CardGame/Deck/FlipDeck";
import { RotateItem } from "features/ContextPanel/Buttons/RotateItem";
import { LockResize } from "features/ContextPanel/Buttons/LockResize";
import { SpreadCards } from "features/ContextPanel/Buttons/CardGame/Deck/SpreadCards/SpreadCards";
import { Screen } from "microboard-temp";
import { RemoveBackgroundImage } from "features/ContextPanel/Buttons/CardGame/Screeen/RemoveBackgroundImage";
import { SetBackgroundImage } from "features/ContextPanel/Buttons/CardGame/Screeen/SetBackgroundImage";
import { GetRandomItem } from "features/ContextPanel/Buttons/CardGame/Screeen/GetRandomItem";
import { GroupItems } from "./Buttons/GroupItems";
import { DetachFromGroup } from "./Buttons/DetachFromGroup";
import { SelectParent } from "./Buttons/SelectParent";
import { HierarchyBreadcrumbs } from "./HierarchyBreadcrumbs";
import { selectHierarchyAncestor } from "features/HierarchyNavigation/hierarchyUi";

export function ContextPanel(): React.ReactElement | null {
  const { app, board } = useAppContext();
  const [openedMenu, setOpenedMenu] = useState("None");
  const panelRef = useRef<HTMLDivElement>(null);
  const mbr = useDomMbr({
    app,
    board,
    ref: panelRef,
  });
  useAppSubscription({
    subjects: ["selectionItems"],
    observer: () => {
      setOpenedMenu("None");
    },
  });
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

  const single = board.selection.items.getSingle();
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
            <FontSize rounded="left" />
            <FontStyle />
            <TextAlignment />
            <AddList />
            <HyperLinkBtn />
            <UiSeparator vertical />
            <TextColor />
            <TextHighlight />
            <UiSeparator vertical />
            <Lock />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <Delete />
            <UiSeparator vertical />
            {window.enableAI && (
              <>
                <AIModel />
                <AIGeneration />
                <UiSeparator vertical />
              </>
            )}
            <RestOptionsMenu>
              <BringToFront />
              <SendToBack />
              <CopyItemLink />
              <SetLinkTo />
              <Duplicate />
              <ForceGraphToggle />
            </RestOptionsMenu>
          </>
        )}
        {isSticker && !isSelectUnderPointer && !isLocked && (
          <>
            <FontSize rounded="left" />
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
            <Lock />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <Delete />
            <UiSeparator vertical />
            {window.enableAI && (
              <>
                <AIModel />
                <AIGeneration />
                <UiSeparator vertical />
              </>
            )}
            <RestOptionsMenu>
              <BringToFront />
              <SendToBack />
              <CopyItemLink />
              <SetLinkTo />
              <Duplicate />
              <ForceGraphToggle />
            </RestOptionsMenu>
          </>
        )}
        {isShape && !isSelectUnderPointer && !isLocked && (
          <>
            <ItemType />
            <UiSeparator vertical />
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
            <StrokeStyle />
            {board.selection.items
              .getItemsByItemTypes(["Shape"])[0]
              .getPath()
              .isClosed() && <FillStyle />}
            <UiSeparator vertical />
            <Lock />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <Delete />
            <UiSeparator vertical />
            {window.enableAI && (
              <>
                <AIModel />
                <AIGeneration />
                <UiSeparator vertical />
              </>
            )}
            <RestOptionsMenu>
              <BringToFront />
              <SendToBack />
              <CopyItemLink />
              <SetLinkTo />
              <Duplicate />
              <ForceGraphToggle />
            </RestOptionsMenu>
          </>
        )}
        {isConnector && !isSelectUnderPointer && !isLocked && (
          <>
            <StartPointer />
            <SwitchPointers />
            <EndPointer />
            <UiSeparator vertical />
            <ConnectorType />
            <ConnectorSmartJump />
            <ConnectorLineColor />
            <UiSeparator vertical />
            <ConnectorAddText />
            <ConnectorFontSize />
            <ConnectorFontStyle />
            <ConnectorTextColor />
            <ConnectorTextHighlight />
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
            <Lock rounded="left" />
            <RotateItem clockwise={false} />
            <RotateItem clockwise={true} />
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
              <SaveImg />
            </RestOptionsMenu>
          </>
        )}
        {isVideo && !isSelectUnderPointer && !isLocked && (
          <>
            <Lock rounded="left" />
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
              {/* <SetLinkTo />*/}
              {/* <Duplicate />*/}
              <SaveVideoOrAudio itemType="Video" />
            </RestOptionsMenu>
          </>
        )}
        {isAudio && !isSelectUnderPointer && !isLocked && (
          <>
            <Lock rounded="left" />
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
              <Duplicate />
              <SaveVideoOrAudio itemType="Audio" />
            </RestOptionsMenu>
          </>
        )}
        {isFrame && !isSelectUnderPointer && !isLocked && (
          <>
            <FrameRatio />
            <ToggleFrameRatio />
            <UiSeparator vertical />
            <FrameFill />
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
              <FrameNavNext />
              <FrameNavPrev />
              <CopyItemLink />
              <SetLinkTo />
              <Duplicate />
              <ExportFrame />
            </RestOptionsMenu>
          </>
        )}
        {isAINode && !isSelectUnderPointer && !isLocked && (
          <>
            <FontSize rounded="left" />
            <UiSeparator vertical />
            <FontStyle />
            <TextAlignment />
            <AddList />
            <HyperLinkBtn />
            <UiSeparator vertical />
            <TextColor />
            <TextHighlight />
            <UiSeparator vertical />
            <Lock />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <Delete />
            <UiSeparator vertical />
            {window.enableAI && (
              <>
                <AIModel />
                <AIGeneration />
                <UiSeparator vertical />
              </>
            )}
            <RestOptionsMenu>
              <BringToFront />
              <SendToBack />
              <CopyItemLink />
              <SetLinkTo />
              <Duplicate />
              <ForceGraphToggle />
            </RestOptionsMenu>
          </>
        )}
        {isStar && !isSelectUnderPointer && !isLocked && (
          <>
            <Lock rounded="left" />
            <UiSeparator vertical />
            <Delete />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <ToggleIsShining />
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
        {isDeck && !isSelectUnderPointer && !isLocked && (
          <>
            <FlipDeck rounded="left" />
            <ShuffleDeck />
            {single && <UiSeparator vertical />}
            <SpreadCards />
            {single && <UiSeparator vertical />}
            <GetCard cardPosition={"top"} />
            <GetCard cardPosition={"bottom"} />
            {single ? (
              <GetCard cardPosition={"random"} />
            ) : (
              <>
                <CreateDeck onlyCards={false} rounded="left" />
              </>
            )}
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
              <Duplicate />
            </RestOptionsMenu>
          </>
        )}
        {isCard && !isSelectUnderPointer && !isLocked && (
          <>
            <FlipCard rounded="left" />
            <UiSeparator vertical />
            <CreateDeck onlyCards={true} rounded="right" />
            <UiSeparator vertical />
            <RotateItem clockwise={false} />
            <RotateItem clockwise={true} />
            <UiSeparator vertical />
            <LockResize />
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
              <Duplicate />
            </RestOptionsMenu>
          </>
        )}
        {isCardOrDeck &&
          !isDeck &&
          !isCard &&
          !isSelectUnderPointer &&
          !isLocked && (
            <>
              <FlipCard rounded="left" />
              <UiSeparator vertical />
              <CreateDeck onlyCards={false} rounded="right" />
              <UiSeparator vertical />
              <Delete rounded="right" />
            </>
          )}
        {isDice && !isSelectUnderPointer && !isLocked && (
          <>
            <ThrowDice rounded="left" />
            <ChangeRange rangeValue="min" />
            <ChangeRange rangeValue="max" />
            <UiSeparator vertical />
            <StrokeStyle />
            <FillStyle />
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
              <Duplicate />
            </RestOptionsMenu>
          </>
        )}
        {isScreen && !isSelectUnderPointer && !isLocked && (
          <>
            <StrokeStyle rounded="left" />
            {board.selection.items
              .list()
              .some((item) => item instanceof Screen && item.backgroundUrl) ? (
              <>
                <SetBackgroundImage />
                <RemoveBackgroundImage />
              </>
            ) : (
              <>
                <FillStyle />
                <SetBackgroundImage />
              </>
            )}
            <UiSeparator vertical />
            <GetRandomItem />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <Delete />
            <UiSeparator vertical />
            <RestOptionsMenu>
              <BringToFront />
              <SendToBack />
              <CopyItemLink />
              <Duplicate />
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
            <Lock rounded="left" />
            <UiSeparator vertical />
            <GroupItems />
            <DetachFromGroup />
            <SelectParent />
            <Delete />
            {window.enableAI && ideaFromSelection && <AIGeneration />}
            <RestOptionsMenu rounded="full">
              <BringToFront />
              <SendToBack />
              <Duplicate />
            </RestOptionsMenu>
          </>
        )}
      </UiPanel>
    </PanelContext.Provider>
  );
}

import {
  createStrictContext,
  useStrictContext,
} from "shared/lib/strictContext";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { tempStorage } from "App/SessionStorage";
import { type ShapeFamilyName } from "./shapeMetadata";

type ShapesPanelContext = {
  openShapesPanel: () => void;
  closeShapesPanel: () => void;
  isOpen: boolean;
  selectedCategory: ShapeFamilyName;
  setSelectedCategory: (selectedCategory: ShapeFamilyName) => void;
};

export const ShapesPanelContext = createStrictContext<ShapesPanelContext>();

export function useShapesPanelContext(): ShapesPanelContext {
  return useStrictContext(ShapesPanelContext);
}

const getInitialShapeCategory = (): ShapeFamilyName => {
  const savedShapeData = tempStorage.getShapeData();

  if (savedShapeData) {
    const splitted = savedShapeData.shapeType.split("_");
    if (splitted.length > 1) {
      return splitted[0] === "BPMN" ? "bpmn" : splitted[0];
    }
  }
  return "basicShapes";
};

// was added to allow usage of ShapesPanelContextProvider outside of router provider
// (inside of local app)
function useLocation(): string {
  const [location, setLocation] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleUpdate = (): void => {
      setLocation(window.location.pathname);
    };
    window.addEventListener("popstate", handleUpdate);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    function patchedPushState(...args: Parameters<History["pushState"]>): void {
      originalPushState.apply(history, args);
      handleUpdate();
    }
    function patchedReplaceState(
      ...args: Parameters<History["replaceState"]>
    ): void {
      originalReplaceState.apply(history, args);
      handleUpdate();
    }

    history.pushState = patchedPushState;
    history.replaceState = patchedReplaceState;

    return () => {
      window.removeEventListener("popstate", handleUpdate);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return location;
}

export function ShapesPanelContextProvider({
  children,
}: PropsWithChildren<{}>): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ShapeFamilyName>(
    getInitialShapeCategory(),
  );
  const location = useLocation();

  useEffect(() => {
    setSelectedCategory(getInitialShapeCategory());
  }, [location]);

  const closePanel = (): void => {
    setIsOpen(false);
  };

  const openPanel = (): void => {
    setIsOpen(true);
  };

  return (
    <ShapesPanelContext.Provider
      value={{
        closeShapesPanel: closePanel,
        openShapesPanel: openPanel,
        isOpen,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </ShapesPanelContext.Provider>
  );
}

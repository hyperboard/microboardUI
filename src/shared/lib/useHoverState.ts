import { useState, type PointerEventHandler } from "react";

export function useHoverState() {
  const [isHover, setIsHover] = useState(false);

  const handlePointerEnter: PointerEventHandler = () => setIsHover(true);
  const handlePointerLeave: PointerEventHandler = () => setIsHover(false);

  return {
    isHover,
    handlePointerEnter,
    handlePointerLeave,
  };
}

import React, { useState } from "react";
import { Counter, Mbr } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import styles from "./Counter.module.css";

const COUNTER_DIMENSIONS = {
  width: 110,
  height: 32,
};

interface Props {
  item: Counter;
}

export const CounterComponent = ({ item }: Props) => {
  const { board } = useAppContext();
  const [count, setCount] = useState(0);
  const itemCount = item.getCount();
  const counterMbr = item.getMbr();

  const mbr = new Mbr(
    counterMbr.left,
    counterMbr.top,
    counterMbr.right,
    counterMbr.bottom,
  ).getTransformed(board.camera.getMatrix());

  return (
    <div
      style={{
        width: `${COUNTER_DIMENSIONS.width}px`,
        height: `${COUNTER_DIMENSIONS.height}px`,
        left: mbr.left,
        top: mbr.top,
        zIndex: board.getZIndex(item),
        transform: `scale(${item.transformation.getScale().x * board.camera.getScale()})`,
        transformOrigin: "top left",
      }}
      className={styles.container}
    >
      <button
        className={styles.btn}
        onClick={() => item.setCount(itemCount + 1)}
      >
        Public count: {itemCount}
      </button>
      <button className={styles.btn} onClick={() => setCount(count + 1)}>
        Local count: {count}
      </button>
    </div>
  );
};

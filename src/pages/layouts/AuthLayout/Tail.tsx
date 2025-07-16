import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export const Tail: React.FC<Props> = ({ width = 21, height = 20 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.9773 9.16591L9.50732 4.69591L10.6857 3.51758L17.1673 9.99924L10.6857 16.4809L9.50732 15.3026L13.9773 10.8326H3.83398V9.16591H13.9773Z"
        fill="currentColor"
      />
    </svg>
  );
};

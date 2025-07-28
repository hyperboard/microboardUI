import React from "react";

export function Logo({ id }: { id?: string }): React.JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      version="1.1"
      id={id}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m 12,2 c 3,1 5,3.8 4.5,7 l 4.5,1.5 c 0.7,0.2 1.2,0.8 1,1.5 -0.9,3.2 -3.8,5 -7,4.5 L 13.5,21 C 13.3,21.7 12.7,22.2 12,22 8.8,21.1 7,18.2 7.5,15 L 3,13.5 C 2.3,13.3 1.8,12.7 2,12 2.9,8.8 5.8,7 9,7.5 L 10.5,3 C 10.7,2.3 11.3,1.8 12,2 Z m 1.5,9 c -0.8,-0.8 -2.2,-0.8 -3,0 -0.8,0.8 -0.8,1.8 0,2.5 0.8,0.8 2.25,0.75 3,0 0.75,-0.75 0.75,-1.75 0,-2.5 z"
        fill="#8041FF"
        id="path1"
      />
    </svg>
  );
}

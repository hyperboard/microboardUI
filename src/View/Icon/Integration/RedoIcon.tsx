import React from 'react';

type Props = {
  isOn: boolean;
  width?: number;
  height?: number;
}

export function RedoIcon({isOn, width = 24, height = 24}: Props): React.ReactElement {
  return <svg width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" id="Undo">
  <path d="M13.0007 1L16.0007 4M16.0007 4L13.0007 7M16.0007 4H7.00069C3.68669 4 0.974609 6.96486 0.974609 10.0029C0.974609 13.0409 3.68669 16 7.00069 16H15.0007" stroke='currentColor' strokeOpacity={isOn ? '1' : '0.4'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
}
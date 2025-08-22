import { getApiUrl } from "Config";
import React, { useEffect, useRef } from "react";

export const TestPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script1 = document.createElement("script");
    script1.src = `${getApiUrl()}/embedMicroboard.js`;
    document.body.appendChild(script1);
    return () => {
      document.body.removeChild(script1);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        style={{ border: "1px solid black" }}
        onClick={() =>
          (window as any).microboardOpener.selectBoard({
            success: (data) => {
              console.log("SUCCESS", data);
              const { visitorsLink } = data;
              if (containerRef.current) {
                containerRef.current.innerHTML = `<iframe src="${visitorsLink}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
              }
            },
            error: console.error,
            cancel: console.warn,
          })
        }
      >
        Открыть окно
      </button>
      <div
        style={{
          flexGrow: 1,
        }}
        ref={containerRef}
      />
    </div>
  );
};

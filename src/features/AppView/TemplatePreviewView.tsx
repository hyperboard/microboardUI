import React, { useEffect, useRef } from "react";
import { useAppContext } from "features/AppContext";
import { Canvas } from "entities/Canvas";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ItemsProvider } from "features/ItemsProvider";
import { VideoPlayer } from "features/VideoPlayer/VideoPlayer";
import { AudioPlayer } from "features/AudioPlayer/AudioPlayer";
import { ErrorBoundary } from "features/ErrorBoundary/ErrorBoundary";
import style from "./AppView.module.css";

export function TemplatePreviewView(): React.JSX.Element {
  const { app, board } = useAppContext();
  const forceUpdate = useForceUpdate();
  const animationId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const itemsComponents = { Video: VideoPlayer, Audio: AudioPlayer };

  function update(): void {
    if (animationId.current) return;
    animationId.current = requestAnimationFrame(() => {
      forceUpdate();
      animationId.current = null;
    });
  }

  useEffect(() => {
    app.boardSubject.subscribe(update);
    const container = containerRef.current;
    if (container) {
      window.addEventListener("resize", app.controller.onResize);
    }
    return () => {
      app.boardSubject.unsubscribe(update);
      window.removeEventListener("resize", app.controller.onResize);
    };
  }, [containerRef.current]);

  return (
    <ErrorBoundary>
      <div className={style.wrapper}>
        <div ref={containerRef}>
          <Canvas
            router={{ location, navigate, params }}
            app={app}
            board={board}
          >
            <ItemsProvider itemsComponents={itemsComponents} />
          </Canvas>
        </div>
      </div>
    </ErrorBoundary>
  );
}

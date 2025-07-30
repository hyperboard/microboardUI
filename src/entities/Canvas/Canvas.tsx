import { App } from "App";
import { Subscription } from "App/getSubscriptions";
import { Board, DrawingContext } from "microboard-temp";
import * as React from "react";
import { WithRouterProps, withRouter } from "shared/lib/withRouter";
import { Watermark } from "./Watermark";

export interface Props extends WithRouterProps {
  app: App;
  board: Board;
  children?: React.ReactNode;
}

export class CanvasBase extends React.Component<Props> {
  stageRef = React.createRef<HTMLDivElement>();
  canvasRef = React.createRef<HTMLCanvasElement>();
  cursorsCanvasRef = React.createRef<HTMLCanvasElement>();
  options = {
    pointerdown: {},
    pointerup: {},
    click: {},
  };

  updateCursor = (): void => {
    const stage = this.stageRef.current;
    if (stage) {
      stage.style.cursor = this.props.board.pointer.getCursor();
    }
  };

  renderToContext = (): void => {
    const canvas = this.canvasRef.current;
    const cursorsCanvas = this.cursorsCanvasRef.current;
    if (!canvas || !cursorsCanvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    const cursorsCtx = cursorsCanvas.getContext("2d");
    if (!ctx || !cursorsCtx) {
      return;
    }
    const context = new DrawingContext(
      this.props.board.camera,
      ctx,
      cursorsCtx,
    );
    const { board } = this.props;

    context.setCamera(board.camera);
    context.clear();
    context.clearCursor();

    board.items.render(context);
    board.selection.render(context);
    board.tools.render(context);
    board.presence.render(context);
  };

  initCanvasRendering = (): void => {
    this.renderToContext();
    this.props.app.subscriptions.add(this.drawingContextSubscription);
    this.props.app.subscriptions.add(this.cursorSubscription);
    this.props.app.subscriptions.add(this.resizeSubscription);
  };

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (
      // @ts-expect-error boardId didn't exist in params record
      prevProps.router.params?.boardId !==
      // @ts-expect-error boardId didn't exist in params record
      this.props.router.params?.boardId
    ) {
      this.initCanvasRendering();
    }
  }

  componentDidMount(): void {
    const stage = this.stageRef.current;
    const controller = this.props.app.controller;
    if (stage) {
      stage.addEventListener(
        "pointerdown",
        (event) => {
          controller.onPointerDown(event);
          if (event.target) {
            (event.target as HTMLElement).setPointerCapture(event.pointerId);
          }
        },
        { capture: true },
      );

      stage.addEventListener(
        "pointerup",
        (event) => {
          controller.onPointerUp(event);
          if (event.target) {
            (event.target as HTMLElement).releasePointerCapture(
              event.pointerId,
            );
          }
        },
        { capture: true },
      );

      stage.addEventListener("pointermove", controller.onPointerMove, {
        capture: true,
      });
      stage.addEventListener("dblclick", controller.onClick);
    }

    this.initCanvasRendering();
  }

  componentWillUnmount(): void {
    const stage = this.stageRef.current;
    const controller = this.props.app.controller;
    if (stage) {
      stage.removeEventListener("pointerdown", controller.onPointerDown, {
        capture: true,
      });
      stage.removeEventListener("pointerup", controller.onPointerUp, {
        capture: true,
      });
      stage.removeEventListener("dblclick", controller.onClick);
    }
    this.props.app.subscriptions.remove(this.drawingContextSubscription);
    this.props.app.subscriptions.remove(this.cursorSubscription);
    this.props.app.subscriptions.remove(this.resizeSubscription);
  }

  drawingContextSubscription: Subscription = {
    observer: () => {
      this.renderToContext();
    },
    subjects: ["camera", "items", "tools", "selection", "presence"],
  };

  cursorSubscription: Subscription = {
    observer: this.updateCursor,
    subjects: ["pointer", "presence"],
  };

  resizeSubscription: Subscription = {
    observer: () => {
      this.forceUpdate();
    },
    subjects: ["cameraResize"],
  };

  render(): React.ReactElement {
    const board = this.props.board;
    const { width, height } = board.camera.window;
    return (
      <div
        id="CanvasContainer"
        className="NoContextMenu"
        ref={this.stageRef}
        style={{
          position: "relative",
          padding: "0px",
          margin: "0px",
          border: "0px",
          background: "rgb(246, 246, 246)",
          cursor: board.pointer.getCursor(),
          top: "0px",
          left: "0px",
          display: "block",
          width: `${width}px`,
          height: `${height}px`,
        }}
        onContextMenu={(ev) => ev.preventDefault()}
      >
        <Watermark />
        <canvas
          ref={this.canvasRef}
          width={Math.floor(width * window.devicePixelRatio)}
          height={Math.floor(height * window.devicePixelRatio)}
          className="NoContextMenu"
          style={{
            pointerEvents: "none",
            position: "absolute",
            zIndex: 1,
            padding: "0px",
            margin: "0px",
            border: "0px",
            background: "none",
            top: "0px",
            left: "0px",
            display: "block",
            width: `${width}px`,
            height: `${height}px`,
          }}
        />

        <canvas
          width={Math.floor(width * window.devicePixelRatio)}
          height={Math.floor(height * window.devicePixelRatio)}
          className="NoContextMenu"
          id="ExportLayer"
          style={{
            zIndex: 1,
            padding: "0px",
            margin: "0px",
            border: "0px",
            background: "transparent",
            top: "0px",
            left: "0px",
            position: "absolute",
            width: `${width}px`,
            height: `${height}px`,
            pointerEvents: "none",
          }}
        />

        <canvas
          ref={this.cursorsCanvasRef}
          width={Math.floor(width * window.devicePixelRatio)}
          height={Math.floor(height * window.devicePixelRatio)}
          className="NoContextMenu"
          style={{
            zIndex: 1,
            padding: "0px",
            margin: "0px",
            border: "0px",
            background: "transparent",
            top: "0px",
            left: "0px",
            position: "absolute",
            display: "block",
            width: `${width}px`,
            height: `${height}px`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 0,
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

export const Canvas = withRouter(CanvasBase);

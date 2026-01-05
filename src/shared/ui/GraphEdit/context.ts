import { Vector2 } from "@/shared/libs/vectors";
import { createContext, MouseEvent, useContext, useEffect } from "react";

export type GraphEditHandler = {
  move: (e: MouseEvent) => void;
  wheel: (e: WheelEvent) => void;
  mouseDown: (e: MouseEvent) => void;
  mouseLeave: (e: MouseEvent) => void;
  click: (e: MouseEvent) => void;
};

export type CanvasRenderFn = (
  ctx: CanvasRenderingContext2D,
  {
    offset,
    axisRangeSizes,
    size,
  }: {
    offset: Vector2;
    axisRangeSizes: Vector2;
    size: Vector2;
    options: GraphEditOptions;
  },
) => void;

export enum GraphEditMappingMode {
  Fit = 0,
  Fill = 1,
}

export type GraphEditOptions = {
  mappingMode: GraphEditMappingMode;
};

export type GraphEditContextType = {
  options: GraphEditOptions;
  size: Vector2;
  axisRangeSizes: Vector2;
  offset: Vector2;
  getBoundPos: () => Vector2;
  registerMoveHandler: (
    handler: GraphEditHandler["move"],
    priority?: number,
  ) => () => void;
  registerWheelHandler: (
    handler: GraphEditHandler["wheel"],
    priority?: number,
  ) => () => void;
  registerMouseDownHandler: (
    handler: GraphEditHandler["mouseDown"],
    priority?: number,
  ) => () => void;
  registerMouseLeaveHandler: (
    handler: GraphEditHandler["mouseLeave"],
    priority?: number,
  ) => () => void;
  registerClickHandler: (
    handler: GraphEditHandler["click"],
    priority?: number,
  ) => () => void;
  registerCanvasRender: (
    handler: CanvasRenderFn,
    priority?: number,
  ) => () => void;
};

const GraphEditContext = createContext<GraphEditContextType | null>(null);

export const GraphEditProvider = GraphEditContext.Provider;

export const useGraphEditContext = (): GraphEditContextType => {
  const context = useContext(GraphEditContext);

  if (!context) {
    throw new Error(
      "useGraphEditContext must be used within a GraphEditProvider",
    );
  }

  return context;
};

export const useGraphEditRegisterHandler = (
  handlerObj: Partial<GraphEditHandler>,
  priority?: number,
) => {
  const {
    registerClickHandler,
    registerMouseDownHandler,
    registerMouseLeaveHandler,
    registerMoveHandler,
    registerWheelHandler,
  } = useGraphEditContext();

  useEffect(() => {
    const cancels: (() => void)[] = [];

    if (handlerObj.move) {
      cancels.push(registerMoveHandler(handlerObj.move, priority));
    }
    if (handlerObj.wheel) {
      cancels.push(registerWheelHandler(handlerObj.wheel, priority));
    }
    if (handlerObj.mouseDown) {
      cancels.push(registerMouseDownHandler(handlerObj.mouseDown, priority));
    }
    if (handlerObj.mouseLeave) {
      cancels.push(registerMouseLeaveHandler(handlerObj.mouseLeave, priority));
    }
    if (handlerObj.click) {
      cancels.push(registerClickHandler(handlerObj.click, priority));
    }

    return () => {
      cancels.forEach((cancel) => cancel());
    };
  }, [
    registerMoveHandler,
    registerWheelHandler,
    registerMouseDownHandler,
    registerMouseLeaveHandler,
    registerClickHandler,
    handlerObj.mouseDown,
    handlerObj.mouseLeave,
    handlerObj.move,
    handlerObj.wheel,
    handlerObj.click,
    priority,
  ]);
};

export const useRegisterCanvasRender = (
  handler: CanvasRenderFn,
  priority?: number,
) => {
  const { registerCanvasRender } = useGraphEditContext();

  useEffect(() => {
    return registerCanvasRender(handler, priority);
  }, [handler, priority, registerCanvasRender]);
};

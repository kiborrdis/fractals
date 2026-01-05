import { Vector2 } from "@/shared/libs/vectors";
import { useElementSize, useThrottledCallback } from "@mantine/hooks";
import {
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GraphEditOptions,
  CanvasRenderFn,
  GraphEditProvider,
  type GraphEditHandler,
  GraphEditMappingMode,
} from "./context";

export const GraphEdit = ({
  offset,
  axisRangeSizes,
  mappingMode = "fit",
  onClick,
  children,
}: {
  mappingMode?: "fit" | "fill";
  offset: Vector2;
  axisRangeSizes: Vector2;
  onClick?: (e: MouseEvent) => void;
  children?: ReactNode;
}) => {
  const {
    handlersRef,
    registerMoveHandler,
    registerWheelHandler,
    registerMouseDownHandler,
    registerMouseLeaveHandler,
    registerClickHandler,
  } = useGraphEditHandlers();

  const options: GraphEditOptions = useMemo(
    () => ({
      mappingMode:
        mappingMode === "fit"
          ? GraphEditMappingMode.Fit
          : GraphEditMappingMode.Fill,
    }),
    [mappingMode],
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderFns, setRenderFns] = useState<
    (readonly [CanvasRenderFn, number])[]
  >([]);

  const { ref: elRef, width, height } = useElementSize();

  const size = useMemo<Vector2>(() => {
    return [width || 0, height || 0];
  }, [width, height]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = size[0];
      canvasRef.current.height = size[1];
    }
  }, [size]);

  const render = useThrottledCallback(
    (
      ctx: CanvasRenderingContext2D,
      axisRangeSizes: Vector2,
      offset: Vector2,
      size: Vector2,
      options: GraphEditOptions,
    ) => {
      ctx.clearRect(0, 0, size[0], size[1]);

      renderFns.forEach(([fn]) => {
        if (ctx) {
          fn(ctx, {
            offset,
            axisRangeSizes,
            size,
            options,
          });
        }
      });
    },
    15,
  );

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (!ctx) {
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high"; // Can be 'low''medium''high'
    render(ctx, axisRangeSizes, offset, size, options);
  }, [axisRangeSizes, offset, size, renderFns, render, options]);
  let priorityCounter = 0;
  return (
    <GraphEditProvider
      value={useMemo(
        () => ({
          options,
          size,
          axisRangeSizes,
          offset,
          getBoundPos: () => {
            const el = elRef.current;
            if (!el) {
              return [0, 0];
            }
            const bound = el.getBoundingClientRect();
            return [bound.left, bound.top];
          },
          registerMoveHandler,
          registerWheelHandler,
          registerMouseDownHandler,
          registerMouseLeaveHandler,
          registerClickHandler,
          registerCanvasRender: (fn: CanvasRenderFn, priority = 0) => {
            setRenderFns((fns) => {
              const newFns = [...fns, [fn, priority] as const];
              newFns.sort((a, b) => a[1] - b[1]);
              return newFns;
            });

            return () => {
              setRenderFns((fns) => fns.filter((f) => f[0] !== fn));
            };
          },
        }),
        [
          options,
          size,
          axisRangeSizes,
          offset,
          registerMoveHandler,
          registerWheelHandler,
          registerMouseDownHandler,
          registerMouseLeaveHandler,
          registerClickHandler,
          elRef,
        ],
      )}
    >
      <div
        ref={(el) => {
          elRef.current = el;

          if (el) {
            const handler = (e: WheelEvent) => {
              handlersRef.current.wheelHandlers.forEach((h) => h[0](e));
            };
            el.addEventListener("wheel", handler, { passive: false });

            return () => {
              el.removeEventListener("wheel", handler);
            };
          }
        }}
        onClick={useCallback(
          (e: React.MouseEvent<HTMLDivElement>) => {
            handlersRef.current.clickHandlers.forEach((h) => h[0](e));
            if (onClick) {
              onClick(e);
            }
          },
          [handlersRef, onClick],
        )}
        onMouseMove={useCallback(
          (e: React.MouseEvent<HTMLDivElement>) => {
            handlersRef.current.moveHandlers.forEach((h) => h[0](e));
          },
          [handlersRef],
        )}
        onMouseDown={useCallback(
          (e: React.MouseEvent<HTMLDivElement>) => {
            handlersRef.current.mouseDownHandlers.forEach((h) => h[0](e));
          },
          [handlersRef],
        )}
        onMouseLeave={useCallback(
          (e: React.MouseEvent<HTMLDivElement>) => {
            handlersRef.current.mouseLeaveHandlers.forEach((h) => h[0](e));
          },
          [handlersRef],
        )}
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            top: 0,
            left: 0,
            position: "relative",
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: width,
              height: height,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>

        {Array.isArray(children)
          ? children.map((child) => {
              if (Array.isArray(child)) {
                return child.map((c) => {
                  if (c && typeof c === "object") {
                    if ("props" in c) {
                      return {
                        ...c,
                        props: {
                          ...c.props,
                          priority: c.props.priority ?? priorityCounter++,
                        },
                      };
                    }
                    return c;
                  }
                  return c;
                });
              }

              if (child && typeof child === "object") {
                if ("props" in child) {
                  return {
                    ...child,
                    props: {
                      ...child.props,
                      priority: child.props.priority ?? priorityCounter++,
                    },
                  };
                }
                return child;
              }

              return child;
            })
          : children}
      </div>
    </GraphEditProvider>
  );
};

function useGraphEditHandlers() {
  const handlersRef = useRef({
    moveHandlers: [] as (readonly [GraphEditHandler["move"], number])[],
    wheelHandlers: [] as (readonly [GraphEditHandler["wheel"], number])[],
    mouseDownHandlers: [] as (readonly [
      GraphEditHandler["mouseDown"],
      number,
    ])[],
    mouseLeaveHandlers: [] as (readonly [
      GraphEditHandler["mouseLeave"],
      number,
    ])[],
    clickHandlers: [] as (readonly [GraphEditHandler["click"], number])[],
  });

  const registerMoveHandler = useCallback(
    (handler: (e: MouseEvent) => void, priority = 0) => {
      handlersRef.current.moveHandlers.push([handler, priority]);
      handlersRef.current.moveHandlers.sort((a, b) => a[1] - b[1]);

      return () => {
        handlersRef.current.moveHandlers =
          handlersRef.current.moveHandlers.filter((h) => h[0] !== handler);
      };
    },
    [],
  );

  const registerWheelHandler = useCallback(
    (handler: (e: WheelEvent) => void, priority = 0) => {
      handlersRef.current.wheelHandlers.push([handler, priority]);
      handlersRef.current.wheelHandlers.sort((a, b) => a[1] - b[1]);

      return () => {
        handlersRef.current.wheelHandlers =
          handlersRef.current.wheelHandlers.filter((h) => h[0] !== handler);
      };
    },
    [],
  );

  const registerMouseDownHandler = useCallback(
    (handler: (e: MouseEvent) => void, priority = 0) => {
      handlersRef.current.mouseDownHandlers.push([handler, priority]);
      handlersRef.current.mouseDownHandlers.sort((a, b) => a[1] - b[1]);

      return () => {
        handlersRef.current.mouseDownHandlers =
          handlersRef.current.mouseDownHandlers.filter((h) => h[0] !== handler);
      };
    },
    [],
  );

  const registerMouseLeaveHandler = useCallback(
    (handler: (e: MouseEvent) => void, priority = 0) => {
      handlersRef.current.mouseLeaveHandlers.push([handler, priority]);
      handlersRef.current.mouseLeaveHandlers.sort((a, b) => a[1] - b[1]);

      return () => {
        handlersRef.current.mouseLeaveHandlers =
          handlersRef.current.mouseLeaveHandlers.filter(
            (h) => h[0] !== handler,
          );
      };
    },
    [],
  );

  const registerClickHandler = useCallback(
    (handler: (e: MouseEvent) => void, priority = 0) => {
      handlersRef.current.clickHandlers.push([handler, priority]);
      handlersRef.current.clickHandlers.sort((a, b) => a[1] - b[1]);

      return () => {
        handlersRef.current.clickHandlers =
          handlersRef.current.clickHandlers.filter((h) => h[0] !== handler);
      };
    },
    [],
  );

  return {
    handlersRef,
    registerMoveHandler,
    registerWheelHandler,
    registerMouseDownHandler,
    registerMouseLeaveHandler,
    registerClickHandler,
  } as const;
}

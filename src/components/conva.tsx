/* eslint-disable jsx-a11y/alt-text */
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Shape,
  Line,
  Group,
  Image,
} from "react-konva";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import useImage from "use-image";
import img1 from "@/assets/sad-turbine.webp";
import { Stage as StageNode } from "konva/lib/Stage";

/**
 * To read:
 * similar usecase: https://blog.intzone.com/using-konva-js-to-annotate-image-with-bounding-boxes/
 * konva perf tips: https://medium.com/htc-research-engineering-blog/konva-use-konva-to-create-annotation-tool-34409bfa822b
 */

const NAVBAR_HEIGHT = 50;

export default function Conva() {
  const [image] = useImage(img1.src);
  const [shapes, setShapes] = useState<
    Array<{
      closed: boolean;
      dots: Array<{
        id: string;
        x: number;
        y: number;
      }>;
    }>
  >([]);

  const width = window.innerWidth;
  const height = window.innerHeight - NAVBAR_HEIGHT;

  const [clickEnabled, setClickEnabled] = useState(true);
  const [panEnabled, setPanEnabled] = useState(true);

  const stageRef = useRef<StageNode | null>(null);

  useEffect(() => {
    console.log(shapes);
  }, [shapes]);

  return (
    <div>
      <TransformWrapper
        panning={{
          disabled: !panEnabled,
        }}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <>
            <div className={`h-[${NAVBAR_HEIGHT}px] flex items-center gap-4`}>
              <button
                className="bg-red-400 p-3"
                onClick={() => {
                  if (!stageRef) return;
                  console.log(stageRef.current?.toJSON());
                }}
              >
                Dump scene to JSON (log in console)
              </button>
              <button
                className="bg-green-400 p-3"
                onClick={() => {
                  if (!stageRef) return;
                  const data =
                    stageRef.current?.toDataURL({
                      mimeType: "image/jpeg",
                      pixelRatio: 3,
                      quality: 1.0,
                    }) ?? "";
                  var link = document.createElement("a");
                  link.download = "stage";
                  link.href = data;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Export image
              </button>
              <button
                className="bg-blue-400 p-3"
                onClick={() => resetTransform()}
              >
                Reset pan and zoom
              </button>
              <button className="bg-blue-400 p-3" onClick={() => zoomIn()}>
                +
              </button>
              <button className="bg-blue-400 p-3" onClick={() => zoomOut()}>
                -
              </button>
            </div>
            <TransformComponent>
              <Stage
                ref={stageRef}
                width={width}
                height={height}
                onMouseDown={(evt) => {
                  console.log("STAGE EVENT: ", evt);
                  setPanEnabled(true);
                  setClickEnabled(false);
                }}
                onClick={(evt) => {
                  console.log("STAGE CLICK EVENT: ", evt);
                  setPanEnabled(false);
                  setClickEnabled(true);
                  // evt.evt.stopPropagation();
                }}
                // onWheel={(evt) => {
                //   evt.evt.preventDefault();

                //   var scaleBy = 1.02;

                //   const stage = evt.currentTarget.getStage();
                //   if (!stage) return;

                //   var oldScale = stage.scaleX();
                //   var pointer = stage.getPointerPosition();

                //   if (!pointer) return;

                //   var mousePointTo = {
                //     x: (pointer.x - stage.x()) / oldScale,
                //     y: (pointer.y - stage.y()) / oldScale,
                //   };

                //   // how to scale? Zoom in? Or zoom out?
                //   let direction = evt.evt.deltaY > 0 ? 1 : -1;

                //   // when we zoom on trackpad, e.evt.ctrlKey is true
                //   // in that case lets revert direction
                //   if (evt.evt.ctrlKey) {
                //     direction = -direction;
                //   }

                //   var newScale =
                //     direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

                //   stage.scale({ x: newScale, y: newScale });

                //   var newPos = {
                //     x: pointer.x - mousePointTo.x * newScale,
                //     y: pointer.y - mousePointTo.y * newScale,
                //   };
                //   stage.position(newPos);
                // }}
              >
                <Layer>
                  <Image
                    image={image}
                    width={width}
                    height={height}
                    onClick={(evt) => {
                      evt.evt.stopPropagation();
                      console.log("HEYOOOO: ", clickEnabled);
                      // if (panEnabled) return;
                      const pointerPosition = evt.target
                        .getStage()
                        ?.getPointerPosition();
                      if (pointerPosition) {
                        console.log("stage on click: ", evt.target.getType());
                        const id = uuidv4();
                        if (
                          !shapes[shapes.length - 1] ||
                          shapes[shapes.length - 1].closed
                        ) {
                          setShapes((prev) => {
                            return [
                              ...prev,
                              {
                                closed: false,
                                dots: [{ id, ...pointerPosition }],
                              },
                            ];
                          });
                        } else {
                          console.log(
                            "stage event - adding a dot",
                            pointerPosition
                          );
                          setShapes((prev) => {
                            if (
                              !prev[prev.length - 1].dots.some(
                                (dot) => dot.id === id
                              )
                            ) {
                              prev[prev.length - 1].dots = [
                                ...prev[prev.length - 1].dots,
                                { id, ...pointerPosition },
                              ];
                            }
                            return [...prev];
                          });
                        }
                      }
                    }}
                  />
                </Layer>
                <Layer>
                  {shapes.map((shape, shapeIndex) => (
                    <Group key={shapeIndex}>
                      <Line
                        points={shape.dots.reduce<number[]>((acc, val, idx) => {
                          acc.push(val.x, val.y);
                          return acc;
                        }, [])}
                        stroke="white"
                        strokeWidth={2}
                        fill="#00D2FF"
                        opacity={0.5}
                        closed={shape.closed}
                      />
                      {shape.dots.map((dot, dotIndex) => (
                        <Circle
                          key={`${shapeIndex}_${dotIndex}`}
                          x={dot.x}
                          y={dot.y}
                          radius={10}
                          fill="red"
                          onClick={(evt) => {
                            console.log("click on circle event");
                            evt.evt.stopPropagation();
                            evt.evt.stopImmediatePropagation();
                            // if (!clickEnabled) return;
                            if (dotIndex === 0) {
                              console.log(
                                "click on circle - close line event",
                                evt
                              );
                              setShapes((prev) => {
                                prev[shapeIndex].closed = true;
                                return [...prev];
                              });
                            }
                          }}
                          onMouseOver={() => {
                            document.body.style.cursor = "pointer";
                          }}
                          onMouseOut={() => {
                            document.body.style.cursor = "default";
                          }}
                          draggable={true}
                          onDragMove={(evt) => {
                            evt.evt.stopPropagation();
                            setShapes((prev) => {
                              prev[shapeIndex].dots[dotIndex].x =
                                evt.target.x();
                              prev[shapeIndex].dots[dotIndex].y =
                                evt.target.y();
                              return [...prev];
                            });
                          }}
                        />
                      ))}
                    </Group>
                  ))}
                </Layer>
              </Stage>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

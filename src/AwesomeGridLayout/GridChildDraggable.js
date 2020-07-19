import React from "react";
import Draggable from "react-draggable";
import {shallowEqual} from "./AwesomeGridLayoutUtils";
import GridChildResizable from "./GridChildResizable";
import './GridChildDraggable.css';
import Popper from "@material-ui/core/Popper/Popper";

export default class GridChildDraggable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.childContainer.child.props.griddata &&
            nextProps.childContainer.child.props.griddata.dragged) {
            delete nextProps.childContainer.child.props.griddata.dragged;
            return true;
        }
        if (nextProps.childContainer.griddata.dragged) {
            delete nextProps.childContainer.child.props.griddata.dragged;
            return true;
        }
        return !shallowEqual(nextProps.childContainer, this.props.childContainer);
    }

    render () {
        let {childContainer,childRef , snap, childDragStart, childDrag, childDragStop,
            childResizeStart, childResize, childResizeStop, overflow} = this.props;

        let getBoundingClientRect = () => {
            if (!childRef.current)
                return {
                    width:0,height:0
                };

            let val = childRef.current.rootDivRef.current.getBoundingClientRect();
            val.w = val.width;
            val.h = val.height;
            val.width = 0;
            val.height = 0;
            return val;
        };
        return (
                <Draggable
                    position={{x:childContainer.x, y: childContainer.y}}
                    positionOffset={{x:"-50%", y:"-50%"}}
                    disabled={!childContainer.griddata.draggable}
                    grid={[snap.x, snap.y]}
                    scale={1}
                    key={childContainer.griddata.id}
                    onStart={(e, data) => childDragStart(e, data, childContainer)}
                    onDrag={(e, data) => childDrag(e, data, childContainer)}
                    onStop={(e, data) => childDragStop(e, data, childContainer)}
                >
                        <div
                            className={childContainer.fix ?
                                "GridChildDraggableFixed": "GridChildDraggableAbsolute"}
                            style={{
                                zIndex: childContainer.zIndex,
                                pointerEvents: childContainer.dragging? "none": "unset"
                            }}
                        >
                            {
                                childContainer.dragging && childContainer.griddata.id !== "dummy" &&
                                // childContainer.griddata.id === 4 &&
                                <Popper
                                    placement="bottom-start"
                                    open={true} anchorEl={{
                                    clientWidth: getBoundingClientRect().width,
                                    clientHeight: getBoundingClientRect().height,
                                    getBoundingClientRect,
                                }}
                                    modifiers={{
                                        flip: {
                                            enabled: false,
                                        },
                                        preventOverflow: {
                                            enabled: false,
                                            boundariesElement: 'window',
                                        },
                                        hide: {
                                            enabled: false,
                                        }
                                    }}
                                    container={document.body}
                                >
                                    <div style={{
                                        width: getBoundingClientRect().w,
                                        height: getBoundingClientRect().h,
                                        backgroundColor: "rgba(255, 0, 0, 0.15)",
                                        position: "absolute"
                                    }}>
                                    </div>
                                </Popper>
                            }
                            <div
                                style={{
                                    transform: "rotate(" + childContainer.rotate + "deg)"
                                }}
                            >
                                <GridChildResizable
                                    key={childContainer.griddata.id}
                                    childContainer={childContainer}
                                    childResizeStart={childResizeStart}
                                    childResize={childResize}
                                    childResizeStop={childResizeStop}
                                    overflow={overflow}
                                />
                            </div>
                        </div>
                </Draggable>
        )
    }
}

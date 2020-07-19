import React from "react";
import './Adjustment.css'
import {cloneObject, shallowEqual} from "../AwesomeGridLayoutUtils";
import Popper from "@material-ui/core/Popper/Popper";

export default class AdjustmentHelpLines extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.helpLinesParent) {
            let newParentRect = nextProps.helpLinesParent.getSize(false);

            if (!shallowEqual(this.parentRect, cloneObject(newParentRect))) {
                this.parentRect = newParentRect;
                return true;
            }
        }

        if (this.props.width !== nextProps.width ||
            this.props.height !== nextProps.height ||
            this.props.show !== nextProps.show ||
            this.props.dragging !== nextProps.dragging)
            return true;

        if (!shallowEqual(this.props.itemRect, nextProps.itemRect)) {
            return true;
        }

        return false;
    }

    getValue = (value) => {
        if (value.includes("px")) {
            return `${parseFloat(value.replace("px", "")).toFixed(1)}px`;
        }
        if (value.includes("%")) {
            return `${parseFloat(value.replace("%", "")).toFixed(1)}%`;
        }

        return value;
    };

    calculate = () => {
        let {helpLinesParent, item, itemRect, width, height, dragging} = this.props;
        this.parentRect = this.parentRect || helpLinesParent.getSize(false);

        return {
            ...item.calculateGridItem(itemRect.left - this.parentRect.left,
                itemRect.top - this.parentRect.top, helpLinesParent,
                width || itemRect.width, height || itemRect.height, this.parentRect, true, !dragging),
            itemRect, parentRect: this.parentRect
        };
    };

    render () {
        let {show, transform, helpLinesParent} = this.props;
        if (!show)
            return null;
        let {gridItemStyle, coordinates, itemRect, parentRect} = this.calculate();
        this.props.item.coordinateToAbsolute(coordinates, parentRect);
        return (
            <Popper open
                    anchorEl={
                        () => {
                            return document.getElementById(helpLinesParent.props.id);
                        }
                    }
                    placement="top-start"
                    style={{
                        zIndex: 9999999,
                        pointerEvents: "none"
                    }}
                    modifiers={{
                        flip: {
                            enabled: false,
                        },
                        preventOverflow: {
                            enabled: false,
                            boundariesElement: 'scrollParent',
                        },
                        arrow: {
                            enabled: false,
                        },
                        hide: {
                            enabled: false,
                        },
                    }}
            >
                <div
                    id="AdjustmentHelpLines"
                    className="AdjustmentHelpLinesRoot"
                    style={{
                        width: coordinates.cx2 - coordinates.cx1,
                        height: coordinates.cy2 - coordinates.cy1,
                        transform: transform
                    }}
                >
                    <svg className="AdjustmentHelpLinesSVG">
                        {
                            (gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-start") &&
                            <line
                                x1={0}
                                x2={itemRect.left - coordinates.cx1}
                                y1={itemRect.top - coordinates.cy1 + itemRect.height / 2}
                                y2={itemRect.top - coordinates.cy1 + itemRect.height / 2}
                                style={{
                                    stroke: "#116dff",
                                    strokeDasharray: "3px 3px"
                                }}
                            />
                        }
                        {
                            (gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-start") &&
                            !this.props.dragging &&
                            <circle
                                cx={0}
                                cy={itemRect.top - coordinates.cy1 + itemRect.height / 2}
                                r={5}
                                style={{
                                    stroke: "#fff",
                                    fill: "#116dff"
                                }}
                            />
                        }
                        {
                            (gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-end") &&
                            <line
                                x1={itemRect.left - coordinates.cx1 + itemRect.width}
                                x2={coordinates.cx2 - coordinates.cx1}
                                y1={itemRect.top - coordinates.cy1 + itemRect.height / 2}
                                y2={itemRect.top - coordinates.cy1 + itemRect.height / 2}
                                style={{
                                    stroke: "#116dff",
                                    strokeDasharray: "3px 3px"
                                }}
                            />
                        }
                        {
                            (gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-end") &&
                            !this.props.dragging &&
                            <circle
                                cx={coordinates.cx2 - coordinates.cx1}
                                cy={itemRect.top - coordinates.cy1 + itemRect.height / 2}
                                r={5}
                                style={{
                                    stroke: "#fff",
                                    fill: "#116dff"
                                }}
                            />
                        }
                        {
                            (gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch") &&
                            <line
                                x1={itemRect.left - coordinates.cx1 + itemRect.width / 2}
                                x2={itemRect.left - coordinates.cx1 + itemRect.width / 2}
                                y1={0}
                                y2={itemRect.top - coordinates.cy1}
                                style={{
                                    stroke: "#116dff",
                                    strokeDasharray: "3px 3px"
                                }}
                            />
                        }
                        {
                            (gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch") &&
                            !this.props.dragging &&
                            <circle
                                cx={itemRect.left - coordinates.cx1 + itemRect.width / 2}
                                cy={0}
                                r={5}
                                style={{
                                    stroke: "#fff",
                                    fill: "#116dff"
                                }}
                            />
                        }
                        {
                            (gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch") &&
                            <line
                                x1={itemRect.left - coordinates.cx1 + itemRect.width / 2}
                                x2={itemRect.left - coordinates.cx1 + itemRect.width / 2}
                                y1={itemRect.top - coordinates.cy1 + itemRect.height}
                                y2={coordinates.cy2 - coordinates.cy1}
                                style={{
                                    stroke: "#116dff",
                                    strokeDasharray: "3px 3px"
                                }}
                            />
                        }
                        {
                            (gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch") &&
                            !this.props.dragging &&
                            <circle
                                cx={itemRect.left - coordinates.cx1 + itemRect.width / 2}
                                cy={coordinates.cy2 - coordinates.cy1}
                                r={5}
                                style={{
                                    stroke: "#fff",
                                    fill: "#116dff"
                                }}
                            />
                        }
                    </svg>

                    {
                        (gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch" ||
                            gridItemStyle.alignSelf === "flex-start") &&
                        this.props.dragging &&
                        <p
                            style={{
                                position: "absolute",
                                top: itemRect.top - coordinates.cy1 + itemRect.height / 2,
                            left: (itemRect.left - coordinates.cx1) / 2,
                            transform: "translateY(-125%) translateX(-50%)",
                            margin: 0,
                            fontSize: "0.65em",
                            color: "#0013ff",
                            fontWeight: "bold"
                        }}
                    >
                            {this.getValue(gridItemStyle.marginLeft)}
                    </p>
                }

                {
                    (gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch" ||
                        gridItemStyle.alignSelf === "flex-end") &&
                    this.props.dragging &&
                    <p
                        style={{
                            position: "absolute",
                            top: itemRect.top - coordinates.cy1 + itemRect.height / 2,
                            right: (coordinates.cx2 - itemRect.left - itemRect.width) / 2,
                            transform: "translateY(-125%) translateX(50%)",
                            margin: 0,
                            fontSize: "0.65em",
                            color: "#0013ff",
                            fontWeight: "bold"
                        }}
                    >
                        {this.getValue(gridItemStyle.marginRight)}
                    </p>
                }

                {
                    (gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch") &&
                    this.props.dragging &&
                    <p
                        style={{
                            position: "absolute",
                            top: (itemRect.top - coordinates.cy1) / 2,
                            left: itemRect.left - coordinates.cx1 + itemRect.width / 2,
                            transform: "translateY(-50%) translateX(5px)",
                            margin: 0,
                            fontSize: "0.65em",
                            color: "#0013ff",
                            fontWeight: "bold"
                        }}
                    >
                        {this.getValue(gridItemStyle.marginTop)}
                    </p>
                }

                {
                    (gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch") &&
                    this.props.dragging &&
                    <p
                        style={{
                            position: "absolute",
                            bottom: (coordinates.cy2 - itemRect.top - itemRect.height) / 2,
                            left: itemRect.left - coordinates.cx1 + itemRect.width / 2,
                            transform: "translateY(50%) translateX(5px)",
                            margin: 0,
                            fontSize: "0.65em",
                            color: "#0013ff",
                            fontWeight: "bold"
                        }}
                    >
                        {this.getValue(gridItemStyle.marginBottom)}
                    </p>
                }
            </div>
            </Popper>
        )
    }
}

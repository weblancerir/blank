import React from "react";
import './Adjustment.css'
import {cloneObject, shallowEqual} from "../AwesomeGridLayoutUtils";
import Popper from "@material-ui/core/Popper/Popper";

export default class AdjustmentHelpLines extends React.Component {
    constructor(props) {
        super(props);
    }
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
        if (!shallowEqual(this.props.fakeItemRect, nextProps.fakeItemRect)) {
            return true;
        }
        if (!shallowEqual(nextProps.item.getCompositeFromData("gridItemStyle"), this.gridItemStyle)) {
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
        let {helpLinesParent, item, itemRect, width, height, dragging, fakeItemRect} = this.props;
        // this.parentRect = this.parentRect || helpLinesParent.getSize(false);
        this.parentRect = helpLinesParent.prepareRects();

        if (fakeItemRect)
            itemRect = fakeItemRect;
        return {
            ...item.calculateGridItem(itemRect.left - this.parentRect.left,
                itemRect.top - this.parentRect.top, helpLinesParent,
                width || itemRect.width, height || itemRect.height, this.parentRect, true, !dragging),
            itemRect, parentRect: this.parentRect
        };
    };

    getRuntimeGridItemStyle = () => {
        return this.gridItemStyle;
    };

    render () {
        let {show, item, transform, fakeItemRect} = this.props;
        if (!show)
            return null;

        if (!item.mounted)
            return null;

        let {gridItemStyle, coordinates, itemRect, parentRect, coordinatesAbs} = this.calculate();
        this.gridItemStyle = cloneObject(gridItemStyle);
        if (fakeItemRect)
            itemRect = fakeItemRect;
        return (
            <div
                id="AdjustmentHelpLines"
                className="AdjustmentHelpLinesRoot"
                style={{
                    width: coordinatesAbs.cx2 - coordinatesAbs.cx1,
                    height: coordinatesAbs.cy2 - coordinatesAbs.cy1,
                    top: coordinatesAbs.cy1,
                    left: coordinatesAbs.cx1,
                }}
            >
                <div className="AdjustmentHelpLinesRect" style={{
                    top: itemRect.top - coordinatesAbs.cy1,
                    left: itemRect.left - coordinatesAbs.cx1,
                    width: itemRect.width,
                    height: itemRect.height
                }}/>
                <svg className="AdjustmentHelpLinesSVG">
                    {
                        /*(gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch" ||
                            gridItemStyle.alignSelf === "flex-start") &&*/
                        <line
                            visibility={(gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-start")? "visible": "hidden"}
                            x1={0}
                            x2={itemRect.left - coordinatesAbs.cx1}
                            y1={itemRect.top - coordinatesAbs.cy1 + itemRect.height / 2}
                            y2={itemRect.top - coordinatesAbs.cy1 + itemRect.height / 2}
                            style={{
                                stroke: "#116dff",
                                strokeDasharray: "3px 3px"
                            }}
                        />
                    }
                    {
                        /*(gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch" ||
                            gridItemStyle.alignSelf === "flex-start") &&
                        !this.props.dragging &&*/
                        <circle
                            visibility={((gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-start") &&
                                !this.props.dragging)? "visible" : "hidden"}
                            cx={0}
                            cy={itemRect.top - coordinatesAbs.cy1 + itemRect.height / 2}
                            r={5}
                            style={{
                                stroke: "#fff",
                                fill: "#116dff"
                            }}
                        />
                    }
                    {
                        // (gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch" ||
                        //     gridItemStyle.alignSelf === "flex-end") &&
                        <line
                            visibility={(gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-end") ? "visible" : "hidden"}
                            x1={itemRect.left - coordinatesAbs.cx1 + itemRect.width}
                            x2={coordinatesAbs.cx2 - coordinatesAbs.cx1}
                            y1={itemRect.top - coordinatesAbs.cy1 + itemRect.height / 2}
                            y2={itemRect.top - coordinatesAbs.cy1 + itemRect.height / 2}
                            style={{
                                stroke: "#116dff",
                                strokeDasharray: "3px 3px"
                            }}
                        />
                    }
                    {
                        // (gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch" ||
                        //     gridItemStyle.alignSelf === "flex-end") &&
                        // !this.props.dragging &&
                        <circle
                            visibility={((gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-end") &&
                                !this.props.dragging) ? "visible" : "hidden"}
                            cx={coordinatesAbs.cx2 - coordinatesAbs.cx1}
                            cy={itemRect.top - coordinatesAbs.cy1 + itemRect.height / 2}
                            r={5}
                            style={{
                                stroke: "#fff",
                                fill: "#116dff"
                            }}
                        />
                    }
                    {
                        // (gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch") &&
                        <line
                            visibility={(gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch")
                            ? "visible" : "hidden"}
                            x1={itemRect.left - coordinatesAbs.cx1 + itemRect.width / 2}
                            x2={itemRect.left - coordinatesAbs.cx1 + itemRect.width / 2}
                            y1={0}
                            y2={itemRect.top - coordinatesAbs.cy1}
                            style={{
                                stroke: "#116dff",
                                strokeDasharray: "3px 3px"
                            }}
                        />
                    }
                    {
                        // (gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch") &&
                        // !this.props.dragging &&
                        <circle
                            visibility={((gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch") &&
                                !this.props.dragging) ? "visible" : "hidden"}
                            cx={itemRect.left - coordinatesAbs.cx1 + itemRect.width / 2}
                            cy={0}
                            r={5}
                            style={{
                                stroke: "#fff",
                                fill: "#116dff"
                            }}
                        />
                    }
                    {
                        // (gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch") &&
                        <line
                            visibility={(gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch")
                            ? "visible" : "hidden"}
                            x1={itemRect.left - coordinatesAbs.cx1 + itemRect.width / 2}
                            x2={itemRect.left - coordinatesAbs.cx1 + itemRect.width / 2}
                            y1={itemRect.top - coordinatesAbs.cy1 + itemRect.height}
                            y2={coordinatesAbs.cy2 - coordinatesAbs.cy1}
                            style={{
                                stroke: "#116dff",
                                strokeDasharray: "3px 3px"
                            }}
                        />
                    }
                    {
                        // (gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch") &&
                        // !this.props.dragging &&
                        <circle
                            visibility={((gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch") &&
                                !this.props.dragging) ? "visible" : "hidden"}
                            cx={itemRect.left - coordinatesAbs.cx1 + itemRect.width / 2}
                            cy={coordinatesAbs.cy2 - coordinatesAbs.cy1}
                            r={5}
                            style={{
                                stroke: "#fff",
                                fill: "#116dff"
                            }}
                        />
                    }
                </svg>

                {
                    // (gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch" ||
                    //     gridItemStyle.alignSelf === "flex-start") &&
                    // this.props.dragging &&
                    <p
                        style={{
                            display: ((gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-start") &&
                                this.props.dragging) ? "unset" : "none",
                            position: "absolute",
                            top: itemRect.top - coordinatesAbs.cy1 + itemRect.height / 2,
                        left: (itemRect.left - coordinatesAbs.cx1) / 2,
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
                    // (gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch" ||
                    //     gridItemStyle.alignSelf === "flex-end") &&
                    // this.props.dragging &&
                    <p
                        style={{
                            display: ((gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch" ||
                                gridItemStyle.alignSelf === "flex-end") &&
                                this.props.dragging) ? "unset" : "none",
                            position: "absolute",
                            top: itemRect.top - coordinatesAbs.cy1 + itemRect.height / 2,
                            right: (coordinatesAbs.cx2 - itemRect.left - itemRect.width) / 2,
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
                    // (gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch") &&
                    // this.props.dragging &&
                    <p
                        style={{
                            display: ((gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch") &&
                                this.props.dragging) ? "unset" : "none",
                            position: "absolute",
                            top: (itemRect.top - coordinatesAbs.cy1) / 2,
                            left: itemRect.left - coordinatesAbs.cx1 + itemRect.width / 2,
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
                    // (gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch") &&
                    // this.props.dragging &&
                    <p
                        style={{
                            display: ((gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch") &&
                                this.props.dragging) ? "unset" : "none",
                            position: "absolute",
                            bottom: (coordinatesAbs.cy2 - itemRect.top - itemRect.height) / 2,
                            left: itemRect.left - coordinatesAbs.cx1 + itemRect.width / 2,
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
        )
    }
}

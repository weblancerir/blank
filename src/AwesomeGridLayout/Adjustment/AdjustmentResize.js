import React from "react";
import './Adjustment.css'
import ResizePane from "./ResizePane";
import AdjustmentStretch from "./AdjustmentStretch";
import {cloneObject, shallowEqual} from "../AwesomeGridLayoutUtils";
import classNames from "classnames";

export default class AdjustmentResize extends React.Component {
    constructor (props) {
        super(props);
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!shallowEqual(nextProps.data, this.data))
            return true;

        if (!shallowEqual(nextProps, this.props))
            return true;

        return false;
    }

    render () {
        let {data, allowStretch, idMan, itemId, isStretch, draggingStart, transformStyleId, item} = this.props;
        this.data = cloneObject(data);
        let stretchStyle = {};
        if (!allowStretch) stretchStyle.display = "none";

        let classes = classNames(
            "AdjustmentResizeRoot",
            transformStyleId
        );
        return (
            <div
                id="AdjustmentResize"
                style={{
                    width: data.width,
                    height: data.height,
                    top: data.top,
                    left: data.left,
                    // transform: transform
                }}
                className={classes}
            >
                {
                    !isStretch &&
                    ['s','n','e','w','se','ne','sw','nw'].map((side, index) => {
                        return <ResizePane
                            enabled={this.props.sides.includes(side)}
                            key={index}
                            side={side}
                            onResizeStart={this.props.onResizeStart}
                            onResize={this.props.onResize}
                            onResizeStop={this.props.onResizeStop}
                            draggingStart={draggingStart}
                        />
                    })
                }
                {
                    !(item.getCompositeFromData("transform") || {}).rotateDegree && !item.props.noStretch &&
                    <AdjustmentStretch
                        style={stretchStyle}
                        isStretch={isStretch}
                        idMan={idMan}
                        itemId={itemId}
                    />
                }
            </div>
        )
    }
}

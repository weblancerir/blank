import React from "react";
import './Adjustment.css'
import ResizePane from "./ResizePane";
import AdjustmentStretch from "./AdjustmentStretch";
import {cloneObject, shallowEqual} from "../AwesomeGridLayoutUtils";
import Popper from "@material-ui/core/Popper/Popper";

export default class AdjustmentResize extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!shallowEqual(nextProps.data, this.data))
            return true;

        if (!shallowEqual(nextProps, this.props))
            return true;

        return false;
    }

    render () {
        let {data, allowStretch, idMan, itemId, isStretch, draggingStart, transform} = this.props;
        this.data = cloneObject(data);
        return (
            <Popper open
                    anchorEl={
                        () => {
                            return document.getElementById(itemId);
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
                    id="AdjustmentResize"
                    style={{
                        width: data.width,
                        height: data.height,
                        // transform: transform
                    }}
                    className="AdjustmentResizeRoot"
                >
                    {
                        !isStretch &&
                        this.props.sides.map((side, index) => {
                            return <ResizePane
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
                        allowStretch &&
                        <AdjustmentStretch
                            isStretch={isStretch}
                            idMan={idMan}
                            itemId={itemId}
                        />
                    }
                </div>
            </Popper>
        )
    }
}

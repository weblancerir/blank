import React from "react";
import './Adjustment.css'
import ResizePane from "./ResizePane";
import AdjustmentStretch from "./AdjustmentStretch";
import ResizePanePage from "./ResizePanePage";
import Popper from "@material-ui/core/Popper/Popper";

export default class AdjustmentResizePage extends React.Component {
    render () {
        let {top, left, width, height, itemId} = this.props;
        if (top === undefined || left === undefined || width === undefined || height === undefined)
            return null;

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
                        width: width,
                        height: height,
                        // left: left? left: 0,
                        // top: top? top : 0,
                        // bottom: top? window.innerHeight - top - height: 0,
                        // right: left? window.innerWidth - left - width: 0,
                    }}
                    // className="AdjustmentResizeRootPage"
                    className="AdjustmentResizeRoot"
                >
                    {
                        this.props.sides.map((side, index) => {
                            return <ResizePanePage
                                key={index}
                                side={side}
                                onResizeStart={this.props.onResizeStart}
                                onResize={this.props.onResize}
                                onResizeStop={this.props.onResizeStop}
                                draggingStart={this.props.draggingStart}
                            />
                        })
                    }
                </div>
            </Popper>
        )
    }
}

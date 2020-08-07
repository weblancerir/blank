import React from "react";
import './Adjustment.css'
import ResizePane from "./ResizePane";
import AdjustmentStretch from "./AdjustmentStretch";
import ResizePanePage from "./ResizePanePage";
import Popper from "@material-ui/core/Popper/Popper";

export default class AdjustmentResizePage extends React.Component {
    constructor(props) {
        super(props);
    }
    render () {
        let {top, left, width, height} = this.props;
        if (top === undefined || left === undefined || width === undefined || height === undefined)
            return null;

        return (
                <div
                    id="AdjustmentResizePage"
                    style={{
                        width: width,
                        height: "80vh",
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
        )
    }
}

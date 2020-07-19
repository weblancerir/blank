import React from "react";
import './Adjustment.css'
import ResizePane from "./ResizePane";
import AdjustmentStretch from "./AdjustmentStretch";

export default class AdjustmentResize2 extends React.Component {
    render () {
        let {data, allowStretch, item, isStretch} = this.props;
        return (
            <div
                id="AdjustmentResize"
                className="AdjustmentResizeRoot2"
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
                            draggingStart={this.props.draggingStart}
                        />
                    })
                }
                {
                    allowStretch &&
                    <AdjustmentStretch
                        isStretch={isStretch}
                        item={item}
                    />
                }
            </div>
        )
    }
}

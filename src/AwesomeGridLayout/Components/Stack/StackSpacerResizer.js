import React from "react";
import "./StackSpacer.css";
import AdjustmentMove from "../../Adjustment/AdjustmentMove";

export default class StackSpacerResizer extends React.PureComponent{
    render() {
        return (
            <div
                className="StackSpacerResizerRoot"
            >
                <AdjustmentMove
                    onDragStart={this.props.onDragStart}
                    onDrag={this.props.onDrag}
                    onDragStop={this.props.onDragStop}
                    cursor={this.props.cursor}
                />
            </div>
        )
    }
}

import React from "react";
import './Adjustment.css'

export default class AdjustmentGridRoot extends React.PureComponent {
    render () {
        let {top, left, bottom, right} = this.props;
        return (
            <div
                id="AdjustmentGridRoot"
                className="AdjustmentGridRoot"
                style={{top, left, bottom, right}}
            >
                {
                    this.props.children
                }
            </div>
        )
    }
}

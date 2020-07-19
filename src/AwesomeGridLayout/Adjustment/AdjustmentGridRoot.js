import React from "react";
import './Adjustment.css'
import AdjustmentSnapLines from "./AdjustmentSnapLines";
import GridChildContainerChildren from "../GridChildContainerChildren";
import GridChildContainerGridLine from "../GridChildContainerGridLine";
import AdjustmentGridLinesWrapper from "./AdjustmentGridLinesWrapper";

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

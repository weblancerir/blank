import React from "react";
import './Adjustment.css'
import AdjustmentSnapLines from "./AdjustmentSnapLines";
import GridChildContainerChildren from "../GridChildContainerChildren";
import GridChildContainerGridLine from "../GridChildContainerGridLine";
import AdjustmentGridLinesWrapper from "./AdjustmentGridLinesWrapper";
import Portal from "../Portal";
import {getCachedBoundingRect} from "../Test/WindowCache";

export default class GridLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render () {
        let {id, lineRef, style} = this.props;
        return (
            <div
                className={this.props.className}
                id={id}
                ref={lineRef}
                style={style}
            />
        )
    }
}

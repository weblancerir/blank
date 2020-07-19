import React from "react";
import './Adjustment.css'
import AdjustmentSnapLines from "./AdjustmentSnapLines";

export default class AdjustmentSnap extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    update = (snapH, snapV, pointOfSnapH, pointOfSnapV) => {
        this.setState({
            snapH, snapV, pointOfSnapH, pointOfSnapV
        });
    };

    render () {
        let {snapH, snapV, pointOfSnapH, pointOfSnapV} = this.state;
        return (
            <div
                id="AdjustmentHelpLines"
                className="AdjustmentSnapLinesRoot"
            >
                <svg className="AdjustmentHelpLinesSVG">
                    <AdjustmentSnapLines
                        snapH={snapH}
                        pointOfSnapH={pointOfSnapH}
                    />
                    <AdjustmentSnapLines
                        snapV={snapV}
                        pointOfSnapV={pointOfSnapV}
                    />
                </svg>
            </div>
        )
    }
}

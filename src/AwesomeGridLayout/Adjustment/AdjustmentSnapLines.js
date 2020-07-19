import React from "react";
import './Adjustment.css'

export default class AdjustmentSnapLines extends React.Component {
    render () {
        let {snapH, snapV, pointOfSnapH, pointOfSnapV} = this.props;
        if (!snapH && !snapV)
            return null;

        if (snapH) {
            return (
                <line
                    x1={Math.min(snapH.p1, snapH.p2, pointOfSnapH.p1, pointOfSnapH.p2)}
                    x2={Math.max(snapH.p1, snapH.p2, pointOfSnapH.p1, pointOfSnapH.p2)}
                    y1={snapH.value}
                    y2={snapH.value}
                    style={{
                        stroke: "#ff00a4"
                    }}
                />
            )
        } else {
            return (
                <line
                    x1={snapV.value}
                    x2={snapV.value}
                    y1={Math.min(snapV.p1, snapV.p2, pointOfSnapV.p1, pointOfSnapV.p2)}
                    y2={Math.max(snapV.p1, snapV.p2, pointOfSnapV.p1, pointOfSnapV.p2)}
                    style={{
                        stroke: "#ff00a4"
                    }}
                />
            )
        }
    }
}

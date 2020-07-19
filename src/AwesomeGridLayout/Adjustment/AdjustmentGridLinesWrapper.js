import React from "react";
import './Adjustment.css'
import Portal from "../Portal";
import {throttleDebounce} from "../AwesomeGridLayoutUtils";

export default class AdjustmentGridLinesWrapper extends React.PureComponent {
    needUpdate = throttleDebounce(() => {
        this.forceUpdate();
    }, 100);

    render () {
        let {yNo, xNo, yLineRef, xLineRef, gridTemplateRows, gridTemplateColumns,
            top, bottom, left, right, refId} = this.props;

        if (yNo >= 0 && xNo >= 0 && !document.getElementById(`${refId}_container`))
            this.needUpdate();
        return (
            <div
                id={this.props.id}
                className="AdjustmentGridLinesContainer"
                style={{
                    top: top,
                    bottom: bottom,
                    left: left,
                    right: right,
                    gridTemplateRows: gridTemplateRows,
                    gridTemplateColumns: gridTemplateColumns
                }}
            >
                {
                    new Array(yNo + 1).fill(0).map((y, index) => {
                        return <Portal
                            key={`y_${index}`}
                            node={document && document.getElementById(`${refId}_container`)}
                            document={this.props.document}
                        >
                            <div
                            className="AdjustmentGridLinesY"
                            key={`y_${index}`}
                            id={`y_${index}_${refId}`}
                            ref={yLineRef[index]}
                            style={{
                                top: index === yNo ? "unset" : 0,
                                bottom: index === yNo ? 0 : "unset",
                                gridArea: `${index + 1}/1/${index + 1}/${xNo + 1}`,
                            }}/>
                        </Portal>
                    })
                }
                {
                    new Array(xNo + 1).fill(0).map((x, index) => {
                        return <Portal
                            key={`x_${index}`}
                            node={document && document.getElementById(`${refId}_container`)}
                            document={this.props.document}
                        >
                            <div
                                className="AdjustmentGridLinesX"
                                key={`x_${index}`}
                                id={`x_${index}_${refId}`}
                                ref={xLineRef[index]}
                                style={{
                                    left: index === xNo? "unset": 0,
                                    right: index === xNo? 0: "unset",
                                    gridArea: `1/${index + 1}/${yNo + 1}/${index + 1}`,
                                }}/>
                        </Portal>
                    })
                }
            </div>
        )
    }
}

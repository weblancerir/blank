import React from "react";
import './Adjustment.css'
import {throttleDebounce} from "../AwesomeGridLayoutUtils";
import Portal from "@material-ui/core/Portal/Portal";
import GridLine from "./GridLine";

export default class AdjustmentGridLinesWrapper extends React.PureComponent {
    needUpdate = throttleDebounce(() => {
        this.forceUpdate();
    }, 100);

    render () {
        let {yNo, xNo, yLineRef, xLineRef, refId} = this.props;

        if (yNo >= 0 && xNo >= 0 && !document.getElementById(`${refId}_container`))
            this.needUpdate();
        return (
            <>
                {
                    new Array(yNo + 1).fill(0).map((y, index) => {
                        return <Portal
                            key={index}
                            container={document.getElementById(`${refId}_container`)}
                        >
                            <GridLine
                                className="AdjustmentGridLinesY"
                                id={`y_${index}_${refId}`}
                                lineRef={yLineRef[index]}
                                style={{
                                    top: index === yNo ? "unset" : 0,
                                    bottom: index === yNo ? 0 : "unset",
                                    gridArea: `${index + 1}/1/${index + 1}/${xNo + 1}`,
                                }}
                            />
                        </Portal>
                    })
                }
                {
                    new Array(xNo + 1).fill(0).map((x, index) => {
                        return <Portal
                            key={index}
                            container={document.getElementById(`${refId}_container`)}
                        >
                            <GridLine
                                className="AdjustmentGridLinesX"
                                id={`x_${index}_${refId}`}
                                lineRef={xLineRef[index]}
                                style={{
                                    left: index === xNo? "unset": 0,
                                    right: index === xNo? 0: "unset",
                                    gridArea: `1/${index + 1}/${yNo + 1}/${index + 1}`,
                                }}
                            />
                        </Portal>
                    })
                }
            </>
        )
    }
}

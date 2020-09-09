import React from "react";
import './GridChildDraggable.css';

export default class GridChildContainerGridLine extends React.PureComponent {
    render () {
        let {showGridLines, yNo, xNo, yLineRef, xLineRef} = this.props;
        if (yNo && showGridLines) {
            return (
                new Array(yNo + 1).fill(0).map((y, index) => {
                    return <div
                        key={`y_${index}`}
                        ref={yLineRef[index]}
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: 1,
                            top: index === yNo? "unset": 0,
                            bottom: index === yNo? 0: "unset",
                            gridArea: `${index + 1}/1/${index + 1}/${xLineRef.length + 1}`,
                            backgroundImage: "linear-gradient(90deg,rgba(89,93,112,.6) 37.5%,rgba(207,209,220,.6) 0,rgba(207,209,220,.6) 50%,transparent 0)",
                            backgroundSize: "8px 6px",
                            backgroundRepeat: "repeat-x",
                            pointerEvents: "none"
                        }}
                    />
                })
            );
        } else if (xNo && showGridLines){
            return (
                new Array(xNo + 1).fill(0).map((x, index) => {
                    return <div
                        key={`x_${index}`}
                        ref={xLineRef[index]}
                        style={{
                            position: "absolute",
                            width: 1,
                            height: "100%",
                            left: index === xNo? "unset": 0,
                            right: index === xNo? 0: "unset",
                            gridArea: `1/${index + 1}/${yLineRef.length + 1}/${index + 1}`,
                            backgroundImage: "linear-gradient(rgba(89,93,112,.6) 37.5%,rgba(207,209,220,.6) 0,rgba(207,209,220,.6) 50%,transparent 0)",
                            backgroundSize: "6px 8px",
                            backgroundRepeat: "repeat-y",
                            pointerEvents: "none"
                        }}
                    />
                })
            );
        } else {
            return null;
        }
    }
}

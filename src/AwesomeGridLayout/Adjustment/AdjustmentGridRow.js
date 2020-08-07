import React from "react";
import './Adjustment.css'
import AdjustmentSnapLines from "./AdjustmentSnapLines";
import GridChildContainerChildren from "../GridChildContainerChildren";
import GridChildContainerGridLine from "../GridChildContainerGridLine";
import AdjustmentGridLinesWrapper from "./AdjustmentGridLinesWrapper";
import AdjustmentGridRoot from "./AdjustmentGridRoot";
import classNames from "classnames";

export default class AdjustmentGridRow extends React.Component {
    // TODO BUG: first and last grid line is not provided, fix the bug
    render () {
        let {gridLineManager, itemId, grid} = this.props;
        let rowLines = gridLineManager.getYlineRef(itemId);
        return (
            <div
                className="AdjustmentGridRowEditor"
            >
                {
                    new Array(grid.x).fill(0).map((x, index) => {
                        let rowLine = rowLines[index];
                        let rowLineRect = rowLine.current.rect;
                        let nextRowLineRect = rowLines[index + 1].current.rect;
                        let rowHeight = grid.gridTemplateRows.split(' ')[index];
                        let classes = classNames(
                            "AdjustmentGridRowEditorItem",
                            index === 0 && "AdjustmentGridRowEditorItemTop",
                            index === grid.x - 1 && "AdjustmentGridRowEditorItemBottom",
                        );
                        return(
                                <div
                                    key={`row_${index}`}
                                    className={classes}
                                    style={{
                                        height: nextRowLineRect.top - rowLineRect.top,
                                    }}
                                >
                                    <p style={{
                                        margin: 0,
                                        fontWeight: "bold"
                                    }}>
                                        {rowHeight}
                                    </p>
                                </div>
                        )
                    })
                }
            </div>
        )
    }
}

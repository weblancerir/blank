import React from "react";
import './Adjustment.css'
import {getCachedBoundingRect} from "../Test/WindowCache";
import AdjustmentGridLinesWrapper2 from "./AdjustmentGridLinesWrapper2";

export default class AdjustmentGridLines extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            xNoA: -1,
            yNoA: -1,
            xNoB: -1,
            yNoB: -1,
            xNoT: -1,
            yNoT: -1,
        };

        this.xLineRefA = new Array(100);
        this.yLineRefA = new Array(100);
        this.xLineRefB = new Array(100);
        this.yLineRefB = new Array(100);
        this.xLineRefT = new Array(100);
        this.yLineRefT = new Array(100);

        this.idCache = {};
    }

    fixLineRef = (x, y, gridType) => {
        for (let i = 0; i <= x; i++) {
            if (!this[`xLineRef${gridType}`][i])
                this[`xLineRef${gridType}`][i] = React.createRef();
        }
        for (let i = 0; i <= y; i++) {
            if (!this[`yLineRef${gridType}`][i])
                this[`yLineRef${gridType}`][i] = React.createRef();
        }
    };

    addGrid = (id, y, x, gridType, gridTemplateRows, gridTemplateColumns, positions, callback) => {
        this.fixLineRef(x, y, gridType);
        if (this.idCache["A"] && this.idCache["A"].id === id && gridType === "A") {
            this.updateGridLine(id, "A", {
                gridTemplateRows, gridTemplateColumns, positions, x, y
            }, callback)
        }
        else if (this.idCache["B"] && this.idCache["B"].id === id && gridType === "B") {
            this.updateGridLine(id, "B", {
                gridTemplateRows, gridTemplateColumns, positions, x, y
            }, callback)
        }
        else if (this.idCache["T"] && this.idCache["T"].id === id && gridType === "T") {
            this.updateGridLine(id, "T", {
                gridTemplateRows, gridTemplateColumns, positions, x, y
            }, callback)
        }
        else {
            this.idCache[gridType] = {id, gridTemplateRows, gridTemplateColumns, positions, x, y};

            this.setState({
                [`xNo${gridType}`]: x,
                [`yNo${gridType}`]: y
            }, () => {
                // this.prepareRects(id);
                if (callback)
                    callback();
            })
        }
    };

    updateGridLine = (id, gridType, {gridTemplateRows, gridTemplateColumns, positions, x, y} = {}, callback) => {
        if (!gridType) {
            if (this.idCache["A"] && this.idCache["A"].id === id)
                gridType = "A";
            else if (this.idCache["B"] && this.idCache["B"].id === id)
                gridType = "B";
            else if (this.idCache["T"] && this.idCache["T"].id === id)
                gridType = "T";
            else return;
        }

        gridTemplateRows && (this.idCache[gridType].gridTemplateRows = gridTemplateRows);
        gridTemplateColumns && (this.idCache[gridType].gridTemplateColumns = gridTemplateColumns);
        positions && (this.idCache[gridType].positions = positions);
        x && (this.idCache[gridType].x = x);
        y && (this.idCache[gridType].y = y);

        if (!x && !y) {
            this.setState({reload: true}, callback);
            return;
        }

        if (x || y)
            this.setState({
                [`xNo${gridType}`]: x,
                [`yNo${gridType}`]: y
            }, callback);
    };

    getIdCache = (gridType) => {
        return this.idCache[gridType];
    };

    getXlineRef = (id, gridType) => {
        if (!gridType) {
            if (this.idCache["A"] && this.idCache["A"].id === id)
                gridType = "A";
            else if (this.idCache["B"] && this.idCache["B"].id === id)
                gridType = "B";
            else if (this.idCache["T"] && this.idCache["T"].id === id)
                gridType = "T";
            else return;
        }

        return this[`xLineRef${gridType}`].slice(0, this.idCache[gridType].x + 1);
    };

    getYlineRef = (id, gridType) => {
        if (!gridType) {
            if (this.idCache["A"] && this.idCache["A"].id === id)
                gridType = "A";
            else if (this.idCache["B"] && this.idCache["B"].id === id)
                gridType = "B";
            else if (this.idCache["T"] && this.idCache["T"].id === id)
                gridType = "T";
            else return;
        }

        return this[`yLineRef${gridType}`].slice(0, this.idCache[gridType].y + 1);
    };

    removeGridLine = (id, gridType) => {
        if (!gridType) {
            if (this.idCache["A"] && this.idCache["A"].id === id)
                gridType = "A";
            else if (this.idCache["B"] && this.idCache["B"].id === id)
                gridType = "B";
            else if (this.idCache["T"] && this.idCache["T"].id === id)
                gridType = "T";
            else return;
        }

        delete this.idCache[gridType];

        this.setState({
            [`xNo${gridType}`]: -1,
            [`yNo${gridType}`]: -1
        })
    };

    hasGridLine = (id, gridType) => {
        if (!gridType) {
            if (this.idCache["A"] && this.idCache["A"].id === id)
                return "A";

            if (this.idCache["B"] && this.idCache["B"].id === id)
                return "B";

            if (this.idCache["T"] && this.idCache["T"].id === id)
                return "T";
        } else {
            if (this.idCache[gridType] && this.idCache[gridType].id === id)
                return gridType;
        }
    };

    isPrepared = (id) => {
        if (this.idCache["A"] && this.idCache["A"].prepared)
            return true;
        else if (this.idCache["B"] && this.idCache["B"].prepared)
            return true;
        else if (this.idCache["T"] && this.idCache["T"].prepared)
            return true;
    };

    prepareRects = (id) => {
        let xLineRef = this.getXlineRef(id);
        if (xLineRef)
            for(let i = 0; i < xLineRef.length; i++) {
                let current = xLineRef[i].current;
                if (!current)
                    continue;

                current.rect = getCachedBoundingRect(`xLineRef_${i}_${id}`, current);
            }
        let yLineRef = this.getYlineRef(id);
        if (yLineRef)
            for(let i = 0; i < yLineRef.length; i++) {
                let current = yLineRef[i].current;
                if (!current)
                    continue;

                current.rect = getCachedBoundingRect(`yLineRef_${i}_${id}`, current);
            }

        if (this.idCache["A"] && this.idCache["A"].id === id)
            this.idCache["A"].prepared = true;
        else if (this.idCache["B"] && this.idCache["B"].id === id)
            this.idCache["B"].prepared = true;
        else if (this.idCache["T"] && this.idCache["T"].id === id)
            this.idCache["T"].prepared = true;
    };

    removeGridLineByType = (gridType) => {
        delete this.idCache[gridType];

        this.setState({
            [`xNo${gridType}`]: -1,
            [`yNo${gridType}`]: -1
        })
    };

    render () {
        return (
            <div
                id="AdjustmentGridLinesRoot"
                className="AdjustmentGridLinesRoot"
            >
                <AdjustmentGridLinesWrapper2
                    id={"GridLinesContainer_A"}
                    refId={this.idCache["A"] && this.idCache["A"].id}
                    xNo={this.state.xNoA}
                    yNo={this.state.yNoA}
                    xLineRef={this.xLineRefA}
                    yLineRef={this.yLineRefA}
                    gridTemplateRows={this.idCache["A"] && this.idCache["A"].gridTemplateRows}
                    gridTemplateColumns={this.idCache["A"] && this.idCache["A"].gridTemplateColumns}
                    top={this.idCache["A"] && this.idCache["A"].positions.top}
                    bottom={this.idCache["A"] && this.idCache["A"].positions.bottom}
                    left={this.idCache["A"] && this.idCache["A"].positions.left}
                    right={this.idCache["A"] && this.idCache["A"].positions.right}
                />

                <AdjustmentGridLinesWrapper2
                    id={"GridLinesContainer_B"}
                    refId={this.idCache["B"] && this.idCache["B"].id}
                    xNo={this.state.xNoB}
                    yNo={this.state.yNoB}
                    xLineRef={this.xLineRefB}
                    yLineRef={this.yLineRefB}
                    gridTemplateRows={this.idCache["B"] && this.idCache["B"].gridTemplateRows}
                    gridTemplateColumns={this.idCache["B"] && this.idCache["B"].gridTemplateColumns}
                    top={this.idCache["B"] && this.idCache["B"].positions.top}
                    bottom={this.idCache["B"] && this.idCache["B"].positions.bottom}
                    left={this.idCache["B"] && this.idCache["B"].positions.left}
                    right={this.idCache["B"] && this.idCache["B"].positions.right}
                />

                <AdjustmentGridLinesWrapper2
                    id={"GridLinesContainer_T"}
                    refId={this.idCache["T"] && this.idCache["T"].id}
                    xNo={this.state.xNoT}
                    yNo={this.state.yNoT}
                    xLineRef={this.xLineRefT}
                    yLineRef={this.yLineRefT}
                    gridTemplateRows={this.idCache["T"] && this.idCache["T"].gridTemplateRows}
                    gridTemplateColumns={this.idCache["T"] && this.idCache["T"].gridTemplateColumns}
                    top={this.idCache["T"] && this.idCache["T"].positions.top}
                    bottom={this.idCache["T"] && this.idCache["T"].positions.bottom}
                    left={this.idCache["T"] && this.idCache["T"].positions.left}
                    right={this.idCache["T"] && this.idCache["T"].positions.right}
                />
            </div>
        )
    }
}

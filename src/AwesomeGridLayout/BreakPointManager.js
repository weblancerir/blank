import {cloneObject, throttleDebounce} from "./AwesomeGridLayoutUtils";
import merge from "lodash.merge";
import {EditorContext} from "./Editor/EditorContext";
import {useContext} from "react";

export default class BreakPointManager {
    constructor(breakpoints, editor, onBreakpointChange, onZoomLevelChange, onHeightChange, onResize) {
        if (!breakpoints)
            breakpoints = BreakPointManager.getDefault();

        this.fixBreakpointRules(breakpoints);

        // TODO test

        this.breakpoints = breakpoints;
        this.editor = editor;
        this.windowInnerWidth = window.innerWidth;
        this.lastWidth = window.innerWidth;
        this.onBreakpointChange = onBreakpointChange || (() => {});
        this.onZoomLevelChange = onZoomLevelChange || (() => {});
        this.onHeightChange = onHeightChange || (() => {});

        window.addEventListener("resize", onResize);
        if (onBreakpointChange)
            window.addEventListener("resize", this.onWindowResize);
        if (onZoomLevelChange)
            window.addEventListener("resize", this.onDevicePixelRatioChange);
        if (onHeightChange)
            window.addEventListener("resize", this.onHeightResize);
    }

    fixBreakpointRules = (breakpoints) => {
        breakpoints.forEach(bpData => {
            if (!bpData.end)
                bpData.end = 99999;
        });
    }

    updateBreakpoint = (name, start, end) => {
        let bp = this.breakpoints.find(b => b.name === name);
        if (bp) {
            bp.end = end;
            let upperBP = this.getUpperBreakPoint(name);
            if (upperBP) this.getUpperBreakPoint(name).start = end + 1;
            return;
        }

        start++;
        bp = {name, start, end};
        let prevBp;

        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = 0; i < sortedBreakPoints.length; i++) {
            if (bp.start === sortedBreakPoints[i].start + 1) {
                bp.start++;
            }
            if (bp.start >= sortedBreakPoints[i].start) {
                bp.end = sortedBreakPoints[i].end;
                sortedBreakPoints[i].end = bp.start - 1;
                prevBp = sortedBreakPoints[i];
                break;
            }
        }

        this.breakpoints.push(bp);

        return {newBpData: bp, prevBpData: prevBp};
    };

    deleteBreakpoint = (name) => {
        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = 0; i < sortedBreakPoints.length; i++) {
            if (name === sortedBreakPoints[i].name) {
                let upper = sortedBreakPoints[i - 1];
                upper.start = sortedBreakPoints[i].start;
                break;
            }
        }

        let index = this.breakpoints.findIndex(bp => {
            return bp.name === name;
        });

        this.breakpoints.splice(index, 1);
    };

    fromClone = (clone) => {
        this.breakpoints = clone.breakpoints;
        this.windowInnerWidth = clone.windowInnerWidth;
        this.lastWidth = clone.lastWidth;
        this.editor = clone.editorData;

        return this;
    };

    copyDesign = (designDatas, sourceItem) => {
        this.cloneDesignDatas = {
            designDatas: cloneObject(designDatas),
            sourceItem
        };
    };

    getCopyDesign = () => {
        return this.cloneDesignDatas;
    };

    pasteDesign = (item) => {
        if (!this.getCopyDesign())
            return;

        this.getCopyDesign().designDatas.forEach((designData, index) => {
            let design = designData.design;
            if (!designData.justOneBp) {
                let bpName = designData.bpName;
                if (!item.props.griddata.bpData[bpName])
                    item.props.griddata.bpData[bpName] = {};
                item.props.griddata.bpData[bpName].design = cloneObject(design);
            } else {
                let currentBpName = item.props.breakpointmanager.current();
                if (!item.props.griddata.bpData[currentBpName])
                    item.props.griddata.bpData[currentBpName] = {};
                item.props.griddata.bpData[currentBpName].design = cloneObject(design);
            }
        });
    };

    getWindowWidth = () => {
        return this.lastWidth
    };

    getWindowHeight = () => {
        return this.editor.rootLayoutRef.current.getSize(false).height;
        // return window.innerHeight * 0.8;
    };

    setWindowWidth = (width) => {
        this.lastWidth = width;
    };

    getBpData = (bpName) => {
        return this.breakpoints.find(bp => {
            return bp.name === bpName;
        });
    };

    dispose() {
        window.removeEventListener("resize", this.onWindowResize);
    }

    getDevicePixelRatio = () => {
        return window.devicePixelRatio;
    };

    onDevicePixelRatioChange = () => {
        let changed = this.devicePixelRatio !== window.devicePixelRatio;

        this.devicePixelRatio = window.devicePixelRatio;

        if (changed) {
            this.onZoomLevelChange(this.getDevicePixelRatio());
        }
    };

    onHeightResize = throttleDebounce((e) => {
        if (this.lastHeight !== window.innerHeight) {
            this.lastHeight = window.innerHeight;
            this.onHeightChange(e);
        }
    }, 100);

    onWindowResize = throttleDebounce(() => {
        let newWidth = window.innerWidth -
            this.editor.context.inspectorPinned ? this.editor.context.inspectorWidth : 0;

        let result = this.checkBreakPointChange(newWidth);

        this.setWindowWidth(newWidth);

        if (result.changed) {
            this.onBreakpointChange(newWidth, result.currentBreakpointName, this.getDevicePixelRatio());
        }
    }, 100);

    checkBreakPointChange = (newWidth) => {
        let lastBreakpointName = this.current(this.getWindowWidth());
        let currentBreakpointName = this.current(newWidth);

        return {
            changed: (lastBreakpointName !== currentBreakpointName),
            currentBreakpointName
        }
    };

    current = (size) => {
        if (!size)
            size = this.getWindowWidth();
        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = 0; i < sortedBreakPoints.length; i++) {
            if (this.getSize(size) >= sortedBreakPoints[i].start)
                return sortedBreakPoints[i].name;
        }

        return sortedBreakPoints[sortedBreakPoints.length - 1].name;
    };

    currentBpData = (size) => {
        if (!size)
            size = this.getWindowWidth();
        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = 0; i < sortedBreakPoints.length; i++) {
            if (this.getSize(size) >= sortedBreakPoints[i].start)
                return sortedBreakPoints[i];
        }

        return sortedBreakPoints[sortedBreakPoints.length - 1];
    };

    getUpperBreakPoint = (bpName) => {
        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = 0; i < sortedBreakPoints.length; i++) {
            if (bpName === sortedBreakPoints[i].name)
                return sortedBreakPoints[i - 1] && sortedBreakPoints[i - 1];
        }
    };

    setData = (dataSet, param, value, breakpointName) => {
        let params = param.split('.');
        let name = breakpointName ||
            this.current(this.getSize());
        if (!dataSet.bpData[name]) {
            dataSet.bpData[name] = {};
        }
        if (params.length === 1) {
            if (value !== undefined)
                dataSet.bpData[name][params[0]] = value;
            else
                delete dataSet.bpData[name][params[0]];
        } else {
            if (dataSet.bpData[name][params[0]] === undefined)
                dataSet.bpData[name][params[0]] = {};
            let override = dataSet.bpData[name][params[0]];
            for(let i = 1; i < params.length; i++) {
                if (i === params.length - 1) { // Last index
                    if (value !== undefined)
                        override[params[i]] = value;
                    else
                        delete override[params[i]];
                }
                else
                {
                    if (override[params[i]] === undefined)
                        override[params[i]] = {};
                    override = override[params[i]];
                }
            }
        }
    };

    getFromData = (dataSet, param, breakpointName) => {
        let params = param.split('.');
        let firstParamResult;
        let currentBreakpointName = breakpointName ||
            this.current(this.getSize());

        if (dataSet.bpData[currentBreakpointName] &&
            dataSet.bpData[currentBreakpointName][params[0]] !== undefined)
            firstParamResult =
                dataSet.bpData[currentBreakpointName][params[0]];
        else {
            firstParamResult = this.findFirstUpperBreakPointParam(dataSet, params[0]
                , this.getSize());
        }

        if (firstParamResult === undefined)
            return;

        if (params.length === 1)
            return firstParamResult;

        params.slice(1).forEach(p => {
            if (firstParamResult)
                firstParamResult = firstParamResult[p];
        });

        return firstParamResult;
    };

    getHighestBpName = () => {
        let sortedBreakPoints = this.getSortedBreakPoints();
        return sortedBreakPoints[0].name;
    };

    getCompositeFromData = (dataSet, param) => {
        let params = param.split('.');
        let results = [];

        let sortedBreakPoints = this.getSortedBreakPoints(this.getWindowWidth());
        for(let i = sortedBreakPoints.length - 1; i >= 0; i--) {
            let checkBreakpointName = sortedBreakPoints[i].name;

            let firstParamResult;
            if (dataSet.bpData[checkBreakpointName] &&
                dataSet.bpData[checkBreakpointName][params[0]] !== undefined)
                firstParamResult = dataSet.bpData[checkBreakpointName][params[0]];

            if (firstParamResult === undefined)
                continue;

            if (params.length === 1) {
                results.push(firstParamResult);
            } else {
                params.slice(1).forEach(p => {
                    if (firstParamResult)
                        firstParamResult = firstParamResult[p];
                });

                results.push(firstParamResult);
            }
        }

        if (!(results[0] instanceof Object))
            return results[0];

        let composite = {};
        for (let i = results.length - 1; i >= 0; i--) {
            composite = merge(composite, results[i]);
        }

        return composite;
    };

    hasDataInBreakPoint = (dataSet, param, breakpointName) => {
        let params = param.split('.');
        let firstParamResult;
        let currentBreakpointName = breakpointName ||
            this.current(this.getSize());

        if (dataSet.bpData[currentBreakpointName] &&
            dataSet.bpData[currentBreakpointName][params[0]] !== undefined)
            firstParamResult =
                dataSet.bpData[currentBreakpointName][params[0]];

        if (firstParamResult === undefined)
            return;

        if (params.length === 1)
            return firstParamResult;

        params.slice(1).forEach(p => {
            if (firstParamResult)
                firstParamResult = firstParamResult[p];
        });

        return firstParamResult;
    };

    findFirstUpperBreakPointParam = (dataSet, param, size) => {
        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = sortedBreakPoints.length - 1; i >= 0; i--) {
            if (this.getSize(size) <= sortedBreakPoints[i].end) {
                if (dataSet.bpData[sortedBreakPoints[i].name] &&
                    dataSet.bpData[sortedBreakPoints[i].name][param] !== undefined)
                    return dataSet.bpData[sortedBreakPoints[i].name][param];
            }
        }
    };

    findFirstUpperBreakPointName = (dataSet, param, size) => {
        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = sortedBreakPoints.length - 1; i >= 0; i--) {
            if (this.getSize(size) <= sortedBreakPoints[i].end) {
                if (dataSet.bpData[sortedBreakPoints[i].name]/* && dataSet[sortedBreakPoints[i].name][param] !== undefined*/)
                    return sortedBreakPoints[i].name;
            }
        }
    };

    getMinWidth = () => {
        let sortedBreakPoints = this.getSortedBreakPoints();
        return sortedBreakPoints[sortedBreakPoints.length - 1].start;
    };

    getSortedBreakPoints = (minSize) => {
        let breakpoints = this.breakpoints;
        if (minSize) {
            breakpoints = this.breakpoints.filter(bp => {
                return bp.end >= minSize;
            });
        }
        // console.log("breakpoints.length", breakpoints.length, minSize)
        return breakpoints.sort((a,b) => {
            if (a.start > b.start) {
                return -1;
            } else if (a.start === b.start) {
                // Without this, we can get different sort results in IE vs. Chrome/FF
                return 0;
            }
            return 1;
        });
    };

    exist = (name) => {
        return this.breakpoints.find(b => {
            return b.name === name;
        });
    };

    static getDefault = () => {
        return [
            {
                name: "laptop",
                start: 1001,
                end: 99999,
                prefer: 1006
            },
            {
                name: "tablet",
                start: 751,
                end: 1000,
                prefer: 768
            },
            {
                name: "mobile",
                start: 320,
                end: 750,
                prefer: 360
            },
        ]
    };

    getSize = (size) => {
        return size || this.getWindowWidth();
    };
};

export let setData = (dataSet, param, value, breakPointData, breakpointName) => {
    let breakPointManager = new BreakPointManager().fromClone(breakPointData);
    breakPointManager.setData(dataSet, param, value, breakpointName);
};

export let getFromData = (dataSet, param, breakPointData, breakpointName) => {
    let breakPointManager = new BreakPointManager().fromClone(breakPointData);
    return breakPointManager.getFromData(dataSet, param, breakpointName);
};

export let getCompositeFromData = (dataSet, param, breakPointData) => {
    let breakPointManager = new BreakPointManager().fromClone(breakPointData);
    return breakPointManager.getCompositeFromData(dataSet, param);
};

export let getSortedBreakPoints = (breakPointData) => {
    let breakPointManager = new BreakPointManager(breakPointData.breakpoints, breakPointData.windowInnerWidth);
    return breakPointManager.getSortedBreakPoints();
};

export let exist = (name, breakPointData) => {
    let breakPointManager = new BreakPointManager(breakPointData.breakpoints, breakPointData.windowInnerWidth);
    return breakPointManager.exist(name);
};

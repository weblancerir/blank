import {cloneObject, throttleDebounce} from "./AwesomeGridLayoutUtils";
import merge from "lodash.merge";

export default class BreakPointManager {
    constructor(breakpoints, editorData, onBreakpointChange, onZoomLevelChange) {
        if (!breakpoints)
            breakpoints = this.getDefault();
        this.breakpoints = breakpoints;
        this.editorData = editorData;
        this.windowInnerWidth = editorData && editorData.innerWidth;
        this.lastWidth = editorData && editorData.innerWidth;
        this.onBreakpointChange = onBreakpointChange || (() => {});
        this.onZoomLevelChange = onZoomLevelChange || (() => {});

        if (onBreakpointChange)
            window.addEventListener("resize", this.onWindowResize);
        if (onZoomLevelChange)
            window.addEventListener("resize", this.onDevicePixelRatioChange);
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

        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = 0; i < sortedBreakPoints.length; i++) {
            if (bp.start === sortedBreakPoints[i].start + 1) {
                bp.start++;
            }
            if (bp.start >= sortedBreakPoints[i].start) {
                bp.end = sortedBreakPoints[i].end;
                sortedBreakPoints[i].end = bp.start - 1;
                break;
            }
        }

        this.breakpoints.push(bp);
    };

    deleteBreakpoint = (name) => {
        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = 0; i < sortedBreakPoints.length; i++) {
            if (name === sortedBreakPoints[i].name) {
                let upper = sortedBreakPoints[i - 1];
                if (upper) {
                    upper.start = sortedBreakPoints[i].start;
                    break;
                } else {
                    return;
                }
            }
        }

        delete this.breakpoints[name];
    };

    fromClone = (clone) => {
        this.breakpoints = clone.breakpoints;
        this.windowInnerWidth = clone.windowInnerWidth;
        this.lastWidth = clone.lastWidth;
        this.editorData = clone.editorData;

        return this;
    };

    copyDesign = (designDatas) => {
        this.cloneDesignDatas = cloneObject(designDatas);
    };

    getCopyDesign = () => {
        return this.cloneDesignDatas;
    };

    pasteDesign = (item) => {
        if (!this.getCopyDesign())
            return;

        this.cloneDesignDatas.forEach((designData, index) => {
            let bpName = designData.bpName;
            let data = designData.data;
            item.props.griddata.bpData[bpName] = cloneObject(data);
        });
    };

    getWindowWidth = () => {
        return this.lastWidth
    };

    getWindowHeight = () => {
        return window.innerHeight * 0.8;
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

    onWindowResize = throttleDebounce(() => {
        let newWidth = window.innerWidth -
            this.editorData.inspectorPinned ? this.editorData.inspectorWidth : 0;

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

    getUpperBreakPoint = (bpName) => {
        let sortedBreakPoints = this.getSortedBreakPoints();
        for(let i = 0; i < sortedBreakPoints.length; i++) {
            if (bpName === sortedBreakPoints[i].name)
                return sortedBreakPoints[i - 1] && sortedBreakPoints[i - 1].name;
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

        if (param === "style" && dataSet.id === "comp_Section_1")
            console.log("bpData", dataSet.bpData[currentBreakpointName]);

        if (dataSet.bpData[currentBreakpointName] &&
            dataSet.bpData[currentBreakpointName][params[0]] !== undefined)
            firstParamResult =
                dataSet.bpData[currentBreakpointName][params[0]];
        else {
            firstParamResult = this.findFirstUpperBreakPointParam(dataSet, params[0]
                , this.getSize());
            if (param === "style" && dataSet.id === "comp_Section_1")
                console.log("Here", firstParamResult);
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

            if (params.length === 1)
                results.push(firstParamResult);

            params.slice(1).forEach(p => {
                if (firstParamResult)
                    firstParamResult = firstParamResult[p];
            });

            results.push(firstParamResult);
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

    getDefault = () => {
        return [
            {
                name: "laptop",
                start: 1001,
                end: Infinity
            },
            {
                name: "tablet",
                start: 751,
                end: 1000
            },
            {
                name: "mobile",
                start: 320,
                end: 750
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

import React from "react";
import {Resizable} from "re-resizable";
import css from 'dom-css';
import {exist, getFromData, getSortedBreakPoints, setData} from "./BreakPointManager";
import debounce from 'lodash.debounce';
// import {css, StyleSheet} from 'aphrodite'

let CalculateLayout = (griddatas, layoutType, parentSize, dir, compactType, scrollType, snap
                       , breakpointdata, hasOwnBreakPoints, parentGriddata) => {
    parentGriddata = parentGriddata || getDefaultChildgriddata(breakpointdata);

    let dummy;
    let childContainers = griddatas.map((griddata) => {
        if (griddata.id === undefined)
            console.error("direct child must have a id props");

        let result = {
            griddata: griddata,
        };

        result.griddata.id = griddata.id;
        result.isContainer = griddata.isContainer;
        result.selected = griddata.selected;
        result.resizable = griddata.resizable;
        result.draggable = griddata.draggable;
        result.dragging = griddata.dragging;

        result.w = getPxFromPercent(
            getFromData(result.griddata, "w", parentSize.x, hasOwnBreakPoints
                ,breakpointdata), parentSize.x);

        result.h = getPxFromPercent(
            getFromData(result.griddata, "h", parentSize.x, hasOwnBreakPoints
                ,breakpointdata), parentSize.y);

        result.x = getPxFromPercent(
            getFromData(result.griddata, "x", parentSize.x, hasOwnBreakPoints
                ,breakpointdata), parentSize.x);

        result.y = getPxFromPercent(
            getFromData(result.griddata, "y", parentSize.x, hasOwnBreakPoints
                ,breakpointdata), parentSize.y);

        result.rotate = getFromData(result.griddata, "rotate", parentSize.x, hasOwnBreakPoints
            ,breakpointdata);

        result.absolute = getFromData(result.griddata, "absolute", parentSize.x, hasOwnBreakPoints
            ,breakpointdata);

        result.fix = getFromData(result.griddata, "fix", parentSize.x, hasOwnBreakPoints
            ,breakpointdata);

        result.zIndex = getFromData(result.griddata, "zIndex", parentSize.x, hasOwnBreakPoints
            ,breakpointdata);

        if (result.griddata.dragging) {
            dummy = {};
            dummy.griddata = cloneObject(result.griddata);
            // dummy.griddata.dragging = false;
            dummy.griddata.id = "dummy";
            dummy.x = result.x;
            dummy.y = result.y;
            dummy.w = result.w;
            dummy.h = result.h;
            dummy.griddata.draggable = false;
            dummy.griddata.resizable = false;
            dummy.absolute = result.absolute;
            dummy.fix = result.fix;
            dummy.zIndex = result.zIndex;
            dummy.dragging = result.dragging;

            dummy.isDummy = true;
        }

        return result;
    });

    if (!childContainers)
        childContainers = [];

    if (dummy)
        childContainers.push(dummy);

    sortChilds(childContainers, parentSize, compactType, breakpointdata, hasOwnBreakPoints);

    let layouts = [];
    let layoutContainers = [];

    let maxHeight = scatter(childContainers, layoutContainers, layouts, layoutType, parentSize
        , compactType, scrollType, snap, breakpointdata, hasOwnBreakPoints, parentGriddata);

    return {childContainers: childContainers, layouts: layouts, maxHeight: maxHeight};
};

let getDummy = (w, h) => {
    return (
        <Resizable
            enable={false}
            size={{
                width: w,
                height: h,
            }}
        >
            <div style={{
                backgroundColor: "rgba(201, 76, 76, 0.3)",
                width: "100%",
                height: "100%"
            }}>
            </div>
        </Resizable>
    );
};

let scatter = (childContainers, layoutContainers, layouts, layoutType, parentSize
               , compactType, scrollType, snap, breakpointdata, hasOwnBreakPoints, parentGriddata) => {
    let notCompareChilds = [];
    let maxHeight = 0;
    for (let i = 0; i < childContainers.length; i++) {
        let childContainer = childContainers[i];

        if (childContainer.griddata.dragging) {
            notCompareChilds.push(childContainer);
            continue;
        }

        if (childContainer.absolute || childContainer.fix) {
            notCompareChilds.push(childContainer);
            continue;
        }

        if (layoutType === "free") {
            maxHeight = scatterFree(childContainer, childContainers, layoutContainers
                , parentSize, compactType, scrollType, snap, maxHeight, breakpointdata
                , hasOwnBreakPoints, parentGriddata);
        }

        layoutContainers.push(childContainer);
    }

    for (let i = 0; i < childContainers.length; i++) {
        let childContainer = childContainers[i];

        layouts.push(childContainer.griddata);
    }

    notCompareChilds.forEach(childContainer => {
        if (childContainer.absolute)
            fixAbsoluteChild(childContainer, parentSize, breakpointdata, hasOwnBreakPoints, parentGriddata);
        if (childContainer.fix)
            fixFixChild(childContainer, parentSize, breakpointdata, hasOwnBreakPoints, parentGriddata);

        setChildPosition(childContainer, {x:childContainer.x, y:childContainer.y}
             , parentSize, breakpointdata, hasOwnBreakPoints);

        layoutContainers.push(childContainer);
        layouts.push(childContainer.griddata);
    });

    return maxHeight;
};

let fixFixChild = (childContainer, parentSize, breakpointdata, hasOwnBreakPoints, parentGriddata) => {
    let maxHeight;
    let maxWidth;

    // fix constraints
    let constraints =
        getFromData(childContainer.griddata, "constraints", parentSize.x, hasOwnBreakPoints
            ,breakpointdata);

    let left = getPxFromPercent(constraints.left, parentSize.x);
    if (left)
        left += parentSize.scrollLeft;
    let top = getPxFromPercent(constraints.top, parentSize.y);
    if (top)
        top += parentSize.scrollTop;
    let right = getPxFromPercent(constraints.right, parentSize.x);
    if (right)
        right += (parentSize.x - parentSize.clientWidth - parentSize.scrollLeft);
    let bottom = getPxFromPercent(constraints.bottom, parentSize.y);
    if (bottom)
        bottom += (parentSize.y - parentSize.clientHeight - parentSize.scrollTop);

    let minW =
        getFromData(childContainer.griddata, "minW"
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    let minH =
        getFromData(childContainer.griddata, "minH"
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    let maxW =
        getFromData(childContainer.griddata, "maxW"
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    let maxH =
        getFromData(childContainer.griddata, "maxH"
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);

    if (right !== undefined && left !== undefined) {
        // ignore w value and calculate from remain space
        childContainer.w = parentSize.x - left - right;
        childContainer.x = left + childContainer.w / 2;
    }
    if (bottom !== undefined && top !== undefined) {
        // ignore h value and calculate from remain space
        childContainer.h = parentSize.y - top - bottom;
        childContainer.y = top + childContainer.h / 2;
    }
    if (right !== undefined && left === undefined) {
        // use w to calculate x. w must have value in this situation
        childContainer.x = parentSize.x - childContainer.w / 2 - right;
    }
    if (bottom !== undefined && top === undefined) {
        // use h to calculate y. h must have value in this situation
        childContainer.y = parentSize.y - childContainer.h / 2 - bottom;
    }

    if (right === undefined) {
        if (left !== undefined)
            childContainer.x = left + childContainer.w / 2;
    }

    if (bottom === undefined) {
        if (top !== undefined)
            childContainer.y = top + childContainer.h / 2;
    }

    if (minW) {
        childContainer.w = Math.max(minW, childContainer.w);
    }
    if (maxW) {
        childContainer.w = Math.min(maxW, childContainer.w);
    }
    if (minH) {
        childContainer.h = Math.max(minH, childContainer.h);
    }
    if (maxH) {
        childContainer.h= Math.min(maxH, childContainer.h);
    }

    maxWidth = childContainer.x + childContainer.w / 2 + right;
    maxHeight = childContainer.y + childContainer.h / 2 + bottom;
    return {maxHeight: maxHeight, maxWidth: maxWidth};
};

let fixAbsoluteChild = (childContainer, parentSize, breakpointdata, hasOwnBreakPoints, parentGriddata) => {
    let maxHeight;
    let maxWidth;

    // fix constraints
    let constraints =
        getFromData(childContainer.griddata, "constraints", parentSize.x, hasOwnBreakPoints
            ,breakpointdata);

    let left = getPxFromPercent(constraints.left, parentSize.x);
    let top = getPxFromPercent(constraints.top, parentSize.y);
    let right = getPxFromPercent(constraints.right, parentSize.x);
    let bottom = getPxFromPercent(constraints.bottom, parentSize.y);

    let minW =
        getFromData(childContainer.griddata, "minW"
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    let minH =
        getFromData(childContainer.griddata, "minH"
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    let maxW =
        getFromData(childContainer.griddata, "maxW"
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    let maxH =
        getFromData(childContainer.griddata, "maxH"
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);

    if (right !== undefined && left !== undefined) {
        // ignore w value and calculate from remain space
        childContainer.w = parentSize.x - left - right;
        childContainer.x = left + childContainer.w / 2;
    }
    if (bottom !== undefined && top !== undefined) {
        // ignore h value and calculate from remain space
        childContainer.h = parentSize.y - top - bottom;
        childContainer.y = top + childContainer.h / 2;
    }
    if (right !== undefined && left === undefined) {
        // use w to calculate x. w must have value in this situation
        childContainer.x = parentSize.x - childContainer.w / 2 - right;
    }
    if (bottom !== undefined && top === undefined) {
        // use h to calculate y. h must have value in this situation
        childContainer.y = parentSize.y - childContainer.h / 2 - bottom;
    }

    if (right === undefined) {
        if (left !== undefined)
            childContainer.x = left + childContainer.w / 2;
    }

    if (bottom === undefined) {
        if (top !== undefined)
            childContainer.y = top + childContainer.h / 2;
    }

    if (minW) {
        childContainer.w = Math.max(minW, childContainer.w);
    }
    if (maxW) {
        childContainer.w = Math.min(maxW, childContainer.w);
    }
    if (minH) {
        childContainer.h = Math.max(minH, childContainer.h);
    }
    if (maxH) {
        childContainer.h= Math.min(maxH, childContainer.h);
    }

    maxWidth = childContainer.x + childContainer.w / 2 + right;
    maxHeight = childContainer.y + childContainer.h / 2 + bottom;
    return {maxHeight: maxHeight, maxWidth: maxWidth};
};

let scatterFree = (childContainer, childContainers, layoutContainers, parentSize, compactType, scrollType
                   , snap, maxHeight, breakpointdata, hasOwnBreakPoints, parentGriddata) => {
    let autoWidth =
        getFromData(parentGriddata, "autoWidth", parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    if (!autoWidth) {
        if (childContainer.x + childContainer.w > parentSize.x) {
            childContainer.x = parentSize.x - childContainer.w;
        }
    }

    if (compactType === "horizontal") {
        childContainer.y = Math.min(bottom(layoutContainers), childContainer.y);
        while (childContainer.x > 0 && !checkCollide(childContainer, layoutContainers)) {
            childContainer.x -= snap.x;
        }
    }
    if (compactType === "vertical")
    {
        childContainer.y = Math.min(bottom(layoutContainers), childContainer.y);
        while (childContainer.y > 0 && !checkCollide(childContainer, layoutContainers)) {
            childContainer.y -= snap.y;
        }
    }

    childContainer.x = Math.max(0, childContainer.x);
    childContainer.y = Math.max(0, childContainer.y);

    let collide;
    while (checkCollide(childContainer, layoutContainers)) {
        collide = checkCollide(childContainer, layoutContainers);
        if (compactType === "horizontal") {
            resolveCompactionCollision(childContainers, childContainer, collide.x + collide.w, "x");
        }
        if (compactType === "vertical") {
            resolveCompactionCollision(childContainers, childContainer, collide.y + collide.h, "y");
        }
        // Since we can't grow without bounds horizontally, if we've overflown, let's move it down and try again.
        if ((compactType === "horizontal") &&
            childContainer.x + childContainer.w > parentSize.x) {
            childContainer.x = parentSize.x - childContainer.w;
            childContainer.y++;
        }
    }

    if (childContainer.y + childContainer.h > maxHeight)
        maxHeight = childContainer.y + childContainer.h;

    return maxHeight;
};

const heightWidth = { x: "w", y: "h" };
let resolveCompactionCollision = (layout, item, moveToCoord, axis) => {
    const sizeProp = heightWidth[axis];
    item[axis] += 1;
    const itemIndex = layout
        .map(layoutItem => {
            return layoutItem.griddata.id;
        })
        .indexOf(item.griddata.id);

    // Go through each item we collide with.
    for (let i = itemIndex + 1; i < layout.length; i++) {
        const otherItem = layout[i];
        // Ignore static items
        if (otherItem.static || otherItem.griddata.dragging) continue;

        // Optimization: we can break early if we know we're past this el
        // We can do this b/c it's a sorted layout
        if (otherItem.y > item.y + item.h) break;

        if (collide(item, otherItem)) {
            resolveCompactionCollision(
                layout,
                otherItem,
                moveToCoord + item[sizeProp],
                axis
            );
        }
    }

    item[axis] = moveToCoord;
};

let bottom = (layoutContainers) => {
    let max = 0,
        bottomY;
    for (let i = 0, len = layoutContainers.length; i < len; i++) {
        bottomY = layoutContainers[i].y + layoutContainers[i].h;
        if (bottomY > max) max = bottomY;
    }
    return max;
};

let checkCollide = (childContainer, layoutContainers) => {
    for (let i = 0; i < layoutContainers.length; i++) {
        if (collide(childContainer, layoutContainers[i]))
            return layoutContainers[i];
    }
    return false;
};

let collide = (child1, child2) => {
    if (child1.griddata.id === child2.griddata.id) return false; // same element
    if (child1.x + child1.w <= child2.x) return false; // l1 is left of l2
    if (child1.x >= child2.x + child2.w) return false; // l1 is right of l2
    if (child1.y + child1.h <= child2.y) return false; // l1 is above l2
    if (child1.y >= child2.y + child2.h) return false; // l1 is below l2
    return true; // boxes overlap
};

let sortChilds = (childContainers, parentSize, compactType, breakpointdata, hasOwnBreakPoints) => {
    childContainers.forEach(childContainer => {
            childContainer.x = getPxFromPercent(
                getFromData(childContainer.griddata, "x", parentSize.x, hasOwnBreakPoints
                    ,breakpointdata)
                ,  parentSize.x);
            childContainer.y = getPxFromPercent(
                getFromData(childContainer.griddata, "y", parentSize.x, hasOwnBreakPoints
                    ,breakpointdata)
                ,  parentSize.y);
    });

    if (compactType === "horizontal") {
        childContainers.sort((a, b) => {
            if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
                return 1;
            } else if (a.y === b.y && a.x === b.x) {
                // Without this, we can get different sort results in IE vs. Chrome/FF
                return 0;
            }
            return -1;
        });
    } else {
        childContainers.sort((a, b) => {
            if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
                return 1;
            } else if (a.y === b.y && a.x === b.x) {
                // Without this, we can get different sort results in IE vs. Chrome/FF
                return 0;
            }
            return -1;
        });
    }
};

let getPxFromPercent = (val, parentVal) => {
    if (typeof(val) === "string") {
        if (getUnit(val) === "%") {
            let percent = parseFloat(val.replace("%", "")) / 100;
            return parentVal * percent;
        }
        return val;
    } else {
        return val;
    }
};

let getUnit = (val) => {
    if (typeof(val) === "string") {
        if (val.includes("%"))
            return "%";
    }
    return "";
};

let hasDir = (dir, target) => {
    return dir.toLowerCase().includes(target);
};

let setChildSize = (childContainer, newSize, parentSize, breakpointdata, hasOwnBreakPoints
                    , dir, delta) => {
    setData(childContainer.griddata, "w", newSize.w, parentSize.x, hasOwnBreakPoints
        ,breakpointdata);
    if (getFromData(childContainer.griddata, "units.w", parentSize.x, hasOwnBreakPoints
        ,breakpointdata)) {
        setData(childContainer.griddata, "w",
            (getFromData(childContainer.griddata, "w", parentSize.x
                , hasOwnBreakPoints
                ,breakpointdata) / parentSize.x * 100)
            + getFromData(childContainer.griddata, "units.w", parentSize.x
            , hasOwnBreakPoints
            ,breakpointdata)
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    }

    setData(childContainer.griddata, "h", newSize.h, parentSize.x, hasOwnBreakPoints
        ,breakpointdata);
    if (getFromData(childContainer.griddata, "units.h", parentSize.x, hasOwnBreakPoints
        ,breakpointdata)) {
        setData(childContainer.griddata, "h",
            (getFromData(childContainer.griddata, "h", parentSize.x
                , hasOwnBreakPoints
                ,breakpointdata) / parentSize.y * 100)
            + getFromData(childContainer.griddata, "units.h", parentSize.x
            , hasOwnBreakPoints
            ,breakpointdata)
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    }

    if (delta) {
        if (hasDir(dir, "right") || hasDir(dir, "left")) {
            let x = getPxFromPercent(
                getFromData(childContainer.griddata, "x", parentSize.x, hasOwnBreakPoints
                    ,breakpointdata)
                , parentSize.x);
            if (hasDir(dir, "right"))
                x = x + delta.width / 2;
            else
                x = x - delta.width / 2;
            let y = getPxFromPercent(
                getFromData(childContainer.griddata, "y", parentSize.x, hasOwnBreakPoints
                    ,breakpointdata)
                , parentSize.y);

            setChildPosition(childContainer, {x: x, y: y}, parentSize, breakpointdata, hasOwnBreakPoints)
        }
        if (hasDir(dir, "top") || hasDir(dir, "bottom")) {
            let x = getPxFromPercent(
                getFromData(childContainer.griddata, "x", parentSize.x, hasOwnBreakPoints
                    ,breakpointdata)
                , parentSize.x);
            let y = getPxFromPercent(
                getFromData(childContainer.griddata, "y", parentSize.x, hasOwnBreakPoints
                    ,breakpointdata)
                , parentSize.y);
            if (hasDir(dir, "bottom"))
                y = y + delta.height / 2;
            else
                y = y - delta.height / 2;

            setChildPosition(childContainer, {x: x, y: y}, parentSize, breakpointdata, hasOwnBreakPoints)
        }
    }
};

let setChildPosition = (childContainer, newPosition, parentSize, breakpointdata, hasOwnBreakPoints) => {
    setData(childContainer.griddata, "x", newPosition.x, parentSize.x
        , hasOwnBreakPoints
        ,breakpointdata);
    if (getFromData(childContainer.griddata, "units.x", parentSize.x, hasOwnBreakPoints
        ,breakpointdata)) {
        setData(childContainer.griddata, "x",
            (getFromData(childContainer.griddata, "x", parentSize.x
                , hasOwnBreakPoints
                ,breakpointdata) / parentSize.x * 100)
            + getFromData(childContainer.griddata, "units.x", parentSize.x
            , hasOwnBreakPoints
            ,breakpointdata)
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    }

    setData(childContainer.griddata, "y", newPosition.y, parentSize.x
        , hasOwnBreakPoints
        ,breakpointdata);
    if (getFromData(childContainer.griddata, "units.y", parentSize.x, hasOwnBreakPoints
        ,breakpointdata)) {
        setData(childContainer.griddata, "y",
            (getFromData(childContainer.griddata, "y", parentSize.x
                , hasOwnBreakPoints
                ,breakpointdata) / parentSize.y * 100)
            + getFromData(childContainer.griddata, "units.y", parentSize.x
            , hasOwnBreakPoints
            ,breakpointdata)
            , parentSize.x, hasOwnBreakPoints
            ,breakpointdata);
    }
};

/*let updateConstraints = (childContainer, newPosition, parentSize, breakpointdata, hasOwnBreakPoints
                        , parentGridSystem) =>
{
    if (!parentGridSystem)
        parentGridSystem = getDefaultGridSystem();
};*/

/*let getDefaultGridSystem = () => {
    return {
        xNumber: 1,
        yNumber: 1,
        widths: [100],
        widthUnits: ["%"],
        heights: [100],
        heightUnits: ["%"]
    }
};*/

let fixGriddata = (griddata, breakpointdata) => {
    if (!griddata)
        return;

    if (griddata.initialized) {
        let sortedBreakPoints = getSortedBreakPoints(breakpointdata);
        for(let i = 0; i < sortedBreakPoints.length; i++) {
            let name = sortedBreakPoints[i].name;

            if (!griddata[name])
                continue;

            if (!griddata[name].units)
                griddata[name].units = {};

            griddata[name].units.x = getUnit(griddata[name].x);
            griddata[name].units.y = getUnit(griddata[name].y);
            griddata[name].units.w = getUnit(griddata[name].w);
            griddata[name].units.h = getUnit(griddata[name].h);
        }
    } else {
        if (!griddata.units)
            griddata.units = {};

        griddata.units.x = getUnit(griddata.x);
        griddata.units.y = getUnit(griddata.y);
        griddata.units.w = getUnit(griddata.w);
        griddata.units.h = getUnit(griddata.h);

    }
};

let initGriddata = (griddataProp, breakpointdata) => {
    if (griddataProp && griddataProp.initialized)
        return griddataProp;

    if (!griddataProp)
        griddataProp = {};

    let clone = cloneObject(griddataProp);

    for (let props in griddataProp) delete griddataProp[props];

    let griddata = getDefaultChildgriddata(breakpointdata);
    if (clone.bpData) {
        for (let props in griddata.bpData) {
            if (exist(props, breakpointdata)) {
                    for(let props2 in clone.bpData) {
                        griddata.bpData[props][props2] = cloneObject(clone.bpData[props2]);
                    }
            }
        }
    }
    for (let prop in clone) {
        if (clone.hasOwnProperty(prop) && prop !== "bpData") {
            griddata[prop] = clone[prop];
        }
    }

    for(let k in griddata) griddataProp[k]=griddata[k];

    return griddataProp;
};

let getDefaultChildgriddata = (breakpointdata) => {
    let sample = {
        x: "50%",
        y: "50%",
        w: "100%",
        h: "100%",
        minW: undefined,
        maxW: undefined,
        minH: undefined,
        maxH: undefined,
        constraints: {
            left: undefined,
            top: undefined,
            right: undefined,
            bottom: undefined,
        },
        margin: {
            all: undefined,
            left: undefined,
            top: undefined,
            right: undefined,
            bottom: undefined
        },
        units: {
            x: "%",
            y: "%",
            w: "%",
            h: "%",
        },
        scrollType: "vertical",
        absolute: true,
        fix: false,
        autoHeight: false,
        autoWidth: false,
        overflowData: {
            state: 'hide',
            overflowY: 'scroll'
        },
    };
    let griddata = {
        initialized: true,
        resizable: true,
        draggable: true,
        hasOwnBreakPoints: false,
        isContainer: false,
        autoDock: true,
        bpData: {}
    };
    let sortedBreakPoints = getSortedBreakPoints(breakpointdata);
    griddata.bpData[sortedBreakPoints[0].name] = cloneObject(sample);
    return griddata;
};

let cloneObject = (obj) => {
    if (obj instanceof Array) {
        let copy = [];
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = cloneObject(obj[i]);
        }
        return copy;
    }
    if (obj instanceof Object) {
        if (null == obj) return obj;
        let copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = cloneObject(obj[attr]);
            }
        }
        return copy;
    }

    return obj;
};

let shallowEqual = (objA, objB) => {
    if (objA === objB) {
        return true;
    }

    if (typeof objA !== 'object' || objA === null ||
        typeof objB !== 'object' || objB === null) {
        return false;
    }

    let keysA = Object.keys(objA);
    let keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    // Test for A's keys different from B.
    for (let i = 0; i < keysA.length; i++) {
        if (!objB.hasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
            return false;
        }
    }

    return true;
};

function throttleDebounce(fn, ms) {
    let deTimer;
    let dontCall;

    return _ => {
        let args = arguments;

        if (!dontCall) {
            dontCall = true;
            fn.apply(this, args);
            setTimeout(_ => {
                dontCall = false;
            }, ms);
        }

        clearTimeout(deTimer);
        deTimer = setTimeout(_ => {
            fn.apply(this, args);
        }, ms);
    };
}

function throttleDebounce2(fn, threshold) {
    threshold = threshold || 250;
    let last, deferTimer;

    let db = debounce(fn);
    return function() {
        let now = +new Date, args = arguments;
        if(!last || (last && now < last + threshold)) {
            clearTimeout(deferTimer);
            db.apply(this, args);
            deferTimer = setTimeout(function() {
                last = now;
                fn.apply(this, args);
            }, threshold);
        } else {
            last = now;
            fn.apply(this, args);
        }
    }
}

let getOverFlow = (griddata, parent, breakpointdata) => {
    if (!griddata)
        return {x:"hidden", y:"hidden"};
    let parentSizeX;
    if (parent)
        parentSizeX = parent.getSize().x;

    let scrollType;
    if (parentSizeX) {
        scrollType = getFromData(griddata, "scrollType", parentSizeX
                , griddata? griddata.hasOwnBreakPoints: false, breakpointdata);
    } else {
        scrollType = getFromData(griddata, "scrollType", 0
                , false, breakpointdata);
    }
    switch (scrollType) {
        case "hide":
            return {x:"hidden", y:"hidden"};
        case "show":
            return {x:"visible", y:"visible"};
        case "horizontal":
            return {x:"overlay", y:"hidden"};
        case "vertical":
            return {x:"hidden", y:"overlay"};
        case "both":
            return {x:"overlay", y:"overlay"};
        default:
            return {x:"visible", y:"visible"};
    }
};

let scrollbarWidth = false;
let getScrollbarWidth = () => {
    if (scrollbarWidth !== false) return scrollbarWidth;
    /* istanbul ignore else */
    if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        css(div, {
            width: 100,
            height: 100,
            position: 'absolute',
            top: -9999,
            overflow: 'scroll',
            MsOverflowStyle: 'scrollbar'
        });
        document.body.appendChild(div);
        scrollbarWidth = (div.offsetWidth - div.clientWidth);
        document.body.removeChild(div);
    } else {
        scrollbarWidth = 0;
    }
    return scrollbarWidth || 0;
};

export let assignData = (griddata, newData) => {
    if (!griddata)
        griddata = {};
    return Object.assign(griddata, newData || {})
};

export function getOffsetLeft( elem )
{
    let offsetLeft = 0;
    do {
        let elemOffsetLeft = elem.offsetLeft;
        if ( !isNaN( elemOffsetLeft ) )
        {
            offsetLeft += elemOffsetLeft;
        }
    } while( elem = elem.offsetParent );
    return offsetLeft;
}

export function getOffsetTop( elem )
{
    let offsetTop = 0;
    do {
        let elemOffsetTop = elem.offsetTop;
        if ( !isNaN( elemOffsetTop ) )
        {
            offsetTop += elemOffsetTop;
        }
    } while( elem = elem.offsetParent );
    return offsetTop;
}


export function JSToCSS(JS){
    let cssString = "";
    for (let objectKey in JS) {
        cssString += objectKey.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`) + ": " + JS[objectKey] + "; ";
    }
    return cssString;
};

export function updateStyle(styleNode, style, styleName){
    let css = `
            .${styleName} {${
        JSToCSS(style)
        }}
            `;

    styleNode.innerHTML = "";
    if (styleNode.styleSheet) { // IE
        styleNode.styleSheet.cssText = css;
    } else {
        styleNode.appendChild(document.createTextNode(css));
    }
};

export function appendStyle(style, styleId, styleName){
    let css = `
            .${styleName} {${
        JSToCSS(style)
        }}
            `;
    let styleNode = document.createElement('style');
    styleNode.setAttribute("id", styleId);
    // styleNode.setAttribute("title", styleId);

    styleNode.type = 'text/css';

    if (styleNode.styleSheet) { // IE
        styleNode.styleSheet.cssText = css;
    } else {
        styleNode.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName('head')[0].appendChild(styleNode);
};

/*export function appendStyle(style, styleId, styleName){
    return StyleSheet.create({
        [styleId]: style
    })[styleId];
};

export function updateStyle(styleNode, style, styleName){
    return StyleSheet.create({
        [styleName]: style
    });
};*/

export function getScrollParent(node) {
    if (node == null) {
        return null;
    }

    if (node.scrollHeight > node.clientHeight) {
        return node;
    } else {
        return getScrollParent(node.parentNode);
    }
}

export function swapArrayElements(arr, indexA, indexB) {
    let temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
}

export {CalculateLayout, cloneObject, getPxFromPercent, shallowEqual
        ,throttleDebounce, setChildSize, fixGriddata, setChildPosition
        ,getDefaultChildgriddata, initGriddata, getOverFlow, getScrollbarWidth, getDummy}

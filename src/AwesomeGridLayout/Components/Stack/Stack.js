import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";
import {isFixed, isStretch} from "../../AwesomwGridLayoutHelper";
import {appendStyle, cloneObject, updateStyle} from "../../AwesomeGridLayoutUtils";
import StackSpacerContainer from "./StackSpacerContainer";
import StackSpacer from "./StackSpacer";

export default class Stack extends AGLComponent{
    constructor(props) {
        super(props);

        this.state = {
            spacers: []
        };
        this.aglRef = React.createRef();
        this.spacerContainerRef = React.createRef();

        if (props.allSpacerData)
            this.allSpacerData = props.allSpacerData;
    }

    getDefaultData = () => {
        return {
            isContainer: true
        };
    };

    getChildrenOverride = (sortedChildrenArray, agl) => { // [{child: child, zIndex: zIndex}], agl
        return sortedChildrenArray.map((child, index) => {
            return child.child;
        });
    };

    lateMountedOverride = (agl) => {
        agl.invalidateSize();
        agl.addToSnap();
        agl.onSelect(agl.getFromTempData("selected"));

        if (agl.props.onPageResize) {
            let rect = agl.getSize(false, true);
            agl.props.onPageResize(rect.width, agl, true);
        }

        agl.props.onChildMounted && agl.props.onChildMounted(agl);
        if (this.props.lateMountedComplete)
            this.props.lateMountedComplete(this);

        this.setOrder();
    };

    calculateGridItemChildOverride = (child, relativeX, relativeY, parent, width, height, parentRect, fromState) =>
    {
        return this.calculateWrapper(child, relativeX, relativeY, parent, width, height, parentRect, fromState);
    };

    calculateChildGridItemOverride =
        (child1, child, relativeX, relativeY, parent, width, height, parentRect, fromState) =>
    {
        return this.calculateWrapper(child, relativeX, relativeY, parent, width, height, parentRect, fromState);
    };

    calculateWrapper = (child, relativeX, relativeY, parent, width, height, parentRect, fromState) => {
        if (!width) {
            let rect = child.getSize(false, true);
            width = rect.width;
            height = rect.height;
        }

        if (!parentRect)
            parentRect = parent.getSize(false, true);

        let {gridArea, coordinates} = child.calculateGridArea(
            parentRect.left + relativeX,
            parentRect.top + relativeY,
            width,
            height,
            parent,
            parentRect
        );

        if (isFixed(child)) {
            gridArea = {x1: 1, x2: 2, y1: 1, y2: 2};
            coordinates = {
                cy1: parentRect.top,
                cy2: parentRect.top + parentRect.clientHeight,
                cx1: parentRect.left,
                cx2: parentRect.left + parentRect.clientWidth
            }
        }

        let coordinatesAbs = cloneObject(coordinates);

        child.coordinateToRelative(coordinates, parentRect);

        let gridItemStyle = {...(child.state.gridItemStyle || child.props.defaultGridItemStyle)};
        delete gridItemStyle.marginLeft;
        delete gridItemStyle.marginRight;

        gridItemStyle.gridArea = `${gridArea.y1}/${gridArea.x1}/${gridArea.y2}/${gridArea.x2}`;

        let centerX = (relativeX  - coordinates.cx1) + width / 2;

        let parentCenterMinusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 - 0.1);
        let parentCenterPlusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 + 0.1);

        let yLineRef = child.props.gridLine.getYlineRef(parent.props.id);
        let cy2IsLastLine = gridArea.y2 === yLineRef.length || isFixed(child);

        if (gridItemStyle.justifySelf !== "stretch") {
            if (centerX < parentCenterPlusX && centerX > parentCenterMinusX) {
                // child is center
                let centerDiff = (centerX - (coordinates.cx2 - coordinates.cx1) / 2);
                gridItemStyle.alignSelf = "center";
                gridItemStyle.marginRight = `0${child.getUnit(gridItemStyle.marginRight)}`;
                gridItemStyle.marginLeft =
                    `${(centerDiff * 2).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginLeft)}`;
            } else if (centerX > parentCenterPlusX) {
                gridItemStyle.alignSelf = "flex-end";
                gridItemStyle.marginRight =
                    `${(coordinates.cx2 - (relativeX + width)).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginRight)}`;
                gridItemStyle.marginLeft = `0${child.getUnit(gridItemStyle.marginLeft)}`;
            } else {
                gridItemStyle.alignSelf = "flex-start";
                gridItemStyle.marginRight = `0${child.getUnit(gridItemStyle.marginRight)}`;
                gridItemStyle.marginLeft =
                    `${(relativeX - coordinates.cx1).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginLeft)}`;
            }

            // if (cy2IsLastLine && (relativeY + height >= coordinates.cy2)) {
            // gridItemStyle.alignSelf = "end";
            // gridItemStyle.marginBottom =
            //     `${(coordinates.cy2 - relativeY - height).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginBottom)}`;
            // gridItemStyle.marginTop =`0${child.getUnit(gridItemStyle.marginBottom)}`;
            // } else {
            // gridItemStyle.alignSelf = "start";
            // gridItemStyle.marginBottom = `0${child.getUnit(gridItemStyle.marginBottom)}`;
            // gridItemStyle.marginTop =
            //     `${(relativeY - coordinates.cy1).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginTop)}`;
            // }
        } else {
            gridItemStyle.marginRight =
                `${(coordinates.cx2 - (relativeX + width)).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginRight)}`;
            gridItemStyle.marginLeft =
                `${(relativeX - coordinates.cx1).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginLeft)}`;

            // gridItemStyle.marginBottom =
            //     `${(coordinates.cy2 - relativeY - height).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginBottom)}`;
            // gridItemStyle.marginTop =
            //     `${(relativeY - coordinates.cy1).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginTop)}`;
        }

        delete gridItemStyle.justifySelf;
        delete gridItemStyle.marginTop;
        delete gridItemStyle.marginBottom;
        delete gridItemStyle.gridArea;

        child.setDataInBreakpoint("relativeY", relativeY);

        this.setOrder(child.props.id, child, relativeY, height, fromState);

        child.setStyleParam("height", "auto");

        return {gridItemStyle, gridArea, coordinates, coordinatesAbs};
    };

    setOrder = (childId, child, childRelativeY, childHeight, fromState) => {
        let childFound = false;
        let childOrderSet = false;
        let sorted = Object.values(this.aglRef.current.allChildRefs).sort((a,b) => {
            if (a && a.current && b && b.current){
                if (a.current.props.id === childId || b.current.props.id === childId)
                    childFound = true;

                let relativeYA = a.current.getFromData("relativeY");
                let relativeYB = b.current.getFromData("relativeY");
                if (relativeYA < relativeYB) {
                    return -1;
                } else if (relativeYA === relativeYB) {
                    // Without this, we can get different sort results in IE vs. Chrome/FF
                    if (childId === a.current.props.id)
                        return -1;
                    else if (childId === b.current.props.id)
                        return 1;
                    else
                        return 0;
                }
                return 1;
            } else {
                return 0;
            }
        });

        let order = 1;
        let relativeY = 0;
        let spacers = [];
        let length = sorted.filter(childRef => {
            return (childRef && childRef.current);
        }).length;

        sorted.forEach((childRef, index) => {
            if (childRef && childRef.current) {
                if (childRelativeY && !childFound) {
                    let relativeY2 = childRef.current.getFromData("relativeY");
                    if (!childOrderSet && relativeY2 > childRelativeY) {
                        childOrderSet = true;
                        child.setStyleParam("order", order);
                        child.setDataInBreakpoint("order", order);
                        order++;
                    }
                }
                childRef.current.setStyleParam("order", order);
                childRef.current.setDataInBreakpoint("order", order);
                childRef.current.setDataInBreakpoint("relativeY", relativeY);
                let size = childRef.current.getSize(false);
                relativeY += size.height;

                if (childId === childRef.current.props.id) {
                    childOrderSet = true;
                }
                order++;

                if (length > index + 1) {
                    spacers[index] = this.getSpacer(index, order);
                    relativeY+= this.getSpacerData(index).height;
                    order++;
                }
            }
        });

        if (child && !childOrderSet) {
            childOrderSet = true;
            child.setStyleParam("order", order);
            child.setDataInBreakpoint("order", order);
            order++;
        }

        this.spacerContainerRef.current.updateSpacers(spacers);
        setTimeout(() => {
            this.props.select.updateSize();
        }, 0);
    };

    getSpacer = (index, order) => {
        if (!this.allSpacerData) {
            this.allSpacerData = [];
        }
        if (!this.allSpacerRef) {
            this.allSpacerRef = [];
        }

        if (!this.allSpacerData[index]) {
            this.allSpacerData[index] = {
                height: 20
            };
        }

        if (!this.allSpacerRef[index]) {
            this.allSpacerRef[index] = React.createRef();
        }

        return <StackSpacer
            key={index}
            order={order}
            spacerData={this.allSpacerData[index]}
            ref={this.allSpacerRef[index]}
            aglRef={this.aglRef}
            onDragStart={this.onStackDragStart}
            onDragStop={this.onStackDragStop}
            stack={this}
            onMouseOver={this.onMouseOverSpacer}
            onMouseEnter={this.onMouseEnterSpacer}
            onMouseOut={this.onMouseOutSpacer}
        />;
    };

    onStackDragStart = (e) => {
        this.aglRef.current.setTempData("dontMove", true);
    };

    onStackDragStop = (e) => {
        this.aglRef.current.setTempData("dontMove", false);
    };

    getSpacerData = (index) => {
        if (!this.allSpacerData) {
            this.allSpacerData = [];
        }
        if (!this.allSpacerRef) {
            this.allSpacerRef = [];
        }

        if (!this.allSpacerData[index]) {
            this.allSpacerData[index] = {
                height: 20
            };
        }

        return this.allSpacerData[index];
    };

    setMouseOverOverride = (agl, item, positionData, callback) => {
        this.setPointerEventOfSpacers("none");
        return this.props.dragdrop.setMouseOver(item, positionData, callback);
    };

    setMouseOverForNonDraggingOverride = (agl) => {
        this.setPointerEventOfSpacers("auto");
        agl.props.dragdrop.setMouseOverForNonDragging(agl);
    };

    setPointerEventOfSpacers = (pointerEvents) => {
        if (!this.allSpacerRef)
            this.allSpacerRef = [];

        this.allSpacerRef.forEach((spacerRef) => {
            if (spacerRef && spacerRef.current)
                spacerRef.current.setPointerEvents(pointerEvents);
        })
    };

    setGridItemStyleChildOverride = (child, newGridItemStyle) => {
        let gridItemStyle = {...newGridItemStyle};
        delete gridItemStyle.gridArea;
        child.setDataInBreakpoint("gridItemStyle", gridItemStyle);
        let styleNode = document.getElementById(child.getGridItemStyleId());

        if (!styleNode) {
            appendStyle(gridItemStyle, child.getGridItemStyleId(), child.getGridItemStyleId(), this.getAgl());
        } else {
            updateStyle(styleNode, gridItemStyle, child.getGridItemStyleId());
        }
    };

    modifyContainerStyleOverride = (container, agl, grid, aglStyle) => {
        let style;

        style = {
            display: "flex",
            flexDirection: "column",
            position: "relative"
        };

        let styleNode = document.getElementById(container.getContainerStyleId());

        if (!styleNode) {
            appendStyle(style, container.getContainerStyleId(), container.getContainerStyleId(), this.getAgl());
        } else {
            updateStyle(styleNode, style, container.getContainerStyleId());
        }
    };

    onChildLeaveOverride = (agl, child) => {
        agl.removeChildElement(child);
        child.removeIdAndChildrenId();

        this.setOrder();

        if (!agl.removing && Object.values(agl.allChildRefs).length === 1) {
            agl.removing = true;
            setTimeout(() => {
                Object.values(agl.allChildRefs)[0] &&
                this.props.dragdrop.dropItem(
                    Object.values(agl.allChildRefs)[0].current,
                    Object.values(agl.allChildRefs)[0].current.props.parent,
                    this.props.parent, undefined, false, 2);
            }, 0);
        }
    };

    stretchChildOverride = (child, item) => {
        if (!item.props.parent)
            return;

        let stretch = false;
        let gridItemStyle = item.getFromData("gridItemStyle");


        if (!isStretch(item, true)) {
            stretch = true;
        }

        gridItemStyle.alignSelf = stretch? "stretch": "center";
        gridItemStyle.marginLeft = "0px";
        gridItemStyle.marginRight = "0px";
        item.setStyleParam("width", "100%");

        if (!stretch) {
            item.setStyleParam("width", "80%");
        }

        item.setGridItemStyle(gridItemStyle);
        item.props.select.onScrollItem();
    };

    isStretchChildOverride = (child, item, log) => {
        if (!item.props.parent)
            return false;

        let gridItemStyle = item.getFromData("gridItemStyle");

        return !(gridItemStyle.alignSelf !== "stretch" ||
            gridItemStyle.marginLeft !== "0px" ||
            gridItemStyle.marginRight !== "0px");
    };

    setStyleParamOverride = (agl, param, value, data) => {
        if (param === "height" || param === "minHeight")
            return;

        let style = !data? agl.getFromData("style"): agl.getFromData("style", data);
        style[param] = value;
        if (value === undefined)
            delete style[param];
        agl.setStyle(style, data);
    };

    onMouseOverSpacer = (e) => {
        this.aglRef.current.onMouseOver(e);
    };

    onMouseEnterSpacer = (e) => {
        this.aglRef.current.onMouseEnter(e);
    };

    onMouseOutSpacer = (e) => {
        this.aglRef.current.onMouseOut(e);
    };

    onChildAdd = () => {
        this.getAgl().removing = false;
    };

    render() {
        return [
            <AGLWrapper tagName="Stack"
                        key="Stack"
                        aglRef={!this.props.aglRef? this.aglRef: this.aglRef = this.props.aglRef}
                        {...this.props}
                        data={this.getData()}
                        style={{...{
                            height: "auto"
                        }, ...this.props.style}}
                        getChildrenOverride={this.getChildrenOverride}
                        isStack={true}
                        resizeSides={['e','w']}
                        onDragStartChildOverride={this.onDragStartChildOverride}
                        onDragChildOverride={this.onDragChildOverride}
                        onDragStopChildOverride={this.onDragStopChildOverride}
                        setGridItemStyleChildOverride={this.setGridItemStyleChildOverride}
                        calculateGridItemChildOverride={this.calculateGridItemChildOverride}
                        calculateChildGridItemOverride={this.calculateChildGridItemOverride}
                        modifyContainerStyleOverride={this.modifyContainerStyleOverride}
                        setMouseOverOverride={this.setMouseOverOverride}
                        setMouseOverForNonDraggingOverride={this.setMouseOverForNonDraggingOverride}
                        stretchChildOverride={this.stretchChildOverride}
                        isStretchChildOverride={this.isStretchChildOverride}
                        lateMountedOverride={this.lateMountedOverride}
                        setStyleParamOverride={this.setStyleParamOverride}
                        onChildLeaveOverride={this.onChildLeaveOverride}
                        onChildAdd={this.onChildAdd}

            >
            </AGLWrapper>,
            <StackSpacerContainer ref={this.spacerContainerRef} key="spacers"
                                  aglRef={this.aglRef}
                                  document={this.props.document}
            />
        ]
    }
}

import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";
import './Stack2.css';
import StackSpacer from "./StackSpacer";
import StackSpacerContainer from "./StackSpacerContainer";
import {EditorContext} from "../../Editor/EditorContext";
import {createStack2, getFromTempData, isStretch, removeStack, setTempData} from "../../AwesomwGridLayoutHelper";
import MenuButton from "../../Menus/MenuBase/MenuButton";
import TextDesign from "../Button/Menus/TextDesign";
import ButtonDesign from "../Button/Menus/ButtonDesign";
import AnimationDesign from "../Containers/Menus/AnimationDesign";

export default class Stack2 extends AGLComponent{
    static contextType = EditorContext;
    constructor(props) {
        super(props);

        this.state = {
        };

        this.spacerContainerRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.allSpacerData)
            this.setSpacers(this.props.allSpacerData);
    }

    getDefaultData = () => {
        return {
            isContainer: true,
            containerStyle: {
                display: "flex",
                flexDirection: "column",
                position: "relative",
            },
            customStyle: {
                height: "auto",
            },
            bpData: {
                overflowData: {
                    state: "show"
                }
            }
        };
    };

    getPrimaryOptions = () => {
        return [
            <MenuButton
                key={0}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/unstackwhite.svg')} /> }
                select={this}
                title={"Unstack"}
                onClick={(e) => {
                    let childIds = Object.values(this.aglRef.current.allChildRefs).map(child => {
                        if (child && child.current) {
                            return child.current.props.id;
                        } else {
                            return null;
                        }
                    }).filter(id => id !== null);
                    removeStack(this, childIds);
                }}
            />
        ]
    };

    calculateChildGridItemPost = (agl, child, relativeX, relativeY, parent, width, height, parentRect, fromState, dontAutoDock, result) => {
        if (result.gridItemStyle.justifySelf === "end") result.gridItemStyle.alignSelf = "flex-end";
        if (result.gridItemStyle.justifySelf === "start") result.gridItemStyle.alignSelf = "flex-start";
        if (result.gridItemStyle.justifySelf === "center") result.gridItemStyle.alignSelf = "center";

        let stackWidth = this.getAgl().getSize(true, true, true).width;
        if (stackWidth < width) {
            let parentSize = this.getAgl().props.parent.getSize(false);
            this.getAgl().setProps("width", width, {
                cx1: 0,
                cx2: parentSize.width,
                cy1: 0,
                cy2: parentSize.height
            })
        }

        this.resolveOrders(child, result.gridItemStyle, relativeY, width, height);

        result.gridItemStyle.marginTop = "unset";
        result.gridItemStyle.marginBottom = "unset";
    }

    getSpacer = (index, order) => {
        if (!this.getSpacers()) {
            this.setSpacers([]);
        }
        let allSpacers = this.getSpacers();

        if (!this.allSpacerRef) {
            this.allSpacerRef = [];
        }

        if (!allSpacers[index]) {
            allSpacers[index] = {
                height: 20
            };
            this.setSpacers(allSpacers);
        }

        if (!this.allSpacerRef[index]) {
            this.allSpacerRef[index] = React.createRef();
        }

        return <StackSpacer
            key={index}
            stackId={this.props.id}
            index={index}
            idMan={this.context.editor.idMan}
            undoredo={this.context.editor.undoredo}
            order={order}
            spacerData={allSpacers[index]}
            ref={this.allSpacerRef[index]}
            aglRef={this.aglRef}
            onDragStart={this.onStackDragStart}
            onDragStop={this.onStackDragStop}
            onSpacerUpdate={this.onSpacerUpdate}
            stack={this}
            onMouseOver={this.onMouseOverSpacer}
            onMouseEnter={this.onMouseEnterSpacer}
            onMouseOut={this.onMouseOutSpacer}
        />;
    };

    setSpacers = (allSpacerData) => {
        this.getAgl().setDataInBreakpoint("spacerData", allSpacerData);
    }

    onSpacerUpdate = (spacerData, index) => {
        let allSpacers = this.getSpacers();
        if (!allSpacers[index])
            return;

        allSpacers[index] = spacerData;

        this.setSpacers(allSpacers);
    }

    getSpacerData = (index) => {
        if (!this.getSpacers()) {
            this.setSpacers([]);
        }

        let allSpacers = this.getSpacers();

        if (!this.allSpacerRef) {
            this.allSpacerRef = [];
        }

        if (!allSpacers[index]) {
            allSpacers[index] = {
                height: 20
            };
            this.setSpacers(allSpacers);
        }

        return allSpacers[index];
    };

    getSpacers = () => {
        return this.getAgl().getCompositeFromData("spacerData");
    };

    resolveOrders = (child, gridItemStyle, relativeY, width, height) => {
        let sorted = Object.values(this.aglRef.current.allChildRefs).sort((a,b) => {
            if (a && a.current && b && b.current)
            {
                let relativeYA = a.current.getFromData("relativeY");
                let relativeYB = b.current.getFromData("relativeY");
                let pure = false;
                if (relativeYA === undefined || relativeYB === undefined) {
                    relativeYA = a.current.getSize(false, true).top;
                    relativeYB = b.current.getSize(false, true).top;
                    pure = true;
                }

                if (!pure) {
                    if (child && child.props.id === a.current.props.id && child.state.dragging)
                        relativeYA = relativeY;
                    if (child && child.props.id === b.current.props.id && child.state.dragging)
                        relativeYB = relativeY;
                }

                if (relativeYA < relativeYB) {
                    return -1;
                } else if (relativeYA === relativeYB) {
                    // Without this, we can get different sort results in IE vs. Chrome/FF
                    return 0;
                }
                return 1;
            } else {
                return 0;
            }
        });

        let order = 1;
        let relY = 0;
        let spacers = [];
        let length = sorted.filter(childRef => {
            return (childRef && childRef.current);
        }).length;

        let dummy;
        sorted.forEach((childRef, index) => {
            if (childRef && childRef.current) {
                childRef.current.setStyleParam("order", order);
                childRef.current.setDataInBreakpoint("order", order);

                if (child && childRef.current.props.id === child.props.id && child.state.dragging) {
                    childRef.current.setDataInBreakpoint("relativeY", relativeY);
                    dummy = {
                        style: childRef.current.getCompositeFromData("style"),
                        gridItemStyle: childRef.current.getCompositeFromData("gridItemStyle"),
                        size: {
                            width: `${width}px`, height: `${height}px`
                        }
                    }
                    relY += height;
                } else {
                    childRef.current.setDataInBreakpoint("relativeY", relY);
                    let size;
                    size = childRef.current.getSize(false);
                    relY += size.height;
                }

                order++;

                if (length > index + 1) {
                    spacers[index] = this.getSpacer(index, order);
                    relY+= this.getSpacerData(index).height;
                    order++;
                }
            }
        });

        this.spacerContainerRef.current.updateSpacers(spacers);
        this.spacerContainerRef.current.updateDummy(dummy);
        setTimeout(() => {
            this.props.select.updateSize();
        }, 0);
    }

    onMouseOverSpacer = (e) => {
        this.aglRef.current.onMouseOver(e);
    };

    onMouseEnterSpacer = (e) => {
        this.aglRef.current.onMouseEnter(e);
    };

    onMouseOutSpacer = (e) => {
        console.log("onMouseOutSpacer");
        this.aglRef.current.onMouseOut(e);
    };

    onMouseOver = (e) => {
        this.aglRef.current.onMouseOver(e);
    };

    onMouseOut = (e) => {
        console.log("onMouseOut");
        this.aglRef.current.onMouseOut(e);
    };

    onChildDragStartOverride = (agl, child, e, group, callGroup) => {
        // window.requestAnimationFrame(() => {
        console.log("onChildDragStartOverride");
        this.onMouseOver(e);
        this.spacerContainerRef.current.updateDummy({
            style: child.getCompositeFromData("style"),
            gridItemStyle: child.getCompositeFromData("gridItemStyle"),
            size: {
                width: `${child.getSize().width}px`, height: `${child.getSize().height}px`
            }
        });
        // })
    }

    onChildDragOverride = (agl, child, e, group, callGroup) => {
        // window.requestAnimationFrame(() => {
        console.log("onChildDragOverride");
        this.onMouseOver(e);
        // })
    }

    getStaticChildren = () => {
        return (
            <div
                className="StackBorder"
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
                style={{
                }}
            >
            </div>
        )
    }

    onChildLeavePost = (agl, child) => {
        this.resolveOrders();
    };

    lateMountedPost = (agl) => {
        this.resolveOrders();
    };

    removeChildElementPost = (agl, childElement) => {
        this.resolveOrders();
    }

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

    onBreakpointChangePost = (agl, width, newBreakpointName, devicePixelRatio) => {
        console.log("onBreakpointChangePost");
        this.resolveOrders();
    }

    render() {
        return [
            <AGLWrapper tagName="Stack2"
                        key="Stack2"
                        aglComponent={this}
                        aglRef={!this.props.aglRef? this.aglRef: this.aglRef = this.props.aglRef}
                        {...this.props}
                        data={this.getData()}
                        style={{...{
                                width: "auto",
                        }, ...this.props.style}}
                        isStack={true}
                        resizeSides={['e','w']}
                        getInspector={this.getInspector}
                        getPrimaryOptions={this.getPrimaryOptions}
                        calculateChildGridItemPost={this.calculateChildGridItemPost}
                        calculateGridItemForChildren
                        getStaticChildren={this.getStaticChildren}
                        onChildDragStartOverride={this.onChildDragStartOverride}
                        onChildDragOverride={this.onChildDragOverride}
                        onChildLeavePost={this.onChildLeavePost}
                        lateMountedPost={this.lateMountedPost}
                        removeChildElementPost={this.removeChildElementPost}
                        stretchChildOverride={this.stretchChildOverride}
                        isStretchChildOverride={this.isStretchChildOverride}
                        onBreakpointChangePost={this.onBreakpointChangePost}

            >
            </AGLWrapper>,
            <StackSpacerContainer ref={this.spacerContainerRef} key="spacers"
                                  aglRef={this.aglRef}
                                  document={this.props.document}
            />
        ]
    }
}

Stack2.defaultProps = {
    tagName: "Stack2"
};

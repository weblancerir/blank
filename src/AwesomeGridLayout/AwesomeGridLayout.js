import React from "react";
import {
    CalculateLayout, cloneObject, fixGriddata, getDummy, getOverFlow,
    getPxFromPercent, initGriddata, setChildPosition,
    setChildSize,
    shallowEqual
} from "./AwesomeGridLayoutUtils";
import './AwesomeGridLayout.css';
import GridChildDraggable from "./GridChildDraggable";

export default class AwesomeGridLayout extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            childContainers: [],
        };

        this.rootDivRef = React.createRef();
        this.allChildRefs = {};

        props.griddata.isContainer = true;
    }

    componentDidMount () {
        this.mounted = true;
        this.init();
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (this.needRender) {
            delete this.needRender;
            this.updateLayout();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    init = () => {
        this.needRender = true;

        initGriddata(this.props.griddata, this.props.breakpointmanager);
        fixGriddata(this.props.griddata, this.props.breakpointmanager);
        this.children = [];

        let lastZIndex = this.getNextIndexData(0).lastZIndex;
        React.Children.map(this.props.children, (child, i)=> {
            if (!child) {
                return;
            }
            this.children.push(this.getChildClone(child, lastZIndex));
            lastZIndex++;
        });

        if (this.renderChild) {
            let childs = this.renderChild();
            if (childs instanceof Array) {
                childs.forEach(c => {
                    if (c) {
                        this.children.push(this.getChildClone(c, lastZIndex));
                        lastZIndex++;
                    }
                });
            } else {
                if (!childs) {
                    return;
                }
                this.children.push(this.getChildClone(childs, lastZIndex));
                lastZIndex++;
            }
        }

        this.onResize(this.getSize());
    };

    getChildClone = (child, lastZIndex) => {
        this.allChildRefs[child.props.id] = React.createRef();

        let griddata = initGriddata(child.props.griddata, this.props.breakpointmanager);
        fixGriddata(griddata, this.props.breakpointmanager);
        griddata.id = child.props.id;

        this.props.breakpointmanager.setData(griddata, "zIndex", lastZIndex + 1
            ,this.getSize().x, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);

        return React.cloneElement(child, {
                key: child.props.id,
                ref: this.allChildRefs[child.props.id],
                parent: this,
                griddata: griddata,
                breakpointmanager: this.props.breakpointmanager,
                undoredo: this.props.undoredo,
                dragdrop: this.props.dragdrop
            }
        );
    };

    onParentResize = () => {
        if (this.isSizeChanged()) {
            this.onResize(this.getSize());
        }
    };

    callChildResize = (childContainer) => {
        if (this.allChildRefs[childContainer.griddata.id].current &&
            this.allChildRefs[childContainer.griddata.id].current.onResize){
            this.allChildRefs[childContainer.griddata.id].current.onResize(
                {
                    w: getPxFromPercent(this.props.breakpointmanager
                        .getFromData(childContainer.griddata, "w", this.getSize().x
                            , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false),
                            this.getSize().x),
                    h: getPxFromPercent(this.props.breakpointmanager
                        .getFromData(childContainer.griddata, "h", this.getSize().x
                            , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false),
                            this.getSize().y)
                }
            );
        }
    };

    onResize = (newSize) => {
        // TODO use newSize to handle logic
        if (this.onElementResize)
            this.onElementResize(newSize);
        this.updateLayout(() => {

            this.notifyParentResizeToChildren();
        });
    };

    notifyParentResizeToChildren = () => {
        Object.values(this.allChildRefs).forEach(childRef => {
            if (childRef.current && childRef.current.onParentResize)
                childRef.current.onParentResize();
        });
    };

    getLayout = () => {
        this.calculatedData = CalculateLayout(
            this.getAllChildGrids(), this.props.layoutType, this.getSize(), this.props.dir,
            this.props.compactType, this.props.scrollType, this.props.snap,
            {breakpoints: this.props.breakpointmanager.breakpoints},
            this.props.griddata? this.props.griddata.hasOwnBreakPoints: false,
            this.props.griddata
        );

        this.putChilds();

        return this.calculatedData.childContainers;
    };

    putChilds = () => {
        this.calculatedData.childContainers.forEach(childContainer => {
            let child = this.children.find(c => {
                return c.props.id ===  childContainer.griddata.id;
            });
            if (child)
                childContainer.child = child;
            if (childContainer.griddata.id === "dummy")
                childContainer.child = getDummy(childContainer.w, childContainer.h);
        });
    };

    getAllChild = () => {
        return this.children;
    };

    getAllChildGrids = () => {
        return this.children.map(child => {
            return child.props.griddata;
        });
    };

    getSize = () => {
        // let scrollType = this.props.breakpointmanager.getFromData(this.props.griddata, "scrollType"
        //     , this.rootDivRef.current.getBoundingClientRect().width, this.props.breakpointmanager);
        // let xScroll = scrollType === "horizontal" || scrollType === "both";
        // let yScroll = scrollType === "vertical" || scrollType === "both";
        this.tempSize = {
            x: this.rootDivRef.current.getBoundingClientRect().width,
                // - (!yScroll? getScrollbarWidth(): 0),
            y: this.rootDivRef.current.getBoundingClientRect().height,
                // - (!xScroll? getScrollbarWidth(): 0),
            clientWidth: this.rootDivRef.current.clientWidth,
            clientHeight: this.rootDivRef.current.clientHeight,
            scrollLeft: this.rootDivRef.current.scrollLeft,
            scrollTop: this.rootDivRef.current.scrollTop
        };

        return this.tempSize;
    };

    changeIndex = (child, type) => {
        let currentIndex = this.props.breakpointmanager.getFromData(child.props.griddata, "zIndex"
            , this.getSize().x, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);

        if (!currentIndex)
            currentIndex = 0;

        let indexData = this.getNextIndexData(currentIndex);
        switch (type) {
            case "forward":
                this.props.breakpointmanager.setData(child.props.griddata, "zIndex"
                    , indexData.nextZIndex, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
                if (indexData.nextChildGrid)
                    this.props.breakpointmanager.setData(indexData.nextChildGrid, "zIndex"
                        , currentIndex, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
                break;
            case "backward":
                this.props.breakpointmanager.setData(child.props.griddata, "zIndex"
                    , indexData.prevZIndex, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
                if (indexData.prevChildGrid)
                    this.props.breakpointmanager.setData(indexData.prevChildGrid, "zIndex"
                        , currentIndex, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
                break;
            case "front":
                this.props.breakpointmanager.setData(child.props.griddata, "zIndex"
                    , indexData.lastZIndex + 1, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
                break;
            case "back":
                this.props.breakpointmanager.setData(child.props.griddata, "zIndex"
                    , indexData.firstZIndex - 1, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
                break;
            default:
                break;
        }
    };

    getNextIndexData = (currentIndex) => {
        let grids = this.getAllChildGrids();
        grids.sort((a, b) => {
            let aZIndex = this.props.breakpointmanager.getFromData(a, "zIndex"
                , this.getSize().x, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
            let bZIndex = this.props.breakpointmanager.getFromData(b, "zIndex"
                , this.getSize().x, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
            if (aZIndex > bZIndex) {
                return 1;
            } else if (aZIndex === bZIndex) {
                // Without this, we can get different sort results in IE vs. Chrome/FF
                return 0;
            }
            return -1;
        });
        let result = {};
        for (let i = 0; i < grids.length; i++){
            let grid = grids[i];

            let gridZIndex = this.props.breakpointmanager.getFromData(grid, "zIndex"
                , this.getSize().x, this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
            if (result.nextChildGrid === undefined && gridZIndex > currentIndex){
                result.nextChildGrid = grid;
                result.nextZIndex = gridZIndex;
                continue;
            }

            if (gridZIndex < currentIndex){
                result.prevChildGrid = grid;
                result.prevZIndex = gridZIndex;
                continue;
            }

            if (i === 0) {
                result.firstZIndex = gridZIndex;
                continue;
            }

            if (i === grids.length - 1) {
                result.lastZIndex = gridZIndex;
            }
        }

        if (!result.nextChildGrid)
            result.nextZIndex = result.lastZIndex + 1;
        if (!result.prevChildGrid)
            result.prevZIndex = result.firstZIndex - 1;

        if (result.lastZIndex === undefined)
            result.lastZIndex = 0;

        return result;
    };

    isSizeChanged = () => {
        if (!this.tempSize)
            return true;

        return !shallowEqual(this.tempSize, {
            x: this.rootDivRef.current.getBoundingClientRect().width,
            y: this.rootDivRef.current.getBoundingClientRect().height,
        });
    };

    childDragStart = (e, data, childContainer) => {

        this.props.dragdrop.setDragging(childContainer);
        childContainer.child.props.griddata.dragging = true;
        childContainer.child.props.griddata.firstPosition = {
            x: this.props.breakpointmanager.getFromData(childContainer.griddata, "x", this.getSize().x
                , this.props.breakpointmanager),
            y: this.props.breakpointmanager.getFromData(childContainer.griddata, "y", this.getSize().x
                , this.props.breakpointmanager)
        };
    };

    childDragStop = (e, data, childContainer, fromundoredo) => {
        if (!fromundoredo) {
            let redoData = {x: data.x, y: data.y};
            let undoData = {
                x: getPxFromPercent(childContainer.child.props.griddata.firstPosition.x, this.getSize().x),
                y: getPxFromPercent(childContainer.child.props.griddata.firstPosition.y, this.getSize().y)
            };
            this.props.undoredo.add(() => {
                this.childDragStop(e, redoData, childContainer, true);
            }, () => {
                this.childDragStop(e, undoData, childContainer, true);
            });
        }

        childContainer.child.props.griddata.dragging = false;
        childContainer.child.props.griddata.firstPosition = undefined;
        setChildPosition(childContainer, {
            x: data.x,
            y: data.y
        }, this.getSize(), this.props.breakpointmanager
            , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);

        childContainer.child.props.griddata.dragged = true;
        this.props.dragdrop.setDraggingStop();
        this.setState({hover: false});
        this.updateLayout();
    };

    childDrag = (e, data, childContainer) => {
        this.props.breakpointmanager.setData(childContainer.child.props.griddata, "x", data.x, this.getSize().x
            , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
        this.props.breakpointmanager.setData(childContainer.child.props.griddata, "y", data.y, this.getSize().x
            , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);
        this.updateLayout();
    };

    childResizeStart = (e, dir, refToElement, childContainer) => {
        e.stopPropagation();
        childContainer.child.props.griddata.dragging = true;
        childContainer.child.props.griddata.startSize = {
            w: getPxFromPercent(
                this.props.breakpointmanager
                    .getFromData(childContainer.griddata, "w", this.getSize().x
                        , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false), this.getSize().x),
            h: getPxFromPercent(
                this.props.breakpointmanager
                    .getFromData(childContainer.griddata, "h", this.getSize().x
                        , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false), this.getSize().y)};

        childContainer.child.props.griddata.lastSize = {
            w: childContainer.child.props.griddata.startSize.w,
            h: childContainer.child.props.griddata.startSize.h
        };
    };

    childResize =(e, dir, refToElement, delta, childContainer) => {
        if (!childContainer.child.props.griddata.startSize)
            return;
        e.stopPropagation();
        let newSize = {
            w: childContainer.child.props.griddata.startSize.w + delta.width,
            h: childContainer.child.props.griddata.startSize.h + delta.height
        };
        let liveDelta = {
            width: newSize.w - childContainer.child.props.griddata.lastSize.w,
            height: newSize.h - childContainer.child.props.griddata.lastSize.h
        };
        setChildSize(this.getUpdatedChildContainer(childContainer)
            , newSize, this.getSize(), this.props.breakpointmanager
            , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false
            , dir, liveDelta);

        childContainer.child.props.griddata.lastSize = cloneObject(newSize);
        this.updateLayout(() => {
            this.callChildResize(childContainer);
        });
    };

    childResizeStop = (e, dir, refToElement, delta, childContainer, fromundoredo, finalSize) => {
        e.stopPropagation();

        if (!fromundoredo) {
            let redoFinalSize = {w: childContainer.child.props.griddata.startSize.w + delta.width,
                h: childContainer.child.props.griddata.startSize.h + delta.height};
            let undoFinalSize = {w: childContainer.child.props.griddata.startSize.w,
                h: childContainer.child.props.griddata.startSize.h};
            this.props.undoredo.add(() => {
                this.childResizeStop(e, dir, refToElement, undefined, childContainer, true, redoFinalSize);
            }, () => {
                this.childResizeStop(e, dir, refToElement, undefined, childContainer, true, undoFinalSize);
            });
        }

        childContainer.child.props.griddata.dragging = false;

        let newSize;
        let liveDelta;
        if (delta) {
            newSize = {
                w: childContainer.child.props.griddata.startSize.w + delta.width,
                h: childContainer.child.props.griddata.startSize.h + delta.height
            };
            liveDelta = {
                width: newSize.w - childContainer.child.props.griddata.lastSize.w,
                height: newSize.h - childContainer.child.props.griddata.lastSize.h
            };
        } else {
            liveDelta = {
                width: finalSize.w - this.allChildRefs[childContainer.griddata.id].current.getSize().x,
                height: finalSize.h - this.allChildRefs[childContainer.griddata.id].current.getSize().y
            };
        }

        setChildSize(childContainer, {
            w: finalSize? finalSize.w: newSize.w,
            h: finalSize? finalSize.h: newSize.h
        }, this.getSize(), this.props.breakpointmanager
            , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false
            , dir, liveDelta);
        childContainer.child.props.griddata.startSize = undefined;
        childContainer.child.props.griddata.lastSize = undefined;

        childContainer.child.props.griddata.resized = true;
        childContainer.child.props.griddata.dragged = true;
        this.updateLayout(() => {
            this.callChildResize(childContainer);
        });
    };

    getUpdatedChildContainer = (childContainer) => {
        childContainer.griddata = childContainer.child.props.griddata;
        return childContainer;
    };

    updateLayout = (callback) => {
        this.setState({childContainers: this.getLayout()}, () => {
            if (this.props.onLayoutChange)
                this.props.onLayoutChange(this.calculatedData.layouts);
            if (callback)
                callback();
        });
    };

    addChild = (childElement) => {
        let lastZIndex = this.getNextIndexData(0).lastZIndex;
        this.children.push(this.getChildClone(childElement, lastZIndex));
        this.updateLayout();
    };

    removeChild = (childElement) => {
        setTimeout(() => {
            this.children.splice(this.children.indexOf(childElement), 1);
            this.updateLayout();
        }, 10);
    };

    getBaseOverflow = (overflow) => {
        if (overflow.x === "overlay" || overflow.y === "overlay")
            return "hidden";

        if (overflow.x === "visible" || overflow.y === "visible")
            return "visible";

        return "hidden";
    };

    getScrollbar = (overflow, dir) => {
        if (overflow[dir] === "hidden" || overflow[dir] === "visible"){
            return props =>
                <div {...props} style={{
                    display:"none"
                }}/>;
        }
    };

    onMouseOver = (e, fromEnter) => {
        if (!this.props.dragdrop.getDragging()) {
            e.stopPropagation();

            if (this.state.hover)
                return;

            this.setState({hover: true});

            if (this.props.parent && this.props.parent.onMouseOut) {
                setTimeout(() => {
                    if (!this.mounted)
                        return;
                    this.props.parent.onMouseOut(e, true);
                }, 10);
            }
        } else {
            let rect = this.rootDivRef.current.getBoundingClientRect();
            if (e.clientX < rect.x || e.clientX > (rect.x + rect.width) ||
                e.clientY < rect.y || e.clientY > (rect.y + rect.height))
                return;

            e.stopPropagation();

            if (!this.state.hover)
                this.setState({hover: true});
            this.props.dragdrop.setMouseOver(this, {
                x: e.clientX,
                y: e.clientY
            });
        }
    };

    onMouseEnter = (e) => {
        this.onMouseOver(e, true);
    };

    onMouseOut = (e, outAllParent) => {
        if (outAllParent && this.props.parent && this.props.parent.onMouseOut)
            this.props.parent.onMouseOut(e);

        if (!this.state.hover)
            return;

        this.setState({hover: false});
    };

    onChildDrop = (childContainer) => {
        let childRect = childContainer.child.ref.current.rootDivRef.current.getBoundingClientRect();
        let thisRect = this.rootDivRef.current.getBoundingClientRect();

        setChildPosition(childContainer, {
                x: childRect.x - thisRect.x + childRect.width / 2,
                y: childRect.y - thisRect.y + childRect.height / 2
            }, this.getSize(), this.props.breakpointmanager
            , this.props.griddata? this.props.griddata.hasOwnBreakPoints: false);

        this.addChild(childContainer.child);
    };

    onChildLeave = (childContainer) => {
        this.removeChild(childContainer.child);
    };

    render () {
        let overflow = getOverFlow(this.props.griddata, this.props.parent, this.props.breakpointmanager);
        return (
                <div
                    onMouseOver={this.onMouseOver}
                    onMouseEnter={this.onMouseEnter}
                    onMouseOut={this.onMouseOut}
                    onScroll={(e) => {
                    }}
                    id={this.props.id}
                    className={!this.state.hover? "AwesomeGridLayoutRoot": "AwesomeGridLayoutRootHover"}
                    style={{
                        width: this.props.width,
                        height: this.props.height,
                        overflowX: overflow.x,
                        overflowY: overflow.y
                    }}
                    ref={this.rootDivRef}
                    key={this.props.id}
                >
                    {
                        this.state.childContainers.map((childContainer) => {
                            return (
                                <GridChildDraggable
                                    key={childContainer.griddata.id}
                                    snap={this.props.snap}
                                    childContainer={childContainer}
                                    childDragStart={this.childDragStart}
                                    childDrag={this.childDrag}
                                    childDragStop={this.childDragStop}
                                    childResizeStart={this.childResizeStart}
                                    childResize={this.childResize}
                                    childResizeStop={this.childResizeStop}
                                    overflow={overflow}
                                    childRef={this.allChildRefs[childContainer.griddata.id]}
                                />
                            )
                        })
                    }
                </div>
        )
    }
}

AwesomeGridLayout.defaultProps = {
    width: "100%",
    height: "100%",
    childSize: {w: "100%", h: "100%"},
    layoutType: "free", // free, grid
    snap: {x: 1, y: 1},
    dir: "rtl", // rtl, ltr,
    compactType: "vertical", // none, vertical, horizontal
    // scrollType: "hide", // show, hide, vertical, horizontal, both
};

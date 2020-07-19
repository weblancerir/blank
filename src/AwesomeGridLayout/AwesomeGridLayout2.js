import React from "react";
import debounce from 'lodash.debounce';
import {appendStyle, cloneObject, initGriddata, updateStyle} from "./AwesomeGridLayoutUtils";
import './AwesomeGridLayout.css';
import AdjustmentResize from "./Adjustment/AdjustmentResize";
import GridChildContainer from "./GridChildContainer";
import AdjustmentHelpLines from "./Adjustment/AdjustmentHelpLines";
import AdjustmentHelpSize from "./Adjustment/AdjustmentHelpSize";
import DynamicComponents, {DynamicAnimations} from "./Dynamic/DynamicComponents";
import classNames from "classnames";
import Portal from "./Portal";
import {
    allowStretch,
    createItem,
    getCompositeDesignData,
    isFixed,
    isGroupSelected,
    isStretch
} from "./AwesomwGridLayoutHelper";
import AGLAnchor from "./AGLAnchor";
import VisibilitySensor from 'react-visibility-sensor';
import AdjustmentResizePage from "./Adjustment/AdjustmentResizePage";
import EventTrigger from "./Test/EventTrigger";
import MiniMenu from "./Menus/MiniMenu/MiniMenu";

export default class AwesomeGridLayout2 extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            childContainers: [],
            grid: {x: 1, y: 1, gridTemplateRows: "1fr", gridTemplateColumns: "1fr"},
            portalNodeId: props.portalNodeId,
            windowWidth: props.breakpointmanager.getWindowWidth()
        };

        this.rootDivRef = React.createRef();
        this.overflowRef = React.createRef();
        this.containerRef = React.createRef();
        this.backContainerRef = React.createRef();
        this.allChildRefs = {};

        this.children = {};

        initGriddata(props.griddata, this.props.breakpointmanager);

        this.props.idMan.setItem(this.props.id, this);

        this.onPropsChange = new EventTrigger();
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

    callOverride = (funcName, ...args) => {
        let override = this.getOverrideProp(funcName);
        if (override) {
            return override(this, ...args);
        }

        return false;
    };

    hasOverride = (funcName) => {
        return this.getOverrideProp(funcName);
    };

    init = () => {
        this.needRender = true;

        this.children = {};

        let lastZIndex = this.getNextIndexData(0).lastZIndex;
        let savedChildren = this.props.griddata.savedChildren;
        if (!savedChildren) {
            this.props.griddata.savedChildren = {};
            savedChildren = this.props.griddata.savedChildren;

            React.Children.map(this.props.children, (child, i)=> {
                if (child) {
                    let props = {...child.props};
                    let createdChild = this.createChildByData({
                        tagName: child.type.name ? child.type.name : child.type,
                        props: props
                    }, DynamicComponents);
                    this.children[props.id] = {
                        // child: this.getChildClone(child),
                        child: createdChild,
                        zIndex: lastZIndex + 1
                    };

                    savedChildren[props.id] = {
                        tagName: child.type.name ? child.type.name : child.type,
                        props: this.getClearProps(props),
                        zIndex: this.children[props.id].zIndex
                    };

                    lastZIndex++;
                }
            });

            if (this.renderChild) {
                let childs = this.renderChild();
                if (childs instanceof Array) {
                    childs.forEach(c => {
                        if (c) {
                            let props = {...c.props};
                            let createdChild = this.createChildByData({
                                tagName: c.type.name? c.type.name: c.type,
                                props: props
                            }, DynamicComponents);
                            this.children[props.id] = {
                                child: createdChild,
                                zIndex: lastZIndex + 1
                            };

                            savedChildren[props.id] = {
                                tagName: c.type.name? c.type.name: c.type,
                                props: this.getClearProps(props),
                                zIndex: this.children[props.id].zIndex
                            };

                            lastZIndex++;
                        }
                    });
                } else {
                    if (childs) {
                        let props = {...childs.props};
                        let createdChild = this.createChildByData({
                            tagName: childs.type.name ? childs.type.name : childs.type,
                            props: props
                        }, DynamicComponents);
                        this.children[props.id] = {
                            child: createdChild,
                            zIndex: lastZIndex + 1
                        };

                        savedChildren[props.id] = {
                            tagName: childs.type.name ? childs.type.name : childs.type,
                            props: this.getClearProps(props),
                            zIndex: this.children[props.id].zIndex
                        };

                        lastZIndex++;
                    }
                }
            }

            if (this.props.childrenData) {
                let childs = this.props.childrenData();
                childs.forEach(c => {
                    if (c) {
                        let props = {...c.props};
                        let createdChild = this.createChildByData({
                            tagName: c.tagName,
                            props: props
                        }, DynamicComponents);
                        this.children[props.id] = {
                            child: createdChild,
                            zIndex: lastZIndex + 1
                        };

                        savedChildren[props.id] = {
                            tagName: c.tagName,
                            props: this.getClearProps(props),
                            zIndex: this.children[props.id].zIndex
                        };

                        lastZIndex++;
                    }
                });
            }
        } else {
            let savedChildrenArray = Object.values(savedChildren);
            savedChildrenArray.sort((a, b) => {
                if (a.zIndex > b.zIndex) {
                    return 1;
                } else if (a.zIndex === b.zIndex) {
                    // Without this, we can get different sort results in IE vs. Chrome/FF
                    return 0;
                }
                return -1;
            });
            savedChildrenArray.forEach(childData => {
                let oldId = childData.props.id;
                let child = this.createChildByData(childData, DynamicComponents);
                this.children[childData.props.id] = {
                    child: child,
                    zIndex: childData.zIndex
                };

                if (oldId !== childData.props.id) {
                    delete savedChildren[oldId];
                    savedChildren[childData.props.id] = childData;
                }
            })
        }

        this.initLayout();
    };

    initLayout = () => {
        if (this.callOverride("initLayout"))
            return;

        let style = this.getDefaultStyle();

        let designStyle = {...this.props.designStyle};
        this.setDesignStyle(this.getFromData("designStyle") || designStyle, undefined,
            this.props.breakpointmanager.getHighestBpName());
        this.setStyle(this.getFromData("style") || style, undefined,
            this.props.breakpointmanager.getHighestBpName());
        this.setGridItemStyle(this.getFromData("gridItemStyle") ||
            this.props.defaultGridItemStyle,
            this.props.breakpointmanager.getHighestBpName());
        this.setGrid(this.getFromData("grid") || this.props.defaultGrid, this.lateMounted,
            this.props.breakpointmanager.getHighestBpName());
    };

    getDefaultStyle = () => {
        let style = { ...this.props.defaultStyle, ...this.props.style};

        if ((this.props.defaultGridItemStyle).justifySelf === "stretch" &&
            (this.getFromTempData("resizable") &&
                (!this.props.resizeSides || (!this.props.resizeSides.includes("w") &&
                    !this.props.resizeSides.includes("e"))))) {
            style.width = "auto";
        }

        return style;
    };

    lateMounted = () => {
        if (this.hasOverride("lateMounted")) {
            return this.callOverride("lateMounted");
        }

        this.invalidateSize();
        this.addToSnap();
        this.onSelect(this.getFromTempData("selected"));

        let baseDocks = this.getBaseDocks();
        this.setDocks(baseDocks.top, baseDocks.left, baseDocks.bottom, baseDocks.right,
            this.getFromTempData("autoDock"),
            this.props.breakpointmanager.getHighestBpName(), true);


        if (this.props.onPageResize) {
            let rect = this.getSize(false, true);
            this.props.onPageResize(rect.width, this, true);
        }

        this.props.onChildMounted && this.props.onChildMounted(this);
    };

    getPrimaryOptions = () => {
        return this.props.getPrimaryOptions && this.props.getPrimaryOptions();
    };

    getShortcutOptions = () => {
        return this.props.getShortcutOptions && this.props.getShortcutOptions();
    };

    hasMiniMenu = () => {
        if (this.hasOverride("hasMiniMenu")) {
            return this.callOverride("hasMiniMenu");
        }

        return true;
    };

    addToSnap = () => {
        if (this.callOverride("addToSnap"))
            return;

        let rect = this.getBoundarySize(false);
        this.props.snap.addSnap(this.props.id,
            [
                {
                    id: this.props.id,
                    value: rect.top,
                    p1: rect.left,
                    p2: rect.left + rect.width
                },
                {
                    id: this.props.id,
                    value: rect.top + rect.height / 2,
                    p1: rect.left,
                    p2: rect.left + rect.width
                },
                {
                    id: this.props.id,
                    value: rect.top + rect.height,
                    p1: rect.left,
                    p2: rect.left + rect.width
                }
            ],
            [
                {
                    id: this.props.id,
                    value: rect.left,
                    p1: rect.top,
                    p2: rect.top + rect.height
                },
                {
                    id: this.props.id,
                    value: rect.left + rect.width / 2,
                    p1: rect.top,
                    p2: rect.top + rect.height
                },
                {
                    id: this.props.id,
                    value: rect.left + rect.width,
                    p1: rect.top,
                    p2: rect.top + rect.height
                }
            ],
            this.getParentsId()
        );

        Object.values(this.allChildRefs).forEach(childRef => {
            if (childRef && childRef.current){
                childRef.current.addToSnap();
            }
        });
    };

    getParentsId = () => {
        let parentsId = [];
        let parent = this.props.parent;

        while (parent) {
            parentsId.push(parent.props.id);
            parent = parent.props.parent;
        }

        return parentsId;
    };

    getGridLineSnaps = () => {
        let snaps = {
            horizontals: [],
            verticals: [],
            id: this.props.id
        };
        this.prepareRects();
        let xLineRef = this.props.gridLine.getXlineRef(this.props.id);
        for(let i = 0; i < xLineRef.length; i++) {
            let current = xLineRef[i].current;
            if (!current)
                continue;

            // let rect = current.getBoundingClientRect();
            let rect = current.rect;
            snaps.verticals.push({
                id: this.props.id,
                value: rect.left + ((i === xLineRef.length - 1)? 1: 0),
                p1: rect.top,
                p2: rect.top + rect.height
            });
        }
        let yLineRef = this.props.gridLine.getYlineRef(this.props.id);
        for(let i = 0; i < yLineRef.length; i++) {
            let current = yLineRef[i].current;
            if (!current)
                continue;

            // let rect = current.getBoundingClientRect();
            let rect = current.rect;
            snaps.horizontals.push({
                id: this.props.id,
                value: rect.top + ((i === yLineRef.length - 1)? 1: 0),
                p1: rect.left,
                p2: rect.left + rect.width
            });
        }

        return [snaps];
    };

    createChildByData = (childData, dynamicComponents, newId, onChildMounted, fixed) => {
        if (this.callOverride("addToSnap", childData, dynamicComponents, newId, onChildMounted, fixed))
            return;

        let tagName = childData.tagName;
        let props = childData.props;

        let griddata = initGriddata(props.griddata, this.props.breakpointmanager);

        if (newId)
            props.id = newId;
        if (!props.id)
            props.id = this.props.idMan.getId(tagName);
        else
            props.id = this.props.idMan.getId(tagName, props.id);

        griddata.id = props.id;
        if (!props.griddata || newId)
            props.griddata = griddata;

        this.allChildRefs[props.id] = React.createRef();

        let AGLProps = {};
        if (tagName[0] == tagName[0].toUpperCase()) {
            AGLProps = {
                aglRef: this.allChildRefs[props.id],
                breakpointmanager: this.props.breakpointmanager,
                undoredo: this.props.undoredo,
                dragdrop: this.props.dragdrop,
                select: this.props.select,
                snap: this.props.snap,
                idMan: this.props.idMan,
                copyMan: this.props.copyMan,
                window: this.props.window,
                document: this.props.document,
                editorData: this.props.editorData,
                anchorMan: this.props.anchorMan,
                gridLine: this.props.gridLine,
                gridEditorRef: this.props.gridEditorRef,
                parent: this,
                editor: this.props.editor,
                onChildMounted: onChildMounted,
                portalNodeId: fixed && `${this.props.id}_fixed_holder`,
                ...this.getAllChildOverrideProps()
            };
        }

        return React.createElement(
            tagName[0] == tagName[0].toUpperCase()? dynamicComponents[tagName]: tagName,
            {
                ...props,
                key: props.id,
                ...AGLProps,
            }
        );
    };

    getSize = (updateState = true, force) => {
        if (!this.rootDivRef.current)
            return;

        if (this.tempSize && !force)
            return cloneObject(this.tempSize);

        let rect = this.rootDivRef.current.getBoundingClientRect();
        let temp = {
            x: rect.width,
            y: rect.height,
            clientWidth: this.overflowRef.current.clientWidth,
            clientHeight: this.overflowRef.current.clientHeight,
            scrollLeft: this.overflowRef.current? this.overflowRef.current.scrollLeft : 0,
            scrollTop: this.overflowRef.current? this.overflowRef.current.scrollTop: 0,
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            width: rect.width,
            height: rect.height
        };

        this.tempSize = temp;

        if (updateState) {
            this.setState({tempSize: this.tempSize}, () => {
                // this.tempSize = undefined;
            });
        }

        return temp;
    };

    getBoundarySize = (updateState = true, force) => {
        return this.getSize(updateState, force);
    };

    invalidateSize = () => {
        delete this.tempSize;
        Object.values(this.allChildRefs).forEach(childRef => {
            if (childRef && childRef.current) {
                childRef.current.invalidateSize();
            }
        });
    };

    arrangeIndex = (child, type) => {
        let childData = this.getFromTempData("savedChildren")[child.props.id];
        let currentIndex = childData.zIndex;

        if (!currentIndex)
            currentIndex = 0;

        let indexData = this.getNextIndexData(currentIndex);
        switch (type) {
            case "forward":
                childData.zIndex = indexData.nextZIndex;
                if (indexData.nextChild)
                    indexData.nextChild.zIndex = currentIndex;
                break;
            case "backward":
                childData.zIndex = indexData.prevZIndex;
                if (indexData.prevChild)
                    indexData.prevChild.zIndex = currentIndex;
                break;
            case "front":
                childData.zIndex = indexData.lastZIndex + 1;
                break;
            case "back":
                childData.zIndex = indexData.firstZIndex - 1;
                break;
            default:
                break;
        }

        this.updateLayout();
    };

    changeIndex = (child, index) => {
        let allChildData = this.getFromTempData("savedChildren");
        let childData = allChildData[child.props.id];
        let currentIndex = childData.zIndex;

        if (currentIndex === index)
            return;

        if (!currentIndex)
            currentIndex = 0;

        let findIndex = (zIndex) => {
            return allChildData.findIndex(a => {
                return a.zIndex === zIndex;
            });
        };

        let change = currentIndex < index ? -1 : 1;

        if (findIndex(index)) // if false, means index is free to set
        {
            let startIndex = currentIndex < index ? findIndex(currentIndex) || 0 : findIndex(index);
            let lastIndex = currentIndex < index ? findIndex(index) : findIndex(currentIndex) || 0 ;

            for (let i = startIndex; i < lastIndex + 1; i++) {
                let testChildData = allChildData[i];
                testChildData.zIndex += change;
            }
        }

        childData.zIndex = index;

        this.updateLayout();
    };

    getNextIndexData = (currentIndex) => {
        let children = Object.values(this.getFromTempData("savedChildren") || {});
        children.sort((a, b) => {
            if (a.zIndex > b.zIndex) {
                return 1;
            } else if (a.zIndex === b.zIndex) {
                // Without this, we can get different sort results in IE vs. Chrome/FF
                return 0;
            }
            return -1;
        });
        let result = {};
        for (let i = 0; i < children.length; i++){
            let child = children[i];

            let childZIndex = child.zIndex;

            if (i === 0) {
                result.firstZIndex = childZIndex;
            }

            if (i === children.length - 1) {
                result.lastZIndex = childZIndex;
            }

            if (result.nextChild === undefined && childZIndex > currentIndex){
                result.nextChild = child;
                result.nextZIndex = childZIndex;
                continue;
            }

            if (childZIndex < currentIndex){
                result.prevChild = child;
                result.prevZIndex = childZIndex;
                // continue;
            }
        }

        if (!result.nextChild)
            result.nextZIndex = result.lastZIndex + 1;
        if (!result.prevChild)
            result.prevZIndex = result.firstZIndex - 1;

        if (result.lastZIndex === undefined)
            result.lastZIndex = 0;

        return result;
    };

    updateLayout = (callback) => {
        if (this.callOverride("updateLayout", callback))
            return;

        this.forceUpdate(callback);
    };

    isPointInclude = (x, y, forceCalculate) => {
        let rect = this.getSize(false, forceCalculate);
        return x >= rect.left && x <= rect.left + rect.width &&
            y >= rect.top && y <= rect.top + rect.height;
    };

    addChild = (childElement, newId, newProps, callback, onChildMounted, fixed, keepChildren) => {
        if (this.callOverride("addChild", childElement, newId, newProps, callback, onChildMounted, fixed))
            return;

        if (!childElement.props.tagName && !childElement.type) {
            throw new Error("childElement must pass tagName prop to AGL or be primitive type");
        }

        let lastZIndex = this.getNextIndexData(0).lastZIndex;
        let props = newId? newProps: {...childElement.props};
        let createdChild = this.createChildByData({
            tagName: childElement.props.tagName? childElement.props.tagName:
                childElement.type.name? childElement.type.name: childElement.type,
            props: this.getClearProps(props, keepChildren)
        }, DynamicComponents, newId, onChildMounted, fixed);
        this.children[props.id] = {
            child: createdChild,
            zIndex: lastZIndex + 1
        };

        this.props.griddata.savedChildren[props.id] = {
            tagName: childElement.props.tagName? childElement.props.tagName:
                childElement.type.name? childElement.type.name: childElement.type,
            props: this.getClearProps(props),
            zIndex: this.children[props.id].zIndex
        };

        this.updateLayout(callback);
        this.props.onChildAdd && this.props.onChildAdd();
    };

    onBreakpointChange = (width, newBreakpointName, devicePixelRatio) => {
        if (this.callOverride("onBreakpointChange", width, newBreakpointName, devicePixelRatio))
            return;

        let style = this.getCompositeFromData("style");
        let designStyle = this.getCompositeFromData("designStyle");
        let gridItemStyle = this.getCompositeFromData("gridItemStyle");
        let transform = this.getCompositeFromData("transform");
        this.setStyle(style, undefined, undefined, true);
        this.setDesignStyle(designStyle, undefined, undefined, true);
        this.setGridItemStyle(gridItemStyle, undefined, true);
        this.setTransformStyle(transform, undefined, undefined, true);

        this.setState({ windowWidth: width, devicePixelRatio }, () => {
            Object.values(this.allChildRefs).forEach(childRef => {
                if (childRef && childRef.current) {
                    childRef.current.onBreakpointChange(width, newBreakpointName);
                }
            });
        });
    };

    delete = (fromUndoRedo) => {
        if (this.callOverride("delete"))
            return;

        if (!this.props.parent)
            return;

        if (this.props.onItemPreDelete) {
            let allow = this.props.onItemPreDelete(this);
            if (!allow)
                return;
        }

        if (!fromUndoRedo) {
            let itemId = this.props.id;
            let parentId = this.props.parent.props.id;
            let childData = cloneObject(this.props.parent.getChildData(itemId));
            this.props.undoredo.add((idMan) => {
                idMan.getItem(itemId).delete(true);
            }, (idMan) => {
                createItem(idMan.getItem(parentId), childData, true);
            });
        }

        this.clearItem();

        this.props.parent.removeChildElement(this);

        this.props.select.clearMiniMenu();
    };

    getChildData = (childId) => {
        return this.props.griddata.savedChildren[childId];
    };

    getOverrideProp = (funcName) => {
        let key = Object.keys(this.props).find(key => {
            return key === `${funcName}Override`;
        });

        return this.props[key];
    };

    getAllOverrideProps = (props) => {
        let result = {};
        Object.keys(props || this.props).forEach(key => {
            if (key.endsWith("Override")) {
                result[key] = this.props[key];
            }
        });

        return result;
    };

    getAllChildOverrideProps = (props) => {
        let result = {};
        Object.keys(props || this.props).forEach(key => {
            if (key.endsWith("ChildOverride")) {
                result[key.replace("ChildOverride", "Override")] = this.props[key];
            }
        });

        return result;
    };

    clearItem = () => {
        this.props.idMan.removeId(this.props.id);
        this.props.gridLine.removeGridLine(this.props.id);
        this.props.snap.removeSnap(this.props.id);
        Object.values(this.allChildRefs).forEach(childRef => {
            if (childRef && childRef.current) {
                childRef.current.clearItem();
            }
        });
    };

    getClearProps = (props, keepChildren) => {
        delete props.breakpointmanager;
        delete props.undoredo;
        delete props.dragdrop;
        delete props.select;
        delete props.snap;
        delete props.idMan;
        delete props.copyMan;
        delete props.anchorMan;
        delete props.aglRef;
        delete props.parent;
        delete props.window;
        delete props.document;
        if (!keepChildren)
            delete props.children;
        delete props.allChildRefs;
        delete props.gridLine;
        delete props.portalNode;
        delete props.gridEditorRef;
        delete props.onChildMounted;

        Object.keys(this.getAllOverrideProps(props)).forEach(key => {
            delete props[key];
        });

        return props;
    };

    removeChildElement = (childElement, callback) => {
        if (this.hasOverride("removeChildElement"))
            return this.callOverride("removeChildElement", childElement);

        delete this.children[childElement.props.id];
        delete this.allChildRefs[childElement.props.id];
        delete this.props.griddata.savedChildren[childElement.props.id];

        setTimeout(() => {
            if (!this.mounted)
                return;
            this.updateLayout(callback);
        }, 0);
    };

    // Can be remove carefully
    hide = () => {
        this.setState({hide: true});
    };

    // Can be remove carefully
    show = () => {
        this.setState({hide: false});
    };

    onMouseOver = (e, fromEnter) => {
        if (!this.props.dragdrop.getDragging()) {
            e.stopPropagation();

            if (this.state.hover || this.getFromTempData("selected"))
                return;

            this.setState({hover: true});

            this.setMouseOverForNonDragging(this);

            if (this.props.parent && this.props.parent.onMouseOut) {
                setTimeout(() => {
                    if (!this.mounted)
                        return;
                    this.props.parent.onMouseOut(e, true);
                }, 10);
            }
        } else {
            if (this.props.dragdrop.getDragging().props.id === this.props.id)
                return;

            e.stopPropagation();

            let rect = this.rootDivRef.current.getBoundingClientRect();
            if (e.clientX < rect.x - 1 || e.clientX > (rect.x + rect.width) ||
                e.clientY < rect.y - 1 || e.clientY > (rect.y + rect.height))
                return;

            if (!this.state.hover)
                this.setState({hover: true});

            if (this.props.parent && this.props.parent.onMouseOut) {
                setTimeout(() => {
                    if (!this.mounted)
                        return;
                    this.props.parent.onMouseOut(e, true);
                }, 10);
            }

            this.setMouseOver(this, {
                x: e.clientX,
                y: e.clientY
            }, (draggingItem, mouseOver) => {
                // on new parent state changed
                draggingItem.toggleHelpLines(this);
            });
        }
    };

    setMouseOverForNonDragging = () => {
        if (this.hasOverride("setMouseOverForNonDragging"))
            return this.callOverride("setMouseOverForNonDragging");

        this.props.dragdrop.setMouseOverForNonDragging(this);
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

    prepareRects = (force) => {
        if (this.callOverride("prepareRects", force))
            return;

        this.rootDivRef.current.rect = this.getSize(false, true);
        if (force || !this.props.gridLine.isPrepared(this.props.id)) {
            this.props.gridLine.prepareRects(this.props.id);
        }

        return this.rootDivRef.current.rect;
    };

    onChildDrop = (child, newId, fixed, onNewChildMounted) => {
        if (this.callOverride("onChildDrop", child, newId, fixed, onNewChildMounted))
            return;

        let childRect = child.getSize(false, true);
        let thisRect = this.getSize(false, true);

        let calcResult, gridItemStyle, coordinates, newProps;

        if (!newId)
            calcResult = this.calculateChildGridItem(child,
                childRect.left - thisRect.left, childRect.top - thisRect.top, this,
                childRect.width,
                childRect.height,
                thisRect
            );
        else {
            this.prepareRects(true);
            calcResult = this.calculateChildGridItem(child,
                thisRect.width / 2 - childRect.width / 2,
                thisRect.height / 2 - childRect.height / 2,
                this,
                childRect.width,
                childRect.height,
                thisRect
            );
        }

        gridItemStyle = calcResult.gridItemStyle;
        coordinates = calcResult.coordinates;
        if (!newId) {
            if (gridItemStyle.alignSelf !== "stretch") {
                child.setProps("width", childRect.width, coordinates, undefined,
                    this.props.breakpointmanager.getHighestBpName());
            } else {
                child.setProps("width", "auto", undefined,
                    this.props.breakpointmanager.getHighestBpName());
            }
            if (child.getFromData("style").height === "auto")
                child.setProps("minHeight", childRect.height, coordinates, undefined,
                    this.props.breakpointmanager.getHighestBpName());
            else {
                child.setProps("height", childRect.height, coordinates, undefined,
                    this.props.breakpointmanager.getHighestBpName());
                child.setProps("minHeight", childRect.height, coordinates, undefined,
                    this.props.breakpointmanager.getHighestBpName());
            }
        } else {
            newProps = {...child.props};
            newProps.griddata = cloneObject(newProps.griddata);
            this.setDataInBreakpoint("gridItemStyle", gridItemStyle, newProps.griddata, undefined,
                this.props.breakpointmanager.getHighestBpName());
            this.setTempData("selected", true, newProps.griddata);
            if (gridItemStyle.alignSelf !== "stretch") {
                this.setProps("width", childRect.width, coordinates, newProps.griddata, undefined,
                    this.props.breakpointmanager.getHighestBpName());
            } else {
                this.setProps("width", "auto", undefined, newProps.griddata, undefined,
                    this.props.breakpointmanager.getHighestBpName());
            }
            if (child.getFromData("style").height === "auto")
                this.setProps("minHeight", childRect.height, coordinates, newProps.griddata, undefined,
                    this.props.breakpointmanager.getHighestBpName());
            else {
                this.setProps("height", childRect.height, coordinates, newProps.griddata, undefined,
                    this.props.breakpointmanager.getHighestBpName());
                this.setProps("minHeight", childRect.height, coordinates, newProps.griddata, undefined,
                    this.props.breakpointmanager.getHighestBpName());
            }
        }

        child.clearFromAllBp("style", undefined, this.props.breakpointmanager.getHighestBpName());
        child.clearFromAllBp("gridItemStyle", undefined, this.props.breakpointmanager.getHighestBpName());

        this.addChild(child, newId, newProps, () => {
            let newChild = this.allChildRefs[newId? newProps.id: child.props.id].current;
            newChild.setGridItemStyle(gridItemStyle,
                this.props.breakpointmanager.getHighestBpName());
            if (!newId) {
                newChild.toggleHelpLines(this);
            }

        }, (agl) => {
            // setTimeout(() => {
            //     let size = agl.getSize(false);
            //     agl.updateGridLines(
            //         size.top,
            //         size.left,
            //         size.top + size.clientHeight,
            //         size.left + size.clientWidth,
            //         "A"
            //     );
            // }, 0);

            if (onNewChildMounted)
                onNewChildMounted(agl);
        }, fixed, undefined);
    };

    onChildLeave = (child, callback) => {
        if (this.hasOverride("onChildLeave"))
            return this.callOverride("onChildLeave", child);

        this.removeChildElement(child, callback);
        child.removeIdAndChildrenId();
    };

    removeIdAndChildrenId = () => {
        this.props.idMan.removeId(this.props.id);
        Object.values(this.allChildRefs).forEach(childRef => {
            if (childRef && childRef.current) {
                childRef.current.removeIdAndChildrenId();
            }
        });
    };

    nonePointerEventForChildren = (parentDragging) => {
        Object.values(this.allChildRefs).forEach(childRef => {
            if (childRef && childRef.current) {
                childRef.current.onParentDragging(parentDragging);
            }
        });
    };

    onParentDragging = (parentDragging) => {
        this.nonePointerEventForChildren(parentDragging);
        if (!parentDragging) {
            this.setRuntimeStyle();
            return;
        }
        let runtimeStyle = {...this.state.runtimeStyle};
        runtimeStyle.pointerEvents = "none";
        this.setRuntimeStyle(runtimeStyle);
    };

    onDragStart = (e, group, callGroup) => {
        if (this.callOverride("onDragStart", e, group, callGroup))
            return;

        if (this.getFromTempData("dontMove") || this.resizing || !this.props.parent.children[this.props.id])
            return;

        if (this.props.parent)
            this.props.parent.prepareRects();

        if (!group)
            this.props.dragdrop.setDragging(this);

        this.nonePointerEventForChildren(true);

        if (!group && this.props.dragdrop.getMouseOverForNonDragging() &&
            !this.props.dragdrop.getMouseOverForNonDragging().getParentsId().includes(this.props.id))
        {
            this.setMouseOver(this.props.dragdrop.getMouseOverForNonDragging(), {
                x: e.clientX,
                y: e.clientY
            }, (draggingItem, mouseOver) => {
                // on new parent state changed
                draggingItem.toggleHelpLines(mouseOver);
            });
        }

        let thisRect = this.getSize(false);
        this.dragData = {
            firstPos: {
                top: thisRect.top,
                left: thisRect.left
            },
            x: thisRect.left,
            y: thisRect.top,
            lastMouseX: e.clientX,
            lastMouseY: e.clientY,
        };

        let runtimeStyle = {...this.state.runtimeStyle};
        runtimeStyle.position = "fixed";
        runtimeStyle.gridArea = "auto/auto/auto/auto";
        runtimeStyle.marginBottom = "auto";
        runtimeStyle.marginTop = "auto";
        runtimeStyle.marginLeft = "auto";
        runtimeStyle.marginRight = "auto";
        // runtimeStyle.width =
        //     getRotatedRectangle(thisRect.width, thisRect.height, this.getFromData("rotateDegree")).x2;
        // runtimeStyle.height =
        //     getRotatedRectangle(thisRect.width, thisRect.height, this.getFromData("rotateDegree")).y2;
        runtimeStyle.width =thisRect.width;
        runtimeStyle.height =thisRect.height;
        runtimeStyle.minWidth = "auto";
        runtimeStyle.minHeight = "auto";
        runtimeStyle.opacity = 0.7;
        runtimeStyle.zIndex = 999999;
        runtimeStyle.pointerEvents = "none";

        runtimeStyle.top = thisRect.top;
        runtimeStyle.left = thisRect.left;

        this.setRuntimeStyle(runtimeStyle);
        this.draggingStart = true;
        this.setState({dragging: true, draggingStart: true});

        this.props.select.updateMenu();

        if (group && callGroup)
            this.state.groupDragStart(e, this);
    };

    setMouseOver = (item, positionData, callback) => {
        if (this.hasOverride("setMouseOver"))
            return this.callOverride("setMouseOver", item, positionData, callback);

        return this.props.dragdrop.setMouseOver(item, positionData, callback);
    };

    onDrag = (e, group, callGroup) => {
        if (this.callOverride("onDrag", e, group, callGroup))
            return;

        if (!this.props.parent.children[this.props.id]) {
            return;
        }
        if (this.resizing || !this.state.draggingStart) {
            if (this.props.dragdrop.getDragging()) {
                this.props.dragdrop.setDragging();
            }
            return;
        }

        this.dragData.x += (e.clientX - this.dragData.lastMouseX);
        this.dragData.y += (e.clientY - this.dragData.lastMouseY);
        this.dragData.lastMouseX = e.clientX;
        this.dragData.lastMouseY = e.clientY;

        let runtimeStyle = {...this.state.runtimeStyle};
        runtimeStyle.top = this.dragData.y;
        runtimeStyle.left = this.dragData.x;

        if (!isFixed(this) && !group)
            this.checkSnapOnDrag(runtimeStyle);
        this.setRuntimeStyle(runtimeStyle);

        if (!group)
            this.updateGridLines(
                runtimeStyle.top,
                runtimeStyle.left,
                window.innerHeight - runtimeStyle.top - runtimeStyle.height,
                window.innerWidth - runtimeStyle.left - runtimeStyle.width,
                "A"
            );

        this.props.select.updateMiniMenu();

        if (group && callGroup)
            this.state.groupDrag(e, this);
    };

    updateGridLines = (top, left, bottom, right, gridType) => {
        let grid = this.getFromData("grid");
        this.props.gridLine.addGrid(
            this.props.id,
            grid.x,
            grid.y,
            gridType,
            grid.gridTemplateRows,
            grid.gridTemplateColumns,
            {
                top,
                left,
                bottom,
                right,
            }
        )
    };

    onDragStop = (e, group, callGroup) => {
        if (this.hasOverride("onDragStop"))
            return this.callOverride("onDragStop", e, group, callGroup);

        if (this.resizing || !this.state.draggingStart || !this.props.parent.children[this.props.id])
            return;

        if (group && callGroup)
            this.state.groupDragStop(e, this);

        if (group)
            this.props.parent.prepareRects(true);

        let {top, left, width, height} = this.state.runtimeStyle;

        this.props.snap.drawSnap();
        if (group || !this.props.dragdrop.setDraggingStop()){
            this.getSize(true, true);
            let parentRect = this.props.parent.getSize(false);
            this.setPosition(
                group,
                left - parentRect.left,
                top - parentRect.top,
                this.dragData.firstPos.left - parentRect.left,
                this.dragData.firstPos.top - parentRect.top,
                width, height);
            return;
        } else if (!group) {
            this.dropped = true;
        }

        this.setState({dragging: false, draggingStart: false});

        if (!group)
            this.updateGridLines(
                top, left,
                window.innerHeight - top - height,
                window.innerWidth - left - width,
                "A"
            );

        this.props.select.updateMiniMenu();
    };

    setPosition = (group, relativeX, relativeY, firstRelativeX, firstRelativeY, width, height, fromUndoRedo) => {
        if (!fromUndoRedo) {
            let itemId = this.props.id;
            let parentId = this.props.parent.props.id;
            let redoData = [group, relativeX, relativeY, firstRelativeX, firstRelativeY, width, height];
            let undoData = [group, firstRelativeX, firstRelativeY, undefined, undefined, width, height];
            this.props.undoredo.add((idMan) => {
                idMan.getItem(itemId).onSelect(true);
                idMan.getItem(itemId).props.dragdrop.setMouseOver(idMan.getItem(parentId));
                idMan.getItem(itemId).setPosition(...redoData, true);
            }, (idMan) => {
                idMan.getItem(itemId).onSelect(true);
                idMan.getItem(itemId).props.dragdrop.setMouseOver(idMan.getItem(parentId));
                idMan.getItem(itemId).setPosition(...undoData, true);
            });
        }

        if (this.hasOverride("setPosition"))
            return this.callOverride("setPosition",
                group, relativeX, relativeY, firstRelativeX, firstRelativeY, width, height, fromUndoRedo);

        let {gridItemStyle, coordinates} = this.calculateGridItem(relativeX, relativeY, this.props.parent,
            width, height);

        if (gridItemStyle.justifySelf !== "stretch"){
            this.setProps("width", width, coordinates);
        } else {
            this.setProps("width", "auto");
        }
        if (this.getCompositeFromData("style").height === "auto")
            this.setProps("minHeight", height, coordinates);
        else {
            this.setProps("height", height, coordinates);
            this.setProps("minHeight", height, coordinates);
        }

        this.setGridItemStyle(gridItemStyle);

        this.nonePointerEventForChildren(false);
        this.setRuntimeStyle();
        this.setState({dragging: false, draggingStart: false}, () => {
            this.addToSnap();
        });

        this.dropped = false;

        this.props.select.updateSize();
    };

    checkSnapOnDrag = (runtimeStyle) => {
        if (this.callOverride("checkSnapOnDrag", runtimeStyle))
            return;

        let snapDelta1 = this.getSnapDelta(
            runtimeStyle.top, runtimeStyle.left);
        let snapDelta2 = this.getSnapDelta(
            runtimeStyle.top + runtimeStyle.height/2, runtimeStyle.left + runtimeStyle.width/2);
        let snapDelta3 = this.getSnapDelta(
            runtimeStyle.top + runtimeStyle.height, runtimeStyle.left + runtimeStyle.width);

        let snapDelta = {
            deltaX: snapDelta2.snapV? snapDelta2.deltaX:
                snapDelta1.snapV? snapDelta1.deltaX:
                    snapDelta3.snapV? snapDelta3.deltaX: 0,
            deltaY: snapDelta2.snapH? snapDelta2.deltaY:
                snapDelta1.snapH? snapDelta1.deltaY:
                    snapDelta3.snapH? snapDelta3.deltaY: 0,
            snapH: (snapDelta2.snapH || snapDelta1.snapH) || snapDelta3.snapH,
            snapV: (snapDelta2.snapV || snapDelta1.snapV) || snapDelta3.snapV
        };

        runtimeStyle.left += snapDelta.deltaX;
        runtimeStyle.top += snapDelta.deltaY;

        let pointOfSnapH = {
            p1: runtimeStyle.left,
            p2: runtimeStyle.left + runtimeStyle.width
        };
        let pointOfSnapV = {
            p1: runtimeStyle.top,
            p2: runtimeStyle.top + runtimeStyle.height
        };

        this.props.snap.drawSnap(snapDelta.snapH, snapDelta.snapV, pointOfSnapH, pointOfSnapV);
    };

    getSnapDelta = (top, left) => {
        let parentGridLines;
        if (this.props.parent) {
            if (this.resizing) {
                parentGridLines = this.props.parent.getGridLineSnaps();
            } else {
                // dragging
                parentGridLines = this.props.dragdrop.mouseOver &&
                    this.props.dragdrop.mouseOver.getGridLineSnaps();
            }
        }

        let {snapH, snapV} =
            this.props.snap.checkSnap(top, left, this.props.id, parentGridLines);

        let deltaX = 0;
        let deltaY = 0;
        if (snapH) {
            deltaY = snapH.value - top;
        }
        if (snapV) {
            deltaX = snapV.value - left;
        }

        return {
            deltaX, deltaY, snapH, snapV
        }
    };

    setDocks = (top, left, bottom, right, auto, breakpointName, dontCalculate) => {
        this.setDataInBreakpoint("docks", {top, left, bottom, right}, undefined, breakpointName);
        this.setTempData("autoDock", auto);

        if (!this.props.parent || dontCalculate)
            return;

        this.props.parent.prepareRects();
        let thisRect = this.getSize(false);
        let parentRect = this.props.parent.getSize(false);
        let {gridItemStyle} =
            this.calculateGridItem(
                thisRect.left - parentRect.left,
                thisRect.top - parentRect.top,
                this.props.parent,
                thisRect.width,
                thisRect.height,
                parentRect
            );

        this.setGridItemStyle(gridItemStyle, breakpointName);
    };

    getDocks = () => {
        return this.getFromData("docks");
    };

    getBaseDocks = () => {
        let gridItemStyle = this.getCompositeFromData("gridItemStyle");
        return {
            top: gridItemStyle.alignSelf === "start" || gridItemStyle.alignSelf === "stretch",
            bottom: gridItemStyle.alignSelf === "end" || gridItemStyle.alignSelf === "stretch",
            left: gridItemStyle.justifySelf === "start" || gridItemStyle.justifySelf === "stretch",
            right: gridItemStyle.justifySelf === "end" || gridItemStyle.justifySelf === "stretch",
        }
    };

    calculateGridItem = (relativeX, relativeY, parent, width, height, parentRect, fromState, dontAutoDock) => {
        if (this.hasOverride("calculateGridItem"))
            return this.callOverride(
                "calculateGridItem", relativeX, relativeY, parent, width, height, parentRect, fromState, dontAutoDock);

        if (!width) {
            let rect = this.getSize(false, true);
            width = rect.width;
            height = rect.height;
        }

        if (!parentRect)
            parentRect = parent.getSize(false, true);

        let {gridArea, coordinates} = this.calculateGridArea(
            parentRect.left + relativeX,
            parentRect.top + relativeY,
            width,
            height,
            parent,
            parentRect
        );

        if (isFixed(this)) {
            gridArea = {x1: 1, x2: 2, y1: 1, y2: 2};
            coordinates = {
                cy1: parentRect.top,
                cy2: parentRect.top + parentRect.clientHeight,
                cx1: parentRect.left,
                cx2: parentRect.left + parentRect.clientWidth
            }
        }

        let coordinatesAbs = cloneObject(coordinates);

        this.coordinateToRelative(coordinates, parentRect);

        let gridItemStyle = {...(this.state.gridItemStyle || this.props.defaultGridItemStyle)};
        gridItemStyle.gridArea = `${gridArea.y1}/${gridArea.x1}/${gridArea.y2}/${gridArea.x2}`;

        let centerX = (relativeX  - coordinates.cx1) + width / 2;
        let centerY = (relativeY  - coordinates.cy1) + height / 2;

        let parentCenterMinusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 - 0.1);
        let parentCenterPlusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 + 0.1);

        let yLineRef = this.props.gridLine.getYlineRef(parent.props.id);
        let cy2IsLastLine = gridArea.y2 === yLineRef.length || isFixed(this);

        let autoDock = this.getFromTempData("autoDock");
        let docks = this.getDocks() || {top: true};

        if (autoDock && !dontAutoDock) {
            if (centerX < parentCenterPlusX && centerX > parentCenterMinusX) {
                // Center X
                delete docks.left;
                delete docks.right;
            } else if (centerX > parentCenterPlusX) {
                delete docks.left;
                docks.right = true;
            } else {
                docks.left = true;
                delete docks.right;
            }

            if (cy2IsLastLine && (relativeY + height >= coordinates.cy2)) {
                delete docks.top;
                docks.bottom = true;
            } else {
                docks.top = true;
                delete docks.bottom;
            }
        }

        console.log("docks", docks, autoDock, dontAutoDock);

        gridItemStyle.alignSelf = "center";
        gridItemStyle.justifySelf = "center";

        let centerDiffX = (centerX - (coordinates.cx2 - coordinates.cx1) / 2);
        let centerDiffY = (centerY - (coordinates.cy2 - coordinates.cy1) / 2);
        if (centerDiffX >= 0) {
            gridItemStyle.marginRight = `${(-centerDiffX * 2 / parentRect.width * 100).toString()}%`;
            gridItemStyle.marginLeft = "0%";
        } else {
            gridItemStyle.marginRight = "0%";
            gridItemStyle.marginLeft = `${(centerDiffX * 2 / parentRect.width * 100).toString()}%`;
        }
        gridItemStyle.marginTop =
            this.getPxOrPcOrValue(
                `${(centerDiffY * 2).toString()}`,
                parentRect.height,
                this.getUnit(gridItemStyle.marginTop));
        gridItemStyle.marginBottom = "0px";

        if (docks.top) {
            gridItemStyle.alignSelf = "start";
            gridItemStyle.marginTop =
                this.getPxOrPcOrValue(
                `${(relativeY - coordinates.cy1).toString()}`,
                    parentRect.height,
                    this.getUnit(gridItemStyle.marginTop));
        } else if (docks.bottom) {
            gridItemStyle.marginTop = "0px";
        }
        if (docks.left) {
            gridItemStyle.justifySelf = "start";
            gridItemStyle.marginLeft =
                this.getPxOrPcOrValue(
                    `${(relativeX - coordinates.cx1).toString()}`,
                    parentRect.width,
                    this.getUnit(gridItemStyle.marginLeft));
        } else if (docks.right) {
            gridItemStyle.marginLeft = "0%";
        }
        if (docks.bottom) {
            gridItemStyle.alignSelf = docks.top ? "stretch": "end";
            gridItemStyle.marginBottom =
                this.getPxOrPcOrValue(
                    `${(coordinates.cy2 - relativeY - height).toString()}`,
                    parentRect.height,
                    this.getUnit(gridItemStyle.marginBottom));
        } else if (docks.top) {
            gridItemStyle.marginBottom = "0px";
        }
        if (docks.right) {
            gridItemStyle.justifySelf = docks.left? "stretch": "end";
            gridItemStyle.marginRight =
                this.getPxOrPcOrValue(
                    `${(coordinates.cx2 - (relativeX + width)).toString()}`,
                    parentRect.width,
                    this.getUnit(gridItemStyle.marginRight));
        } else if (docks.left) {
            gridItemStyle.marginRight = "0%";
        }

        /*if (gridItemStyle.justifySelf !== "stretch") {
            if (centerX < parentCenterPlusX && centerX > parentCenterMinusX) {
                // this is center
                let centerDiff = (centerX - (coordinates.cx2 - coordinates.cx1) / 2);
                gridItemStyle.justifySelf = "center";
                gridItemStyle.marginRight = `0${this.getUnit(gridItemStyle.marginRight)}`;
                gridItemStyle.marginLeft =
                    `${(centerDiff * 2).toFixed(0).toString()}${this.getUnit(gridItemStyle.marginLeft)}`;
            } else if (centerX > parentCenterPlusX) {
                gridItemStyle.justifySelf = "end";
                gridItemStyle.marginRight =
                    `${(coordinates.cx2 - (relativeX + width)).toFixed(0).toString()}${this.getUnit(gridItemStyle.marginRight)}`;
                gridItemStyle.marginLeft = `0${this.getUnit(gridItemStyle.marginLeft)}`;
            } else {
                gridItemStyle.justifySelf = "start";
                gridItemStyle.marginRight = `0${this.getUnit(gridItemStyle.marginRight)}`;
                gridItemStyle.marginLeft =
                    `${(relativeX - coordinates.cx1).toFixed(0).toString()}${this.getUnit(gridItemStyle.marginLeft)}`;
            }

            if (cy2IsLastLine && (relativeY + height >= coordinates.cy2)) {
                gridItemStyle.alignSelf = "end";
                gridItemStyle.marginBottom =
                    `${(coordinates.cy2 - relativeY - height).toFixed(0).toString()}${this.getUnit(gridItemStyle.marginBottom)}`;
                gridItemStyle.marginTop =`0${this.getUnit(gridItemStyle.marginBottom)}`;
            } else {
                gridItemStyle.alignSelf = "start";
                gridItemStyle.marginBottom = `0${this.getUnit(gridItemStyle.marginBottom)}`;
                gridItemStyle.marginTop =
                    `${(relativeY - coordinates.cy1).toFixed(0).toString()}${this.getUnit(gridItemStyle.marginTop)}`;
            }
        } else {
            gridItemStyle.marginRight =
                `${(coordinates.cx2 - (relativeX + width)).toFixed(0).toString()}${this.getUnit(gridItemStyle.marginRight)}`;
            gridItemStyle.marginLeft =
                `${(relativeX - coordinates.cx1).toFixed(0).toString()}${this.getUnit(gridItemStyle.marginLeft)}`;

            gridItemStyle.marginBottom =
                `${(coordinates.cy2 - relativeY - height).toFixed(0).toString()}${this.getUnit(gridItemStyle.marginBottom)}`;
            gridItemStyle.marginTop =
            `${(relativeY - coordinates.cy1).toFixed(0).toString()}${this.getUnit(gridItemStyle.marginTop)}`;
        }*/

        return {gridItemStyle, gridArea, coordinates, coordinatesAbs};
    };

    getPxOrPcOrValue = (value, parentValue, unit) => {
        if (unit === "px") {
            return `${value}px`;
        } else if (unit === "%") {
            return `${parseFloat(value) / parentValue * 100}%`;
        } else {
            return value
        }
    };

    calculateChildGridItem = (child, relativeX, relativeY, parent, width, height, parentRect, fromState, dontAutoDock) => {
        if (this.hasOverride("calculateChildGridItem"))
            return this.callOverride(
                "calculateChildGridItem",child, relativeX, relativeY, parent, width, height, parentRect, fromState, dontAutoDock);

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
        gridItemStyle.gridArea = `${gridArea.y1}/${gridArea.x1}/${gridArea.y2}/${gridArea.x2}`;

        let centerX = (relativeX  - coordinates.cx1) + width / 2;
        let centerY = (relativeY  - coordinates.cy1) + height / 2;

        let parentCenterMinusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 - 0.1);
        let parentCenterPlusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 + 0.1);

        let yLineRef = this.props.gridLine.getYlineRef(parent.props.id);
        let cy2IsLastLine = gridArea.y2 === yLineRef.length || isFixed(this);

        let autoDock = this.getFromTempData("autoDock");
        let docks = this.getDocks() || {top: true};

        if (autoDock && !dontAutoDock) {
            if (centerX < parentCenterPlusX && centerX > parentCenterMinusX) {
                // Center X
                delete docks.left;
                delete docks.right;
            } else if (centerX > parentCenterPlusX) {
                delete docks.left;
                docks.right = true;
            } else {
                docks.left = true;
                delete docks.right;
            }

            if (cy2IsLastLine && (relativeY + height >= coordinates.cy2)) {
                delete docks.top;
                docks.bottom = true;
            } else {
                docks.top = true;
                delete docks.bottom;
            }
        }

        gridItemStyle.alignSelf = "center";
        gridItemStyle.justifySelf = "center";

        let centerDiffX = (centerX - (coordinates.cx2 - coordinates.cx1) / 2);
        let centerDiffY = (centerY - (coordinates.cy2 - coordinates.cy1) / 2);
        if (centerDiffX > 0) {
            gridItemStyle.marginRight = `${(-centerDiffX * 2 / parentRect.width * 100).toString()}%`;
            gridItemStyle.marginLeft = "0%";
        } else {
            gridItemStyle.marginRight = "0%";
            gridItemStyle.marginLeft = `${(centerDiffX * 2 / parentRect.width * 100).toString()}%`;
        }
        gridItemStyle.marginTop =
            this.getPxOrPcOrValue(
                `${(centerDiffY * 2).toString()}`,
                parentRect.height,
                this.getUnit(gridItemStyle.marginTop));
        gridItemStyle.marginBottom = "0px";

        if (docks.top) {
            gridItemStyle.alignSelf = "start";
            gridItemStyle.marginTop =
                this.getPxOrPcOrValue(
                    `${(relativeY - coordinates.cy1).toString()}`,
                    parentRect.height,
                    this.getUnit(gridItemStyle.marginTop));
        } else if (docks.bottom) {
            gridItemStyle.marginTop = "0px";
        }
        if (docks.left) {
            gridItemStyle.justifySelf = "start";
            gridItemStyle.marginLeft =
                this.getPxOrPcOrValue(
                    `${(relativeX - coordinates.cx1).toString()}`,
                    parentRect.width,
                    this.getUnit(gridItemStyle.marginLeft));
        } else if (docks.right) {
            gridItemStyle.marginLeft = "0%";
        }
        if (docks.bottom) {
            gridItemStyle.alignSelf = docks.top ? "stretch": "end";
            gridItemStyle.marginBottom =
                this.getPxOrPcOrValue(
                    `${(coordinates.cy2 - relativeY - height).toString()}`,
                    parentRect.height,
                    this.getUnit(gridItemStyle.marginBottom));
        } else if (docks.top) {
            gridItemStyle.marginBottom = "0px";
        }
        if (docks.right) {
            gridItemStyle.justifySelf = docks.left? "stretch": "end";
            gridItemStyle.marginRight =
                this.getPxOrPcOrValue(
                    `${(coordinates.cx2 - (relativeX + width)).toString()}`,
                    parentRect.width,
                    this.getUnit(gridItemStyle.marginRight));
        } else if (docks.left) {
            gridItemStyle.marginRight = "0%";
        }

        /*
        let parentCenterMinusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 - 0.1);
        let parentCenterPlusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 + 0.1);

        let yLineRef = child.props.gridLine.getYlineRef(parent.props.id);
        let cy2IsLastLine = gridArea.y2 === yLineRef.length || isFixed(child);

        if (gridItemStyle.justifySelf !== "stretch") {
            if (centerX < parentCenterPlusX && centerX > parentCenterMinusX) {
                // child is center
                let centerDiff = (centerX - (coordinates.cx2 - coordinates.cx1) / 2);
                gridItemStyle.justifySelf = "center";
                gridItemStyle.marginRight = `0${child.getUnit(gridItemStyle.marginRight)}`;
                gridItemStyle.marginLeft =
                    `${(centerDiff * 2).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginLeft)}`;
            } else if (centerX > parentCenterPlusX) {
                gridItemStyle.justifySelf = "end";
                gridItemStyle.marginRight =
                    `${(coordinates.cx2 - (relativeX + width)).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginRight)}`;
                gridItemStyle.marginLeft = `0${child.getUnit(gridItemStyle.marginLeft)}`;
            } else {
                gridItemStyle.justifySelf = "start";
                gridItemStyle.marginRight = `0${child.getUnit(gridItemStyle.marginRight)}`;
                gridItemStyle.marginLeft =
                    `${(relativeX - coordinates.cx1).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginLeft)}`;
            }

            if (cy2IsLastLine && (relativeY + height >= coordinates.cy2)) {
                gridItemStyle.alignSelf = "end";
                gridItemStyle.marginBottom =
                    `${(coordinates.cy2 - relativeY - height).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginBottom)}`;
                gridItemStyle.marginTop =`0${child.getUnit(gridItemStyle.marginBottom)}`;
            } else {
                gridItemStyle.alignSelf = "start";
                gridItemStyle.marginBottom = `0${child.getUnit(gridItemStyle.marginBottom)}`;
                gridItemStyle.marginTop =
                    `${(relativeY - coordinates.cy1).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginTop)}`;
            }
        } else {
            gridItemStyle.marginRight =
                `${(coordinates.cx2 - (relativeX + width)).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginRight)}`;
            gridItemStyle.marginLeft =
                `${(relativeX - coordinates.cx1).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginLeft)}`;

            gridItemStyle.marginBottom =
                `${(coordinates.cy2 - relativeY - height).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginBottom)}`;
            gridItemStyle.marginTop =
                `${(relativeY - coordinates.cy1).toFixed(0).toString()}${child.getUnit(gridItemStyle.marginTop)}`;
        }*/

        return {gridItemStyle, gridArea, coordinates, coordinatesAbs};
    };

    coordinateToRelative = (coordinates, parentRect) => {
        coordinates.cx1 -= parentRect.left;
        coordinates.cx2 -= parentRect.left;
        coordinates.cy1 -= parentRect.top;
        coordinates.cy2 -= parentRect.top;
    };

    coordinateToAbsolute = (coordinates, parentRect) => {
        coordinates.cx1 += parentRect.left;
        coordinates.cx2 += parentRect.left;
        coordinates.cy1 += parentRect.top;
        coordinates.cy2 += parentRect.top;
    };

    getUnit = (value) => {
        if (!value)
            return "px";

        if (value.includes("%")) {
            return "%";
        } else {
            return "px";
        }
    };

    getTopLeft = (force) => {
        let size = this.getSize(false, force);
        return {
            top: size.top,
            left: size.left
        }
    };

    pageResizeStart = (e, dir, delta) => {
        if (this.resizing)
            return;

        this.onSelect(true);

        this.resizing = true;

        let runtimeStyle = {...this.state.runtimeStyle};
        // runtimeStyle.position = "fixed";
        // runtimeStyle.gridArea = "auto/auto/auto/auto";
        // runtimeStyle.marginBottom = "auto";
        // runtimeStyle.marginTop = "auto";
        // runtimeStyle.marginLeft = "auto";
        // runtimeStyle.marginRight = "auto";
        runtimeStyle.width = this.getSize().x;
        runtimeStyle.height = this.getSize().y;
        // runtimeStyle.minWidth = "auto";
        // runtimeStyle.minHeight = "auto";
        // runtimeStyle.opacity = 0.7;
        // runtimeStyle.zIndex = 999999;

        // runtimeStyle.top = this.getSize().top;
        // runtimeStyle.left = this.getSize().left;
        // let right = window.innerWidth - runtimeStyle.left - runtimeStyle.width;

        this.resizeData = {
            firstX: runtimeStyle.width,
            firstLeft: this.getSize().left,
            top: this.getSize().top,
            left: this.getSize().left
        };

        this.setRuntimeStyle(runtimeStyle);
        this.setState({dragging: true});
    };

    onResizeStart = (e, dir, delta, group) => {
        if (this.callOverride("onResizeStart", e, dir, delta, group))
            return;

        if (this.resizing)
            return;

        if (this.props.parent)
            this.props.parent.prepareRects();

        this.resizing = true;

        let thisRect = this.getSize(false);

        let runtimeStyle = {...this.state.runtimeStyle};
        runtimeStyle.position = "fixed";
        runtimeStyle.gridArea = "auto/auto/auto/auto";
        runtimeStyle.marginBottom = "auto";
        runtimeStyle.marginTop = "auto";
        runtimeStyle.marginLeft = "auto";
        runtimeStyle.marginRight = "auto";
        runtimeStyle.width = thisRect.width;
        runtimeStyle.height = thisRect.height;
        runtimeStyle.minWidth = "auto";
        runtimeStyle.minHeight = "auto";
        runtimeStyle.zIndex = 99999;

        runtimeStyle.top = thisRect.top;
        runtimeStyle.left = thisRect.left;

        this.resizeData = {
            firstX: runtimeStyle.width,
            firstY: runtimeStyle.height,
            firstTop: runtimeStyle.top,
            firstLeft: runtimeStyle.left,
        };

        this.setRuntimeStyle(runtimeStyle);
        this.setState({dragging: true});
    };

    pageResize = (e, dir, delta) => {
        let runtimeStyle = {...this.state.runtimeStyle};

        let deltaX = delta.x;
        let minWidth = this.props.breakpointmanager.getMinWidth();
        if (dir.includes('e')) {
            if (this.resizeData.firstX <= (-deltaX* 2 + minWidth))
                deltaX = -(this.resizeData.firstX - minWidth) / 2;

            runtimeStyle.width = this.resizeData.firstX + deltaX * 2;
            this.resizeData.left = this.resizeData.firstLeft - deltaX;
            if (this.resizeData.firstLeft - deltaX < 50)
                this.resizeData.left = 50;
        }
        if (dir.includes('w')) {
            if (this.resizeData.firstX <= (deltaX * 2 + minWidth))
                deltaX = (this.resizeData.firstX - minWidth) / 2;
            runtimeStyle.width = this.resizeData.firstX - deltaX * 2;
            this.resizeData.left = this.resizeData.firstLeft + deltaX;
            if (this.resizeData.firstLeft + deltaX < 50)
                this.resizeData.left = 50;
        }

        this.setRuntimeStyle(runtimeStyle);

        this.updateGridLines(
            this.resizeData.top,
            this.resizeData.left,
            window.innerHeight - this.resizeData.top - runtimeStyle.height,
            window.innerWidth - this.resizeData.left - runtimeStyle.width,
            "A"
        );

        this.invalidateSize();
        this.backContainerRef.current.updateAdjustments();

        if (this.props.onPageResize) {
            this.props.onPageResize(runtimeStyle.width, this);
        }
    };

    onResize = (e, dir, delta, group) => {
        if (this.callOverride("onResize", e, dir, delta, group))
            return;

        let runtimeStyle = {...this.state.runtimeStyle};

        let deltaY = delta.y;
        let deltaX = delta.x;
        if (dir.includes('n')) {
            if (this.resizeData.firstY <= deltaY)
                deltaY = this.resizeData.firstY;
            runtimeStyle.height = this.resizeData.firstY - deltaY;
            runtimeStyle.top = this.resizeData.firstTop + deltaY;
        }
        if (dir.includes('s')) {
            if (this.resizeData.firstY <= -deltaY)
                deltaY = -this.resizeData.firstY;
            runtimeStyle.height = this.resizeData.firstY + deltaY;
        }
        if (dir.includes('e')) {
            if (this.resizeData.firstX <= -deltaX)
                deltaX = -this.resizeData.firstX;
            runtimeStyle.width = this.resizeData.firstX + deltaX;
        }
        if (dir.includes('w')) {
            if (this.resizeData.firstX <= deltaX)
                deltaX = this.resizeData.firstX;
            runtimeStyle.width = this.resizeData.firstX - deltaX;
            runtimeStyle.left = this.resizeData.firstLeft + deltaX;
        }

        if (!group)
            this.checkSnapOnResize(runtimeStyle, dir, this.resizeData);

        this.setRuntimeStyle(runtimeStyle);

        if (!group)
            this.setResizeHelpData({
                x: e.clientX,
                y: e.clientY,
                width: (dir.includes('w') || dir.includes('e')) && runtimeStyle.width,
                height: (dir.includes('n') || dir.includes('s')) && runtimeStyle.height,
            });

        if (!group)
            this.updateGridLines(
                runtimeStyle.top,
                runtimeStyle.left,
                window.innerHeight - runtimeStyle.top - runtimeStyle.height,
                window.innerWidth - runtimeStyle.left - runtimeStyle.width,
                "A"
            );

        this.invalidateSize();

        this.props.select.updateMiniMenu();
    };

    setResizeHelpData = (resizeHelpData) => {
        this.setState({resizeHelpData})
    };

    pageResizeStop = (e, dir, delta) => {
        let {width, height} = this.state.runtimeStyle;
        this.setPageSize(this.resizeData.top, this.resizeData.left, width, height);
    };

    setPageSize = (top, left, width, height) => {
        this.setProps("width", width, undefined, undefined,
            this.props.breakpointmanager.getHighestBpName());

       /* if (this.resizeData.left === 50) {
            let gridItemStyle = this.getCompositeFromData("gridItemStyle");
            gridItemStyle.marginLeft = "50px";
            this.setGridItemStyle(gridItemStyle, this.props.breakpointmanager.getHighestBpName());
        } else {
            let gridItemStyle = this.getCompositeFromData("gridItemStyle");
            gridItemStyle.marginLeft = 0;
            this.setGridItemStyle(gridItemStyle, this.props.breakpointmanager.getHighestBpName());
        }*/

        this.setRuntimeStyle();
        this.invalidateSize();
        this.setState({dragging: false}, () => {
            this.addToSnap();
        });
        this.resizing = false;

        this.updateGridLines(
            top, left,
            window.innerHeight - top - height,
            window.innerWidth - left - width,
            "A"
        );

        this.props.select.onScrollItem(this);
        this.prepareRects(true);

        if (this.props.onPageResizeStop)
            this.props.onPageResizeStop(width, this);

        this.resizeData = undefined;
    };

    onResizeStop = (e, dir, delta, group) => {
        if (this.hasOverride("onResizeStop"))
            return this.callOverride("onResizeStop", e, dir, delta, group);

        if (this.props.onItemPreResizeStop) {
            this.props.onItemPreResizeStop(this, e, dir, delta, this.state.runtimeStyle);
        }
        this.getSize(true, true);
        this.resizing = false;

        if (group)
            this.props.parent.prepareRects(true);

        let parentRect = this.props.parent.getSize(false);

        let {top, left, width, height} = this.state.runtimeStyle;
        this.setSize(
            dir, delta, group,
            left - parentRect.left,
            top - parentRect.top, width, height,
            this.resizeData.firstLeft - parentRect.left,
            this.resizeData.firstTop - parentRect.top,
            this.resizeData.firstX,
            this.resizeData.firstY
        );
        this.props.select.updateMiniMenu();
    };

    setSize = (dir, delta, group, relativeX, relativeY, width, height, firstRelativeX,
               firstRelativeY, firstWidth, firstHeight, fromUndoRedo) =>
    {
        if (!fromUndoRedo) {
            let itemId = this.props.id;
            let redoData = [dir, delta, group, relativeX, relativeY, width, height, firstRelativeX,
                firstRelativeY, firstWidth, firstHeight];
            let undoData = [dir, delta, group, firstRelativeX,
                firstRelativeY, firstWidth, firstHeight, undefined,
                undefined, undefined, undefined];
            this.props.undoredo.add((idMan) => {
                idMan.getItem(itemId).onSelect(true);
                idMan.getItem(itemId).props.dragdrop.setMouseOver(idMan.getItem(itemId).props.parent);
                idMan.getItem(itemId).setSize(...redoData, true);
            }, (idMan) => {
                idMan.getItem(itemId).onSelect(true);
                idMan.getItem(itemId).props.dragdrop.setMouseOver(idMan.getItem(itemId).props.parent);
                idMan.getItem(itemId).setSize(...undoData, true);
            });
        }

        if (this.hasOverride("setSize"))
            return this.callOverride("setSize",
                dir, delta, group, relativeX, relativeY, height, width, firstRelativeX,
                firstRelativeY, firstWidth, firstHeight, fromUndoRedo);

        let gridItemStyle, coordinates;
        let calcResult = this.calculateGridItem(relativeX, relativeY, this.props.parent, width, height);

        gridItemStyle = this.props.autoConstraintsOff?  this.getCompositeFromData("gridItemStyle"):
            calcResult.gridItemStyle;
        coordinates = calcResult.coordinates;

        if (gridItemStyle.justifySelf !== "stretch" && this.getCompositeFromData("style").width !== "auto")
            this.setProps("width", width, coordinates);
        else
            this.setProps("width", "auto");
        if (this.getCompositeFromData("style").height === "auto")
            if (this.getCompositeFromData("style").minHeight !== "auto")
                this.setProps("minHeight", height, coordinates);
            else
                this.setProps("minHeight", "auto", coordinates);
        else {
            this.setProps("height", height, coordinates);
            if (this.getCompositeFromData("style").minHeight !== "auto")
                this.setProps("minHeight", height, coordinates);
            else
                this.setProps("minHeight", "auto", coordinates);
        }

        this.setGridItemStyle(gridItemStyle);
        this.setRuntimeStyle();
        this.setResizeHelpData();
        this.invalidateSize();
        this.setState({dragging: false}, () => {
            this.addToSnap();
        });
        this.props.snap.drawSnap();

        if (!group)
            this.updateGridLines(
                this.getSize(false).top, this.getSize(false).left,
                window.innerHeight - this.getSize(false).top - height,
                window.innerWidth - this.getSize(false).left - width,
                "A"
            );

        setTimeout(() => {
            if (!this.mounted)
                return;

            // for fixing helpline
            console.log("onScrollItem3");
            this.props.select.onScrollItem();
        }, 100);

        this.resizeData = undefined;
    };

    checkSnapOnResize = (runtimeStyle, dir, resizeData) => {
        if (this.callOverride("checkSnapOnResize", runtimeStyle, dir, resizeData))
            return;

        let snapDelta1, snapDelta2;
        if (dir.includes("n")) {
            snapDelta1 = this.getSnapDelta(
                runtimeStyle.top, runtimeStyle.left);
        } else if (dir.includes("s")) {
            snapDelta1 = this.getSnapDelta(
                runtimeStyle.top + runtimeStyle.height, runtimeStyle.left);
        }
        if (dir.includes("w")) {
            snapDelta2 = this.getSnapDelta(
                runtimeStyle.top, runtimeStyle.left);
        } else if (dir.includes("e")) {
            snapDelta2 = this.getSnapDelta(
                runtimeStyle.top, runtimeStyle.left + runtimeStyle.width);
        }

        let snapDelta = {
            deltaX: snapDelta2? snapDelta2.deltaX: 0,
            deltaY: snapDelta1? snapDelta1.deltaY: 0,
            snapH: snapDelta1 && snapDelta1.snapH,
            snapV: snapDelta2 && snapDelta2.snapV
        };

        if (dir.includes("n")) {
            runtimeStyle.height -= snapDelta.deltaY;
            runtimeStyle.top += snapDelta.deltaY;
        } else if (dir.includes("s")) {
            runtimeStyle.height += snapDelta.deltaY;
        }
        if (dir.includes("w")) {
            runtimeStyle.width -= snapDelta.deltaX;
            runtimeStyle.left += snapDelta.deltaX;
        } else if (dir.includes("e")) {
            runtimeStyle.width += snapDelta.deltaX;
        }

        let pointOfSnapH = {
            p1: runtimeStyle.left,
            p2: runtimeStyle.left + runtimeStyle.width
        };
        let pointOfSnapV = {
            p1: runtimeStyle.top,
            p2: runtimeStyle.top + runtimeStyle.height
        };

        this.props.snap.drawSnap(snapDelta.snapH, snapDelta.snapV, pointOfSnapH, pointOfSnapV);
    };

    setProps = (prop, value, gridCoordinates, data, breakpointName) => {
        if (this.hasOverride("setProps"))
            return this.callOverride("setProps", prop, value, gridCoordinates, data, breakpointName);

        if (prop === "width" || prop === "height" ||
            prop === "minWidth" || prop === "minHeight" ||
            prop === "maxWidth" || prop === "maxHeight")
        {
            this.setNewSize(prop, value, gridCoordinates, data, breakpointName);
        } else {
            this.setDataInBreakpoint(prop, value, data, breakpointName);
        }
    };

    setDataInBreakpoint = (prop, value, data, breakpointName) => {
        this.props.breakpointmanager.setData(data || this.props.griddata, prop, value, breakpointName);
        this.onPropsChange.trigger();
    };

    setTempData = (prop, value, data) => {
        let dataToWrite = data || this.props.griddata;
        dataToWrite[prop] = value;
        this.onPropsChange.trigger();
    };

    getFromTempData = (prop, data) => {
        let dataToRead = data || this.props.griddata;
        return dataToRead[prop];
    };

    hasDataInBreakPoint = (prop, data, breakpointName) => {
        return this.props.breakpointmanager
            .hasDataInBreakPoint(data || this.props.griddata, prop, breakpointName);
    };

    getFromData = (prop, data, breakpointName) => {
        return this.props.breakpointmanager
            .getFromData(data || this.props.griddata, prop, breakpointName)
    };

    getCompositeFromData = (prop, data) => {
        return this.props.breakpointmanager
            .getCompositeFromData(data || this.props.griddata, prop, undefined)
    };

    setNewSize = (prop, value, gridCoordinates, data, breakpointName) => {
        if (this.hasOverride("setNewSize"))
            return this.callOverride("setNewSize", prop, value, gridCoordinates, data, breakpointName);

        let oldStyle = this.getCompositeFromData("style", data, breakpointName);
        let oldValue = oldStyle && oldStyle[prop];

        if (!oldValue || !this.isPercent(oldValue) || value === "auto" || isNaN(value)) {
            if (!isNaN(value)) {
                value+="px";
            }
            this.setStyleParam(prop, value, data, breakpointName);
            return;
        }

        let parentRect = {
            width: gridCoordinates? (gridCoordinates.cx2 - gridCoordinates.cx1): window.innerWidth,
            height: gridCoordinates?(gridCoordinates.cy2 - gridCoordinates.cy1): window.innerHeight
        };
        let newValue = (value / parentRect[this.getParentProps(prop)] * 100).toString() + "%";
        this.setStyleParam(prop, newValue, data, breakpointName);
    };

    getParentProps = (prop) => {
        if (prop === "width" ||
            prop === "minWidth" ||
            prop === "maxWidth")
        {
            return "width";
        }

        return "height";
    };

    isPercent = (value) => {
        if (isNaN(value)) {
            if (value.includes("%"))
                return true;
        }

        return false;
    };

    setRuntimeStyle = (newRuntimeStyle) => {
        if (this.callOverride("setRuntimeStyle", newRuntimeStyle))
            return;

        let runtimeStyle = newRuntimeStyle && {...newRuntimeStyle};
        this.setState({runtimeStyle});
        this.onPropsChange.trigger();
    };

    getGridItemStyleId = () => {
        return `style_grid_item_${this.props.id}`;
    };

    setGridItemStyle = (newGridItemStyle, breakpointName, dontOverride) => {
        if (this.callOverride("setGridItemStyle", newGridItemStyle, breakpointName, dontOverride))
            return;

        let gridItemStyle = {...newGridItemStyle};

        if (!dontOverride)
            this.setDataInBreakpoint("gridItemStyle", gridItemStyle, undefined, breakpointName);

        let styleNode = document.getElementById(this.getGridItemStyleId());

        if (!styleNode) {
            appendStyle(this.getCompositeFromData("gridItemStyle"),
                this.getGridItemStyleId(), this.getGridItemStyleId(), this);
        } else {
            updateStyle(styleNode, this.getCompositeFromData("gridItemStyle"), this.getGridItemStyleId());
        }

        this.onPropsChange.trigger();
    };

    setGridArea = (gridArea, breakpointName) => {
        if (this.callOverride("setGridArea", gridArea))
            return;

        let gridItemStyle = this.getFromData("gridItemStyle");
        gridItemStyle.gridArea = gridArea;

        this.setGridItemStyle(gridItemStyle, breakpointName);
    };

    getGridArea = () => {
        if (this.callOverride("getGridArea"))
            return;

        let gridItemStyle = this.getCompositeFromData("gridItemStyle");
        return gridItemStyle.gridArea;
    };

    setStyleParam = (param, value, data, breakpointName) => {
        if (this.hasOverride("setStyleParam"))
            return this.callOverride("setStyleParam", param, value, data, breakpointName);

        let style = this.hasDataInBreakPoint("style", data, breakpointName) || {};
        style[param] = value;
        if (value === undefined)
            delete style[param];
        this.setStyle(style, data, breakpointName);
    };

    getStyleId = () => {
        return `style_${this.props.id}`;
    };

    getDesignStyleId = () => {
        return `style_design_${this.props.id}`;
    };

    setDesignStyle = (newDesignStyle, data, breakpointName, dontOverride) => {
        if (this.callOverride("setDesignStyle", newDesignStyle, data, breakpointName, dontOverride))
            return;

        let designStyle = {...newDesignStyle};
        if (!dontOverride)
            this.setDataInBreakpoint("designStyle", designStyle, data, breakpointName);

        if (!data) {
            let designStyleNode = document.getElementById(this.getDesignStyleId());

            if (!designStyleNode) {
                appendStyle(this.getCompositeFromData("designStyle"),
                    this.getDesignStyleId(), this.getDesignStyleId(), this);
            } else {
                updateStyle(designStyleNode, this.getCompositeFromData("designStyle"), this.getDesignStyleId());
            }

            this.invalidateSize();
            this.addToSnap();
        }

        this.onPropsChange.trigger();
    };

    getTransformStyleId = () => {
        return `style-transform-${this.props.id}`;
    };

    setTransformStyle = (newTransform, data, breakpointName, dontOverride) => {
        if (this.callOverride("setTransformStyle", newTransform, data, breakpointName, dontOverride))
            return;

        let transform = {...newTransform};
        if (!dontOverride)
            this.setDataInBreakpoint("transform", transform, data, breakpointName);

        if (!data) {
            let transformStyleNode = document.getElementById(this.getTransformStyleId());

            if (!transformStyleNode) {
                appendStyle(this.getTransformStyle(),
                    this.getTransformStyleId(), this.getTransformStyleId(), this);
            } else {
                updateStyle(transformStyleNode, this.getTransformStyle(), this.getTransformStyleId());
            }
        }

        this.onPropsChange.trigger();
    };

    getTransformStyle = (compositeTransform) => {
        if (!compositeTransform)
            compositeTransform = this.getCompositeFromData("transform") || {};

        let rules = [];

        // TODO add more rules
        compositeTransform.rotateDegree && rules.push(`rotate(${compositeTransform.rotateDegree}deg)`);

        return {transform: rules.join(' ')};
    };

    setStyle = (newStyle, data, breakpointName, dontOverride) => {
        if (this.callOverride("setStyle", newStyle, data, breakpointName, dontOverride))
            return;

        let style = {...newStyle};

        if (!dontOverride)
            this.setDataInBreakpoint("style", style, data, breakpointName);

        if (!data) {
            let styleNode = document.getElementById(this.getStyleId());

            if (!styleNode) {
                appendStyle(this.getCompositeFromData("style"), this.getStyleId(), this.getStyleId(), this);
            } else {
                updateStyle(styleNode, this.getCompositeFromData("style"), this.getStyleId());
            }

            this.invalidateSize();
            this.addToSnap();
        }

        this.onPropsChange.trigger();
    };

    clearFromAllBp = (props, data, excludeBp) => {
        let sortedBp = this.props.breakpointmanager.getSortedBreakPoints();
        sortedBp.forEach( bp => {
            if (excludeBp !== bp.name || !excludeBp.includes(bp.name))
                this.setDataInBreakpoint(props, undefined, data, bp.name);
        });
    };

    setGrid = (grid, callback, breakpointName) => {
        if (this.callOverride("setGrid", grid, callback, breakpointName))
            return;

        this.setDataInBreakpoint("grid", grid, undefined, breakpointName);
        this.setState({grid: grid}, () => {
            if (this.props.gridLine.hasGridLine(this.props.id)) {
                let size = this.getSize(false);
                this.updateGridLines(
                    size.top,
                    size.left,
                    size.top + size.clientHeight,
                    size.left + size.clientWidth,
                    this.props.gridLine.hasGridLine(this.props.id)
                );
            }

            if (callback)
                callback();
        });
    };

    getGridLineOfPoint = (left, top, parent, after = false, parentRect) => {
        if (!parentRect)
            parentRect = parent.getSize(false);
        let x;
        let cx;
        let xLineRef = this.props.gridLine.getXlineRef(parent.props.id);
        for(let i = 0; i < xLineRef.length; i++) {
            let rect = xLineRef[i].current.rect;
            if (left < rect.left || (after && left <= rect.left)) {
                x = i;
                if (!after) {
                    if (xLineRef[i - 1]) {
                        // rect = xLineRef[i - 1].current.getBoundingClientRect();
                        rect = xLineRef[i - 1].current.rect;
                        cx = rect.left;
                    } else {
                        cx = parentRect.left - parentRect.scrollLeft;
                    }
                } else {
                    cx = rect.left;
                }
                break;
            }
        }
        if (x === undefined) {
            x = xLineRef.length;
            // let rect = xLineRef[xLineRef.length - 1].current.getBoundingClientRect();
            let rect = xLineRef[xLineRef.length - 1].current.rect;
            cx = rect.left;
        }

        let y;
        let cy;
        let yLineRef = this.props.gridLine.getYlineRef(parent.props.id);
        for(let i = 0; i < yLineRef.length; i++) {
            // let rect = yLineRef[i].current.getBoundingClientRect();
            let rect = yLineRef[i].current.rect;
            if (top < rect.top || (after && top <= rect.top)) {
                y = i;
                if (!after) {
                    if (yLineRef[i - 1]) {
                        // rect = yLineRef[i - 1].current.getBoundingClientRect();
                        rect = yLineRef[i - 1].current.rect;
                        cy = rect.top;
                    } else {
                        cy = parentRect.top - parentRect.scrollTop;
                    }
                } else {
                    cy = rect.top;
                }
                break;
            }
        }
        if (y === undefined) {
            y = yLineRef.length;
            // let rect = yLineRef[yLineRef.length - 1].current.getBoundingClientRect();
            let rect = yLineRef[yLineRef.length - 1].current.rect;
            cy = rect.top;
        }

        if (after) {
            x++;
            y++;
        }

        x = Math.max(1, x);
        x = Math.min(xLineRef.length, x);
        y = Math.max(1, y);
        y = Math.min(yLineRef.length, y);

        if (x === xLineRef.length)
            cx++;
        if (y === yLineRef.length)
            cy++;

        return {x, y, cx, cy};
    };

    calculateGridArea = (left, top, width, height, parent, parentRect) => {
        let gridLine1 = this.getGridLineOfPoint(left, top, parent, false, parentRect);
        let gridLine2 = this.getGridLineOfPoint(left + width, top + height, parent, true, parentRect);
        return {
            gridArea: {x1: gridLine1.x, y1: gridLine1.y, x2: gridLine2.x, y2: gridLine2.y},
            coordinates: {cx1: gridLine1.cx, cy1: gridLine1.cy, cx2: gridLine2.cx, cy2: gridLine2.cy}
        };
    };

    onMouseDown = (e) => {
        if (this.isLeftClick(e)) {
            e.stopPropagation();
            e.preventDefault();
            this.mouseDown = true;
            this.mouseMoved = {
                deltaX: 0,
                deltaY: 0,
                lastClientX: e.clientX,
                lastClientY: e.clientY,
                startMillis: (new Date()).getTime()
            };
            window.addEventListener("mousemove", this.onMouseMove);
            window.addEventListener("mouseup", this.onMouseUp);
        }
    };

    isLeftClick = (e) => {
        if (e.button === 0)
            return true;

        return false;
    };

    onMouseMove = (e) => {
        if (!this.mouseDown)
            return;

        this.mouseMoved.deltaX += (e.clientX - this.mouseMoved.lastClientX);
        this.mouseMoved.deltaY += (e.clientY - this.mouseMoved.lastClientY);
        this.mouseMoved.lastClientX = e.clientX;
        this.mouseMoved.lastClientY = e.clientY;

        if (!this.moving) {
            let currentMillis = new Date().getTime();
            if (Math.abs(this.mouseMoved.deltaX) > 10 ||
                Math.abs(this.mouseMoved.deltaY) > 10 ||
                currentMillis - this.mouseMoved.startMillis > 500)
            {
                if (!this.state.groupSelected && this.getFromTempData("draggable") && !this.state.selected) {
                    this.onSelect(true);
                }
                this.moving = true;
                this.canMove() && this.onDragStart(e, isGroupSelected(this), true);
            }
        } else {
            this.canMove() && this.onDrag(e, isGroupSelected(this), true);
        }
    };

    canMove = () => {
        return (this.state.selected || this.state.groupSelected) && this.getFromTempData("draggable");
    };

    onMouseUp = (e) => {
        if (!this.mouseDown)
            return;

        let currentMillis = new Date().getTime();
        if (!this.moving && currentMillis - this.mouseMoved.startMillis < 500) {
            if (!this.dropped) {
                e.stopPropagation();
                this.onSelect(true, undefined, undefined, true);
            } else {
                this.dropped = false;
            }
        }

        if (this.moving) {
            this.canMove() && this.onDragStop(e, isGroupSelected(this), true);
        }

        this.moving = false;
        this.mouseDown = false;

        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    };

    onSelect = (selected, callback, deselectParent, clicked) => {
        if (this.callOverride("onSelect", selected, callback, deselectParent))
            return;

        if (!this.mounted)
            return;
        if (!this.props.isSelectable)
            return;

        if (selected) {
            this.getSize(true, true);
            this.props.select.selectItem(this, clicked);
            this.toggleGridLines(selected, undefined, "A");
        }
        if (this.props.parent) {
            if (selected || deselectParent)
                this.props.parent.toggleGridLines(selected, () => {
                    this.toggleHelpLines(selected && this.props.parent);
                }, "B");
        } else {
            selected && this.props.gridLine.removeGridLineByType("B");
        }

        this.setTempData("selected", selected);

        if (!this.mounted)
            return;
        this.setState({selected, groupSelected: false}, callback);
    };

    toggleGridLines = (showGridLines, callback, gridType) => {
        if (this.callOverride("toggleGridLines", showGridLines, callback, gridType))
            return;

        if (!this.mounted)
            return;

        if (!showGridLines) {
            this.props.gridLine.removeGridLine(this.props.id);
            return;
        }

        if (this.props.gridLine.hasGridLine(this.props.id, gridType)) {
            if (callback)
                callback();
            return;
        }

        let grid = this.getCompositeFromData("grid");
        console.log("grid", this.props.id, this.props.griddata, grid);
        let rect = this.getSize(false, true);
        this.props.gridLine.addGrid(
            this.props.id,
            grid.x,
            grid.y,
            gridType,
            grid.gridTemplateRows,
            grid.gridTemplateColumns,
            {
                top: rect.top,
                left: rect.left,
                bottom: window.innerHeight - rect.top - rect.height,
                right: window.innerWidth - rect.left - rect.width,
            },
            callback
        )
    };

    toggleHelpLines = (helpLinesParent, callback) => {
        if (this.callOverride("toggleHelpLines", helpLinesParent, callback))
            return;

        if (this.mounted) {
            this.setState({
                helpLinesParent: helpLinesParent !== this && helpLinesParent
            }, callback);
        }
    };

    onScroll = (e) => {
        if (this.callOverride("onScroll", e))
            return;

        console.log("onScrollItem1");
        this.props.select.onScrollItem(e, this);
        this.onScrollEnd(e);
    };

    onScrollEnd = debounce((e) => {
        if (this.callOverride("onScrollEnd", e))
            return;

        this.invalidateSize();
        this.addToSnap();
    }, 500);

    editGrid = () => {
        this.props.gridEditorRef.current.editing(this);
    };

    updateGridEditor = () => {
        this.props.gridEditorRef.current.update(this);
    };

    setAnchor = (anchor) => {
        if (this.callOverride("setAnchor", anchor))
            return;

        this.setTempData("anchor", anchor);
        this.updateLayout();
    };

    playAnimation = (disable) => {
        let compositeDesign = getCompositeDesignData(this);
        if (!compositeDesign.animation)
            return;

        // Component going to show animation, so add end listener for more action
        let onAnimationEnd = DynamicAnimations[compositeDesign.animation.name].onAnimationEnd;

        let stateChange = {
            forceKey: "animationReplay",
            showAnimation: true,
            onAnimationEnd
        };
        if (disable) stateChange.disableVS = true;

        this.setState(stateChange);
    };

    onAnimationEnd = () => {
        this.setState({forceKey: undefined, showAnimation: undefined});
    };

    getCompositeAnimationCss = (compositeAnimation) => {
        if (!(compositeAnimation && this.state.forceKey && this.state.showAnimation))
            return;

        return DynamicAnimations[compositeAnimation.name]
            .getAnimationCSS(this, compositeAnimation.options);
    };

    render () {
        let compositeDesign = getCompositeDesignData(this);
        let classes = classNames(
            !this.state.hover? "AwesomeGridLayoutRoot": "AwesomeGridLayoutRootHover",
            "AwesomeGridLayoutGrid",
            this.canMove() && "AwesomeGridLayoutCursorMove",
            this.props.className,
            this.getDesignStyleId(),
            this.getGridItemStyleId(),
            this.getStyleId(),
        );

        let holderClasses = classNames(
            "AwesomeGridLayoutHolder",
            this.getTransformStyleId(),
            this.getCompositeAnimationCss(compositeDesign.animation)
        );

        let size = this.getSize(false);

        let TagAs = this.props.as || "div";

        return (
            <Portal nodeId={this.state.portalNodeId} disabled={!this.state.portalNodeId}
                document={this.props.document}
            >
                <VisibilitySensor
                    partialVisibility onChange={(v) => {
                        if (compositeDesign.animation && compositeDesign.animation.once && v) {
                            !this.props.editor && this.playAnimation(true);
                            return;
                        }

                        if (compositeDesign.animation && v)
                            !this.props.editor && this.playAnimation();
                    }}
                    containment={this.props.select.getPageOverflowRef()}
                    active={compositeDesign.animation && !this.state.disableVS}
                >
                        <TagAs
                            onMouseDown={!this.state.showAnimation ? this.onMouseDown : undefined}
                            onMouseOver={this.onMouseOver}
                            onMouseEnter={this.onMouseEnter}
                            onMouseOut={this.onMouseOut}
                            id={this.props.id}
                            className={classes}
                            style={this.state.runtimeStyle}
                            ref={this.rootDivRef}
                            key={this.props.id}
                        >
                            {
                                this.state.selected && this.getFromTempData("resizable") &&
                                !this.state.showAnimation &&
                                !isGroupSelected(this) &&
                                <AdjustmentResize
                                    id={this.props.id}
                                    key={`${this.props.id}_resize`}
                                    sides={this.props.resizeSides || ['n','s','e','w','ne','nw','se','sw']}
                                    onResizeStart={this.onResizeStart}
                                    onResize={this.onResize}
                                    onResizeStop={this.onResizeStop}
                                    draggingStart={this.state.draggingStart}
                                    isStretch={isStretch(this)}
                                    allowStretch={allowStretch(this)}
                                    itemId={this.props.id}
                                    idMan={this.props.idMan}
                                    transform={this.getCompositeFromData("style").transform}
                                    data={
                                        this.getBoundarySize(false)
                                    }
                                    document={this.props.document}
                                />
                            }

                            {
                                this.getFromTempData("pageResize") &&
                                !this.state.showAnimation &&
                                <AdjustmentResizePage
                                    id={this.props.id}
                                    key={`${this.props.id}_resize`}
                                    sides={['e','w']}
                                    onResizeStart={this.pageResizeStart}
                                    onResize={this.pageResize}
                                    onResizeStop={this.pageResizeStop}
                                    data={this.state.runtimeStyle || size}
                                    top={(this.resizeData && this.resizeData.top) || (size && size.top)}
                                    left={(this.resizeData && this.resizeData.left) || (size && size.left)}
                                    width={(this.state.runtimeStyle && this.state.runtimeStyle.width) || (size && size.width)}
                                    height={(this.state.runtimeStyle && this.state.runtimeStyle.height) || (size && size.height)}
                                    draggingStart={this.state.draggingStart}
                                    itemId={this.props.id}
                                    document={this.props.document}
                                />
                            }

                            {
                                !this.state.showAnimation &&
                                <AdjustmentHelpLines
                                    show={!this.props.helplineOff && this.state.selected &&
                                    this.state.helpLinesParent && !this.getFromTempData("pageResize") &&
                                    !isGroupSelected(this)}
                                    helpLinesParent={this.state.helpLinesParent}
                                    item={this}
                                    dragging={this.state.dragging}
                                    itemRect={this.state.dragging? this.getSize(false, true): size}
                                    width={this.state.runtimeStyle? this.state.runtimeStyle.width : undefined}
                                    height={this.state.runtimeStyle? this.state.runtimeStyle.height : undefined}
                                    document={this.props.document}
                                />
                            }

                            {
                                this.state.selected && this.state.resizeHelpData &&
                                !this.getFromTempData("pageResize") &&
                                !this.state.showAnimation &&
                                !isGroupSelected(this) &&
                                <AdjustmentHelpSize
                                    resizeHelpData={this.state.resizeHelpData}
                                />
                            }

                            <div
                                className={holderClasses}
                                key={this.state.forceKey || `${this.props.id}_container`}
                                id={`${this.props.id}_child_holder`}
                                onAnimationEnd={this.onAnimationEnd}
                            >
                            {
                                this.props.getStaticChildren && this.props.getStaticChildren()
                            }

                                {
                                    console.log("document", this.props.document, this.props.id)
                                }
                            <GridChildContainer
                                id={this.props.id}
                                key={`${this.props.id}_container`}
                                allChildren={this.children}
                                grid={this.state.grid}
                                overflowData={this.getCompositeFromData("overflowData")}
                                showGridLines={this.state.showGridLines}
                                aglStyle={this.getCompositeFromData("style")}
                                overflowRef={this.overflowRef}
                                containerRef={this.containerRef}
                                show={this.props.griddata.isContainer}
                                onScroll={this.onScroll}
                                isPage={this.props.isPage}
                                page={this.props.page}
                                ref={this.backContainerRef}
                                size={this.state.runtimeStyle || size}
                                getChildrenOverride={this.props.getChildrenOverride}
                                agl={this}
                                modifyContainerStyleOverride={this.props.modifyContainerStyleOverride}
                                document={this.props.document}
                            />
                            </div>

                            <AGLAnchor
                                anchor={this.getFromTempData("anchor")}
                            />

                            {
                                this.state.dragging && this.props.parent &&
                                <Portal nodeId={this.state.portalNodeId || `${this.props.parent.props.id}_container`}
                                        document={this.props.document}
                                >
                                    <div
                                        style={{
                                            ...this.getCompositeFromData("gridItemStyle"),
                                            ...this.getCompositeFromData("style"),
                                            opacity: 0,
                                            pointerEvents: "none"
                                        }}
                                    />
                                </Portal>
                            }
                        </TagAs>
                </VisibilitySensor>
            </Portal>
        )
    }
}

AwesomeGridLayout2.defaultProps = {
    width: "100%",
    height: "100%",
    childSize: {w: "100%", h: "100%"},
    showSideResize: false,
    isSelectable: true,
    layoutType: "free", // free, grid
    snap: {x: 1, y: 1},
    dir: "rtl", // rtl, ltr,
    compactType: "vertical", // none, vertical, horizontal
    defaultGrid: {
        x: 1,
        y: 1,
        gridTemplateRows: "1fr",
        gridTemplateColumns: "1fr"
    },
    defaultStyle: {
        width: "50%",
        height: "50%",
    },
    defaultGridItemStyle: {
        alignSelf: "center",
        justifySelf: "center",
        position: "relative",
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        gridArea: "1/1/2/2",
    }
};

import React from "react";
import debounce from 'lodash.debounce';
import {appendStyle, cloneObject, initGriddata, updateStyle} from "./AwesomeGridLayoutUtils";
import './AwesomeGridLayout.css';
import GridChildContainer from "./GridChildContainer";
import DynamicComponents, {DynamicAnimations} from "./Dynamic/DynamicComponents";
import classNames from "classnames";
import Portal from "./Portal";
import {
    createItem,
    getCompositeDesignData, getPxValueFromCSSValue, getResizeDelta, getViewRatioStyle,
    isFixed,
    isGroupSelected, isRightClick, isStretch, stretch,
} from "./AwesomwGridLayoutHelper";
import AGLAnchor from "./AGLAnchor";
import AdjustmentResizePage from "./Adjustment/AdjustmentResizePage";
import EventTrigger from "./Test/EventTrigger";
import {
    addToCache,
    getCachedBoundingRect,
    getCachedClientHeight, getCachedScrollLeft,
    getCachedScrollTop,
    getCachedClientWidth, getCachedScrollHeight, getCachedScrollWidth
} from "./Test/WindowCache";
import AnimationHolder from "./AnimationHolder";
import VisibilitySensorWrapper from "./Test/VisibilitySensorWrapper";
import AdjustmentHelpSize from "./Adjustment/AdjustmentHelpSize";

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
        this.overflowRef = !props.isPage? React.createRef(): this.rootDivRef;
        this.containerRef = React.createRef();
        this.backContainerRef = React.createRef();
        this.transformRef = React.createRef();
        this.allChildRefs = {};

        this.children = {};

        initGriddata(props.griddata, this.props.breakpointmanager);

        this.props.idMan.setItem(this.props.id, this);

        this.onPropsChange = new EventTrigger(this);

        if (this.props.id === "page")
            console.log("AwesomeGridLayout2 constructor", props.griddata.bpData.laptop.grid)

    }

    componentDidMount () {
        this.mounted = true;

        if (this.props.isPage) {
            let el = this.rootDivRef.current;
            if (el.scrollHeight - el.clientHeight === 0)
                document.documentElement.style.setProperty('--page-scroll', 0);
            else
                document.documentElement.style.setProperty('--page-scroll',
                    el.scrollTop / (el.scrollHeight - el.clientHeight));
        }

        this.init();
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (this.needRender) {
            delete this.needRender;
            this.updateLayout(() => {
                this.isEditor() ? this.onSelect(this.getFromTempData("selected"), this.lateMounted) : this.lateMounted();
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.isEditor() && this.props.editor.updateLayout();
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

        let style = this.getCompositeFromData("style") || this.getDefaultStyle();

        this.setTransformStyle(this.getCompositeFromData("transform"), undefined,
            this.props.breakpointmanager.getHighestBpName());
        this.setGridItemStyle(this.getCompositeFromData("gridItemStyle") ||
            this.props.defaultGridItemStyle,
            this.props.breakpointmanager.getHighestBpName());

        if (this.props.isPage)
            style.width = this.props.style.width;

        this.setStyle(style, undefined,
            this.props.breakpointmanager.getHighestBpName());

        this.setGrid(this.getCompositeFromData("grid") || this.props.defaultGrid, undefined,
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

        let size = this.getSize(false, true, true);
        this.addToSnap();

        let baseDocks = this.getBaseDocks();
        this.setDocks(baseDocks.top, baseDocks.left, baseDocks.bottom, baseDocks.right,
            this.getFromTempData("autoDock"),
            this.props.breakpointmanager.getHighestBpName(), true);

        if (this.props.onPageResize) {
            this.props.onPageResize(size.width, this, true);
        }

        if (!this.onChildMountedCalled) {
            this.onChildMountedCalled = true;
            this.props.onChildMounted && this.props.onChildMounted(this);
        }
        this.isEditor() && this.props.editor.updateLayout();
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

    addToSnap = debounce(() => {
        if (this.callOverride("addToSnap"))
            return;

        // let rect = this.getSize(false);
        let rect = this.getBoundarySize() || this.getSize(false);
        if (rect) {
            this.props.snap.addSnap(this.props.id,
                [
                    {
                        id: this.props.id,
                        value: rect.top,
                        p1: rect.left,
                        p2: rect.left + rect.width
                    },
                    !this.props.isPage && {
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
                    !this.props.isPage && {
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
        }

        Object.values(this.allChildRefs).forEach(childRef => {
            if (childRef && childRef.current){
                childRef.current.addToSnap();
            }
        });
    }, 500);

    getParentsId = () => {
        let parentsId = [];
        let parent = this.props.parent;

        while (parent) {
            parentsId.push(parent.props.id);
            parent = parent.props.parent;
        }

        return parentsId;
    };

    getContainerParent = () => {
        if (this.getFromTempData("isContainer"))
            return this;

        let containerParent;
        let parent = this.props.parent;

        while (!containerParent) {
            if (parent.getFromTempData("isContainer")) {
                containerParent = parent;
            } else {
                parent = parent.props.parent;
            }
        }

        return containerParent;
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
            // let current = xLineRef[i].current;
            let rect = this.getGridLineRect(xLineRef[i], i, 'x', this);
            if (!rect)
                continue;

            // let rect = current.getBoundingClientRect();
            // let rect = current.rect;
            snaps.verticals.push({
                id: this.props.id,
                value: rect.left + ((i === xLineRef.length - 1)? 1: 0),
                p1: rect.top,
                p2: rect.top + rect.height
            });
        }
        let yLineRef = this.props.gridLine.getYlineRef(this.props.id);
        for(let i = 0; i < yLineRef.length; i++) {
            // let current = yLineRef[i].current;
            let rect = this.getGridLineRect(yLineRef[i], i, 'y', this);
            if (!rect)
                continue;

            // let rect = current.getBoundingClientRect();
            // let rect = current.rect;
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

        if (this.getFromTempData("isFixed", props.griddata))
            fixed = true;

        let AGLProps = {};
        if (tagName[0] == tagName[0].toUpperCase()) {
            AGLProps = {
                aglRef: this.allChildRefs[props.id],
                viewRef: this.props.viewRef,
                breakpointmanager: this.props.breakpointmanager,
                undoredo: this.props.undoredo,
                dragdrop: this.props.dragdrop,
                select: this.props.select,
                snap: this.props.snap,
                idMan: this.props.idMan,
                input: this.props.input,
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
                portalNodeId: (fixed && `${this.props.id}_fixed_holder`),
                ...this.getAllChildOverrideProps()
            };
        }

        let component = tagName[0] === tagName[0].toUpperCase()? dynamicComponents[tagName]: tagName;

        if (tagName[0] !== tagName[0].toUpperCase())
            delete props.griddata;

        return React.createElement(
            component,
            {
                ...props,
                key: props.id,
                ...AGLProps,
            }
        );
    };

    getSize = (updateState = true, force, fullForce) => {
        if (!this.rootDivRef.current)
            return;

        if (this.tempSize && !force)
            return cloneObject(this.tempSize);

        let rect = fullForce ? this.rootDivRef.current.getBoundingClientRect() :
            getCachedBoundingRect(this.props.id, this.rootDivRef.current);

        let clientWidth = rect.width;
        let clientHeight = rect.height;
        let scrollTop = 0;
        let scrollLeft = 0;
        let scrollWidth = rect.width;
        let scrollHeight = rect.height;
        if (this.overflowRef.current) {
            clientWidth = fullForce ? this.overflowRef.current.clientWidth :
                getCachedClientWidth(this.props.id, this.overflowRef.current);
            clientHeight = fullForce ? this.overflowRef.current.clientHeight :
                getCachedClientHeight(this.props.id, this.overflowRef.current);
            scrollTop = fullForce ? this.overflowRef.current.scrollTop :
                getCachedScrollTop(this.props.id, this.overflowRef.current);
            scrollLeft = fullForce ? this.overflowRef.current.scrollLeft :
                getCachedScrollLeft(this.props.id, this.overflowRef.current);
            scrollWidth = fullForce ? this.overflowRef.current.scrollWidth :
                getCachedScrollWidth(this.props.id, this.overflowRef.current);
            scrollHeight = fullForce ? this.overflowRef.current.scrollHeight :
                getCachedScrollHeight(this.props.id, this.overflowRef.current);
        }

        let padding = cloneObject(this.getCompositeFromData("padding")) || {};
        ['top', 'left', 'bottom', 'right'].forEach(key => {
            padding[key] = getPxValueFromCSSValue(padding[key], 0, this) || 0;
        });
        let temp = {
            x: rect.width,
            y: rect.height,
            clientWidth: clientWidth,
            clientHeight: clientHeight,
            scrollTop: scrollTop,
            scrollLeft: scrollLeft,
            scrollWidth: scrollWidth,
            scrollHeight: scrollHeight,
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            width: rect.width,
            height: rect.height,
            widthMinusPadding: rect.width - (padding.left||0)- (padding.right||0),
            heightMinusPadding: rect.height - (padding.top||0)- (padding.bottom||0),
            scrollWidthMinusPadding: scrollWidth - (padding.left||0)- (padding.right||0),
            scrollHeightMinusPadding: scrollHeight - (padding.top||0)- (padding.bottom||0)
        };

        this.tempSize = temp;

        if (fullForce) {
            addToCache(this.props.id, this.tempSize, "boundingRects");
            addToCache(this.props.id, clientWidth, "clientsWidth");
            addToCache(this.props.id, clientHeight, "clientsHeight");
            addToCache(this.props.id, scrollTop, "scrollsTop");
            addToCache(this.props.id, scrollLeft, "scrollsLeft");
            addToCache(this.props.id, scrollWidth, "scrollsWidth");
            addToCache(this.props.id, scrollHeight, "scrollsHeight");
        }

        return temp;
    };

    getBoundarySize = (force) => {
        if (this.transformRef.current) {
            if (!force)
                return getCachedBoundingRect(`${this.props.id}_transform`, this.transformRef.current);
            else
                return this.transformRef.current.getBoundingClientRect();
        }
    };

    invalidateSize = (self = true, updateParent = true, updateChildren = true, sourceId,
                      addToSnap = false) => {
        if (this.callOverride("invalidateSize", self, updateParent, updateChildren, sourceId))
            return;

        if (addToSnap)
            this.addToSnap();

        if (!sourceId)
            sourceId = this.props.id;

        if (self)
            delete this.tempSize;

        if (updateChildren) {
            Object.values(this.allChildRefs).forEach(childRef => {
                if (childRef && childRef.current && sourceId !== childRef.current.props.id) {
                    childRef.current.invalidateSize(true, false, true, sourceId, addToSnap);
                }
            });
        }

        if (updateParent) {
            this.getParentsId().forEach(id => {
                let parent = this.props.idMan.getItem(id);
                if (parent && parent.mounted && sourceId !== parent.props.id) {
                    parent.invalidateSize(true, false, false, sourceId, addToSnap);
                }
            });
        }

        if (this.props.onInvalidateSize)
            this.props.onInvalidateSize();
    };

    onWindowSizeChange = () => {
        this.addToSnap();
        this.prepareRects();
        Object.values(this.allChildRefs).forEach(childRef => {
            if (childRef && childRef.current) {
                childRef.current.onWindowSizeChange();
            }
        });
    };

    getRenderChildData = (id) => {
        return this.children[id];
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
                if (indexData.nextChild) {
                    indexData.nextChild.zIndex = currentIndex;
                    this.getRenderChildData(indexData.nextChild.props.id).zIndex = currentIndex;
                }
                break;
            case "backward":
                childData.zIndex = indexData.prevZIndex;
                if (indexData.prevChild) {
                    indexData.prevChild.zIndex = currentIndex;
                    this.getRenderChildData(indexData.prevChild.props.id).zIndex = currentIndex;
                }
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

        this.getRenderChildData(childData.props.id).zIndex = childData.zIndex;

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
                this.getRenderChildData(testChildData.props.id).zIndex = testChildData.zIndex;
            }
        }

        childData.zIndex = index;
        this.getRenderChildData(childData.props.id).zIndex = childData.zIndex;

        this.updateLayout();
    };

    setChildZIndex = (childId, zIndex) => {
        let allChildData = this.getFromTempData("savedChildren");
        let childData = allChildData[childId];
        childData.zIndex = zIndex;
        this.getRenderChildData(childData.props.id).zIndex = childData.zIndex;
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

        this.setState({reload: true}, callback);
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
        let gridItemStyle = this.getCompositeFromData("gridItemStyle");
        let transform = this.getCompositeFromData("transform");
        this.setStyle(style, undefined, undefined, true);
        this.setGridItemStyle(gridItemStyle, undefined, true);
        this.setTransformStyle(transform, undefined, undefined, true);

        Object.values(this.allChildRefs).forEach(childRef => {
            if (childRef && childRef.current) {
                childRef.current.onBreakpointChange(width, newBreakpointName, devicePixelRatio);
            }
        });

        this.updateLayout();
    };

    onDeletingChild = (item) => {
        if (this.props.onDeletingChild)
            this.props.onDeletingChild(item);
    }

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

        this.props.parent.onDeletingChild(this);

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

        let anchor = this.getFromTempData("anchor");
        anchor && this.props.anchorMan.removeAnchor(anchor.id, this);

        this.state.selected && this.props.select.updateResizePanes();
        this.state.selected && this.props.select.updateHelpSizeLines();
        this.state.selected && this.props.select.setInspector();
        if (this.state.selected)
            this.props.select.selectedItem = false;
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
        delete props.editor;
        delete props.snap;
        delete props.idMan;
        delete props.input;
        delete props.copyMan;
        delete props.anchorMan;
        delete props.aglRef;
        delete props.parent;
        delete props.window;
        delete props.document;
        delete props.viewRef;
        delete props.aglComponent;
        if (!keepChildren)
            delete props.children;
        delete props.allChildRefs;
        delete props.gridLine;
        delete props.page;
        delete props.gridEditorRef;
        delete props.onChildMounted;
        if (props.griddata)
            delete props.griddata.filDataOnMount;

        Object.keys(this.getAllOverrideProps(props)).forEach(key => {
            delete props[key];
        });

        Object.keys(props).forEach(key => {
            if (typeof props[key] === "function")
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

            // if (this.getFromTempData("selected"))
            //     return;

            this.setItemHover(true);

            this.setMouseOverForNonDragging(this);

            if (this.props.parent && this.props.parent.onMouseOut) {
                setTimeout(() => {
                    if (!this.mounted)
                        return;
                    this.props.parent.onMouseOut(e, true);
                }, 10);
            }
        } else {
            if (this.props.isPage)
                return;

            if (this.props.dragdrop.getDragging().props.id === this.props.id)
                return;

            e.stopPropagation();

            let rect = getCachedBoundingRect(this.props.id, this.rootDivRef.current);
            if (e.clientX < rect.x - 1 || e.clientX > (rect.x + rect.width) ||
                e.clientY < rect.y - 1 || e.clientY > (rect.y + rect.height))
                return;

            this.setItemHover(true);

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

    setItemHover = (hover) => {
        if (!this.isEditor()) return;

        if (hover)
            this.props.select.updateHover(this, this.getSize(false));
        else
            this.props.select.updateHover(this, undefined, true);
    };

    onMouseEnter = (e) => {
        if (this.hasOverride("onMouseEnter"))
            this.callOverride("onMouseEnter", e);

        this.onMouseOver(e, true);
    };

    onMouseOut = (e, outAllParent) => {
        if (this.hasOverride("onMouseOut"))
            this.callOverride("onMouseOut", e);

        if (outAllParent && this.props.parent && this.props.parent.onMouseOut)
            this.props.parent.onMouseOut(e);

        this.setItemHover(false);
    };

    prepareRects = (forceRect, forceGridLines, callback, gridType) => {
        if (this.hasOverride("prepareRects"))
            return this.callOverride("prepareRects", forceRect, forceGridLines);

        let rect = this.getSize(false, forceRect);

        if (forceGridLines || !this.props.gridLine.isPrepared(this.props.id)) {
            this.isEditor() && this.props.gridLine.prepareRects(this.props.id);
        }

        return rect;
    };

    onChildDrop = (child, newId, fixed, onNewChildMounted) => {
        if (this.callOverride("onChildDrop", child, newId, fixed, onNewChildMounted))
            return;

        let childRect = child.getSize(false);
        let thisRect = this.getSize(false, true);

        let calcResult, gridItemStyle, coordinates, newProps;

        if (!newId) {
            let relativeY = childRect.top - thisRect.top;
            // if (fixed) {
            //     // relativeY = childRect.top - this.props.breakpointmanager.getWindowHeight() / 8;
            //     relativeY = childRect.top - thisRect.top;
            // }
            this.prepareRects();
            calcResult = this.calculateChildGridItem(child,
                childRect.left - thisRect.left, relativeY, this,
                childRect.width,
                childRect.height,
                thisRect
            );
        }
        else
        {
            this.prepareRects();
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
                if (child.getFromData("style").width !== "auto")
                    child.setProps("width", childRect.width, coordinates, undefined,
                        this.props.breakpointmanager.getHighestBpName());
            } else {
                child.setProps("width", "auto", undefined,
                    this.props.breakpointmanager.getHighestBpName());
            }
            if (child.getFromData("style").height === "auto")
                if (child.getFromData("style").minHeight !== "auto")
                    child.setProps("minHeight", childRect.height, coordinates, undefined,
                        this.props.breakpointmanager.getHighestBpName());
            else {
                if (child.getFromData("style").height !== "auto")
                    child.setProps("height", childRect.height, coordinates, undefined,
                        this.props.breakpointmanager.getHighestBpName());
                if (child.getFromData("style").minHeight !== "auto")
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
                newChild.state.selected && newChild.toggleHelpLines(this);
            }

        }, (agl) => {
            window.requestAnimationFrame(() => {
                this.invalidateSize(true, true, true);
                window.requestAnimationFrame(() => {
                    this.props.select.onScrollItem();
                });
            });
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

        if (isStretch(this))
            stretch(this);

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
        runtimeStyle.opacity = 0.7;
        runtimeStyle.zIndex = 999999;
        runtimeStyle.pointerEvents = "none";

        if (!this.moveWithMouse) {
            runtimeStyle.top = thisRect.top;
            runtimeStyle.left = thisRect.left;
        } else {
            runtimeStyle.top = e.clientY - thisRect.height / 2;
            runtimeStyle.left = e.clientX - thisRect.width / 2;
        }

        this.dragData = {
            firstPos: {
                top: runtimeStyle.top,
                left: runtimeStyle.left
            },
            firstBoundaryPos: this.getBoundarySize() && {
                top: this.moveWithMouse? e.clientX - thisRect.width / 2 : this.getBoundarySize().top,
                left: this.moveWithMouse? e.clientY - thisRect.height / 2 : this.getBoundarySize().left
            },
            x: runtimeStyle.left,
            y: runtimeStyle.top,
            lastMouseX: e.clientX,
            lastMouseY: e.clientY,
        };

        this.setRuntimeStyle(runtimeStyle);
        this.draggingStart = true;
        this.setDraggingState(true, true, undefined, runtimeStyle);

        this.props.select.updateMenu();
        this.props.select.clearMiniMenu();

        if (this.props.dragdrop.getMouseOverForNonDragging()) {
            this.props.dragdrop.getMouseOverForNonDragging().onMouseOver(e);
        }

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

        // For snaps
        let boundarySize = this.getBoundarySize();
        if (boundarySize)
            boundarySize = {
                top: this.dragData.firstBoundaryPos.top + (this.dragData.y - this.dragData.firstPos.top),
                left: this.dragData.firstBoundaryPos.left + (this.dragData.x - this.dragData.firstPos.left),
                width: boundarySize.width,
                height: boundarySize.height
            };
        else
            boundarySize = runtimeStyle;

        if (!isFixed(this) && !group)
            this.checkSnapOnDrag(runtimeStyle, boundarySize);
        this.setRuntimeStyle(runtimeStyle);

        this.props.select.updateResizePanes(this, runtimeStyle);

        if (!group)
            this.updateGridLines(
                runtimeStyle.top,
                runtimeStyle.left,
                window.innerHeight - runtimeStyle.top - runtimeStyle.height,
                window.innerWidth - runtimeStyle.left - runtimeStyle.width,
                "A"
            );

        if (!group)
            this.props.select.updateHelpLines(this, this.state.helpLinesParent,
                cloneObject(runtimeStyle), this.state.dragging);

        if (group && callGroup)
            this.state.groupDrag(e, this);
    };

    updateGridLines = (top, left, bottom, right, gridType) => {
        if (!this.isEditor()) return;

        if (!this.getFromTempData("isContainer"))
            return;

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
            // this.props.parent.prepareRects(true);
            this.props.parent.prepareRects();

        let {top, left, width, height} = this.state.runtimeStyle;

        this.props.snap.drawSnap();
        this.getSize(true, true);
        if (group || !this.props.dragdrop.setDraggingStop()){
            let parentRect = this.props.parent.getSize(false);
            this.setPosition(
                group,
                left - parentRect.left,
                top - parentRect.top,
                this.dragData.firstPos.left - parentRect.left,
                this.dragData.firstPos.top - parentRect.top, width, height, parentRect);
            return;
        } else if (!group) {
            this.dropped = true;
        }

        // this.setState({dragging: false, draggingStart: false});

        if (!group)
            this.updateGridLines(
                top, left,
                window.innerHeight - top - height,
                window.innerWidth - left - width,
                "A"
            );

        this.props.select.updateMiniMenu();
    };

    setPosition = (group, relativeX, relativeY, firstRelativeX, firstRelativeY,
                   width, height, parentRect, fromUndoRedo) => {
        if (!fromUndoRedo) {
            let itemId = this.props.id;
            let parentId = this.props.parent.props.id;
            let redoData = [group, relativeX, relativeY, firstRelativeX, firstRelativeY,
                width, height, parentRect];
            let undoData = [group, firstRelativeX, firstRelativeY, undefined, undefined,
                width, height, parentRect];
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
                group, relativeX, relativeY, firstRelativeX, firstRelativeY,
                width, height, parentRect, fromUndoRedo);

        let {gridItemStyle, coordinates} = this.calculateGridItem(relativeX, relativeY, this.props.parent,
            width, height, parentRect);

        // TODO uncomment if bug found
        // if (gridItemStyle.justifySelf !== "stretch"){
        //     this.setProps("width", width, coordinates, undefined, undefined, true);
        // } else {
        //     this.setProps("width", "auto", undefined, undefined, undefined, true);
        // }
        // if (this.getCompositeFromData("style").height === "auto")
        //     this.setProps("minHeight", height, coordinates, undefined, undefined, true);
        // else {
        //     this.setProps("height", height, coordinates, undefined, undefined, true);
        //     this.setProps("minHeight", height, coordinates, undefined, undefined, true);
        // }

        this.setGridItemStyle(gridItemStyle);

        this.nonePointerEventForChildren(false);
        this.setRuntimeStyle();
        // this.setState({dragging: false, draggingStart: false}, () => {
        //     this.addToSnap();
        // });
        let top = relativeY + parentRect.top;
        let left = relativeX + parentRect.left;
        this.setDraggingState(false, false, () => {
            this.addToSnap();
        }, {top, left, width, height});

        if (!group)
            this.props.select.updateHelpLines(this, this.state.helpLinesParent,
                {top, left, width, height}, this.state.dragging);

        this.dropped = false;

        // this.props.select.updateSize();
        // this.props.select.updateResizePanes(this, {top, left, width, height});
        // this.props.select.updateMiniMenu();

        setTimeout(() => {
            if (!this.mounted)
                return;

            // for fixing helpline
            this.props.select.onScrollItem();
        }, 100);

        this.invalidateSize(false, true, true);
    };

    setDraggingState = (dragging, draggingStart, callback, rect) => {
        let fakeStyle = cloneObject({
            ...this.getCompositeFromData("style"),
            ...this.getCompositeFromData("gridItemStyle"),
        });
        this.setState({dragging, draggingStart, fakeStyle}, callback);
    };

    checkSnapOnDrag = (runtimeStyle, boundarySize) => {
        if (this.callOverride("checkSnapOnDrag", runtimeStyle, boundarySize))
            return;

        let snapDelta1 = this.getSnapDelta(
            boundarySize.top, boundarySize.left);
        let snapDelta2 = this.getSnapDelta(
            boundarySize.top + boundarySize.height/2, boundarySize.left + boundarySize.width/2);
        let snapDelta3 = this.getSnapDelta(
            boundarySize.top + boundarySize.height, boundarySize.left + boundarySize.width);

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
        if (boundarySize !== runtimeStyle) {
            boundarySize.left += snapDelta.deltaX;
            boundarySize.top += snapDelta.deltaY;
        }

        let pointOfSnapH = {
            p1: boundarySize.left,
            p2: boundarySize.left + boundarySize.width
        };
        let pointOfSnapV = {
            p1: boundarySize.top,
            p2: boundarySize.top + boundarySize.height
        };

        this.props.snap.drawSnap(snapDelta.snapH, snapDelta.snapV, pointOfSnapH, pointOfSnapV);
    };

    getSnapDelta = (top, left) => {
        let parentGridLines = [];
        if (this.props.parent) {
            if (this.resizing) {
                parentGridLines = this.props.parent.getGridLineSnaps();
            } else {
                // dragging
                if (this.props.dragdrop.mouseOver &&
                    this.props.gridLine.hasGridLine(this.props.dragdrop.mouseOver.props.id))
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

        if (gridItemStyle.justifySelf !== "stretch" && this.getCompositeFromData("style").width === "auto")
        {
            this.setStyleParam("width", `${this.getSize(false).width}px`, undefined, undefined, true);
        }
        else if (gridItemStyle.justifySelf === "stretch")
        {
            this.setStyleParam("width", "auto", undefined, undefined, true);
        }
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

    getRuntimeGridItemStyle = () => {
        return this.props.select.getRuntimeGridItemStyle();
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

        let gridArea, coordinates;
        if (isFixed(this)) {
            gridArea = {x1: 1, x2: 2, y1: 1, y2: 2};
            coordinates = {
                cy1: parentRect.top,
                cy2: parentRect.top + parentRect.height,
                cx1: parentRect.left,
                cx2: parentRect.left + parentRect.width
            }
        } else {
            let result = this.calculateGridArea(
                parentRect.left + relativeX,
                parentRect.top + relativeY,
                width,
                height,
                parent,
                parentRect
            );
            gridArea = result.gridArea;
            coordinates = result.coordinates;
        }

        let coordinatesAbs = cloneObject(coordinates);

        this.coordinateToRelative(coordinates, parentRect);

        let oldGridItemStyle = this.getCompositeFromData("gridItemStyle");
        let gridItemStyle = cloneObject(oldGridItemStyle);
        gridItemStyle.gridArea = `${gridArea.y1}/${gridArea.x1}/${gridArea.y2}/${gridArea.x2}`;

        let centerX = (relativeX  - coordinates.cx1) + width / 2;
        let centerY = (relativeY  - coordinates.cy1) + height / 2;

        let parentCenterMinusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 - 0.1);
        let parentCenterPlusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 + 0.1);

        let yLineRef = this.props.gridLine.getYlineRef(parent.props.id);
        let cy2IsLastLine = gridArea.y2 === yLineRef.length || isFixed(this);
        let xLineRef = this.props.gridLine.getXlineRef(parent.props.id);
        let cx2IsLastLine = gridArea.x2 === xLineRef.length || isFixed(this);

        let widthForPercent = coordinates.cx2 - coordinates.cx1/* + (cx2IsLastLine?1:0)*/;
        let heightForPercent = coordinates.cy2 - coordinates.cy1/* + (cy2IsLastLine?1:0)*/;

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

            if (cy2IsLastLine && (relativeY + height >= coordinates.cy2) && relativeY >= 0) {
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
        if (centerDiffX >= 0) {
            gridItemStyle.marginRight = `${(-centerDiffX * 2 / widthForPercent * 100).toString()}%`;
            gridItemStyle.marginLeft = "0%";
        } else {
            gridItemStyle.marginRight = "0%";
            gridItemStyle.marginLeft = `${(centerDiffX * 2 / widthForPercent * 100).toString()}%`;
        }
        gridItemStyle.marginTop =
            this.getPxOrPcOrValue(
                `${(centerDiffY * 2).toString()}`,
                widthForPercent,
                "px");
        gridItemStyle.marginBottom = "0px";

        if (docks.top) {
            gridItemStyle.alignSelf = "start";
            gridItemStyle.marginTop =
                this.getPxOrPcOrValue(
                `${(relativeY - coordinates.cy1).toString()}`,
                    widthForPercent,
                    this.getUnit(oldGridItemStyle.marginTop) || "px");
        } else if (docks.bottom) {
            gridItemStyle.marginTop = "0px";
        }
        if (docks.left) {
            gridItemStyle.justifySelf = "start";
            gridItemStyle.marginLeft =
                this.getPxOrPcOrValue(
                    `${(relativeX - coordinates.cx1).toString()}`,
                    widthForPercent,
                    this.getUnit(oldGridItemStyle.marginLeft) || "%");
        } else if (docks.right) {
            gridItemStyle.marginLeft = "0%";
        }
        if (docks.bottom) {
            gridItemStyle.alignSelf = docks.top ? "stretch": "end";
            gridItemStyle.marginBottom =
                this.getPxOrPcOrValue(
                    `${(coordinates.cy2 - relativeY - height).toString()}`,
                    widthForPercent,
                    this.getUnit(oldGridItemStyle.marginBottom) || "px");
        } else if (docks.top) {
            gridItemStyle.marginBottom = "0px";
        }
        if (docks.right) {
            gridItemStyle.justifySelf = docks.left? "stretch": "end";
            gridItemStyle.marginRight =
                this.getPxOrPcOrValue(
                    `${(coordinates.cx2 - (relativeX + width)).toString()}`,
                    widthForPercent,
                    this.getUnit(oldGridItemStyle.marginRight) || "%");
        } else if (docks.left) {
            gridItemStyle.marginRight = "0%";
        }

        gridItemStyle.widthForPercent = widthForPercent;
        gridItemStyle.heightForPercent = heightForPercent;

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

        if (isFixed(child)) {
            if (relativeY < 0) relativeY = 0;
            if (relativeY > parentRect.scrollHeightMinusPadding - height)
                relativeY = parentRect.scrollHeightMinusPadding - height;
            if (relativeX < 0) relativeX = 0;
            if (relativeX > parentRect.scrollWidthMinusPadding - width)
                relativeX = parentRect.scrollWidthMinusPadding - width;
        }

        let gridArea, coordinates;
        if (isFixed(child)) {
            gridArea = {x1: 1, x2: 2, y1: 1, y2: 2};
            coordinates = {
                cy1: parentRect.top,
                cy2: parentRect.top + parentRect.height,
                cx1: parentRect.left,
                cx2: parentRect.left + parentRect.width
            }
        } else {
            let result = this.calculateGridArea(
                parentRect.left + relativeX,
                parentRect.top + relativeY,
                width,
                height,
                parent,
                parentRect
            );
            gridArea = result.gridArea;
            coordinates = result.coordinates;
        }

        let coordinatesAbs = cloneObject(coordinates);

        child.coordinateToRelative(coordinates, parentRect);

        let oldGridItemStyle = child.getCompositeFromData("gridItemStyle");
        let gridItemStyle = cloneObject(oldGridItemStyle);
        gridItemStyle.gridArea = `${gridArea.y1}/${gridArea.x1}/${gridArea.y2}/${gridArea.x2}`;

        let centerX = (relativeX  - coordinates.cx1) + width / 2;
        let centerY = (relativeY  - coordinates.cy1) + height / 2;

        let parentCenterMinusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 - 0.1);
        let parentCenterPlusX = (coordinates.cx2 - coordinates.cx1) / 2 * (1 + 0.1);

        let yLineRef = this.props.gridLine.getYlineRef(parent.props.id);
        let cy2IsLastLine = gridArea.y2 === yLineRef.length || isFixed(child);
        let xLineRef = this.props.gridLine.getXlineRef(parent.props.id);
        let cx2IsLastLine = gridArea.x2 === xLineRef.length || isFixed(child);

        let widthForPercent = coordinates.cx2 - coordinates.cx1 + (cx2IsLastLine?1:0);
        let heightForPercent = coordinates.cy2 - coordinates.cy1 + (cy2IsLastLine?1:0);

        let autoDock = child.getFromTempData("autoDock");
        let docks = child.getDocks() || {top: true};

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

            if (cy2IsLastLine && (relativeY + height >= coordinates.cy2) && relativeY >= 0) {
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
        if (centerDiffX >= 0) {
            gridItemStyle.marginRight = `${(-centerDiffX * 2 / widthForPercent * 100).toString()}%`;
            gridItemStyle.marginLeft = "0%";
        } else {
            gridItemStyle.marginRight = "0%";
            gridItemStyle.marginLeft = `${(centerDiffX * 2 / widthForPercent * 100).toString()}%`;
        }
        gridItemStyle.marginTop =
            this.getPxOrPcOrValue(
                `${(centerDiffY * 2).toString()}`,
                widthForPercent,
                "px");
        gridItemStyle.marginBottom = "0px";

        if (docks.top) {
            gridItemStyle.alignSelf = "start";
            gridItemStyle.marginTop =
                this.getPxOrPcOrValue(
                    `${(relativeY - coordinates.cy1).toString()}`,
                    widthForPercent,
                    this.getUnit(oldGridItemStyle.marginTop) || "px");
        } else if (docks.bottom) {
            gridItemStyle.marginTop = "0px";
        }
        if (docks.left) {
            gridItemStyle.justifySelf = "start";
            gridItemStyle.marginLeft =
                this.getPxOrPcOrValue(
                    `${(relativeX - coordinates.cx1).toString()}`,
                    widthForPercent,
                    this.getUnit(oldGridItemStyle.marginLeft) || "%");
        } else if (docks.right) {
            gridItemStyle.marginLeft = "0%";
        }
        if (docks.bottom) {
            gridItemStyle.alignSelf = docks.top ? "stretch": "end";
            gridItemStyle.marginBottom =
                this.getPxOrPcOrValue(
                    `${(coordinates.cy2 - relativeY - height).toString()}`,
                    widthForPercent,
                    this.getUnit(oldGridItemStyle.marginBottom) || "px");
        } else if (docks.top) {
            gridItemStyle.marginBottom = "0px";
        }
        if (docks.right) {
            gridItemStyle.justifySelf = docks.left? "stretch": "end";
            gridItemStyle.marginRight =
                this.getPxOrPcOrValue(
                    `${(coordinates.cx2 - (relativeX + width)).toString()}`,
                    widthForPercent,
                    this.getUnit(oldGridItemStyle.marginRight) || "%");
        } else if (docks.left) {
            gridItemStyle.marginRight = "0%";
        }

        gridItemStyle.widthForPercent = widthForPercent;
        gridItemStyle.heightForPercent = heightForPercent;

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
            return;

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

        this.resizing = true;

        let runtimeStyle = {...this.state.runtimeStyle};
        runtimeStyle.width = this.getSize().x;
        runtimeStyle.height = this.getSize().y;

        this.resizeData = {
            firstX: runtimeStyle.width,
            firstLeft: this.getSize().left,
            top: this.getSize().top,
            left: this.getSize().left
        };

        this.setRuntimeStyle(runtimeStyle);

        this.setDraggingState(true, false, undefined, runtimeStyle);

        this.isEditor() && this.props.select.activateHover(false);

        if (this.props.onPageResizeStart)
            this.props.onPageResizeStart();

        window.requestAnimationFrame(this.pageResizeCalculate);
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
        runtimeStyle.maxWidth = "unset";
        runtimeStyle.maxHeight = "unset";
        runtimeStyle.opacity = 0.7;
        runtimeStyle.zIndex = 999999;
        runtimeStyle.pointerEvents = "none";

        runtimeStyle.top = thisRect.top;
        runtimeStyle.left = thisRect.left;

        this.resizeData = {
            firstX: runtimeStyle.width,
            firstY: runtimeStyle.height,
            firstTop: runtimeStyle.top,
            firstLeft: runtimeStyle.left,
            lastWidth: runtimeStyle.width,
            lastHeight: runtimeStyle.height,
            firstBoundaryWidth: this.getBoundarySize() && this.getBoundarySize().width,
            firstBoundaryHeight: this.getBoundarySize() && this.getBoundarySize().height,
            firstBoundaryTop: this.getBoundarySize() && this.getBoundarySize().top,
            firstBoundaryLeft: this.getBoundarySize() && this.getBoundarySize().left
        };

        this.setDraggingState(true, false, undefined, runtimeStyle);

        this.props.select.clearMiniMenu();
        this.props.select.activateHover(false);

        this.setRuntimeStyle(runtimeStyle);

        window.requestAnimationFrame(this.onResizeCalculate);
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

        this.updateGridLines(
            this.resizeData.top,
            this.resizeData.left,
            window.innerHeight - this.resizeData.top - runtimeStyle.height,
            window.innerWidth - this.resizeData.left - runtimeStyle.width,
            "A"
        );

        this.updatePageAdjustments();

        this.resizeData.onResizeData = {
            runtimeStyle: runtimeStyle,
        };
    };

    updatePageAdjustments = () => {
        this.backContainerRef.current.updateAdjustments();
    };

    pageResizeCalculate = () => {
        if (this.callOverride("pageResizeCalculate"))
            return;

        if (!this.resizing)
            return;

        if (!this.resizeData.onResizeData) {
            window.requestAnimationFrame(this.pageResizeCalculate);
            return;
        }

        let {runtimeStyle} = this.resizeData.onResizeData;

        this.setRuntimeStyle(runtimeStyle);

        if (this.props.onPageResize) {
            this.props.onPageResize(runtimeStyle.width, this);
        }

        window.requestAnimationFrame(this.pageResizeCalculate);
    };

    onResize = (e, dir, delta, group) => {
        if (this.callOverride("onResize", e, dir, delta, group))
            return;

        let runtimeStyle = {...this.state.runtimeStyle};

        let degree = (this.getCompositeFromData("transform") || {}).rotateDegree || 0;

        let finalDelta = getResizeDelta(degree, dir, delta);
        runtimeStyle.left = this.resizeData.firstLeft + finalDelta.left;
        runtimeStyle.top = this.resizeData.firstTop + finalDelta.top;
        runtimeStyle.width = this.resizeData.firstX + finalDelta.width;
        runtimeStyle.height = this.resizeData.firstY + finalDelta.height;

        // For snaps
        let boundarySize = this.getBoundarySize();

        if (!group && !boundarySize)
            this.checkSnapOnResize(runtimeStyle, dir, this.resizeData);
        // this.checkSnapOnResize(rect, dir, this.resizeData);

        let rect = {
            top: runtimeStyle.top,
            left: runtimeStyle.left,
            width: runtimeStyle.width,
            height: runtimeStyle.height
        };

        this.props.select.updateResizePanes(this, rect);

        if (!group)
            this.setResizeHelpData({
                x: e.clientX,
                y: e.clientY,
                width: (dir.includes('w') || dir.includes('e')) && rect.width,
                height: (dir.includes('n') || dir.includes('s')) && rect.height,
            });

        if (!group)
            this.updateGridLines(
                rect.top,
                rect.left,
                window.innerHeight - rect.top - rect.height,
                window.innerWidth - rect.left - rect.width,
                "A"
            );

        this.props.select.updateHelpLines(this, this.state.helpLinesParent,
            rect, this.state.dragging);

        this.resizeData.onResizeData = {
            runtimeStyle: runtimeStyle,
        };

        if (this.props.onResize)
            this.props.onResize(runtimeStyle);
    };

    onResizeCalculate = () => {
        if (this.callOverride("onResizeCalculate"))
            return;

        if (!this.resizing)
            return;

        if (!this.resizeData.onResizeData) {
            window.requestAnimationFrame(this.onResizeCalculate);
            return;
        }

        let {runtimeStyle} = this.resizeData.onResizeData;

        this.setRuntimeStyle(runtimeStyle);

        window.requestAnimationFrame(this.onResizeCalculate);
    };

    setResizeHelpData = (resizeHelpData) => {
        this.setState({resizeHelpData})
    };

    pageResizeStop = (e, dir, delta) => {
        let {width, height} = this.state.runtimeStyle;
        this.isEditor() && this.props.select.activateHover(true);
        this.setPageSize(this.resizeData.top, this.resizeData.left, width, height);
    };

    setPageSize = (top, left, width, height) => {
        this.setProps("width", width, undefined, undefined,
            this.props.breakpointmanager.getHighestBpName());

        this.setRuntimeStyle();
        this.invalidateSize();

        this.setDraggingState(false, false, () => {
            this.addToSnap();
        }, {top, left, width, height});
        this.resizing = false;

        this.updateGridLines(
            top, left,
            window.innerHeight - top - height,
            window.innerWidth - left - width,
            "A"
        );

        this.isEditor() && this.props.select.onScrollItem(this);

        this.prepareRects();

        if (this.props.onPageResizeStop)
            this.props.onPageResizeStop(width, this);

        this.resizeData = undefined;
    };

    setPageSizeWidth = (width) => {
        this.setProps("width", width, undefined, undefined,
            this.props.breakpointmanager.getHighestBpName());

        this.invalidateSize();

        this.addToSnap();

        let rect = this.getSize(false);
        let minWidth = this.props.breakpointmanager.getMinWidth();

        if (width < minWidth)
            width = minWidth;

        let deltaX = width - rect.width;
        let firstLeft = rect.left;
        let left = firstLeft + deltaX;
        if (left < 50)
            left = 50;

        let top = rect.top;

        this.updateGridLines(
            top, left,
            window.innerHeight - top - rect.height,
            window.innerWidth - left - width,
            "A"
        );

        this.isEditor() && this.props.select.onScrollItem(this);

        this.prepareRects();
    };

    onChildResizeStoping = (item, e, dir, delta, runtimeStyle) => {
        if (this.props.onChildResizeStoping)
            this.props.onChildResizeStoping(item, e, dir, delta, runtimeStyle);
    }

    onResizeStop = (e, dir, delta, group) => {
        if (this.hasOverride("onResizeStop"))
            return this.callOverride("onResizeStop", e, dir, delta, group);
        this.resizing = false;

        if (this.props.onItemPreResizeStop) {
            this.props.onItemPreResizeStop(this, e, dir, delta, this.state.runtimeStyle);
        }
        this.props.parent.onChildResizeStoping(this, e, dir, delta, this.state.runtimeStyle);
        this.getSize(true, true);

        if (group)
            this.props.parent.prepareRects();
        // this.props.parent.prepareRects(true);

        let parentRect = this.props.parent.getSize(false);

        let {top, left, width, height} = this.state.runtimeStyle;
        // width = this.resizeData.lastWidth;
        // height = this.resizeData.lastHeight;
        this.setSize(
            dir, delta, group,
            left - parentRect.left,
            top - parentRect.top, width, height,
            this.resizeData.firstLeft - parentRect.left,
            this.resizeData.firstTop - parentRect.top,
            this.resizeData.firstX,
            this.resizeData.firstY, parentRect
        );
        this.props.select.updateMiniMenu();
        this.props.select.activateHover(true);
    };

    setSize = (dir, delta, group, relativeX, relativeY, width, height, firstRelativeX,
               firstRelativeY, firstWidth, firstHeight, parentRect, fromUndoRedo) =>
    {
        if (!fromUndoRedo) {
            let itemId = this.props.id;
            let redoData = [dir, delta, group, relativeX, relativeY, width, height, firstRelativeX,
                firstRelativeY, firstWidth, firstHeight, parentRect];
            let undoData = [dir, delta, group, firstRelativeX,
                firstRelativeY, firstWidth, firstHeight, undefined,
                undefined, undefined, undefined, parentRect];
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
                firstRelativeY, firstWidth, firstHeight, parentRect, fromUndoRedo);

        let gridItemStyle, coordinates;
        let calcResult = this.calculateGridItem(relativeX, relativeY, this.props.parent, width, height);

        gridItemStyle = this.props.autoConstraintsOff?  this.getCompositeFromData("gridItemStyle"):
            calcResult.gridItemStyle;
        coordinates = calcResult.coordinates;

        if (dir.includes('e') || dir.includes('w')) {
            if (gridItemStyle.justifySelf !== "stretch" && this.getCompositeFromData("style").width !== "auto")
                this.setProps("width", width, coordinates, undefined, undefined, true);
            else
                this.setProps("width", "auto", undefined, undefined, undefined, true);

            if (this.getCompositeFromData("style").minWidth) {
                this.setProps("minWidth", width, coordinates, undefined, undefined, true);
            }
            if (this.getCompositeFromData("style").maxWidth) {
                this.setProps("maxWidth", width, coordinates, undefined, undefined, true);
            }
        }

        if (dir.includes('s') || dir.includes('n')) {
            if (this.getCompositeFromData("style").height !== "auto") {
                this.setProps("height", height, coordinates, undefined, undefined, true);
            }
            if (!this.getFromTempData("isVerticalSection")) {
                if (this.getCompositeFromData("style").minHeight) {
                    this.setProps("minHeight", height, coordinates, undefined, undefined, true);
                }
                if (this.getCompositeFromData("style").maxHeight) {
                    this.setProps("maxHeight", height, coordinates, undefined, undefined, true);
                }
            }
        }

        if (!this.getFromTempData("isSection"))
            this.setGridItemStyle(gridItemStyle);
        this.setRuntimeStyle();
        this.setResizeHelpData();

        let top = relativeY + parentRect.top;
        let left = relativeX + parentRect.left;
        this.setDraggingState(false, false, () => {
            this.addToSnap();
        }, {top, left, width, height});
        this.props.snap.drawSnap();

        if (!group)
            this.updateGridLines(
                this.getSize(false).top, this.getSize(false).left,
                window.innerHeight - this.getSize(false).top - height,
                window.innerWidth - this.getSize(false).left - width,
                "A"
            );

        if (!group)
            this.props.select.updateHelpLines(this, this.state.helpLinesParent,
                this.getSize(false), this.state.dragging);

        setTimeout(() => {
            if (!this.mounted)
                return;

            // for fixing helpline
            this.props.select.onScrollItem();
        }, 100);

        this.resizeData = undefined;

        this.invalidateSize(false, true, true);
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

    setProps = (prop, value, gridCoordinates, data, breakpointName, dontAddToSnap) => {
        if (this.hasOverride("setProps"))
            return this.callOverride("setProps", prop, value, gridCoordinates, data, breakpointName);

        if (prop === "width" || prop === "height" ||
            prop === "minWidth" || prop === "minHeight" ||
            prop === "maxWidth" || prop === "maxHeight")
        {
            this.setNewSize(prop, value, gridCoordinates, data, breakpointName, dontAddToSnap);
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

    setNewSize = (prop, value, gridCoordinates, data, breakpointName, dontAddToSnap) => {
        if (this.hasOverride("setNewSize"))
            return this.callOverride("setNewSize", prop, value, gridCoordinates, data, breakpointName);

        let oldStyle = this.getCompositeFromData("style", data, breakpointName);
        let oldValue = oldStyle && oldStyle[prop];

        if (value === undefined) {
            this.setStyleParam(prop, value, data, breakpointName, dontAddToSnap);
            return;
        }

        if (!oldValue || (!this.isPercent(oldValue) && !this.isViewRatio(oldValue)) ||
            value === "auto" || isNaN(value)) {
            if (!isNaN(value)) {
                value+="px";
            }
            this.setStyleParam(prop, value, data, breakpointName, dontAddToSnap);
            return;
        }

        if (isNaN(value) && value.includes('px'))
            value = parseFloat(value.replace('px', ''));

        if (this.isPercent(oldValue)) {
            let parentRect = {
                width: gridCoordinates? (gridCoordinates.cx2 - gridCoordinates.cx1): window.innerWidth,
                height: gridCoordinates?(gridCoordinates.cy2 - gridCoordinates.cy1): window.innerHeight
            };
            let newValue = (value / parentRect[this.getParentProps(prop)] * 100).toString() + "%";
            this.setStyleParam(prop, newValue, data, breakpointName, dontAddToSnap);
        } else if (this.isViewRatio(oldValue)) {
            let parentValue;
            let postFix;
            if (oldValue.includes('vh')) {
                parentValue = this.props.breakpointmanager.getWindowHeight();
                postFix = 'vh'
            }
            if (oldValue.includes('vw')) {
                parentValue = this.props.breakpointmanager.getWindowWidth();
                postFix = 'vw'
            }
            let newValue = (value / parentValue * 100).toString() + postFix;
            newValue = getViewRatioStyle(newValue);
            this.setStyleParam(prop, newValue, data, breakpointName, dontAddToSnap);
        }
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

    isViewRatio = (value) => {
        if (isNaN(value)) {
            if (value.includes("vh") || value.includes("vw"))
                return true;
        }

        return false;
    };

    setRuntimeStyle = (newRuntimeStyle, animationCss) => {
        if (this.callOverride("setRuntimeStyle", newRuntimeStyle))
            return;

        let runtimeStyle = newRuntimeStyle && {...newRuntimeStyle};
        this.setState({runtimeStyle, animationCss});
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

    setStyleParam = (param, value, data, breakpointName, dontAddToSnap) => {
        if (this.hasOverride("setStyleParam"))
            return this.callOverride("setStyleParam", param, value, data, breakpointName);

        let style = this.hasDataInBreakPoint("style", data, breakpointName) || {};
        style[param] = value;
        if (value === undefined)
            delete style[param];
        this.setStyle(style, data, breakpointName, undefined, dontAddToSnap);
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

    setStyle = (newStyle, data, breakpointName, dontOverride, dontAddToSnap) => {
        if (this.callOverride("setStyle", newStyle, data, breakpointName, dontOverride))
            return;

        let style = {...newStyle};

        if (!dontOverride)
            this.setDataInBreakpoint("style", style, data, breakpointName);

        if (!data) {
            let styleNode = document.getElementById(this.getStyleId());

            if (!styleNode) {
                appendStyle(
                    this.getCompositeFromData("style"),
                    this.getStyleId(), this.getStyleId(), this);
            } else {
                updateStyle(styleNode,
                    this.getCompositeFromData("style"),
                    this.getStyleId());
            }

            if (!dontAddToSnap) {
                this.invalidateSize();
                this.addToSnap();
            }
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

    getGridLineRect = (ref, index, dir, item) => {
        if (ref.current) {
            return ref.current.rect;
        }

        let parentRect = item.props.parent && item.props.parent.getSize(false) || {
            width: item.props.breakpointmanager.getWindowWidth()
        };
        let padding = cloneObject(item.getCompositeFromData("padding")) || {};
        ['top', 'left', 'bottom', 'right'].forEach(key => {
            padding[key] = getPxValueFromCSSValue(padding[key], parentRect.width, item) || 0;
        });

        let thisRect = item.getSize(false);
        if (dir === 'x') {
            if (index === 0) {
                return {
                    left: thisRect.left - thisRect.scrollLeft + padding.left ,
                    top: thisRect.top - thisRect.scrollTop + padding.top,
                    height: thisRect.scrollHeight - padding.top - padding.bottom,
                    width: 1
                }
            } else {
                return {
                    left: thisRect.left - thisRect.scrollLeft + thisRect.scrollWidth - padding.right - 1,
                    top: thisRect.top - thisRect.scrollTop + padding.top,
                    height: thisRect.scrollHeight - padding.top - padding.bottom,
                    width: 1
                }
            }
        } else {
            if (index === 0) {
                return {
                    top: thisRect.top - thisRect.scrollTop + padding.top ,
                    left: thisRect.left - thisRect.scrollLeft + padding.left,
                    height: 1,
                    width: thisRect.scrollWidth - padding.left - padding.right,
                }
            } else {
                return {
                    top: thisRect.top - thisRect.scrollTop + thisRect.scrollHeight - padding.bottom - 1,
                    left: thisRect.left - thisRect.scrollLeft + padding.left,
                    height: 1,
                    width: thisRect.scrollWidth - padding.left - padding.right,
                }
            }
        }
    };

    getGridLineOfPoint = (left, top, parent, after = false, parentRect) => {
        if (!parentRect)
            parentRect = parent.getSize(false);
        let x;
        let cx;
        let xLineRef = this.props.gridLine.getXlineRef(parent.props.id);
        for(let i = 0; i < xLineRef.length; i++) {
            let rect = this.getGridLineRect(xLineRef[i], i, 'x', parent);
            if (left < rect.left || (after && left <= rect.left)) {
                x = i;
                if (!after) {
                    if (xLineRef[i - 1]) {
                        // rect = xLineRef[i - 1].current.getBoundingClientRect();
                        // rect = xLineRef[i - 1].current.rect;
                        rect = this.getGridLineRect(xLineRef[i - 1], i - 1, 'x', parent);
                        cx = rect.left;
                    } else {
                        // cx = parentRect.left - parentRect.scrollLeft;
                        cx = rect.left;
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
            // let rect = xLineRef[xLineRef.length - 1].current.rect;
            let rect = this.getGridLineRect(xLineRef[xLineRef.length - 1], xLineRef.length - 1, 'x', parent);
            cx = rect.left;
        }

        let y;
        let cy;
        let yLineRef = this.props.gridLine.getYlineRef(parent.props.id);
        for(let i = 0; i < yLineRef.length; i++) {
            // let rect = yLineRef[i].current.getBoundingClientRect();
            // let rect = yLineRef[i].current.rect;
            let rect = this.getGridLineRect(yLineRef[i], i, 'y', parent);
            if (top < rect.top || (after && top <= rect.top)) {
                y = i;
                if (!after) {
                    if (yLineRef[i - 1]) {
                        // rect = yLineRef[i - 1].current.getBoundingClientRect();
                        // rect = yLineRef[i - 1].current.rect;
                        rect = this.getGridLineRect(yLineRef[i - 1], i - 1, 'y', parent);
                        cy = rect.top;
                    } else {
                        // cy = parentRect.top - parentRect.scrollTop;
                        cy = rect.top;
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
            // let rect = yLineRef[yLineRef.length - 1].current.rect;
            let rect = this.getGridLineRect(yLineRef[yLineRef.length - 1], yLineRef.length - 1, 'y', parent);
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
        if (!this.props.gridLine.hasGridLine(parent.props.id)) {
            return {
                gridArea: {x1: 1, y1: 1, x2: 2, y2: 2},
                coordinates: {cx1: 0, cy1: 0, cx2: 0, cy2: 0}
            }
        }
        let gridLine1 = this.getGridLineOfPoint(left, top, parent, false, parentRect);
        let gridLine2 = this.getGridLineOfPoint(left + width, top + height, parent, true, parentRect);
        return {
            gridArea: {x1: gridLine1.x, y1: gridLine1.y, x2: gridLine2.x, y2: gridLine2.y},
            coordinates: {cx1: gridLine1.cx, cy1: gridLine1.cy, cx2: gridLine2.cx, cy2: gridLine2.cy}
        };
    };

    onMouseDown = (e, moveWithMouse) => {
        if (!this.isEditor())
            return;

        if (this.isLeftClick(e)) {
            e.stopPropagation();
            e.preventDefault();
            this.mouseDown = true;
            this.moveWithMouse = moveWithMouse;
            this.mouseMoved = {
                deltaX: 0,
                deltaY: 0,
                lastClientX: e.clientX,
                lastClientY: e.clientY,
                startMillis: (new Date()).getTime()
            };
            window.addEventListener("mousemove", this.onMouseMove);
            window.addEventListener("mouseup", this.onMouseUp);
        } else if (isRightClick(e)) {
            e.stopPropagation();
            e.preventDefault();
            this.mouseDown = true;
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

        delete this.moveWithMouse;

        if (isRightClick(e)) {
            this.onContextMenu(e);
            this.mouseDown = false;
            window.removeEventListener("mouseup", this.onMouseUp);
            return;
        }

        let currentMillis = new Date().getTime();
        if (!this.moving && currentMillis - this.mouseMoved.startMillis < 500) {
            if (!this.dropped) {
                e.stopPropagation();
                this.onSelect(true, undefined, undefined, true);
            } else {
                this.dropped = false;
            }
        }

        if (this.moving && this.canMove()) {
            window.requestAnimationFrame(() => {
                this.onDragStop(e, isGroupSelected(this), true);
            });
        }

        this.moving = false;
        this.mouseDown = false;

        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    };

    onSelect = (selected, callback, deselectParent, clicked, dontUpdateAdjustment) => {
        if (!this.isEditor()) return;

        if (this.callOverride("onSelect", selected, callback, deselectParent))
            return;

        if (!this.mounted)
            return;
        if (!this.props.isSelectable)
            return;

        if (selected) {
            this.props.select.selectItem(this, clicked, dontUpdateAdjustment);
            this.props.gridLine.removeGridLineByType("A");
            this.toggleGridLines(selected, undefined, "A");
        } else {
            this.props.onDeSelectListener && this.props.onDeSelectListener(this);
            this.props.select.updateHelpSizeLines();
        }

        if (this.props.parent) {
            if (selected || deselectParent)
                this.props.parent.toggleGridLines(selected, () => {
                    this.toggleHelpLines(selected && this.props.parent);
                }, "B");
        } else {
            selected && this.props.gridLine.removeGridLineByType("B");
            this.props.select.updateHelpSizeLines();
        }

        this.setTempData("selected", selected);

        if (!this.mounted)
            return;

        this.setState({selected, groupSelected: false}, () => {
            selected && this.setItemHover(true);

            this.props.editor.updateLayout();

            if (callback)
                callback();
        });
    };

    toggleGridLines = (showGridLines, callback, gridType) => {
        if (this.callOverride("toggleGridLines", showGridLines, callback, gridType))
            return;

        if (!this.mounted)
            return;

        if (!showGridLines) {
            this.props.gridLine.removeGridLine(this.props.id);
            this.updateLayout();
            return;
        }

        if (!this.getFromTempData("isContainer"))
            return;

        if (this.props.gridLine.hasGridLine(this.props.id, gridType)) {
            if (callback)
                callback();

            this.updateLayout();

            return;
        }

        let grid = this.getCompositeFromData("grid");
        this.props.gridLine.addGrid(
            this.props.id,
            grid.x,
            grid.y,
            gridType,
            grid.gridTemplateRows,
            grid.gridTemplateColumns,
            {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
            },
            () => {
                if (callback)
                    callback();

                this.updateLayout();
            }
        );
    };

    toggleHelpLines = (helpLinesParent, callback) => {
        if (this.callOverride("toggleHelpLines", helpLinesParent, callback))
            return;

        if (this.mounted) {
            this.setState({
                helpLinesParent: helpLinesParent !== this && helpLinesParent
            }, () => {
                helpLinesParent &&
                this.props.select.updateHelpLines(this, this.state.helpLinesParent,
                    this.getSize(false), this.state.dragging);

                if (callback)
                    callback();
            });
        }
    };

    onScroll = (e) => {
        if (this.callOverride("onScroll", e))
            return;

        this.isEditor() && this.invalidateSize(true, false, true);
        this.isEditor() && this.props.select.updateParentsRect();
        this.isEditor() && this.props.select.onScrollItem();
        this.onScrollEnd(e);
    };

    onRootScroll = (e) => {
        if (this.getFromTempData("isFixed")) {
            this.props.parent.forceScroll(e);
        }

        let {isPage} = this.props;

        if (isPage) {
            let el = this.rootDivRef.current;
            if (el.scrollHeight - el.clientHeight === 0)
                document.documentElement.style.setProperty('--page-scroll', 0);
            else
                document.documentElement.style.setProperty('--page-scroll',
                    el.scrollTop / (el.scrollHeight - el.clientHeight));
        }
    };

    forceScroll = (e) => {
        clearTimeout(this.scrollReset);

        if (!this.targetScroll) this.targetScroll = {
            top: this.rootDivRef.current.scrollTop
        };

        if (this.targetScroll.top < 0 && e.deltaY > 0)
            this.targetScroll.top = 0;

        let maxTop = this.rootDivRef.current.scrollHeight - this.getSize(false).height;
        if (this.targetScroll.top > maxTop && e.deltaY < 0) {
            this.targetScroll.top = maxTop;
        }

        this.targetScroll.top += e.deltaY;

        this.rootDivRef.current.scrollTo({
            top: this.targetScroll.top,
            behavior: 'smooth'
        });

        this.scrollReset = setTimeout(() => {
            this.targetScroll = {
                top: this.rootDivRef.current.scrollTop
            };
        }, 500);
    }

    onScrollEnd = debounce((e) => {
        if (this.callOverride("onScrollEnd", e))
            return;

        this.isEditor() && this.invalidateSize();
        this.isEditor() && this.addToSnap();
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

    isEditor = () => {
        return this.props.editor;
    }

    playAnimation = (disable, force) => {
        let compositeDesign = getCompositeDesignData(this);
        if (!compositeDesign.animation || !compositeDesign.animation.name)
            return;

        if (!force && this.getFromData("dontAnimate"))
            return;

        // Component going to show animation, so add end listener for more action
        let onAnimationEnd = DynamicAnimations[compositeDesign.animation.name].onAnimationEnd;

        let stateChange = {
            forceKey: "animationReplay",
            showAnimation: true,
            onAnimationEnd
        };

        if (disable) {
            stateChange.disableVS = true;
            this.setTempData("dontAnimate", true);
        }

        this.isEditor() && this.props.select.activateHover(false);
        this.isEditor() && this.props.select.activateResize(false);

        this.setState(stateChange);
    };

    onAnimationEnd = () => {
        this.setState({forceKey: undefined, showAnimation: undefined});
        this.isEditor() && this.props.select.activateHover(true);
        this.isEditor() && this.props.select.activateResize(true);
        this.invalidateSize(true,false,true);
    };

    getCompositeAnimationCss = (compositeAnimation = {}) => {
        if (!(compositeAnimation.name && this.state.forceKey && this.state.showAnimation))
            return;

        return DynamicAnimations[compositeAnimation.name]
            .getAnimationCSS(this, compositeAnimation.options);
    };

    onContextMenu = (e) => {
        if (!this.isEditor()) return;

        e.preventDefault();
        this.onSelect(true);
        this.props.select.onContextMenu(e, this);
    };

    getContextMenu = () => {
        if (this.hasOverride("getContextMenu"))
            return this.callOverride("getContextMenu");
    };

    onDoubleClick = (e) => {
        if (this.callOverride("onDoubleClick", e))
            return;
    }

    animationRunning = debounce(() => {
        this.onAnimationFrame();
    }, 200);

    onAnimationFrame = () => {
        this.invalidateSize(false, false, true);
        if (this.state.showAnimation)
            window.requestAnimationFrame(this.onAnimationFrame);
    }

    render () {
        let {className, animationCss, as, editor, select, id, getStaticChildren,
            isPage, page, getChildrenOverride, modifyContainerStyleOverride} = this.props;
        let {selected, runtimeStyle, portalNodeId, disableVS, showAnimation, forceKey, grid,
            draggingStart, showGridLines, resizeHelpData} = this.state;
        let isContainer = this.props.griddata.isContainer;
        let children = this.children;
        let resizeData = this.resizeData;
        let size = runtimeStyle || this.getSize(false);
        let compositeDesign = getCompositeDesignData(this);
        let compositeTransform = this.getCompositeFromData("transform") || {};
        let compositeStyle = this.getCompositeFromData("style");
        // let grid = this.getCompositeFromData("grid");
        let overflowData = this.getCompositeFromData("overflowData");
        let anchor = this.getFromTempData("anchor");
        let customStyle = this.getFromTempData("customStyle") || {};
        let selectAsParent = this.props.gridLine.hasGridLine(this.props.id, "B") !== undefined;

        let classes = classNames(
            "AwesomeGridLayoutRoot",
            "AwesomeGridLayoutGrid",
            className,
            this.getDesignStyleId(),
            this.getGridItemStyleId(),
            this.getStyleId(),
            this.getCompositeAnimationCss(compositeDesign.animation),
            isPage && "PageScrollBar"
        );

        let holderClasses = classNames(
            "AwesomeGridLayoutHolder",
            this.getTransformStyleId(),
        );

        let TagAs = as || "div";

        if (showAnimation) this.animationRunning();

        return (
            <Portal nodeId={portalNodeId} disabled={!portalNodeId}>
                <VisibilitySensorWrapper
                    animation={compositeDesign.animation}
                    editor={editor}
                    playAnimation={this.playAnimation}
                    select={select}
                    disableVS={disableVS}
                >
                        <TagAs
                            onMouseDown={!showAnimation ? this.onMouseDown : undefined}
                            onMouseOver={this.onMouseOver}
                            onMouseEnter={this.onMouseEnter}
                            onMouseOut={this.onMouseOut}
                            onScroll={this.onRootScroll}
                            onWheel={this.onRootScroll}
                            onDoubleClick={this.onDoubleClick}
                            id={id}
                            className={classes}
                            style={{
                                ...runtimeStyle,
                                ...(this.canMove() && {cursor: "move"}),
                                // ...(!this.isEditor() && this.getFromTempData("isFixed") && {pointerEvents: "none"}),
                                ...(isPage && {overflowY: "auto", overflowX: "hidden"}),
                                ...(overflowData.state === 'hide' && {
                                    overflowY: 'hidden',
                                    overflowX: 'hidden',
                                }),
                                ...(showAnimation && {
                                    opacity: 0
                                }),
                                ...customStyle
                            }}
                            ref={this.rootDivRef}
                            key={id}
                            onAnimationEnd={this.onAnimationEnd}
                        >
                            {
                                this.getFromTempData("pageResize") &&
                                !showAnimation &&
                                <AdjustmentResizePage
                                    id={id}
                                    key={`${id}_resize`}
                                    sides={['e','w']}
                                    onResizeStart={this.pageResizeStart}
                                    onResize={this.pageResize}
                                    onResizeStop={this.pageResizeStop}
                                    data={runtimeStyle || size}
                                    top={(resizeData && resizeData.top) || (size && size.top)}
                                    left={(resizeData && resizeData.left) || (size && size.left)}
                                    width={(runtimeStyle && runtimeStyle.width) || (size && size.width)}
                                    height={(runtimeStyle && runtimeStyle.height) || (size && size.height)}
                                    draggingStart={draggingStart}
                                    itemId={id}
                                />
                            }

                            {
                                selected && resizeHelpData &&
                                !this.getFromTempData("pageResize") &&
                                !showAnimation &&
                                !isGroupSelected(this) &&
                                <AdjustmentHelpSize
                                    resizeHelpData={resizeHelpData}
                                />
                            }

                            {isPage && <div id={"top"}></div>}
                            <AnimationHolder
                                className={holderClasses}
                                // key={forceKey || `${id}_container`}
                                id={`${id}_child_holder`}
                                disabled={Object.keys(compositeTransform).length > 0}
                                transformRef={this.transformRef}
                            >
                                {
                                    getStaticChildren && getStaticChildren()
                                }

                                <GridChildContainer
                                    id={id}
                                    key={`${id}_container`}
                                    allChildren={children}
                                    grid={grid}
                                    overflowData={overflowData}
                                    showGridLines={showGridLines}
                                    aglStyle={compositeStyle}
                                    overflowRef={this.overflowRef}
                                    containerRef={this.containerRef}
                                    show={isContainer}
                                    onScroll={this.onScroll}
                                    isPage={isPage}
                                    editor={editor}
                                    page={page}
                                    ref={this.backContainerRef}
                                    size={runtimeStyle || size}
                                    getChildrenOverride={getChildrenOverride}
                                    agl={this}
                                    padding={this.getCompositeFromData("padding")}
                                    modifyContainerStyleOverride={modifyContainerStyleOverride}
                                    selectAsParent={selectAsParent}
                                    selected={selected}
                                />
                            </AnimationHolder>
                            {isPage && <div id={"bottom"}></div>}

                            <AGLAnchor
                                anchor={anchor}
                            />

                            {
                                this.state.dragging && this.props.parent &&
                                <Portal nodeId={this.state.portalNodeId ||
                                    `${this.props.parent.props.id}_container`}
                                >
                                    <div
                                        className={this.state.fakeStyle}
                                        style={{
                                            opacity: 0,
                                            pointerEvents: "none",
                                            ...this.state.fakeStyle
                                        }}
                                    />
                                </Portal>
                            }

                        </TagAs>
                </VisibilitySensorWrapper>
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

import React from "react";
import './AwesomwGridLayoutHelper.css';
import {cloneObject} from "./AwesomeGridLayoutUtils";
import merge from 'lodash.merge';
import {v4 as uuidv4} from 'uuid';
import Stack from "./Components/Stack/Stack";
import DynamicComponents from "./Dynamic/DynamicComponents";
import {getCompositeFromData, getFromData, setData} from "./BreakPointManager";
import ContextMenu from "./Test/ContextMenu";
import chroma from "chroma-js";

let deepEqual = require('fast-deep-equal/es6');

export function stretch(item, fromUndoRedo) {
    if (!fromUndoRedo) {
        let itemId = item.props.id;
        let saveGridItemStyle = cloneObject(item.getFromData("gridItemStyle"));
        let saveStyle = cloneObject(item.getFromData("style"));
        item.props.undoredo.add((idMan) => {
            stretch(idMan.getItem(itemId), true);
        }, (idMan) => {
            idMan.getItem(itemId).setGridItemStyle(saveGridItemStyle);
            idMan.getItem(itemId).setStyle(saveStyle);
            idMan.getItem(itemId).props.select.onScrollItem();
        });
    }

    if (item.hasOverride("stretch")) {
        item.callOverride("stretch", item);
        return;
    }

    if (!item.props.parent)
        return;

    let beStretch = false;
    let gridItemStyle = item.getFromData("gridItemStyle");

    if (!isStretch(item))
        beStretch = true;

    item.setDocks(beStretch, beStretch, false, beStretch, item.getFromTempData("autoDock"), undefined, true);

    gridItemStyle.alignSelf = beStretch? "start": "start";
    gridItemStyle.justifySelf = beStretch? "stretch": "center";
    gridItemStyle.marginTop = "0px";
    gridItemStyle.marginLeft = "0px";
    gridItemStyle.marginRight = "0px";
    gridItemStyle.marginBottom = "0px";
    item.setStyleParam("width", "auto");
    item.setStyleParam("height", "100%");
    item.setStyleParam("minHeight", "unset");

    if (!beStretch) {
        let parentRect = item.props.parent.getSize();
        gridItemStyle.marginTop = `${(parentRect.height - 0.8 * parentRect.height) / 2}px`;

        item.setStyleParam("width", "80%");
        item.setStyleParam("height", "auto");
        item.setStyleParam("minHeight", `${0.8 * parentRect.height}px`);
    }

    item.setGridItemStyle(gridItemStyle);
    item.props.select.onScrollItem();
}

export function isStretch(item, log) {
    if (item.hasOverride("isStretch")) {
        return item.callOverride("isStretch", item, log);
    }

    if (!item.props.parent)
        return false;

    let gridItemStyle = item.getFromData("gridItemStyle");

    return !(gridItemStyle.alignSelf !== "start" || gridItemStyle.justifySelf !== "stretch" ||
        gridItemStyle.marginTop !== "0px" || gridItemStyle.marginLeft !== "0px" ||
        gridItemStyle.marginRight !== "0px" || gridItemStyle.marginBottom !== "0px");
}

export function allowStretch(item) {
    if (!item.props.parent)
        return false;

    if (item.props.as === "section" || item.props.as === "header" || item.props.as === "footer")
        return false;

    return !item.props.disableStretch;
}

export function alignItem(item, vertical, horizontal, fromUndoRedo) {
    if (!fromUndoRedo) {
        let itemId = item.props.id;
        let saveGridItemStyle = cloneObject(item.getFromData("gridItemStyle"));
        item.props.undoredo.add((idMan) => {
            alignItem(idMan.getItem(itemId), vertical, horizontal, true);
        }, (idMan) => {
            idMan.getItem(itemId).setGridItemStyle(saveGridItemStyle);
            idMan.getItem(itemId).props.select.onScrollItem();
        });
    }

    if (!item.props.parent)
        return;

    let gridItemStyle = item.getFromData("gridItemStyle");

    if (vertical) {
        gridItemStyle.alignSelf = vertical;
        gridItemStyle.marginTop = "0px";
        gridItemStyle.marginBottom = "0px";
    }
    if (horizontal) {
        gridItemStyle.justifySelf = horizontal;
        gridItemStyle.marginLeft = "0px";
        gridItemStyle.marginRight = "0px";
    }

    let baseDocks = item.getBaseDocks();
    item.setDocks(
        baseDocks.top, baseDocks.left, baseDocks.bottom, baseDocks.right,
        item.getFromTempData("autoDock"), undefined, true
    );

    item.setGridItemStyle(gridItemStyle);
    item.props.select.onScrollItem();
}

export function setScrollBehaviour(item, behaviour, pageAgl, fromUndoRedo, {offsetTop} = {}) {
    if (!fromUndoRedo) {
        let itemId = item.props.id;
        let pageId = pageAgl.props.id;
        let oldBehaviour = item.getFromData("isFixed")? "fixed": item.getFromData("scrollBehaviour") || "none";
        let oldOffsetTop = item.getFromData("scrollStickyOffsetTop");
        item.props.undoredo.add((idMan) => {
            setScrollBehaviour(idMan.getItem(itemId), behaviour, idMan.getItem(pageId), true, {offsetTop});
        }, (idMan) => {
            setScrollBehaviour(idMan.getItem(itemId), oldBehaviour, idMan.getItem(pageId), true,
                {offsetTop: oldOffsetTop});
        });
    }

    if (!item.props.parent)
        return;

    let oldIsFixed = item.getFromTempData("isFixed");

    let lastSectionId = item.getFromTempData("lastSectionId");
    if (oldIsFixed && behaviour !== "fixed" && lastSectionId) {
        item.props.parent.onChildLeave(item);
        let itemRect = item.getSize(false);
        let sectionParent = item.props.viewRef.current
            .props.aglComponent.getSectionOfPoint(itemRect.left, itemRect.top);

        sectionParent.onSelect(true, undefined, undefined, undefined, true);
        sectionParent.prepareRects();
        sectionParent.onChildDrop(item, undefined, false, (newItem) => {
            newItem.setState({portalNodeId: undefined});
            window.requestAnimationFrame(() => {
                newItem.onSelect(true);
            });
        });
    }

    item.setTempData("isFixed", behaviour === "fixed");
    item.setDataInBreakpoint("scrollBehaviour", behaviour);
    item.setDataInBreakpoint("scrollStickyOffsetTop", offsetTop);

    switch (behaviour) {
        case "none":
            item.setStyleParam("position", undefined);
            item.setStyleParam("top", undefined);
            item.setStyleParam("pointerEvents", undefined);
            break;
        case "sticky":
            item.setStyleParam("position", "sticky");
            item.setStyleParam("top", offsetTop || 0);
            item.setStyleParam("pointerEvents", undefined);
            break;
        case "fixed":
            if (!oldIsFixed) {
                addFixedChildToRoot(item, pageAgl);
            }
            break;
    }
}

function addFixedChildToRoot(item, pageAgl) {
    let oldParentRect = item.props.parent.getSize(false);
    item.toggleHelpLines();
    item.setTempData("lastSectionId", item.props.parent.props.id);
    item.props.parent.onChildLeave(item);
    pageAgl.onSelect(true, undefined, undefined, undefined, true);
    let pageRect = pageAgl.prepareRects();
    let itemRect = item.getSize(false);

    pageAgl.onChildDrop(item, undefined, true, (newItem) => {
        window.requestAnimationFrame(() => {
            newItem.onSelect(true);
        });
    });

    let gridItemStyle = item.getFromData("gridItemStyle");
    gridItemStyle.gridArea = "1/1/2/2";

    item.setGridItemStyle(gridItemStyle);

    let style = item.getCompositeFromData("style");

    let newWidth = itemRect.width *  oldParentRect.width / pageRect.width;
    item.setStyleParam("width", getStyleValueFromPx(newWidth, oldParentRect.width,
        getUnitFromStyleValue(style.width), item));
    item.setStyleParam("height", getStyleValueFromPx(itemRect.height, oldParentRect.height,
        getUnitFromStyleValue(style.height), item));
    item.setStyleParam("position", undefined);
    item.setStyleParam("top", undefined);
    item.setStyleParam("pointerEvents", "auto");
}

export function isFixed(item) {
    return item.getFromTempData("isFixed");
}

export function hideInBreakPoint(item, fromUndoRedo) {
    if (!fromUndoRedo) {
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            hideInBreakPoint(idMan.getItem(itemId), true);
        }, (idMan) => {
            showInBreakPoint(idMan.getItem(itemId), true);
        });
    }
    item.setStyleParam("display", "none !important");
    item.props.viewRef.current.props.aglComponent.updateTemplates();
    item.props.select.onScrollItem();
    item.props.editor.updateLayout();
}

export function isHideInBreakPoint(item, fromUndoRedo) {
    return item.getCompositeFromData("style").display === "none !important";
}

export function showInBreakPoint(item, fromUndoRedo) {
    if (!fromUndoRedo) {
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            showInBreakPoint(idMan.getItem(itemId), true);
        }, (idMan) => {
            hideInBreakPoint(idMan.getItem(itemId), true);
        });
    }
    item.setStyleParam("display", undefined);
    let newStyle = item.getFromData("style");
    if (newStyle && Object.keys(newStyle).length === 0) {
        item.setDataInBreakpoint("style", undefined);
    }
    item.props.viewRef.current.props.aglComponent.updateTemplates();
    item.props.editor.updateLayout();
}

export function hasBreakpointDesign(fromName, item) {
    let fromData = item.props.griddata.bpData[fromName];
    return !(fromData === undefined);
}

export function pasteFromBreakpointDesign(item, fromName, toName, fromUndoRedo) {
    let fromData = item.props.griddata.bpData[fromName].design;
    if (fromData === undefined)
        return;

    if (!toName)
        toName = item.props.breakpointmanager.current();

    if (!item.props.griddata.bpData[toName])
        item.props.griddata.bpData[toName] = {};

    let currentData = item.props.griddata.bpData[toName].design;

    if (!fromUndoRedo) {
        let itemId = item.props.id;
        let oldData = cloneObject(currentData);
        item.props.undoredo.add((idMan) => {
            pasteFromBreakpointDesign(idMan.getItem(itemId), fromName, toName, true);
        }, (idMan) => {
            idMan.getItem(itemId).props.griddata.bpData[toName].design = oldData;
            idMan.getItem(itemId).onBreakpointChange(
                idMan.getItem(itemId).props.breakpointmanager.getWindowWidth(),
                idMan.getItem(itemId).props.breakpointmanager.current());
        });
    }

    if (!currentData)
        currentData = {};
    merge(currentData, fromData);
    item.props.griddata.bpData[toName].design = currentData;

    item.onBreakpointChange(
        item.props.breakpointmanager.getWindowWidth(),
        item.props.breakpointmanager.current());
}

export function deepAssign(fromData, currentData) {
    Object.keys(fromData).map(key => {
        let currentValue = currentData[key];
        let fromValue = fromData[key];
        if (currentValue === undefined) {
            currentData[key] = cloneObject(fromValue);
        } else {
            if (fromValue instanceof Object) {
                if (!currentValue)
                    currentData[key] = {};
                deepAssign(fromValue, currentValue)
            } else {
                currentData[key] = cloneObject(fromValue);
            }
        }
    });
}

export function removeOverrides(item, fromName, fromUndoRedo) {
    if (!fromName)
        fromName = item.props.breakpointmanager.current();

    if (fromName === "laptop")
        return;

    if (!item.props.griddata.bpData[fromName])
        return;

    if (!fromUndoRedo) {
        let itemId = item.props.id;
        let oldData = cloneObject(item.props.griddata.bpData[fromName] || {});
        item.props.undoredo.add((idMan) => {
            removeOverrides(idMan.getItem(itemId), fromName, true);
        }, (idMan) => {
            idMan.getItem(itemId).props.griddata.bpData[fromName] = oldData;
            idMan.getItem(itemId).onBreakpointChange(
                idMan.getItem(itemId).props.breakpointmanager.getWindowWidth(),
                idMan.getItem(itemId).props.breakpointmanager.current());
        });
    }

    item.props.griddata.bpData[fromName] = {};

    item.onBreakpointChange(
        item.props.breakpointmanager.getWindowWidth(),
        item.props.breakpointmanager.current());
}

export function applyOnAllBreakPoint(item, fromName, fromUndoRedo) {
    if (!fromName)
        fromName = item.props.breakpointmanager.current();

    if (!item.props.griddata.bpData[fromName])
        return;

    let fromData = item.props.griddata.bpData[fromName];

    let undoData = {};

    let sortedBreakPoints = item.props.breakpointmanager.getSortedBreakPoints();
    for(let i = 0; i < sortedBreakPoints.length; i++) {
        let toName = sortedBreakPoints[i].name;
        if (fromData !== toName) {
            undoData[toName] = cloneObject(item.props.griddata.bpData[toName] || {});
            item.props.griddata.bpData[toName] = cloneObject(fromData);
        }
    }

    if (!fromUndoRedo) {
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            applyOnAllBreakPoint(idMan.getItem(itemId), fromName, true);
        }, (idMan) => {
            Object.keys(undoData).forEach(key => {
                idMan.getItem(itemId).props.griddata.bpData[key] = undoData[key];
            });

            idMan.getItem(itemId).onBreakpointChange(
                idMan.getItem(itemId).props.breakpointmanager.getWindowWidth(),
                idMan.getItem(itemId).props.breakpointmanager.current());
        });
    }

    item.onBreakpointChange(
        item.props.breakpointmanager.getWindowWidth(),
        item.props.breakpointmanager.current());
}

export function copyDesign(item, fromAll) {
    let currentBpName = item.props.breakpointmanager.current();

    let designDatas = [];
    if (!fromAll && item.props.griddata.bpData[currentBpName])
        designDatas[0] = {
            bpName: currentBpName,
            design: item.props.griddata.bpData[currentBpName].design,
            justOneBp: true
        };
    else if (fromAll) {
        Object.keys(item.props.griddata.bpData).forEach((key, index) => {
            designDatas[index] = {
                bpName: key,
                design: item.props.griddata.bpData[key].design
            };
        });
    }

    console.log("copyDesign", designDatas);
    if (designDatas.length > 0)
        item.props.breakpointmanager.copyDesign(designDatas, item);
}

export function pasteDesign(item, fromUndoRedo) {
    if (!fromUndoRedo) {
        let itemId = item.props.id;
        let copyDesign = cloneObject(item.props.breakpointmanager.getCopyDesign().designDatas);
        let allOldDesign = cloneObject(Object.keys(item.props.griddata.bpData).map(key => {
            return {
                bpName: key,
                design: item.props.griddata.bpData[key].design
            }
        }));
        item.props.undoredo.add((idMan) => {
            let item = idMan.getItem(itemId);
            console.log(111);
            let temp = cloneObject(item.props.breakpointmanager.getCopyDesign().designDatas);
            let sourceItemTemp = item.props.breakpointmanager.getCopyDesign().sourceItem;
            console.log(222);
            item.props.breakpointmanager.cloneDesignDatas = {
                designDatas: copyDesign,
                sourceItem: item
            };
            item.props.breakpointmanager.pasteDesign(item);
            console.log(333);
            item.props.breakpointmanager.cloneDesignDatas = {
                designDatas: temp,
                sourceItem: sourceItemTemp
            };

            item.onBreakpointChange(
                item.props.breakpointmanager.getWindowWidth(),
                item.props.breakpointmanager.current());

            item.props.aglComponent.updateDesign &&
                item.props.aglComponent.updateDesign(item.getCompositeFromData("design"));

            item.updateLayout();
            console.log(444);
        }, (idMan) => {
            let item = idMan.getItem(itemId);
            allOldDesign.forEach(designData => {
                item.props.griddata.bpData[designData.bpName].design = cloneObject(designData.design);
            });

            item.onBreakpointChange(
                item.props.breakpointmanager.getWindowWidth(),
                item.props.breakpointmanager.current());
        });
    }

    item.props.breakpointmanager.pasteDesign(item);

    item.onBreakpointChange(
        item.props.breakpointmanager.getWindowWidth(),
        item.props.breakpointmanager.current());

    item.props.aglComponent.updateDesign &&
        item.props.aglComponent.updateDesign(item.getCompositeFromData("design"));

    item.updateLayout();
}

export function isGroupSelected(item) {
    return item.props.select.group;
}

export function getSectionId(item) {
    let parent = item.props.parent;
    while (parent && !parent.props.isSection) {
        parent = parent.props.parent;
    }

    if (parent)
        return parent.props.id;

    return uuidv4();
}

export function getSectionParent(item) {
    let parent = item.props.parent;
    while (parent && !parent.props.isSection) {
        parent = parent.props.parent;
    }

    if (parent)
        return parent;
}

export function createStack(items, fromUndoRedo) {
    if (!items || items.length < 2)
        return;

    let itemsParent = getSectionParent(items[0]);

    if (!itemsParent)
        return;

    let top = 99999999;
    let left = 99999999;
    let rightFromLeft = 0;
    let allSpacerData = [];
    let lastBottom;

    items.sort((a,b) => {
        if (a && b){
            let topA = a.getSize(false).top;
            let topB = b.getSize(false).top;
            if (topA < topB) {
                return -1;
            } else if (topA === topB) {
                // Without this, we can get different sort results in IE vs. Chrome/FF
                return 0;
            }
            return 1;
        } else {
            return 0;
        }
    });

    items.forEach((item) => {
        let rect = item.getSize(false);
        top = Math.min(rect.top, top);
        left = Math.min(rect.left, left);
        rightFromLeft = Math.max(rect.left + rect.width, rightFromLeft);

        if (lastBottom) {
            allSpacerData.push({
                height: Math.max(0, rect.top - lastBottom)
            });
        }

        lastBottom = rect.top + rect.height;
    });

    let stack;
    let stackNode =
        <Stack
            style={{
                width: `${rightFromLeft - left}px`,
            }}
            lateMountedComplete={(_stack) => {
                stack = _stack;
            }}
            allSpacerData={allSpacerData}
            document={items[0].props.document}
        />;

    let parentRect = itemsParent.prepareRects();
    itemsParent.addChild(stackNode, undefined, undefined, undefined, (agl) => {
        if (!fromUndoRedo) {
            let stackId = agl.props.id;
            let itemIds = items.map(item => {
                return item.props.id;
            });
            agl.props.undoredo.add((idMan) => {
                let newItems = itemIds.map(id => {
                    return idMan.getItem(id);
                });
                newItems.forEach(item => {
                    item.onSelect(true);
                });
                createStack(newItems, true);
            }, (idMan) => {
                removeStackFromAGL(idMan.getItem(stackId), undefined, true);
            });
        }

        agl.onSelect(true);
        let {gridItemStyle} =
            agl.calculateGridItem(left - parentRect.left, top - parentRect.top,
                itemsParent, undefined, undefined, itemsParent.getSize(false));
        agl.setGridItemStyle(gridItemStyle);
        agl.prepareRects();
        // agl.prepareRects(true);
        setTimeout(() => {
            items = items.filter(item => {
                return item.props.id !== agl.props.id;
            });

            let addToStack = (items) => {
                let item = items.shift();
                if (!item)
                    return;

                item.props.parent.onChildLeave(item);
                agl.onChildDrop(item, undefined, undefined, () => {
                    addToStack(items);
                });
            };
            addToStack(items);
            setTimeout(() => {
                stack.setOrder();
                setTimeout(() => {
                    let width = agl.getSize(false, true).width;
                    let parentWidth = agl.props.parent.getSize(false).width;
                    agl.setProps("width", `${width / parentWidth * 100}%`);
                    agl.onSelect(true);
                }, 0);
            }, 0);
        }, 0);
    });
}

export function removeStack(stack, childIds, fromUndoRedo) {
    removeStackFromAGL (stack.aglRef.current, childIds, fromUndoRedo);
}

export function removeStackFromAGL(stackAgl, childIds, fromUndoRedo) {
    stackAgl.removing = true;
    if (!stackAgl || !stackAgl.props.isStack)
        return;

    if (!fromUndoRedo) {
        let stackId = stackAgl.props.id;
        stackAgl.props.undoredo.add((idMan) => {
            removeStackFromAGL(idMan.getItem(stackId), childIds, true);
        }, (idMan) => {
            let newItems = childIds.map(id => {
                return idMan.getItem(id);
            });
            createStack(newItems, true);
        });
    }

    let newParent = stackAgl.props.parent;
    stackAgl.clearItem();

    let sorted = Object.values(stackAgl.allChildRefs).sort((a,b) => {
        if (a && a.current && b && b.current){
            let relativeYA = a.current.getFromData("relativeY");
            let relativeYB = b.current.getFromData("relativeY");
            if (relativeYA < relativeYB) {
                return 1;
            } else if (relativeYA === relativeYB) {
                // Without this, we can get different sort results in IE vs. Chrome/FF
                return 0;
            }
            return -1;
        } else {
            return 0;
        }
    });

    newParent.onSelect(true);
    newParent.prepareRects();
    // newParent.prepareRects(true);
    let removeChilds = (sorted) => {
        let item = sorted.shift();

        if (!item) {
            setTimeout(() => {
                newParent.onChildLeave(stackAgl);
            }, 0);
            return;
        }
        setTimeout(() => {
            if (item && item.current) {
                item.current.props.parent.onChildLeave(item.current);
                newParent.onChildDrop(item.current);
            }
            removeChilds(sorted, newParent);
        }, 0);
    };

    removeChilds(sorted);
    /*sorted.forEach(item => {
        if (item && item.current) {
            console.log("onChildDrop", item.current.props.id);
            item.current.props.parent.onChildLeave(item.current);
            newParent.onChildDrop(item.current);
        }
    });*/
}

export function createItem(parent, childData, fromUndoRedo, gridItemStyle, style, onChildMounted) {
    childData.props = cloneObject(parent.getClearProps({...childData.props}, true));
    childData.zIndex = parent.getNextIndexData(0).lastZIndex + 1;

    if (gridItemStyle) {
        parent.setDataInBreakpoint(
            "gridItemStyle", gridItemStyle, childData.props.griddata,
            parent.props.breakpointmanager.getHighestBpName());
    }
    if (style) {
        parent.setDataInBreakpoint(
            "style", style, childData.props.griddata,
            parent.props.breakpointmanager.getHighestBpName());
    }

    let child = parent.createChildByData(
        childData , DynamicComponents, undefined, (newItem) => {
        newItem.onSelect(true);

        onChildMounted && onChildMounted(newItem);

        if (!fromUndoRedo) {
            let itemId = newItem.props.id;
            let parentId = parent.props.id;
            let childData = cloneObject(parent.getChildData(itemId));
            parent.props.undoredo.add((idMan) => {
                createItem(idMan.getItem(parentId), childData, true, gridItemStyle, style);
            }, (idMan) => {
                idMan.getItem(itemId).delete(true);
            });
        }
    });

    parent.children[childData.props.id] = {
        child: child,
        zIndex: childData.zIndex
    };

    let savedChildren = parent.getFromTempData("savedChildren");
    savedChildren[childData.props.id] = childData;

    parent.updateLayout();
}

export function setDataInBreakpoint(prop, value, item, addToUndo, breakpointName, updateLayout){
    if (addToUndo) {
        let oldValue = item.getFromData(prop, undefined, breakpointName);
        oldValue = cloneObject(oldValue);
        let saveValue = cloneObject(value);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setDataInBreakpoint(prop, saveValue, idMan.getItem(itemId), false, breakpointName, updateLayout);
        }, (idMan) => {
            setDataInBreakpoint(prop, oldValue, idMan.getItem(itemId), false, breakpointName, updateLayout);
        }, addToUndo);
    }
    item.setDataInBreakpoint(prop, value, undefined, breakpointName);

    updateLayout && item.updateLayout();
}

export function setTempData(prop, value, item, addToUndo){
    if (addToUndo) {
        let oldValue = item.getFromTempData(prop);
        oldValue = cloneObject(oldValue);
        let saveValue = cloneObject(value);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setTempData(prop, saveValue, idMan.getItem(itemId));
        }, (idMan) => {
            setTempData(prop, oldValue, idMan.getItem(itemId));
        });
    }
    item.setTempData(prop, value);
}

export function setStyle(newStyle, item, addToUndo, breakpointName, updateLayout){
    if (addToUndo) {
        let oldStyle = item.getFromData("style", undefined, breakpointName);
        oldStyle = cloneObject(oldStyle);
        let saveStyle = cloneObject(newStyle);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setStyle(saveStyle, idMan.getItem(itemId));
        }, (idMan) => {
            setStyle(oldStyle, idMan.getItem(itemId));
        });
    }
    item.setStyle(newStyle);
    updateLayout && item.updateLayout();
}

export function setStyleParam (param, value, item, addToUndo, breakpointName, dontAddToSnap) {
    if (addToUndo) {
        let oldStyle = item.getFromData("style", undefined, breakpointName);
        oldStyle = cloneObject(oldStyle);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setStyleParam(param, value, idMan.getItem(itemId), false, breakpointName, dontAddToSnap);
        }, (idMan) => {
            setStyle(oldStyle, idMan.getItem(itemId));
        }, addToUndo);
    }

    let style = item.hasDataInBreakPoint("style", undefined, breakpointName) || {};
    style[param] = value;
    if (value === undefined)
        delete style[param];
    item.setStyle(style, undefined, breakpointName, undefined, dontAddToSnap);
}

export function setNewSize(prop, value, item, addToUndo, breakpointName, updateLayout){
    if (addToUndo) {
        let oldValue = item.getFromData(`style.${prop}`, undefined, breakpointName);
        let saveStyle = cloneObject(item.getFromData("style)"));
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setStyle(saveStyle, idMan.getItem(itemId));
        }, (idMan) => {
            setNewSize(prop, oldValue, idMan.getItem(itemId));
        });
    }
    item.setNewSize(prop, value);
    updateLayout && item.updateLayout();
}

export function setGridItemStyle(newGridItemStyle, item, addToUndo, breakpointName){
    if (addToUndo) {
        let oldGridItemStyle = item.getFromData("gridItemStyle", undefined, breakpointName);
        oldGridItemStyle = cloneObject(oldGridItemStyle);
        let saveGridItemStyle = cloneObject(newGridItemStyle);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setGridItemStyle(saveGridItemStyle, idMan.getItem(itemId));
        }, (idMan) => {
            setGridItemStyle(oldGridItemStyle, idMan.getItem(itemId));
        });
    }
    item.setGridItemStyle(newGridItemStyle);
    item.invalidateSize(true, true, true);
}

export function setGridArea(newGridArea, item, addToUndo){
    if (addToUndo) {
        let oldGridArea = item.getGridArea();
        oldGridArea = cloneObject(oldGridArea);
        let saveGridArea = cloneObject(newGridArea);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setGridArea(saveGridArea, idMan.getItem(itemId));
        }, (idMan) => {
            setGridArea(oldGridArea, idMan.getItem(itemId));
        });
    }
    item.setGridArea(newGridArea);
}

export function setGrid(newGrid, item, addToUndo, breakpointName){
    if (addToUndo) {
        let oldGrid = item.getFromData("grid", undefined, breakpointName);
        oldGrid = cloneObject(oldGrid);
        let saveGrid = cloneObject(newGrid);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setGrid(saveGrid, idMan.getItem(itemId));
        }, (idMan) => {
            setGrid(oldGrid, idMan.getItem(itemId));
        });
    }
    item.setGrid(newGrid);
}

export function setAnchor(newAnchor, item, addToUndo){
    if (addToUndo) {
        let oldAnchor = item.getFromTempData("anchor");
        oldAnchor = cloneObject(oldAnchor);
        let saveAnchor = cloneObject(newAnchor);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setAnchor(saveAnchor, idMan.getItem(itemId));
        }, (idMan) => {
            setAnchor(oldAnchor, idMan.getItem(itemId));
        });
    }
    item.setAnchor(newAnchor);
}

export function arrangeIndex(item, child, type, addToUndo){
    if (addToUndo) {
        let itemId = item.props.id;
        let childId = child.props.id;
        let oldType = type === "forward"? "backward":
            type === "backward"? "forward": undefined;
        let oldZIndex = item.getFromTempData("savedChildren")[childId].zIndex;
        item.props.undoredo.add((idMan) => {
            arrangeIndex(idMan.getItem(itemId), idMan.getItem(childId), type);
        }, (idMan) => {
            if (oldType)
                arrangeIndex(idMan.getItem(itemId), idMan.getItem(childId), oldType);
            else
                changeIndex(idMan.getItem(itemId), idMan.getItem(childId), oldZIndex);
        });
    }
    item.arrangeIndex(child, type);
}

export function changeIndex (item, child, index, addToUndo){
    if (addToUndo) {
        let itemId = item.props.id;
        let childId = child.props.id;
        let oldZIndex = item.getFromTempData("savedChildren")[childId].zIndex;
        item.props.undoredo.add((idMan) => {
            changeIndex(idMan.getItem(itemId), idMan.getItem(childId), index);
        }, (idMan) => {
            changeIndex(idMan.getItem(itemId), idMan.getItem(childId), oldZIndex);
        });
    }
    item.changeIndex(child, index);
}

export function resolveDesignData (item, key, value){
    let breakpointData = item.props.breakpointmanager;
    if (!getFromData(item.props.griddata, "design", breakpointData, breakpointData.getHighestBpName()))
        setData(item.props.griddata, "design", {}, breakpointData, breakpointData.getHighestBpName());

    if (!key)
        return;

    let design = getFromData(item.props.griddata, "design", breakpointData, breakpointData.getHighestBpName());
    if (!design[key])
        design[key] = value || {};
}

export function getCompositeDesignData (item) {
    let breakpointData = item.props.breakpointmanager;
    if (!getCompositeFromData(item.props.griddata, "design", breakpointData))
        setData(item.props.griddata, "design", {}, breakpointData, breakpointData.getHighestBpName());

    console.log("getCompositeDesignData", item.props.id, item.props.griddata, breakpointData);
    return getCompositeFromData(item.props.griddata, "design", breakpointData);
}

export function rotate (item, degree, fromUndoRedo) {
    if (!fromUndoRedo) {
        let itemId = item.props.id;
        let oldDegree = item.getFromData("rotateDegree");
        item.props.undoredo.add((idMan) => {
            rotate(idMan.getItem(itemId), degree, true);
        }, (idMan) => {
            rotate(idMan.getItem(itemId), oldDegree || 0, true);
        });
    }

    item.setDataInBreakpoint("transform.rotateDegree", degree);
    item.setTransformStyle(item.getFromData("transform"));
    item.updateLayout(item.props.select.onScrollItem);
}

export function getViewRatioStyle (value) {
    if (value.includes('vh'))
        return`calc(${value} * var(--vh-ratio))`;
    if (value.includes('vw'))
        return`calc(${value} * var(--vw-ratio))`;

    return value;
}

export function getValueFromCSSValue (value) {
    if (!value)
        return "";

    if (value.includes("%")) {
        return Math.round(parseFloat(value.replace("%", "")) * 100) / 100;
    }

    if (value.includes("px")) {
        return Math.round(parseFloat(value.replace("px", "")) * 100) / 100;
    }

    if (value.includes("vh")) {
        return Math.round(parseFloat(
            value.replace(/[^0-9\.]/g, '')
        ) * 100) / 100;
    }

    if (value.includes("vw")) {
        return Math.round(parseFloat(
            value.replace(/[^0-9\.]/g, '')
        ) * 100) / 100;
    }

    return value;
}

export function getPxValueFromCSSValue (value, parentValue, item) {
    if (!value)
        return;
    if (!isNaN(value))
        return value;

    if (value.includes("%")) {
        let percent = Math.round(parseFloat(value.replace("%", "")) * 100) / 100;
        return percent * parentValue / 100;
    }

    if (value.includes("px")) {
        return Math.round(parseFloat(value.replace("px", "")) * 100) / 100;
    }

    if (value.includes("vh")) {
        let percent = Math.round(parseFloat(
            value.replace(/[^0-9\.]/g, '')
        ) * 100) / 100;

        return percent * item.props.breakpointmanager.getWindowHeight() / 100;
    }

    if (value.includes("vw")) {
        let percent =  Math.round(parseFloat(
            value.replace(/[^0-9\.]/g, '')
        ) * 100) / 100;

        return percent * item.props.breakpointmanager.getWindowWidth() / 100;
    }

    return value;
}

export function getStyleValueFromPx (value, parentValue, unit, item) {
    if (!unit)
        unit = "px";

    if (unit === "px") {
        return `${value}${unit}`;
    }
    if (unit === "%") {
        return `${value / parentValue * 100}${unit}`;
    }
    if (unit === "vh") {
        value = `${value / item.props.breakpointmanager.getWindowHeight() * 100}vh`;
        return `calc(${value} * var(--vh-ratio))`;
    }
    if (unit === "vw") {
        value = `${value / item.props.breakpointmanager.getWindowWidth() * 100}vw`;
        return `calc(${value} * var(--vw-ratio))`;
    }

    return unit;
}

export function getUnitFromStyleValue (value) {
    if (!value)
        return "none";

    if (value.includes("%")) {
        return "%";
    }

    if (value.includes("px")) {
        return "px";
    }

    if (value.includes("vw")) {
        return "vw";
    }

    if (value.includes("vh")) {
        return "vh";
    }

    return value;
}

export function createContextMenu(e, item, onClose) {
    if (item.props.isPage)
        return;

    let menu = [];

    item.getContextMenu() && menu.push(item.getContextMenu());

    // Copy section
    let copySection = [
        {
            name: "Copy",
            onClick: (e) => {
                item.props.copyMan.copy(item);
            },
            shortcut: "Ctrl + C"
        },
        {
            name: "Paste",
            onClick: (e) => {
                item.props.copyMan.paste(item);
            },
            shortcut: "Ctrl + V"
        },
        {
            name: "Duplicate",
            onClick: (e) => {
                item.props.copyMan.duplicate(item);
            },
            shortcut: "Ctrl + D"
        },
        {
            name: "Copy Element Design",
            subMenu: [
                {
                    name: "From this breakpoint",
                    onClick: (e) => {
                        copyDesign(item);
                    }
                },
                {
                    name: "From all breakpoint",
                    onClick: (e) => {
                        copyDesign(item, true);
                    }
                },
            ]
        },
    ];
    let copyDesignItem = item.props.breakpointmanager.getCopyDesign();
    if (copyDesignItem && isSameFamily(copyDesignItem.sourceItem, item))
        copySection.push({
            name: "Paste Design",
            onClick: (e) => {
                pasteDesign(item);
            }
        });
    let overrideBps = [];
    let currentBpName = item.props.breakpointmanager.current();
    Object.keys(item.props.griddata.bpData).forEach(bpName => {
        if (bpName === currentBpName ||
            item.props.breakpointmanager.getHighestBpName() === bpName)
            return;

        if (item.props.griddata.bpData[bpName] && item.props.griddata.bpData[bpName].design) {
            if (!item.props.griddata.bpData[currentBpName] ||
                !deepEqual(item.props.griddata.bpData[bpName].design,
                    item.props.griddata.bpData[currentBpName].design)) {
                overrideBps.push(bpName);
            }
        }
    });
    if (overrideBps.length > 0) {
        copySection.push({
            name: "Paste From Breakpoint",
            subMenu: overrideBps.map(bpName => {
                return {
                    name: bpName,
                    onClick: (e) => {
                        pasteFromBreakpointDesign(item, bpName, currentBpName);
                    }
                };
            })
        });
    }
    menu.push(copySection);

    let deleteSection = [];
    if (!isHideInBreakpoint(item)) {
        deleteSection.push(
            {
                name: "Hide In Breakpoint",
                onClick: (e) => {
                    hideInBreakPoint(item);
                }
            });
    }
    deleteSection.push({
        name: "Delete",
        onClick: (e) => {
            item.delete();
        },
        shortcut: "Delete"
    });

    if (currentBpName !== item.props.breakpointmanager.getHighestBpName()) {
        if (item.props.griddata.bpData[currentBpName] &&
            Object.keys(item.props.griddata.bpData[currentBpName]).length > 0)
        {
            deleteSection.unshift({
                name: "Remove Breakpoint Overrides",
                onClick: (e) => {
                    // TODO add these lines to a function with undo support
                    delete item.props.griddata.bpData[currentBpName];
                    item.onBreakpointChange(
                        item.props.breakpointmanager.getWindowWidth(),
                        item.props.breakpointmanager.current());
                    item.props.select.onScrollItem();
                }
            });
        }
    }
    menu.push(deleteSection);

    let shortcutSection = [];
    if (!item.props.griddata.isSection) {
        shortcutSection.push({
            name: "Arrange",
            subMenu: [
                {
                    name: "Move Forward",
                    shortcut: "Ctrl + Alt + ↑",
                    onClick: (e) => {
                        arrangeIndex(item.props.parent, item, "forward", true);
                    }
                },
                {
                    name: "Move to Front",
                    shortcut: "Ctrl + ↑",
                    onClick: (e) => {
                        arrangeIndex(item.props.parent, item, "front", true);
                    }
                },
                {
                    name: "Move Backward",
                    shortcut: "Ctrl + Alt + ↓",
                    onClick: (e) => {
                        arrangeIndex(item.props.parent, item, "backward", true);
                    }
                },
                {
                    name: "Move to Back",
                    shortcut: "Ctrl + ↓",
                    onClick: (e) => {
                        arrangeIndex(item.props.parent, item, "back", true);
                    }
                }
            ]
        });
    }
    menu.push(shortcutSection);

    let sectionSection = [];
    if (item.props.isSection) {
        if (item.props.isVerticalSection) {
            sectionSection.push({
                name: "Move Left",
                onClick: (e) => {
                    item.props.parent.props.aglComponent.moveLeft(item.props.id);
                },
            });
            sectionSection.push({
                name: "Move Right",
                onClick: (e) => {
                    item.props.parent.props.aglComponent.moveRight(item.props.id);
                },
            });
        } else {
            sectionSection.push({
                name: "Move Up",
                onClick: (e) => {
                    item.props.parent.props.aglComponent.moveUp(item.props.id);
                },
            });
            sectionSection.push({
                name: "Move Down",
                onClick: (e) => {
                    item.props.parent.props.aglComponent.moveDown(item.props.id);
                },
            });
        }
    }
    menu.unshift(sectionSection);

    let masterSection = [
    ];

    return <ContextMenu
        menu={menu}
        onClose={onClose}
        clientX={e.clientX}
        clientY={e.clientY}
    />
}

export function isHideInBreakpoint(item) {
    if (!item)
        return false;

    if (typeof item.getCompositeFromData("style").display === 'string')
        return item.getCompositeFromData("style").display.includes("none");

    return false;
}

export function isSameFamily(item1, item2) {
    if (item1.props.tagName === item2.props.tagName)
        return true;

    if (item1.props.griddata.isSection && item2.props.griddata.isSection)
        return true;
}

export function isLeftClick (e) {
    if (e.button === 0)
        return true;

    return false;
}

export function isRightClick (e) {
    if (e.button === 2)
        return true;

    return false;
}

export function getResizeDelta (degree, dir, delta) {
    let rad = degree * Math.PI / 180;
    let cx = delta.x, cy = delta.y;
    let cxy = Math.sqrt(cx * cx + cy * cy);
    let cxp = cy !== 0 ? cy / Math.tan(rad) : 0;
    let cyp = cx !== 0 ? -cx / Math.tan(rad) : 0;

    let thetaH = Math.atan(Math.abs(cy) / Math.abs(cx));
    let thetaW = Math.atan(Math.abs(cy) / Math.abs(cx));

    if (cx * cy > 0)
        thetaW = -thetaW;
    if (cx * cy > 0)
        thetaH = -thetaH;

    let Dh = Math.abs(Math.sin(rad + thetaH) * cxy);
    let Dw = Math.abs(Math.cos(rad + thetaW) * cxy);

    if (cxp < cx)
        Dh = -Dh;
    if (cyp > cy)
        Dw = -Dw;

    if (degree > 180) {
        Dh = -Dh;
        Dw = -Dw;
    }

    let dxH = Dh * Math.sin(rad);
    let dyH = Dh * Math.cos(rad);
    let dxW = Dw * Math.cos(rad);
    let dyW = Dw * Math.sin(rad);

    let finalDelta = {
        top: 0, left: 0, width: 0, height: 0
    };

    if (dir.includes('n')) {
        finalDelta.height -= Dh;
        finalDelta.top += ((Dh + dyH) / 2);
        finalDelta.left -= (dxH / 2);
    }

    if (dir.includes('s')) {
        finalDelta.height += Dh;
        finalDelta.top -= ((Dh - dyH) / 2);
        finalDelta.left -= (dxH / 2);
    }

    if (dir.includes('w')) {
        finalDelta.width -= Dw;
        finalDelta.top += (dyW / 2);
        finalDelta.left += ((Dw + dxW) / 2);
    }

    if (dir.includes('e')) {
        finalDelta.width += Dw;
        finalDelta.top += (dyW / 2);
        finalDelta.left -= ((Dw - dxW) / 2);
    }

    console.log("finalDelta", finalDelta, Dw, dyW, dxW);
    return finalDelta;
}

export function sortBy (array, param) {
    array = array.sort((a, b) => {
        if (a[param] < b[param]) {
            return -1;
        } else if (a[param] === b[param]) {
            return 0;
        }
        return 1;
    });
    return array;
}

export function getColorScheme (baseColor) {
    return {
        "1": chroma(baseColor).luminance(0.025).css(),
        "2": chroma(baseColor).luminance(0.06).css(),
        "3": chroma(baseColor).luminance(0.15).css(),
        "4": chroma(baseColor).luminance(0.35).css(),
        "5": chroma(baseColor).luminance(0.55).css(),
    }
}

export function parseColor (color, alpha, editor) {
    console.log("parseColor", color, alpha)
    if (!color) {
        color = '#000000';
        alpha = alpha || 0;
    }

    if (color instanceof Object) {
        let chromaColor = chroma(editor.themeManagerRef.current.getColor(color.paletteName, color.key));
        if (alpha === undefined || color.alpha !== undefined)
            chromaColor = chromaColor.alpha(alpha || color.alpha);
        else
            chromaColor = chromaColor.alpha(1);
        return chromaColor.css();
    } else {
        let chromaColor = chroma(color);
        // chromaColor = chromaColor.alpha(alpha || 1);
        if (alpha !== undefined)
            chromaColor = chromaColor.alpha(alpha);
        return chromaColor.css();
    }
}

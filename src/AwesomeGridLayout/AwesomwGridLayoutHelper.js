import React from "react";
import './AwesomwGridLayoutHelper.css';
import {cloneObject} from "./AwesomeGridLayoutUtils";
import merge from 'lodash.merge';
import {v4 as uuidv4} from 'uuid';
import Stack from "./Components/Stack/Stack";
import DynamicComponents from "./Dynamic/DynamicComponents";
import {getCompositeFromData, getFromData, setData} from "./BreakPointManager";
import {css, StyleSheet} from "aphrodite";
import Portal from "./Portal";

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

    gridItemStyle.alignSelf = beStretch? "stretch": "start";
    gridItemStyle.justifySelf = beStretch? "stretch": "center";
    gridItemStyle.marginTop = "0px";
    gridItemStyle.marginLeft = "0px";
    gridItemStyle.marginRight = "0px";
    gridItemStyle.marginBottom = "0px";
    item.setStyleParam("width", "auto");
    item.setStyleParam("height", "auto");
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

    return !(gridItemStyle.alignSelf !== "stretch" || gridItemStyle.justifySelf !== "stretch" ||
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

    let style = item.getFromData("style");
    if (isFixed(item) && behaviour !== "fixed" && style.lastSectionId) {
        item.props.parent.onChildLeave(item);
        let sectionParent = pageAgl.current.allChildRefs[style.lastSectionId];
        if (!sectionParent) {
            sectionParent = Object.values(pageAgl.current.allChildRefs)[0];
        }

        sectionParent.current.onSelect(true);
        let sectionRect = sectionParent.current.prepareRects(true);
        sectionParent.current.onChildDrop(item, undefined, false, (newItem) => {
            item.setState({portalNodeId: undefined});
            setTimeout(() => {
                newItem.onSelect(true);
            }, 400);
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
            item.setStyleParam("position", "sticky !important");
            item.setStyleParam("top", offsetTop || 0);
            item.setStyleParam("pointerEvents", undefined);
            break;
        case "fixed":
            if (!isFixed(item))
                addFixedChildToRoot(item, pageAgl);
            break;
    }
}

function addFixedChildToRoot(item, pageAgl) {
    item.toggleHelpLines();
    item.setStyleParam("lastSectionId", item.props.parent.props.id);
    item.props.parent.onChildLeave(item);
    pageAgl.current.onSelect(true);
    let pageRect = pageAgl.current.prepareRects(true);
    let itemRect = item.getSize(false);

    pageAgl.current.onChildDrop(item, undefined, true, (newItem) => {
        setTimeout(() => {
            newItem.onSelect(true);
        }, 400);
    });

    let gridItemStyle = item.getFromData("gridItemStyle");
    gridItemStyle.alignSelf = "start";
    gridItemStyle.justifySelf = "start";
    gridItemStyle.marginTop = `${itemRect.top - pageRect.top}px`;
    gridItemStyle.marginLeft = `${itemRect.left - pageRect.left}px`;
    gridItemStyle.gridArea = "1/1/2/2";

    item.setGridItemStyle(gridItemStyle);

    item.setStyleParam("width", `${itemRect.width}px`);
    item.setStyleParam("height", `${itemRect.height}px`);
    item.setStyleParam("position", undefined);
    item.setStyleParam("top", undefined);
    item.setStyleParam("pointerEvents", "auto");
}

export function isFixed(item) {
    return item.state.portalNodeId === "page_fixed_holder";
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
}

export function hasBreakpointDesign(fromName, item) {
    let fromData = item.props.griddata.bpData[fromName];
    return !(fromData === undefined);
}

export function pasteFromBreakpointDesign(item, fromName, toName, fromUndoRedo) {
    let fromData = item.props.griddata.bpData[fromName];
    if (fromData === undefined)
        return;

    if (!toName)
        toName = item.props.breakpointmanager.current();

    if (!item.props.griddata.bpData[toName])
        item.props.griddata.bpData[toName] = {};

    let currentData = item.props.griddata.bpData[toName];

    if (!fromUndoRedo) {
        let itemId = item.props.id;
        let oldData = cloneObject(currentData);
        item.props.undoredo.add((idMan) => {
            pasteFromBreakpointDesign(idMan.getItem(itemId), fromName, toName, true);
        }, (idMan) => {
            idMan.getItem(itemId).props.griddata.bpData[toName] = oldData;
            idMan.getItem(itemId).onBreakpointChange(
                idMan.getItem(itemId).props.breakpointmanager.getWindowWidth(),
                idMan.getItem(itemId).props.breakpointmanager.current());
        });
    }

    merge(currentData, fromData);

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
        designDatas[0] = item.props.griddata.bpData[currentBpName];
    else if (fromAll) {
        Object.keys(item.props.griddata.bpData).forEach((key, index) => {
            designDatas[index] = item.props.griddata.bpData[key];
        });
    }

    if (designDatas.length > 0)
        item.props.breakpointmanager.copyDesign(designDatas);
}

export function pasetDesign(item, fromUndoRedo)     {
    if (!fromUndoRedo) {
        let itemId = item.props.id;
        let copyDesign = cloneObject(this.props.breakpointmanager.getCopyDesign());
        let oldDesign = cloneObject(item.props.griddata.bpData);
        item.props.undoredo.add((idMan) => {
            let temp = cloneObject(idMan.getItem(itemId).props.breakpointmanager.cloneDesignDatas);
            idMan.getItem(itemId).props.breakpointmanager.cloneDesignDatas = copyDesign;
            idMan.getItem(itemId).props.breakpointmanager.pasteDesign(idMan.getItem(itemId));
            idMan.getItem(itemId).props.breakpointmanager.cloneDesignDatas = temp;

            idMan.getItem(itemId).onBreakpointChange(
                idMan.getItem(itemId).props.breakpointmanager.getWindowWidth(),
                idMan.getItem(itemId).props.breakpointmanager.current());
        }, (idMan) => {
            idMan.getItem(itemId).griddata.bpData = oldDesign;

            idMan.getItem(itemId).onBreakpointChange(
                idMan.getItem(itemId).props.breakpointmanager.getWindowWidth(),
                idMan.getItem(itemId).props.breakpointmanager.current());
        });
    }

    item.props.breakpointmanager.pasteDesign(item);

    item.onBreakpointChange(
        item.props.breakpointmanager.getWindowWidth(),
        item.props.breakpointmanager.current());
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

    let parentRect = itemsParent.prepareRects(true);
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
        agl.prepareRects(true);
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
    newParent.prepareRects(true);
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

export function createItem(parent, childData, fromUndoRedo, gridItemStyle, style) {
    childData.props = cloneObject(parent.getClearProps({...childData.props}, true));
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

export function setDataInBreakpoint(prop, value, item, addToUndo, breakpointName){
    if (addToUndo) {
        let oldValue = item.getFromData(prop, undefined, breakpointName);
        oldValue = cloneObject(oldValue);
        let saveValue = cloneObject(value);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setDataInBreakpoint(prop, saveValue, idMan.getItem(itemId), false, breakpointName);
        }, (idMan) => {
            setDataInBreakpoint(prop, oldValue, idMan.getItem(itemId), false, breakpointName);
        });
    }
    item.setDataInBreakpoint(prop, value, undefined, breakpointName);
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

export function setDesignStyle(newDesignStyle, item, addToUndo, breakpointName){
    if (addToUndo) {
        let oldDesignStyle = item.getFromData("designStyle", undefined, breakpointName);
        oldDesignStyle = cloneObject(oldDesignStyle);
        let saveDesignStyle = cloneObject(newDesignStyle);
        let itemId = item.props.id;
        item.props.undoredo.add((idMan) => {
            setStyle(saveDesignStyle, idMan.getItem(itemId));
        }, (idMan) => {
            setStyle(oldDesignStyle, idMan.getItem(itemId));
        });
    }
    item.setDesignStyle(newDesignStyle);
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
    item.updateLayout();
}

export function getRotatedRectangle (x, y, degree) {
    let rad = (degree || 0) * Math.PI/180;

    let c = (x * Math.tan(rad) - y) / (Math.tan(rad) * Math.tan(rad) - 1);
    let b = (y * Math.tan(rad) - x) / (Math.tan(rad) * Math.tan(rad) - 1);
    let a = c * Math.tan(rad);
    let d = b * Math.tan(rad);

    let x2 = Math.sqrt(b * b + d * d);
    let y2 = Math.sqrt(a * a + c * c);

    return {x2, y2};
}

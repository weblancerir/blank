import {cloneObject} from "./AwesomeGridLayoutUtils";

export default class DragDropManager {
    setDragging = (item) => {
        this.draggingItem = item;
    };

    getDragging = () => {
        return this.draggingItem;
    };

    isDraggingItemFixed = () => {
        if (!this.draggingItem)
            return false;
        return this.draggingItem.state.portalNodeId === "page_fixed_holder";
    };

    // return true if dropping on another parent
    setDraggingStop = () => {
        if (this.draggingItem && this.mouseOver &&
            this.draggingItem.props.parent !== this.mouseOver &&
            !this.mouseOver.getParentsId().includes(this.draggingItem.props.id) &&
            !this.isDraggingItemFixed())
        {
            // this.mouseOver.prepareRects();
            let newParent = this.mouseOver.getContainerParent();
            newParent.prepareRects(true, true);
            newParent.toggleGridLines(true, () => {}, "B");

            if (this.draggingItem.props.parent !== newParent) {
                this.dropItem(this.draggingItem, this.draggingItem.props.parent, newParent);

                this.draggingItem = undefined;
                return true;
            } else {
                this.draggingItem = undefined;
                return false;
            }
        }

        this.draggingItem = undefined;
        return false;
    };

    dropItem = (item, parent, newParent, callback, fromUndoRedo, undoPower) => {
        item.toggleHelpLines();
        parent.onChildLeave(item);

        let drop = () => {
            newParent.onChildDrop(item, undefined, undefined, (newItem) => {
                if (callback)
                    callback(newItem);

                if (!fromUndoRedo) {
                    let itemId = item.props.id;
                    let firstRelativeX =
                        (item.dragData? item.dragData.firstPos.left : newItem.getSize(false).left)
                        - parent.getSize(false).left;
                    let firstRelativeY =
                        (item.dragData? item.dragData.firstPos.top : newItem.getSize(false).top)
                        - parent.getSize(false).top;
                    let parentRect = cloneObject(parent.getSize(false));
                    let lastRelativeX = newItem.getSize(false).left - newParent.getSize(false).left;
                    let lastRelativeY = newItem.getSize(false).top - newParent.getSize(false).top;
                    let newParentRect = cloneObject(newParent.getSize(false));
                    let width = newItem.getSize(false).width;
                    let height = newItem.getSize(false).height;

                    let parentId = parent.props.id;
                    let newParentId = newParent.props.id;
                    item.props.undoredo.add((idMan) => {
                        idMan.getItem(itemId).onSelect(true);
                        this.setMouseOver(idMan.getItem(newParentId));
                        this.dropItem(idMan.getItem(itemId), idMan.getItem(parentId), idMan.getItem(newParentId),
                            (newItem) => {
                                setTimeout(() => {
                                    idMan.getItem(itemId).setPosition(false, lastRelativeX, lastRelativeY, undefined, undefined,
                                        width, height, newParentRect, true);
                                }, 0);
                            }, true);
                    }, (idMan) => {
                        idMan.getItem(itemId).onSelect(true);
                        this.setMouseOver(idMan.getItem(parentId));
                        this.dropItem(idMan.getItem(itemId), idMan.getItem(newParentId), idMan.getItem(parentId),
                            (newItem) => {
                                setTimeout(() => {
                                    idMan.getItem(itemId).setPosition(false, firstRelativeX, firstRelativeY, undefined, undefined,
                                        width, height, parentRect, true);
                                }, 0);
                            }, true);
                    }, undoPower);
                }
            });
        };
        if (item.props.dragdrop.mouseOver === newParent &&
            item.props.gridLine.hasGridLine(newParent.props.id)) {
            drop();
        } else {
            item.props.dragdrop.setMouseOver(newParent, undefined, drop);
        }
    };

    removeMouseOver = () => {
        delete this.mouseOver;
    };

    setMouseOver = (item, positionData, callback) => {
        if (this.isDraggingItemFixed())
            return;

        if (this.mouseOver) {
            if (!this.mouseOver.getFromTempData("selected")) {
                if (this.mouseOver !== item)
                    this.mouseOver.toggleGridLines(false);
            }
        }

        this.mouseOver = item;

        if(this.draggingItem)
            this.draggingItem.toggleHelpLines();

        item.toggleGridLines(true, () => {
            if(this.draggingItem)
                this.draggingItem.toggleHelpLines(item);
            if (callback)
                callback(this.draggingItem, this.mouseOver);
        }, "B");
    };

    setMouseOverForNonDragging = (item) => {
        this.mouseOverNonDragging = item;
    };

    getMouseOverForNonDragging = () => {
        return this.mouseOverNonDragging;
    };
}

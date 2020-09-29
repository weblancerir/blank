import {throttleDebounce} from "./AwesomeGridLayoutUtils";
import {
    createStack,
    getSectionId,
} from "./AwesomwGridLayoutHelper";
import ContainerBase from "./Components/Containers/ContainerBase";
import React from "react";
import './AwesomwGridLayoutHelper.css';
import throttle from "lodash.throttle";

export default class SelectManager {
    constructor(inputManager, groupSelectRef, pageAglRef, miniMenuHolderRef,
                inspectorRef, resizeRef, helpLinesRef, hoverRef) {
        this.inputManager = inputManager;
        this.groupSelectRef = groupSelectRef;
        this.pageAglRef = pageAglRef;
        this.miniMenuHolderRef = miniMenuHolderRef;
        this.inspectorRef = inspectorRef;
        this.resizeRef = resizeRef;
        this.helpLinesRef = helpLinesRef;
        this.hoverRef = hoverRef;
        window.addEventListener("keydown",(e) =>{
            e = e || window.event;
            let key = e.which || e.keyCode; // keyCode detection
            let ctrl = e.ctrlKey ? e.ctrlKey : (key === 17); // ctrl detection

            if ( key === 71 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + G");
                this.editGrid();
            }
            if ( key === 49 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + 1");
                this.test1();
            }
            if ( key === 50 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + 2");
                this.test2();
            }
            if ( key === 51 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + 3");
                this.test3();
            }
        });
    }

    setContext = (editorContext) => {
        this.context = editorContext;
    }

    getPageOverflowRef = () => {
        if (this.pageAglRef.current)
            return this.pageAglRef.current.overflowRef.current;
    };

    editGrid = (item) => {
        if (!this.getSelected()) {
            this.selectedItem = item;
        } else if (!item){
            item = this.getSelected();
        }

        if (!item)
            return;

        item.editGrid();
    };

    selectItem = (item, clicked, dontUpdateAdjustments) => {
        if (!this.getSelected()) {
            this.selectedItem = item;
        }

        if (this.inputManager.ctrl && clicked && getSectionId(this.selectedItem) === getSectionId(item)) {
            this.createGroup(item);
            return;
        } else if (this.inputManager.ctrl){
            // TODO can notify to user that can't select multiple item from different section
            this.clearGroup();
        } else {
            this.clearGroup();
        }

        if (this.selectedItem.props.id !== item.props.id){
            this.selectedItem.onSelect(false, undefined, true);
        }

        if (!dontUpdateAdjustments) {
            if (this.selectedItem.props.id !== item.props.id){
                this.updateMenu();
            }

            this.updateMiniMenu(item);
            this.setInspector(
                item.props.getInspector()
            );
            this.updateResizePanes(item, item.getSize(false));
        }

        this.selectedItem = item;
    };

    clearMiniMenu = () => {
        this.miniMenuHolderRef.current.clearMiniMenu();
    };

    onContextMenu = (e, item) => {
        this.miniMenuHolderRef.current.onContextMenu(e, item);
    };

    updateMiniMenu = (item) => {
        if(!item)
            item = this.getSelected();

        if (item && item.hasMiniMenu())
            this.miniMenuHolderRef.current.addMiniMenu(item);
        else
            this.clearMiniMenu();
    };

    updateMenu = (menu) => {
        this.miniMenuHolderRef.current.addMenu(menu);
    };

    setInspector = (inspectorMenu) => {
        this.inspectorRef.current.setMenu(inspectorMenu);
    };

    clearGroup = () => {
        if (!this.group)
            return;

        this.group.forEach(item => {
            item.setState({groupSelected: false,
                groupDragStart: undefined,
                groupDrag: undefined,
                groupDragStop: undefined,
            });
            item.onSelect(false, undefined, true);
        });

        this.group = undefined;

        this.updateGroupRect();
    };

    createGroup = (item) => {
        let selectedItem = this.selectedItem;
        this.selectedItem = undefined;

        if (!this.group) {
            this.group = [];
            selectedItem && this.group.push(selectedItem);
        }

        item && this.group.push(item);

        this.updateResizePanes();

        this.group.forEach(item => {
            item.setState({groupSelected: true,
                groupDragStart: this.groupDragStart,
                groupDrag: this.groupDrag,
                groupDragStop: this.groupDragStop,
            });
        });

        this.updateGroupRect();
        this.clearMiniMenu();
        this.updateMenu();
    };

    groupDragStart = (e, mainItem) => {
        this.group.forEach(item => {
            if (mainItem !== item)
                item.onDragStart(e, true);
        });
    };

    groupDrag = (e, mainItem) => {
        this.group.forEach(item => {
            if (mainItem !== item)
                item.onDrag(e, true);
        });

        this.updateGroupRect();
    };

    groupDragStop = (e, mainItem) => {
        this.group.forEach(item => {
            if (mainItem !== item)
                item.onDragStop(e, true);
        });

        this.updateGroupRect();
    };

    deleteGroup = () => {
        if (!this.group) {
            return;
        }

        this.group.forEach(item => {
            item.delete();
        });

        this.clearGroup();
    };

    updateGroupRect = () => {
        if (!this.group) {
            this.groupSelectRef.current.updateRect();
            return;
        }

        let firstRect = this.group[0].getSize(false, true);
        let top = firstRect.top;
        let left = firstRect.left;
        let bottom = window.innerHeight - firstRect.top - firstRect.height;
        let right =  window.innerWidth - firstRect.left - firstRect.width;

        this.group.slice(1, this.group.length).forEach(item => {
            let rect = item.getSize(false, true);
            top = Math.min(top, rect.top);
            left = Math.min(left, rect.left);
            bottom = Math.min(bottom, window.innerHeight - rect.top - rect.height);
            right = Math.min(right, window.innerWidth - rect.left - rect.width);
        });

        this.groupSelectRef.current.updateRect({
            top, left, bottom, right
        }, this.group);
    };

    getSelected = () => {
        return this.selectedItem;
    };

    updateParentsRect = throttleDebounce(() => {
        if (!this.getSelected() || !this.getSelected().mounted)
            return;

        let item = this.getSelected();

        if (item.props.parent)
            item.props.parent.prepareRects(true, true);
        if (item.state.helpLinesParent && item.state.helpLinesParent !== item.props.parent)
            item.state.helpLinesParent.prepareRects(true, true);
    }, 40);

    isEditor = () => {
        return !this.context.preview;
    }

    // change grid line positions and resize panes
    onScrollItem = throttleDebounce(() => {
        if (!this.isEditor())
            return;

        this.updateGroupRect();

        if (!this.getSelected() || !this.getSelected().mounted)
            return;

        let item = this.getSelected();

        if (item.props.parent)
            item.props.parent.prepareRects();
        if (item.state.helpLinesParent && item.state.helpLinesParent !== item.props.parent)
            item.state.helpLinesParent.prepareRects();

        let size = item.getSize(false, true);
        item.updateGridLines(
            size.top, size.left,
            window.innerHeight - size.top - size.height,
            window.innerWidth - size.left - size.width,
            "A"
        );
        item.updateGridEditor();
        this.updateMiniMenu();
        this.updateResizePanes(item, size);

        this.updateHelpSizeLines(item, item.state.helpLinesParent, size, item.state.dragging,
            item.getBoundarySize(true));
        this.updateHover(item, size);
    }, 50);

    // updateSize
    updateSize = throttleDebounce(() => {
        if (!this.getSelected() || !this.getSelected().mounted)
            return;

        let item = this.getSelected();

        let size = item.getSize(true, true);

        this.updateResizePanes(item, size);
    }, 100);

    updateResizePanes = (item, data) => {
        this.resizeRef.current.update(item, data, item && item.getTransformStyleId());
    };

    updateHelpLines = throttle((item, helpLineParent, itemRect, dragging) => {
        this.updateHelpSizeLines(item, helpLineParent, itemRect, dragging,
            item.getBoundarySize());
    }, 50);

    getRuntimeGridItemStyle = () => {
        if (this.helpLinesRef.current)
            return this.helpLinesRef.current.getRuntimeGridItemStyle();
    };

    updateHover = (item, size, clear) => {
        this.hoverRef.current.update(item, size, clear);
    };

    activateHover = (active) => {
        this.hoverRef.current.activate(active);
    };

    activateResize = (active) => {
        this.resizeRef.current.activate(active);
    };

    updateHelpSizeLines = (item, helpLineParent, itemRect, dragging, fakeItemRect) => {
        if (this.helpLinesRef.current)
            this.helpLinesRef.current.update(item, helpLineParent, itemRect, dragging, fakeItemRect);
    };

    test1 = () => {
        createStack(this.group);
    };

    test2 = () => {
        let item = this.getSelected();
        if (!item)
            return;

        let child =
            <ContainerBase
                style={{
                    width: "50%",
                    height: "auto",
                    minHeight: "75px"
                }}
                data={{
                    bpData: {
                        design:{
                            fillColor: `#5cff${Math.floor(Math.random() * 89) + 10  }`,
                        },
                    }
                }}
            />;

        item.addChild(child, undefined, undefined, undefined, (agl) => {
        }, undefined, true);
    };

    test3 = () => {
        let item = this.getSelected();
        if (!item)
            return;

        item.playAnimation();
    };
}

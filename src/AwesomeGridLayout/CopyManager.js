import {createItem} from "./AwesomwGridLayoutHelper";
import {cloneObject} from "./AwesomeGridLayoutUtils";
import throttle from "lodash.throttle";

export default class CopyManager {
    constructor(selectManager, pageRef, dragdrop) {
        this.selectManager = selectManager;
        this.pageRef = pageRef;
        this.dragdrop = dragdrop;

        window.addEventListener("keydown",(e) =>{
            e = e || window.event;
            let key = e.which || e.keyCode; // keyCode detection
            let ctrl = e.ctrlKey ? e.ctrlKey : (key === 17); // ctrl detection

            if ( key === 86 && ctrl ) {
                console.log("ctrl + V");
                this.paste();
            } else if ( key === 67 && ctrl ) {
                console.log("ctrl + C");
                this.copy();
            } else if ( key === 68 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + D");
                this.duplicate();
            } else if ( key === 46 ) {
                console.log("delete");
                this.delete();
            }

        });
    }

    copy = (item) => {
        if (!item)
            item = this.selectManager.getSelected();
        if (!item)
            return;

        this.copyItem = item;
    };

    getCopyItem = () => {
        return this.copyItem;
    };

    paste = throttle((selectedItem) => {
        if (!this.copyItem)
            return;
        let destinationItem;
        if (!selectedItem)
            selectedItem = this.selectManager.getSelected() || this.pageRef.current;

        while (!destinationItem)  {
            if (selectedItem.getFromTempData("isContainer")) {
                destinationItem = selectedItem;
            } else {
                selectedItem = selectedItem.props.parent;
            }
        }

        let style = cloneObject(this.getCopyItem().getFromData("style"));
        let gridItemStyle = cloneObject(this.getCopyItem().getFromData("gridItemStyle"));
        let copyRect = this.getCopyItem().getSize(false);
        let parentRect = destinationItem.getSize(false);
        if (destinationItem === this.getCopyItem().props.parent) {
            if (gridItemStyle.marginLeft)
                gridItemStyle.marginLeft =
                    (parseFloat(gridItemStyle.marginLeft.replace("px", "").replace("%", "")) + 20).toString()
                    + "px";
            if (gridItemStyle.marginLeft)
                gridItemStyle.marginTop =
                    (parseFloat(gridItemStyle.marginTop.replace("px", "").replace("%", "")) + 20).toString()
                    + "px";
            if (gridItemStyle.marginRight)
                gridItemStyle.marginRight =
                    (parseFloat(gridItemStyle.marginRight.replace("px", "").replace("%", "")) - 20).toString()
                    + "px";
            if (gridItemStyle.marginBottom)
                gridItemStyle.marginBottom =
                    (parseFloat(gridItemStyle.marginBottom.replace("px", "").replace("%", "")) - 20).toString()
                    + "px";

            if (!gridItemStyle.marginLeft && !gridItemStyle.marginRight)
                gridItemStyle.marginLeft = "20px";
            if (!gridItemStyle.marginTop && !gridItemStyle.marginBottom)
                gridItemStyle.marginTop = "20px";
        } else {
            delete gridItemStyle.marginLeft;
            delete gridItemStyle.marginTop;
            delete gridItemStyle.marginRight;
            delete gridItemStyle.marginBottom;

            gridItemStyle.justifySelf = "center";
            gridItemStyle.alignSelf = "center";

            if (style.width.toString().includes("%")) {
                style.width = (copyRect.width / parentRect.width * 100).toString() + "%";
            }
            if (style.height.toString().includes("%")) {
                style.height = (copyRect.height / parentRect.height * 100).toString() + "%";
            }
        }

        createItem(destinationItem, {
            props: this.getCopyItem().props,
            tagName: this.getCopyItem().props.tagName
        }, undefined, gridItemStyle, style);
    }, 200);

    duplicate = (item) => {
        if (!item)
            item = this.selectManager.getSelected();
        if (!item)
            return;

        this.copy(item);
        this.paste(item.props.parent);
        this.copyItem = false;
    };

    delete = (item) => {
        if (!item)
            item = this.selectManager.getSelected();
        if (!item && !this.selectManager.group)
            return;

        this.selectManager.deleteGroup();

        if (!item)
            return;

        item.delete();
    };
}

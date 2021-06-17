import React from "react";
import {EditorContext} from "../../Editor/EditorContext";
import './MenuTree.css';
import MenuTreeItem from "./MenuTreeItem";
import MenuTreeOrderer from "./MenuTreeOrderer";
import {
    changeMenuItemParent,
    deleteMenuItem,
    findParent,
    getIndexInParent, renameMenuItem,
    reorderMenuItem, toggleMenuItemAsParent
} from "../MenuManager";
import IconButton from "../../HelperComponents/IconButton";
import CreateMenu from "../CreateMenu";

export default class MenuTree extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {};
    }

    onDragStart = (e, mi) => {
        console.log("onDragStart", mi.name);
        this.draggingMenuItem = mi;
    }

    onDragOver = (e, mi) => {
        if (!this.draggingMenuItem)
            return;

        e.stopPropagation();
        e.preventDefault();

        if (mi !== this.draggingMenuItem) {
            console.log("onDragOver", mi.name);
        }
    }

    onDrop = (e, mi) => {
        if (!this.draggingMenuItem)
            return;

        let {menu} = this.props;
        e.target.click();

        if (mi !== this.draggingMenuItem) {
            console.log("onDrop", mi.name, this.draggingMenuItem);

            changeMenuItemParent(menu, this.draggingMenuItem, mi.id);
            this.forceUpdate();
        }
    }

    onOrderOver = (e, parentMI, order) => {
        if (!this.draggingMenuItem)
            return;

        console.log("onOrderOver", parentMI.id);
        e.stopPropagation();
        e.preventDefault();
    }

    onOrderDrop = (e, parentMI, order) => {
        if (!this.draggingMenuItem)
            return;

        let {menu} = this.props;

        console.log("onOrderDrop", parentMI.id);
        e.target.click();

        if (findParent(menu, this.draggingMenuItem.id) === parentMI) {
            // this is reOrdering
            if (getIndexInParent(menu, this.draggingMenuItem) < order) {
                order--;
            }

            reorderMenuItem(menu, this.draggingMenuItem, order);
            this.forceUpdate();
        } else {
            changeMenuItemParent(menu, this.draggingMenuItem, parentMI.id, order);
            this.forceUpdate();
        }
    }

    getTreeItemRenderer = (mi) => {
        let {menu} = this.props;

        return (
            <div
                className="MenuTreeItemRenderer"
            >
                <div className="MenuTreeItemLabel">
                    {mi.name}
                </div>

                {
                    menu.id !== "default" &&
                        <>
                            <IconButton
                                onClick={(e) => {
                                    deleteMenuItem(menu, mi.id);
                                    this.forceUpdate();
                                }}
                            >
                                <img
                                    draggable={false}
                                    width={12}
                                    height={12}
                                    src={require('../../icons/bin.svg')}
                                />
                            </IconButton>

                            <IconButton
                                onClick={(e) => {
                                    this.setState({renameMI: mi});
                                }}
                            >
                                <img
                                    draggable={false}
                                    width={12}
                                    height={12}
                                    src={require('../../icons/text.svg')}
                                />
                            </IconButton>

                            <IconButton
                                onClick={(e) => {
                                    console.log("showLinkGenerator", mi)
                                    this.context.showLinkGenerator(mi.linkData, (linkData) => {
                                        mi.linkData = linkData;
                                        this.forceUpdate();
                                    })
                                }}
                            >
                                <img
                                    draggable={false}
                                    width={12}
                                    height={12}
                                    src={require('../../icons/chain.svg')}
                                />
                            </IconButton>

                            <IconButton
                                onClick={(e) => {
                                    if (!mi.isParent){
                                        toggleMenuItemAsParent(mi, !mi.isParent);
                                        this.forceUpdate();
                                        return;
                                    }

                                    if (mi.isParent && mi.menuItems.length === 0)
                                        toggleMenuItemAsParent(mi, !mi.isParent);
                                    else {
                                        // TODO show error
                                        // it must have no child
                                    }
                                    this.forceUpdate();
                                }}
                            >
                                <img
                                    draggable={false}
                                    width={12}
                                    height={12}
                                    src={mi.isParent ? require('../../icons/parent.svg') : require('../../icons/notparent.svg')}
                                />
                            </IconButton>
                        </>
                }
            </div>
        )
    }

    render() {
        let {menu} = this.props;
        return (
            <div className="MenuTreeRoot">
                <MenuTreeOrderer
                    onDragOver={(e) => {
                        this.onOrderOver(e, menu, 0)
                    }}
                    onDrop={(e) => {
                        this.onOrderDrop(e, menu, 0)
                    }}
                />
                {
                    menu.menuItems &&
                    menu.menuItems.map((mi, index) => {
                        return (
                            <React.Fragment key={mi.id}>
                                <MenuTreeItem
                                    className="MenuManagerMenuItemItem"
                                    menuItem={mi}
                                    onDragStart={this.onDragStart}
                                    onDrop={this.onDrop}
                                    onDragOver={this.onDragOver}
                                    renderer={(menuItem) => {
                                        return this.getTreeItemRenderer(menuItem);
                                    }}
                                    onOrderOver={this.onOrderOver}
                                    onOrderDrop={this.onOrderDrop}
                                />
                                <MenuTreeOrderer
                                    onDragOver={(e) => {
                                        this.onOrderOver(e, menu, index + 1)
                                    }}
                                    onDrop={(e) => {
                                        this.onOrderDrop(e, menu, index + 1)
                                    }}
                                />
                            </React.Fragment>
                        )
                    })
                }
                {
                    this.state.renameMI &&
                    <CreateMenu
                        title={"New Menu Item Name"}
                        label={"What's the new name of menu item?"}
                        title={"Change"}
                        defaultValue={this.state.renameMI.name}
                        open={true}
                        onClose={() => {
                            this.setState({renameMI: undefined})
                        }}
                        onDone={(name) => {
                            renameMenuItem(this.state.renameMI, name);
                            this.setState({renameMI: undefined})
                        }}
                    />
                }
            </div>
        )
    }
}

import React from "react";
import './Menu.css';
import MiniMenu from "./MiniMenu/MiniMenu";
import {createContextMenu} from "../AwesomwGridLayoutHelper";
import GroupMiniMenu from "./MiniMenu/GroupMiniMenu";

const miniMenuHolderId = "wl_menu_holder";
export default class MenuHolder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: true
        };

        this.miniMenuRef = React.createRef();
        this.groupMenuRef = React.createRef();
    }

    clearMiniMenu = () => {
        this.state.active && this.miniMenuRef.current.clear();
        this.state.active && this.groupMenuRef.current.clear();
    };

    addMiniMenu = (item) => {
        if (item && this.state.active)
            this.miniMenuRef.current.update(
                item.props.id,
                item.getShortcutOptions() || [],
                item.getPrimaryOptions() || [],
                item
            );
        this.state.active && this.groupMenuRef.current.clear();
    };

    addGroupMenu = (group, shortcut, primary) => {
        if (group && this.state.active)
            this.groupMenuRef.current.update(
                group,
                shortcut || [],
                primary || []
            );
    };

    addMenu = (menu) => {
        this.setState({
            menu: undefined,
        });
        if (menu) {
            setTimeout(() => {
                this.setState({
                    menu,
                });
            }, 0);
        }
    };

    onContextMenu = (e, item) => {
        this.setState({
            contextMenu: createContextMenu(e, item, () => {
                this.setState({contextMenu: undefined})
            })
        });
    };

    activate = (active) => {
        this.setState({active});
    };

    isInMenu = () => {
        if (!this.state.active)
            return false;
        if (this.state.menu)
            return true;
        if (this.state.contextMenu)
            return true;

        return false;
    }

    render () {
        if (!this.state.active)
            return null;

        return (
            <div
                id={miniMenuHolderId}
                key={miniMenuHolderId}
                className="MenuHolderRoot"
            >
                <MiniMenu
                    itemId={this.state.miniMenuItem && this.state.miniMenuItem.props.id}
                    key={"miniMenu"}
                    ref={this.miniMenuRef}
                />
                <GroupMiniMenu
                    group={this.state.group}
                    key={"miniMenu2"}
                    ref={this.groupMenuRef}
                />
                {
                    !this.state.contextMenu &&
                    this.state.menu
                }
                {
                    this.state.contextMenu
                }
            </div>
        )
    }
}

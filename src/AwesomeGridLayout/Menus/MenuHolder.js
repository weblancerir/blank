import React from "react";
import './Menu.css';
import {createMiniMenu} from "./MenuHelper";

const miniMenuHolderId = "wl_menu_holder";
export default class MenuHolder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    clear = () => {
        this.setState({miniMenu: undefined});
    };

    addMiniMenu = (item) => {
        if (item && this.state.miniMenuItem && item.props.id !== this.state.miniMenuItem.props.id)
            this.clear();

        this.setState({
            miniMenu: createMiniMenu(item),
            miniMenuItem: item
        });
    };

    addMenu = (menu) => {
        this.setState({
            menu: undefined,
        });
        setTimeout(() => {
            this.setState({
                menu,
            });
        }, 0);
    };

    render () {
        return (
            <div
                id={miniMenuHolderId}
                key={miniMenuHolderId}
                className="MenuHolderRoot"
            >
                {
                    this.state.miniMenu
                }
                {
                    this.state.menu
                }
            </div>
        )
    }
}

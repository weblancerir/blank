import React from "react";
import {EditorContext} from "../Editor/EditorContext";
import IconButton from "../HelperComponents/IconButton";
import Modal from "@material-ui/core/Modal";
import './MenuManagerUI.css';
import {addNewMenu, addNewMenuItem, deleteMenu, renameMenuItem} from "./MenuManager";
import Button from "@material-ui/core/Button/Button";
import CreateMenu from "./CreateMenu";
import MenuTree from "./MenuTree/MenuTree";

export default class MenuManagerUI extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            selectedMenuId: props.menuId || "default",
        };
    }

    render() {
        let {selectedMenuId} = this.state;
        let {siteData} = this.context;
        let selectedMenu = siteData.menus.find(m => m.id === selectedMenuId);

        return <Modal
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="PageSettingModal"
            disableBackdropClick
        >
            <div className="MenuManagerRoot">
                {/*Header*/}
                <div className="PageSettingHeader">
                    <div
                        className="PageManagerHeaderContainer"
                    >
                            <span className="PageManagerHeaderTitle">
                                Menu Manager
                            </span>

                        <IconButton
                            onClick={this.props.onClose}
                        >
                            <img
                                draggable={false}
                                width={12}
                                height={12}
                                src={require('../icons/close.svg')}
                            />
                        </IconButton>
                    </div>
                </div>
                <div className="MenuManagerContentRoot">
                    <div className="MenuManagerContent">
                        <div className="MenuManagerLeft">
                            <div className="MenuManagerTypesTitle">
                                Website Menus
                            </div>
                            <div className="MenuManagerTypes">
                                {
                                    siteData.menus.map(menu => {
                                        let className = "MenuManagerMenuListItem";
                                        if (selectedMenuId === menu.id)
                                            className += " MenuManagerMenuListItemSelected";
                                        return (
                                            <div className={className}
                                                 key={menu.id}
                                                 onClick={(e) => {
                                                     this.setState({selectedMenuId: menu.id});
                                                 }}
                                            >
                                                <div>
                                                    {menu.name}
                                                </div>
                                                {
                                                    menu.id !== "default" &&
                                                    <IconButton
                                                        className={"MenuManagerDeleteMenu"}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            deleteMenu(siteData, menu.id);
                                                            if (menu.id === selectedMenuId)
                                                                this.setState({selectedMenuId: "default"});
                                                            this.forceUpdate();
                                                        }}
                                                    >
                                                        <img
                                                            draggable={false}
                                                            width={12}
                                                            height={12}
                                                            src={require('../icons/bin.svg')}
                                                        />
                                                    </IconButton>
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </div>

                            <Button
                                className="MenuManagerCreate"
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    this.setState({createMenu: true})
                                }}
                            >
                                Create Menu
                            </Button>
                        </div>
                        <div className="MenuManagerOptions">
                            <MenuTree
                                menu={selectedMenu}
                            />
                            <Button
                                className="MenuManagerCreate"
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    this.setState({createMenuItem: true})
                                }}
                            >
                                Create Menu Item
                            </Button>
                        </div>
                    </div>
                </div>
                {
                    this.state.createMenu &&
                    <CreateMenu
                        open={true}
                        onClose={() => {
                            this.setState({createMenu: undefined})
                        }}
                        onDone={(name) => {
                            addNewMenu(siteData, name);
                            this.forceUpdate();
                        }}
                    />
                }
                {
                    this.state.createMenuItem &&
                    <CreateMenu
                        title={"New Menu Item Name"}
                        label={"What's the new name of menu item?"}
                        title={"Change"}
                        open={true}
                        onClose={() => {
                            this.setState({createMenuItem: undefined})
                        }}
                        onDone={(name) => {
                            addNewMenuItem(selectedMenu, name);
                            this.setState({createMenuItem: undefined})
                        }}
                    />
                }
            </div>
        </Modal>
    }
}

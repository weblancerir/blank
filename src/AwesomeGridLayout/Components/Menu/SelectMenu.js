import React from "react";
import '../../HelperStyle.css';
import './HorizontalMenu.css';
import {EditorContext} from "../../Editor/EditorContext";
import IconButton from "../../HelperComponents/IconButton";
import Button from "@material-ui/core/Button/Button";
import Modal from "@material-ui/core/Modal";
import DropDown from "../../Menus/CommonComponents/DropDown";
import {getMenuById} from "../../MenuManager/MenuManager";

export default class SelectMenu extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
        };
    }

    render() {
        let {siteData} = this.context;
        let {menus} = siteData;
        return <Modal
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="FileManagerModal"
            disableBackdropClick
            disableEnforceFocus
        >
            <div className="CreateMenuRoot">
                {/*Header*/}
                <div className="FileManagerHeader">
                    <div
                        className="PageManagerHeaderContainer"
                    >
                            <span className="PageManagerHeaderTitle">
                                {this.props.title || "Select Menu"}
                            </span>

                        <IconButton
                            onClick={this.props.onClose}
                        >
                            <img
                                draggable={false}
                                width={12}
                                height={12}
                                src={require('../../icons/close.svg')}
                            />
                        </IconButton>
                    </div>
                </div>

                <div className="CreateMenuContainer">
                    <span className="CreateMenuTitle">
                        {this.props.label || "Which menu do you want to show?"}
                    </span>

                    <DropDown
                        rootStyle={{
                            paddingLeft: 4,
                            border: "1px solid rgb(198, 198, 198)",
                            height: 36,
                            borderRadius: 4,
                            marginTop: 8
                        }}
                        menuItemStyle={{
                            padding: 0
                        }}
                        options={menus}
                        onChange={(menuData) => {
                            this.setState({menuId: menuData.id});
                        }}
                        value={getMenuById(siteData,this.state.menuId || this.props.menuId || "default")}
                        spanStyle={{
                            width: 230,
                            fontSize: 14,
                            border: "0px solid #cfcfcf",
                        }}
                        renderer={(menuData) => {
                            return (
                                <div className="TextEditorThemeRendererRoot">
                                    <span>
                                        {menuData.name}
                                    </span>
                                </div>
                            )
                        }}
                        valueRenderer={(menuData) => {
                            return (
                                <span>
                                    {menuData.name}
                                </span>
                            )
                        }}
                    />

                    <div>
                        <Button
                            className="CreateMenuCreate"
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                this.props.onClose();
                                this.props.onDone(this.state.menuId || "default")
                            }}
                        >
                            {this.props.confirmLabel || "Confirm"}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    }
}

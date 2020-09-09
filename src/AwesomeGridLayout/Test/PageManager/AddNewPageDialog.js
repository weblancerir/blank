import React from "react";
import './PageManager.css';
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import AddNewPageDialogItem from "./AddNewPageDialogItem";

export default class AddNewPageDialog extends React.Component {
    addNormalPage = () => {
        this.props.onClose();
        this.props.onAddNormalPage();
    };

    addDynamicPage = () => {
        this.props.onClose();
        this.props.onAddDynamicPage();
    };

    render () {
        return (
            <Menu
                style={{
                    zIndex: 99999999999,
                }}
                anchorEl={this.props.anchorEl}
                open={this.props.open}
                onClose={(e) => {
                    this.props.onClose();
                }}
                MenuListProps={{
                    style: {
                        padding: 0,
                    }
                }}
            >
                <MenuItem dense onClick={(e) => {
                    this.addNormalPage();
                }}
                >
                    <AddNewPageDialogItem
                        title={"Page"}
                        description={"Add a standard blank page"}
                    />
                </MenuItem>
                <MenuItem dense onClick={(e) => {
                    this.addDynamicPage();
                }}>
                    <AddNewPageDialogItem
                        title={"Dynamic Page"}
                        description={"Design once and generate a lot of different page"}
                    />
                </MenuItem>
            </Menu>
        )
    }
}

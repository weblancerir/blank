import React from "react";
import '../../HelperStyle.css';
import './HorizontalMenu.css';
import {EditorContext} from "../../Editor/EditorContext";
import MenuItem from '@material-ui/core/MenuItem';
import FreeDropDownMenu from "./FreeDropDownMenu";
import LinkedTag from "../Text/Menus/components/LinkedTag";

export default class HorizontalMenuItem extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            state: "normal",
            dropDown: false
        };
    }

    componentDidMount() {
    }

    onMouseOver = (e) => {
        if (this.context.isEditor())
            return;

        let dropDownState = {};
        if (this.props.dropDownOnHover) dropDownState.dropDown = true;

        this.setState({state: "hover", ...dropDownState, dropDownAnchor: e.currentTarget});
    };

    onMouseLeave = (e) => {
        if (this.context.isEditor())
            return;

        let dropDownState = {};
        if (this.props.dropDownOnHover) dropDownState.dropDown = false;

        this.setState({state: "normal", ...dropDownState});
    };

    onClick = (e) => {
        let {menuItem} = this.props;

        if (!this.props.dropDownOnHover) {
            this.setState({dropDown: !this.state.dropDown, dropDownAnchor: e.currentTarget})
        }
    }

    onDropDownClose = () => {
        if (!this.props.dropDownOnHover) {
            this.setState({dropDown: false})
        }
    }

    getMenuItemStyle = () => {
        let {menuItem} = this.props;
        let state = this.props.state || this.state.state;

        if (!this.props.state &&
            menuItem.linkData && menuItem.linkData.type === "Page" &&
            menuItem.linkData.data.pageId === this.context.pageData.props.pageId
        ) {
            state = "select";
        }

        return this.props.getMenuItemStyle(state);
    }

    render() {
        let {menuItem} = this.props;
        let state = this.props.state || this.state.state;
        return (
            <MenuItem
                onClick={this.onClick}
                onMouseOver={this.onMouseOver}
                onMouseLeave={this.onMouseLeave}
                {...{id: this.props.moreId || undefined}}
                className={this.props.className}
                style={this.getMenuItemStyle()}
            >
                <LinkedTag
                    linkData={menuItem.linkData}
                    style={{
                        width: "unset",
                        height: "unset"
                    }}
                >
                    {menuItem.name}
                </LinkedTag>
                {
                    menuItem.menuItems && menuItem.menuItems.length > 0 && this.state.dropDown &&
                    <FreeDropDownMenu
                        className={this.props.dropDownClassName}
                        style={this.props.dropDownStyle}
                        open={true}
                        anchorEl={this.state.dropDownAnchor}
                        onClose={this.onDropDownClose}
                    >
                        {
                            menuItem.menuItems.map(mi => {
                                return (
                                    <HorizontalMenuItem
                                        key={mi.id}
                                        className={this.props.dropDownItemClassName}
                                        dropDownClassName={this.props.dropDownClassName}
                                        dropDownStyle={this.props.dropDownStyle}
                                        getMenuItemStyle={this.props.getDropDownItemStyle}
                                        dropDownItemClassName={this.props.dropDownItemClassName}
                                        getDropDownItemStyle={this.props.getDropDownItemStyle}
                                        state={this.props.state}
                                        menuItem={mi}
                                        dropDownOnHover={this.props.dropDownOnHover}
                                    />
                                )
                            })
                        }
                    </FreeDropDownMenu>
                }
            </MenuItem>
        )
    }
}

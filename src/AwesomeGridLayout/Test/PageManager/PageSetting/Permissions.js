import React from "react";
import './PageSetting.css';
import '../PageManager.css';
import Image from "../../../Menus/CommonComponents/Image";
import GridViewer from "../../../Menus/CommonComponents/GridViewer";
import RadioGroup from "@material-ui/core/RadioGroup/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import AglRadio from "../../../Menus/CommonComponents/AglRadio";
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import {EditorContext} from "../../../Editor/EditorContext";
import {inputCopyPasteHandler} from "../../../AwesomwGridLayoutHelper";

export default class Permissions extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
        }
    }

    changePermission = (type) => (e) => {
        let {pageData} = this.props;
        pageData.props.pageSetting.permissions.type = type;

        this.context.update();
    };

    onSetPassword = (e) => {
        let {pageData} = this.props;
        pageData.props.pageSetting.permissions.password = e.target.value;

        this.context.update();
    };

    onChangeMemberType = (e) => {
        let {pageData} = this.props;
        pageData.props.pageSetting.permissions.memberType = e.target.value;

        this.context.update();
    };

    onRoleChange = (checked, role) => {
        let {pageData} = this.props;
        if (checked) {
            if (pageData.props.pageSetting.permissions.memberRoles.findIndex(r => r === role) < 0)
                pageData.props.pageSetting.permissions.memberRoles.push(role);
        } else {
            if (pageData.props.pageSetting.permissions.memberRoles.findIndex(r => r === role) >= 0) {
                let index = pageData.props.pageSetting.permissions.memberRoles.findIndex(r => r === role);
                pageData.props.pageSetting.permissions.memberRoles.splice(index, 1);
            }
        }

        this.context.update();
    };

    render () {
        let {pageData} = this.props;
        let siteData = this.context.siteData;
        return (
            <div className="PageSettingTabPanelRoot">
                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        Who can view this page?
                    </span>

                    <GridViewer>
                        <div className={`PermissionsItem ${
                            pageData.props.pageSetting.permissions.type === "Everyone" ?
                                "PermissionsItemSelected": ""}`}
                             onClick={this.changePermission("Everyone")}
                        >
                            <Image
                                className="PermissionsItemImage"
                                draggable={false}
                                width={92}
                                height={92}
                                src={process.env.PUBLIC_URL + '/static/icon/world.svg'}
                            />

                            <span className="PermissionsItemTitle">
                                Everyone
                            </span>
                        </div>
                        <div className={`PermissionsItem ${
                            pageData.props.pageSetting.permissions.type === "Password Holder" ?
                                "PermissionsItemSelected": ""}`}
                             onClick={this.changePermission("Password Holder")}
                        >
                            <Image
                                className="PermissionsItemImage"
                                draggable={false}
                                width={92}
                                height={92}
                                src={process.env.PUBLIC_URL + '/static/icon/password.svg'}
                            />

                            <span className="PermissionsItemTitle">
                                Password Holder
                            </span>
                        </div>
                        <div className={`PermissionsItem ${
                            pageData.props.pageSetting.permissions.type === "Member Only" ?
                                "PermissionsItemSelected": ""}`}
                             onClick={this.changePermission("Member Only")}
                        >
                            <Image
                                className="PermissionsItemImage"
                                draggable={false}
                                width={92}
                                height={92}
                                src={process.env.PUBLIC_URL + '/static/icon/group.svg'}
                            />

                            <span className="PermissionsItemTitle">
                                Member Only
                            </span>
                        </div>
                    </GridViewer>

                    <span className="PermissionsDescription">
                        {
                            pageData.props.pageSetting.permissions.type === "Everyone" &&
                            "Everyone can see this page"
                        }
                        {
                            pageData.props.pageSetting.permissions.type === "Password Holder" &&
                            "Visitors with a password can see this page"
                        }
                        {
                            pageData.props.pageSetting.permissions.type === "Member Only" &&
                            "Visitors need to sign up to see this page"
                        }
                    </span>
                </div>

                {
                    pageData.props.pageSetting.permissions.type === "Password Holder" &&
                    <div className="PageInfoBox">
                        <span className="PageInfoBoxTitle">
                            What's the page's password?
                        </span>

                        <input
                            defaultValue={pageData.props.pageSetting.permissions.password}
                            className="NumberInput PageManagerRenameInput PageInfoNameInput"
                            type="text"
                            onChange={this.onSetPassword}
                            onKeyDown={inputCopyPasteHandler}
                        >
                        </input>
                    </div>
                }

                {
                    pageData.props.pageSetting.permissions.type === "Member Only" &&
                    <div className="PageInfoBox">
                        <span className="PageInfoBoxTitle">
                            Which member can access this page?
                        </span>

                        <RadioGroup className="PermissionsRadioGroup"
                                    value={pageData.props.pageSetting.permissions.memberType}
                                    onChange={this.onChangeMemberType}
                        >
                            <FormControlLabel
                                value="all" control={<AglRadio color='default' />}
                                label={<span className="PermissionsFormLabel">
                                    All members
                                </span>}
                            />
                            <FormControlLabel
                                className="PermissionsFormLabel"
                                value="role" control={<AglRadio color='default' />}
                                label={<span className="PermissionsFormLabel">
                                    Members with some role
                                </span>}
                            />
                            <FormControlLabel
                                disabled
                                className="PermissionsFormLabel"
                                value="pay" control={<AglRadio color='default' />}
                                label={<span className="PermissionsFormLabel">
                                    Paying customers
                                </span>}
                            />
                        </RadioGroup>

                        {
                            pageData.props.pageSetting.permissions.memberType === "role" &&
                            <div className="PageInfoBox">
                                <span className="PageInfoBoxTitle">
                                    Select from your member roles
                                </span>

                                <div className="PermissionsRolesInput NumberInput PageManagerRenameInput"
                                    onClick={(e) => {
                                        this.setState({roleAnchor: e.target})
                                    }}
                                >
                                    {
                                        pageData.props.pageSetting.permissions.memberRoles.map(role => {
                                            return role;
                                        }).join(" ")
                                    }
                                </div>
                            </div>
                        }

                        {
                            this.state.roleAnchor &&
                            <Menu
                                style={{
                                    zIndex: 99999999999,
                                }}
                                anchorEl={this.state.roleAnchor}
                                open={this.state.roleAnchor !== undefined}
                                onClose={(e) => {
                                    this.setState({roleAnchor: undefined})
                                }}
                                MenuListProps={{
                                    style: {
                                        padding: 0,
                                    }
                                }}
                            >
                                <MenuItem dense disabled style={{
                                    opacity: 1
                                }}>
                                    <span className="PermissionsSelectRole">
                                        Select roles
                                    </span>
                                </MenuItem>

                                {
                                    siteData.allApps.member.setting.roles.map(role => {
                                        return (
                                            <MenuItem dense onClick={(e) => {
                                                this.onRoleChange(!(pageData.props.pageSetting.permissions.memberRoles
                                                    .findIndex(r => r === role) > -1), role);
                                            }}
                                                      key={role}
                                                      style={{
                                                          paddingTop: 0,
                                                          paddingBottom: 0
                                                      }}
                                            >
                                                <Checkbox
                                                    size={'small'}
                                                    checked={
                                                        pageData.props.pageSetting.permissions.memberRoles
                                                            .findIndex(r => r === role) > -1
                                                    }
                                                    onChange={(e) => {
                                                        this.onRoleChange(e.target.checked, role);
                                                    }}
                                                    color="default"
                                                />
                                                <span className="PermissionsRole">
                                                    {role}
                                                </span>
                                            </MenuItem>
                                        )
                                    })
                                }

                                <MenuItem dense onClick={(e) => {
                                    // TODO connect to member manager
                                }}
                                >
                                    <span className="PermissionsNewRole">
                                        Add New Role
                                    </span>
                                </MenuItem>
                            </Menu>
                        }

                        {
                            pageData.props.pageSetting.permissions.memberType === "pay" &&
                            <div className="PageInfoBox">
                                <span className="PageInfoBoxTitle">
                                    Coming soon
                                </span>

                            </div>
                        }
                    </div>
                }
            </div>
        )
    }
}

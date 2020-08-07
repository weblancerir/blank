import React from "react";
import './PageManager.css';
import IconButton from "../../HelperComponents/IconButton";
import Image from "../../Menus/CommonComponents/Image";
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import classNames from "classnames";
import {cloneObject} from "../../AwesomeGridLayoutUtils";
import PageSetting from "./PageSetting/PageSetting";
import {v4 as uuidv4} from "uuid";

export default class PageItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pageMenuAnchorEl: undefined
        };

        this.renameInput = React.createRef();
    }

    duplicate = () => {
        // TODO ask verify
        let {pageData, editor} = this.props;

        let newName = `${pageData.props.pageName}(Copy)`;
        let newId = uuidv4();

        editor.state.siteData.allPages[newId] = cloneObject(pageData);
        editor.state.siteData.allPages[newId].props.pageName = newName;
        editor.state.siteData.allPages[newId].props.pageId = newId;
        delete editor.state.siteData.allPages[newId].props.isHome;

        this.setState({pageMenuAnchorEl: undefined});
        editor.setState({reload: true});
    };

    delete = () => {
        // TODO ask verify
        let {pageData, editor} = this.props;

        delete editor.state.siteData.allPages[pageData.props.pageId];

        this.setState({pageMenuAnchorEl: undefined});
        editor.onPageChange(Object.keys(editor.state.siteData.allPages)[0], true);
    };

    setAsHome = () => {
        let {pageData, editor} = this.props;
        let home = Object.values(editor.state.siteData.allPages).find(p => {return p.props.isHome});

        if (home)
            delete home.props.isHome;
        pageData.props.isHome = true;

        this.setState({pageMenuAnchorEl: undefined});
        editor.setState({reload: true});
    };

    setting = (active) => {
        this.setState({setting: active, pageMenuAnchorEl: undefined});
    };

    rename = (active) => {
        this.setState({rename: active, pageMenuAnchorEl: undefined}, () => {
            if (active)
                this.renameInput.current.focus();
        });

        if (!active) {
            let {pageData, editor} = this.props;

            if (this.newPageName === pageData.props.pageName)
                return;

            if (!this.newPageName) {
                // TODO show error
                return;
            }

            pageData.props.pageName = this.newPageName;
            this.newPageName = undefined;

            editor.setState({reload: true});
            // if (editor.state.pageData === pageData)
            //     editor.onPageChange(pageData.props.pageName, true);
        }
    };

    onRename = (e) => {
        this.newPageName = e.target.value;
    };

    render () {
        let {pageData, onClick, editor, siteData} = this.props;
        let boxClasses = classNames(
            "PageManagerNormalPageBox",
            editor.state.pageData === pageData && "PageManagerNormalPageBoxSelected"
        );
        return (
            <div className={boxClasses} key={pageData.props.pageId}
            >
                {
                    !this.state.rename &&
                    <span className="PageManagerNormalPageTitle">
                        {pageData.props.pageName}
                    </span>
                }

                <div className="PageManagerNormalPageClick" onClick={onClick}>

                </div>

                {
                    this.state.rename &&
                    <input
                        ref={this.renameInput}
                        defaultValue={pageData.props.pageName}
                        className="NumberInput PageManagerRenameInput"
                        type="text"
                        onChange={this.onRename}
                        onBlur={(e) => this.rename(false)}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.rename(false)
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            // TODO
                        }}
                    >
                    </input>
                }

                {
                    pageData.props.isHome &&
                    <IconButton
                        className="PageManagerNormalSiteButton"
                        onClick={(e) => {
                            // TODO
                        }}
                        disabled
                    >
                        <Image
                            src={'static/icon/home.svg'}
                            width={16}
                            height={16}
                        />
                    </IconButton>
                }

                <IconButton
                    className="PageManagerNormalSiteButton"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.setState({pageMenuAnchorEl: e.target})
                    }}
                >
                    <Image
                        src={'static/icon/more-black.svg'}
                        width={16}
                        height={16}
                    />
                </IconButton>

                {
                    this.state.pageMenuAnchorEl &&
                    <Menu
                        style={{
                            zIndex: 99999999999
                        }}
                        anchorEl={this.state.pageMenuAnchorEl}
                        open={this.state.pageMenuAnchorEl !== undefined}
                        onClose={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.setState({pageMenuAnchorEl: undefined});
                        }}
                        MenuListProps={{
                            style: {
                                padding: 0,
                            }
                        }}
                    >
                        <MenuItem dense onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.setting(true);
                        }}
                        >
                            Setting
                        </MenuItem>
                        <MenuItem dense onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.rename(true)
                        }}>
                            Rename
                        </MenuItem>
                        <MenuItem dense onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.duplicate(true)
                        }}
                        >
                            Duplicate
                        </MenuItem>
                        {
                            !pageData.props.isHome &&
                            <MenuItem dense onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                this.delete()
                            }}
                            >
                                Delete
                            </MenuItem>
                        }
                        {
                            !pageData.props.isHome && !pageData.props.isDynamic &&
                            <MenuItem dense onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                this.setAsHome()
                            }}
                            >
                                Set as Home Page
                            </MenuItem>
                        }
                        <MenuItem dense onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.setState({pageMenuAnchorEl: undefined});
                            onClick();
                        }} >
                            Edit Page
                        </MenuItem>
                    </Menu>
                }

                {
                    this.state.setting &&
                    <PageSetting
                        open={this.state.setting !== undefined}
                        onClose={() => this.setState({setting: undefined})}
                        pageData={pageData}
                        editor={editor}
                    />
                }
            </div>
        )
    }
}

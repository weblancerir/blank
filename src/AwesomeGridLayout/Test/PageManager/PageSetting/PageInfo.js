import React from "react";
import './PageSetting.css';
import '../PageManager.css';
import Image from "../../../Menus/CommonComponents/Image";
import Button from "@material-ui/core/Button/Button";
import {EditorContext} from "../../../Editor/EditorContext";
import {resolveDefaultMenu} from "../../../MenuManager/MenuManager";

export default class PageInfo extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
        }
    }

    onRename = (e) => {
        this.newPageName = e.target.value;
    };

    rename = () => {
        let {pageData} = this.props;

        if (this.newPageName === pageData.props.pageName)
            return;

        if (!this.newPageName) {
            // TODO show error
            return;
        }

        pageData.props.pageName = this.newPageName;
        this.newPageName = undefined;

        this.context.update();

        resolveDefaultMenu(this.context.siteData);
    };

    setAsHomePage = () => {
        let {pageData} = this.props;
        let siteData = this.context.siteData;

        let home = Object.values(siteData.allPages).find(p => {return p.props.isHome});

        if (home)
            delete home.props.isHome;
        pageData.props.isHome = true;

        this.context.update();
    };

    render () {
        let {pageData} = this.props;
        return (
            <div className="PageSettingTabPanelRoot">
                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        What's this page's name (on your menu)?
                    </span>
                    <input
                        defaultValue={pageData.props.pageName}
                        className="NumberInput PageManagerRenameInput PageInfoNameInput"
                        type="text"
                        onChange={this.onRename}
                        onBlur={this.rename}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.rename()
                            }
                        }}
                    >
                    </input>
                </div>

                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        <Image
                            draggable={false}
                            width={16}
                            height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/home.svg'}
                            style={{
                                marginTop: 2,
                                marginRight: 12
                            }}
                        />
                        {
                            pageData.props.isHome &&
                            "This page is your home page"
                        }
                        {
                            !pageData.props.isHome &&
                            "Set this page as your home page"
                        }
                        {
                            !pageData.props.isHome &&
                            <Button className="PageInfoHomePageButton" variant="contained"
                                onClick={this.setAsHomePage}
                            >
                                Set as Home Page
                            </Button>
                        }
                    </span>
                </div>
            </div>
        )
    }
}

import React from "react";
import './PageSetting.css';
import '../PageManager.css';
import Image from "../../../Menus/CommonComponents/Image";
import Switch from "@material-ui/core/Switch/Switch";
import Button from "@material-ui/core/Button/Button";

export default class PageInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    onRename = (e) => {
        this.newPageName = e.target.value;
    };

    rename = () => {
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
    };

    setAsHomePage = () => {
        let {pageData, editor} = this.props;

        let home = Object.values(editor.state.siteData.allPages).find(p => {return p.props.isHome});

        if (home)
            delete home.props.isHome;
        pageData.props.isHome = true;

        editor.setState({reload: true});
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
                            src={'/static/icon/home.svg'}
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

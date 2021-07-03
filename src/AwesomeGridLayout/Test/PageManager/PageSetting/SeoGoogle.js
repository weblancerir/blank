import React from "react";
import './PageSetting.css';
import '../PageManager.css';
import Switch from "@material-ui/core/Switch/Switch";
import {EditorContext} from "../../../Editor/EditorContext";

export default class SeoGoogle extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
        }
    }

    onChangeSeoSetting = (param) => (e, value) => {
        let {pageData} = this.props;

        value = value || e.target.value;
        if (param === "endUrl") {
            if (!this.newEndUrl)
                return;

            value = this.newEndUrl.replace(/\s+/g, '').toLowerCase();
            let siteData = this.context.siteData;
            let same = Object.values(siteData.allPages).find(p => p.props.pageSetting.seoGoogle.endUrl === value);
            if (same) {
                this.setState({endUrlError: true});
                delete this.newEndUrl;
                return;
            }

            delete this.newEndUrl;
        }

        pageData.props.pageSetting.seoGoogle[param] = value;

        this.context.update();
    };

    render () {
        let {pageData} = this.props;
        let siteData = this.context.siteData;
        return (
            <div className="PageSettingTabPanelRoot">
                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        Preview on Google search
                    </span>

                    <div className="SeoGooglePreviewRoot">
                        <span className="SeoGooglePreviewTitle">
                            {
                                pageData.props.pageSetting.seoGoogle.pageTitle ||
                                    pageData.props.pageName
                            }
                        </span>
                        <span className="SeoGooglePreviewUrl">
                            {
                                siteData.setting.baseUrl + (
                                    pageData.props.pageSetting.seoGoogle.endUrl ||
                                    pageData.props.pageName.toLowerCase()
                                )
                            }
                        </span>
                        <span className="SeoGooglePreviewDesc">
                            {
                                pageData.props.pageSetting.seoGoogle.pageDescription
                            }
                        </span>
                    </div>
                </div>

                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        What's the lat part (or slug) of url?
                    </span>

                    <input
                        defaultValue={pageData.props.pageSetting.seoGoogle.endUrl || pageData.props.pageName.toLowerCase()}
                        className={`PageSettingInput PageManagerRenameInput PageInfoNameInput ${
                            this.state.endUrlError? 'PageInfoNameInputError': ""
                        }`}
                        type="text"
                        onChange={(e) => {
                            this.newEndUrl = e.target.value;
                            this.setState({endUrlError: undefined});
                        }}
                        onBlur={this.onChangeSeoSetting("endUrl")}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.onChangeSeoSetting("endUrl")(e);
                            }
                        }}
                    >
                    </input>
                </div>

                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        What's the page's title on search results and browser tabs?
                    </span>

                    <input
                        defaultValue={pageData.props.pageSetting.seoGoogle.pageTitle || pageData.props.pageName}
                        className="PageSettingInput PageManagerRenameInput PageInfoNameInput"
                        type="text"
                        onChange={(e) => {
                            this.newPageTitle = e.target.value;
                        }}
                        onBlur={(e) => {
                            this.onChangeSeoSetting("pageTitle")(e, this.newPageTitle);
                        }}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.onChangeSeoSetting("pageTitle")(e, this.newPageTitle);
                            }
                        }}
                    >
                    </input>
                </div>

                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        What's the page about? Add a description
                    </span>

                    <textarea
                        defaultValue={pageData.props.pageSetting.seoGoogle.pageDescription}
                        className="PageSettingInput PageManagerRenameInput PageInfoNameInput"
                        style={{
                            resize: "none",
                            minHeight: 120
                        }}
                        onChange={(e) => {
                            this.newPageDescription = e.target.value;
                        }}
                        onBlur={(e) => {
                            this.onChangeSeoSetting("pageDescription")(e, this.newPageDescription);
                        }}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.onChangeSeoSetting("pageDescription")(e, this.newPageDescription);
                            }
                        }}
                        rows={5}
                    >
                    </textarea>
                </div>

                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        Show this page in search results
                    </span>

                    <Switch
                        className="SeoGoogleShowInSearch"
                        checked={
                            pageData.props.pageSetting.permissions.type === "Everyone" ?
                            pageData.props.pageSetting.seoGoogle.showInSearch: false
                        }
                        disabled={pageData.props.pageSetting.permissions.type !== "Everyone"}
                        onChange={(e) => {
                            let checked = e.target.checked;
                            this.onChangeSeoSetting('showInSearch')(e, checked);
                        }}
                    />
                </div>

                {
                    pageData.props.pageSetting.permissions.type !== "Everyone" &&
                    <div className="PageInfoBox">
                        <span className="PageInfoBoxTitle">
                            Note: You’ve made changes to who can view this page, so it won’t show in search results. Go to the Permissions tab to change this.
                        </span>
                    </div>
                }
            </div>
        )
    }
}

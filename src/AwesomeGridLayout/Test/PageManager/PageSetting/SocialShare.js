import React from "react";
import './PageSetting.css';
import '../PageManager.css';
import Image from "../../../Menus/CommonComponents/Image";
import Button from "@material-ui/core/Button/Button";

export default class SocialShare extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    onChangeSocialShareSetting = (param) => (e, value) => {
        let {pageData, editor} = this.props;

        value = value || e.target.value;
        pageData.props.pageSetting.socialShare[param] = value;

        editor.setState({reload: true});
    };

    render () {
        let {pageData, editor} = this.props;
        let siteData = editor.state.siteData;
        return (
            <div className="PageSettingTabPanelRoot">
                <div className="PageInfoBox">
                    <div className="SocialShareTitle">
                        What is Social Share
                    </div>
                    <span className="PageInfoBoxTitle">
                        Add the text and image that display when this page is shared on social networks like Facebook, Instagram and more.
                    </span>
                </div>
                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        Preview on social
                    </span>

                    <div className="SocialPreviewBox">
                        <div className="SocialPreviewRoot">
                            <span className="SocialPreviewImageNoImage">
                                {
                                    pageData.props.pageSetting.socialShare.imageUrl &&
                                    <Image
                                        className="SocialPreviewImage"
                                        src={pageData.props.pageSetting.socialShare.imageUrl}
                                    />
                                }

                                <Button
                                    className="SocialPreviewImageSelect"
                                >
                                    Upload or Select an Image
                                </Button>
                            </span>
                            <div className="SocialPreviewDetailBox">
                                <span className="SocialPreviewUrl">
                                    {
                                        siteData.setting.baseUrl.substring(0, siteData.setting.baseUrl.lastIndexOf('/'))
                                            .replace(/(^\w+:|^)\/\//, '')

                                    }
                                </span>
                                <span className="SocialPreviewTitle">
                                    {
                                        pageData.props.pageSetting.socialShare.title ||
                                        pageData.props.pageSetting.seoGoogle.pageTitle
                                    }
                                </span>
                                <span className="SocialPreviewDescription">
                                    {
                                        pageData.props.pageSetting.socialShare.description ||
                                        pageData.props.pageSetting.seoGoogle.pageDescription
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="PageInfoBox">
                    <span className="PageInfoBoxTitle">
                        What's the page's title on social networks?
                    </span>

                    <input
                        defaultValue={pageData.props.pageSetting.socialShare.title ||
                            pageData.props.pageSetting.seoGoogle.pageTitle || pageData.props.pageName}
                        className="PageSettingInput PageManagerRenameInput PageInfoNameInput"
                        type="text"
                        onChange={(e) => {
                            this.newTitle = e.target.value;
                        }}
                        onBlur={(e) => {
                            this.onChangeSocialShareSetting("title")(e, this.newTitle);
                        }}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.onChangeSocialShareSetting("title")(e, this.newTitle);
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
                        defaultValue={pageData.props.pageSetting.socialShare.description ||
                            pageData.props.pageSetting.seoGoogle.pageDescription}
                        className="PageSettingInput PageManagerRenameInput PageInfoNameInput"
                        style={{
                            resize: "none",
                            minHeight: 120
                        }}
                        onChange={(e) => {
                            this.newDescription = e.target.value;
                        }}
                        onBlur={(e) => {
                            this.onChangeSocialShareSetting("description")(e, this.newDescription);
                        }}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.onChangeSocialShareSetting("description")(e, this.newDescription);
                            }
                        }}
                        rows={5}
                    >
                    </textarea>
                </div>
            </div>
        )
    }
}

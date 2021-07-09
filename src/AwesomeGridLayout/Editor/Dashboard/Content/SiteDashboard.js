import React from "react";
import {EditorContext} from "../../EditorContext";
import './SiteDashboard.css';
import Button from "@material-ui/core/Button/Button";
import FreeDropDownMenu from "../../../Components/Menu/FreeDropDownMenu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

export default class SiteDashboard extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getUrl = () => {
        let {user, website, siteData} = this.context;

        if (!website.metadata.isPublished)
            return "Not Published";

        if (website.url)
            return website.url;

        if (website.data && website.data.domainConfig && website.data.domainConfig.tempDomain) {
            return website.data.domainConfig.tempDomain.targetUrl;
        }

        let baseUrl = siteData.setting.baseUrl.replace("http:", "https:");
        let url = new URL(baseUrl);
        url.hostname = `${user.username}.${url.hostname}`;
        url.pathname = website.name;

        return url.href.toLowerCase();
    }

    onEditWebsiteClicked = () => {
        this.context.postMessageToHolder(
            {
                type: "Holder",
                func: "setDashboard",
                inputs: [false]
            }
        );
    }

    getDomainText = () => {
        // TODO
        return "Not Connected";
    }

    getPlanText = () => {
        // TODO
        return "Free";
    }

    getResourcePlanText = () => {
        // TODO
        return "Basic";
    }

    render() {
        let {siteData, website} = this.context;
        let {actionAnchorEl} = this.state;
        let {setSelectedMenu} = this.props;
        let isPublished = website.metadata.isPublished;
        return (
            <div className="SiteDashboardRoot">
                <div className="SiteDashboardMainRoot">
                    <div className="SiteDashboardMainTop">
                        <div className="SiteDashboardMainTopImageRoot">
                            {
                                isPublished &&
                                    <iframe
                                        className="SiteDashboardMainTopImageIframe"
                                        src={this.getUrl()}
                                    />
                            }
                            {
                                !isPublished &&
                                <img draggable={false} className="SiteDashboardMainTopImage"
                                     src={process.env.PUBLIC_URL + '/static/image/tempwebsite.jpg'} />
                            }
                        </div>
                        <div className="SiteDashboardMainTopRight">
                            <div className="SiteDashboardMainTopTitle">
                                {website.name}
                            </div>
                            <a
                                className="SiteDashboardMainTopLink"
                                href={isPublished && this.getUrl()}
                                target={isPublished && "_blank"}
                            >
                                {this.getUrl()}
                            </a>
                            <div className="SiteDashboardMainTopDesc">
                                {website.description}
                            </div>
                            <div className="SiteDashboardMainTopActions">
                                <Button
                                    className="SiteDashboardMainTopActionsButton"
                                    color="primary"
                                    variant="contained"
                                    onClick={(e) => {this.setState({actionAnchorEl: e.target})}}
                                >
                                    Website Actions
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="SiteDashboardMainBottom">
                        <div className="SiteDashboardMainBottomShortcutRoot">
                            <div className="SiteDashboardShortcutTitle">
                                Domain: {this.getDomainText()}
                            </div>
                            {/* TODO set link*/}
                            <a
                                className="SiteDashboardShortcutLink"
                                onClick={() => {
                                    setSelectedMenu("Domains");
                                }}
                            >
                                Connect Domain
                            </a>
                        </div>
                        <div className="SiteDashboardMainBottomShortcutRoot">
                            <div className="SiteDashboardShortcutTitle">
                                Website Plan: {this.getPlanText()}
                            </div>
                            {/* TODO set link*/}
                            <a
                                className="SiteDashboardShortcutLink"
                                onClick={() => {
                                    setSelectedMenu("Plans");
                                }}
                            >
                                Plan Usage
                            </a>
                        </div>
                        <div className="SiteDashboardMainBottomShortcutRoot">
                            <div className="SiteDashboardShortcutTitle">
                                Resource Plan: {this.getResourcePlanText()}
                            </div>
                            {/* TODO set link*/}
                            <a
                                className="SiteDashboardShortcutLink"
                                onClick={() => {
                                    setSelectedMenu("Plans");
                                }}
                            >
                                Plan Usage
                            </a>
                        </div>
                    </div>
                </div>

                {
                    actionAnchorEl &&
                    <FreeDropDownMenu
                        open={true}
                        anchorEl={actionAnchorEl}
                        onClose={() => {this.setState({actionAnchorEl: undefined})}}
                    >
                        <MenuItem
                            dense
                            onClick={this.onEditWebsiteClicked}
                        >
                            Edit Website
                        </MenuItem>
                        {
                            isPublished &&
                            <MenuItem
                                dense
                                onClick={() => {
                                    window.open(this.getUrl(),'_blank');
                                }}
                            >
                                View Live Site
                            </MenuItem>
                        }
                    </FreeDropDownMenu>
                }
            </div>
        )
    }
}

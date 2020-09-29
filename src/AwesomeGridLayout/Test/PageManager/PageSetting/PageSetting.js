import React from "react";
import './PageSetting.css';
import '../PageManager.css';
import Modal from '@material-ui/core/Modal';
import IconButton from "../../../HelperComponents/IconButton";
import Tabs from "@material-ui/core/Tabs/Tabs";
import Tab from "@material-ui/core/Tab/Tab";
import PageInfo from "./PageInfo";
import Permissions from "./Permissions";
import SeoGoogle from "./SeoGoogle";
import SocialShare from "./SocialShare";

export default class PageSetting extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tabValue: "Page Info"
        }
    }

    onChangeTab = (e, tabValue) => {
        this.setState({tabValue});
    };

    render () {
        let {pageData} = this.props;
        return (
            <Modal
                open={this.props.open}
                onClose={this.props.onClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                className="PageSettingModal"
                disableBackdropClick
            >
                <div className="PageSettingRoot">
                    {/*Header*/}
                    <div className="PageSettingHeader">
                        <div
                            className="PageManagerHeaderContainer"
                        >
                            <span className="PageManagerHeaderTitle">
                                Page Setting ({pageData.props.pageName})
                            </span>

                            <IconButton
                                onClick={this.props.onClose}
                            >
                                <img
                                    draggable={false}
                                    width={12}
                                    height={12}
                                    src={require('../../../icons/close.svg')}
                                />
                            </IconButton>
                        </div>
                    </div>

                    <Tabs
                        className="PageSettingTabBox"
                        value={this.state.tabValue}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={this.onChangeTab}
                        aria-label="disabled tabs example"
                    >
                        <Tab label="Page Info" value="Page Info" className="PageSettingTab"/>
                        <Tab label="Permissions" value="Permissions" className="PageSettingTab"/>
                        <Tab label="SEO (Google)" value="SEO (Google)" className="PageSettingTab"/>
                        <Tab label="Social Share" value="Social Share" className="PageSettingTab"/>
                        <Tab label="Advanced SEO" value="Advanced SEO" className="PageSettingTab"/>

                    </Tabs>

                    {
                        this.state.tabValue === "Page Info" &&
                        <PageInfo
                            pageData={pageData}
                        />
                    }

                    {
                        this.state.tabValue === "Permissions" &&
                        <Permissions
                            pageData={pageData}
                        />
                    }

                    {
                        this.state.tabValue === "SEO (Google)" &&
                        <SeoGoogle
                            pageData={pageData}
                        />
                    }

                    {
                        this.state.tabValue === "Social Share" &&
                        <SocialShare
                            pageData={pageData}
                        />
                    }

                    {
                        this.state.tabValue === "Advanced SEO" &&
                        <div style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: "bold"
                        }}>
                            Coming Soon
                        </div>
                    }
                </div>
            </Modal>
        )
    }
}

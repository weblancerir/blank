import React from "react";
import {EditorContext} from "../../../../Editor/EditorContext";
import IconButton from "../../../../HelperComponents/IconButton";
import Modal from "@material-ui/core/Modal";
import './LinkGenerator.css';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import LightTooltip from "../../../Containers/Menus/Components/LightTooltip";
import Button from "@material-ui/core/Button/Button";
import SmallRadio from "../../../../HelperComponents/SmallRadio";
import DropDown from "../../../../Menus/CommonComponents/DropDown";

export default class LinkGenerator extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            type: props.linkData? props.linkData.type: "None",
            linkData: props.linkData || {type: "None", data: {}}
        };

        console.log("LinkGenerator", props.linkData)
    }


    getHomePageId = () => {
        let homePage = Object.values(this.context.siteData.allPages).find(pageData => {
            return pageData.props.isHome;
        });

        if (!homePage)
            homePage = Object.values(this.context.siteData.allPages)[0];

        return homePage.props.pageId;
    }

    getPageOptions = () => {
        return Object.values(this.context.siteData.allPages).map(page => {
            return {pageId: page.props.pageId, pageName: page.props.pageName};
        })
    };

    getAnchorOptions = () => {
        return Object.values(this.context.pageData.props.anchors || {});
    };

    getFirstLightBoxId = () => {
        return "";
    }

    setLinkType = (type) => {
        switch (type) {
            case "None":
                this.setState({type, linkData: {type, data: {}}});
                break;
            case "WebAddress":
                this.setState({type, linkData: {type, data: {
                    window: "new", url: ""}}});
                break;
            case "Page":
                this.setState({type, linkData: {type, data: {
                    window: "current", pageId: this.getHomePageId(), inputs: []}}});
                break;
            case "Anchor":
                this.setState({type, linkData: {type, data: {
                    anchorId: ""}}});
                break;
            case "TopBottomThisPage":
                this.setState({type, linkData: {type, data: {
                    position: "top"}}});
                break;
            case "Document":
                this.setState({type, linkData: {type, data: {
                    url: ""}}});
                break;
            case "Email":
                this.setState({type, linkData: {type, data: {
                    email: "", subject: ""}}});
                break;
            case "Phone":
                this.setState({type, linkData: {type, data: {
                    number: ""}}});
                break;
            case "LightBox":
                this.setState({type, linkData: {type, data: {
                    lightBoxId: this.getFirstLightBoxId()}}});
                break;
        }
    }

    validURL = (str) => {
        let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        if (!!pattern.test(str)) {
            let result = str;
            if (!str.startsWith("http")) {
                result = "http://" + str;
            }

            return result;
        } else {
            return false;
        }
    }

    validPhone = (str) => {
        if (!str || str.length < 3)
            return false;

        console.log("validPhone", !!/^\d+$/.test(str))
        return !!/^\d+$/.test(str);
    }

    validEmail = (str) => {
        if (!str || str.length < 3)
            return false;

        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(str).toLowerCase());
    }

    isLinkReadyForDone = () => {
        let {type, linkData} = this.state;

        switch (type) {
            case "None":
                return true;
            case "WebAddress":
                return this.validURL(linkData.data.url);
            case "Page":
                return true;
            case "Anchor":
                return linkData.data.anchorId;
            case "TopBottomThisPage":
                return true;
            case "Document":
                // TODO
            case "Email":
                return this.validEmail(linkData.data.email);
            case "Phone":
                return this.validPhone(linkData.data.number);
            case "LightBox":
                // TODO
        }

        return false;
    }

    render () {
        let {type, linkData} = this.state;
        return <Modal
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="PageSettingModal"
            disableBackdropClick
        >
            <div className="PageSettingRoot" style={{height: "auto"}}>
                {/*Header*/}
                <div className="PageSettingHeader">
                    <div
                        className="PageManagerHeaderContainer"
                    >
                            <span className="PageManagerHeaderTitle">
                                What do you want to link to?
                            </span>

                        <IconButton
                            onClick={this.props.onClose}
                        >
                            <img
                                draggable={false}
                                width={12}
                                height={12}
                                src={require('../../../../icons/close.svg')}
                            />
                        </IconButton>
                    </div>
                </div>

                <div className="LinkGeneratorRoot">
                    <div className="LinkGeneratorContent">
                        <div className="LinkGeneratorTypes">
                            <RadioGroup name="type" value={type} onChange={
                                (e) => {this.setLinkType(e.target.value)}}>
                                <FormControlLabel value="None" control={<SmallRadio />}
                                                  label={<p className="LinkGeneratorTypesLabel">None</p>} />
                                <FormControlLabel value="WebAddress" control={<SmallRadio />}
                                                  label={<p className="LinkGeneratorTypesLabel">Web Address</p>}/>
                                <FormControlLabel value="Page" control={<SmallRadio />}
                                                  label={<p className="LinkGeneratorTypesLabel">Page</p>} />
                                <FormControlLabel value="Anchor" control={<SmallRadio />}
                                                  label={<p className="LinkGeneratorTypesLabel">Anchor</p>} />
                                <FormControlLabel value="TopBottomThisPage" control={<SmallRadio />}
                                                  label={<p className="LinkGeneratorTypesLabel">Top / Bottom</p>} />
                                <FormControlLabel value="Document" disabled control={<SmallRadio />}
                                                  label={<p className="LinkGeneratorTypesLabel">Document</p>} />
                                <FormControlLabel value="Email"  control={<SmallRadio />}
                                                  label={<p className="LinkGeneratorTypesLabel">Email</p>} />
                                <FormControlLabel value="Phone"  control={<SmallRadio />}
                                                  label={<p className="LinkGeneratorTypesLabel">Phone</p>} />
                                <FormControlLabel value="LightBox" disabled  control={<SmallRadio />}
                                                  label={<p className="LinkGeneratorTypesLabel">LightBox</p>} />
                            </RadioGroup>
                        </div>
                        <div className="LinkGeneratorOptions">
                            {
                                (type === "None") &&
                                <div className="LinkGeneratorOptionNone">
                                    <h3>No Link</h3>
                                    <p>Choose from the list of options to add a link to your element</p>
                                </div>
                            }
                            {
                                (type === "WebAddress") &&
                                <div className="LinkGeneratorOptionWebAddress">
                                    <span className="LinkGeneratorTypesLabel">
                                        What's the web address (URL)?
                                    </span>
                                    <div className="LinkGeneratorOptionWebAddressInputContainer">
                                        <input
                                            defaultValue={linkData.data.url || ""}
                                            className="NumberInput PageManagerRenameInput PageInfoNameInput LinkGeneratorOptionWebAddressInput"
                                            type="text"
                                            onChange={
                                                (e) => {this.tempUrl = e.target.value}
                                            }
                                            onBlur={() => {
                                                if (this.validURL(this.tempUrl)) {
                                                    this.tempUrl = this.validURL(this.tempUrl);
                                                }
                                                linkData.data.url = this.tempUrl || "";
                                                this.setState({linkData});
                                            }}
                                            onKeyPress={(e) => {
                                                if((e.keyCode || e.which) === 13) {
                                                    if (this.validURL(this.tempUrl)) {
                                                        this.tempUrl = this.validURL(this.tempUrl);
                                                    }
                                                    linkData.data.url = this.tempUrl || "";
                                                    this.setState({linkData});
                                                }
                                            }}
                                        >
                                        </input>
                                        {
                                            (this.tempUrl && !this.validURL(this.tempUrl)) &&
                                            <LightTooltip
                                                title="Check the URL and try again"
                                                PopperProps={{style:{zIndex: 99999999999}}}
                                            >
                                                <img
                                                    className="LinkGeneratorOptionWebAddressUrlError"
                                                    draggable={false}
                                                    width={24}
                                                    height={24}
                                                    src={require('../../../../icons/errorred.svg')}
                                                />
                                            </LightTooltip>
                                        }
                                    </div>

                                    <div className="LinkGeneratorHorizontalDivider">
                                    </div>

                                    <RadioGroup name="window" value={linkData.data.window} onChange={(e) => {
                                        linkData.data.window = e.target.value;
                                        this.setState({linkData});
                                    }}>
                                        <FormControlLabel value="new" control={<SmallRadio />}
                                                          label={<p className="LinkGeneratorTypesLabel">New Window</p>} />
                                        <FormControlLabel value="current" control={<SmallRadio />}
                                                          label={<p className="LinkGeneratorTypesLabel">Current Window</p>} />
                                    </RadioGroup>

                                    {
                                        linkData.data.window === "current" &&
                                        <div className="LinkGeneratorOptionWebAddressTip">
                                            You can only open this link from your published site.
                                        </div>
                                    }
                                </div>
                            }
                            {
                                (type === "Anchor") &&
                                <div className="LinkGeneratorOptionWebAddress">
                                    <span className="LinkGeneratorTypesLabel">
                                        Which anchor linking to?
                                    </span>
                                    <DropDown
                                        rootStyle={{
                                            border: "1px solid #c6c6c6",
                                            marginTop: 12,
                                            borderRadius: 4
                                        }}
                                        menuItemStyle={{
                                            padding: 0
                                        }}
                                        options={this.getAnchorOptions()}
                                        onChange={(v) => {
                                            linkData.data.anchorId = v.id;
                                            this.setState({linkData});
                                        }}
                                        value={this.getAnchorOptions().find(a => a.id === linkData.data.anchorId) || {}}
                                        spanStyle={{
                                            width: 367,
                                            fontSize: 14,
                                            border: "0px solid #cfcfcf",
                                        }}
                                        renderer={(anchor) => {
                                            return (
                                                <div id={"TEst"} className="TextEditorThemeRendererRoot">
                                                    <span className="TextEditorThemeRendererName">
                                                        {anchor.name}
                                                    </span>
                                                </div>
                                            )
                                        }}
                                        valueRenderer={(anchor) => {
                                            return (
                                                <span>
                                                    {anchor.name}
                                                </span>
                                            )
                                        }}
                                    />
                                </div>
                            }
                            {
                                (type === "Page") &&
                                <div className="LinkGeneratorOptionWebAddress">
                                    <span className="LinkGeneratorTypesLabel">
                                        Add your number
                                    </span>
                                    <DropDown
                                        rootStyle={{
                                            border: "1px solid #c6c6c6",
                                            marginTop: 12,
                                            borderRadius: 4
                                        }}
                                        menuItemStyle={{
                                            padding: 0
                                        }}
                                        options={this.getPageOptions()}
                                        onChange={(v) => {
                                            linkData.data.pageId = v.pageId;
                                            this.setState({linkData});
                                        }}
                                        value={this.getPageOptions().find(p => p.pageId === linkData.data.pageId)}
                                        spanStyle={{
                                            width: 367,
                                            fontSize: 14,
                                            border: "0px solid #cfcfcf",
                                        }}
                                        renderer={(page) => {
                                            return (
                                                <div id={"TEst"} className="TextEditorThemeRendererRoot">
                                                    <span className="TextEditorThemeRendererName">
                                                        {page.pageName}
                                                    </span>
                                                </div>
                                            )
                                        }}
                                        valueRenderer={(page) => {
                                            return (
                                                <span>
                                                    {page.pageName}
                                                </span>
                                            )
                                        }}
                                    />
                                    <div className="LinkGeneratorHorizontalDivider">
                                    </div>

                                    <RadioGroup name="window" value={linkData.data.window} onChange={(e) => {
                                        linkData.data.window = e.target.value;
                                        this.setState({linkData});
                                    }}>
                                        <FormControlLabel value="new" control={<SmallRadio />}
                                                          label={<p className="LinkGeneratorTypesLabel">New Window</p>} />
                                        <FormControlLabel value="current" control={<SmallRadio />}
                                                          label={<p className="LinkGeneratorTypesLabel">Current Window</p>} />
                                    </RadioGroup>

                                    {
                                        linkData.data.window === "new" &&
                                        <div className="LinkGeneratorOptionWebAddressTip">
                                            You can only open this link from your published site.
                                        </div>
                                    }
                                </div>
                            }
                            {
                                (type === "TopBottomThisPage") &&
                                <div className="LinkGeneratorOptionWebAddress">
                                    <span className="LinkGeneratorTypesLabel">
                                        Select scroll destination
                                    </span>

                                    <div className="LinkGeneratorVerticalSpace">
                                    </div>

                                    <RadioGroup name="window" value={linkData.data.position} onChange={(e) => {
                                        linkData.data.position = e.target.value;
                                        this.setState({linkData});
                                    }}>
                                        <FormControlLabel value="top" control={<SmallRadio />}
                                                          label={<p className="LinkGeneratorTypesLabel">Top of page</p>} />
                                        <FormControlLabel value="bottom" control={<SmallRadio />}
                                                          label={<p className="LinkGeneratorTypesLabel">Bottom of page</p>} />
                                    </RadioGroup>
                                </div>
                            }
                            {
                                (type === "Phone") &&
                                <div className="LinkGeneratorOptionWebAddress">
                                    <span className="LinkGeneratorTypesLabel">
                                        Add your number
                                    </span>
                                    <div className="LinkGeneratorOptionWebAddressInputContainer">
                                        <input
                                            defaultValue={linkData.data.number || ""}
                                            placeholder="09123456789"
                                            className="NumberInput PageManagerRenameInput PageInfoNameInput LinkGeneratorOptionWebAddressInput"
                                            type="text"
                                            onChange={
                                                (e) => {this.tempNumber = e.target.value}
                                            }
                                            onBlur={() => {
                                                linkData.data.number = this.tempNumber || "";
                                            }}
                                            onKeyPress={(e) => {
                                                if((e.keyCode || e.which) === 13) {
                                                    linkData.data.number = this.tempNumber || "";
                                                    this.setState({linkData});
                                                }
                                            }}
                                        >
                                        </input>
                                        {
                                            (this.tempNumber && !this.validPhone(this.tempNumber)) &&
                                            <LightTooltip
                                                title="Check the number and try again"
                                                PopperProps={{style:{zIndex: 99999999999}}}
                                            >
                                                <img
                                                    className="LinkGeneratorOptionWebAddressUrlError"
                                                    draggable={false}
                                                    width={24}
                                                    height={24}
                                                    src={require('../../../../icons/errorred.svg')}
                                                />
                                            </LightTooltip>
                                        }
                                    </div>
                                </div>
                            }
                            {
                                (type === "Email") &&
                                <div className="LinkGeneratorOptionWebAddress">
                                    <span className="LinkGeneratorTypesLabel">
                                        What's the email address?
                                    </span>
                                    <div className="LinkGeneratorOptionWebAddressInputContainer">
                                        <input
                                            defaultValue={linkData.data.email || ""}
                                            placeholder="e.g. youremail@gmal.com"
                                            className="NumberInput PageManagerRenameInput PageInfoNameInput LinkGeneratorOptionWebAddressInput"
                                            type="text"
                                            onChange={
                                                (e) => {this.tempEmail = e.target.value}
                                            }
                                            onBlur={() => {
                                                linkData.data.email = this.tempEmail || "";
                                            }}
                                            onKeyPress={(e) => {
                                                if((e.keyCode || e.which) === 13) {
                                                    linkData.data.email = this.tempEmail || "";
                                                    this.setState({linkData});
                                                }
                                            }}
                                        >
                                        </input>
                                        {
                                            (this.tempEmail && !this.validEmail(this.tempEmail)) &&
                                            <LightTooltip
                                                title="Check the email and try again"
                                                PopperProps={{style:{zIndex: 99999999999}}}
                                            >
                                                <img
                                                    className="LinkGeneratorOptionWebAddressUrlError"
                                                    draggable={false}
                                                    width={24}
                                                    height={24}
                                                    src={require('../../../../icons/errorred.svg')}
                                                />
                                            </LightTooltip>
                                        }
                                    </div>

                                    <div className="LinkGeneratorHorizontalDivider">
                                    </div>

                                    <div className="LinkGeneratorOptionWebAddressInputContainer">
                                        <input
                                            defaultValue={linkData.data.subject || ""}
                                            placeholder=""
                                            className="NumberInput PageManagerRenameInput PageInfoNameInput LinkGeneratorOptionWebAddressInput"
                                            type="text"
                                            onChange={
                                                (e) => {this.tempSubject = e.target.value}
                                            }
                                            onBlur={() => {
                                                linkData.data.subject = this.tempSubject || "";
                                            }}
                                            onKeyPress={(e) => {
                                                if((e.keyCode || e.which) === 13) {
                                                    linkData.data.subject = this.tempSubject || "";
                                                    this.setState({linkData});
                                                }
                                            }}
                                        >
                                        </input>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="LinkGeneratorFooter">
                        <Button
                            className="LinkGeneratorFooterCancel"
                            color="primary"
                            onClick={this.props.onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="LinkGeneratorFooterDone"
                            variant="contained"
                            color="primary"
                            disabled={!this.isLinkReadyForDone()}
                            onClick={() => {
                                this.props.onDone(linkData);
                                this.props.onClose();
                            }}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    }
}

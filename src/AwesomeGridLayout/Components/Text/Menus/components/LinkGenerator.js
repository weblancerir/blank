import React from "react";
import {EditorContext} from "../../../../Editor/EditorContext";
import IconButton from "../../../../HelperComponents/IconButton";
import Modal from "@material-ui/core/Modal";
import './LinkGenerator.css';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import LightTooltip from "../../../Containers/Menus/Components/LightTooltip";
import Button from "@material-ui/core/Button/Button";

export default class LinkGenerator extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            type: props.linkData? props.linkData.type: "None",
            linkData: props.linkData
        };

        this.buttonRef = React.createRef();
    }


    getHomePageId = () => {
        let homePage = Object.values(this.context.siteData.allPages).find(pageData => {
            return pageData.props.isHome;
        });

        if (!homePage)
            homePage = Object.values(this.context.siteData.allPages)[0];

        return homePage.id;
    }

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
                    pageId: this.getHomePageId(), anchorId: "topOfPage"}}});
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
        return !!pattern.test(str);
    }

    isLinkReadyForDone = () => {
        let {type, linkData} = this.state;

        switch (type) {
            case "None":
                return true;
            case "WebAddress":
                return this.validURL(linkData.data.url);
            case "Page":
                // TODO
            case "Anchor":
                // TODO
            case "TopBottomThisPage":
                // TODO
            case "Document":
                // TODO
            case "Email":
                // TODO
            case "Phone":
                // TODO
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
                                What do you want to link to?
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

                <div className="LinkGeneratorRoot">
                    <div className="LinkGeneratorContent">
                        <div className="LinkGeneratorTypes">
                            <RadioGroup name="type" value={type} onChange={
                                (e) => {this.setLinkType(e.target.value)}}>
                                <FormControlLabel value="None" control={<Radio />} label="None" />
                                <FormControlLabel value="WebAddress" control={<Radio />} label="Web Address" />
                                <FormControlLabel value="Page" control={<Radio />} label="Page" />
                                <FormControlLabel value="Anchor" disabled control={<Radio />} label="Anchor" />
                                <FormControlLabel value="TopBottomThisPage" control={<Radio />} label="Top Or Bottom" />
                                <FormControlLabel value="Document" disabled control={<Radio />} label="Document" />
                                <FormControlLabel value="Email"  control={<Radio />} label="Email" />
                                <FormControlLabel value="Phone"  control={<Radio />} label="Phone" />
                                <FormControlLabel value="LightBox" disabled  control={<Radio />} label="LightBox" />
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
                                <div className="LinkGeneratorOptionNone">
                                    <span className="PageInfoBoxTitle">
                                        What's the web address (URL)?
                                    </span>
                                    <input
                                        defaultValue=""
                                        className="NumberInput PageManagerRenameInput PageInfoNameInput"
                                        type="text"
                                        onChange={
                                            (e) => {this.setState({tempUrl: e.target.value})}
                                        }
                                        onBlur={() => {
                                            linkData.data.url = this.state.tempUrl;
                                            this.setState({linkData});
                                        }}
                                        onKeyPress={(e) => {
                                            if((e.keyCode || e.which) === 13) {
                                                linkData.data.url = this.state.tempUrl;
                                                this.setState({linkData});
                                            }
                                        }}
                                    >
                                    </input>
                                    {
                                        (this.state.tempUrl && !this.validURL(this.state.tempUrl)) &&
                                        <LightTooltip title="Check the URL and try again">
                                            <svg width="25" height="25" viewBox="0 0 25 25"
                                                 className="symbol-input-validation-error">
                                                <circle cx="13" cy="12" r="12"></circle>
                                                <circle className="c2" cx="13" cy="17" r="1"></circle>
                                                <path className="c1" fill-rule="evenodd"
                                                      d="M13 7c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1s-1-.45-1-1V8c0-.55.45-1 1-1z"></path>
                                            </svg>
                                        </LightTooltip>
                                    }
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
                            disabled={}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    }
}

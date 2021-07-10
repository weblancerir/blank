import React from "react";
import {EditorContext} from "../../EditorContext";
import './SiteSetting.css';
import Button from "@material-ui/core/Button/Button";
import ReactLoading from "react-loading";
import UploadButton from "../../../Components/FileManager/Components/UploadButton";
import FileManagerHelper from "../../../Components/FileManager/FileManagerHelper";
import {getRandomLinkId} from "../../../Components/Text/TextHelper";
import Confirm from "../Components/Confirm";

export default class Domains extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        let {siteData, website} = this.context;
        let isPublished = website.metadata.isPublished;
        return (
            <div className="SitSettingRoot">
                <div className="SitSettingMainRoot">

                </div>

                {
                    this.state.loading &&
                    <div className="MainLoading">
                        <ReactLoading type={'bubbles'}
                                      color={"#7cfdf7"}
                                      height={'85px'}
                                      width={'85px'}
                        />
                    </div>
                }
            </div>
        )
    }
}

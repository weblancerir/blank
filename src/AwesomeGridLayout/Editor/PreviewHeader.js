import React from "react";
import './EditorBoundary.css';
import {EditorContext} from "./EditorContext";
import IconButton from "../HelperComponents/IconButton";
import EditorHeaderPageSelect from "./PageSelect/EditorHeaderPageSelect";
import EditorHeaderBreakpoints from "./Breakpoints/EditorHeaderBreakpoints";
import EditorHeaderZoom from "./Zoom/EditorHeaderZoom";
import PreviewHeaderBreakpoints from "./Breakpoints/PreviewHeaderBreakpoints";
import {getCommonDevices} from "./Breakpoints/BreakpointHelper";
import {Button} from "@material-ui/core";

export default class PreviewHeader extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    render () {
        return (
            <div className="EditorHeaderRoot" style={{
                width: `${this.context.zoomScale*100}%`,
            }}>
                <div className="EditorHeaderRightShortcuts">
                </div>
                <div className="EditorHeaderCenterShortcuts">
                    <EditorHeaderPageSelect
                        className="EditorHeaderCenterDiv"
                        style={{
                            width: 200
                        }}
                    />
                    <PreviewHeaderBreakpoints
                        className="EditorHeaderCenterDiv EditorHeaderLastCenterDiv EditorHeaderBreakpoints"
                        devices={getCommonDevices()}
                    />
                </div>
                <div className="PreviewHeaderLeftShortcuts">
                    <Button className="PublishButton" onClick={() => {
                        this.context.sendPublishCommand();
                    }}>
                        Publish
                    </Button>
                    <Button className="PreviewButton" onClick={() => {
                        this.context.sendEditCommand();
                    }}>
                        Edit
                    </Button>
                </div>
            </div>
        )
    }
}

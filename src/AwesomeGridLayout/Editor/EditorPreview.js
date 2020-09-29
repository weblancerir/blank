import React from "react";
import './EditorBoundary.css';
import IconButton from "../HelperComponents/IconButton";
import DropDown from "../Menus/CommonComponents/DropDown";
import EditorHeaderZoom from "./Zoom/EditorHeaderZoom";
import {EditorContext} from "./EditorContext";
import EditorHeaderPageSelect from "./PageSelect/EditorHeaderPageSelect";
import EditorHeaderBreakpoints from "./Breakpoints/EditorHeaderBreakpoints";
import {getScrollbarWidth} from "../AwesomeGridLayoutUtils";
import PageBase from "../Components/Pages/PageBase";

export default class EditorPreview extends React.Component {
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
            <div className="EditorPreviewRoot">
                {this.props.children}
            </div>
        )
    }
}

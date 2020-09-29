import React from "react";
import './EditorBoundary.css';
import {EditorContext} from "./EditorContext";
import EditorPreview from "./EditorPreview";

export default class EditorType extends React.Component {
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
        if (this.props.preview) {
            return (
                <EditorPreview>
                    {this.props.children}
                </EditorPreview>
            )
        } else {
            return (
                <div className="EditorBoundaryContent">
                    {this.props.children}
                </div>
            )
        }
    }
}

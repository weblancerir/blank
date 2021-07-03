import React from "react";
import {EditorContext} from "../../../../Editor/EditorContext";
import './LinkedTag.css';
import {prepareLink} from "./LinkHelper";

export default class LinkedTag extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {};

        this.lastRef = undefined;
    }

    onRefChange = (ref) => {
        this.linkRef = ref;
        if (this.lastRef !== this.linkRef) {
            this.lastRef = this.linkRef;
            window.requestAnimationFrame(this.prepareLink);
        }
    }

    prepareLink = () => {
        if (!this.context.preview && !this.context.production)
            return;

        let {linkData} = this.props;

        if (this.linkRef && linkData && linkData.type !== "None") {
            prepareLink(this.linkRef, this.context.preview, this.context.production, this.context, linkData);
        }
    }

    render () {
        let {children, className} = this.props;
        let aClassName = "LinkedTagRoot";
        if (className)
            aClassName += ` ${className}`;

        let aTagProps = Object.assign({}, this.props);
        delete aTagProps.linkData;

        return (
            <a
                className={aClassName}
                ref={(ref) => {this.onRefChange(ref)}}
                {...aTagProps}
            >
                {children}
            </a>
        )
    }
}

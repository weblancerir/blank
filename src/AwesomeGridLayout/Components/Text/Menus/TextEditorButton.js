import React from "react";
import './TextEditor.css';
import IconButton from "../../../HelperComponents/IconButton";

export default class TextEditorButton extends React.Component {
    render () {
        return (
            <IconButton
                buttonBaseStyle={{
                    marginLeft: 4,
                    backgroundColor: this.props.selected ? "#dce9ff" : "unset"
                }}
                imageContainerStyle={{
                    padding: 6
                }}
                onClick={this.props.onClick}
                rootRef={this.props.rootRef}
            >
                {this.props.children}
            </IconButton>
        )
    }
}

import React from "react";
import './TextEditor.css';
import IconButton from "../../../HelperComponents/IconButton";

export default class TextEditorButton extends React.Component {
    getImage = () => {
        if (this.props.selected && this.props.selectedIcon)
            return this.props.selectedIcon;

        if (this.props.disabled && this.props.disabledIcon)
            return this.props.disabledIcon;

        return this.props.children;
    }
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
                disabled={this.props.disabled}
            >
                {this.getImage()}
            </IconButton>
        )
    }
}

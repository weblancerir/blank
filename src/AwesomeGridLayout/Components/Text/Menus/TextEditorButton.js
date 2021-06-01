import React from "react";
import Popper from "@material-ui/core/Popper/Popper";
import {Button} from "@material-ui/core";
import './TextEditor.css';
import {alignItem} from "../../../AwesomwGridLayoutHelper";
import IconButton from "../../../HelperComponents/IconButton";

export default class TextEditorButton extends React.Component {
    render () {
        return (
            <IconButton
                buttonBaseStyle={{
                    marginLeft: 4,
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

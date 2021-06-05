import React from "react";
import '../Menu.css';
import ColorPicker from "../CommonComponents/ColorPicker";

export default class ColorAdjustment extends React.Component {
    render () {
        return (
            <div className="MenuOptionSection">
                <p className="MenuOptionSectionTitle">{this.props.title}</p>

                <ColorPicker
                    color={this.props.color}
                    designKey={this.props.designKey}
                    onDesignChange={this.props.onDesignChange}
                    editor={this.props.editor}
                />
            </div>
        )
    }
}

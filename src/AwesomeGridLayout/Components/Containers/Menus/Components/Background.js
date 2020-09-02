import React from "react";
import '../../../../Menus/Menu.css';
import ColorPicker from "../../../../Menus/CommonComponents/ColorPicker";
import ThemeColorPicker from "../../../../Test/Theme/ThemeColorPicker";

export default class Background extends React.Component {
    render () {
        return (
            <div className="MenuOptionSection">
                <p className="MenuOptionSectionTitle">Background</p>

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

import React from "react";
import './ThemeManager.css';
import './ThemeColorPicker.css';
// import {SketchPicker} from "react-color";
import SketchPicker from "react-color/lib/components/sketch/Sketch";
import Portal from "../../Portal";

export default class HexColorPicker extends React.Component {
    onChangeComplete = (color) => {
        this.props.onChangeComplete(color.hex);
    };

    render() {
        return (
            <Portal node={document.body}>
                <div style={ {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                    zIndex: 999999999999
                }} onClick={ this.props.onClose }/>
                <div style={{
                    position: 'absolute',
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 999999999999
                }}>
                    <SketchPicker
                        color={this.props.color}
                        onChangeComplete={ this.onChangeComplete }
                        disableAlpha={this.props.disableAlpha}
                        width={this.props.width || 224}
                    />
                </div>
            </Portal>
        )
    }
}

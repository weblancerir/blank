import React from "react";
import './CommonMenu.css';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import SliderInputControlled from "./SliderInputControlled";
import ThemeColorPicker from "../../Test/Theme/ThemeColorPicker";
import chroma from "chroma-js";
import {parseColor} from "../../AwesomwGridLayoutHelper";
import {EditorContext} from "../../Editor/EditorContext";

export default class ColorPicker extends React.Component {
    static contextType = EditorContext;

    constructor (props) {
        super(props);

        this.state = {};

        this.lastValue = props.color || 'rgba(0,0,0,0)';
    }

    getRgbA = (value) => {
        if (!value)
            return;

        if (value instanceof Object) {
            value = this.context.getColor(value.paletteName, value.key);
        }

        let color = chroma(value);
        return {
            r: color.rgba()[0],
            g: color.rgba()[1],
            b: color.rgba()[2],
            a: color.rgba()[3]
        }
    };

    handleClick = (e) => {
        if (this.state.displayColorPicker)
            this.setState({ displayColorPicker: false });
        else
            this.setState({ displayColorPicker: e.target })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };

    handleChangeComplete = (color) => {
        if (color instanceof Object) {
            console.log("handlehangeComplete1 this.lastValue", this.lastValue, parseColor(this.lastValue, this.lastValue.alpha, this.context));
            color.alpha = chroma(parseColor(this.lastValue, this.lastValue.alpha, this.context)).alpha();
            console.log("handlehangeComplete1 alpha", color.alpha);
            this.lastValue = color;
            // color.alpha = chroma(parseColor(color, undefined, this.context)).alpha();
            this.props.onDesignChange(this.props.designKey, color);
            return;
        }

        console.log("handleChangeComplete", this.getColorAndAlpha().alpha)
        let alpha = this.getColorAndAlpha().alpha || 100;

        let value = this.lastValue = chroma(color).alpha(alpha / 100).css();

        this.props.onDesignChange(this.props.designKey, value);
    };

    getColorAndAlpha = () => {
        let result = {
            color: chroma(parseColor(this.props.color, 1, this.context)).alpha(0).hex(),
            alpha: chroma(parseColor(this.props.color, this.props.color && this.props.color.alpha, this.context)).alpha() * 100
        };

        return result;
    };

    handleAlphaChange = (alpha) => {
        if (this.lastValue instanceof Object) {
            this.lastValue.alpha = alpha / 100;
        } else {
            this.lastValue = chroma(this.lastValue).alpha(alpha / 100).css();
        }
        this.props.onDesignChange(this.props.designKey, this.lastValue);
    };

    render () {
        let {color, alpha} = this.getColorAndAlpha();
        return (
                <div className="CommonMenuRoot ColorPickerRoot">
                    <ButtonBase
                        style={{
                            background: `url(${process.env.PUBLIC_URL}'/static/icon/transparency.png')`,
                        }}
                        className="ColorPickerRGB"
                        onClick={ this.handleClick }
                    >
                        <div
                            style={{
                                background: parseColor(this.props.color, alpha/100, this.context),
                            }}
                        />
                    </ButtonBase>

                    <div
                        className="ColorPickerAlpha"
                    >
                        <SliderInputControlled
                            min={0}
                            max={100}
                            value={alpha || 0}
                            onChange={this.handleAlphaChange}
                        />
                    </div>
                    {
                        this.state.displayColorPicker &&
                            <ThemeColorPicker
                                color={color}
                                onClose={this.handleClose}
                                onChangeComplete={ this.handleChangeComplete }
                                disableAlpha
                                editor={this.props.editor}
                                defaultPosition={
                                    this.state.displayColorPicker.getBoundingClientRect()
                                }
                            />
                    }
                </div>
        )
    }
}

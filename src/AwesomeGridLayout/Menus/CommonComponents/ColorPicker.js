import React from "react";
import './CommonMenu.css';
import { SketchPicker } from 'react-color';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import SliderInputControlled from "./SliderInputControlled";

export default class ColorPicker extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            color: this.getRgbA(props.color) || {
                r: 0,
                g: 0,
                b: 0,
                a: 0
            },
            alpha: this.getRgbA(props.color) && this.getRgbA(props.color).a * 100
        };

        console.log(this.state.color, props.color)
    }

    getRgbA = (value) => {
        if (!value)
            return;

        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(value)){
            let c;
            c = value.substring(1).split('');
            if(c.length === 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x'+c.join('');
            return {
                r: (c>>16)&255,
                g: (c>>8)&255,
                b: c&255,
                a: 1,
            };
        }

        if (value.startsWith("rgba")) {
            let a, isPercent,
                rgb = value.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
                alpha = (rgb && rgb[4] || "").trim();

            if (alpha !== "") {
                a = alpha;
            } else {
                a = 1;
            }

            return {
                r: rgb[1],
                g: rgb[2],
                b: rgb[3],
                a: a
            };
        }

        return value;
    };

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };

    handleChangeComplete = (color) => {
        console.log("handleChangeComplete", color);
        let value = {
            r: color.rgb.r,
            g: color.rgb.g,
            b: color.rgb.b,
            a: (this.state.alpha || 100) / 100,
        };

        this.setState({color: color.rgb, alpha: this.state.alpha || 100});

        value = `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;

        this.props.onDesignChange(this.props.designKey, value);
    };

    handleAlphaChange = (alpha) => {
        this.setState({alpha});
        console.log("handleAlphaChange", this.state.color);
        let value = {
            r: this.state.color.r,
            g: this.state.color.g,
            b: this.state.color.b,
            a: alpha / 100,
        };

        value = `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;

        this.props.onDesignChange(this.props.designKey, value);
    };

    render () {
        return (
            <div className="CommonMenuRoot ColorPickerRoot">
                <ButtonBase
                    style={{
                        background: `url('/static/icon/transparency.png')`,
                    }}
                    className="ColorPickerRGB"
                    onClick={ this.handleClick }
                >
                    <div
                        style={{
                            background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.alpha / 100 })`,
                        }}
                    />
                </ButtonBase>

                <div
                    className="ColorPickerAlpha"
                >
                    <SliderInputControlled
                        min={0}
                        max={100}
                        value={this.state.alpha || 0}
                        onChange={this.handleAlphaChange}
                    />
                </div>
                {
                    this.state.displayColorPicker &&
                    <div style={{
                        position: 'absolute',
                        zIndex: '2',
                    }}>
                        <div style={ {
                            position: 'fixed',
                            top: '0px',
                            right: '0px',
                            bottom: '0px',
                            left: '0px',
                            // backgroundColor: 'rgba(115, 115, 115, 0.4)'
                        }} onClick={ this.handleClose }/>
                        <SketchPicker
                            color={this.state.color}
                            onChangeComplete={ this.handleChangeComplete }
                            disableAlpha
                            width={224}
                        />
                    </div>
                }
            </div>
        )
    }
}

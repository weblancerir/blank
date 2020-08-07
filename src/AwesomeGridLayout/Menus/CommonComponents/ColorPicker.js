import React from "react";
import './CommonMenu.css';
import { SketchPicker } from 'react-color';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import SliderInputControlled from "./SliderInputControlled";

export default class ColorPicker extends React.Component {
    constructor (props) {
        super(props);

        this.state = {};
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
        let alpha = this.getColorAndAlpha().alpha || 100;
        let value = {
            r: color.rgb.r,
            g: color.rgb.g,
            b: color.rgb.b,
            a: (alpha) / 100,
        };

        this.lastValue = value = `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;

        this.props.onDesignChange(this.props.designKey, value);
    };

    getColorAndAlpha = () => {
        return {
            color: this.getRgbA(this.props.color) || {
                r: 0,
                g: 0,
                b: 0,
                a: 0
            },
            alpha: this.getRgbA(this.props.color) && this.getRgbA(this.props.color).a * 100
        };
    };

    handleAlphaChange = (alpha) => {
        let color = this.getColorAndAlpha().color;
        let value = {
            r: color.r,
            g: color.g,
            b: color.b,
            a: alpha / 100,
        };

        this.lastValue = value = `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;

        this.props.onDesignChange(this.props.designKey, value);
    };

    render () {
        let {color, alpha} = this.getColorAndAlpha();
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
                            background: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ alpha / 100 })`,
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
                        <>
                            <div style={ {
                                position: 'fixed',
                                top: '0px',
                                right: '0px',
                                bottom: '0px',
                                left: '0px',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)'
                            }} onClick={ this.handleClose }/>
                            <div style={{
                                position: 'absolute',
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: '2',
                            }}>
                                <SketchPicker
                                    color={color}
                                    onChangeComplete={ this.handleChangeComplete }
                                    disableAlpha
                                    width={224}
                                />
                            </div>
                        </>

                }
            </div>
        )
    }
}

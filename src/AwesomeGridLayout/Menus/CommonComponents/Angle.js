import React from "react";
import './CommonMenu.css';
import CircularSlider from "./CircularSlider";
import NumberInput from "./NumberInput";

export default class Angle extends React.Component {
    onChange = (value) => {
        if (this.props.loop && value === 360)
            value = 0;

        this.props.onChange(value.toFixed(0));
    };

    render () {
        return (
            <div className="AngleRoot">
                <CircularSlider
                    {...this.props}
                    className="AngleSlider"
                    value={this.props.angle}
                    onChange={this.onChange}
                    min={0}
                    max={360}
                />

                <NumberInput
                    className="AngleInput"
                    min={0}
                    max={360}
                    value={this.props.angle}
                    onChange={this.onChange}
                />
            </div>
        )
    }
}

import React from "react";
import './CommonMenu.css';
import Slider from "./Slider";
import NumberInput from "./NumberInput";

export default class SliderInputControlled extends React.Component {
    onChange = (value) => {
        this.props.onDesignChange &&
        this.props.onDesignChange(this.props.designKey, value);

        this.props.onChange &&
        this.props.onChange(value);
    };

    render () {
        return (
            <>
                <Slider
                    className="BorderWidthSlider"
                    style={{ marginRight: 24 }}
                    min={this.props.min}
                    max={this.props.max}
                    value={this.props.value}
                    onChange={this.onChange}
                    handleStyle={{
                        marginLeft: 7
                    }}
                />

                <NumberInput
                    className="BorderWidthInput"
                    min={this.props.min}
                    max={this.props.max}
                    value={this.props.value}
                    onChange={this.onChange}
                />
            </>
        )
    }
}

import React from "react";
import './CommonMenu.css';
import RCSlider from 'rc-slider';
import Slider from "./Slider";
import NumberInput from "./NumberInput";

export default class SliderInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value || 0
        }
    }

    onChange = (value) => {
        this.setState({value});

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
                    style={{ marginRight: 16 }}
                    min={this.props.min}
                    max={this.props.max}
                    value={this.state.value}
                    onChange={this.onChange}
                />

                <NumberInput
                    className="BorderWidthInput"
                    min={this.props.min}
                    max={this.props.max}
                    value={this.state.value}
                    onChange={this.onChange}
                />
            </>
        )
    }
}

import React from "react";
import './CommonMenu.css';
import RCSlider from 'rc-slider';

export default class Slider extends React.Component {
    render () {
        return (
            <RCSlider
                {...this.props}
                min={this.props.min}
                max={this.props.max}
                step={this.props.step}
                value={this.props.value}
                onChange={this.props.onChange}
            />
        )
    }
}

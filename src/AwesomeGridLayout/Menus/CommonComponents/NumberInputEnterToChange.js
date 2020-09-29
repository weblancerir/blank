import React from "react";
import './CommonMenu.css';

export default class NumberInputEnterToChange extends React.Component {
    constructor(props) {
        super(props);

        console.log("props.min", props.min)

        this.state = {};
    }

    inputFilter = (value, oldValue) => {
        if (/^\d+$/.test(value)) {
            value = parseFloat(value).toFixed(0);
            value = Math.min(this.props.max, value);
            value = Math.max(this.props.min, value);
            return value;
        } else if (value === "") {
            return "0";
        }

        return oldValue;
    };

    onChange = (e) => {
        if (this.props.lazy)
            return;

        let value = this.inputFilter(this.state.tempValue, this.props.value);
        this.props.onChange(value);
        this.setState({tempValue: undefined});
    };

    onTempChange = (e) => {
        let tempValue = e.target.value;
        this.setState({tempValue});

        if (this.props.lazy)
            this.props.onChange(tempValue);
    };

    render () {
        return (
            <input
                className={"NumberInput " + this.props.className || ""}
                value={this.state.tempValue || this.props.value || 0}
                onChange={this.onTempChange}
                onBlur={this.onChange}
                onKeyPress={(e) => {
                    if((e.keyCode || e.which) === 13) {
                        this.onChange();
                        if (this.props.onKeyPress)
                            this.props.onKeyPress();
                    }
                }}
                type="text"
                style={this.props.inputStyle}
            />
        )
    }
}

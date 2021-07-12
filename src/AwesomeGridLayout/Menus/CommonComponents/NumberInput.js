import React from "react";
import './CommonMenu.css';
import {inputCopyPasteHandler} from "../../AwesomwGridLayoutHelper";

export default class NumberInput extends React.Component {
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
        let value = this.inputFilter(e.target.value, this.props.value);
        this.props.onChange(value);
    };

    render () {
        return (
            <input
                className="NumberInput"
                value={this.props.value || 0}
                onChange={this.onChange}
                onKeyDown={inputCopyPasteHandler}
                type="text"
                style={this.props.inputStyle}
            />
        )
    }
}

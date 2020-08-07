import React from "react";
import './CommonMenu.css';

export default class TextInput extends React.Component {
    onChange = (e) => {
        let value = e.target.value;
        if (this.props.onChange)
            this.props.onChange(value);
    };

    render () {
        return (
            <input
                {...this.props}
                className="NumberInput"
                value={this.props.value || ""}
                onChange={this.onChange}
                type="text"
                style={this.props.inputStyle}
            />
        )
    }
}

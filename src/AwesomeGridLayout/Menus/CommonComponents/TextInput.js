import React from "react";
import './CommonMenu.css';
import {inputCopyPasteHandler} from "../../AwesomwGridLayoutHelper";

export default class TextInput extends React.Component {
    onChange = (e) => {
        let value = e.target.value;
        if (this.props.onChange)
            this.props.onChange(value);
    };

    render () {
        let {inputStyle} = this.props;
        let inputProps = Object.assign({}, this.props);
        delete inputProps.inputStyle;
        return (
            <input
                {...inputProps}
                className="NumberInput"
                value={this.props.value || ""}
                onChange={this.onChange}
                type="text"
                style={inputStyle}
                onKeyDown={inputCopyPasteHandler}
            />
        )
    }
}

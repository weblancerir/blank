import React from "react";
import './CommonMenu.css';
import { SketchPicker } from 'react-color';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import {cloneObject} from "../../AwesomeGridLayoutUtils";

export default class Image extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            src: props.src,
            hasError: false,
        };
    }

    onError = (e) => {
        if (!this.state.hasError) {
            let {errorsrc} = this.props;
            this.setState({
                src: errorsrc,
                hasError: true,
            });
        }
    };

    render () {
        return (
            <img
                {...this.props}
                onError={this.onError}
                src={this.state.src || this.props.errorsrc}
            />
        )
    }
}

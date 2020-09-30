import React from "react";
import './CommonMenu.css';

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
                // onError={this.onError}
                src={this.state.src/* || this.props.errorsrc*/}
            />
        )
    }
}

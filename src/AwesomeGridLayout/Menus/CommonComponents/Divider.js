import React from "react";
import './CommonMenu.css';

export default class Divider extends React.Component {
    render () {
        return (
            <div className="Divider" style={this.props.style}>
            </div>
        )
    }
}

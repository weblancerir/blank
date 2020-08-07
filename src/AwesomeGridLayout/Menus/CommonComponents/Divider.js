import React from "react";
import './CommonMenu.css';
import { SketchPicker } from 'react-color';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import {cloneObject} from "../../AwesomeGridLayoutUtils";

export default class Divider extends React.Component {
    render () {
        return (
            <div className="Divider" style={this.props.style}>
            </div>
        )
    }
}

import React from "react";
import './Adjustment.css';
import {stretch} from "../AwesomwGridLayoutHelper";

export default class AdjustmentStretch extends React.Component {
    onClick = (e) => {
        let {itemId, idMan} = this.props;
        stretch(idMan.getItem(itemId));
    };

    onMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    isLeftClick = (e) => {
        if (e.pointerType === "mouse" && e.button === 0)
            return true;

        return false;
    };

    render () {
        let {isStretch} = this.props;
        return (
            <div
                id="AdjustmentResize"
                className="AdjustmentStretchRoot"
                onPointerDown={this.onMouseDown}
                onClick={this.onClick}
                style={this.props.style}
            >
                {
                    isStretch && <img draggable={false} width={16} height={16} src={require('./icons/minimize.svg')} />
                }
                {
                    !isStretch && <img draggable={false} width={16} height={16} src={require('./icons/maximize.svg')} />
                }
            </div>
        )
    }
}

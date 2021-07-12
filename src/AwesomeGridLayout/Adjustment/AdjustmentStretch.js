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

    dontDisplay = () => {
        let {itemId, idMan} = this.props;
        let item = idMan.getItem(itemId);
        if (item.props.isStack)
            return true;
        if (item.getSize().width < 80 || item.getSize().height < 40)
            return true;
        if (item.resizing)
            return true;
        if (item.props.aglComponent && item.props.aglComponent.getScaleProportionally &&
            item.props.aglComponent.getScaleProportionally().enable) {
            return true
        }
        return item.state.draggingStart;
    }

    render () {
        let {isStretch} = this.props;
        if (this.dontDisplay())
            return null;
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

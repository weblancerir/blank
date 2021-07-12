import React from "react";
import './Adjustment.css';
import AdjustmentMove from "./AdjustmentMove";

export default class AdjustmentItemMove extends React.Component {
    onDragStart = (e) => {
        this.onMouseDown(e);
    };

    onDrag = (e) => {
        this.onMouseMove(e);
    };

    onDragStop = (e) => {
        this.onMouseUp(e);
    };

    dontDisplay = () => {
        let {itemId, idMan} = this.props;
        let item = idMan.getItem(itemId);
        if (item.props.isPage || item.props.isSection)
            return true;
        if (item.resizing)
            return true;
        return false;
    }

    onMouseDown = (e) => {
        let {itemId, idMan} = this.props;
        let item = idMan.getItem(itemId);
        item.onMouseDown(e, false, true);
    };

    onMouseMove = (e) => {
        let {itemId, idMan} = this.props;
        let item = idMan.getItem(itemId);
        item.onMouseMove(e, 0);
    };

    onMouseUp = (e) => {
        let {itemId, idMan} = this.props;
        let item = idMan.getItem(itemId);
        item.onMouseUp(e);
    };

    render () {
        let {isStretch} = this.props;
        if (this.dontDisplay())
            return null;
        return (
            <div
                id="AdjustmentMove"
                className="AdjustmentItemMoveRoot"
                // onPointerDown={this.onMouseDown}
                // // onMouseMove={this.onMouseMove}
                // onMouseUp={this.onMouseUp}
                draggable={false}
                style={this.props.style}
            >
                <img draggable={false} width={16} height={16} src={require('../icons/move-arrows.svg')} />

                <AdjustmentMove
                    onDragStart={this.onDragStart}
                    onDrag={this.onDrag}
                    onDragStop={this.onDragStop}
                    onClick={this.onClick}
                    cursor={"move"}
                />
            </div>
        )
    }
}

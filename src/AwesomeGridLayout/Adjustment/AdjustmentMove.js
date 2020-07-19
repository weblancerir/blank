import React from "react";
import './Adjustment.css'

export default class AdjustmentMove extends React.Component {
    constructor(props) {
        super(props);
        this.rootDivRef = React.createRef();
    }

    onMouseDown = (e) => {
        let rect = this.rootDivRef.current.getBoundingClientRect();
        if (this.isLeftClick(e) && e.clientX >= rect.left && e.clientX <= rect.left + rect.width &&
            e.clientY >= rect.top && e.clientY <= rect.top + rect.height) {
            e.stopPropagation();
            this.mouseDown = true;
            window.addEventListener("pointermove", this.onMouseMove);
            window.addEventListener("pointerup", this.onMouseUp);
        }
    };

    isLeftClick = (e) => {
        if (e.pointerType === "mouse" && e.button === 0)
            return true;

        return false;
    };

    onMouseMove = (e) => {
        if (!this.mouseDown)
            return;
        e.stopPropagation();

        if (!this.moving) {
            this.moving = true;
            this.onDragStart(e);
        } else {
            this.onDrag(e);
        }
    };

    onMouseUp = (e) => {
        if (!this.mouseDown)
            return;

        this.mouseDown = false;

        if (this.moving) {
            e.stopPropagation();
            this.onDragStop(e);
        } else {
            if (this.props.onClick)
                this.props.onClick(e);
        }

        this.moving = false;

        window.removeEventListener("pointermove", this.onMouseMove);
        window.removeEventListener("pointerup", this.onMouseUp);
    };

    onDragStart = (e) => {
        this.props.onDragStart(e);
    };

    onDrag = (e) => {
        this.props.onDrag(e);
    };

    onDragStop = (e) => {
        if (this.props.onDragStop)
            this.props.onDragStop(e);
    };

    render () {
        return (
            <div
                id="AdjustmentMove"
                className="AdjustmentMoveRoot"
                ref={this.rootDivRef}
                onPointerDown={this.onMouseDown}
                style={{
                    cursor: this.props.cursor || "move"
                }}
            >
            </div>
        )
    }
}

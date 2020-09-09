import React from "react";
import './Adjustment.css';
import classNames from 'classnames';

export default class ResizePanePage extends React.Component {
    onMouseDown = (e) => {
        if (this.isLeftClick(e)) {
            e.stopPropagation();
            e.preventDefault();
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
        }

        this.moving = false;

        window.removeEventListener("pointermove", this.onMouseMove);
        window.removeEventListener("pointerup", this.onMouseUp);
    };

    onDragStart = (e) => {
        this.dragData = {
            lastMouseX: e.clientX,
            lastMouseY: e.clientY
        };
        this.delta = {
            x: 0,
            y: 0,
        };
        this.props.onResizeStart(e, this.props.side, this.delta);
    };

    onDrag = (e) => {
        this.delta.x += (e.clientX - this.dragData.lastMouseX);
        this.delta.y += (e.clientY - this.dragData.lastMouseY);
        this.props.onResize(e, this.props.side, this.delta);
        this.dragData.lastMouseX = e.clientX;
        this.dragData.lastMouseY = e.clientY;
    };

    onDragStop = (e) => {
        this.delta.x += (e.clientX - this.dragData.lastMouseX);
        this.delta.y += (e.clientY - this.dragData.lastMouseY);
        this.props.onResizeStop(e, this.props.side, this.delta);
    };

    isCorner = () => {
        return this.props.side.length === 2;
    };
    render () {
        let classes = classNames(
            `Adjustment-${this.props.side}-pane-page`,
            "Adjustment-Pane"
        );
        let style = {};
        if (this.props.draggingStart)
            style.pointerEvents = "none";

        return (
            <div
                id={this.props.id}
                onPointerDown={this.onMouseDown}
                className={classes}
                style={style}
            >
            </div>
        )
    }
}

import React from "react";
import './Adjustment.css'
import ResizePane from "./ResizePane";
import AdjustmentStretch from "./AdjustmentStretch";
import AdjustmentMove from "./AdjustmentMove";
import {cloneObject} from "../AwesomeGridLayoutUtils";

export default class AdjustmentGroupRect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rect: undefined,
            group: undefined,
            draggingStart: false
        }
    }

    updateRect = (rect, group) => {
        this.setState({rect, group});
    };

    onResizeStart = (e, dir, delta) => {
        if (this.resizing)
            return;
        this.resizing = true;

        this.setState({draggingStart: true});
        this.state.group.forEach(item => {
            item.onResizeStart(e, dir, delta, true);
        });

        let {rect} = this.state;
        this.resizeData = {
            firstX: window.innerWidth - rect.left - rect.right,
            firstY: window.innerHeight - rect.top - rect.bottom,
            firstTop: rect.top,
            firstLeft: rect.left,
        };
    };

    onResize = (e, dir, delta) => {
        this.state.group.forEach(item => {
            item.onResize(e, dir, delta, true);
        });

        let rect = cloneObject(this.state.rect);
        delete rect.height;
        delete rect.width;

        let deltaY = delta.y;
        let deltaX = delta.x;
        if (dir.includes('n')) {
            if (this.resizeData.firstY <= deltaY)
                deltaY = this.resizeData.firstY;
            rect.height = this.resizeData.firstY - deltaY;
            rect.top = this.resizeData.firstTop + deltaY;
        }
        if (dir.includes('s')) {
            if (this.resizeData.firstY <= -deltaY)
                deltaY = -this.resizeData.firstY;
            rect.height = this.resizeData.firstY + deltaY;
        }
        if (dir.includes('e')) {
            if (this.resizeData.firstX <= -deltaX)
                deltaX = -this.resizeData.firstX;
            rect.width = this.resizeData.firstX + deltaX;
        }
        if (dir.includes('w')) {
            if (this.resizeData.firstX <= deltaX)
                deltaX = this.resizeData.firstX;
            rect.width = this.resizeData.firstX - deltaX;
            rect.left = this.resizeData.firstLeft + deltaX;
        }

        if (rect.height)
            rect.bottom = window.innerWidth - rect.top - rect.height;
        if (rect.width)
        rect.right = window.innerWidth - rect.left - rect.width;

        this.setState({rect});
    };

    onResizeStop = (e, dir, delta) => {
        this.state.group.forEach(item => {
            item.onResizeStop(e, dir, delta, true);
        });

        this.resizing = false;

        this.setState({draggingStart: false});
    };

    onDragStart = (e) => {
        this.state.group.forEach(item => {
            item.onDragStart(e, true);
        });
        this.setState({draggingStart: false});

        let {rect} = this.state;

        this.dragData = {
            x: rect.left,
            y: rect.top,
            lastMouseX: e.clientX,
            lastMouseY: e.clientY,
        };
    };

    onDrag = (e) => {
        this.state.group.forEach(item => {
            item.onDrag(e, true);
        });
        this.setState({draggingStart: false});

        let deltaX = (e.clientX - this.dragData.lastMouseX);
        let deltaY = (e.clientY - this.dragData.lastMouseY);
        this.dragData.x += deltaX;
        this.dragData.y += deltaY;
        this.dragData.lastMouseX = e.clientX;
        this.dragData.lastMouseY = e.clientY;

        let rect = cloneObject(this.state.rect);

        rect.top = this.dragData.y;
        rect.left = this.dragData.x;
        rect.right -= deltaX;
        rect.bottom -= deltaY;

        this.setState({rect});
    };

    onDragStop = (e) => {
        this.state.group.forEach(item => {
            item.onDragStop(e, true);
        });
        this.setState({draggingStart: false});
    };

    render () {
        let {rect} = this.state;
        if (!rect)
            return null;

        return (
            <div
                id="AdjustmentGroupRect"
                style={rect}
                className="AdjustmentResizeRoot"
            >
                {
                    ['n','s','e','w','ne','nw','se','sw'].map((side, index) => {
                        return <ResizePane
                            key={index}
                            side={side}
                            onResizeStart={this.onResizeStart}
                            onResize={this.onResize}
                            onResizeStop={this.onResizeStop}
                            draggingStart={this.state.draggingStart}
                        />
                    })
                }

                {/*<AdjustmentMove*/}
                    {/*key={`${this.props.id}_move`}*/}
                    {/*onDragStart={this.onDragStart}*/}
                    {/*onDrag={this.onDrag}*/}
                    {/*onDragStop={this.onDragStop}*/}
                {/*/>*/}
            </div>
        )
    }
}

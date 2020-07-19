import React from "react";
import "./StackSpacer.css";
import AdjustmentMove from "../../Adjustment/AdjustmentMove";
import StackSpacerResizer from "./StackSpacerResizer";

export default class StackSpacer extends React.PureComponent{
    constructor() {
        super();

        this.state = {
            pointerEvents: "auto"
        }
    }

    componentDidMount(){
        this.mounted = true;
    }

    componentWillUnmount(){
        this.mounted = false;
    }

    setPointerEvents = (pointerEvents) => {
        this.mounted && this.setState({pointerEvents});
    };

    updateSpacerData = (newHeight) => {
        this.props.spacerData.height = newHeight;
        this.props.stack.props.select.updateSize();
        this.forceUpdate();
    };

    onClick = (e) => {
        this.props.aglRef.current.onSelect(true);
    };

    onDragStart = (e) => {
        if (this.props.onDragStart)
            this.props.onDragStart(e);

        this.dragData = {
            lastMouseX: e.clientX,
            lastMouseY: e.clientY,
            firstHeight: this.props.spacerData.height
        };
    };

    onDrag = (e) => {
        e.preventDefault();
        let deltaY = (e.clientY - this.dragData.lastMouseY);
        let newHeight = this.dragData.firstHeight + deltaY;

        newHeight = Math.max(0, newHeight);
        this.updateSpacerData(newHeight);
    };

    onDragStop = (e) => {
        if (this.props.onDragStop)
            this.props.onDragStop(e);
    };

    render() {
        return (
            <div
                className="StackSpacerRoot"
                style={{
                    height: `${this.props.spacerData.height}px`,
                    order: this.props.order,
                    pointerEvents: this.state.pointerEvents
                }}
                onClick={this.onClick}
                onMouseOver={this.props.onMouseOver}
                onMouseEnter={this.props.onMouseEnter}
                onMouseOut={this.props.onMouseOut}
            >

                <StackSpacerResizer
                    onDragStart={this.onDragStart}
                    onDrag={this.onDrag}
                    onDragStop={this.onDragStop}
                    cursor={"ns-resize"}
                />

                {
                    this.props.aglRef.current.getSize(false).width > 150 &&
                    <p
                        className="StackSpacerText"
                    >
                        Spacer
                    </p>
                }

                <p
                    className="StackSpacerSizeText"
                >
                    {`${this.props.spacerData.height.toFixed(0)}px`}
                </p>

                <AdjustmentMove
                    onDragStart={this.onDragStart}
                    onDrag={this.onDrag}
                    onDragStop={this.onDragStop}
                    onClick={this.onClick}
                    cursor={"ns-resize"}
                />
            </div>
        )
    }
}

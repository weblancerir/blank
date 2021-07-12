import React from "react";
import "./StackSpacer.css";
import AdjustmentMove from "../../Adjustment/AdjustmentMove";
import StackSpacerResizer from "./StackSpacerResizer";
import {EditorContext} from "../../Editor/EditorContext";

export default class StackSpacer extends React.PureComponent{
    static contextType = EditorContext;
    constructor(props) {
        super(props);

        this.state = {
            pointerEvents: "auto"
        }

        this.id = props.stackId + "_" + props.index;
        console.log("constructor", this.id);
        props.idMan.setItem(this.id, this);
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

    updateSpacerData = (newHeight, firstHeight, fromUndoRedo) => {
        if (!fromUndoRedo) {
            let oldHeight = firstHeight;
            let id = this.id;
            console.log("updateSpacerData", id, newHeight);
            this.props.undoredo.add((idMan) => {
                let spacer = idMan.getItem(id);
                spacer.updateSpacerData(newHeight, undefined, true);
            }, (idMan) => {
                console.log("updateSpacerData back", id, oldHeight);
                let spacer = idMan.getItem(id);
                spacer.updateSpacerData(oldHeight, undefined, true);
            });
        }
        this.props.spacerData.height = newHeight;
        this.props.onSpacerUpdate(this.props.spacerData, this.props.index);
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
        this.updateSpacerData(newHeight, this.dragData.firstHeight, true);
    };

    onDragStop = (e) => {
        let deltaY = (e.clientY - this.dragData.lastMouseY);
        let newHeight = this.dragData.firstHeight + deltaY;
        newHeight = Math.max(0, newHeight);
        this.updateSpacerData(newHeight, this.dragData.firstHeight);

        if (this.props.onDragStop)
            this.props.onDragStop(e);
    };

    render() {
        return (
            <div
                className={this.context.isEditor()? "StackSpacerRoot": "StackSpacerRootNone"}
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

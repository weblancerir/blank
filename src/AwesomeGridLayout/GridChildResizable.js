import React from "react";
import {Resizable} from "re-resizable";
import GridChildContent from "./GridChildContent";

export default class GridChildResizable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.childContainer.griddata.resized) {
            delete nextProps.childContainer.griddata.resized;
            return true;
        }

        if (nextProps.childContainer.griddata.selected !==
            this.props.childContainer.griddata.selected) {
            return true;
        }
        if (nextProps.childContainer.griddata.isContainer !==
            this.props.childContainer.griddata.isContainer) {
            return true;
        }

        return (
            nextProps.childContainer.resizable !== this.props.childContainer.resizable ||
            nextProps.childContainer.w !== this.props.childContainer.w ||
            nextProps.childContainer.h !== this.props.childContainer.h ||
            nextProps.childContainer.isContainer !== this.props.childContainer.isContainer ||
            nextProps.childContainer.selected !== this.props.childContainer.selected ||
            nextProps.childContainer.isDummy !== this.props.childContainer.isDummy ||
            nextProps.childContainer.griddata.id !== this.props.childContainer.griddata.id
        );
    }

    getChildResizeHandles = () => {
        return {
            top:true,
            right:true,
            bottom:true,
            left:true,
            topRight:true,
            bottomRight:true,
            bottomLeft:true,
            topLeft:true
        };
    };

    render () {
        let {childContainer, childResizeStart, childResize, childResizeStop} = this.props;
        return (
            <Resizable
                id="resizable"
                enable={!childContainer.griddata.resizable ? false :
                    this.getChildResizeHandles()}
                size={{
                    width: childContainer.w,
                    height: childContainer.h,
                }}
                onResizeStart={
                    (e, dir, refToElement) =>
                        childResizeStart(e, dir, refToElement, childContainer)}
                onResize={
                    (e, dir, refToElement, delta) =>
                        childResize(e, dir, refToElement, delta, childContainer)}
                onResizeStop={
                    (e, dir, refToElement, delta) =>
                        childResizeStop(e, dir, refToElement, delta, childContainer)}
                key={childContainer.griddata.id}
                handleStyles={{
                    right: {
                        position:"absolute",
                        right: 0
                    },
                    left: {
                        position:"absolute",
                        left: 0
                    },
                    bottom: {
                        position:"absolute",
                        bottom: 0
                    },
                    top: {
                        position:"absolute",
                        top: 0
                    },
                    topRight: {
                        position:"absolute",
                        top: 0,
                        right: 0
                    },
                    bottomRight: {
                        position:"absolute",
                        bottom: 0,
                        right: 0
                    },
                    bottomLeft: {
                        position:"absolute",
                        bottom: 0,
                        left: 0
                    },
                    topLeft: {
                        position:"absolute",
                        top: 0,
                        left: 0
                    }
                }}
            >
                <GridChildContent childContainer={childContainer}/>
            </Resizable>
        )
    }
}

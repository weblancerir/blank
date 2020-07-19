import React from "react";
import {cloneObject, shallowEqual} from "./AwesomeGridLayoutUtils";
import './GridChildDraggable.css';

export default class GridChildContainerChildren extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!shallowEqual(this.allChildId, Object.keys(nextProps.allChildren)) ||
            !shallowEqual(this.allChildIndex.toString(),
                Object.values(nextProps.allChildren).map(c => c.zIndex)).toString()
        )
            return true;
        return false;
    }

    saveState = () => {
        let {allChildren} = this.props;
        this.allChildId = Object.keys(allChildren);
        this.allChildIndex = Object.values(allChildren).map(c => c.zIndex);
    };

    getSorted = (children) => {
        return children.sort((a, b) => {
            if (a.zIndex > b.zIndex)
                return 1;
            if (a.zIndex < b.zIndex)
                return -1;

            return 0;
        })
    };

    getChildren = (allChildren, agl) => {
        if (this.props.getChildrenOverride)
            return this.props.getChildrenOverride(this.getSorted(Object.values(allChildren)), agl);

        return this.getSorted(Object.values(allChildren)).map((child) => {
            return child.child;
        })
    };

    render () {
        this.saveState();
        let {allChildren, agl} = this.props;
        return (
            this.getChildren(allChildren, agl)
        )
    }
}

import React from "react";
import './GridChildDraggable.css';

export default class GridChildContainerFixedHolder extends React.Component {
    render () {
        let {size, id} = this.props;
        return (
            <div
                className="fixed-holder"
                style={{
                    top: size? size.top: 0,
                    left: size? size.left: 0,
                    width: size? size.clientWidth || size.width: 0,
                    height: size? size.clientHeight || size.height: 0,
                }}
                id={`${id}_fixed_holder`}
            >

            </div>
        )
    }
}

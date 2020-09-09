import React from "react";
import './Adjustment.css'

export default class GridLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render () {
        let {id, lineRef, style} = this.props;
        return (
            <div
                className={this.props.className}
                id={id}
                ref={lineRef}
                style={style}
            />
        )
    }
}

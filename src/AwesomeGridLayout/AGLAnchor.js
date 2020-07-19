import React from "react";
import './AwesomeGridLayout.css';

export default class AGLAnchor extends React.Component {
    render () {
        let {anchor} = this.props;

        if (!anchor)
            return null;

        return (
            <div
                className="AGLAnchor"
                id={anchor.id}
            >
            </div>
        )
    }
}

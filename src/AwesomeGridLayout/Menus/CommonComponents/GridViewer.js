import React from "react";
import './CommonMenu.css';
import classNames from "classnames";

export default class GridViewer extends React.Component {
    render () {
        let classes = classNames(
            "GridViewerRoot",
            this.props.className
        );
        return (
            <div className={classes}>
                {this.props.children}
            </div>
        )
    }
}

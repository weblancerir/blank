import React from "react";
import {EditorContext} from "../../Editor/EditorContext";
import './MenuTree.css';

export default class MenuTreeOrderer extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            hover: false
        }
    }

    onDragOver = (e) => {
        this.setState({hover: true});
        this.props.onDragOver(e);
    }

    onDragLeave = (e) => {
        this.setState({hover: false});
    }

    render () {
        let className = "MenuTreeOrdererRoot";
        if (this.state.hover) className += " MenuTreeOrdererRootDropOver";
        return (
            <div className={className}
                 onDragOver={this.onDragOver}
                 onDragLeave={this.onDragLeave}
                 onClick={this.onDragLeave}
                 onDrop={this.props.onDrop}
            >
            </div>
        )
    }
}

import React from "react";
export default class AnimationHolder extends React.Component {
    render () {
        return this.props.children;
        if (!this.props.disabled)
            return this.props.children;
        else
            return (
                <div
                    className={this.props.className}
                    id={this.props.id}
                    ref={this.props.transformRef}
                >
                    {this.props.children}
                </div>
            )
    }
}

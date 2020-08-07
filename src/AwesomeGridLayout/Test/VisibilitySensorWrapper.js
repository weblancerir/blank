import React from "react";
import VisibilitySensor from "react-visibility-sensor";
export default class VisibilitySensorWrapper extends React.Component {
    render () {
        if (!this.props.animation)
            return this.props.children;
        else
            return (
                <VisibilitySensor
                    partialVisibility onChange={(v) => {
                        if (this.props.animation.name &&
                            (this.props.animation.options && this.props.animation.options.once)
                            && v) {
                            !this.props.editor && this.props.playAnimation(true);
                            return;
                        }

                        if (this.props.animation.name && v)
                            !this.props.editor && this.props.playAnimation();
                    }}
                    containment={this.props.select.getPageOverflowRef()}
                    active={this.props.animation.name && !this.props.disableVS}
                >
                    {this.props.children}
                </VisibilitySensor>
            )
    }
}

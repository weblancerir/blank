import React from "react";
import {cloneObject, shallowEqual} from "./AwesomeGridLayoutUtils";
import './GridChildDraggable.css';
import VisibilitySensor from "react-visibility-sensor";
import classNames from "classnames";

export default class AnimationHolder extends React.Component {

    render () {
        let TagAs = this.props.as || "div";
        if (!this.props.animation) {
            return (
                <TagAs
                    onMouseDown={this.props.onMouseDown}
                    onMouseOver={this.props.onMouseOver}
                    onMouseEnter={this.props.onMouseEnter}
                    onMouseOut={this.props.onMouseOut}
                    id={this.props.id}
                    className={this.props.classes}
                    style={this.props.runtimeStyle}
                    ref={this.props.rootDivRef}
                    key={this.props.id}
                >
                    {this.props.children}
                </TagAs>
            )
        } else {
            let ParClasses = classNames(
                this.props.gridItemStyleId,
                this.props.styleId,
                this.props.animationCSS,
            );
            return (
                <div
                    className={ParClasses}
                    style={{...{
                            pointerEvents: "auto"
                        }, ...this.props.runtimeStyle
                    }}
                    onMouseDown={this.props.onMouseDown}
                    onMouseOver={this.props.onMouseOver}
                    onMouseEnter={this.props.onMouseEnter}
                    onMouseOut={this.props.onMouseOut}
                    onAnimationEnd={this.props.onAnimationEnd}
                    ref={this.props.rootDivRef}
                >
                    <TagAs
                        id={this.props.id}
                        className={this.props.classes}
                        style={{
                            width: "100%",
                            height: "100%"
                        }}
                        key={this.props.forceKey || this.props.id}
                    >
                        {this.props.children}
                    </TagAs>
                </div>
            )
        }
    }
}

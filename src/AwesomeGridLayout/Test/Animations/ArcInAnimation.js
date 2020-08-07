import {css, StyleSheet} from "aphrodite";
import React from "react";
import DropDown from "../../Menus/CommonComponents/DropDown";

let ArcInAnimation = {};

ArcInAnimation.getOptions = (props) => {
    let {animation, onDesignChange, designKey} = props;
    let options = animation.options || {};
    return (
        <div className="MenuOptionAnimationRoot">
            <p className="MenuOptionSectionTitle">Direction</p>

            <DropDown
                options={[
                    'From left',
                    'From right',
                ]}
                onChange={(v) => {
                    onDesignChange(`${designKey}.direction`, v);
                }}
                value={options.direction || 'From right'}
                spanStyle={{
                    width: "100%",
                    fontSize: 14,
                }}
            />
        </div>
    )
};

ArcInAnimation.getAnimationCSS = (item, options = {}) => {
    let {direction, duration, delay} = options;
    direction = direction || 'From right';

    let animationName = {};
    animationName['0%'] = {
        opacity: 0,
        transform: `perspective(400px) scale(0) rotateY(${
            direction.includes('left') ? '-' : ''
            }180deg) translateZ(600px)`
    };
    animationName['100%'] = {
        opacity: 1,
        transform: `perspective(400px) scale(1) rotateY(0deg) translateZ(0px)`
    };

    let animationStyles = StyleSheet.create({
        arcIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            animationTimingFunction: 'linear',
            // TODO other options here
        }
    });

    return css(animationStyles.arcIn);
};

ArcInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default ArcInAnimation;

import {css, StyleSheet} from "aphrodite";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";

let FloatInAnimation = {};

FloatInAnimation.getOptions = (props) => {
    let {animation, onDesignChange, designKey} = props;
    let options = animation.options || {};
    return (
        <div className="MenuOptionAnimationRoot">
            <p className="MenuOptionSectionTitle">Direction</p>

            <DropDown
                options={[
                    'From top',
                    'From left',
                    'From bottom',
                    'From right',
                ]}
                onChange={(v) => {
                    onDesignChange(`${designKey}.direction`, v);
                }}
                value={options.direction || 'From left'}
                spanStyle={{
                    width: "100%",
                    fontSize: 14,
                }}
            />
        </div>
    )
};

FloatInAnimation.getAnimationCSS = (item, options = {}) => {
    let {direction, duration, delay} = options;
    direction = direction || 'From left';

    let animationName = {};
    animationName['0%'] = {
        opacity: 0,
        transform: `translate3d(${
                direction.includes('left')? '-20%': direction.includes('right')? '20%': 0
            }, ${
                direction.includes('top')? '-20%': direction.includes('bottom')? '20%': 0
            }, 0)`
    };
    animationName['100%'] = {
        opacity: 1,
        transform: `translate3d(0,0,0)`
    };

    let animationStyles = StyleSheet.create({
        floatIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.floatIn);
};

FloatInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default FloatInAnimation;

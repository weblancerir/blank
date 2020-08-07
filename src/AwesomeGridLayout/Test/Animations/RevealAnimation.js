import {css, StyleSheet} from "aphrodite";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";
import PuffInAnimation from "./PuffInAnimation";

let RevealAnimation = {};

RevealAnimation.getOptions = (props) => {
    let {animation, onDesignChange, designKey} = props;
    let options = animation.options || {};
    return (
        <div className="MenuOptionAnimationRoot">
            <p className="MenuOptionSectionTitle">Direction</p>

            <DropDown
                options={[
                    'From center',
                    'From top',
                    'From left',
                    'From bottom',
                    'From right',
                ]}
                onChange={(v) => {
                    onDesignChange(`${designKey}.direction`, v);
                }}
                value={options.direction || 'From center'}
                spanStyle={{
                    width: "100%",
                    fontSize: 14,
                }}
            />
        </div>
    )
};

RevealAnimation.getAnimationCSS = (item, options = {}) => {
    let {direction, duration, delay} = options;
    direction = direction || 'From center';

    let animationName = {};
    switch (direction) {
        case 'From center':
            animationName['0%'] = {
                opacity: 1,
                clipPath: `polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)`,
            };
            break;
        case 'From left':
            animationName['0%'] = {
                opacity: 1,
                clipPath: `polygon(0 0, 0 0, 0 100%, 0 100%)`,
            };
            break;
        case 'From right':
            animationName['0%'] = {
                opacity: 1,
                clipPath: `polygon(100% 0, 100% 0, 100% 100%, 100% 100%)`,
            };
            break;
        case 'From top':
            animationName['0%'] = {
                opacity: 1,
                clipPath: `polygon(0 0, 0 100%, 0 100%, 0 0)`,
            };
            break;
        case 'From bottom':
            animationName['0%'] = {
                opacity: 1,
                clipPath: `polygon(0 100%, 100% 100%, 100% 100%, 0 100%)`,
            };
            break;
    }
    animationName['100%'] = {
        opacity: 1,
        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
    };

    let animationStyles = StyleSheet.create({
        reveal: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.reveal);
};

RevealAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default RevealAnimation;

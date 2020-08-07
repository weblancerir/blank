import {css, StyleSheet} from "aphrodite";
import ArcInAnimation from "./ArcInAnimation";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";

let ExpandInAnimation = {};

ExpandInAnimation.getOptions = (props) => {
    let {animation, onDesignChange, designKey} = props;
    let options = animation.options || {};
    return (
        <div className="MenuOptionAnimationRoot">
            <p className="MenuOptionSectionTitle">Power</p>

            <DropDown
                options={[
                    'Soft',
                    'Medium',
                    'Hard'
                ]}
                onChange={(v) => {
                    onDesignChange(`${designKey}.power`, v);
                }}
                value={options.power || 'Hard'}
                spanStyle={{
                    width: "100%",
                    fontSize: 14,
                }}
            />
        </div>
    )
};

ExpandInAnimation.getAnimationCSS = (item, options = {}) => {
    let {power, duration, delay} = options;
    power = power || 'Hard';

    let animationName = {};
    animationName["0%"] = {
        opacity: 0,
        transform: `scale3d(${
                power === "Hard"? '0.2': power === "Medium"? '0.5': '0.8'
            }, ${
                power === "Hard"? '0.2': power === "Medium"? '0.5': '0.8'
            }, 0)`
    };
    animationName["100%"] = {
        opacity: 1,
        transform: 'scale3d(1,1,1)'
    };

    let animationStyles = StyleSheet.create({
        expandIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.expandIn);
};

ExpandInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default ExpandInAnimation;

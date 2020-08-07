import {css, StyleSheet} from "aphrodite";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";
import FoldInAnimation from "./FoldInAnimation";

let PuffInAnimation = {};

PuffInAnimation.getOptions = (props) => {
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

PuffInAnimation.getAnimationCSS = (item, options = {}) => {
    let {power, duration, delay} = options;
    power = power || 'Hard';

    let animationName = {};
    animationName['0%'] = {
        opacity: 0,
        transform: `perspective(400px) translateZ(${
            power === "Hard"? 400: power === "Medium"? 200: 100
            }px)`
    };
    animationName['100%'] = {
        opacity: 1,
        transform: `perspective(400px) translateZ(0)`
    };

    let animationStyles = StyleSheet.create({
        puffIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.puffIn);
};

PuffInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default PuffInAnimation;

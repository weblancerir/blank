import {css, StyleSheet} from "aphrodite";
import ArcInAnimation from "./ArcInAnimation";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";

let FadeInAnimation = {};

FadeInAnimation.getOptions = (props) => {
    return null;
};

FadeInAnimation.getAnimationCSS = (item, options = {}) => {
    let {duration, delay} = options;
    let animationStyles = StyleSheet.create({
        fadeIn: {
            animationName: {
                "0%": {
                    opacity: 0
                },
                "100%": {
                    opacity: 1
                }
            },
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.fadeIn);
};

FadeInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default FadeInAnimation;

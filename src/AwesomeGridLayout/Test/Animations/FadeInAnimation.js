import {css, StyleSheet} from "aphrodite";

let FadeInAnimation = {};

FadeInAnimation.getAnimationCSS = (item, options = {}) => {
    let compositeDesign = item.getCompositeFromData("design") || {};

    let animationStyles = StyleSheet.create({
        fadeIn: {
            animationName: {
                "0%": {
                    opacity: 0
                },
                "100%": {
                    opacity: `${compositeDesign.opacity || "1"}`
                }
            },
            animationDuration: `${options.duration || "1s"}`,
            // TODO other options here
        }
    });

    return css(animationStyles.fadeIn);
};

FadeInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default FadeInAnimation;

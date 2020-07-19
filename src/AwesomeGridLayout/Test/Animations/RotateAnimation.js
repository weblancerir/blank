import {css, StyleSheet} from "aphrodite";

let RotateAnimation = {};

RotateAnimation.getAnimationCSS = (item, options = {}) => {
    let compositeTransform = item.getCompositeFromData("transform") || {};
    let compositeDesign = item.getCompositeFromData("design") || {};

    let animationStyles = StyleSheet.create({
        rotate: {
            animationName: {
                "0%": {
                    opacity: 0,
                    transform: `rotate(${((compositeTransform.rotateDegree || 0) - 360)}deg) scale(0)`
                },
                "100%": {
                    opacity: `${compositeDesign.opacity || "1"}`,
                    transform: `rotate(${(compositeTransform.rotateDegree || 0)}deg) scale(1)`
                }
            },
            animationDuration: `${options.duration || "1s"}`,
            // TODO other options here
        }
    });

    return css(animationStyles.rotate);
};

RotateAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default RotateAnimation;

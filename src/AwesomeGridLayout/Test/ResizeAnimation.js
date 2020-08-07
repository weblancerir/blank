import {css, StyleSheet} from "aphrodite";

let ResizeAnimation = {};

ResizeAnimation.getAnimationCSS = (w1, w2, h1, h2) => {

    let animationStyles = StyleSheet.create({
        resize: {
            animationName: {
                "0%": {
                    width: w2,
                    height: h2
                },
                "100%": {
                    width: w2,
                    height: h2
                }
            },
            animationDuration: "99s",
            animationTimingFunction: "steps(99, end)"
        }
    });

    return {css: css(animationStyles.resize), style: {
        animationName: `${animationStyles.resize._name} !important`,
        animationDuration: "99s",
        animationTimingFunction: "steps(99, end) !important"
    }};
};

export default ResizeAnimation;

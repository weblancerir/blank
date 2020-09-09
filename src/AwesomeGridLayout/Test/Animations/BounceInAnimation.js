import {css, StyleSheet} from "aphrodite";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";

let BounceInAnimation = {};

BounceInAnimation.getOptions = (props) => {
    let {animation, onDesignChange, designKey} = props;
    let options = animation.options || {};
    return (
        <div className="MenuOptionAnimationRoot">
            <p className="MenuOptionSectionTitle">Direction</p>

            <DropDown
                options={[
                    'From center',
                    'From top left',
                    'From top right',
                    'From bottom left',
                    'From bottom right'
                ]}
                onChange={(v) => {
                    onDesignChange(`${designKey}.direction`, v);
                }}
                value={options.direction || 'From top left'}
                spanStyle={{
                    width: "100%",
                    fontSize: 14,
                }}
            />
        </div>
    )
};

BounceInAnimation.getAnimationCSS = (item, options = {}) => {
    let {direction, duration, delay} = options;
    direction = direction || 'From top left';

    let animationName = {};
    animationName['0%'] = {
        opacity: 0,
        transform: `scale3d(0, 0, 0) translate3d(${
                direction.includes('center')? '0': direction.includes('left')? '-100%': direction.includes('right')?
                    '100%': '0'
            }, ${
                direction.includes('center')? '0': direction.includes('top')? '-100%': direction.includes('bottom')?
                    '100%': '0'
            }, 0)`
    };
    animationName['20%'] = {
        opacity: 0.33,
        transform: `scale3d(1.1, 1.1, 1.1) translate3d(${
            direction.includes('center')? '0': direction.includes('left')? '7%': direction.includes('right')?
                '-7%': '0'
            }, ${
            direction.includes('center')? '0': direction.includes('top')? '7%': direction.includes('bottom')?
                '-7%': '0'
            }, 0)`
    };
    animationName['40%'] = {
        opacity: 0.66,
        transform: `scale3d(0.9, 0.9, 0.9) translate3d(${
            direction.includes('center')? '0': direction.includes('left')? '-5%': direction.includes('right')?
                '5%': '0'
            }, ${
            direction.includes('center')? '0': direction.includes('top')? '-5%': direction.includes('bottom')?
                '5%': '0'
            }, 0)`
    };
    animationName['60%'] = {
        opacity: 1,
        transform: `scale3d(1.03, 1.03, 1.03) translate3d(${
            direction.includes('center')? '0': direction.includes('left')? '3%': direction.includes('right')?
                '-3%': '0'
            }, ${
            direction.includes('center')? '0': direction.includes('top')? '3%': direction.includes('bottom')?
                '-3%': '0'
            }, 0)`
    };
    animationName['80%'] = {
        opacity: 1,
        transform: `scale3d(0.97, 0.97, 0.97) translate3d(${
            direction.includes('center')? '0': direction.includes('left')? '-1%': direction.includes('right')?
                '1%': '0'
            }, ${
            direction.includes('center')? '0': direction.includes('top')? '-1%': direction.includes('bottom')?
                '1%': '0'
            }, 0)`
    };
    animationName['100%'] = {
        opacity: 1,
        transform: `scale3d(1, 1, 1)`
    };

    let animationStyles = StyleSheet.create({
        bounceIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.bounceIn);
};

BounceInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default BounceInAnimation;

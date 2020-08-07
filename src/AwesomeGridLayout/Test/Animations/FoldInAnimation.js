import {css, StyleSheet} from "aphrodite";
import ArcInAnimation from "./ArcInAnimation";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";

let FoldInAnimation = {};

FoldInAnimation.getOptions = (props) => {
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

FoldInAnimation.getAnimationCSS = (item, options = {}) => {
    let {direction, duration, delay} = options;
    direction = direction || 'From left';

    let animationName = {};
    animationName['0%'] = {
        opacity: 0,
        transform: `perspective(400px) rotateY(${
                direction.includes('left')? 90: direction.includes('right')? -90: 0
            }deg) rotateX(${
                direction.includes('top')? -90: direction.includes('bottom')? 90: 0
            }deg)`,
        transformOrigin: `${
            direction.includes('left')? 'left': direction.includes('right')? 'right': 'center'
            } ${
            direction.includes('top')? 'top': direction.includes('bottom')? 'bottom': 'center'
            } 0`,
    };
    animationName['100%'] = {
        opacity: 1,
        transform: `perspective(400px) rotateY(0deg) rotateX(0deg)`,
        transformOrigin: `${
            direction.includes('left')? 'left': direction.includes('right')? 'right': 'center'
            } ${
            direction.includes('top')? 'top': direction.includes('bottom')? 'bottom': 'center'
            } 0`,
    };

    let animationStyles = StyleSheet.create({
        foldIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.foldIn);
};

FoldInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default FoldInAnimation;

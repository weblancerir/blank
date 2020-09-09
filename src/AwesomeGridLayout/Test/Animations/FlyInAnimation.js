import {css, StyleSheet} from "aphrodite";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";

let FlyInAnimation = {};

FlyInAnimation.getOptions = (props) => {
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
                    'From top left',
                    'From top right',
                    'From bottom left',
                    'From bottom right',
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

FlyInAnimation.getAnimationCSS = (item, options = {}) => {
    let size = item.getSize(true);
    let windowSize = {
        width: item.props.breakpointmanager.getWindowWidth(),
        height: item.props.breakpointmanager.getWindowHeight(),
    };
    let {direction, duration, delay} = options;
    direction = direction || 'From top left';

    let animationName = {};
    animationName['0%'] = {
        opacity: 0,
        transform: `translate3d(${
                direction.includes('left')? `${-size.left}px`: direction.includes('right')? `${
                    windowSize.width - size.left - size.width
                }px`: 0
            }, ${
                direction.includes('top')? `${-size.top}px`: direction.includes('bottom')? `${
                    windowSize.height - size.top - size.height
                }px`: 0
            }, 0)`
    };
    animationName['100%'] = {
        opacity: 1,
        transform: `translate3d(0,0,0)`
    };

    let animationStyles = StyleSheet.create({
        flyIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.flyIn);
};

FlyInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default FlyInAnimation;

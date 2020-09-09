import {css, StyleSheet} from "aphrodite";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";

let TurnInAnimation = {};

TurnInAnimation.getOptions = (props) => {
    let {animation, onDesignChange, designKey} = props;
    let options = animation.options || {};
    return (
        <div className="MenuOptionAnimationRoot">
            <p className="MenuOptionSectionTitle">Direction</p>

            <DropDown
                options={[
                    'From left',
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

TurnInAnimation.getAnimationCSS = (item, options = {}) => {
    let size = item.getSize(true);
    let viewSize = item.props.viewRef.current.getSize(false);
    let windowSize = {
        width: item.props.breakpointmanager.getWindowWidth(),
        height: item.props.breakpointmanager.getWindowHeight(),
    };
    let {direction, duration, delay} = options;
    direction = direction || 'From left';

    let animationName = {};
    animationName['0%'] = {
        opacity: 0,
        transform: `translate3d(${
            direction.includes('left')? `${
                -(size.left - viewSize.left)
                }px`: `${
            windowSize.width - (size.left - viewSize.left) - size.width
                }px`
            }, -200%, 0) rotate(${
            direction.includes('left')? '-45': '45'
            }deg) `
    };
    animationName['30%'] = {
        opacity: 0.3,
        transform: `translate3d(${
            direction.includes('left')? `${
            -(size.left - viewSize.left) * 0.7
                }px`: `${
            (windowSize.width - (size.left - viewSize.left) - size.width) * 0.7
                }px`
            }, -${200*0.85}%, 0) rotate(${
            direction.includes('left')? -45 * 0.7: 45 * 0.7
            }deg) `
    };
    animationName['60%'] = {
        opacity: 0.6,
        transform: `translate3d(${
            direction.includes('left')? `${
            -(size.left - viewSize.left) * 0.4
                }px`: `${
            (windowSize.width - (size.left - viewSize.left) - size.width) * 0.4
                }px`
            }, -${200*0.55}%, 0) rotate(${
            direction.includes('left')? -45 * 0.4: 45 * 0.4
            }deg) `
    };
    animationName['100%'] = {
        opacity: 1,
        transform: `translate3d(0,0,0) rotate(0deg) `
    };

    let animationStyles = StyleSheet.create({
        turnIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            animationTimingFunction: 'linear',
            // TODO other options here
        }
    });

    return css(animationStyles.turnIn);
};

TurnInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default TurnInAnimation;

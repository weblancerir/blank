import {css, StyleSheet} from "aphrodite";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";
import Divider from "../../Menus/CommonComponents/Divider";
import SliderInput from "../../Menus/CommonComponents/SliderInput";

let SpinInAnimation = {};

SpinInAnimation.getOptions = (props) => {
    let {animation, onDesignChange, designKey} = props;
    let options = animation.options || {};
    return (
        <>
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

            <Divider/>

            <div className="MenuOptionAnimationRoot">
                <p className="MenuOptionSectionTitle">Direction</p>

                <DropDown
                    options={[
                        'Clockwise',
                        'Counter clockwise',
                    ]}
                    onChange={(v) => {
                        onDesignChange(`${designKey}.direction`, v);
                    }}
                    value={options.direction || 'Clockwise'}
                    spanStyle={{
                        width: "100%",
                        fontSize: 14,
                    }}
                />
            </div>

            <Divider/>

            <div className="MenuOptionAnimationRoot">
                <p className="MenuOptionSectionTitle">Spin number</p>

                <div
                    className="BorderWidth"
                >
                    <SliderInput
                        className="BorderWidthSlider"
                        min={0}
                        max={15}
                        step={0.1}
                        value={options.spinNo || 2}
                        designKey={`${designKey}.spinNo`}
                        onDesignChange={onDesignChange}
                    />
                </div>
            </div>
        </>
    )
};

SpinInAnimation.getAnimationCSS = (item, options = {}) => {
    let {power, direction, spinNo, duration, delay} = options;
    power = power || 'Hard';
    direction = direction || 'Clockwise';
    spinNo = spinNo || 2;

    let animationName = {};
    let firstRotate = 360 * spinNo * (direction === 'Clockwise'? -1: 1);
    animationName["0%"] = {
        opacity: 0,
        transform: `rotate(${firstRotate}deg) scale3d(${
                power === "Hard"? '0.3': power === "Medium"? '0.6': '1'
            }, ${
                power === "Hard"? '0.3': power === "Medium"? '0.6': '1'
            }, 1)`
    };
    animationName["100%"] = {
        opacity: 1,
        transform: 'rotate(0deg) scale3d(1,1,1)'
    };

    let animationStyles = StyleSheet.create({
        spinIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.spinIn);
};

SpinInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default SpinInAnimation;

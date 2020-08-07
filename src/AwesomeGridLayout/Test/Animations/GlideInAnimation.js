import {css, StyleSheet} from "aphrodite";
import ArcInAnimation from "./ArcInAnimation";
import DropDown from "../../Menus/CommonComponents/DropDown";
import React from "react";
import SliderInput from "../../Menus/CommonComponents/SliderInput";
import Angle from "../../Menus/CommonComponents/Angle";
import Divider from "../../Menus/CommonComponents/Divider";

let GlideInAnimation = {};

GlideInAnimation.getOptions = (props) => {
    let {animation, onDesignChange, designKey} = props;
    let options = animation.options || {};
    return (
        <>
            <div className="MenuOptionSection">
                <p className="MenuOptionSectionTitle">Angle</p>

                <Angle
                    className="ShadowAngle"
                    angle={options.angle || 90}
                    onChange={(d) => {
                        onDesignChange(`${designKey}.angle`, d);
                    }}
                />
            </div>

            <Divider/>

            <div className="MenuOptionSection">
                <p className="MenuOptionSectionTitle">Distance</p>

                <div
                    className="BorderWidth"
                >
                    <SliderInput
                        className="BorderWidthSlider"
                        min={0}
                        max={300}
                        value={options.distance || 100}
                        designKey={`${designKey}.distance`}
                        onDesignChange={onDesignChange}
                    />
                </div>
            </div>
        </>
    )
};

GlideInAnimation.getAnimationCSS = (item, options = {}) => {
    let {distance, angle, duration, delay} = options;
    distance = distance || 100;
    angle = angle || 90;

    let animationName = {};
    let tx = - distance * Math.sin(angle * Math.PI / 180);
    let ty = distance * Math.cos(angle * Math.PI / 180);
    animationName['0%'] = {
        opacity: 1,
        transform: `translate3d(${tx}px, ${ty}px, 0)`
    };
    animationName['100%'] = {
        opacity: 1,
        transform: `translate3d(0,0,0)`
    };

    let animationStyles = StyleSheet.create({
        glideIn: {
            animationName: animationName,
            animationDuration: `${duration || 1}s`,
            animationDelay: `${delay || 0}s`,
            // TODO other options here
        }
    });

    return css(animationStyles.glideIn);
};

GlideInAnimation.onAnimationEnd = (item) => {
    // TODO
};

export default GlideInAnimation;

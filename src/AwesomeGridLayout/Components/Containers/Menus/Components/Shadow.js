import React from "react";
import '../../../../Menus/Menu.css';
import '../style.css';
import Angle from "../../../../Menus/CommonComponents/Angle";
import Divider from "../../../../Menus/CommonComponents/Divider";
import SliderInput from "../../../../Menus/CommonComponents/SliderInput";
import ColorPicker from "../../../../Menus/CommonComponents/ColorPicker";

const deg2rad = Math.PI/180;
const rad2deg = 180/Math.PI;
export default class Shadow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    onChange = (key, value) => {
        let shadow = this.props.shadow;
        shadow[key] = value;
        this.setState({shadow});
        this.props.onDesignChange(`${this.props.designKey}.${key}`, value);
    };

    getDegree = (xOffset, yOffset) => {
        if (xOffset === undefined) xOffset = -1;
        if (yOffset === undefined) yOffset = 1;
        let ratio = (xOffset) / (yOffset);
        let degree;
        if (xOffset < 0 && yOffset > 0)
            degree = - Math.atan( ratio ) * rad2deg;
        if (xOffset < 0 && yOffset < 0)
            degree = - Math.atan( ratio ) * rad2deg + 180;
        if (xOffset > 0 && yOffset < 0)
            degree = - Math.atan( ratio ) * rad2deg + 180;
        if (xOffset > 0 && yOffset > 0)
            degree = - Math.atan( ratio ) * rad2deg + 360;

        return Math.round(degree);
    };

    getRatio = (degree) => {
        return Math.tan( degree * deg2rad );
    };

    calcDegree = (degree) => {
        let ratio = this.getRatio(degree);
        let xO, yO;
        if (ratio === 0) {
            xO = 0;
            yO = 1;
        } else if (ratio === Infinity) {
            xO = 1;
            yO = 0;
        } else {
            xO = ratio;
            yO = 1;
            if (Math.abs(ratio) > 1) {
                xO /= Math.abs(ratio);
                yO /= Math.abs(ratio);
            }
        }
        this.onChange("xOffset", (degree <= 90 && degree >= 0) || (degree <= 360 && degree > 270)
            ? -xO : xO);
        this.onChange("yOffset", (degree <= 90 && degree >= 0) || (degree <= 360 && degree > 270)
            ? yO : -yO);
    };

    render () {
        return (
            <>
                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Angle</p>

                    <div className="ShadowRoot">
                        <Angle
                            className="ShadowAngle"
                            angle={this.getDegree(this.props.shadow.xOffset , this.props.shadow.yOffset)}
                            onChange={this.calcDegree}
                        />
                    </div>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Distance (px)</p>

                    <div
                        className="BorderWidth"
                    >
                        <SliderInput
                            className="BorderWidthSlider"
                            min={0}
                            max={50}
                            value={this.props.shadow.distance}
                            designKey={`${this.props.designKey}.distance`}
                            onDesignChange={this.props.onDesignChange}
                        />
                    </div>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Size (px)</p>

                    <div
                        className="BorderWidth"
                    >
                        <SliderInput
                            className="BorderWidthSlider"
                            min={0}
                            max={50}
                            value={this.props.shadow.size}
                            designKey={`${this.props.designKey}.size`}
                            onDesignChange={this.props.onDesignChange}
                        />
                    </div>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Blur (px)</p>

                    <div
                        className="BorderWidth"
                    >
                        <SliderInput
                            className="BorderWidthSlider"
                            min={0}
                            max={50}
                            value={this.props.shadow.blur}
                            designKey={`${this.props.designKey}.blur`}
                            onDesignChange={this.props.onDesignChange}
                        />
                    </div>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Opacity & Color</p>

                    <ColorPicker
                        color={this.props.shadow.color}
                        designKey={`${this.props.designKey}.color`}
                        onDesignChange={this.props.onDesignChange}
                        editor={this.props.editor}
                    />
                </div>
            </>
        )
    }
}

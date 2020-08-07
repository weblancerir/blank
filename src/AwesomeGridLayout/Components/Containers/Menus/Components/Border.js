import React from "react";
import '../../../../Menus/Menu.css';
import ColorPicker from "../../../../Menus/CommonComponents/ColorPicker";
import 'rc-slider/assets/index.css';
import '../style.css';
import Divider from "../../../../Menus/CommonComponents/Divider";
import SliderInput from "../../../../Menus/CommonComponents/SliderInput";

export default class Border extends React.Component {
    render () {
        return (
            <>
                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Opacity & Color</p>

                    <ColorPicker
                        color={this.props.border.color}
                        designKey={`${this.props.designKey}.color`}
                        onDesignChange={this.props.onDesignChange}
                    />
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Width (px)</p>

                    <div
                        className="BorderWidth"
                    >
                        <SliderInput
                            className="BorderWidthSlider"
                            min={0}
                            max={15}
                            value={this.props.border.width}
                            designKey={`${this.props.designKey}.width`}
                            onDesignChange={this.props.onDesignChange}
                        />
                    </div>
                </div>
            </>
        )
    }
}

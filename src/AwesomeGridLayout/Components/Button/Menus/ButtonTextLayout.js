import React from "react";
import '../../../Menus/Menu.css';
import IconButton from "../../../HelperComponents/IconButton";
import './ButtonTextLayout.css';
import Divider from "../../../Menus/CommonComponents/Divider";
import SliderInput from "../../../Menus/CommonComponents/SliderInput";

export default class ButtonTextLayout extends React.Component {
    render () {
        return (
            <>
                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Text alignment</p>

                    <div className="ButtonTextLayoutAlignRoot">
                        <IconButton
                            buttonBaseStyle={{
                                marginRight: 4,
                                marginLeft: 4,
                            }}
                            imageContainerStyle={{
                                padding: 6
                            }}
                            onClick={(e) => {
                                this.props.onDesignChange(this.props.designKey + '.textAlign', "flex-start");
                            }}
                            className="InspectorAlignsButtons"
                            selected={this.props.data.textAlign === "flex-start"}
                        >
                            <img
                                draggable={false}
                                width={16}
                                height={16}
                                src={require('../../../icons/align-left.svg')}
                            />
                        </IconButton>
                        <IconButton
                            buttonBaseStyle={{
                                marginRight: 4,
                                marginLeft: 4,
                            }}
                            imageContainerStyle={{
                                padding: 6
                            }}
                            onClick={(e) => {
                                this.props.onDesignChange(this.props.designKey + '.textAlign', "center");
                            }}
                            className="InspectorAlignsButtons"
                            selected={this.props.data.textAlign === "center" || !this.props.data.textAlign}
                        >
                            <img
                                draggable={false}
                                width={16}
                                height={16}
                                src={require('../../../icons/align-center.svg')}
                            />
                        </IconButton>
                        <IconButton
                            buttonBaseStyle={{
                                marginRight: 4,
                                marginLeft: 4,
                            }}
                            imageContainerStyle={{
                                padding: 6
                            }}
                            onClick={(e) => {
                                this.props.onDesignChange(this.props.designKey + '.textAlign', "flex-end");
                            }}
                            className="InspectorAlignsButtons"
                            selected={this.props.data.textAlign === "flex-end"}
                        >
                            <img
                                draggable={false}
                                width={16}
                                height={16}
                                src={require('../../../icons/align-right.svg')}
                            />
                        </IconButton>
                    </div>
                </div>

                {
                    (this.props.data.textAlign !== "center" || !this.props.data.textAlign) &&

                    <>
                        <Divider/>

                        <div className="MenuOptionSection">
                            <p className="MenuOptionSectionTitle">Margin (px)</p>

                            <div
                                className="BorderWidth"
                            >
                                <SliderInput
                                className="BorderWidthSlider"
                                min={0}
                                max={100}
                                value={this.props.data.margin}
                                designKey={`${this.props.designKey}.margin`}
                                onDesignChange={this.props.onDesignChange}
                                />
                            </div>
                        </div>
                    </>
                }


            </>
        )
    }
}

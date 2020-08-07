import React from "react";
import '../../../../Menus/Menu.css';
import GridViewer from "../../../../Menus/CommonComponents/GridViewer";
import classNames from "classnames";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import SliderInput from "../../../../Menus/CommonComponents/SliderInput";
import Switch from "@material-ui/core/Switch/Switch";
import {DynamicAnimations} from "../../../../Dynamic/DynamicComponents";
import Divider from "../../../../Menus/CommonComponents/Divider";
import IconButton from "../../../../HelperComponents/IconButton";

export default class AnimationOptions extends React.Component {

    render () {
        let {animation, onDesignChange, designKey, item} = this.props;
        if (!animation || !animation.name) {
            return <div className="MenuOptionSectionTitle" style={{
                textAlign: "center"
            }}>
                Select an Animation to See Options
            </div>
        }

        return (
            <>
                <div className="MenuOptionSection MenuOptionGrid2">
                    <span className="MenuOptionSectionTitleNoMargin">Play animation</span>

                    <IconButton onClick={(e) => {
                                    item.playAnimation();
                                }}
                                imageContainerStyle={{
                                    padding: 0
                                }}
                                buttonBaseStyle={{
                                    borderRadius: 999
                                }}
                    >
                        <img draggable={false} width={24} height={24}
                                   src={'/static/icon/play-button.svg'}
                        />
                    </IconButton>
                </div>

                <Divider/>

                {
                    animation.name &&
                        DynamicAnimations[animation.name].getOptions(this.props)
                }

                {
                    animation.name && DynamicAnimations[animation.name].getOptions(this.props) &&
                    <Divider/>
                }

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Duration</p>

                    <div
                        className="BorderWidth"
                    >
                        <SliderInput
                            className="BorderWidthSlider"
                            min={0}
                            max={5}
                            step={0.1}
                            value={animation.options? animation.options.duration !== undefined?
                                animation.options.duration: 1 : 1}
                            designKey={`${designKey}.duration`}
                            onDesignChange={onDesignChange}
                        />
                    </div>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Delay</p>

                    <div
                        className="BorderWidth"
                    >
                        <SliderInput
                            className="BorderWidthSlider"
                            min={0}
                            max={10}
                            step={0.1}
                            value={animation.options? animation.options.delay !== undefined?
                                animation.options.delay: 0 : 0}
                            designKey={`${designKey}.delay`}
                            onDesignChange={onDesignChange}
                        />
                    </div>
                </div>

                <Divider/>

                <div className="MenuOptionAnimationOnceRoot">
                    <p className="MenuOptionSectionTitle">Only animate first time</p>
                    <Switch
                        className="InspectorOverflowDirSwitch"
                        checked={animation.options && animation.options.once ? animation.options.once : false}
                        onChange={(e) => {
                            onDesignChange(`${designKey}.once`, e.target.checked);
                        }}
                    />
                </div>
            </>
        )
    }
}

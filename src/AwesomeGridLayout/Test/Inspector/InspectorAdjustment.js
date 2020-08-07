import React from "react";
import './Inspector.css';
import DropDown from "../../Menus/CommonComponents/DropDown";
import {getUnitFromStyleValue, getValueFromCSSValue, rotate, setScrollBehaviour} from "../../AwesomwGridLayoutHelper";
import CircularSlider from "../../Menus/CommonComponents/CircularSlider";
import NumberInput from "../../Menus/CommonComponents/NumberInput";
import Switch from "@material-ui/core/Switch/Switch";
import TextInput from "../../Menus/CommonComponents/TextInput";
import InspectorTitle from "./InspectorTitle";
import NumberInputWithUnit from "../../Menus/CommonComponents/NumberInputWithUnit";

export default class InspectorAdjustment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    componentDidMount() {
        this.props.item && this.props.item.onPropsChange.addListener(this.onItemPropsChange);
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
        this.props.item && this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        nextProps.item && nextProps.item.onPropsChange.addListener(this.onItemPropsChange);
        if (this.props.item && (nextProps.item && nextProps.item.props.id) !== this.props.item.props.id)
            this.props.item && this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
        return true;
    }

    onItemPropsChange = (owner) => {
        this.setState({reload: true});
    };

    onRotationChange = (degree) => {
        console.warn("onRotationChange", degree)
        let {item} = this.props;

        rotate(item, degree);
    };

    render() {
        let {item} = this.props;
        let rotate = item.getFromData("transform.rotateDegree");
        return (
            <>
                <InspectorTitle title="Adjust" onChange={(open) => {
                    this.setState({open});
                }}/>

                {
                    this.state.open &&
                    <div className="InspectorOptionRoot">
                        <div className="InspectorAdjustRotate">
                            <span className="InspectorOverflowDirTitle">
                                Rotate
                            </span>
                            <NumberInputWithUnit
                                min={0}
                                max={360}
                                value={rotate || 0}
                                onChange={(value) => {
                                    this.onRotationChange(value);
                                }}
                                units={["°"]}
                                unit={"°"}
                                inputStyle={{
                                    width: 64,
                                    fontSize: 12
                                }}
                                unitButtonStyle={{
                                    fontSize: 11
                                }}
                                disableUnit
                            />
                        </div>

                    </div>
                }
            </>
        )
    }
}

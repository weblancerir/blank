import React from "react";
import './Inspector.css';
import DropDown from "../../Menus/CommonComponents/DropDown";
import {getValueFromCSSValue, setScrollBehaviour, setStyle, setStyleParam} from "../../AwesomwGridLayoutHelper";
import CircularSlider from "../../Menus/CommonComponents/CircularSlider";
import NumberInput from "../../Menus/CommonComponents/NumberInput";
import Switch from "@material-ui/core/Switch/Switch";
import TextInput from "../../Menus/CommonComponents/TextInput";
import ColorPicker from "../../Menus/CommonComponents/ColorPicker";
import InspectorTitle from "./InspectorTitle";
import ThemeColorPicker from "../Theme/ThemeColorPicker";
import Background from "../../Components/Containers/Menus/Components/Background";

export default class InspectorBackground extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: true};
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

    onChangeColor = (key, value) => {
        let {item} = this.props;
        setStyleParam("backgroundColor", value,
            item, true, undefined, true);
    };

    render() {
        let {item} = this.props;
        let style = item.getFromData("style") || {};
        return (
            <>
                <InspectorTitle defaultOpen title="Background" onChange={(open) => {
                    this.setState({open});
                }}/>

                {
                    this.state.open &&
                    <div className="InspectorOptionRoot">
                        <span className="InspectorBackgroundColorTitle">
                            Color
                        </span>
                        <ColorPicker
                            color={style.backgroundColor || 'rgba(0, 0, 0, 0)'}
                            onDesignChange={this.onChangeColor}
                            editor={this.props.item.props.editor}
                        />
                    </div>
                }
            </>
        )
    }
}

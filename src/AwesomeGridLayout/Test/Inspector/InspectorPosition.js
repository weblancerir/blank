import React from "react";
import './Inspector.css';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {
    getPxValueFromCSSValue,
    getUnitFromStyleValue,
    setDataInBreakpoint,
    setGridItemStyle,
    setTempData
} from "../../AwesomwGridLayoutHelper";
import {cloneObject} from "../../AwesomeGridLayoutUtils";
import Switch from "@material-ui/core/Switch/Switch";
import IconButton from "../../HelperComponents/IconButton";
import DockSwitch from "./DockSwitch";
import NumberInputWithUnit from "../../Menus/CommonComponents/NumberInputWithUnit";
import InspectorTitle from "./InspectorTitle";

export default class InspectorPosition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount () {
        this.props.item && this.props.item.onPropsChange.addListener(this.onItemPropsChange);
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
        this.props.item && this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
    }

    shouldComponentUpdate (nextProps, nextState, nextContext) {
        nextProps.item && nextProps.item.onPropsChange.addListener(this.onItemPropsChange);
        if (this.props.item && (nextProps.item && nextProps.item.props.id) !== this.props.item.props.id)
            this.props.item && this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
        return true;
    }

    onItemPropsChange = (owner) => {
        this.setState({reload: true});
    };

    onDockActiveChange = (side, value) => {
        let {item} = this.props;
        let oldDocks = cloneObject(item.getFromData("docks") || {});

        oldDocks[side] = value;
        if (side === "top" && value) {
            oldDocks.bottom = false;
        }
        if (side === "bottom" && value) {
            oldDocks.top = false;
        }

        item.setDocks(oldDocks.top, oldDocks.left, oldDocks.bottom, oldDocks.right,
            item.getFromTempData("autoDeck"));

        item.props.select.updateHelpLines(item, item.state.helpLinesParent,
            item.getSize(false), item.state.dragging);
    };

    onDockAutoChange = () => {
        let {item} = this.props;
        setTempData("autoDock", !item.getFromTempData("autoDock"), item, true);
    };

    onUnitChange = (prop, parentProp, unit) => {
        let {item} = this.props;
        let gridItemStyle = cloneObject(item.getFromData("gridItemStyle"));
        let compositeGridItemStyle = item.getCompositeFromData("gridItemStyle");
        if (!gridItemStyle)
            gridItemStyle = {};

        let parentRect = item.props.parent.getSize(false);
        let value = getPxValueFromCSSValue(compositeGridItemStyle[prop], parentRect.scrollWidthMinusPadding, item);

        if (unit === "px") {
            gridItemStyle[prop] = `${value}${unit}`;
        } else if (unit === "%") {
            // let runtimeGridItemStyle = item.getRuntimeGridItemStyle();
            gridItemStyle[prop] = `${value / parentRect.scrollWidthMinusPadding * 100}${unit}`;
        }

        setGridItemStyle(gridItemStyle, item, true);

        item.props.select.updateHelpLines(item, item.state.helpLinesParent,
            item.getSize(false), item.state.dragging);
    };

    onValueChange = (prop, value) => {
        let {item} = this.props;
        let gridItemStyle = cloneObject(item.getFromData("gridItemStyle"));
        let compositeGridItemStyle = item.getCompositeFromData("gridItemStyle");
        if (!gridItemStyle)
            gridItemStyle = {};
        gridItemStyle[prop] = `${value}${getUnitFromStyleValue(compositeGridItemStyle[prop])}`;

        setGridItemStyle(gridItemStyle, item, true);

        item.props.select.updateHelpLines(item, item.state.helpLinesParent,
            item.getSize(false), item.state.dragging);
        item.props.select.updateResizePanes(item, item.getSize(false));
    };

    runtimeValueToStyleValue = (propName, parentValue, value, style) => {
        if (!style)
            return;

        let unit = getUnitFromStyleValue(style[propName]);
        let {item} = this.props;

        if (unit === "px") {
            value = `${value}px`;
        } else if (unit === "%") {
            value = `${value /
            parentValue * 100}%`;
        } else {
            value = unit;
        }

        return value;
    };

    render () {
        let {item} = this.props;
        let docks = item.getCompositeFromData("docks");
        let auto = item.getFromTempData("autoDock");
        let gridItemStyle = item.getCompositeFromData("gridItemStyle");
        let runtimeStyle = item.state.runtimeStyle;
        let runtimeGridItemStyle = item.getRuntimeGridItemStyle();
        return (
            <>
                <InspectorTitle title="Position" onChange={(open) => {
                    this.setState({open});
                }}/>

                {
                    this.state.open &&
                    <div className="InspectorOptionRoot">
                        <div className="InspectorDockingRoot">
                            <span className="InspectorDockingRootTitle">
                                Docking
                            </span>

                            <div className="InspectorDockingDocks">
                                <div className="InspectorDockingLeft">
                                    <DockSwitch
                                        className="InspectorDockSwitch"
                                        checked={docks.left || false}
                                        onChange={(e) => {
                                            let checked = e.target.checked;
                                            this.onDockActiveChange('left', checked);
                                        }}
                                        disabled={auto}
                                    />
                                </div>
                                <div className="InspectorDockingRight">
                                    <DockSwitch
                                        className="InspectorDockSwitch"
                                        checked={docks.right || false}
                                        onChange={(e) => {
                                            let checked = e.target.checked;
                                            this.onDockActiveChange('right', checked);
                                        }}
                                        disabled={auto}
                                    />
                                </div>
                                <div className="InspectorDockingTop">
                                    <DockSwitch
                                        className="InspectorDockSwitch90"
                                        checked={docks.top || false}
                                        onChange={(e) => {
                                            let checked = e.target.checked;
                                            this.onDockActiveChange('top', checked);
                                        }}
                                        disabled={auto}
                                    />
                                </div>
                                <div className="InspectorDockingBottom">
                                    <DockSwitch
                                        className="InspectorDockSwitch90"
                                        checked={docks.bottom || false}
                                        onChange={(e) => {
                                            let checked = e.target.checked;
                                            this.onDockActiveChange('bottom', checked);
                                        }}
                                        disabled={auto}
                                    />
                                </div>
                                {
                                    auto &&
                                    <div className="InspectorDockingDisable"/>
                                }
                            </div>
                        </div>
                        <div className="InspectorOverflowDir">
                        <span className="InspectorOverflowDirTitle">
                            Auto docking
                        </span>
                            <Switch
                                className="InspectorOverflowDirSwitch"
                                checked={auto || false}
                                onChange={(e) => {
                                    this.onDockAutoChange();
                                }}
                            />
                        </div>
                        <div className="InspectorOverflowMarginRoot">
                            <NumberInputWithUnit
                                className="InspectorOverflowMargin"
                                min={0}
                                max={Infinity}
                                disabled={!docks.top || auto}
                                value={docks.top && (runtimeStyle && runtimeGridItemStyle ?
                                    runtimeGridItemStyle.marginTop : gridItemStyle.marginTop)}
                                onChange={(value) => {
                                    this.onValueChange("marginTop", value);
                                }}
                                onUnitChange={(unit) => {
                                    this.onUnitChange("marginTop", "height", unit);
                                }}
                                units={["%", "px"]}
                                unit={
                                    docks.top &&
                                    getUnitFromStyleValue(
                                        runtimeStyle && runtimeGridItemStyle ?
                                            runtimeGridItemStyle.marginTop : gridItemStyle.marginTop)
                                }
                                inputStyle={{
                                    width: "100%",
                                    fontSize: 12
                                }}
                                unitButtonStyle={{
                                    fontSize: 11
                                }}
                            />
                            <NumberInputWithUnit
                                className="InspectorOverflowMargin"
                                min={0}
                                max={Infinity}
                                disabled={!docks.left || auto}
                                value={docks.left && (runtimeStyle && runtimeGridItemStyle ?
                                    runtimeGridItemStyle.marginLeft : gridItemStyle.marginLeft)}
                                onChange={(value) => {
                                    this.onValueChange("marginLeft", value);
                                }}
                                onUnitChange={(unit) => {
                                    this.onUnitChange("marginLeft", "height", unit);
                                }}
                                units={["%", "px"]}
                                unit={docks.left &&
                                getUnitFromStyleValue(
                                    runtimeStyle && runtimeGridItemStyle ?
                                        runtimeGridItemStyle.marginLeft : gridItemStyle.marginLeft)}
                                inputStyle={{
                                    width: "100%",
                                    fontSize: 12
                                }}
                                unitButtonStyle={{
                                    fontSize: 11
                                }}
                            />
                            <NumberInputWithUnit
                                className="InspectorOverflowMargin"
                                min={0}
                                max={Infinity}
                                disabled={!docks.bottom || auto}
                                value={docks.bottom && (runtimeStyle && runtimeGridItemStyle ?
                                    runtimeGridItemStyle.marginBottom : gridItemStyle.marginBottom)}
                                onChange={(value) => {
                                    this.onValueChange("marginBottom", value);
                                }}
                                onUnitChange={(unit) => {
                                    this.onUnitChange("marginBottom", "height", unit);
                                }}
                                units={["%", "px"]}
                                unit={docks.bottom &&
                                getUnitFromStyleValue(
                                    runtimeStyle && runtimeGridItemStyle ?
                                        runtimeGridItemStyle.marginBottom : gridItemStyle.marginBottom)}
                                inputStyle={{
                                    width: "100%",
                                    fontSize: 12
                                }}
                                unitButtonStyle={{
                                    fontSize: 11
                                }}
                            />
                            <NumberInputWithUnit
                                className="InspectorOverflowMargin"
                                min={0}
                                max={Infinity}
                                disabled={!docks.right || auto}
                                value={docks.right && (runtimeStyle && runtimeGridItemStyle ?
                                    runtimeGridItemStyle.marginRight : gridItemStyle.marginRight)}
                                onChange={(value) => {
                                    this.onValueChange("marginRight", value);
                                }}
                                onUnitChange={(unit) => {
                                    this.onUnitChange("marginRight", "height", unit);
                                }}
                                units={["%", "px"]}
                                unit={docks.right &&
                                getUnitFromStyleValue(
                                    runtimeStyle && runtimeGridItemStyle ?
                                        runtimeGridItemStyle.marginRight : gridItemStyle.marginRight)}
                                inputStyle={{
                                    width: "100%",
                                    fontSize: 12
                                }}
                                unitButtonStyle={{
                                    fontSize: 11
                                }}
                            />
                        </div>
                    </div>
                }
            </>
        )
    }
}

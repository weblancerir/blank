import React from "react";
import './Inspector.css';
import {
    getPxValueFromCSSValue,
    getViewRatioStyle,
    setNewSize
} from "../../AwesomwGridLayoutHelper";
import NumberInputWithUnit from "../../Menus/CommonComponents/NumberInputWithUnit";
import InspectorTitle from "./InspectorTitle";
import Switch from "@material-ui/core/Switch/Switch";

export default class InspectorSize extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true
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

    onChange = (prop, value) => {
        let {item} = this.props;
        let oldValue = item.getCompositeFromData("style")[prop];
        if (["%", "px"].includes(this.getUnit(oldValue))) {
            value = `${value}${this.getUnit(oldValue)}`;
        } else if (["vh", "vw"].includes(this.getUnit(oldValue))) {
            value = `${value}${this.getUnit(oldValue)}`;
            value = getViewRatioStyle(value);
        }

        setNewSize(prop, value, item, true);
        item.props.select.onScrollItem();
    };

    onUnitChange = (prop, unit, parentValue, defaultValue) => {
        let {item} = this.props;
        let style = item.getCompositeFromData("style");

        if (isNaN(defaultValue))
            defaultValue = 0;

        let value;
        if (unit === "px") {
            value = `${item.getSize(false)[prop] ||
            getPxValueFromCSSValue(style[prop], parentValue, item) || defaultValue || 0}px`;
        } else if (unit === "%") {
            value = `${(item.getSize(false)[prop] ||
                getPxValueFromCSSValue(style[prop], parentValue, item) || defaultValue || 0) /
            parentValue * 100}%`;
        } else if (unit === "vh") {
            value = `${(item.getSize(false)[prop] ||
                getPxValueFromCSSValue(style[prop], parentValue, item) || defaultValue || 0) /
            item.props.breakpointmanager.getWindowHeight() * 100}vh`;
            value = getViewRatioStyle(value);
        } else if (unit === "vw") {
            value = `${(item.getSize(false)[prop] ||
                getPxValueFromCSSValue(style[prop], parentValue, item) || defaultValue || 0) /
            item.props.breakpointmanager.getWindowWidth() * 100}vw`;
            value = getViewRatioStyle(value);
        } else if (unit === "none") {
            value = undefined;
        } else {
            value = unit;
        }

        setNewSize(prop, value, item, true);
        item.props.select.onScrollItem();
    };

    getUnit = (value) => {
        if (!value || value === "unset")
            return "none";

        if (value.includes("%")) {
            return "%";
        }

        if (value.includes("px")) {
            return "px";
        }

        if (value.includes("vw")) {
            return "vw";
        }

        if (value.includes("vh")) {
            return "vh";
        }

        return value;
    };

    runtimeValueToStyleValue = (propName, parentValue, value, style,) => {
        let unit = this.getUnit(style[propName]);
        let {item} = this.props;

        if (unit === "px") {
            value = `${value}px`;
        } else if (unit === "%") {
            value = `${value /
            parentValue * 100}%`;
        } else if (unit === "vh") {
            value = `${value / item.props.breakpointmanager.getWindowHeight() * 100}vh`;
            value = `calc(${value} * var(--vh-ratio))`;
        } else if (unit === "vw") {
            value = `${value / item.props.breakpointmanager.getWindowWidth() * 100}vw`;
            value = `calc(${value} * var(--vw-ratio))`;
        } else {
            value = unit;
        }

        return value;
    };

    render() {
        let {item, scaleProportionally, onDesignChange, designKey} = this.props;
        let style = item.getCompositeFromData("style");
        let runtimeStyle = item.state.runtimeStyle;
        let runtimeGridItemStyle = item.getRuntimeGridItemStyle() || {
            widthForPercent: item.props.breakpointmanager.getWindowWidth(),
            heightForPercent: item.props.breakpointmanager.getWindowHeight(),
        };
        return (
            <>
                <InspectorTitle defaultOpen title="Size" onChange={(open)=>{
                    this.setState({open});
                }}/>

                {
                    this.state.open &&
                    <div className="InspectorOptionRoot">
                        <div className="InspectorSizeRow">
                            <div className="InspectorSizeItem" style={{
                                marginRight: 12
                            }}>
                        <span className="InspectorSizeItemTitle">
                            Width
                        </span>
                                <NumberInputWithUnit
                                    className="AngleInput"
                                    min={0}
                                    max={Infinity}
                                    disabled={this.props.disabledProps.includes('width')}
                                    value={runtimeStyle ?
                                        this.runtimeValueToStyleValue("width",
                                            runtimeGridItemStyle.widthForPercent, runtimeStyle.width, style) :
                                        style.width}
                                    onChange={(value) => {
                                        this.onChange("width", value);
                                    }}
                                    onUnitChange={(unit) => {
                                        let parentRect = item.props.parent.getSize(false);
                                        this.onUnitChange("width", unit, parentRect.scrollWidthMinusPadding);
                                    }}
                                    units={this.props.widthUnits}
                                    unit={this.getUnit(style.width)}
                                />
                            </div>

                            <div className="InspectorSizeItem">
                        <span className="InspectorSizeItemTitle">
                            Height
                        </span>
                                <NumberInputWithUnit
                                    className="InspectorSizeItemInput"
                                    min={0}
                                    max={Infinity}
                                    disabled={this.props.disabledProps.includes('height')}
                                    value={runtimeStyle ?
                                        this.runtimeValueToStyleValue("height",
                                            runtimeGridItemStyle.heightForPercent, runtimeStyle.height, style) :
                                        style.height}
                                    onChange={(value) => {
                                        this.onChange("height", value);
                                    }}
                                    onUnitChange={(unit) => {
                                        let parentRect = item.props.parent.getSize(false);
                                        this.onUnitChange("height", unit, parentRect.scrollHeightMinusPadding);
                                    }}
                                    units={this.props.heightUnits}
                                    unit={this.getUnit(style.height)}
                                />
                            </div>
                        </div>

                        <div className="InspectorSizeRow">
                            <div className="InspectorSizeItem" style={{
                                marginRight: 12
                            }}>
                        <span className="InspectorSizeItemTitle">
                            Min W
                        </span>
                                <NumberInputWithUnit
                                    className="AngleInput"
                                    min={0}
                                    max={Infinity}
                                    disabled={this.props.disabledProps.includes('minWidth')}
                                    value={runtimeStyle ?
                                        this.runtimeValueToStyleValue("minWidth",
                                            runtimeGridItemStyle.widthForPercent, runtimeStyle.width, style) :
                                        style.minWidth}
                                    onChange={(value) => {
                                        this.onChange("minWidth", value);
                                    }}
                                    onUnitChange={(unit) => {
                                        let defaultValue = 1;
                                        let parentRect = item.props.parent.getSize(false);
                                        let width = getPxValueFromCSSValue(style.width, parentRect.scrollWidthMinusPadding, item);
                                        let maxWidth = getPxValueFromCSSValue(style.maxWidth, parentRect.scrollWidthMinusPadding, item);
                                        if (isNaN(width) && !isNaN(maxWidth))
                                            defaultValue = maxWidth;
                                        else if (!isNaN(width) && isNaN(maxWidth))
                                            defaultValue = width;
                                        else if (!isNaN(width) && !isNaN(maxWidth))
                                            defaultValue = Math.min(width, maxWidth);

                                        this.onUnitChange("minWidth", unit, parentRect.scrollWidthMinusPadding
                                            , defaultValue);
                                    }}
                                    units={this.props.minWidthUnits}
                                    unit={this.getUnit(style.minWidth)}
                                />
                            </div>

                            <div className="InspectorSizeItem">
                        <span className="InspectorSizeItemTitle">
                            Min H
                        </span>
                                <NumberInputWithUnit
                                    className="InspectorSizeItemInput"
                                    min={0}
                                    max={Infinity}
                                    disabled={this.props.disabledProps.includes('minHeight')}
                                    value={runtimeStyle ?
                                        this.runtimeValueToStyleValue("minHeight",
                                            runtimeGridItemStyle.heightForPercent, runtimeStyle.height, style) :
                                        style.minHeight}
                                    onChange={(value) => {
                                        this.onChange("minHeight", value);
                                    }}
                                    onUnitChange={(unit) => {
                                        let defaultValue = 1;
                                        let parentRect = item.props.parent.getSize(false);
                                        let height = getPxValueFromCSSValue(style.height, parentRect.scrollHeightMinusPadding, item);
                                        let maxHeight = getPxValueFromCSSValue(style.maxHeight, parentRect.scrollHeightMinusPadding, item);
                                        if (isNaN(height) && !isNaN(maxHeight))
                                            defaultValue = maxHeight;
                                        else if (!isNaN(height) && isNaN(maxHeight))
                                            defaultValue = height;
                                        else if (!isNaN(height) && !isNaN(maxHeight))
                                            defaultValue = Math.min(height, maxHeight);

                                        this.onUnitChange("minHeight", unit, parentRect.scrollHeightMinusPadding
                                            , defaultValue);
                                    }}
                                    units={this.props.minHeightUnits}
                                    unit={this.getUnit(style.minHeight)}
                                />
                            </div>
                        </div>

                        <div className="InspectorSizeRow" style={{
                            marginBottom: 0
                        }}>
                            <div className="InspectorSizeItem" style={{
                                marginRight: 12
                            }}>
                        <span className="InspectorSizeItemTitle">
                            Max W
                        </span>
                                <NumberInputWithUnit
                                    className="AngleInput"
                                    min={0}
                                    max={Infinity}
                                    disabled={this.props.disabledProps.includes('maxWidth')}
                                    value={runtimeStyle ?
                                        this.runtimeValueToStyleValue("maxWidth",
                                            runtimeGridItemStyle.widthForPercent, runtimeStyle.width, style) :
                                        style.maxWidth}
                                    onChange={(value) => {
                                        this.onChange("maxWidth", value);
                                    }}
                                    onUnitChange={(unit) => {
                                        let defaultValue = 200;
                                        let parentRect = item.props.parent.getSize(false);
                                        let width = getPxValueFromCSSValue(style.width, parentRect.scrollWidthMinusPadding, item);
                                        let minWidth = getPxValueFromCSSValue(style.minWidth, parentRect.scrollWidthMinusPadding, item);
                                        if (isNaN(width) && !isNaN(minWidth))
                                            defaultValue = minWidth;
                                        else if (!isNaN(width) && isNaN(minWidth))
                                            defaultValue = width;
                                        else if (!isNaN(width) && !isNaN(minWidth))
                                            defaultValue = Math.max(width, minWidth);

                                        this.onUnitChange("maxWidth", unit, parentRect.scrollWidthMinusPadding
                                            , defaultValue);
                                    }}
                                    units={this.props.maxWidthUnits}
                                    unit={this.getUnit(style.maxWidth)}
                                />
                            </div>

                            <div className="InspectorSizeItem">
                        <span className="InspectorSizeItemTitle">
                            Max H
                        </span>
                                <NumberInputWithUnit
                                    className="InspectorSizeItemInput"
                                    min={0}
                                    max={Infinity}
                                    disabled={this.props.disabledProps.includes('maxHeight')}
                                    value={runtimeStyle ?
                                        this.runtimeValueToStyleValue("maxHeight",
                                            runtimeGridItemStyle.heightForPercent, runtimeStyle.height, style) :
                                        style.maxHeight}
                                    onChange={(value) => {
                                        this.onChange("maxHeight", value);
                                    }}
                                    onUnitChange={(unit) => {
                                        let defaultValue = 200;
                                        let parentRect = item.props.parent.getSize(false);
                                        let height = getPxValueFromCSSValue(style.height, parentRect.scrollHeightMinusPadding, item);
                                        let minHeight = getPxValueFromCSSValue(style.minHeight, parentRect.scrollHeightMinusPadding, item);
                                        if (isNaN(height) && !isNaN(minHeight))
                                            defaultValue = minHeight;
                                        else if (!isNaN(height) && isNaN(minHeight))
                                            defaultValue = height;
                                        else if (!isNaN(height) && !isNaN(minHeight))
                                            defaultValue = Math.max(height, minHeight);

                                        this.onUnitChange("maxHeight", unit, parentRect.scrollHeightMinusPadding
                                            , defaultValue);
                                    }}
                                    units={this.props.maxHeightUnits}
                                    unit={this.getUnit(style.maxHeight)}
                                />
                            </div>
                        </div>
                    </div>
                }
            </>
        )
    }
}

InspectorSize.defaultProps = {
    disabledProps: []
};

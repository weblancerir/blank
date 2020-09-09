import React from "react";
import './Inspector.css';
import {
    getPxValueFromCSSValue, getStyleValueFromPx,
    getUnitFromStyleValue,
    setDataInBreakpoint,
    setTempData
} from "../../AwesomwGridLayoutHelper";
import {cloneObject} from "../../AwesomeGridLayoutUtils";
import Switch from "@material-ui/core/Switch/Switch";
import NumberInputWithUnit from "../../Menus/CommonComponents/NumberInputWithUnit";
import InspectorTitle from "./InspectorTitle";

export default class InspectorPadding extends React.Component {
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

    onUnitChange = (prop, parentProp, unit) => {
        let {item} = this.props;
        let padding = cloneObject(item.getFromData("padding")) || {};
        let compositePadding = item.getCompositeFromData("padding") || {};

        let parentRect = item.props.parent.getSize(false);
        let value = getPxValueFromCSSValue(compositePadding[prop], parentRect.width, item);

        if (unit === "px") {
            padding[prop] = `${value}${unit}`;
        } else if (unit === "%") {
            padding[prop] = `${value / item.props.parent.getSize(false).width * 100}${unit}`;
        }
        else if (unit === "vh") {
            padding[prop] = `${value / item.props.breakpointmanager.getWindowHeight() * 100}${unit}`;
        }
        else if (unit === "vw") {
            padding[prop] = `${value / item.props.breakpointmanager.getWindowWidth() * 100}${unit}`;
        }

        setDataInBreakpoint("padding", padding, item, true, undefined, true);
    };

    onValueChange = (prop, value) => {
        let {item} = this.props;
        let equalPadding = item.getFromTempData("equalPadding");
        let padding = cloneObject(item.getFromData("padding")) || {};
        let compositePadding = item.getCompositeFromData("padding") || {};
        padding[prop] = `${value}${getUnitFromStyleValue(compositePadding[prop] || "px")}`;
        if (equalPadding) {
            let parentRect = item.props.parent? item.props.parent.getSize(false):
                {
                    scrollWidthMinusPadding: item.props.breakpointmanager.getWindowWidth()
                };
            let pxValue = getPxValueFromCSSValue(padding[prop], parentRect.scrollWidthMinusPadding, item);
            padding = {
                top: `${getStyleValueFromPx(pxValue, parentRect.scrollWidthMinusPadding, getUnitFromStyleValue(compositePadding.top || "px"), item)}`,
                left: `${getStyleValueFromPx(pxValue, parentRect.scrollWidthMinusPadding, getUnitFromStyleValue(compositePadding.left || "px"), item)}`,
                bottom: `${getStyleValueFromPx(pxValue, parentRect.scrollWidthMinusPadding, getUnitFromStyleValue(compositePadding.bottom || "px"), item)}`,
                right: `${getStyleValueFromPx(pxValue, parentRect.scrollWidthMinusPadding, getUnitFromStyleValue(compositePadding.right || "px"), item)}`,
            };
        }

        setDataInBreakpoint("padding", padding, item, true, undefined, true);

        item.invalidateSize(true, true, true);

        window.requestAnimationFrame(() => {
            item.props.select.onScrollItem();
        })
    };

    onEqualPadding = (equalPadding) => {
        let {item} = this.props;

        setTempData("equalPadding", equalPadding, item, true);
        if (equalPadding) {
            let compositePadding = item.getCompositeFromData("padding") || {};

            let parentRect = item.props.parent? item.props.parent.getSize(false):
                {
                    scrollWidthMinusPadding: item.props.breakpointmanager.getWindowWidth()
                };
            let max = Math.max(
                getPxValueFromCSSValue(compositePadding.top, parentRect.scrollWidthMinusPadding, item) || 0,
                getPxValueFromCSSValue(compositePadding.left, parentRect.scrollWidthMinusPadding, item) || 0,
                getPxValueFromCSSValue(compositePadding.bottom, parentRect.scrollWidthMinusPadding, item) || 0,
                getPxValueFromCSSValue(compositePadding.right, parentRect.scrollWidthMinusPadding, item) || 0,
            );

            let padding = {
                top: `${getStyleValueFromPx(max, parentRect.scrollWidthMinusPadding, getUnitFromStyleValue(compositePadding.top || "px"), item)}`,
                left: `${getStyleValueFromPx(max, parentRect.scrollWidthMinusPadding, getUnitFromStyleValue(compositePadding.left || "px"), item)}`,
                bottom: `${getStyleValueFromPx(max, parentRect.scrollWidthMinusPadding, getUnitFromStyleValue(compositePadding.bottom || "px"), item)}`,
                right: `${getStyleValueFromPx(max, parentRect.scrollWidthMinusPadding, getUnitFromStyleValue(compositePadding.right || "px"), item)}`,
            };

            setDataInBreakpoint("padding", padding, item, true, undefined, true);

            item.invalidateSize(true, true, true);
        }
    };

    render () {
        let {item} = this.props;
        let padding = item.getCompositeFromData("padding") || {};
        let equalPadding = item.getFromTempData("equalPadding") || false;
        return (
            <>
                <InspectorTitle title="Padding" onChange={(open) => {
                    this.setState({open});
                }}/>

                {
                    this.state.open &&
                    <div className="InspectorOptionRoot">
                        <div className="InspectorOverflowMarginRoot">
                            <NumberInputWithUnit
                                className="InspectorOverflowMargin"
                                min={0}
                                max={Infinity}
                                value={padding.top || "0px"}
                                onChange={(value) => {
                                    this.onValueChange("top", value);
                                }}
                                onUnitChange={(unit) => {
                                    this.onUnitChange("top", "height", unit);
                                }}
                                units={["%", "px", "vh", "vw"]}
                                unit={
                                    getUnitFromStyleValue(padding.top || "px")
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
                                value={padding.left || "0px"}
                                onChange={(value) => {
                                    this.onValueChange("left", value);
                                }}
                                onUnitChange={(unit) => {
                                    this.onUnitChange("left", "height", unit);
                                }}
                                units={["%", "px", "vh", "vw"]}
                                unit={
                                    getUnitFromStyleValue(padding.left || "px")
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
                                value={padding.bottom || "0px"}
                                onChange={(value) => {
                                    this.onValueChange("bottom", value);
                                }}
                                onUnitChange={(unit) => {
                                    this.onUnitChange("bottom", "height", unit);
                                }}
                                units={["%", "px", "vh", "vw"]}
                                unit={
                                    getUnitFromStyleValue(padding.bottom || "px")
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
                                value={padding.right || "0px"}
                                onChange={(value) => {
                                    this.onValueChange("right", value);
                                }}
                                onUnitChange={(unit) => {
                                    this.onUnitChange("right", "height", unit);
                                }}
                                units={["%", "px", "vh", "vw"]}
                                unit={
                                    getUnitFromStyleValue(padding.right || "px")
                                }
                                inputStyle={{
                                    width: "100%",
                                    fontSize: 12
                                }}
                                unitButtonStyle={{
                                    fontSize: 11
                                }}
                            />
                        </div>

                        <div className="InspectorAdjustRotate">
                                <span className="InspectorOverflowDirTitle">
                                    Equal padding
                                </span>
                            <Switch
                                className="InspectorOverflowDirSwitch"
                                checked={equalPadding}
                                onChange={(e) => {
                                    let checked = e.target.checked;
                                    this.onEqualPadding(checked);
                                }}
                            />
                        </div>
                    </div>
                }
            </>
        )
    }
}

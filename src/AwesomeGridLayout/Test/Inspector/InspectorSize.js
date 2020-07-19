import React from "react";
import './Inspector.css';
import IconButton from "../../HelperComponents/IconButton";
import {alignItem, setNewSize} from "../../AwesomwGridLayoutHelper";
import NumberInputWithUnit from "../../Menus/CommonComponents/NumberInputWithUnit";
import CircularSlider from "../../Menus/CommonComponents/CircularSlider";
import NumberInput from "../../Menus/CommonComponents/NumberInput";

export default class InspectorSize extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
        this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
    }

    shouldComponentUpdate (nextProps, nextState, nextContext) {
        nextProps.item.onPropsChange.addListener(this.onItemPropsChange);
        return true;
    }

    onItemPropsChange = () => {
        this.forceUpdate();
    };

    onChange = (prop, value) => {
        let {item} = this.props;
        let oldValue = item.getCompositeFromData("style")[prop];
        if (["%", "px"].includes(this.getUnit(oldValue))) {
            value = `${value}${this.getUnit(oldValue)}`;
        }

        setNewSize(prop, value, item, true);
        item.props.select.onScrollItem();
    };

    onUnitChange = (prop, unit) => {
        let {item} = this.props;

        let value;
        if (unit === "px") {
            value = `${item.getSize(false).width}px`;
        } else if (unit === "%") {
            value = `${item.getSize(false).width / item.props.parent.getSize(false).width * 100}%`;
        } else if (unit === "vh") {
            value = `${item.getSize(false).width / item.props.breakpointmanager.getWindowHeight() * 100}vh`;
        } else if (unit === "vw") {
            value = `${item.getSize(false).width / item.props.breakpointmanager.getWindowWidth() * 100}vw`;
        } else if (unit === "none") {
            value = undefined;
        } else {
            value = unit;
        }

        setNewSize(prop, value, item, true);
    };

    getUnit = (value) => {
        if (!value)
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

    render () {
        let {item} = this.props;
        let style = item.getCompositeFromData("style");
        return (
            <div className="InspectorOptionRoot">
                <span className="InspectorOptionTitle">
                    Size
                </span>

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
                            value={style.width}
                            onChange={(value) => {
                                this.onChange("width", value);
                            }}
                            onUnitChange={(unit) => {
                                this.onUnitChange("width", unit);
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
                            value={style.height}
                            onChange={(value) => {
                                this.onChange("height", value);
                            }}
                            onUnitChange={(unit) => {
                                this.onUnitChange("height", unit);
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
                            value={style.minWidth}
                            onChange={(value) => {
                                this.onChange("minWidth", value);
                            }}
                            onUnitChange={(unit) => {
                                this.onUnitChange("minWidth", unit);
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
                            value={style.minHeight}
                            onChange={(value) => {
                                this.onChange("minHeight", value);
                            }}
                            onUnitChange={(unit) => {
                                this.onUnitChange("minHeight", unit);
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
                            value={style.maxWidth}
                            onChange={(value) => {
                                this.onChange("maxWidth", value);
                            }}
                            onUnitChange={(unit) => {
                                this.onUnitChange("maxWidth", unit);
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
                            value={style.maxHeight}
                            onChange={(value) => {
                                this.onChange("maxHeight", value);
                            }}
                            onUnitChange={(unit) => {
                                this.onUnitChange("maxHeight", unit);
                            }}
                            units={this.props.maxHeightUnits}
                            unit={this.getUnit(style.maxHeight)}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

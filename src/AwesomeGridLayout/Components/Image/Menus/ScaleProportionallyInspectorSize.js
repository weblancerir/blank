import React from "react";
import Switch from "@material-ui/core/Switch/Switch";
import InspectorSize from "../../../Test/Inspector/InspectorSize";

export default class ScaleProportionallyInspectorSize extends React.Component {
    constructor(props) {
        super(props);

        this.inspectorRef = React.createRef();
    }

    componentDidMount() {
        this.props.item && this.props.item.onPropsChange.addListener(this.onItemPropsChange);
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
        this.props.item && this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
    }

    onItemPropsChange = (owner) => {
        this.setState({reload: true});
    };

    getInspectorProps = () => {
        let {getScaleProportionally} = this.props;
        if (getScaleProportionally().enable) {
            return {
                widthUnits:["auto", "%", "px", "vh", "vw"],
                heightUnits:["auto", "%", "px", "vh", "vw"],
                minWidthUnits:["%", "px", "vh", "vw", "none"],
                minHeightUnits:["%", "px", "vh", "vw", "none"],
                maxWidthUnits:["%", "px", "vh", "vw", "none"],
                maxHeightUnits:["%", "px", "vh", "vw", "none"],
                disabledProps:[
                    'height', 'minHeight', 'maxHeight'
                ]
            }
        } else {
            return {
                widthUnits:["auto", "%", "px", "vh", "vw"],
                heightUnits:["auto", "%", "px", "vh", "vw"],
                minWidthUnits:["%", "px", "vh", "vw", "none"],
                minHeightUnits:["%", "px", "vh", "vw", "none"],
                maxWidthUnits:["%", "px", "vh", "vw", "none"],
                maxHeightUnits:["%", "px", "vh", "vw", "none"]
            }
        }
    }

    changeScaleProportionally = (e) => {
        let {setScaleProportionally, item} = this.props;
        setScaleProportionally(undefined, e.target.checked);

        if (e.target.checked) {
            let parentRect = item.props.parent.getSize(false);
            item.setStyleParam("height", "auto");
            item.setStyleParam("minHeight", "unset");
            this.inspectorRef.current.onUnitChange("width", "%", parentRect.scrollWidthMinusPadding);
        } else {
            let rect = item.getSize(false);
            item.setStyleParam("height", `${rect.height}px`);
            item.props.select.onScrollItem();
        }

        this.forceUpdate();
    }

    render() {
        let {getScaleProportionally} = this.props;
        console.log("ScaleProportionallyInspectorSize")
        return (
            <>
                <InspectorSize
                    ref={this.inspectorRef}
                    {...this.props}
                    {...this.getInspectorProps()}
                />

                <div className="MenuOptionAnimationOnceRoot">
                    <span className="InspectorOverflowDirTitle"
                          style={{width: "100%"}}
                    >Scale proportionally</span>

                    <Switch
                        className="InspectorOverflowDirSwitch"
                        checked={getScaleProportionally().enable || false}
                        onChange={this.changeScaleProportionally}
                    />
                </div>
            </>
        )
    }
}

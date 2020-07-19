import React from "react";
import {assignData, cloneObject} from "../../AwesomeGridLayoutUtils";
import {getCompositeDesignData} from "../../AwesomwGridLayoutHelper";
import {setData} from "../../BreakPointManager";
import InspectorBreadcrumbs from "../../Test/Inspector/InspectorBreadcrumbs";
import InspectorAligns from "../../Test/Inspector/InspectorAligns";
import InspectorSize from "../../Test/Inspector/InspectorSize";

export default class AGLComponent extends React.Component{
    constructor (props) {
        super(props);
    }

    resolveDesignData = () => {
        // Must Override
    };

    getData = () => {
        let componentData = this.getDefaultData && this.getDefaultData();
        let componentBpData = componentData.bpData;
        componentData = assignData(componentData, cloneObject(this.props.data));
        if (componentBpData) {
            let tempBpData = componentData.bpData;
            componentData.bpData = assignData(componentBpData, tempBpData);
        }

        return componentData;
    };

    getAgl = () => {
        return this.props.aglRef.current;
    };

    onDesignChange = (designKey, value) => {
        setData(this.props.griddata, designKey, value, this.props.breakpointmanager);
        this.updateDesign(getCompositeDesignData(this));
    };

    getInspector = () => {
        return (
            <>
                <InspectorBreadcrumbs
                    item={this.getAgl()}
                />
                <InspectorAligns
                    item={this.getAgl()}
                />
                <InspectorSize
                    item={this.getAgl()}
                    widthUnits={["auto", "%", "px", "vh", "vw"]}
                    heightUnits={["auto", "%", "px", "vh", "vw"]}
                    minWidthUnits={["%", "px", "vh", "vw", "none"]}
                    minHeightUnits={["%", "px", "vh", "vw", "none"]}
                    maxWidthUnits={["%", "px", "vh", "vw", "none"]}
                    maxHeightUnits={["%", "px", "vh", "vw", "none"]}
                />
            </>
        )
    };
}

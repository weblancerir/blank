import React from "react";
import {assignData, cloneObject} from "../../AwesomeGridLayoutUtils";
import {getCompositeDesignData, setDataInBreakpoint} from "../../AwesomwGridLayoutHelper";
import InspectorBreadcrumbs from "../../Test/Inspector/InspectorBreadcrumbs";
import InspectorAligns from "../../Test/Inspector/InspectorAligns";
import InspectorSize from "../../Test/Inspector/InspectorSize";
import InspectorPosition from "../../Test/Inspector/InspectorPosition";
import InspectorScroll from "../../Test/Inspector/InspectorScroll";
import InspectorPadding from "../../Test/Inspector/InspectorPadding";
import InspectorOverflow from "../../Test/Inspector/InspectorOverflow";
import InspectorAnchor from "../../Test/Inspector/InspectorAnchor";
import InspectorAdjustment from "../../Test/Inspector/InspectorAdjustment";
import {EditorContext} from "../../Editor/EditorContext";

export default class AGLComponent extends React.Component{
    static contextType = EditorContext;
    constructor (props) {
        super(props);
        console.log("AGLComponent constructor");
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

    getAglRef = () => {
        return this.props.aglRef;
    };

    showComponentCode = () => {
        if (!this.getAgl())
            return;

        let cloneProps = Object.assign({}, this.getAgl().props);
        console.log("showComponentCode" , JSON.stringify(this.getAgl().getClearProps(cloneProps)));;
        console.log("innerHtml" , this.getAgl().rootDivRef.current.innerHTML);
    }

    onDesignChange = (designKey, value) => {
        console.log("onDesignChange", designKey, value)
        setDataInBreakpoint(designKey, value, this.getAgl(), true, undefined, true);
        this.updateDesign(getCompositeDesignData(this.getAgl()));
    };

    getInspector = () => {
        if (this.getInspectorOverride)
            return this.getInspectorOverride();
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
                <InspectorOverflow
                    item={this.getAgl()}
                />
                <InspectorPosition
                    item={this.getAgl()}
                />
                <InspectorScroll
                    item={this.getAgl()}
                />
                <InspectorPadding
                    item={this.getAgl()}
                />
                <InspectorAdjustment
                    item={this.getAgl()}
                />
                <InspectorAnchor
                    item={this.getAgl()}
                />
            </>
        )
    };
}

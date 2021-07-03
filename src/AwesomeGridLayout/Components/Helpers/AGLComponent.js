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
    }

    resolveDesignData = () => {
        // Must Override
    };

    getData = () => {
        let componentData = (this.getDefaultData && this.getDefaultData()) || {};
        let componentBpData = componentData.bpData || {};

        componentData = assignData(componentData, cloneObject(this.props.data));

        if (this.props.id === "page")
            console.log("componentData1", componentData.bpData.grid);
        if (componentBpData) {
            let tempBpData = componentData.bpData;
            componentData.bpData = assignData(componentBpData, tempBpData);
        }

        let componentStaticData = (this.getStaticData && this.getStaticData()) || {};
        let componentStaticBpData = componentStaticData.bpData || {};
        delete componentStaticData.bpData;
        componentData = assignData(componentData, cloneObject(componentStaticData));
        if (componentStaticBpData) {
            componentData.bpData = assignData(componentData.bpData, componentStaticBpData);
        }

        if (this.props.id === "page")
            console.log("componentData2", componentData.bpData.grid);
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
        // console.log("showComponentCode" , JSON.stringify(this.getAgl().getClearProps(cloneProps)));;
        // console.log("innerHtml" , this.getAgl().rootDivRef.current.innerHTML);

        let componentData =
            {
                "tagName": this.props.tagName,
                "width": 3,
                "height": 2,
                "innerHtml": this.getAgl().rootDivRef.current.innerHTML,
                "presetProps": this.getAgl().getClearProps(cloneProps)
            }

        // Create new element
        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = JSON.stringify(componentData);
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);

        console.log("componentData" , componentData);
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

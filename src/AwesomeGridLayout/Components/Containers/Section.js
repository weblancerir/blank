import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";
import InspectorBreadcrumbs from "../../Test/Inspector/InspectorBreadcrumbs";
import InspectorAligns from "../../Test/Inspector/InspectorAligns";
import InspectorSize from "../../Test/Inspector/InspectorSize";
import InspectorOverflow from "../../Test/Inspector/InspectorOverflow";
import InspectorScroll from "../../Test/Inspector/InspectorScroll";
import InspectorPadding from "../../Test/Inspector/InspectorPadding";
import InspectorAnchor from "../../Test/Inspector/InspectorAnchor";
import MenuButton from "../../Menus/MenuBase/MenuButton";
import {setStyleParam} from "../../AwesomwGridLayoutHelper";
import SectionDesign from "./Menus/SectionDesign";

export default class Section extends AGLComponent{
    getDefaultData = () => {
        return {
            draggable: false,
            isContainer: true,
            bpData: {
                overflowData: {
                    state: "show"
                }
            },
            isSection: true
        };
    };

    resolveDesignData = () => {
    };

    getPrimaryOptions = () => {
        this.resolveDesignData();
        return [
            <MenuButton
                key={0}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/paint.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <SectionDesign
                        menuTitle={"Section Design"}
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                    />
                }
            />
        ]
    };

    updateDesign = (compositeDesign) => {
        setStyleParam("backgroundColor", compositeDesign.fillColor || "unset",
            this.getAgl(), 2, undefined, true);
    };

    getInspectorOverride = () => {
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
                    disabledProps={!this.props.isVerticalSection ? [
                        'width', 'minWidth', 'maxWidth'
                    ] : [
                        'height', 'minHeight', 'maxHeight'
                    ]}
                />
                <InspectorOverflow
                    item={this.getAgl()}
                />
                <InspectorScroll
                    item={this.getAgl()}
                    options={['none', 'sticky']}
                />
                <InspectorPadding
                    item={this.getAgl()}
                />
                <InspectorAnchor
                    item={this.getAgl()}
                />
            </>
        )
    };

    render() {
        return (
            <AGLWrapper tagName="Section"
                        defaultGridItemStyle={{
                            alignSelf: "stretch",
                            justifySelf: "stretch",
                            position: "relative",
                            gridArea: "2/1/3/2",
                        }}
                        aglComponent={this}
                        {...this.props}
                        style={{...{
                            width: "100%",
                            height: "auto",
                            minHeight: "500px",
                        }, ...this.props.style}}
                        designStyle={{...{
                                // backgroundColor: "#b3faf5",
                        }, ...this.props.designStyle}}
                        data={this.getData()}
                        autoConstraintsOff
                        helplineOff
                        isSection
                        as={"section"}
                        getInspector={this.getInspector}
                        getPrimaryOptions={this.getPrimaryOptions}
            >
            </AGLWrapper>
        )
    }
}

Section.defaultProps = {
    tagName: "Section"
};

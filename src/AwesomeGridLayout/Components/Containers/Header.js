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
import SectionDesign from "./Menus/SectionDesign";
import {parseColor, setStyleParam} from "../../AwesomwGridLayoutHelper";

export default class Header extends AGLComponent{
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
                        menuTitle={"Header Design"}
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
        let fillColor;

        console.log("updateDesign", compositeDesign.fillColor)
        if (compositeDesign.fillColor)
            fillColor = parseColor(compositeDesign.fillColor, compositeDesign.fillColor.alpha, this.props.editor);

        setStyleParam("backgroundColor", fillColor || "unset",
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
                    disabledProps={[
                        'width', 'minWidth', 'maxWidth'
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
            <AGLWrapper tagName="Header"
                        defaultGridItemStyle={{
                            alignSelf: "stretch",
                            justifySelf: "stretch",
                            position: "relative",
                            gridArea: "1/1/2/2",
                        }}
                        aglComponent={this}
                        {...this.props}
                        style={{
                            // backgroundColor: "#bcbcbc",
                            width: "100%",
                            height: "auto",
                            minHeight: "150px",
                            zIndex: "50"
                        }}
                        as="header"
                        autoConstraintsOff
                        helplineOff
                        isSection
                        data={this.getData()}
                        getInspector={this.getInspector}
                        getPrimaryOptions={this.getPrimaryOptions}
            >
            </AGLWrapper>
        )
    }
}

Header.defaultProps = {
    tagName: "Header"
};

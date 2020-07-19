import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";

export default class Section extends AGLComponent{
    getDefaultData = () => {
        return {
            draggable: false,
            isContainer: true,
            bpData: {
                overflowData: {
                    state: "show"
                }
            }
        };
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
                        {...this.props}
                        style={{...{
                            width: "100%",
                            height: "auto",
                            minHeight: "500px",
                        }, ...this.props.style}}
                        designStyle={{...{
                                backgroundColor: "#b3faf5",
                        }, ...this.props.designStyle}}
                        data={this.getData()}
                        autoConstraintsOff
                        helplineOff
                        as={"section"}
                        getInspector={this.getInspector}
            >
            </AGLWrapper>
        )
    }
}

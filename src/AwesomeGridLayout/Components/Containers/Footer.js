import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";

export default class Footer extends AGLComponent{
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
            <AGLWrapper tagName="Footer"
                        defaultGridItemStyle={{
                            alignSelf: "stretch",
                            justifySelf: "stretch",
                            position: "relative",
                            gridArea: "3/1/4/2",
                        }}
                        {...this.props}
                        style={{
                            backgroundColor: "#bcbcbc",
                            width: "100%",
                            height: "auto",
                            minHeight: "100px",
                            zIndex: "51"
                        }}
                        as="footer"
                        autoConstraintsOff
                        helplineOff
                        data={this.getData()}
                        getInspector={this.getInspector}
            >
            </AGLWrapper>
        )
    }
}

import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";

export default class Header extends AGLComponent{
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
            <AGLWrapper tagName="Header"
                        defaultGridItemStyle={{
                            alignSelf: "stretch",
                            justifySelf: "stretch",
                            position: "relative",
                            gridArea: "1/1/2/2",
                        }}
                        {...this.props}
                        style={{
                            backgroundColor: "#bcbcbc",
                            width: "100%",
                            height: "auto",
                            minHeight: "150px",
                            zIndex: "50"
                        }}
                        as="header"
                        autoConstraintsOff
                        helplineOff
                        data={this.getData()}
                        getInspector={this.getInspector}
            >
            </AGLWrapper>
        )
    }
}

import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";

export default class VerticalSpacer extends AGLComponent{
    render() {
        return (
            <AGLWrapper
                tagName="VerticalSpacer"
                {...this.props}
                data={this.getData()}
                style={{
                    width: "100%",
                    height: "20px"
                }}
            />
        )
    }
}

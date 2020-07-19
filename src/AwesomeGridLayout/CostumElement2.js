import React from "react";

export default class CustomElement2 extends React.Component{
    onClick = () => {
        console.log("Click from custom element 2");
    };

    render () {
        return (
            <button onClick={this.onClick}
                     style={{
                         width: "100%",
                         height: "100%",
                     }}
                     id="cont2"
            >
                Test Me 2
            </button>
        )
    }
}

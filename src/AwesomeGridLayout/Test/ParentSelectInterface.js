import React from "react";

export default class ParentSelectInterface extends React.Component {
    render() {
        return (
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                    border: '1px solid rgb(2 50 255 / 40%)'
                }}
            />
        )
    }
}

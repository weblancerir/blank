import React from "react";

export default class PaddingInterface extends React.Component {
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
                    borderTop: this.props.padding.top ? `${this.props.padding.top} solid rgba(2, 242, 255, 0.3` : "unset",
                    borderLeft: this.props.padding.left ? `${this.props.padding.left} solid rgba(2, 242, 255, 0.3)` : "unset",
                    borderBottom: this.props.padding.bottom ? `${this.props.padding.bottom} solid rgba(2, 242, 255, 0.3)` : "unset",
                    borderRight: this.props.padding.right ? `${this.props.padding.right} solid rgba(2, 242, 255, 0.3)` : "unset"
                }}
            />
        )
    }
}

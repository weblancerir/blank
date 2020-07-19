import React from "react";
import './Adjustment.css'

export default class AdjustmentHelpSize extends React.Component {
    getText = () => {
        let {width, height} = this.props.resizeHelpData;

        return `${width? "W: " + width.toFixed(0).toString() + "  ": ""}
        ${height? "H: " + height.toFixed(0).toString() + "": ""}`;
    };
    render () {
        let {x, y} = this.props.resizeHelpData;
        return (
            <div
                id="AdjustmentHelpSize"
                className="AdjustmentHelpSizeRoot"
            >
                <p
                    style={{
                        position: "absolute",
                        top: y,
                        left: x,
                        margin: 0,
                        transform: "translateX(20px) translateY(20px)",
                        fontSize: "0.65em",
                        color: "#ffffff",
                        backgroundColor: "#4b4b4b",
                        padding: 4,
                        borderRadius: 4,
                        width: "fit-content"
                    }}
                >
                    {this.getText()}
                </p>
            </div>
        )
    }
}

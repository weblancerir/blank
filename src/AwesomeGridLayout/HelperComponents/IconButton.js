import React from "react";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";

export default class IconButton extends React.Component {
    render () {
        return (
            <ButtonBase
                aria-label={this.props["aria-label"] || "aria-label"}
                onClick={this.props.onClick}
                style={{...{
                    marginLeft: 4,
                    borderRadius: 4
                }, ...this.props.buttonBaseStyle}}
                className={this.props.className}
            >
                <div style={{...{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                }, ...this.props.imageContainerStyle}}>
                    {
                        this.props.icon
                    }
                    {
                        this.props.children
                    }
                </div>
            </ButtonBase>
        )
    }
}

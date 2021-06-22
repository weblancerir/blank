import React from "react";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";

export default class IconButton extends React.Component {
    render () {
        let selectStyle = {};
        if (this.props.selected) {
            selectStyle.backgroundColor = this.props.selectedColor || "#8ae8f6"
        }

        let buttonProps = Object.assign({}, this.props);
        delete buttonProps.buttonBaseStyle;
        delete buttonProps.imageContainerStyle;
        delete buttonProps.icon;

        return (
            <ButtonBase
                aria-label={this.props["aria-label"] || "aria-label"}
                style={{...{
                    marginLeft: 4,
                    borderRadius: 4,
                    boxSizing: "border-box",
                    ...selectStyle
                }, ...this.props.buttonBaseStyle}}
                ref={this.props.rootRef}
                {...buttonProps}
            >
                <div style={{...{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 6,
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

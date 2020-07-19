import React from "react";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import IconButton from "../../../HelperComponents/IconButton";

export default class RightClick extends React.Component {
    onClick = (e) => {
        console.log("RightClick Clicked !!!");
    };

    render() {
        return (
            <IconButton
                onClick={this.onClick}
            >
                <img
                    draggable={false}
                    width={16}
                    height={16}
                    src={require('../../../icons/more.svg')}
                />
            </IconButton>
        )
    }
}

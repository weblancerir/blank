import React from "react";
import IconButton from "../../../HelperComponents/IconButton";

export default class RightClick extends React.Component {
    onClick = (e) => {
        this.props.onClick && this.props.onClick(e);
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

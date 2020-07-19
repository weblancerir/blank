import React from "react";
import IconButton from "../../../HelperComponents/IconButton";
import '../../../HelperStyle.css';

export default class Help extends React.Component {
    onClick = (e) => {
        console.log("Help Clicked !!!");
    };

    render () {
        return (
            <IconButton
                onClick={this.onClick}
            >
                <img
                    draggable={false}
                    width={16}
                    height={16}
                    src={require('../../../icons/question.svg')}
                />
            </IconButton>
        )
    }
}

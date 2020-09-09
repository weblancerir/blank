import React from "react";
import './MenuBase.css';
import '../../HelperStyle.css';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";

export default class MenuBaseIndexTitle extends React.Component {
    render () {
        return (
            <div
                className="MenuBaseIndexTitle"
            >
                <ButtonBase
                    disableRipple={!this.props.onIndexClick}
                    onClick={(e) => {
                        this.props.onIndexClick &&
                        this.props.onIndexClick(e, this.props.title, this.props.index)
                    }}
                >
                    <span>
                        {this.props.title}
                    </span>
                </ButtonBase>
            </div>
        )
    }
}

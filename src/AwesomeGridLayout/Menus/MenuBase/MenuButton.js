import React from "react";
import './MenuBase.css';
import IconButton from "../../HelperComponents/IconButton";

export default class MenuButton extends React.Component {
    componentDidMount(){
        this.mounted = true;
    }

    componentWillUnmount(){
        this.mounted = false;
    }

    onClick = (e) => {
        let {menu} = this.props;
        this.props.select.updateMenu((typeof menu === "function") ? menu(e) : menu);
    };

    render () {
        return (
            <IconButton
                onClick={this.onClick}
            >
                {
                    this.props.icon
                }
                {
                    this.props.children
                }
            </IconButton>
        )
    }
}

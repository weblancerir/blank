import React from "react";
import './MenuBase.css';
import IconButton from "../../HelperComponents/IconButton";
import LightTooltip from "../../Components/Containers/Menus/Components/LightTooltip";
import Tooltip from '@material-ui/core/Tooltip';

export default class MenuButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {openTooltip: false};
    }

    componentDidMount(){
        this.mounted = true;
    }

    componentWillUnmount(){
        this.mounted = false;
    }

    onClick = (e) => {
        if (this.props.onClick) {
            this.props.onClick(e);
            return;
        }

        let {menu} = this.props;
        this.props.select.updateMenu((typeof menu === "function") ? menu(e) : menu);
    };

    toggleTooltip = (openTooltip) => {
        this.setState({openTooltip})
    }

    render () {
        let {hide, title} = this.props;
        let {openTooltip} = this.state;

        if (hide)
            return null;

        return (
            <LightTooltip
                open={openTooltip}
                title={title || ""}
                placement="top"
                PopperProps={{style:{zIndex: 999999999999999}}}
            >
                <IconButton
                    onClick={this.onClick}
                    onMouseEnter={() => this.toggleTooltip(true)}
                    onMouseLeave={() => this.toggleTooltip(false)}
                >
                    {
                        this.props.icon
                    }
                    {
                        this.props.children
                    }
                </IconButton>
            </LightTooltip>
        )
    }
}

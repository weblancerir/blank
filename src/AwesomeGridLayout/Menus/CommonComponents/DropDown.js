import React from "react";
import './CommonMenu.css';
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

export default class DropDown extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showUnits: false
        };

        this.unitIconButton = React.createRef();
    }

    onClick = (e) => {
        this.setState({anchorEl: e.currentTarget});
    };

    onChange = (option) => {
        this.props.onChange(option);
    };

    getValue = () => {
        if (this.props.valueRenderer) {
            return this.props.valueRenderer(this.props.value) ||
                (this.props.renderer && this.props.renderer(this.props.value)) ||
                this.props.value || "";
        } else {
            return this.props.value || "";
        }
    }

    render () {
        return (
            <div className="DropDownRoot">
                <span
                    className="DropDownSpan"
                    style={{...this.props.spanStyle, ...{
                        cursor: "pointer"
                    }}}
                    onClick={this.onClick}
                >
                    {console.log("DropDown", this.getValue())}
                    {this.getValue()}
                </span>

                <Menu
                    style={{...{
                            zIndex: 99999999999
                        }, ...this.props.menuStyle}}
                    anchorEl={this.state.anchorEl}
                    open={this.state.anchorEl !== undefined}
                    onClose={(e) => {
                        this.setState({anchorEl: undefined});
                    }}
                    MenuListProps={{
                        style: {
                            padding: 0,
                            width: this.props.spanStyle? this.props.spanStyle.width: "auto"
                        }
                    }}
                >
                    {
                        this.props.options.map((option, i) => {
                            return (
                                <MenuItem
                                    dense
                                    key={i}
                                    onClick={(e) => {
                                        if (this.props.onChange)
                                            this.props.onChange(option);

                                        this.setState({anchorEl: undefined});
                                    }}
                                    style={{...(option.disabled && {
                                        pointerEvents: "none"
                                    })}}
                                >
                                    <span style={{
                                        width: "100%"
                                    }}>
                                        {this.props.renderer ? this.props.renderer(option) : option}
                                    </span>
                                </MenuItem>
                            )
                        })
                    }
                </Menu>

                <div
                    className="DropDOwnArrow"
                >
                    <img width={10} height={10} src={"/static/icon/down-arrow.svg"}/>
                </div>

                {
                    this.props.disabled &&
                    <div
                        className="DropDOwnDisabled"
                        style={this.props.spanStyle}
                    />
                }
            </div>
        )
    }
}

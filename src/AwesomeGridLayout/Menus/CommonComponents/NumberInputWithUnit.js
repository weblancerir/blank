import React from "react";
import './CommonMenu.css';
import IconButton from "../../HelperComponents/IconButton";
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import classNames from "classnames";

export default class NumberInputWithUnit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showUnits: false
        };

        this.unitIconButton = React.createRef();
    }

    inputFilter = (value, oldValue) => {
        let okay = false;
        try {
            value = parseFloat(value);
            if (!isNaN(value))
                okay = true;
        } catch {}
        if (okay) {
            value = Math.min(this.props.max, value);
            value = Math.max(this.props.min, value);
            return value;
        } else if (value === "" || isNaN(value)) {
            return "0";
        }

        return oldValue;
    };

    onChange = (e) => {
        let value = e.target.value;
        if (value.endsWith("."))
            value += "0";
        value = this.inputFilter(value, this.getValue(this.props.value));
        this.props.onChange(value);
    };

    onShowUnits = (e) => {
        this.setState({anchorEl: e.currentTarget});
    };

    getValue = (value) => {
        if (!value)
            return "";

        if (typeof value !== 'string')
            return value;

        if (value.includes("%")) {
            return Math.round(parseFloat(value.replace("%", "")) * 10) / 10;
        }

        if (value.includes("px")) {
            return Math.round(parseFloat(value.replace("px", "")) * 10) / 10;
        }

        if (value.includes("vh")) {
            return Math.round(parseFloat(
                value.replace(/[^0-9\.]/g, '')
            ) * 10) / 10;
        }

        if (value.includes("vw")) {
            return Math.round(parseFloat(
                value.replace(/[^0-9\.]/g, '')
            ) * 10) / 10;
        }

        return value;
    };

    render () {
        let classes = classNames(
            "NumberInputWithUnit",
            this.props.className
        );

        return (
            <div className={classes}>
                <input
                    style={{...{
                        textAlign: "left",
                        width: 64
                    }, ...this.props.inputStyle}}
                    className="NumberInput"
                    value={!["%", "px", "vw", "vh", "°"].includes(this.props.unit) ? "" :
                        (this.getValue(this.props.value) || 0)}
                    onChange={this.onChange}
                    type="text"
                    disabled={!["%", "px", "vw", "vh", "°"].includes(this.props.unit) || this.props.disabled}
                >
                </input>

                <IconButton
                    ref={this.unitIconButton}
                    className="InputUnitButton"
                    buttonBaseStyle={{
                        marginLeft: 0,
                    }}
                    imageContainerStyle={{
                        padding: 6
                    }}
                    onClick={!this.props.disabled ? this.onShowUnits : undefined}
                    style={this.props.unitButtonStyle}
                    disabled={this.props.disableUnit}
                >
                    <span style={{
                        color: "#0a108b"
                    }}>
                        {this.props.unit || "none"}
                    </span>
                </IconButton>

                <Menu
                    style={{...{
                            zIndex: 99999999999
                        }, ...this.props.unitMenuStyle}}
                    anchorEl={this.state.anchorEl}
                    open={this.state.anchorEl !== undefined}
                    onClose={(e) => {
                        this.setState({anchorEl: undefined});
                    }}
                    MenuListProps={{
                        style: {
                            padding: 0
                        }
                    }}
                >
                    {
                        this.props.units.map((unit, i) => {
                            return (
                                <MenuItem
                                    dense
                                    key={i}
                                    onClick={(e) => {
                                        if (this.props.onUnitChange)
                                            this.props.onUnitChange(unit);

                                        this.setState({anchorEl: undefined});
                                    }}
                                >
                                    <span style={{
                                        color: "#0a108b"
                                    }}>
                                        {unit}
                                    </span>
                                </MenuItem>
                            )
                        })
                    }
                </Menu>

                {
                    this.props.disabled &&
                    <div
                        className="NumberInputWithUnitDisabled"
                        style={{...{
                                textAlign: "left",
                                width: 64
                            }, ...this.props.inputStyle}}
                    >

                    </div>
                }
            </div>
        )
    }
}

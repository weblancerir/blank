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
            okay = true;
        } catch {}
        if (okay) {
            value = Math.min(this.props.max, value);
            value = Math.max(this.props.min, value);
            return value;
        } else if (value === "") {
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
        console.log("onShowUnits", e.currentTarget);
        this.setState({anchorEl: e.currentTarget});
    };

    getValue = (value) => {
        if (!value)
            return "value";

        if (value.includes("%")) {
            return Math.round(parseFloat(value.replace("%", "")) * 100) / 100;
        }

        if (value.includes("px")) {
            return Math.round(parseFloat(value.replace("px", "")) * 100) / 100;
        }

        if (value.includes("vh")) {
            return Math.round(parseFloat(value.replace("vh", "")) * 100) / 100;
        }

        if (value.includes("vw")) {
            return Math.round(parseFloat(value.replace("vw", "")) * 100) / 100;
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
                    style={{
                        textAlign: "left",
                        width: 64,
                        height: 20
                    }}
                    className="NumberInput"
                    value={!["%", "px", "vw", "vh"].includes(this.props.unit) ? "" :
                        (this.getValue(this.props.value) || 0)}
                    onChange={this.onChange}
                    type="text"
                    disabled={!["%", "px", "vw", "vh"].includes(this.props.unit)}
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
                    onClick={this.onShowUnits}
                >
                    <span style={{
                        color: "#0a108b"
                    }}>
                        {this.props.unit}
                    </span>
                </IconButton>

                <Menu
                    style={{
                        zIndex: 99999999999
                    }}
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
            </div>
        )
    }
}

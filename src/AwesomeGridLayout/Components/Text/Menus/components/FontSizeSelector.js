import React from "react";
import TextField from "@material-ui/core/TextField";
import FontSizeAutoComplete from "./FontSizeAutoComplete";

export default class FontSizeSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }
    filterOptions = (options) => {
        return ["6","8","10","12","14","16","18","20","22","24","28","32","48","72"];
    }

    getAllowableFontSize = () => {
        return (new Array(100)).fill("0").map((v, i) => {
            return `${i + 1}`;
        });
    }

    setForceValue = (value) => {
        this.onFontSizeChange(undefined, value, "input");
    }

    onFontSizeChange = (e, value, reason) => {
        console.log("onFontSizeChange value reason", value, reason);
        if (reason === "input") {
            console.log("onFontSizeChange input", value);
            this.setState({tempFontSize: value});
        } else if (reason === "select-option") {
            console.log("onFontSizeChange select-option", value);
            this.setFontSize(value);
        } else if (reason === "enter") {
            console.log("onFontSizeChange enter", value, this.getAllowableFontSize());
            if (this.getAllowableFontSize().includes(value))
                this.setFontSize(value);
            else
                this.setState({tempFontSize: this.getFontSizeValue(value !== "" && true)});
        }
    }

    setFontSize = (value) => {
        this.setState({tempFontSize: value});
        this.props.onChange(value);
    }

    setFontSizeUi = (value) => {
        this.setState({tempFontSize: value});
    }

    getFontSizeValue = (ignoreState = false) => {
        let {textTheme, textStaticData, textDesignData} = this.props;

        if (!ignoreState && this.state.tempFontSize !== undefined)
            return this.state.tempFontSize;

        return (!ignoreState && this.state.tempFontSize) ||
            (textDesignData.fontSize && textDesignData.fontSize.toString()) ||
            (textTheme.fontSize &&
                textTheme.fontSize.toString()) ||
            "22"
    }

    render () {
        return (
            <FontSizeAutoComplete
                size={"small"}
                options={this.getAllowableFontSize()}
                value={this.getFontSizeValue()}
                getOptionLabel={(option) => option}
                filterOptions={this.filterOptions}
                style={this.props.style || { width: 64 }}
                popupIcon={
                    <img width={10} height={10} src={process.env.PUBLIC_URL + "/static/icon/down-arrow.svg"}/>
                }
                renderInput={(params) => {
                    params.InputProps.disableUnderline = true;
                    params.inputProps.style = {padding: 0, fontSize: 14};
                    return (
                        <TextField {...params} onChange={(e) => {
                            this.onFontSizeChange(e, e.target.value, 'input');
                        }}/>
                    )
                }}
                blurOnSelect
                onChange={this.onFontSizeChange}
                onKeyDown={(e) => {
                    if((e.keyCode || e.which) === 13){
                        this.onFontSizeChange(e, e.target.value, 'enter');
                    }
                }}
            />
        )
    }
}

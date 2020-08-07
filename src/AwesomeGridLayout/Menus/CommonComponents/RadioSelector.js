import React from "react";
import './CommonMenu.css';
import RadioGroup from "@material-ui/core/RadioGroup/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Radio from "@material-ui/core/Radio/Radio";

export default class RadioSelector extends React.Component {
    onChange = (e) => {
        // let value = this.inputFilter(e.target.value, this.props.value);
        // this.props.onChange(value);
    };

    render () {
        return (
                <RadioGroup className="RadioSelectorRoot"
                            aria-label="gender" name="gender1" value={value} onChange={handleChange}>
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="other" control={<Radio />} label="Other" />
                    <FormControlLabel value="disabled" disabled control={<Radio />} label="(Disabled option)" />
                </RadioGroup>
        )
    }
}

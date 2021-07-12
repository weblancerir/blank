import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {inputCopyPasteHandler} from "../../../../AwesomwGridLayoutHelper";

const useStyles = makeStyles({
    popper: {
        zIndex: 999999999999999999
    },
    root: {
        display: "flex",
        alignItems: "center",
        borderRight: "1px solid #c6c6c6",
        paddingRight: 12
    }
});

export default function FontSizeAutoComplete(props) {
    const classes = useStyles();

    return (
        <Autocomplete
            classes={{
                popper: classes.popper,
                root: classes.root
            }}
            {...props}
        />
    );
}

export function RoughInput(props) {
    return (
        <Autocomplete
            id="custom-input-demo"
            options={[]}
            onChange={
                props.onChange
            }
            onBlur={
                props.onBlur
            }
            onKeyDown={
                props.onKeyDown
            }
            renderInput={(params) => (
                // <div ref={params.InputProps.ref}>
                    <input
                        {...params.inputProps}
                        className="NumberInput PageManagerRenameInput PageInfoNameInput LinkGeneratorOptionWebAddressInput"
                        type="text"
                        onKeyDown={inputCopyPasteHandler}
                    >
                    </input>
                // </div>
            )}
        />
    );
}

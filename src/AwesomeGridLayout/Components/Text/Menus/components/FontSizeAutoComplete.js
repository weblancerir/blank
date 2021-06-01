import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

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

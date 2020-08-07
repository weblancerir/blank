import Switch from "@material-ui/core/Switch/Switch";
import withStyles from "@material-ui/core/styles/withStyles";

const DockSwitch = withStyles((theme) => ({
    root: {
        width: 42,
        height: 10,
        padding: 4,
        display: 'flex',
    },
    switchBase: {
        padding: 0,
        color: "#d2d2d2",
        '&$checked': {
            transform: 'translateX(28px) scale(1)',
            color: "#849dff",
            '& + $track': {
                opacity: 1,
                backgroundColor: "#849dff",
            },
        },
    },
    thumb: {
        width: 10,
        height: 10,
        boxShadow: 'none',
    },
    track: {
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: "#a2a2a2",
    },
    checked: {},
}))(Switch);

export default DockSwitch;

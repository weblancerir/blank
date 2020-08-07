import withStyles from "@material-ui/core/styles/withStyles";
import Radio from "@material-ui/core/Radio/Radio";

const AglRadio = withStyles((theme) => ({
    root: {
        padding: 6,
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
    checked: {
        color: '#137cbd',
    },
}))(Radio);

export default AglRadio;

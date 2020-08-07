import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const LightTooltip = withStyles(theme => ({
    tooltip: {
        backgroundColor: "#fff",
        color: '#000000',
        boxShadow: theme.shadows[1],
        fontSize: 14,
    },
}))(Tooltip);

export default LightTooltip

export const LightMenuTooltip = withStyles(theme => ({
    tooltip: {
        backgroundColor: "#fff",
        color: '#000000',
        boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
        fontSize: 14,
        padding: 0
    },
}))(Tooltip);

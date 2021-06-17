import React from "react";
import '../../HelperStyle.css';
import './HorizontalMenu.css';
import {EditorContext} from "../../Editor/EditorContext";
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';

export default class FreeDropDownMenu extends React.Component{
    static contextType = EditorContext;
    constructor (props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount() {
    }

    render() {
        let {open, anchorEl} =  this.props;
        return (
            <Popper open={open} anchorEl={anchorEl} role={undefined} transition>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper
                            className={this.props.className}
                            style={this.props.style}
                        >
                            <ClickAwayListener onClickAway={this.props.onClose}>
                                <MenuList autoFocusItem={open} id="menu-list-grow"
                                >
                                    {
                                        this.props.children
                                    }
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        )
    }
}

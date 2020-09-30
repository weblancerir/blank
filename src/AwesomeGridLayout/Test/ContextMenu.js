import React from "react";
import Divider from "../Menus/CommonComponents/Divider";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import {LightMenuTooltip} from "../Components/Containers/Menus/Components/LightTooltip";
import {isLeftClick} from "../AwesomwGridLayoutHelper";
import Popper from "@material-ui/core/Popper/Popper";
import Paper from "@material-ui/core/Paper/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList/MenuList";

export default class ContextMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    getFakeAnchor = (clientX, clientY) => {
        return {
            clientWidth: 0,
            clientHeight: 0,
            getBoundingClientRect: () => {
                return {
                    top: clientY,
                    left: clientX,
                    width: 0,
                    height: 0,
                    bottom: clientY,
                    right: clientX
                }
            }
        }
    }

    render () {
        let {menu, clientX, clientY, popperStyle, onClose} = this.props;
        return (
            <>
                <Popper
                    style={{...{
                            zIndex: 99999999999999
                        }, ...popperStyle}}
                    // anchorReference="anchorPosition"
                    // anchorPosition={
                    //     clientY !== null && clientX !== null
                    //         ? { top: clientY, left: clientX }
                    //         : undefined
                    // }
                    anchorEl={this.getFakeAnchor(clientX, clientY)}
                    open={true}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    placement="bottom-start"
                >
                    <Paper style={{
                        boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
                    }}>
                        <ClickAwayListener onClickAway={onClose} mouseEvent='onMouseDown'>
                            <MenuList autoFocusItem={true} style={{padding: 0}}
                                      onPointerDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                      }}
                            >
                                {
                                    menu.map((section, i) => {
                                        let hasDivider = (i !== menu.length - 1);
                                        return (
                                            [
                                                section.map((menuItem, j) => {
                                                    return (
                                                        <ContextMenuItem
                                                            key={`${i}${j}`}
                                                            onClose={onClose}
                                                            menuItem={menuItem}
                                                        />
                                                    )
                                                }),
                                                hasDivider && <Divider style={{
                                                    width: "100%",
                                                    margin: 0,
                                                    display: "block"
                                                }}/>
                                            ]
                                        )
                                    })
                                }
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Popper>
            </>
        )
    }
}

export class ContextMenuItem extends React.Component {
    render () {
        let {menuItem, onClose} = this.props;

        if (!menuItem.subMenu)
            return (
                <MenuItem
                    dense
                    onClick={(e) => {
                        if (menuItem.onClick) {
                            menuItem.onClick(e);
                            onClose && onClose(e);
                        }
                    }}
                    onPointerDown={(e) => {
                        if (!isLeftClick(e)) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                >
                    <span style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        alignItems: "center",
                        width: "100%"
                    }}>
                        {menuItem.name}
                        <span style={{
                            fontSize: 10,
                            marginLeft: 24,
                            color: "#9a9a9a"
                        }}>
                            {
                                menuItem.shortcut
                            }
                        </span>
                    </span>
                </MenuItem>
            );
        else
            return (
                <LightMenuTooltip
                    title={
                        menuItem.subMenu.map((menuItem, j) => {
                            return (
                                <ContextMenuItem
                                    key={`${j}`}
                                    onClose={onClose}
                                    menuItem={menuItem}
                                />
                            )
                        })
                    }
                    interactive
                    placement="right"
                    leaveDelay={200}
                    PopperProps={{
                        style: {
                            zIndex: 99999999999999,
                        },
                        modifiers:{
                            flip: {
                                enabled: true,
                            },
                            preventOverflow: {
                                enabled: true,
                                boundariesElement: 'viewport',
                            },
                        }}
                    }
                >
                    <MenuItem
                        dense
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation()
                        }}
                    >
                        <span style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            alignItems: "center",
                            width: "100%"
                        }}>
                            {menuItem.name}
                            <img draggable={false} width={8} height={8}
                                 src={process.env.PUBLIC_URL + '/static/icon/right-arrow.svg'}
                                style={{
                                    marginLeft: 24,
                                    color: "#9a9a9a"
                                }}
                            />
                    </span>
                    </MenuItem>
                </LightMenuTooltip>
            )
    }
}

/*
* Structure of input menu object
* [
*   [ // each section has one array
    *   {
    *       name: "delete",
    *       onClick: function,
    *       icon: <img ... />
    *       shortcut: "Ctrl + D"
    *       subMenu: {other Menu}
    *   }
*   ]
* ]
* */

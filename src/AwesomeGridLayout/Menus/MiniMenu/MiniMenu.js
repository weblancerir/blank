import React from "react";
import './MiniMenu.css';
import RightClick from "./Components/RightClick";
import MiniMenuVerticalDivider from "./MiniMenuVerticalDivider";
import Popper from "@material-ui/core/Popper/Popper";
import Help from "./Components/Help";
import {isHideInBreakpoint} from "../../AwesomwGridLayoutHelper";

const miniMenuId = "wl_mini_menu";
export default class MiniMenu extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            clear: true
        };
    }

    clear = () => {
        this.setState({clear: true});
    };

    update = (itemId, shortcut, primary, item) => {
        this.setState({
            itemId
            , shortcut, primary, clear: false,
            item
        })
    };

    getAnchor = () => {
        return document.getElementById(`${this.state.itemId}_child_holder`) ||
            document.getElementById(this.state.itemId);
    };

    render () {
        if (this.state.clear)
            return null;
        if (!this.state.itemId || !this.getAnchor() ||
            isHideInBreakpoint(this.state.item))
            return null;
        return (
            <Popper
                key={"miniMenu"}
                open={true}
                anchorEl={this.getAnchor()}
                placement="bottom-start"
                style={{
                    zIndex: 9999999
                }}
                modifiers={{
                    flip: {
                        enabled: true,
                    },
                    preventOverflow: {
                        enabled: true,
                        boundariesElement: 'scrollParent',
                    },
                }}
            >
                <div className="MiniMenuRoot"
                     id={miniMenuId}
                     style={{
                        opacity:  !this.state.clear? 1: 0
                     }}
                >
                    <div className="MiniMenuContainer"
                    >
                        {
                            !this.state.clear &&
                            this.state.shortcut.map(option => {
                                return option;
                            })
                        }

                        {
                            !this.state.clear &&
                            this.state.shortcut.length > 0 && <MiniMenuVerticalDivider/>
                        }

                        {
                            !this.state.clear &&
                            this.state.primary.map(option => {
                                return option;
                            })
                        }

                        {
                            !this.state.clear &&
                            this.state.primary.length > 0 && <MiniMenuVerticalDivider/>
                        }

                        <Help/>
                        <RightClick/>
                    </div>
                </div>
            </Popper>
        )
    }
}

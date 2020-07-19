import React from "react";
import './MiniMenu.css';
import RightClick from "./Components/RightClick";
import MiniMenuVerticalDivider from "./MiniMenuVerticalDivider";
import Popper from "@material-ui/core/Popper/Popper";
import Help from "./Components/Help";

const miniMenuId = "wl_mini_menu";
export default class MiniMenu extends React.Component {
    componentDidMount(){
        this.mounted = true;
    }

    componentWillUnmount(){
        this.mounted = false;
    }

    getAnchor = () => {
        return document.getElementById(this.props.itemId)
    };

    render () {
        return (
            <Popper
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
                >
                    <div className="MiniMenuContainer"
                    >
                        {
                            this.props.shortcut.map(option => {
                                return option;
                            })
                        }

                        {
                            this.props.shortcut.length > 0 && <MiniMenuVerticalDivider/>
                        }

                        {
                            this.props.primary.map(option => {
                                return option;
                            })
                        }

                        {
                            this.props.primary.length > 0 && <MiniMenuVerticalDivider/>
                        }

                        <Help/>
                        <RightClick/>
                    </div>
                </div>
            </Popper>
        )
    }
}

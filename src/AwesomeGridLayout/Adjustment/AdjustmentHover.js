import React from "react";
import './Adjustment.css'
import Popper from "@material-ui/core/Popper/Popper";

export default class AdjustmentHover extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: true
        };
    }

    update = (item, size, clear) => {
        if (!clear)
            if (!item.state.selected)
                this.setState({item, size, itemId: item.props.id});
            else
                this.setState({item, size, itemId: undefined});
        else {
            if (this.state.itemId === item.props.id) {
                this.setState({item, size, itemId: undefined});
            }
        }
    };

    activate = (active) => {
        this.setState({active});
    };

    render () {
        if (!this.state.active)
            return null;

        if (!this.state.itemId)
            return null;
        return (
            <Popper
                open={true}
                anchorEl={document.getElementById(this.state.itemId)}
                placement="top-start"
                style={{
                    zIndex: 9999999,
                    pointerEvents: "none"
                }}
                disablePortal={false}
                modifiers={{
                    flip: {
                        enabled: false
                    },
                    preventOverflow: {
                        enabled: false,
                    },
                    hide: {
                        enabled: false,
                    },
                }}
            >
                {
                    this.state.itemId ?
                        <div
                            className="AwesomeGridLayoutRootHover"
                            key={`hover`}
                            style={{
                                width: this.state.size ? this.state.size.width : 0,
                                height: this.state.size ? this.state.size.height : 0,
                            }}
                        >
                            <span className="AGLHoverCompName">
                                {this.state.item.props.tagName}
                            </span>
                        </div>
                        :
                        <div></div>
                }
            </Popper>
        )
    }
}

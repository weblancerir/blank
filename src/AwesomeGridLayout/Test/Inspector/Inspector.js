import React from "react";
import './Inspector.css';
import IconButton from "../../HelperComponents/IconButton";
import {EditorContext} from "../../Editor/EditorContext";

export default class Inspector extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
            percent: props.open? 100: 0,
            inspectorMenu: undefined
        };

        this.opening = false;
        this.closing = false;
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    open = () => {
        this.opening = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        this.setState({ open: true});
        this.openInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.openInterval);
                return;
            }
            let percent = this.state.percent += (this.props.speed * this.props.interval / 1000);
            if (percent >= 100) {
                this.opening = false;
                clearInterval(this.openInterval);
            }
            percent = Math.min(100, percent);
            this.setState({percent});
        }, this.props.interval);
    };

    close = (force) => {
        this.closing = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        this.setState({ open: false});
        if (force) {
            this.setState({percent: 0});
            return;
        }
        this.closeInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.closeInterval);
                return;
            }
            let percent = this.state.percent -= (this.props.speed * this.props.interval / 1000);
            if (percent <= 0) {
                this.closing = false;
                clearInterval(this.closeInterval);
            }
            percent = Math.max(0, percent);
            this.setState({percent});
        }, this.props.interval);
    };

    toggle = (force) => {
        if (this.context.inspectorPinned) {
            this.props.pinInspector();
            this.close(force);
            return;
        }

        let toggleState = !this.state.open;
        this.state.open ? this.close(force) : this.open();

        return toggleState;
    };

    setMenu = (inspectorMenu) => {
        this.setState({inspectorMenu});
    };

    getDefaultMenu = () => {
        return <div
            className="InspectorDefaultMenuRoot"
        >
            <span>
                Select a component to show options
            </span>
        </div>
    };

    render () {
        return (
            <>
                <div
                    className="InspectorRoot"
                    style={{...
                        !this.context.inspectorPinned ? {
                            right: `${this.state.percent - 100}%`,
                            opacity: this.state.percent / 100
                        } : {right: "0%", opacity: 1},
                        ...{
                        }}
                    }
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <div style={{
                    }}>
                    <div className="InspectorPin">
                        <IconButton
                            buttonBaseStyle={{
                                marginLeft: 0,
                                borderRadius: "50%",
                                backgroundColor: this.context.inspectorPinned && "#8d8d8d"
                            }}
                            onClick={(e) => {
                                this.props.pinInspector();
                            }}
                        >
                            <img
                                draggable={false}
                                width={12}
                                height={12}
                                src={this.context.inspectorPinned ?
                                    '/static/icon/pin-white.svg':
                                        '/static/icon/pin.svg'}
                            />
                        </IconButton>
                    </div>
                    {
                        this.state.inspectorMenu || this.getDefaultMenu()
                    }
                    </div>
                </div>
                {
                    this.context.inspectorPinned &&

                    <div
                        className="InspectorPinRoot"
                    >
                    </div>
                }

            </>
        )
    }
}

Inspector.defaultProps = {
    open: false,
    speed: 400,
    interval: 5
};

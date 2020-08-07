import React from "react";
import './Inspector.css';

export default class Inspector extends React.Component {
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
        this.openInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.openInterval);
                return;
            }
            let percent = this.state.percent += (this.props.speed * this.props.interval / 1000);
            if (percent > 100) {
                this.opening = false;
                clearInterval(this.openInterval);
            }
            percent = Math.min(100, percent);
            this.setState({percent, open: (percent === 100)});
        }, this.props.interval);
    };

    close = () => {
        this.closing = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        this.closeInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.closeInterval);
                return;
            }
            let percent = this.state.percent -= (this.props.speed * this.props.interval / 1000);
            if (percent < 0) {
                this.closing = false;
                clearInterval(this.closeInterval);
            }
            percent = Math.max(0, percent);
            this.setState({percent, open: (percent !== 0)});
        }, this.props.interval);
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
                    style={
                        !this.props.inspectorPinned ? {
                            right: `${this.state.percent - 100}%`,
                            opacity: this.state.percent / 100
                        } : {right: "0%", opacity: 1}
                    }
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    {
                        this.state.inspectorMenu || this.getDefaultMenu()
                    }
                </div>
                {
                    this.props.inspectorPinned &&

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

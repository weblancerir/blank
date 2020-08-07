import React from "react";
import './Adjustment.css'
import classNames from "classnames";
import DynamicComponents from "../Dynamic/DynamicComponents";
import Popper from "@material-ui/core/Popper/Popper";
import '../HelperStyle.css';

export default class AdjustmentPageControllers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            anchorEl: undefined
        };
    }

    componentDidMount(){
        this.mounted = true;
    }

    componentWillUnmount(){
        this.mounted = false;
    }

    addSection = (index, isVertical) => {
        let {page} = this.props;
        page.addSectionQueue(index, "Section", DynamicComponents, undefined, isVertical);
    };

    getAnchor = (index) => {
        return  document.getElementById(`page_add_horizontal_${index}`)
    };

    needUpdate = () => {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            if (!this.mounted) {
                clearTimeout(this.updateTimeout);
                return;
            }
            this.forceUpdate();
        }, 500);
    };

    render () {
        let {grid} = this.props;
        return (
                [
                    new Array(grid.y + 1).fill(0).map((a, index) => {
                        let style = {
                            gridArea: `1/${index}/2/${index + 1}`
                        };
                        index === 0 && (style.justifySelf = "start");
                        index === 0 && (style.gridArea = "1/1/2/2");

                        let containerClasses = classNames(
                            "AdjustmentPageControllersAddSection",
                            index === 0 && "AdjustmentPageControllersAddSectionFirst"
                        );
                        return <div
                            className="AdjustmentPageControllersAddSectionContainer"
                            style={style}
                            key={index}
                        >
                            <div
                                className={containerClasses}
                                onClick={(e) => {
                                    this.addSection(index, true);
                                }}
                            >
                                <img draggable={false} width={8} height={8} src={require('./icons/plus.svg')} />
                            </div>
                        </div>
                    }),
                    new Array(grid.x + 1).fill(0).map((a, index) => {
                        let style = {
                            gridArea: `${index}/1/${index + 1}/2`,
                            pointerEvents: "auto"
                        };
                        index === 0 && (style.alignSelf = "start");
                        index === 0 && (style.gridArea = "1/1/2/2");

                        let containerClasses = classNames(
                            "AdjustmentPageControllersAddHorizontalSection",
                            index === 0 && "AdjustmentPageControllersAddHorizontalSectionFirst"
                        );
                        return <div
                            className="AdjustmentPageControllersAddHorizontalSectionContainer"
                            style={style}
                            key={index}
                            id={`page_add_horizontal_${index}`}
                            onClick={(e) => {
                                this.setState({anchorEl: e.currentTarget})
                            }}
                        >
                            {!this.getAnchor(index) && this.needUpdate()}
                            <Popper open={Boolean(document.getElementById(`page_add_horizontal_${index}`))}
                                    anchorEl={
                                        () => {
                                            return this.getAnchor(index);
                                        }
                                    }
                                    modifiers={{
                                        preventOverflow: {
                                            enabled: false,
                                            boundariesElement: 'scrollParent',
                                        },
                                        hide: {
                                            enabled: false,
                                        },
                                    }}
                            >
                                <div
                                    className={containerClasses}
                                    onClick={(e) => {
                                        this.addSection(index, false);
                                    }}
                                >
                                    <img draggable={false} className="IconImage" width={8} height={8} src={require('./icons/plus.svg')} />
                                </div>
                            </Popper>
                        </div>
                    })
                ]
        )
    }
}

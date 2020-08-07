import React from "react";
import './MenuBase.css';
import Draggable from 'react-draggable';
import IconButton from "../../HelperComponents/IconButton";
import '../../HelperStyle.css';
import MenuBaseIndexTitle from "./MenuBaseIndexTitle";
import LightTooltip from "../../Components/Containers/Menus/Components/LightTooltip";

export default class MenuBase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndexNo: props.defaultIndexNo
        }
    }

    close = () => {
        this.props.select.updateMenu();
    };

    onIndexClick = (e, key, selectedIndexNo) => {
        this.setState({selectedIndexNo})
    };

    getDefaultPos = (defaultPosition) => {
        return {
            y: Math.min(defaultPosition.y, window.innerHeight - 398),
            x: Math.min(defaultPosition.x, window.innerWidth - 300),
        }
    };

    render() {
        return (
            <Draggable
                handle=".MenuBaseHeaderTitle"
                bounds="parent"
                defaultPosition={this.getDefaultPos(this.props.defaultPosition)}
            >
                <div
                    className="MenuBaseRoot"
                    style={this.props.styles.root}
                >
                    {/*Header*/}
                    <div
                        className="MenuBaseHeaderContainer"
                    >
                        <span className="MenuBaseHeaderTitle">
                            {this.props.menuTitle || "Menu Title"}
                        </span>

                        <IconButton
                            onClick={this.close}
                        >
                            <img
                                draggable={false}
                                width={16}
                                height={16}
                                src={require('../../icons/close.svg')}
                            />
                        </IconButton>
                    </div>

                    {/*Body*/}
                    <div
                        className="MenuBaseBodyContainer"
                    >
                        <div className="MenuBaseBodyIndex">
                            {
                                this.props.index.map((indexData, i) => {
                                    return (
                                        <LightTooltip
                                            key={i}
                                            title={indexData.key}
                                            PopperProps={{
                                                style: {
                                                    zIndex: 999999999999999
                                                }
                                            }}
                                            placement="right"
                                        >
                                            <div
                                                key={i}
                                                style={{
                                                    backgroundColor: this.state.selectedIndexNo === i &&
                                                        'rgba(115, 115, 115, 0.36)'
                                                }}
                                            >
                                                <IconButton
                                                    key={indexData.key}
                                                    onClick={(e) => {
                                                        this.onIndexClick(e, indexData.key, i);
                                                    }}
                                                    buttonBaseStyle={{
                                                        marginLeft: 0
                                                    }}
                                                >
                                                    {indexData.icon}
                                                </IconButton>
                                            </div>
                                        </LightTooltip>
                                    )
                                })
                            }
                        </div>
                        <div className="MenuBaseBodyOptions">
                            {
                                this.state.selectedIndexNo !== undefined &&
                                <MenuBaseIndexTitle
                                    index={this.state.selectedIndexNo}
                                    key={this.props.options[this.state.selectedIndexNo].key}
                                    title={this.props.options[this.state.selectedIndexNo].key}
                                />
                            }
                            {
                                this.state.selectedIndexNo !== undefined &&
                                this.props.options[this.state.selectedIndexNo].render
                            }
                            {
                                this.state.selectedIndexNo === undefined &&
                                this.props.options.map((option, i) => {
                                    return (
                                        <MenuBaseIndexTitle
                                            index={i}
                                            key={option.key}
                                            title={option.key}
                                            onIndexClick={this.onIndexClick}
                                        />
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </Draggable>
        )
    }
}

MenuBase.defaultProps = {
    styles: {}
};

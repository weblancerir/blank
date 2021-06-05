import React from "react";
import './MenuBase.css';
import Draggable from 'react-draggable';
import IconButton from "../../HelperComponents/IconButton";
import '../../HelperStyle.css';
import MenuBaseIndexTitle from "./MenuBaseIndexTitle";
import LightTooltip from "../../Components/Containers/Menus/Components/LightTooltip";
import Tab from "@material-ui/core/Tab/Tab";
import Tabs from "@material-ui/core/Tabs/Tabs";

export default class MenuBase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndexNo: props.defaultIndexNo,
            currentState: props.multiState ? Object.keys(props.states)[0]: ""
        }
    }

    close = () => {
        if (this.props.multiState)
            Object.values(this.props.states)[0].toggle();

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

    getOptions = () => {
        if (!this.props.multiState)
            return this.props.options;

        return this.props.states[this.state.currentState].options;
    }

    getIndex = () => {
        if (!this.props.multiState)
            return this.props.index;

        return this.props.states[this.state.currentState].index;
    }

    onChangeTab = (e, currentState) => {
        this.setState({currentState});
        this.props.states[currentState].toggle();
    };

    render() {
        let options = this.getOptions();
        let index = this.getIndex();
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

                    {/*Tabs*/}
                    {
                        this.props.multiState &&
                        <Tabs
                            className="MenuBaseTabBox"
                            value={this.state.currentState}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                            onChange={this.onChangeTab}
                        >
                            {
                                Object.values(this.props.states).map(stateData => {
                                    return (
                                        <Tab key={stateData.name} label={stateData.render} value={stateData.name} className="MenuBaseTab"/>
                                    )
                                })
                            }
                        </Tabs>
                    }

                    {/*Body*/}
                    <div
                        className="MenuBaseBodyContainer"
                    >
                        <div className="MenuBaseBodyIndex">
                            {
                                index.map((indexData, i) => {
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
                            <div className="MenuBaseBodyOptionsContainer">
                            {
                                this.state.selectedIndexNo !== undefined &&
                                <MenuBaseIndexTitle
                                    index={this.state.selectedIndexNo}
                                    key={options[this.state.selectedIndexNo].key}
                                    title={options[this.state.selectedIndexNo].key}
                                />
                            }
                            {
                                this.state.selectedIndexNo !== undefined &&
                                options[this.state.selectedIndexNo].render
                            }
                            {
                                this.state.selectedIndexNo === undefined &&
                                options.map((option, i) => {
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
                </div>
            </Draggable>
        )
    }
}

MenuBase.defaultProps = {
    styles: {}
};

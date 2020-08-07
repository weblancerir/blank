import React from "react";
import './Inspector.css';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {setDataInBreakpoint} from "../../AwesomwGridLayoutHelper";
import {cloneObject} from "../../AwesomeGridLayoutUtils";
import Switch from "@material-ui/core/Switch/Switch";
import InspectorTitle from "./InspectorTitle";

export default class InspectorOverflow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount () {
        this.props.item && this.props.item.onPropsChange.addListener(this.onItemPropsChange);
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
        this.props.item && this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
    }

    shouldComponentUpdate (nextProps, nextState, nextContext) {
        nextProps.item && nextProps.item.onPropsChange.addListener(this.onItemPropsChange);
        if (this.props.item && (nextProps.item && nextProps.item.props.id) !== this.props.item.props.id)
            this.props.item && this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
        return true;
    }

    onItemPropsChange = (owner) => {
        this.setState({reload: true});
    };

    onChangeState = (e, value) => {
        let {item} = this.props;
        let thisBpOverflowData = item.getFromData("overflowData");
        let compositOverflowData = item.getCompositeFromData("overflowData");
        if (value === 'scroll' &&
            (!compositOverflowData ||
            ((!compositOverflowData.overflowY || compositOverflowData.overflowY === "hidden")&&
            (!compositOverflowData.overflowX || compositOverflowData.overflowX === "hidden"))))
        {
            let newOverflowData = cloneObject(thisBpOverflowData || {});
            newOverflowData.state = 'scroll';
            newOverflowData.overflowY = 'scroll';
            console.log("onChangeState", JSON.stringify(newOverflowData));
            setDataInBreakpoint("overflowData", newOverflowData, item, true, undefined, true);
            return;
        }

        setDataInBreakpoint("overflowData.state", value, item, true, undefined, true);
    };

    changeScrollDirection = (propName, checked) => {
        let {item} = this.props;
        setDataInBreakpoint(`overflowData.${propName}`, checked? 'scroll': undefined
            , item, true, undefined, true);
    };

    onChangeAuto = (e, value) => {
        let {item} = this.props;
        setDataInBreakpoint("overflowData.auto", value, item, true, undefined, true);
    };

    render () {
        let {item} = this.props;
        let overflowData = item.getCompositeFromData("overflowData");
        return (
            <>
                <InspectorTitle title="Overflow content" onChange={(open) => {
                    this.setState({open});
                }}/>

                {
                    this.state.open &&
                    <div className="InspectorOptionRoot">
                        <div className="InspectorAnchorNameTitle">
                            Overflow
                        </div>
                        <ToggleButtonGroup
                            className="InspectorOverflowType"
                            size='small'
                            value={overflowData.state}
                            exclusive
                            onChange={this.onChangeState}
                        >
                            <ToggleButton value="show" className="InspectorOverflowTypeButton" size='small'
                                        style={{
                                            padding: 3
                                        }}
                            >
                                Show
                            </ToggleButton>
                            <ToggleButton value="hide" className="InspectorOverflowTypeButton" size='small'
                                          style={{
                                              padding: 3
                                          }}
                            >
                                Hide
                            </ToggleButton>
                            <ToggleButton value="scroll" className="InspectorOverflowTypeButton" size='small'
                                          style={{
                                              padding: 3
                                          }}
                            >
                                Scroll
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {
                            overflowData.state === 'scroll' &&
                            <>
                                <div className="InspectorOverflowDir">
                                <span className="InspectorOverflowDirTitle">
                                    Scroll vertically
                                </span>
                                    <Switch
                                        className="InspectorOverflowDirSwitch"
                                        checked={overflowData.overflowY === "scroll" || overflowData.overflowY === "auto"}
                                        onChange={(e) => {
                                            let checked = e.target.checked;
                                            this.changeScrollDirection('overflowY', checked);
                                        }}
                                    />
                                </div>
                                <div className="InspectorOverflowDir">
                                <span className="InspectorOverflowDirTitle">
                                    Scroll horizontally
                                </span>
                                    <Switch
                                        className="InspectorOverflowDirSwitch"
                                        checked={overflowData.overflowX === "scroll" || overflowData.overflowX === "auto"}
                                        onChange={(e) => {
                                            let checked = e.target.checked;
                                            this.changeScrollDirection('overflowX', checked);
                                        }}
                                    />
                                </div>
                                <div className="InspectorOverflowAuto">
                                <span className="InspectorOverflowDirTitle">
                                    Scrollbar visibility
                                </span>
                                </div>
                                <ToggleButtonGroup
                                    className="InspectorOverflowAutoToggles"
                                    size='small'
                                    value={overflowData.auto || "always"}
                                    exclusive
                                    onChange={this.onChangeAuto}
                                >
                                    <ToggleButton value="hide" className="InspectorOverflowTypeButton" size='small'
                                                  style={{
                                                      padding: 3
                                                  }}
                                    >
                                        Hide
                                    </ToggleButton>
                                    <ToggleButton value="auto" className="InspectorOverflowTypeButton" size='small'
                                                  style={{
                                                      padding: 3
                                                  }}
                                    >
                                        Auto
                                    </ToggleButton>
                                    <ToggleButton value="always" className="InspectorOverflowTypeButton" size='small'
                                                  style={{
                                                      padding: 3
                                                  }}
                                    >
                                        Show
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </>
                        }
                    </div>
                }
            </>
        )
    }
}

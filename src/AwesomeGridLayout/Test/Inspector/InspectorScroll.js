import React from "react";
import './Inspector.css';
import DropDown from "../../Menus/CommonComponents/DropDown";
import {getValueFromCSSValue, setScrollBehaviour} from "../../AwesomwGridLayoutHelper";
import NumberInput from "../../Menus/CommonComponents/NumberInput";
import InspectorTitle from "./InspectorTitle";

export default class InspectorScroll extends React.Component {
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

    onChangeScrollEffect = (option) => {
        let {item} = this.props;
        let offsetTop = item.getFromData("scrollStickyOffsetTop");
        setScrollBehaviour(item, option, item.props.viewRef.current, false, {offsetTop});
    };

    onChangeOffsetTop = (offsetTop) => {
        offsetTop = `${offsetTop}px`;
        let {item} = this.props;
        let behaviour = item.getFromData("scrollBehaviour");
        setScrollBehaviour(item, behaviour, item.props.viewRef.current, false, {offsetTop});
        item.props.select.onScrollItem();
    };

    render () {
        let {item} = this.props;
        let behaviour = item.getFromData("scrollBehaviour");
        let offsetTop = item.getFromData("scrollStickyOffsetTop");
        return (
            <>
                <InspectorTitle title="Scroll" onChange={(open) => {
                    this.setState({open});
                }}/>

                {
                    this.state.open &&
                    <div className="InspectorOptionRoot">
                        <div className="InspectorScrollEffect"
                             style={{
                                 marginBottom: behaviour === 'sticky' ? 12 : 0
                             }}
                        >
                            <div className="InspectorScrollTitle">
                                Scroll effect
                            </div>

                            <DropDown
                                options={this.props.options || ['none', 'fixed', 'sticky']}
                                onChange={this.onChangeScrollEffect}
                                value={behaviour || 'none'}
                                spanStyle={{
                                    width: 96,
                                    fontSize: 12
                                }}
                            />
                        </div>

                        {
                            behaviour === 'sticky' &&
                            <div className="InspectorScrollEffect">
                                <div className="InspectorScrollTitle">
                                    Offset top
                                </div>

                                <NumberInput
                                    className="AngleInput"
                                    min={0}
                                    max={Infinity}
                                    value={getValueFromCSSValue(offsetTop)}
                                    onChange={this.onChangeOffsetTop}
                                    inputStyle={{
                                        width: 96,
                                        fontSize: 12,
                                        textAlign: "left"
                                    }}
                                />
                            </div>
                        }
                    </div>
                }
            </>
        )
    }
}

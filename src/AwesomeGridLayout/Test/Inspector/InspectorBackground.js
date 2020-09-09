import React from "react";
import './Inspector.css';
import {setStyleParam} from "../../AwesomwGridLayoutHelper";
import ColorPicker from "../../Menus/CommonComponents/ColorPicker";
import InspectorTitle from "./InspectorTitle";

export default class InspectorBackground extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: true};
    }

    componentDidMount() {
        this.props.item && this.props.item.onPropsChange.addListener(this.onItemPropsChange);
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
        this.props.item && this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        nextProps.item && nextProps.item.onPropsChange.addListener(this.onItemPropsChange);
        if (this.props.item && (nextProps.item && nextProps.item.props.id) !== this.props.item.props.id)
            this.props.item && this.props.item.onPropsChange.removeListener(this.onItemPropsChange);
        return true;
    }

    onItemPropsChange = (owner) => {
        this.setState({reload: true});
    };

    onChangeColor = (key, value) => {
        let {item} = this.props;
        setStyleParam("backgroundColor", value,
            item, true, undefined, true);
    };

    render() {
        let {item} = this.props;
        let style = item.getFromData("style") || {};
        return (
            <>
                <InspectorTitle defaultOpen title="Background" onChange={(open) => {
                    this.setState({open});
                }}/>

                {
                    this.state.open &&
                    <div className="InspectorOptionRoot">
                        <span className="InspectorBackgroundColorTitle">
                            Color
                        </span>
                        <ColorPicker
                            color={style.backgroundColor || 'rgba(0, 0, 0, 0)'}
                            onDesignChange={this.onChangeColor}
                            editor={this.props.item.props.editor}
                        />
                    </div>
                }
            </>
        )
    }
}

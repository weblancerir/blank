import React from "react";
import './Inspector.css';
import Switch from "@material-ui/core/Switch/Switch";
import TextInput from "../../Menus/CommonComponents/TextInput";
import InspectorTitle from "./InspectorTitle";

export default class InspectorAnchor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
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

    onEnableAnchor = (enable) => {
        let {item} = this.props;
        let anchor = item.getFromTempData("anchor");
        if (enable) {
            item.props.anchorMan.addAnchor(item.props.id.replace("comp_", ''), item);
        }
        else {
            item.props.anchorMan.removeAnchor(anchor.id, item);
        }
    };

    onChangeName = (newName) => {
        let {item} = this.props;
        let anchor = item.getFromTempData("anchor");
        item.props.anchorMan.modifyAnchor(anchor.id, newName, item);
    };

    render() {
        let {item} = this.props;
        let anchor = item.getFromTempData("anchor");
        return (
            <>
                <InspectorTitle title="Anchor" onChange={(open) => {
                    this.setState({open});
                }}/>

                {
                    this.state.open &&
                    <div className="InspectorOptionRoot">

                        <div className="InspectorOverflowDir">
                        <span className="InspectorOverflowDirTitle">
                            Enable Anchor
                        </span>
                            <Switch
                                className="InspectorOverflowDirSwitch"
                                checked={anchor !== undefined}
                                onChange={(e) => {
                                    this.onEnableAnchor(e.target.checked);
                                }}
                            />
                        </div>

                        {
                            anchor &&
                            <div className="InspectorAnchorName">
                                <div className="InspectorAnchorNameTitle">
                                    Anchor name
                                </div>
                                <TextInput
                                    value={anchor.name}
                                    onChange={(v) => this.onChangeName(v)}
                                    inputStyle={{
                                        width: "auto",
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

import React from "react";
import MenuBase from "../../../Menus/MenuBase/MenuBase";
import Background from "../../Containers/Menus/Components/Background";
import Border from "../../Containers/Menus/Components/Border";
import Corners from "../../Containers/Menus/Components/Corners";
import Shadow from "../../Containers/Menus/Components/Shadow";
import {getCompositeDesignData} from "../../../AwesomwGridLayoutHelper";
import ColorAdjustment from "../../../Menus/CommonMenus/ColorAdjustment";

export default class MenuItemDesign extends React.Component {
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

    getIndex = (stateName) => {
        let index = [];
        index.push(
            {
                key: "Fill Color & Opacity",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/water.svg'} />
            });
        index.push(
            {
                key: "Border",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/border.svg'} />
            });
        index.push(
            {
                key: "Corner",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/corner.svg'} />
            });
        index.push(
            {
                key: "Text Appearance",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/text.svg'} />
            });

        return index;
    };

    getOptions = (stateName) => {
        let design = getCompositeDesignData(this.props.item);
        let options = [];

        options.push({
            key: "Fill Color & Opacity",
            render: <Background
                color={design[stateName].fillColor}
                designKey={`design.${stateName}.fillColor`}
                onDesignChange={this.props.onDesignChange}
                editor={this.props.item.props.editor}
            />
        });
        options.push({
            key: "Border",
            render: <Border
                border={design[stateName].border || {}}
                designKey={`design.${stateName}.border`}
                onDesignChange={this.props.onDesignChange}
                editor={this.props.item.props.editor}
            />
        });
        options.push({
            key: "Corner",
            render: <Corners
                radius={design[stateName].border.radius || {}}
                designKey={`design.${stateName}.border.radius`}
                onDesignChange={this.props.onDesignChange}
            />
        });
        options.push({
            key: "Text Appearance",
            render: <ColorAdjustment
                title={"Text Color"}
                color={design[stateName].textColor}
                designKey={`design.${stateName}.textColor`}
                onDesignChange={this.props.onDesignChange}
                editor={this.props.item.props.editor}
            />
        });

        return options;
    };

    render () {
        return (
            <MenuBase
                menuTitle="Menu Item Design"
                {...this.props}
                item={this.props.item}
                multiState
                states={{
                    normal:{
                        name: "normal",
                        render: "Normal",
                        toggle: () => {this.props.onStateChange("normal")},
                        options: this.getOptions("normal"),
                        index: this.getIndex("normal")
                    },
                    hover: {
                        name: "hover",
                        render: "Hover",
                        toggle: () => {this.props.onStateChange("hover")},
                        options: this.getOptions("hover"),
                        index: this.getIndex("hover")
                    },
                    select: {
                        name: "select",
                        render: "Select",
                        toggle: () => {this.props.onStateChange("select")},
                        options: this.getOptions("select"),
                        index: this.getIndex("select")
                    }
                }}
            />
        )
    }
}

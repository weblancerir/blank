import React from "react";
import MenuBase from "../../../Menus/MenuBase/MenuBase";
import Background from "../../Containers/Menus/Components/Background";
import Border from "../../Containers/Menus/Components/Border";
import Corners from "../../Containers/Menus/Components/Corners";
import Shadow from "../../Containers/Menus/Components/Shadow";
import {getCompositeDesignData} from "../../../AwesomwGridLayoutHelper";
import ColorAdjustment from "../../../Menus/CommonMenus/ColorAdjustment";

export default class ImageDesign extends React.Component {
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
                key: "Overlay Color & Opacity",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/water.svg'} />
            });
        index.push(
            {
                key: "Background Color & Opacity",
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
                key: "Shadow",
                icon: <svg width="16" height="16" viewBox="0 0 16 16" className="symbol symbol-shadowDesign">
                    <path fillRule="evenodd"
                          d="M11.5 14.5h-8v-2h8c.55 0 1-.45 1-1v-9h2v9c0 1.65-1.35 3-3 3zm-3-4h-7c-1.1 0-2-.9-2-2v-7c0-1.1.9-2 2-2h7c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2z"/>
                </svg>
            });

        return index;
    };

    getOptions = (stateName) => {
        let design = getCompositeDesignData(this.props.item);
        let options = [];

        console.log("design", design)

        options.push({
            key: "Overlay Color & Opacity",
            render: <Background
                color={design[stateName].overlayColor}
                designKey={`design.${stateName}.overlayColor`}
                onDesignChange={this.props.onDesignChange}
                editor={this.props.item.props.editor}
            />
        });

        options.push({
            key: "Background Color & Opacity",
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
            key: "Shadow",
            render: <Shadow
                shadow={design[stateName].border.shadow || {}}
                designKey={`design.${stateName}.border.shadow`}
                onDesignChange={this.props.onDesignChange}
                editor={this.props.item.props.editor}
            />
        });

        return options;
    };

    render () {
        return (
            <MenuBase
                menuTitle="Image Design"
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
                    }
                }}
            />
        )
    }
}

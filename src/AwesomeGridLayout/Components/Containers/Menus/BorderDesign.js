import React from "react";
import MenuBase from "../../../Menus/MenuBase/MenuBase";
import Background from "./Components/Background";
import Border from "./Components/Border";
import Corners from "./Components/Corners";
import Shadow from "./Components/Shadow";
import {getCompositeDesignData} from "../../../AwesomwGridLayoutHelper";

export default class BorderDesign extends React.Component {
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

    getIndex = () => {
        return [
            {
                key: "Fill Color & Opacity",
                icon: <img draggable={false} width={16} height={16}
                           src={'/static/icon/water.svg'} />
            },
            {
                key: "Border",
                icon: <img draggable={false} width={16} height={16}
                           src={'/static/icon/border.svg'} />
            },
            {
                key: "Corner",
                icon: <img draggable={false} width={16} height={16}
                           src={'/static/icon/corner.svg'} />
            },
            {
                key: "Shadow",
                icon: <svg width="16" height="16" viewBox="0 0 16 16" className="symbol symbol-shadowDesign">
                    <path fillRule="evenodd"
                          d="M11.5 14.5h-8v-2h8c.55 0 1-.45 1-1v-9h2v9c0 1.65-1.35 3-3 3zm-3-4h-7c-1.1 0-2-.9-2-2v-7c0-1.1.9-2 2-2h7c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2z"/>
                </svg>
            }
        ]
    };

    getOptions = () => {
        let design = getCompositeDesignData(this.props.item);
        return [
            {
                key: "Fill Color & Opacity",
                render: <Background
                    color={design.fillColor}
                    designKey={"design.fillColor"}
                    onDesignChange={this.props.onDesignChange}
                    editor={this.props.item.props.editor}
                />
            },
            {
                key: "Border",
                render: <Border
                    border={design.border}
                    designKey={"design.border"}
                    onDesignChange={this.props.onDesignChange}
                    editor={this.props.item.props.editor}
                />
            },
            {
                key: "Corner",
                render: <Corners
                    radius={design.border.radius}
                    designKey={"design.border.radius"}
                    onDesignChange={this.props.onDesignChange}
                />
            },
            {
                key: "Shadow",
                render: <Shadow
                    shadow={design.border.shadow}
                    designKey={"design.border.shadow"}
                    onDesignChange={this.props.onDesignChange}
                    editor={this.props.item.props.editor}
                />
            }
        ]
    };

    render () {
        return (
            <MenuBase
                menuTitle="Box Design"
                {...this.props}
                index={this.getIndex()}
                options={this.getOptions()}
                item={this.props.item}
            />
        )
    }
}

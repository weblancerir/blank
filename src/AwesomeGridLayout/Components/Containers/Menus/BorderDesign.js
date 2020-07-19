import React from "react";
import MenuBase from "../../../Menus/MenuBase/MenuBase";
import Background from "./Background";
import Border from "./Border";
import Corners from "./Corners";
import Shadow from "./Shadow";

export default class BorderDesign extends React.Component {
    componentDidMount(){
        this.mounted = true;
    }

    componentWillUnmount(){
        this.mounted = false;
    }

    getIndex = () => {
        return [
            {
                key: "Fill Color & Opacity",
                icon: <img draggable={false} width={16} height={16}
                           src={require('../../../icons/paint.svg')} />
            },
            {
                key: "Border",
                icon: <img draggable={false} width={16} height={16}
                           src={require('../../../icons/paint.svg')} />
            },
            {
                key: "Corner",
                icon: <img draggable={false} width={16} height={16}
                           src={require('../../../icons/paint.svg')} />
            },
            {
                key: "Shadow",
                icon: <img draggable={false} width={16} height={16}
                           src={require('../../../icons/paint.svg')} />
            }
        ]
    };

    getOptions = () => {
        console.log(this.props.design.fillColor);
        return [
            {
                key: "Fill Color & Opacity",
                render: <Background
                    color={this.props.design.fillColor}
                    designKey={"design.fillColor"}
                    onDesignChange={this.props.onDesignChange}
                />
            },
            {
                key: "Border",
                render: <Border
                    border={this.props.design.border}
                    designKey={"design.border"}
                    onDesignChange={this.props.onDesignChange}
                />
            },
            {
                key: "Corner",
                render: <Corners
                    radius={this.props.design.border.radius}
                    designKey={"design.border.radius"}
                    onDesignChange={this.props.onDesignChange}
                />
            },
            {
                key: "Shadow",
                render: <Shadow
                    shadow={this.props.design.border.shadow}
                    designKey={"design.border.shadow"}
                    onDesignChange={this.props.onDesignChange}
                />
            }
        ]
    };

    render () {
        return (
            <MenuBase
                menuTitle="Border Design"
                {...this.props}
                index={this.getIndex()}
                options={this.getOptions()}
                item={this.props.item}
            />
        )
    }
}

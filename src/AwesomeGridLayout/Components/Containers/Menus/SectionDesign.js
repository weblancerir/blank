import React from "react";
import MenuBase from "../../../Menus/MenuBase/MenuBase";
import Background from "./Components/Background";
import {getCompositeDesignData} from "../../../AwesomwGridLayoutHelper";

export default class SectionDesign extends React.Component {
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
                           src={process.env.PUBLIC_URL + '/static/icon/water.svg'} />
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
            }
        ]
    };

    render () {
        return (
            <MenuBase
                menuTitle={this.props.menuTitle || "Box Design"}
                {...this.props}
                index={this.getIndex()}
                options={this.getOptions()}
                item={this.props.item}
            />
        )
    }
}

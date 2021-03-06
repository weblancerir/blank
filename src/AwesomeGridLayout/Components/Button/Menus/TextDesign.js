import React from "react";
import MenuBase from "../../../Menus/MenuBase/MenuBase";
import Background from "../../Containers/Menus/Components/Background";
import Border from "../../Containers/Menus/Components/Border";
import Corners from "../../Containers/Menus/Components/Corners";
import Shadow from "../../Containers/Menus/Components/Shadow";
import {getCompositeDesignData} from "../../../AwesomwGridLayoutHelper";
import ColorAdjustment from "../../../Menus/CommonMenus/ColorAdjustment";
import ButtonTextAppearance from "./ButtonTextAppearance";
import ButtonTextLayout from "./ButtonTextLayout";

export default class TextDesign extends React.Component {
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
                key: "Text Appearance",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/text.svg'} />
            });
        index.push(
            {
                key: "Text Layout",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/text.svg'} />
            });

        return index;
    };

    getOptions = (stateName) => {
        let design = getCompositeDesignData(this.props.item);
        let options = [];

        options.push({
            key: "Text Appearance",
            render: <ButtonTextAppearance
                data={design.spanData}
                designKey={`design.spanData`}
                onDesignChange={this.props.onDesignChange}
                editor={this.props.item.props.editor}
            />
        });

        options.push({
            key: "Text Layout",
            render: <ButtonTextLayout
                data={design.spanData}
                designKey={`design.spanData`}
                onDesignChange={this.props.onDesignChange}
                editor={this.props.item.props.editor}
            />
        });

        return options;
    };

    render () {
        return (
            <MenuBase
                menuTitle="Text Design"
                {...this.props}
                item={this.props.item}
                defaultIndexNo={0}
                index={this.getIndex()}
                options={this.getOptions()}
            />
        )
    }
}

import React from "react";
import MenuBase from "../../../Menus/MenuBase/MenuBase";
import {getCompositeDesignData} from "../../../AwesomwGridLayoutHelper";
import ImageBehavior from "./ImageBehavior";

export default class ImageBehaviorDesign extends React.Component {
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
                key: "Image Appearance",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/text.svg'} />
            });

        return index;
    };

    getOptions = (stateName) => {
        let design = getCompositeDesignData(this.props.item);
        let options = [];

        options.push({
            key: "Image Appearance",
            render: <ImageBehavior
                data={design.imageBehavior || {}}
                designKey={`design.imageBehavior`}
                onDesignChange={this.props.onDesignChange}
                editor={this.props.item.props.editor}
            />
        });

        return options;
    };

    render () {
        return (
            <MenuBase
                menuTitle="Image Behavior Design"
                {...this.props}
                item={this.props.item}
                defaultIndexNo={0}
                index={this.getIndex()}
                options={this.getOptions()}
            />
        )
    }
}

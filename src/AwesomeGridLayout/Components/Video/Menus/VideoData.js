import React from "react";
import MenuBase from "../../../Menus/MenuBase/MenuBase";
import Background from "../../Containers/Menus/Components/Background";
import Border from "../../Containers/Menus/Components/Border";
import Corners from "../../Containers/Menus/Components/Corners";
import Shadow from "../../Containers/Menus/Components/Shadow";
import {getCompositeDesignData} from "../../../AwesomwGridLayoutHelper";
import VideoSource from "./VideoSource";

export default class VideoData extends React.Component {
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
            key: "Video Source",
            icon: <img draggable={false} width={16} height={16}
                       src={process.env.PUBLIC_URL + '/static/icon/text.svg'} />
        });

        return index;
    };

    getOptions = (stateName) => {
        let design = getCompositeDesignData(this.props.item);
        let options = [];

        options.push({
            key: "Video Source",
            render: <VideoSource
                data={design.videoData}
                designKey={`design.videoData`}
                onDesignChange={this.props.onDesignChange}
                editor={this.props.item.props.editor}
            />
        });

        return options;
    };

    render () {
        return (
            <MenuBase
                menuTitle="Video Data"
                {...this.props}
                item={this.props.item}
                defaultIndexNo={0}
                index={this.getIndex()}
                options={this.getOptions()}
            />
        )
    }
}

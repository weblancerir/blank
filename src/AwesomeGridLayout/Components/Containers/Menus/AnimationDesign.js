import React from "react";
import MenuBase from "../../../Menus/MenuBase/MenuBase";
import {getCompositeDesignData} from "../../../AwesomwGridLayoutHelper";
import AnimationSelector from "./Components/AnimationSelector";
import AnimationOptions from "./Components/AnimationOptions";

export default class AnimationDesign extends React.Component {
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
                key: "Animation Type",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/animation-black.svg'} />
            },
            {
                key: "Animation Options",
                icon: <img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/time.svg'} />
            }
        ]
    };

    getOptions = () => {
        let design = getCompositeDesignData(this.props.item);
        return [
            {
                key: "Animation Type",
                render: <AnimationSelector
                    animation={design.animation}
                    designKey={"design.animation.name"}
                    onDesignChange={this.props.onDesignChange}
                    allAnimationNames={[
                        'fadeIn',
                        'bounceIn',
                        'glideIn',
                        'floatIn',
                        'expandIn',
                        'spinIn',
                        'flyIn',
                        'turnIn',
                        'arcIn',
                        'puffIn',
                        'foldIn',
                        'flipIn',
                        'reveal',
                    ]}
                    item={this.props.item}
                />
            },
            {
                key: "Animation Options",
                render: <AnimationOptions
                    animation={design.animation}
                    designKey={"design.animation.options"}
                    onDesignChange={this.props.onDesignChange}
                    item={this.props.item}
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
                defaultIndexNo={0}
            />
        )
    }
}

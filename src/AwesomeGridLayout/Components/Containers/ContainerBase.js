import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";
import MenuButton from "../../Menus/MenuBase/MenuButton";
import BorderDesign from "./Menus/BorderDesign";
import '../../HelperStyle.css';
import './ContainerBase.css';
import {getCompositeDesignData, resolveDesignData} from "../../AwesomwGridLayoutHelper";
import AnimationDesign from "./Menus/AnimationDesign";

export default class ContainerBase extends AGLComponent{
    resolveDesignData = () => {
        resolveDesignData(this, "border", {shadow: {
                xOffset: -1,
                yOffset: 1,
                distance: 1,
                size: 0,
                blur: 4
        }, radius: {}});
    };

    getDefaultData = () => {
        return {
            isContainer: true,
            bpData: {
                overflowData: {
                    state: "show"
                }
            }
        };
    };

    getPrimaryOptions = () => {
        this.resolveDesignData();
        return [
            <MenuButton
                key={0}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/paint.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <BorderDesign
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                    />
                }
            />,
            <MenuButton
                key={2}
                icon={ <img draggable={false} width={16} height={16}
                            src={'static/icon/animation.svg'} /> }
                select={this.props.select}
                menu={(e) =>
                    <AnimationDesign
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                    />
                }
            />
        ]
    };

    updateDesign = (compositeDesign) => {
    };

    getStaticChildren = () => {
        this.resolveDesignData();

        let border = getCompositeDesignData(this).border;
        let fillColor = getCompositeDesignData(this).fillColor;

        border.radius = border.radius || {};
        border.shadow = border.shadow || {};

        return <div
            className="ContainerBaseBorderRoot"
            style={{
                border:
                    `${border.width || 0}px solid ${border.color || 'rgba(186,218,85,0.63)'}`,
                backgroundColor: fillColor,
                borderRadius:
                    `${border.radius.topLeft || 0}px ${border.radius.topRight || 0}px ${border.radius.bottomRight || 0}px ${border.radius.bottomLeft || 0}px`,
                boxShadow: `${(border.shadow.xOffset) * (border.shadow.distance)}px ${(border.shadow.yOffset) * (border.shadow.distance)}px ${border.shadow.blur}px ${border.shadow.size}px ${border.shadow.color || 'rgba(186,218,85,0.63)'}`
            }}
        >

        </div>
    };

    render() {
        return (
            <AGLWrapper
                tagName="ContainerBase"
                aglComponent={this}
                {...this.props}
                data={this.getData()}
                getPrimaryOptions={this.getPrimaryOptions}
                getInspector={this.getInspector}
                getStaticChildren={this.getStaticChildren}
            />
        )
    }
}

ContainerBase.defaultProps = {
    tagName: "ContainerBase"
};

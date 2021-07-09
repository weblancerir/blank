import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";
import '../../HelperStyle.css';
import './Video.css';
import {
    getCompositeDesignData,
    getFromTempData,
    parseColor,
    resolveDesignData,
} from "../../AwesomwGridLayoutHelper";
import {EditorContext} from "../../Editor/EditorContext";
import MenuButton from "../../Menus/MenuBase/MenuButton";
import AnimationDesign from "../Containers/Menus/AnimationDesign";
import {getVideoObject} from "./VideoHelper";
import VideoDesign from "./Menus/VideoDesign";
import {getFontDataByName} from "../Text/TextHelper";
import StaticFonts from "../Text/Fonts/StaticFonts.json";
import VideoData from "./Menus/VideoData";
import InspectorBreadcrumbs from "../../Test/Inspector/InspectorBreadcrumbs";
import InspectorAligns from "../../Test/Inspector/InspectorAligns";
import ScaleProportionallyInspectorSize from "../Image/Menus/ScaleProportionallyInspectorSize";
import InspectorOverflow from "../../Test/Inspector/InspectorOverflow";
import InspectorPosition from "../../Test/Inspector/InspectorPosition";
import InspectorScroll from "../../Test/Inspector/InspectorScroll";
import InspectorPadding from "../../Test/Inspector/InspectorPadding";
import InspectorAdjustment from "../../Test/Inspector/InspectorAdjustment";
import InspectorAnchor from "../../Test/Inspector/InspectorAnchor";
import LinkedTag from "../Text/Menus/components/LinkedTag";

export default class Video extends AGLComponent{
    static contextType = EditorContext;
    constructor (props) {
        super(props);

        this.state = {hover: false};

        this.rootBorderRef = React.createRef();
    }

    componentDidMount() {
    }

    resolveDesignData = () => {
        resolveDesignData(this, "videoData", {
            videoType: "aparat",
            data: {
            },
            scaleProportionally: {
                enable: false
            }
        });
        resolveDesignData(this, "borderData", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 0,
                    blur: 4
                }, radius: {}}, textColor: "#000000"});
    };

    getDefaultData = () => {
        return {
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
                key={1}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/paint.svg')} /> }
                select={this.props.select}
                title="Border Design"
                menu={(e) =>
                    <VideoDesign
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                        onStateChange={this.onStateChange}
                    />
                }
            />,
            <MenuButton
                key={3}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/settingwhite.svg')} /> }
                select={this.props.select}
                title="Video Data"
                menu={(e) =>
                    <VideoData
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                        onStateChange={this.onStateChange}
                    />
                }
            />,
            <MenuButton
                key={2}
                icon={ <img draggable={false} width={16} height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/animation.svg'} /> }
                select={this.props.select}
                title="Animation Design"
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
            />,
            <MenuButton
                key={33}
                icon={ <img draggable={false} width={16} height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/savewhite.svg'} /> }
                select={this.props.select}
                hide={this.context.user.role === "user"}
                title="Copy Data"
                onClick={(e) => {
                    this.showComponentCode();
                }}
            />
        ]
    };

    updateDesign = (compositeDesign) => {
    };

    getInspectorOverride = () => {
        return (
            <>
                <InspectorBreadcrumbs
                    item={this.getAgl()}
                />
                <InspectorAligns
                    item={this.getAgl()}
                />
                <ScaleProportionallyInspectorSize
                    item={this.getAgl()}
                    getScaleProportionally={this.getScaleProportionally}
                    setScaleProportionally={this.setScaleProportionally}
                />
                <InspectorOverflow
                    item={this.getAgl()}
                />
                <InspectorPosition
                    item={this.getAgl()}
                />
                <InspectorScroll
                    item={this.getAgl()}
                />
                <InspectorPadding
                    item={this.getAgl()}
                />
                <InspectorAdjustment
                    item={this.getAgl()}
                />
                <InspectorAnchor
                    item={this.getAgl()}
                />
            </>
        )
    }

    setScaleProportionally = (ratio, enable) => {
        if (enable === undefined)
            enable = this.getScaleProportionally().enable;
        if (ratio === undefined) {
            let agl = this.getAgl();
            let rect = agl.getSize(false, true);
            ratio = rect.height / rect.width;
        }
        this.onDesignChange(`design.videoData.scaleProportionally`, {enable, ratio});
    }

    getScaleProportionally = () => {
        return getCompositeDesignData(this).videoData.scaleProportionally || {enable: false};
    }

    setSizePre = (agl, dir, delta, group, relativeX, relativeY, width, height, firstRelativeX,
                  firstRelativeY, firstWidth, firstHeight, parentRect, fromUndoRedo) =>
    {
        this.setScaleProportionally(width / height);
    }

    getStaticChildren = () => {
        this.resolveDesignData();

        let borderData = getCompositeDesignData(this).borderData;
        let videoData = getCompositeDesignData(this).videoData;

        let border = borderData.border;
        let overlay = borderData.overlay;
        if (overlay)
            overlay = parseColor(overlay, overlay.alpha, this.context);

        border.radius = border.radius || {};
        border.shadow = border.shadow || {};

        let shadowColor = border.shadow.color;
        if (shadowColor)
            shadowColor = parseColor(shadowColor, shadowColor.alpha, this.context);
        let borderColor = border.color;
        if (borderColor)
            borderColor = parseColor(borderColor, borderColor.alpha, this.context);

        return <>
            <div
                className="VideoBorderRoot"
                ref={this.rootBorderRef}
                style={{
                    border:
                        `${border.width || 0}px solid ${borderColor || 'rgba(0,0,0,0)'}`,
                    // backgroundColor: fillColor,
                    borderRadius:
                        `${border.radius.topLeft || 0}px ${border.radius.topRight || 0}px ${border.radius.bottomRight || 0}px ${border.radius.bottomLeft || 0}px`,
                    boxShadow: `${(border.shadow.xOffset) * (border.shadow.distance)}px ${(border.shadow.yOffset) * (border.shadow.distance)}px ${border.shadow.blur}px ${border.shadow.size}px ${shadowColor || 'rgba(0,0,0,0)'}`,
                    pointerEvents: this.context.isEditor() ? "none" : "auto"
                }}
            >
                {getVideoObject(videoData.videoType, videoData.data)}
                <div
                    className="VideoOverlay"
                    style={{
                        backgroundColor: overlay,
                    }}
                />
            </div>
            <div
                className="ImageScaler"
                style={{
                    paddingTop: (videoData.scaleProportionally && videoData.scaleProportionally.enable) ?
                        `${videoData.scaleProportionally.ratio * 100}%` : "unset"
                }}
            />
        </>
    };

    render() {
        return (
            <AGLWrapper
                tagName="Video"
                aglComponent={this}
                {...this.props}
                style={{
                    width: "200px",
                    height: "150px",
                }}
                data={this.getData()}
                getPrimaryOptions={this.getPrimaryOptions}
                getInspector={this.getInspector}
                getStaticChildren={this.getStaticChildren}
                setSizePre={this.setSizePre}
            />
        )
    }
}

Video.defaultProps = {
    tagName: "Video"
};

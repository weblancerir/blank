import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";
import '../../HelperStyle.css';
import './Image.css';
import {
    getCompositeDesignData,
    getFromTempData,
    parseColor,
    resolveDesignData,
    setTempData
} from "../../AwesomwGridLayoutHelper";
import {EditorContext} from "../../Editor/EditorContext";
import MenuButton from "../../Menus/MenuBase/MenuButton";
import AnimationDesign from "../Containers/Menus/AnimationDesign";
import {prepareLink} from "../Text/Menus/components/LinkHelper";

export default class Image extends AGLComponent{
    static contextType = EditorContext;
    constructor (props) {
        super(props);

        this.state = {hover: false};

        this.rootBorderRef = React.createRef();
    }

    componentDidMount() {
        this.resolveRootTag();
    }

    resolveRootTag = () => {
        if (!this.context.preview && !this.context.production)
            return;

        let linkData = getFromTempData(this, "linkData");

        if (linkData && linkData.type !== "None") {
            prepareLink(this.rootBorderRef.current, this.context.preview, this.context.production, this.context, linkData);
        }
    }

    resolveDesignData = () => {
        resolveDesignData(this, "imageData", {
            src: "https://weblancerstaticdata.s3.ir-thr-at1.arvanstorage.com/image-default.webp",
            fit: "cover"
        });
        resolveDesignData(this, "normal", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 0,
                    blur: 4
                }, radius: {}}, imageOpacity: 1});
        resolveDesignData(this, "hover", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 5,
                    blur: 4
                }, radius: {}}, imageOpacity: 1});
    };

    getDefaultData = () => {
        return {
            bpData: {
                overflowData: {
                    state: "hide"
                }
            }
        };
    };

    getPrimaryOptions = () => {
        this.resolveDesignData();

        let linkData = getFromTempData(this, "linkData");

        return [
            <MenuButton
                key={2}
                icon={ <img draggable={false} width={16} height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/animation.svg'} /> }
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
            />,
            <MenuButton
                key={3}
                icon={ <img draggable={false} width={16} height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/linkwhite.svg'} /> }
                select={this.props.select}
                onClick={(e) => {
                    this.context.showLinkGenerator(
                        linkData,
                        (linkData) => {
                            console.log("Image Link OnDone", linkData)
                            setTempData("linkData", linkData, this.getAgl(), true);
                        }
                    );
                }}
            />,
            <MenuButton
                key={4}
                icon={ <img draggable={false} width={16} height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/edit.svg'} /> }
                select={this.props.select}
                onClick={(e) => {
                    this.context.showFileManager(
                        {
                            type: "Images"
                        },
                        (filesData) => {
                            console.log("Image FIle Pick OnDone", filesData);
                            let fileData = filesData[0];
                            this.onDesignChange('design.imageData.src', fileData.url);
                        }
                    );
                }}
            />
        ]
    };

    updateDesign = (compositeDesign) => {
    };

    getStaticChildren = () => {
        this.resolveDesignData();

        let imageData = getCompositeDesignData(this).imageData;

        let data;
        if (this.state.hover)
            data = getCompositeDesignData(this).hover;
        else
            data = getCompositeDesignData(this).normal;

        let border = data.border;
        let fillColor = data.fillColor;
        if (fillColor)
            fillColor = parseColor(fillColor, fillColor.alpha, this.context);

        border.radius = border.radius || {};
        border.shadow = border.shadow || {};

        let shadowColor = border.shadow.color;
        if (shadowColor)
            shadowColor = parseColor(shadowColor, shadowColor.alpha, this.context);
        let borderColor = border.color;
        if (borderColor)
            borderColor = parseColor(borderColor, borderColor.alpha, this.context);

        return <a
            className="ImageBorderRoot"
            ref={this.rootBorderRef}
            style={{
                border:
                    `${border.width || 0}px solid ${borderColor || 'rgba(186,218,85,0.63)'}`,
                backgroundColor: fillColor,
                borderRadius:
                    `${border.radius.topLeft || 0}px ${border.radius.topRight || 0}px ${border.radius.bottomRight || 0}px ${border.radius.bottomLeft || 0}px`,
                boxShadow: `${(border.shadow.xOffset) * (border.shadow.distance)}px ${(border.shadow.yOffset) * (border.shadow.distance)}px ${border.shadow.blur}px ${border.shadow.size}px ${shadowColor || 'rgba(186,218,85,0.63)'}`,
            }}
        >
            <img
                className="ImageImage"
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
                src={imageData.src}
                style={{
                    objectFit: imageData.fit
                }}
            />
        </a>
    };

    onStateChange = (stateName) => {
        if (stateName === "hover")
            this.setState({hover:true});
        else
            this.setState({hover:false});
    };

    onMouseOver = () => {
        if (this.context.isEditor())
            return;

        this.setState({hover: true});
    };

    onMouseOut = () => {
        if (this.context.isEditor())
            return;

        this.setState({hover: false});
    };

    render() {
        return (
            <AGLWrapper
                tagName="Image"
                aglComponent={this}
                {...this.props}
                style={{
                    width: "150px",
                    height: "150px",
                }}
                data={this.getData()}
                getPrimaryOptions={this.getPrimaryOptions}
                getInspector={this.getInspector}
                getStaticChildren={this.getStaticChildren}
            />
        )
    }
}

Image.defaultProps = {
    tagName: "Image"
};

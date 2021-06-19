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
import CropperModal from "./CropperModal";
import FocalPointModal from "./FocalPointModal";
import ImageDesign from "./Menus/ImageDesign";
import ImageBehaviorDesign from "./Menus/ImageBehaviorDesign";
import LinkedTag from "../Text/Menus/components/LinkedTag";

export default class Image extends AGLComponent{
    static contextType = EditorContext;
    constructor (props) {
        super(props);

        this.state = {
            hover: false,
            imageLoaded: false,
        };

        // this.imgRef = React.createRef();
    }

    setImageNode = (node) => {
        this.imgNode = node;
    }

    componentDidMount() {
        this.checkImageLoad();
    }

    crop = (callback) => {
        if (this.cropped) {
            callback(false);
            return;
        }

        this.cropped = true;

        let cropData = getFromTempData(this, "cropData") || {};
        if (!cropData.croppedAreaPixels) {
            callback(false);
            return;
        }

        var canvas = document.createElement("canvas");
        canvas.width = `${cropData.croppedAreaPixels.width}`;
        canvas.height = `${cropData.croppedAreaPixels.height}`;
        let context = canvas.getContext("2d");
        // let img = this.i mgRef.current;
        let img = this.imgNode;

        context.drawImage(
            img,
            cropData.croppedAreaPixels.x,
            cropData.croppedAreaPixels.y,
            cropData.croppedAreaPixels.width,
            cropData.croppedAreaPixels.height,
            0, 0,
            cropData.croppedAreaPixels.width,
            cropData.croppedAreaPixels.height,
        );

        callback(true);
        this.setState({altSrc: canvas.toDataURL()});
    }

    onImageLoaded = (e) => {
        this.setState({imageLoaded: true})
        this.setState({imageDimension: {
            width: e.target.width,
            height: e.target.height,
        }});
        if (!this.state.imageExactDimension) {
            this.setState({imageExactDimension: {
                width: e.target.naturalWidth,
                height: e.target.naturalHeight,
            }});
        }

        console.log("onImageLoaded !!!")
        this.crop((cropping) => {
            if (!cropping && !this.context.isEditor()) {
                if (!this.animated) {
                    this.animated = true;
                    this.getAgl().playAnimation(false, true);
                }
            }
        });
    }

    checkImageLoad = () => {
        let interval = setInterval(() => {
            if (this.imgNode) {
                if (this.imgNode.naturalWidth) {
                    clearInterval(interval);
                    this.setState({imageExactDimension: {
                        width: this.imgNode.naturalWidth,
                        height: this.imgNode.naturalHeight,
                    }});
                }
            }
        }, 50);
    }

    resolveDesignData = () => {
        resolveDesignData(this, "imageData", {
            src: "https://weblancerstaticdata.s3.ir-thr-at1.arvanstorage.com/image-default.webp",
            fit: "cover",
            scrollType: "none"
        });
        resolveDesignData(this, "imageBehavior", {
            scrollType: "None"
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
                key={1}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/paint.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <ImageDesign
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
                key={22}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/text.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <ImageBehaviorDesign
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
                icon={<img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/animation.svg'}/>}
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
                icon={<img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/linkwhite.svg'}/>}
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
                icon={<img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/edit.svg'}/>}
                select={this.props.select}
                onClick={(e) => {
                    this.context.showFileManager(
                        {
                            type: "Images",
                            select: "single"
                        },
                        (filesData) => {
                            console.log("Image FIle Pick OnDone", filesData);
                            let fileData = filesData[0];
                            setTempData("cropData", undefined, this.getAgl(), true);
                            this.onDesignChange('design.imageData.focalPoint', {x: 50, y: 50});
                            this.setState({imageLoaded: false, imageExactDimension: undefined, altSrc: undefined});
                            this.onDesignChange('design.imageData.src', fileData.url);
                        }
                    );
                }}
            />,
            <MenuButton
                key={5}
                icon={<img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/close.svg'}/>}
                select={this.props.select}
                onClick={(e) => {
                    let imageData = getCompositeDesignData(this).imageData;
                    let cropData = getFromTempData(this, "cropData") || {};
                    let totalSize = this.getAgl() ? this.getAgl().getSize() : null;

                    this.context.showModal(
                        <CropperModal
                            open={true}
                            imageSrc={imageData.src}
                            crop={cropData.crop || {x: 0, y: 0}}
                            zoom={cropData.zoom || 1}
                            aspect={totalSize ? totalSize.width / totalSize.height : 1}
                            onClose={() => {
                                this.context.hideModal();
                            }}
                            onDone={(cropData) => {
                                this.onDesignChange('design.imageData.focalPoint', {x: 50, y: 50});
                                setTempData("cropData", cropData, this.getAgl(), true);
                                this.cropped = false;

                                if (!this.state.altSrc)
                                    this.crop();
                                else
                                    this.setState({altSrc: undefined});
                            }}
                        />
                    );
                }}
            />,
            <MenuButton
                key={6}
                icon={<img draggable={false} width={16} height={16}
                           src={process.env.PUBLIC_URL + '/static/icon/corner.svg'}/>}
                select={this.props.select}
                onClick={(e) => {
                    let imageData = getCompositeDesignData(this).imageData;

                    this.context.showModal(
                        <FocalPointModal
                            open={true}
                            src={this.state.altSrc || imageData.src}
                            focalPoint={imageData.focalPoint || {x: 50, y: 50}}
                            onClose={() => {
                                this.context.hideModal();
                            }}
                            onDone={(focalPoint) => {
                                this.onDesignChange('design.imageData.focalPoint', focalPoint);
                            }}
                        />
                    );
                }}
            />,
            <MenuButton
                key={33}
                icon={ <img draggable={false} width={16} height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/add.svg'} /> }
                select={this.props.select}
                onClick={(e) => {
                    this.showComponentCode();
                }}
            />
        ]
    };

    updateDesign = (compositeDesign) => {
    };

    getStaticChildren = () => {
        let {imageDimension, imageExactDimension, imageLoaded} = this.state;
        this.resolveDesignData();

        let imageData = getCompositeDesignData(this).imageData;
        let imageBehavior = getCompositeDesignData(this).imageBehavior;

        let data;
        if (this.state.hover)
            data = getCompositeDesignData(this).hover;
        else
            data = getCompositeDesignData(this).normal;

        let border = data.border;
        let fillColor = data.fillColor;
        if (fillColor)
            fillColor = parseColor(fillColor, fillColor.alpha, this.context);

        let overlayColor = data.overlayColor;
        if (overlayColor)
            overlayColor = parseColor(overlayColor, overlayColor.alpha, this.context);

        border.radius = border.radius || {};
        border.shadow = border.shadow || {};

        let shadowColor = border.shadow.color;
        if (shadowColor)
            shadowColor = parseColor(shadowColor, shadowColor.alpha, this.context);
        let borderColor = border.color;
        if (borderColor)
            borderColor = parseColor(borderColor, borderColor.alpha, this.context);

        let imageStyle = {
            objectFit: imageData.fit,
            // objectPosition: `${imageData.objectPosition.x} ${imageData.objectPosition.y}`
        };

        let totalSize = this.getAgl()? this.getAgl().getSize() : null;
        if (imageExactDimension) {
            if (totalSize.width / totalSize.height > imageExactDimension.width/ imageExactDimension.height) {
                // Vertical
                imageStyle.height = "auto";
                imageStyle.width = "100%";
            } else {
                console.log("imageExactDimension 2")
                // Horizontal
                imageStyle.height = "100%";
                imageStyle.width = "auto";
            }
        }

        if (imageDimension && imageLoaded) {

            imageDimension.width = this.imgNode.width;
            imageDimension.height = this.imgNode.height;

            if (imageBehavior) {
                switch (imageBehavior.scrollType.toLowerCase()) {
                    case "none":
                        imageStyle.width = "100%";
                        imageStyle.height = "100%";
                        break;
                    case "parallax":
                        if (!(totalSize.width / totalSize.height > imageExactDimension.width / imageExactDimension.height)) {
                            // Horizontal
                            imageDimension.width = imageExactDimension.width / imageExactDimension.height * 2 * totalSize.height;
                            imageDimension.height = 2 * totalSize.height;
                            imageStyle.height = "200%";
                        } else {
                            imageStyle.height = "auto";
                        }
                        imageStyle.top = `calc(${-imageDimension.height}px * var(--page-scroll) + ${totalSize.height}px * var(--page-scroll))`;
                        break;
                    case "reveal":
                        if (!this.context.isEditor()) {
                            if (!(totalSize.width / totalSize.height > imageExactDimension.width / imageExactDimension.height)) {
                                // Horizontal
                                imageDimension.width = imageExactDimension.width / imageExactDimension.height * 2 * totalSize.height;
                                imageDimension.height = 2 * totalSize.height;
                                imageStyle.height = `calc(100vh * var(--vh-ratio))`;
                            } else {
                                imageStyle.height = `calc(100vh * var(--vh-ratio))`;
                                imageStyle.minWidth = totalSize.width;
                            }
                            imageStyle.position = "fixed";
                            imageStyle.left = totalSize.left;
                            imageStyle.top = this.context.production ? 0 : 90;
                            imageStyle.width = totalSize.width;
                        }
                        break;
                }
            }
        }

        imageStyle.objectPosition = imageData.focalPoint ?
            `${imageData.focalPoint.x}% ${imageData.focalPoint.y}%` : '50% 50%';

        let overlayStyle = {
            backgroundColor: overlayColor,
        }

        let linkData = getFromTempData(this, "linkData");

        return <LinkedTag
            key="ImageBorderRoot"
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
            className="ImageBorderRoot"
            linkData={linkData}
            style={{
                border:
                    `${border.width || 0}px solid ${borderColor || 'rgba(186,218,85,0.63)'}`,
                backgroundColor: fillColor,
                borderRadius:
                    `${border.radius.topLeft || 0}px ${border.radius.topRight || 0}px ${border.radius.bottomRight || 0}px ${border.radius.bottomLeft || 0}px`,
                boxShadow: `${(border.shadow.xOffset) * (border.shadow.distance)}px ${(border.shadow.yOffset) * (border.shadow.distance)}px ${border.shadow.blur}px ${border.shadow.size}px ${shadowColor || 'rgba(186,218,85,0.63)'}`,
            }}
        >
            <div style={{
                position: "relative", width: "100%", height: "100%",
                clipPath: "inset(0 0 0 0)",
                overflow: "hidden",
                borderRadius:
                    `${border.radius.topLeft || 0}px ${border.radius.topRight || 0}px ${border.radius.bottomRight || 0}px ${border.radius.bottomLeft || 0}px`,
            }}>
                <img
                    className="ImageImage"
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.onMouseOut}
                    src={this.state.altSrc || imageData.src}
                    style={imageStyle}
                    // ref={this.imgRef}
                    ref={(ref) => {this.setImageNode(ref)}}
                    onLoad={this.onImageLoaded}
                    crossOrigin="anonymous"
                    alt={imageBehavior.altText || ""}
                />
                <div
                    className="ImageOverlay"
                    style={overlayStyle}
                />
            </div>
        </LinkedTag>
    };

    onStateChange = (stateName) => {
        if (stateName === "hover")
            this.setState({hover:true});
        else
            this.setState({hover:false});
    };

    onMouseOver = () => {
        console.log("onMouseOver")
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

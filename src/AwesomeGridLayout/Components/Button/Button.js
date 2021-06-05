import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";
import '../../HelperStyle.css';
import './Button.css';
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
import ButtonDesign from "./Menus/ButtonDesign";
import TextDesign from "./Menus/TextDesign";
import {getFontDataByName} from "../Text/TextHelper";
import StaticFonts from "../Text/Fonts/StaticFonts.json";

export default class Button extends AGLComponent{
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
        resolveDesignData(this, "spanData", {
            text: "Start Now",
            fontFamily: getFontDataByName(StaticFonts, "Yekan").fontFamily,
            fontSize: 14,
            margin: 0
        });
        resolveDesignData(this, "normal", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 0,
                    blur: 4
                }, radius: {}}, textColor: "#000000"});
        resolveDesignData(this, "hover", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 5,
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

        let linkData = getFromTempData(this, "linkData");

        return [
            <MenuButton
                key={0}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/textwhite.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <TextDesign
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
                key={1}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/paint.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <ButtonDesign
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
                            console.log("Button Link OnDone", linkData)
                            setTempData("linkData", linkData, this.getAgl(), true);
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

        let spanData = getCompositeDesignData(this).spanData;

        let data;
        if (this.state.hover)
            data = getCompositeDesignData(this).hover;
        else
            data = getCompositeDesignData(this).normal;

        let textColor = data.textColor;
        console.log("textColor", textColor)
        if (textColor)
            textColor = parseColor(textColor, textColor.alpha, this.context);

        let border = data.border;
        let fillColor = data.fillColor;
        console.log("fillColor", fillColor)
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

        let spanMarginStyle = {};
        if (spanData.textAlign === "flex-start")
            spanMarginStyle.marginLeft = `${spanData.margin}px`;
        if (spanData.textAlign === "flex-end")
            spanMarginStyle.marginRight = `${spanData.margin}px`;

        return <a
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
            className="ButtonBorderRoot"
            ref={this.rootBorderRef}
            style={{
                border:
                    `${border.width || 0}px solid ${borderColor || 'rgba(186,218,85,0.63)'}`,
                backgroundColor: fillColor,
                borderRadius:
                    `${border.radius.topLeft || 0}px ${border.radius.topRight || 0}px ${border.radius.bottomRight || 0}px ${border.radius.bottomLeft || 0}px`,
                boxShadow: `${(border.shadow.xOffset) * (border.shadow.distance)}px ${(border.shadow.yOffset) * (border.shadow.distance)}px ${border.shadow.blur}px ${border.shadow.size}px ${shadowColor || 'rgba(186,218,85,0.63)'}`,
                justifyContent: spanData.textAlign || "center"
            }}
        >
            <span
                className="ButtonText"
                style={{
                    color: textColor || "#000000",
                    fontFamily: spanData.fontFamily || getFontDataByName(StaticFonts, "Yekan").fontFamily,
                    fontSize: `${spanData.fontSize}px`,
                    ...spanMarginStyle
                }}
            >
                {spanData.text}
            </span>
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
                tagName="Button"
                aglComponent={this}
                {...this.props}
                style={{
                    width: "100px",
                    height: "50px",
                }}
                data={this.getData()}
                getPrimaryOptions={this.getPrimaryOptions}
                getInspector={this.getInspector}
                getStaticChildren={this.getStaticChildren}
            />
        )
    }
}

Button.defaultProps = {
    tagName: "Button"
};

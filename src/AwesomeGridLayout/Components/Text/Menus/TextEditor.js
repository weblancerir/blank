import React from "react";
import Popper from "@material-ui/core/Popper/Popper";
import './TextEditor.css';
import TextEditorButton from "./TextEditorButton";
import {EditorContext} from "../../../Editor/EditorContext";
import DropDown from "../../../Menus/CommonComponents/DropDown";
import {getRandomColor, getFontDataByFamily} from "../TextHelper";
import FontSizeSelector from "./components/FontSizeSelector";
import TextColorSelector from "./components/TextColorSelector";
import StaticFonts from '../Fonts/StaticFonts.json';
import LinkGenerator from "./components/LinkGenerator";
import {addLinkData, getSelectedLinkData, getSelectedLinkId} from "./components/LinkHelper";

export default class TextEditor extends React.Component {
    static contextType = EditorContext;
    constructor(props) {
        super(props);

        this.state = {};

        this.fontSizeSelectorRef = React.createRef();
    }

    // Depricated: These function does not support undo redo
    // applyProperty = (propertyName, value, tagName = 'span') => {
    //     applyProperty(this.props.doc, this.props.iframeNode.contentWindow, propertyName, value, tagName);
    //     this.props.inputWrapperRef.current.onInput();
    // }

    getTextDir = () => {
        let {textStaticData} = this.props;

        if (!textStaticData.dir)
            return "ltr";

        return textStaticData.dir;
    }

    onIframeTextClicked = (e) => {
        if (this.mounted) {
            this.refreshState();
            return;
        }

        setTimeout(() => {
            this.onIframeTextClicked(e);
        }, 200);
    }

    refreshState = () => {
        window.requestAnimationFrame(() => {
            const selection = this.props.doc.getSelection();

            // set size
            const size = window.getComputedStyle(selection.anchorNode.parentElement, null).getPropertyValue('font-size');
            this.fontSizeSelectorRef.current.setForceValue(size);

            // set bold
            const fontWeight = window.getComputedStyle(selection.anchorNode.parentElement, null).getPropertyValue('font-weight');
            let bold = (fontWeight === "700");

            // set italic
            const fontStyle = window.getComputedStyle(selection.anchorNode.parentElement, null).getPropertyValue('font-style');
            let italic = (fontStyle === "italic");

            // set underline
            const decoration = window.getComputedStyle(selection.anchorNode.parentElement, null).getPropertyValue('text-decoration');
            console.log("decoration", decoration)
            let underline = (decoration.includes("underline"));

            // set font name
            let fontFamily =
                window.getComputedStyle(selection.anchorNode.parentElement, null).getPropertyValue('font-family');

            let fontData = getFontDataByFamily(StaticFonts, fontFamily);

            // let multiLineSelect = /\r|\n/.exec(selection);

            this.setState({bold, italic, underline, fontData});
        });
    }

    isTextSelcted = () => {
            let selection = this.props.doc.getSelection();
            return !(selection.toString().length < 1);
    }

    tryAgain = () => {
        window.requestAnimationFrame(() => {
            this.forceUpdate();
        });
    }

    render () {
        let {textTheme, textStaticData, textDesignData, anchorEI} = this.props;
        if (document.getElementById("TextEditorIFrame") === null){
            this.tryAgain();
            return null;
        }

        this.mounted = true;
        console.log("TextEditorIFrame", document.getElementById("TextEditorIFrame"))
        return (
            <>
            <Popper
                open={true}
                // anchorEl={anchorEI}
                anchorEl={document.getElementById("TextEditorIFrame")}
                placement="top-start"
                style={{
                    zIndex: 9999999999999999,
                    ...this.props.style
                }}
                modifiers={{
                    flip: {
                        enabled: true,
                    },
                    preventOverflow: {
                        enabled: true,
                        boundariesElement: 'scrollParent',
                    },
                }}
            >
                <div
                    className="TextEditorRoot"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <div className="TextEditorContainer">
                        <div className="TextEditorContainerRow">
                            <DropDown
                                rootStyle={{
                                    borderRight: "1px solid #c6c6c6",
                                    marginRight: 12,
                                    marginLeft: 4
                                }}
                                menuItemStyle={{
                                    padding: 0
                                }}
                                options={this.context.getTheme("Text")}
                                onChange={(v) => {
                                    textDesignData.textTheme = v.name;
                                    this.props.onChangeData(textStaticData, textDesignData);
                                    window.requestAnimationFrame(() => {
                                        this.props.updateInputWrapper();
                                        this.props.inputWrapperRef.current.onInput();
                                    })
                                }}
                                value={textTheme}
                                spanStyle={{
                                    width: 180,
                                    fontSize: 14,
                                    border: "0px solid #cfcfcf",
                                }}
                                renderer={(textTheme) => {
                                    return (
                                        <div className="TextEditorThemeRendererRoot">
                                        <span className="TextEditorThemeRendererColor" style={{
                                            backgroundColor: textTheme.color
                                        }}>
                                        </span>
                                            <span className="TextEditorThemeRendererName">
                                            {textTheme.name}
                                        </span>
                                            <span className="TextEditorThemeRendererSize">
                                            {textTheme.fontSize}px
                                        </span>
                                        </div>
                                    )
                                }}
                                valueRenderer={(textTheme) => {
                                    return (
                                        <span>
                                        {textTheme.name}
                                    </span>
                                    )
                                }}
                            />
                            <DropDown
                                rootStyle={{
                                    borderRight: "1px solid #c6c6c6",
                                    marginRight: 12,
                                    marginLeft: 4
                                }}
                                menuItemStyle={{
                                    padding: 0
                                }}
                                options={Object.values(StaticFonts)}
                                onChange={(fontData) => {
                                    if (!this.isTextSelcted()) {
                                        textDesignData.fontFamily = fontData.fontFamily;
                                        this.props.onChangeData(textStaticData, textDesignData);
                                        window.requestAnimationFrame(() => {
                                            this.props.updateInputWrapper();
                                            this.props.inputWrapperRef.current.onInput();
                                        })
                                    } else {
                                        this.props.doc.execCommand('fontName', false, fontData.fontFamily);
                                        this.refreshState();
                                    }
                                }}
                                value={this.state.fontData? this.state.fontData:
                                    getFontDataByFamily(StaticFonts, textDesignData.fontFamily)}
                                spanStyle={{
                                    width: 180,
                                    fontSize: 14,
                                    border: "0px solid #cfcfcf",
                                }}
                                renderer={(fontData) => {
                                    let isRtlStyle = fontData.isRtl ? {justifyContent: "flex-end"}: {}
                                    return (
                                        <div className="TextEditorThemeRendererRoot" style={isRtlStyle} >
                                            <span style={{
                                                fontFamily: fontData.fontFamily
                                            }}>
                                                {fontData.display}
                                            </span>
                                        </div>
                                    )
                                }}
                                valueRenderer={(fontData) => {
                                    return (
                                        <span style={{
                                            fontFamily: fontData.fontFamily
                                        }}>
                                            {fontData.display}
                                        </span>
                                    )
                                }}
                            />
                            <FontSizeSelector
                                ref={this.fontSizeSelectorRef}
                                style={{ width: 64 }}
                                textTheme={textTheme}
                                textStaticData={textStaticData}
                                textDesignData={textDesignData}
                                onChange={(value) => {
                                    console.log("this.isTextSelcted()", this.isTextSelcted())
                                    if (this.isTextSelcted()) {
                                        this.props.doc.execCommand('fontSize', false, 1);

                                        let nodes = this.props.doc.querySelectorAll(`[size="1"]`);

                                        nodes.forEach(node => {
                                            node.removeAttribute("size");
                                            node.style.fontSize = `${value}px`;
                                        })

                                        this.props.inputWrapperRef.current.onInput();
                                    } else {
                                        textDesignData.fontSize = value;
                                        this.props.onChangeData(textStaticData, textDesignData);
                                        window.requestAnimationFrame(() => {
                                            this.props.inputWrapperRef.current.onInput();
                                        })
                                    }
                                }}
                            />
                        </div>
                        <div className="TextEditorContainerRow">

                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('bold');
                                    this.refreshState();
                                }}
                                selected={this.state.bold}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/bold.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('italic');
                                    this.refreshState();
                                }}
                                selected={this.state.italic}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/italic.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('underline');
                                    this.refreshState();
                                }}
                                selected={this.state.underline}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/underline.svg'} />
                            </TextEditorButton>
                            <div className="TextEditorVerticalDivider"/>
                            <TextColorSelector
                                onChange={(color) => {
                                    let randomColor = getRandomColor();
                                    this.props.doc.execCommand('foreColor', false, randomColor);

                                    let nodes = this.props.doc.querySelectorAll(`[color="${randomColor}"]`);

                                    if (color instanceof Object) {
                                        nodes.forEach(node => {
                                            node.removeAttribute("color");
                                            [...node.classList].forEach(className => {
                                                if (className.startsWith('Color_'))
                                                    node.classList.remove(className);
                                            });
                                            node.classList.add(this.context.getThemeColorClass(color));
                                            let childs = node.getElementsByTagName("*");
                                            for (let childNode of childs) {
                                                [...childNode.classList].forEach(className => {
                                                    if (className.startsWith('Color_'))
                                                        childNode.classList.remove(className);
                                                });
                                            }
                                        })
                                    } else {
                                        nodes.forEach(node => {
                                            node.setAttribute("color", color);
                                            [...node.classList].forEach(className => {
                                                if (className.startsWith('Color_'))
                                                    node.classList.remove(className);
                                            });
                                            let childs = node.getElementsByTagName("*");
                                            for (let childNode of childs) {
                                                [...childNode.classList].forEach(className => {
                                                    if (className.startsWith('Color_'))
                                                        childNode.classList.remove(className);
                                                });
                                            }
                                        })
                                    }

                                    this.props.inputWrapperRef.current.onInput();
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/color.svg'} />
                            </TextColorSelector>
                            <TextColorSelector
                                onChange={(color) => {
                                    let randomColor = getRandomColor();
                                    this.props.doc.execCommand('fontSize', false, 1);
                                    this.props.doc.execCommand('backColor', false, randomColor);

                                    let nodes = this.props.doc.querySelectorAll(`[size="1"]`);

                                    if (color instanceof Object) {
                                        nodes.forEach(node => {
                                            node.removeAttribute("size");
                                            [...node.classList].forEach(className => {
                                                if (className.startsWith('BackColor_'))
                                                    node.classList.remove(className);
                                            });
                                            node.classList.add(this.context.getThemeBackColorClass(color));
                                            if (node.style && node.style.removeProperty)
                                                node.style.removeProperty("background-color");
                                            let childs = node.getElementsByTagName("*");
                                            for (let childNode of childs) {
                                                [...childNode.classList].forEach(className => {
                                                    if (className.startsWith('BackColor_'))
                                                        childNode.classList.remove(className);
                                                });
                                            }
                                        })
                                    } else {
                                        nodes.forEach(node => {
                                            node.removeAttribute("size");
                                            if (node.style)
                                                node.style.backgroundColor = color;
                                            [...node.classList].forEach(className => {
                                                if (className.startsWith('BackColor_'))
                                                    node.classList.remove(className);
                                            });
                                            let childs = node.getElementsByTagName("*");
                                            for (let childNode of childs) {
                                                [...childNode.classList].forEach(className => {
                                                    if (className.startsWith('BackColor_'))
                                                        childNode.classList.remove(className);
                                                });
                                            }
                                        })
                                    }

                                    this.props.inputWrapperRef.current.onInput();
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/fill.svg'} />
                            </TextColorSelector>
                            <div className="TextEditorVerticalDivider"/>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.context.showLinkGenerator(
                                        getSelectedLinkData(this.props.doc),
                                        (linkData) => {
                                            console.log("OnDone", linkData)
                                            addLinkData(this.props.doc, linkData);
                                            this.refreshState();
                                            this.props.inputWrapperRef.current.onInput();
                                        }
                                    );
                                }}
                                selected={getSelectedLinkId(this.props.doc) !== false}
                                selectedIcon={<img draggable={false} width={16} height={16}
                                                   src={require('../../../icons/linkblue.svg')} />}
                                disabled={getSelectedLinkId(this.props.doc) === false && !this.isTextSelcted()}
                                disabledIcon={<img draggable={false} width={16} height={16}
                                                   src={require('../../../icons/linkdisable.svg')} />}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={require('../../../icons/link.svg')} />
                            </TextEditorButton>
                            <div className="TextEditorVerticalDivider"/>
                            <TextEditorButton
                                onClick={(e) => {
                                    // this.props.doc.execCommand('justifyLeft');
                                    textDesignData.textAlign = undefined;
                                    this.props.onChangeData(textStaticData, textDesignData);
                                }}
                                selected={textDesignData.textAlign === undefined}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/align-left.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    // this.props.doc.execCommand('justifyCenter');
                                    textDesignData.textAlign = "center";
                                    this.props.onChangeData(textStaticData, textDesignData);
                                }}
                                selected={textDesignData.textAlign === "center"}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/align-center.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    // this.props.doc.execCommand('justifyRight');
                                    textDesignData.textAlign = "right";
                                    this.props.onChangeData(textStaticData, textDesignData);
                                }}
                                selected={textDesignData.textAlign === "right"}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/align-right.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    // this.props.doc.execCommand('justifyFull');
                                    textDesignData.textAlign = "justify";
                                    this.props.onChangeData(textStaticData, textDesignData);
                                }}
                                selected={textDesignData.textAlign === "justify"}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/justify.svg'} />
                            </TextEditorButton>
                            <div className="TextEditorVerticalDivider"/>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('insertUnorderedList');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/list-dot.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('insertOrderedList');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/list-number.svg'} />
                            </TextEditorButton>
                            <div className="TextEditorVerticalDivider"/>
                            <TextEditorButton
                                onClick={(e) => {
                                    // let sel = this.props.doc.getSelection();
                                    // console.log("Selected Lines", getLineSelected(sel))
                                    if (this.getTextDir() === "ltr")
                                        textStaticData.dir = "rtl";
                                    else
                                        textStaticData.dir = "ltr";

                                    this.props.onChangeData(textStaticData, textDesignData);
                                }}
                            >
                                {
                                    <img draggable={false} width={16} height={16}
                                         src={process.env.PUBLIC_URL + `/static/icon/texteditor/text-direction-${this.getTextDir()}.svg`} />
                                }
                            </TextEditorButton>
                        </div>
                    </div>
                </div>
            </Popper>
                {
                    this.state.linkGenerator &&
                    <LinkGenerator
                        open={true}
                        linkData={getSelectedLinkData(this.props.doc)}
                        onClose={() => {this.setState({linkGenerator: false})}}
                        onDone={(linkData) => {
                            addLinkData(this.props.doc, linkData);
                            this.setState({linkGenerator: false});
                        }}
                    />
                }
            </>
        )
    }
}

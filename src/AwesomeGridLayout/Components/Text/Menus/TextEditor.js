import React from "react";
import Popper from "@material-ui/core/Popper/Popper";
import './TextEditor.css';
import TextEditorButton from "./TextEditorButton";
import {EditorContext} from "../../../Editor/EditorContext";
import DropDown from "../../../Menus/CommonComponents/DropDown";
import {getRandomColor} from "../TextHelper";
import FontSizeSelector from "./components/FontSizeSelector";
import TextColorSelector from "./components/TextColorSelector";

export default class TextEditor extends React.Component {
    static contextType = EditorContext;
    constructor(props) {
        super(props);

        this.state = {};
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

    render () {
        let {textTheme, textStaticData, textDesignData, anchorEI} = this.props;
        return (
            <Popper
                open={true}
                anchorEl={anchorEI}
                placement="top-start"
                style={{
                    zIndex: 9999999999999999
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
                            <FontSizeSelector
                                style={{ width: 64 }}
                                textTheme={textTheme}
                                textStaticData={textStaticData}
                                textDesignData={textDesignData}
                                onChange={(value) => {
                                    this.props.doc.execCommand('fontSize', false, 1);

                                    let nodes = this.props.doc.querySelectorAll(`[size="1"]`);

                                    nodes.forEach(node => {
                                        node.removeAttribute("size");
                                        node.style.fontSize = `${value}px`;
                                    })

                                    this.props.inputWrapperRef.current.onInput();
                                }}
                            />
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('bold');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/bold.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('italic');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/italic.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('underline');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/underline.svg'} />
                            </TextEditorButton>
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
                        </div>
                        <div className="TextEditorContainerRow">
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('justifyLeft');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/align-left.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('justifyCenter');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/align-center.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('justifyRight');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/align-right.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('justifyFull');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/justify.svg'} />
                            </TextEditorButton>
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
                            {/*<TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('indent');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/indent-plus.svg'} />
                            </TextEditorButton>
                            <TextEditorButton
                                onClick={(e) => {
                                    this.props.doc.execCommand('outdent');
                                }}
                            >
                                <img draggable={false} width={16} height={16}
                                     src={process.env.PUBLIC_URL + '/static/icon/texteditor/indent-remove.svg'} />
                            </TextEditorButton>*/}
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
        )
    }
}
